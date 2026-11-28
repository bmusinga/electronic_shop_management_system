import { assertSameOrigin, jsonError, readJson, requireString } from "@/lib/api";
import { getOwnerUid } from "@/lib/firestore-admin";
import {
  clearLoginFailures,
  enforceLoginRateLimit,
  recordLoginFailure,
} from "@/lib/login-rate-limit";
import { clientKey } from "@/lib/rate-limit";
import { AuthError, claimStoreOwner, createSession } from "@/lib/session";

const IDENTITY_TOOLKIT_TIMEOUT_MS = 30_000;

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

interface IdentityToolkitResponse {
  localId?: string;
  email?: string;
  error?: { message?: string };
}

function mapFirebaseError(message?: string): AuthError {
  const code = message ?? "";

  if (
    code.includes("EMAIL_NOT_FOUND") ||
    code.includes("INVALID_PASSWORD") ||
    code.includes("INVALID_LOGIN_CREDENTIALS")
  ) {
    return new AuthError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
  }

  if (code.includes("INVALID_EMAIL")) {
    return new AuthError(400, "Enter a valid email address.", "INVALID_EMAIL");
  }

  if (code.includes("TOO_MANY_ATTEMPTS_TRY_LATER")) {
    return new AuthError(
      429,
      "Too many attempts. Please try again later.",
      "TOO_MANY_ATTEMPTS"
    );
  }

  if (code.includes("USER_DISABLED")) {
    return new AuthError(403, "This account has been disabled.", "USER_DISABLED");
  }

  return new AuthError(401, "Invalid email or password.", "INVALID_CREDENTIALS");
}

async function signInWithPassword(
  apiKey: string,
  email: string,
  password: string
): Promise<{ response: Response; data: IdentityToolkitResponse | null }> {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(
    apiKey
  )}`;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(IDENTITY_TOOLKIT_TIMEOUT_MS),
      });

      if (response.status < 500 || attempt === 1) {
        const data = (await response.json().catch(() => null)) as
          | IdentityToolkitResponse
          | null;
        return { response, data };
      }
    } catch (error) {
      if (attempt === 1) {
        console.error("[login] identity toolkit unavailable", error);
        break;
      }
    }
  }

  throw new AuthError(
    503,
    "Sign-in is temporarily unavailable. Please try again.",
    "AUTH_UNAVAILABLE"
  );
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await readJson<LoginBody>(request);
    const email = requireString(body.email, "Email", 320).toLowerCase();

    if (typeof body.password !== "string" || !body.password) {
      throw new AuthError(400, "Password is required.");
    }

    const apiKey =
      process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      throw new AuthError(
        500,
        "FIREBASE_API_KEY is not configured on the server.",
        "MISSING_FIREBASE_KEY"
      );
    }

    const ip = clientKey(request);
    await enforceLoginRateLimit(email, ip);

    const { response, data } = await signInWithPassword(
      apiKey,
      email,
      body.password
    );

    if (!response.ok || !data?.localId) {
      await recordLoginFailure(email, ip);
      throw mapFirebaseError(data?.error?.message);
    }

    await clearLoginFailures(email, ip);

    let isOwner: boolean;
    try {
      isOwner = await claimStoreOwner(data.localId);
    } catch (error) {
      console.error("[login] owner claim failed", error);
      isOwner = (await getOwnerUid()) === data.localId;
    }

    if (!isOwner) {
      throw new AuthError(
        403,
        "This account is not the store owner.",
        "NOT_OWNER"
      );
    }

    const user = {
      uid: data.localId,
      email: data.email ?? email,
    };

    await createSession(user);
    return Response.json({ user });
  } catch (error) {
    return jsonError(
      error,
      "Sign-in could not be completed. Please try again."
    );
  }
}

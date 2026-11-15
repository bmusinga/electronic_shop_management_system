import { assertSameOrigin, jsonError, readJson, requireString } from "@/lib/api";
import { AuthError, createSession } from "@/lib/session";

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

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await readJson<LoginBody>(request);
    const email = requireString(body.email, "Email", 320).toLowerCase();

    if (typeof body.password !== "string" || !body.password) {
      throw new AuthError(400, "Password is required.");
    }

    const apiKey = process.env.FIREBASE_API_KEY;
    if (!apiKey) {
      throw new AuthError(
        500,
        "FIREBASE_API_KEY is not configured on the server.",
        "MISSING_FIREBASE_KEY"
      );
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: body.password,
          returnSecureToken: true,
        }),
        cache: "no-store",
      }
    );

    const data = (await response
      .json()
      .catch(() => null)) as IdentityToolkitResponse | null;

    if (!response.ok || !data?.localId) {
      throw mapFirebaseError(data?.error?.message);
    }

    const user = {
      uid: data.localId,
      email: data.email ?? email,
    };

    await createSession(user);
    return Response.json({ user });
  } catch (error) {
    return jsonError(error);
  }
}

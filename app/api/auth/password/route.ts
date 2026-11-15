import { assertSameOrigin, jsonError, readJson } from "@/lib/api";
import { getAdminAuth } from "@/lib/firebase-admin";
import {
  AuthError,
  createSession,
  requireAdmin,
  revokeUserSessions,
} from "@/lib/session";

interface PasswordBody {
  currentPassword?: unknown;
  newPassword?: unknown;
}

interface IdentityToolkitResponse {
  error?: { message?: string };
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireAdmin();
    const body = await readJson<PasswordBody>(request);

    if (typeof body.currentPassword !== "string" || !body.currentPassword) {
      throw new AuthError(400, "Current password is required.");
    }

    if (typeof body.newPassword !== "string" || body.newPassword.length < 6) {
      throw new AuthError(
        400,
        "New password must be at least 6 characters.",
        "WEAK_PASSWORD"
      );
    }

    if (!user.email) {
      throw new AuthError(400, "This account has no email address.");
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
          email: user.email,
          password: body.currentPassword,
          returnSecureToken: true,
        }),
        cache: "no-store",
      }
    );

    const data = (await response
      .json()
      .catch(() => null)) as IdentityToolkitResponse | null;

    if (!response.ok) {
      throw new AuthError(
        400,
        data?.error?.message?.includes("INVALID_PASSWORD")
          ? "Current password is incorrect."
          : "Could not verify the current password.",
        "INVALID_PASSWORD"
      );
    }

    await getAdminAuth().updateUser(user.uid, {
      password: body.newPassword,
    });

    await revokeUserSessions(user.uid);
    await createSession(user);

    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

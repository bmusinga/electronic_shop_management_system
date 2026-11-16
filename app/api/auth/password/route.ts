import { assertSameOrigin, jsonError, readJson } from "@/lib/api";
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
  idToken?: string;
  localId?: string;
  email?: string;
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

    const apiKey =
      process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      throw new AuthError(
        500,
        "FIREBASE_API_KEY is not configured on the server.",
        "MISSING_FIREBASE_KEY"
      );
    }

    const signInRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, password: body.currentPassword, returnSecureToken: true }),
        cache: "no-store",
      }
    );

    const signInData = (await signInRes.json().catch(() => null)) as IdentityToolkitResponse | null;
    if (!signInRes.ok || !signInData?.idToken) {
      throw new AuthError(
        400,
        signInData?.error?.message?.includes("INVALID_PASSWORD")
          ? "Current password is incorrect."
          : "Could not verify the current password.",
        "INVALID_PASSWORD"
      );
    }

    const updateRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: signInData.idToken, password: body.newPassword, returnSecureToken: true }),
        cache: "no-store",
      }
    );

    const updateData = (await updateRes.json().catch(() => null)) as IdentityToolkitResponse | null;
    if (!updateRes.ok || !updateData?.localId) {
      const msg = updateData?.error?.message || "Could not update password.";
      throw new AuthError(400, msg, "PASSWORD_UPDATE_FAILED");
    }

    await revokeUserSessions(user.uid);
    await createSession({ uid: updateData.localId, email: updateData.email || user.email });

    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

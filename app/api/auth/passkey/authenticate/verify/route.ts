import { assertSameOrigin, jsonError, readJson, requireString } from "@/lib/api";
import { getAdminAuth } from "@/lib/firebase-admin";
import {
  deleteWebAuthnChallenge,
  getOwnerUid,
  getWebAuthnChallenge,
  getWebAuthnCredential,
  updateWebAuthnCredentialSignCount,
} from "@/lib/firestore-admin";
import { AuthError, createSession } from "@/lib/session";
import {
  getWebAuthnRp,
  parseSerializedCredential,
  verifyAuthenticationCredential,
} from "@/lib/webauthn-server";

interface AuthenticateVerifyBody {
  challengeId?: unknown;
  credential?: unknown;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = await readJson<AuthenticateVerifyBody>(request);
    const challengeId = requireString(body.challengeId, "Challenge ID", 200);
    const credential = parseSerializedCredential(body.credential);
    const record = await getWebAuthnChallenge(challengeId);

    if (
      !record ||
      record.type !== "authentication" ||
      record.expiresAt <= Date.now()
    ) {
      throw new AuthError(
        400,
        "Fingerprint request expired. Please try again.",
        "WEBAUTHN_CHALLENGE"
      );
    }

    await deleteWebAuthnChallenge(challengeId);
    const stored = await getWebAuthnCredential(credential.rawId);
    if (!stored) {
      throw new AuthError(
        401,
        "That fingerprint is not enrolled.",
        "UNKNOWN_FINGERPRINT"
      );
    }

    if ((await getOwnerUid()) !== stored.uid) {
      throw new AuthError(
        403,
        "This fingerprint is not linked to the store owner.",
        "NOT_OWNER"
      );
    }

    const rp = getWebAuthnRp(request);
    const signCount = verifyAuthenticationCredential(
      credential,
      record.challenge,
      stored,
      rp
    );

    await updateWebAuthnCredentialSignCount(credential.rawId, signCount);
    const firebaseUser = await getAdminAuth()
      .getUser(stored.uid)
      .catch(() => null);
    const user = {
      uid: stored.uid,
      email: firebaseUser?.email,
    };

    await createSession(user);
    return Response.json({ user });
  } catch (error) {
    return jsonError(error, "Fingerprint sign-in is temporarily unavailable.");
  }
}

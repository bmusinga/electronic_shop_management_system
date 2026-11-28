import { assertSameOrigin, jsonError, readJson, requireString } from "@/lib/api";
import {
  deleteWebAuthnChallenge,
  getWebAuthnChallenge,
  saveWebAuthnCredential,
} from "@/lib/firestore-admin";
import { AuthError, requireAdmin } from "@/lib/session";
import {
  getWebAuthnRp,
  parseRegistrationCredential,
  parseSerializedCredential,
} from "@/lib/webauthn-server";

interface RegisterVerifyBody {
  challengeId?: unknown;
  credential?: unknown;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireAdmin();
    const body = await readJson<RegisterVerifyBody>(request);
    const challengeId = requireString(body.challengeId, "Challenge ID", 200);
    const credential = parseSerializedCredential(body.credential);
    const record = await getWebAuthnChallenge(challengeId);

    if (
      !record ||
      record.type !== "registration" ||
      record.uid !== user.uid ||
      record.expiresAt <= Date.now()
    ) {
      throw new AuthError(
        400,
        "Fingerprint request expired. Please try again.",
        "WEBAUTHN_CHALLENGE"
      );
    }

    await deleteWebAuthnChallenge(challengeId);
    const rp = getWebAuthnRp(request);
    const parsed = parseRegistrationCredential(
      credential,
      record.challenge,
      rp
    );
    const timestamp = new Date().toISOString();

    await saveWebAuthnCredential({
      credentialId: parsed.credentialId,
      uid: user.uid,
      publicKeyJwk: parsed.publicKeyJwk,
      alg: parsed.alg,
      signCount: parsed.signCount,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

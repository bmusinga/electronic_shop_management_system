import { assertSameOrigin, jsonError } from "@/lib/api";
import {
  listWebAuthnCredentials,
  saveWebAuthnChallenge,
} from "@/lib/firestore-admin";
import { AuthError } from "@/lib/session";
import { createWebAuthnChallenge, getWebAuthnRp } from "@/lib/webauthn-server";

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const rp = getWebAuthnRp(request);
    const credentials = await listWebAuthnCredentials();

    if (credentials.length === 0) {
      throw new AuthError(
        404,
        "No fingerprint has been enrolled yet. Enroll one in Settings first.",
        "NO_FINGERPRINT"
      );
    }

    const challengeId = createWebAuthnChallenge();
    const challenge = createWebAuthnChallenge();
    await saveWebAuthnChallenge(challengeId, {
      challenge,
      type: "authentication",
      expiresAt: Date.now() + CHALLENGE_TTL_MS,
    });

    return Response.json({
      challengeId,
      publicKey: {
        challenge,
        rpId: rp.id,
        allowCredentials: credentials.map((credential) => ({
          type: "public-key" as const,
          id: credential.credentialId,
          transports: ["internal"],
        })),
        userVerification: "required",
        timeout: 60000,
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}

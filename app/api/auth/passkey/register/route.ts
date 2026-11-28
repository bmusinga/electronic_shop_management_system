import { assertSameOrigin, jsonError } from "@/lib/api";
import {
  listWebAuthnCredentials,
  saveWebAuthnChallenge,
} from "@/lib/firestore-admin";
import { AuthError, requireAdmin } from "@/lib/session";
import { createWebAuthnChallenge, getWebAuthnRp } from "@/lib/webauthn-server";

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireAdmin();
    if (!user.email) {
      throw new AuthError(400, "This account has no email address.");
    }

    const rp = getWebAuthnRp(request);
    const challengeId = createWebAuthnChallenge();
    const challenge = createWebAuthnChallenge();
    const credentials = await listWebAuthnCredentials(user.uid);

    await saveWebAuthnChallenge(challengeId, {
      challenge,
      type: "registration",
      uid: user.uid,
      expiresAt: Date.now() + CHALLENGE_TTL_MS,
    });

    return Response.json({
      challengeId,
      publicKey: {
        challenge,
        rp,
        user: {
          id: Buffer.from(user.uid, "utf8").toString("base64url"),
          name: user.email,
          displayName: user.email,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        timeout: 60000,
        attestation: "none",
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          residentKey: "preferred",
          userVerification: "required",
        },
        excludeCredentials: credentials.map((credential) => ({
          type: "public-key" as const,
          id: credential.credentialId,
          transports: ["internal"],
        })),
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}

import { apiFetch } from "./client-api";
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  SerializedPublicKeyCredential,
} from "./types";

export interface FingerprintSignInResult {
  user: { uid: string; email?: string };
}

export function toBase64Url(value: BufferSource): string {
  const bytes =
    value instanceof ArrayBuffer
      ? new Uint8Array(value)
      : new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export async function isFingerprintAvailable(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    return false;
  }

  const check =
    window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable;
  if (typeof check !== "function") {
    return false;
  }

  try {
    return await check.call(window.PublicKeyCredential);
  } catch {
    return false;
  }
}

function decodeCreationOptions(
  options: PublicKeyCredentialCreationOptionsJSON
): PublicKeyCredentialCreationOptions {
  return {
    challenge: fromBase64Url(options.challenge),
    rp: options.rp,
    user: {
      ...options.user,
      id: fromBase64Url(options.user.id),
    },
    pubKeyCredParams: options.pubKeyCredParams,
    timeout: options.timeout,
    attestation: options.attestation,
    authenticatorSelection: options.authenticatorSelection,
    excludeCredentials: options.excludeCredentials?.map((credential) => ({
      type: credential.type,
      id: fromBase64Url(credential.id),
      transports: credential.transports,
    })),
  } as PublicKeyCredentialCreationOptions;
}

function decodeRequestOptions(
  options: PublicKeyCredentialRequestOptionsJSON
): PublicKeyCredentialRequestOptions {
  return {
    challenge: fromBase64Url(options.challenge),
    rpId: options.rpId,
    timeout: options.timeout,
    userVerification: options.userVerification,
    allowCredentials: options.allowCredentials?.map((credential) => ({
      type: credential.type,
      id: fromBase64Url(credential.id),
      transports: credential.transports,
    })),
  } as PublicKeyCredentialRequestOptions;
}

function serializeCredential(
  credential: PublicKeyCredential
): SerializedPublicKeyCredential {
  const response = credential.response;
  const assertion =
    "authenticatorData" in response
      ? (response as AuthenticatorAssertionResponse)
      : null;
  const attestation =
    "attestationObject" in response
      ? (response as AuthenticatorAttestationResponse)
      : null;

  return {
    id: credential.id,
    rawId: toBase64Url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: toBase64Url(response.clientDataJSON),
      authenticatorData: assertion?.authenticatorData
        ? toBase64Url(assertion.authenticatorData)
        : undefined,
      signature: assertion?.signature
        ? toBase64Url(assertion.signature)
        : undefined,
      userHandle: assertion?.userHandle
        ? toBase64Url(assertion.userHandle)
        : null,
      attestationObject: attestation?.attestationObject
        ? toBase64Url(attestation.attestationObject)
        : undefined,
    },
  };
}

function credentialError(error: unknown, cancelledMessage: string): Error {
  if (
    error instanceof DOMException &&
    (error.name === "NotAllowedError" || error.name === "AbortError")
  ) {
    return new Error(cancelledMessage);
  }
  if (error instanceof Error && error.message) {
    return error;
  }
  return new Error(cancelledMessage);
}

export async function enrollFingerprint(): Promise<void> {
  if (!navigator.credentials?.create) {
    throw new Error("Fingerprint enrollment is not supported on this device.");
  }

  const options = await apiFetch<{
    challengeId: string;
    publicKey: PublicKeyCredentialCreationOptionsJSON;
  }>("/api/auth/passkey/register", {
    method: "POST",
    body: "{}",
  });

  let credential: PublicKeyCredential | null;
  try {
    credential = (await navigator.credentials.create({
      publicKey: decodeCreationOptions(options.publicKey),
    })) as PublicKeyCredential | null;
  } catch (error) {
    throw credentialError(error, "Fingerprint enrollment was cancelled.");
  }

  if (!credential) {
    throw new Error("Fingerprint enrollment was cancelled.");
  }

  await apiFetch("/api/auth/passkey/register/verify", {
    method: "POST",
    body: JSON.stringify({
      challengeId: options.challengeId,
      credential: serializeCredential(credential),
    }),
  });
}

export async function signInWithFingerprint(): Promise<FingerprintSignInResult> {
  if (!navigator.credentials?.get) {
    throw new Error("Fingerprint sign-in is not supported on this device.");
  }

  const options = await apiFetch<{
    challengeId: string;
    publicKey: PublicKeyCredentialRequestOptionsJSON;
  }>("/api/auth/passkey/authenticate", {
    method: "POST",
    body: "{}",
  });

  let credential: PublicKeyCredential | null;
  try {
    credential = (await navigator.credentials.get({
      publicKey: decodeRequestOptions(options.publicKey),
    })) as PublicKeyCredential | null;
  } catch (error) {
    throw credentialError(error, "Fingerprint sign-in was cancelled.");
  }

  if (!credential) {
    throw new Error("Fingerprint sign-in was cancelled.");
  }

  return apiFetch<FingerprintSignInResult>("/api/auth/passkey/authenticate/verify", {
    method: "POST",
    body: JSON.stringify({
      challengeId: options.challengeId,
      credential: serializeCredential(credential),
    }),
  });
}

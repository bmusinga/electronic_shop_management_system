import "server-only";

import {
  createHash,
  createPublicKey,
  randomBytes,
  timingSafeEqual,
  verify,
} from "crypto";
import { AuthError } from "./session";
import type {
  SerializedPublicKeyCredential,
  WebAuthnCredentialRecord,
} from "./types";

type CborValue =
  | number
  | Buffer
  | string
  | boolean
  | null
  | CborValue[]
  | Map<CborValue, CborValue>;

interface DecodedCbor {
  value: CborValue;
  offset: number;
}

export interface WebAuthnRp {
  id: string;
  origin: string;
}

export interface ParsedRegistration {
  credentialId: string;
  publicKeyJwk: JsonWebKey;
  alg: number;
  signCount: number;
}

function invalid(message: string, code = "WEBAUTHN_INVALID"): AuthError {
  return new AuthError(400, message, code);
}

export function bufferToBase64Url(value: Buffer): string {
  return value.toString("base64url");
}

export function base64UrlToBuffer(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

export function createWebAuthnChallenge(): string {
  return randomBytes(32).toString("base64url");
}

export function getWebAuthnRp(request: Request): WebAuthnRp {
  try {
    const source = process.env.WEBAUTHN_ORIGIN || new URL(request.url).origin;
    const url = new URL(source);
    return { id: url.hostname, origin: url.origin };
  } catch {
    throw new AuthError(
      500,
      "WEBAUTHN_ORIGIN is not a valid URL.",
      "WEBAUTHN_ORIGIN_INVALID"
    );
  }
}

function readArgument(
  data: Buffer,
  offset: number,
  additional: number
): { value: number; offset: number } {
  if (additional < 24) {
    return { value: additional, offset };
  }

  const byteLengths: Record<number, number> = {
    24: 1,
    25: 2,
    26: 4,
    27: 8,
  };
  const byteLength = byteLengths[additional];
  if (!byteLength || offset + byteLength > data.length) {
    throw invalid("Fingerprint authenticator data was truncated.");
  }

  let value = 0;
  for (let index = 0; index < byteLength; index += 1) {
    value = value * 256 + data[offset + index];
    if (!Number.isSafeInteger(value)) {
      throw invalid("Fingerprint authenticator data was too large.");
    }
  }

  return { value, offset: offset + byteLength };
}

function decodeCbor(data: Buffer, startOffset = 0): DecodedCbor {
  const initial = data[startOffset];
  if (initial === undefined) {
    throw invalid("Fingerprint authenticator data was truncated.");
  }

  const major = initial >> 5;
  const additional = initial & 31;
  let offset = startOffset + 1;
  const argument = readArgument(data, offset, additional);
  offset = argument.offset;
  const value = argument.value;

  if (major === 0) {
    return { value, offset };
  }

  if (major === 1) {
    return { value: -1 - value, offset };
  }

  if (major === 2 || major === 3) {
    if (offset + value > data.length) {
      throw invalid("Fingerprint authenticator data was truncated.");
    }
    const bytes = Buffer.from(data.subarray(offset, offset + value));
    return {
      value: major === 2 ? bytes : bytes.toString("utf8"),
      offset: offset + value,
    };
  }

  if (major === 4) {
    const items: CborValue[] = [];
    for (let index = 0; index < value; index += 1) {
      const item = decodeCbor(data, offset);
      items.push(item.value);
      offset = item.offset;
    }
    return { value: items, offset };
  }

  if (major === 5) {
    const map = new Map<CborValue, CborValue>();
    for (let index = 0; index < value; index += 1) {
      const key = decodeCbor(data, offset);
      offset = key.offset;
      const item = decodeCbor(data, offset);
      offset = item.offset;
      map.set(key.value, item.value);
    }
    return { value: map, offset };
  }

  if (major === 7) {
    if (additional === 20) return { value: false, offset };
    if (additional === 21) return { value: true, offset };
    if (additional === 22 || additional === 23) return { value: null, offset };
    return { value, offset };
  }

  throw invalid("Fingerprint authenticator data used an unsupported format.");
}

function requireMap(value: CborValue): Map<CborValue, CborValue> {
  if (!(value instanceof Map)) {
    throw invalid("Fingerprint authenticator data was malformed.");
  }
  return value;
}

function requireText(
  record: Record<string, unknown>,
  field: string
): string {
  const value = record[field];
  if (typeof value !== "string" || !value) {
    throw invalid("Fingerprint response was malformed.");
  }
  return value;
}

export function parseSerializedCredential(
  value: unknown
): SerializedPublicKeyCredential {
  if (!value || typeof value !== "object") {
    throw invalid("Fingerprint response was malformed.");
  }

  const input = value as Record<string, unknown>;
  const id = requireText(input, "id");
  const rawId = requireText(input, "rawId");
  const type = requireText(input, "type");
  if (type !== "public-key") {
    throw invalid("Fingerprint response type was unexpected.", "WEBAUTHN_TYPE");
  }

  if (!input.response || typeof input.response !== "object") {
    throw invalid("Fingerprint response was malformed.");
  }
  const response = input.response as Record<string, unknown>;
  const optional = (field: string): string | undefined =>
    typeof response[field] === "string" && response[field]
      ? (response[field] as string)
      : undefined;

  return {
    id,
    rawId,
    type,
    response: {
      clientDataJSON: requireText(response, "clientDataJSON"),
      authenticatorData: optional("authenticatorData"),
      signature: optional("signature"),
      userHandle:
        typeof response.userHandle === "string" ? response.userHandle : null,
      attestationObject: optional("attestationObject"),
    },
  };
}

function verifyClientData(
  encoded: string,
  expectedType: "webauthn.create" | "webauthn.get",
  expectedChallenge: string,
  origin: string
): Buffer {
  const buffer = base64UrlToBuffer(encoded);
  let clientData: {
    type?: unknown;
    challenge?: unknown;
    origin?: unknown;
    crossOrigin?: unknown;
  };

  try {
    clientData = JSON.parse(buffer.toString("utf8")) as typeof clientData;
  } catch {
    throw invalid("Fingerprint response was malformed.");
  }

  if (clientData.type !== expectedType) {
    throw invalid("Fingerprint response type was unexpected.", "WEBAUTHN_TYPE");
  }
  if (clientData.challenge !== expectedChallenge) {
    throw invalid(
      "Fingerprint request expired. Please try again.",
      "WEBAUTHN_CHALLENGE"
    );
  }
  if (clientData.origin !== origin || clientData.crossOrigin === true) {
    throw invalid(
      "Fingerprint request came from an unexpected site.",
      "WEBAUTHN_ORIGIN"
    );
  }

  return buffer;
}

function parseAuthenticatorData(authData: Buffer, rpId: string) {
  if (authData.length < 37) {
    throw invalid("Fingerprint authenticator data was truncated.");
  }

  const rpIdHash = authData.subarray(0, 32);
  const expectedHash = createHash("sha256").update(rpId).digest();
  if (
    rpIdHash.length !== expectedHash.length ||
    !timingSafeEqual(rpIdHash, expectedHash)
  ) {
    throw invalid(
      "Fingerprint request was for a different site.",
      "WEBAUTHN_RPID"
    );
  }

  const flags = authData[32];
  return {
    userPresent: (flags & 0x01) !== 0,
    userVerified: (flags & 0x04) !== 0,
    attestedCredentials: (flags & 0x40) !== 0,
    signCount: authData.readUInt32BE(33),
  };
}

function parseCosePublicKey(
  cose: CborValue
): { publicKeyJwk: JsonWebKey; alg: number } {
  const map = requireMap(cose);
  const kty = map.get(1);
  const alg = map.get(3);

  let publicKeyJwk: JsonWebKey;
  if (kty === 2 && alg === -7) {
    const curve = map.get(-1);
    const x = map.get(-2);
    const y = map.get(-3);
    if (curve !== 1 || !Buffer.isBuffer(x) || !Buffer.isBuffer(y)) {
      throw invalid("Fingerprint public key was malformed.");
    }
    publicKeyJwk = {
      kty: "EC",
      crv: "P-256",
      x: bufferToBase64Url(x),
      y: bufferToBase64Url(y),
    };
  } else if (kty === 3 && alg === -257) {
    const modulus = map.get(-1);
    const exponent = map.get(-2);
    if (!Buffer.isBuffer(modulus) || !Buffer.isBuffer(exponent)) {
      throw invalid("Fingerprint public key was malformed.");
    }
    publicKeyJwk = {
      kty: "RSA",
      n: bufferToBase64Url(modulus),
      e: bufferToBase64Url(exponent),
    };
  } else {
    throw invalid(
      "This fingerprint authenticator uses an unsupported key type. Please try another device.",
      "WEBAUTHN_UNSUPPORTED_KEY"
    );
  }

  try {
    createPublicKey({ key: publicKeyJwk, format: "jwk" });
  } catch {
    throw invalid("Fingerprint public key was malformed.");
  }

  return { publicKeyJwk, alg };
}

export function parseRegistrationCredential(
  credential: SerializedPublicKeyCredential,
  expectedChallenge: string,
  rp: WebAuthnRp
): ParsedRegistration {
  verifyClientData(
    credential.response.clientDataJSON,
    "webauthn.create",
    expectedChallenge,
    rp.origin
  );

  const attestationObject = credential.response.attestationObject;
  if (!attestationObject) {
    throw invalid("Fingerprint enrollment response was incomplete.");
  }

  const attestation = requireMap(
    decodeCbor(base64UrlToBuffer(attestationObject)).value
  );
  const authData = attestation.get("authData");
  if (!Buffer.isBuffer(authData)) {
    throw invalid("Fingerprint authenticator data was malformed.");
  }

  const authenticatorData = parseAuthenticatorData(authData, rp.id);
  if (
    !authenticatorData.userPresent ||
    !authenticatorData.userVerified ||
    !authenticatorData.attestedCredentials
  ) {
    throw invalid(
      "Fingerprint verification could not be completed. Please try again.",
      "WEBAUTHN_USER_VERIFICATION"
    );
  }

  let offset = 37 + 16;
  if (authData.length < offset + 2) {
    throw invalid("Fingerprint credential data was truncated.");
  }
  const credentialIdLength = authData.readUInt16BE(offset);
  offset += 2;
  const credentialId = authData.subarray(offset, offset + credentialIdLength);
  offset += credentialIdLength;
  if (
    credentialIdLength === 0 ||
    credentialId.length !== credentialIdLength
  ) {
    throw invalid("Fingerprint credential data was truncated.");
  }

  const rawId = base64UrlToBuffer(credential.rawId);
  if (
    rawId.length !== credentialId.length ||
    !timingSafeEqual(rawId, credentialId)
  ) {
    throw invalid(
      "Fingerprint credential did not match the enrollment request.",
      "WEBAUTHN_CREDENTIAL_ID"
    );
  }

  const parsedKey = parseCosePublicKey(decodeCbor(authData, offset).value);
  return {
    credentialId: credential.rawId,
    publicKeyJwk: parsedKey.publicKeyJwk,
    alg: parsedKey.alg,
    signCount: authenticatorData.signCount,
  };
}

export function verifyAuthenticationCredential(
  credential: SerializedPublicKeyCredential,
  expectedChallenge: string,
  storedCredential: WebAuthnCredentialRecord,
  rp: WebAuthnRp
): number {
  const clientData = verifyClientData(
    credential.response.clientDataJSON,
    "webauthn.get",
    expectedChallenge,
    rp.origin
  );

  const encodedAuthData = credential.response.authenticatorData;
  const encodedSignature = credential.response.signature;
  if (!encodedAuthData || !encodedSignature) {
    throw invalid("Fingerprint response was incomplete.");
  }

  const authData = base64UrlToBuffer(encodedAuthData);
  const signature = base64UrlToBuffer(encodedSignature);
  const authenticatorData = parseAuthenticatorData(authData, rp.id);
  if (!authenticatorData.userPresent || !authenticatorData.userVerified) {
    throw invalid(
      "Fingerprint verification could not be completed. Please try again.",
      "WEBAUTHN_USER_VERIFICATION"
    );
  }
  if (
    authenticatorData.signCount !== 0 &&
    authenticatorData.signCount <= storedCredential.signCount
  ) {
    throw invalid(
      "This fingerprint was already used. Please try again.",
      "WEBAUTHN_REPLAY"
    );
  }

  const clientDataHash = createHash("sha256").update(clientData).digest();
  const publicKey = createPublicKey({
    key: storedCredential.publicKeyJwk,
    format: "jwk",
  });
  const valid = verify(
    "sha256",
    Buffer.concat([authData, clientDataHash]),
    publicKey,
    signature
  );

  if (!valid) {
    throw invalid("Fingerprint verification failed.", "WEBAUTHN_SIGNATURE");
  }

  return authenticatorData.signCount;
}

import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "voltex_session";
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const DEV_SECRET = "dev-only-session-secret-not-for-production";

export interface AuthUser {
  uid: string;
  email?: string;
}

export interface SessionIdentity extends AuthUser {
  version: number;
}

interface SessionPayload {
  uid: string;
  email?: string;
  version: number;
  exp: number;
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET must be set to at least 32 characters in production."
    );
  }

  return DEV_SECRET;
}

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(data: string): string {
  return createHmac("sha256", getSessionSecret()).update(data).digest("base64url");
}

export function createSessionToken(
  user: AuthUser,
  version: number
): string {
  const payload: SessionPayload = {
    uid: user.uid,
    email: user.email || "",
    version,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const body = toBase64Url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string): SessionIdentity | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(fromBase64Url(body)) as SessionPayload;
    if (
      !payload?.uid ||
      !payload?.exp ||
      payload.exp <= Date.now() ||
      !Number.isInteger(payload.version) ||
      payload.version < 0
    ) {
      return null;
    }
    return {
      uid: payload.uid,
      email: payload.email || undefined,
      version: payload.version,
    };
  } catch {
    return null;
  }
}

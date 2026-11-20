import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "voltex_session";
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export interface AuthUser {
  uid: string;
  email?: string;
}

interface SessionPayload {
  uid: string;
  email?: string;
  exp: number;
}

function getSessionSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.FIREBASE_API_KEY ||
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "dev-session-secret-change-me"
  );
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

export function createSessionToken(user: AuthUser): string {
  const payload: SessionPayload = {
    uid: user.uid,
    email: user.email || "",
    exp: Date.now() + SESSION_TTL_MS,
  };
  const body = toBase64Url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string): AuthUser | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(fromBase64Url(body)) as SessionPayload;
    if (!payload?.uid || !payload?.exp || payload.exp <= Date.now()) return null;
    return { uid: payload.uid, email: payload.email || undefined };
  } catch {
    return null;
  }
}

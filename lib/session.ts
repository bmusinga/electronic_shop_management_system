import "server-only";

import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { getAdminDb } from "./firebase-admin";

export const SESSION_COOKIE = "voltex_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const SESSIONS_COLLECTION = "sessions";

export interface AuthUser {
  uid: string;
  email?: string;
}

interface SessionRecord {
  uid: string;
  email?: string;
  createdAt: string;
  expiresAt: string;
}

export class AuthError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "AuthError";
    this.status = status;
    this.code = code;
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function sessionRef(token: string) {
  return getAdminDb().collection(SESSIONS_COLLECTION).doc(hashToken(token));
}

export async function createSession(user: AuthUser): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  const record: SessionRecord = {
    uid: user.uid,
    email: user.email || "",
    createdAt: new Date().toISOString(),
    expiresAt,
  };

  await sessionRef(token).set(record);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await sessionRef(token).delete().catch(() => undefined);
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const ref = sessionRef(token);
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    return null;
  }

  const record = snapshot.data() as Partial<SessionRecord>;
  if (!record.uid || !record.expiresAt) {
    await ref.delete().catch(() => undefined);
    return null;
  }

  if (Date.parse(record.expiresAt) <= Date.now()) {
    await ref.delete().catch(() => undefined);
    return null;
  }

  return { uid: record.uid, email: record.email || undefined };
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new AuthError(401, "You must be signed in to do that.");
  }
  return user;
}

export async function revokeUserSessions(uid: string): Promise<void> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(SESSIONS_COLLECTION)
    .where("uid", "==", uid)
    .get();

  if (snapshot.empty) {
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

export function authErrorResponse(error: unknown): Response {
  if (error instanceof AuthError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }

  return Response.json(
    { error: error instanceof Error ? error.message : "Request failed." },
    { status: 500 }
  );
}

import "server-only";

import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  createSessionToken,
  verifySessionToken,
  type AuthUser,
} from "@/lib/session-token";
import {
  bumpSessionVersion,
  claimOwnerUid,
  getOwnerUid,
  getSessionVersion,
} from "@/lib/firestore-admin";

export { SESSION_COOKIE } from "@/lib/session-token";
export type { AuthUser } from "@/lib/session-token";

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

export async function createSession(user: AuthUser): Promise<void> {
  const version = await getSessionVersion(user.uid);
  const token = createSessionToken(user, version);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(Date.now() + SESSION_TTL_MS),
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const identity = verifySessionToken(token);
  if (!identity) return null;

  const version = await getSessionVersion(identity.uid);
  if (version !== identity.version) return null;

  return { uid: identity.uid, email: identity.email };
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new AuthError(401, "You must be signed in to do that.");
  }
  if ((await getOwnerUid()) !== user.uid) {
    throw new AuthError(403, "This account does not have access to the store.");
  }
  return user;
}

export async function claimStoreOwner(uid: string): Promise<boolean> {
  return (await claimOwnerUid(uid)) === uid;
}

export async function revokeUserSessions(uid: string): Promise<void> {
  await bumpSessionVersion(uid);
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

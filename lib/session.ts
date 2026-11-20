import "server-only";

import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  createSessionToken,
  verifySessionToken,
  type AuthUser,
} from "@/lib/session-token";

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
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const token = createSessionToken(user);
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
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new AuthError(401, "You must be signed in to do that.");
  }
  return user;
}

export async function revokeUserSessions(_uid: string): Promise<void> {
  // Stateless cookie sessions: revocation is handled by issuing a new session cookie.
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

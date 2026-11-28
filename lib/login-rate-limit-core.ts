import { createHmac } from "crypto";
import type { LoginAttemptRecord } from "./types.ts";

export const LOGIN_FAILURE_LIMIT = 5;
export const IP_FAILURE_LIMIT = 20;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

const DEV_SECRET = "dev-only-login-rate-limit-secret";

function getRateLimitSecret(): string {
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

function hashKey(value: string): string {
  return createHmac("sha256", getRateLimitSecret()).update(value).digest("hex");
}

export function loginAttemptKey(email: string, ip: string): string {
  return `email:${hashKey(`login|${email.trim().toLowerCase()}|${ip}`)}`;
}

export function ipAttemptKey(ip: string): string {
  return `ip:${hashKey(`login-ip|${ip}`)}`;
}

export function createAttemptRecord(
  now = Date.now(),
  windowMs = LOGIN_WINDOW_MS
): LoginAttemptRecord {
  return {
    failures: 0,
    firstFailureAt: now,
    expiresAt: now + windowMs,
    updatedAt: now,
  };
}

export function applyAttemptFailure(
  record: LoginAttemptRecord | null,
  now = Date.now(),
  windowMs = LOGIN_WINDOW_MS
): LoginAttemptRecord {
  if (!record || record.expiresAt <= now) {
    return {
      failures: 1,
      firstFailureAt: now,
      expiresAt: now + windowMs,
      updatedAt: now,
    };
  }

  return { ...record, failures: record.failures + 1, updatedAt: now };
}

export function lockoutRemainingSeconds(
  record: LoginAttemptRecord | null,
  limit: number,
  now = Date.now()
): number {
  if (!record || record.expiresAt <= now || record.failures < limit) {
    return 0;
  }

  return Math.max(1, Math.ceil((record.expiresAt - now) / 1000));
}

export function formatRetryAfter(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? "" : "s"}`;
  }

  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

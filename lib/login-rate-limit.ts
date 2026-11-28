import "server-only";

import {
  clearLoginAttempts,
  getLoginAttempts,
  incrementLoginAttempts,
} from "./firestore-admin.ts";
import {
  formatRetryAfter,
  IP_FAILURE_LIMIT,
  ipAttemptKey,
  lockoutRemainingSeconds,
  LOGIN_FAILURE_LIMIT,
  loginAttemptKey,
} from "./login-rate-limit-core.ts";
import { AuthError } from "./session";

function keysFor(email: string, ip: string) {
  return [
    { key: loginAttemptKey(email, ip), limit: LOGIN_FAILURE_LIMIT },
    { key: ipAttemptKey(ip), limit: IP_FAILURE_LIMIT },
  ];
}

function logRateLimitFailure(action: string, error: unknown): void {
  console.error(`[login-rate-limit] ${action} failed`, error);
}

export async function enforceLoginRateLimit(
  email: string,
  ip: string
): Promise<void> {
  try {
    const now = Date.now();
    const targets = keysFor(email, ip);
    const records = await Promise.all(
      targets.map(({ key }) => getLoginAttempts(key))
    );
    const remaining = Math.max(
      ...records.map((record, index) =>
        lockoutRemainingSeconds(record, targets[index].limit, now)
      )
    );

    if (remaining > 0) {
      throw new AuthError(
        429,
        `Too many sign-in attempts. Try again in ${formatRetryAfter(remaining)}.`,
        "TOO_MANY_ATTEMPTS"
      );
    }
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    logRateLimitFailure("lookup", error);
  }
}

export async function recordLoginFailure(
  email: string,
  ip: string
): Promise<void> {
  try {
    await Promise.all(
      keysFor(email, ip).map(({ key }) => incrementLoginAttempts(key))
    );
  } catch (error) {
    logRateLimitFailure("record", error);
  }
}

export async function clearLoginFailures(
  email: string,
  ip: string
): Promise<void> {
  try {
    await Promise.all(
      keysFor(email, ip).map(({ key }) => clearLoginAttempts(key))
    );
  } catch (error) {
    logRateLimitFailure("clear", error);
  }
}

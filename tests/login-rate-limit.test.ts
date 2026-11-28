import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyAttemptFailure,
  createAttemptRecord,
  formatRetryAfter,
  ipAttemptKey,
  lockoutRemainingSeconds,
  LOGIN_FAILURE_LIMIT,
  LOGIN_WINDOW_MS,
  loginAttemptKey,
} from "../lib/login-rate-limit-core.ts";

process.env.SESSION_SECRET = "b".repeat(48);

test("login rate limit keys are deterministic and do not expose raw identifiers", () => {
  const key = loginAttemptKey("Owner@Example.com", "1.2.3.4");
  assert.equal(key, loginAttemptKey(" owner@example.com ", "1.2.3.4"));
  assert.ok(!key.toLowerCase().includes("owner"));
  assert.ok(!key.includes("1.2.3.4"));
  assert.notEqual(key, ipAttemptKey("1.2.3.4"));
});

test("failed attempts increment and the window resets", () => {
  const first = applyAttemptFailure(null, 1000, LOGIN_WINDOW_MS);
  assert.equal(first.failures, 1);
  assert.equal(first.firstFailureAt, 1000);
  assert.equal(first.expiresAt, 1000 + LOGIN_WINDOW_MS);

  const second = applyAttemptFailure(first, 2000, LOGIN_WINDOW_MS);
  assert.equal(second.failures, 2);
  assert.equal(second.firstFailureAt, 1000);

  const reset = applyAttemptFailure(second, 1000 + LOGIN_WINDOW_MS, LOGIN_WINDOW_MS);
  assert.equal(reset.failures, 1);
  assert.equal(reset.firstFailureAt, 1000 + LOGIN_WINDOW_MS);
});

test("lockout is active only at the limit and before expiry", () => {
  const record = {
    ...createAttemptRecord(1000, 10000),
    failures: LOGIN_FAILURE_LIMIT,
  };

  assert.equal(
    lockoutRemainingSeconds(record, LOGIN_FAILURE_LIMIT, 2000),
    9
  );
  assert.equal(lockoutRemainingSeconds(record, LOGIN_FAILURE_LIMIT, 11000), 0);
  assert.equal(
    lockoutRemainingSeconds(record, LOGIN_FAILURE_LIMIT + 1, 2000),
    0
  );
  assert.equal(lockoutRemainingSeconds(null, LOGIN_FAILURE_LIMIT, 2000), 0);
});

test("retry after text is readable", () => {
  assert.equal(formatRetryAfter(1), "1 second");
  assert.equal(formatRetryAfter(2), "2 seconds");
  assert.equal(formatRetryAfter(60), "1 minute");
  assert.equal(formatRetryAfter(90), "2 minutes");
});

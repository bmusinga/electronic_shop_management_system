import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { checkRateLimit } from "../lib/rate-limit.ts";

test("rate limit blocks after the allowed count", () => {
  const key = `test-${randomUUID()}`;
  assert.equal(checkRateLimit(key, 3, 10000), true);
  assert.equal(checkRateLimit(key, 3, 10000), true);
  assert.equal(checkRateLimit(key, 3, 10000), true);
  assert.equal(checkRateLimit(key, 3, 10000), false);
});

test("rate limit resets after the window", async () => {
  const key = `test-${randomUUID()}`;
  assert.equal(checkRateLimit(key, 1, 30), true);
  assert.equal(checkRateLimit(key, 1, 30), false);
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.equal(checkRateLimit(key, 1, 30), true);
});

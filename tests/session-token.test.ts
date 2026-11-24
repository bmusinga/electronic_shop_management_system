import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import {
  createSessionToken,
  verifySessionToken,
} from "../lib/session-token.ts";

const secret = "a".repeat(48);

test("session token round-trips identity and version", () => {
  process.env.SESSION_SECRET = secret;
  const token = createSessionToken(
    { uid: "user-1", email: "owner@example.com" },
    3
  );
  const identity = verifySessionToken(token);
  assert.deepEqual(identity, {
    uid: "user-1",
    email: "owner@example.com",
    version: 3,
  });
});

test("tampered signature is rejected", () => {
  process.env.SESSION_SECRET = secret;
  const token = createSessionToken({ uid: "user-1" }, 0);
  const tampered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;
  assert.equal(verifySessionToken(tampered), null);
});

test("expired token is rejected", () => {
  process.env.SESSION_SECRET = secret;
  const body = Buffer.from(
    JSON.stringify({
      uid: "user-1",
      email: "",
      version: 0,
      exp: Date.now() - 1000,
    })
  ).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  assert.equal(verifySessionToken(`${body}.${signature}`), null);
});

test("token with invalid version is rejected", () => {
  process.env.SESSION_SECRET = secret;
  const body = Buffer.from(
    JSON.stringify({
      uid: "user-1",
      email: "",
      version: "admin",
      exp: Date.now() + 60000,
    })
  ).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  assert.equal(verifySessionToken(`${body}.${signature}`), null);
});

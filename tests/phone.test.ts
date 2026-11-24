import assert from "node:assert/strict";
import { test } from "node:test";
import {
  displayKenyanPhone,
  normalizeKenyanPhone,
} from "../lib/phone.ts";

test("normalizes Kenyan phone formats", () => {
  assert.equal(normalizeKenyanPhone("0712345678"), "254712345678");
  assert.equal(normalizeKenyanPhone("712345678"), "254712345678");
  assert.equal(normalizeKenyanPhone("+254 712 345 678"), "254712345678");
  assert.equal(normalizeKenyanPhone("12345"), null);
});

test("displays short Kenyan format", () => {
  assert.equal(displayKenyanPhone("254712345678"), "0712345678");
  assert.equal(displayKenyanPhone("not-a-phone"), "not-a-phone");
});

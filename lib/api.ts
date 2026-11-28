import "server-only";

import { AuthError } from "./session";

function isServerConfigError(error: unknown): error is Error {
  if (!(error instanceof Error)) return false;
  return /(?:not configured|not valid JSON|missing project_id|SESSION_SECRET|FIREBASE_API_KEY|WEBAUTHN_ORIGIN)/i.test(
    error.message
  );
}

export function jsonError(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): Response {
  if (error instanceof AuthError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }

  if (isServerConfigError(error)) {
    console.error("[config]", error.message);
    return Response.json(
      { error: error.message, code: "SERVER_CONFIG" },
      { status: 500 }
    );
  }

  console.error("[api]", error);
  return Response.json(
    { error: fallback, code: "SERVER_ERROR" },
    { status: 500 }
  );
}

export function assertSameOrigin(request: Request): void {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return;
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    throw new AuthError(403, "Origin header is required.", "CSRF");
  }

  let expected: string;
  try {
    expected = new URL(request.url).origin;
  } catch {
    throw new AuthError(400, "Invalid request URL.");
  }

  if (origin !== expected) {
    throw new AuthError(403, "Cross-origin request blocked.", "CSRF");
  }
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new AuthError(400, "Invalid JSON body.");
  }
}

export function requireString(
  value: unknown,
  field: string,
  maxLength = 200
): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new AuthError(400, `${field} is required.`);
  }

  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new AuthError(400, `${field} is too long.`);
  }
  return trimmed;
}

export function optionalString(value: unknown, maxLength = 2000): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

export function requireEmail(value: unknown): string {
  const email = requireString(value, "Email", 320);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AuthError(400, "Enter a valid email address.");
  }
  return email;
}

export function requireNumber(
  value: unknown,
  field: string,
  options: { min?: number; max?: number; integer?: boolean } = {}
): number {
  const number = typeof value === "number" ? value : Number(value);
  const min = options.min ?? 0;

  if (
    !Number.isFinite(number) ||
    number < min ||
    (options.max !== undefined && number > options.max) ||
    (options.integer && !Number.isInteger(number))
  ) {
    throw new AuthError(400, `Invalid ${field}.`);
  }

  return number;
}

import "server-only";

import { AuthError } from "./session";

export function jsonError(error: unknown, fallback = "Request failed."): Response {
  if (error instanceof AuthError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }

  return Response.json(
    { error: error instanceof Error ? error.message : fallback },
    { status: 500 }
  );
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) {
    return;
  }

  let expected: string;
  try {
    expected = new URL(request.url).origin;
  } catch {
    return;
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

export const SERVICE_ACCOUNT_ENV_NAMES = [
  "FIREBASE_SERVICE_ACCOUNT_BASE64",
  "FIREBASE_SERVICE_ACCOUNT",
  "FIREBASE_SERVICE_ACCOUNT_JSON",
  "FIREBASE_ADMIN_SERVICE_ACCOUNT",
] as const;

export interface ServiceAccountJson {
  project_id?: string;
  client_email?: string;
  private_key?: string;
}

function parseCandidate(value: string): ServiceAccountJson | null {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as ServiceAccountJson;
    }
  } catch {
    return null;
  }
  return null;
}

export function hasServiceAccountEnv(): boolean {
  return SERVICE_ACCOUNT_ENV_NAMES.some((name) => Boolean(process.env[name]?.trim()));
}

export function readServiceAccountEnv(): {
  name: string;
  value: string;
  parsed: ServiceAccountJson;
} {
  const name = SERVICE_ACCOUNT_ENV_NAMES.find((candidate) =>
    Boolean(process.env[candidate]?.trim())
  );

  if (!name) {
    throw new Error(
      `Firebase service account is not configured. Set one of ${SERVICE_ACCOUNT_ENV_NAMES.join(", ")} in the server environment.`
    );
  }

  const value = process.env[name]!.trim();
  const candidates = [value, Buffer.from(value, "base64").toString("utf8")];
  const parsed = candidates.map(parseCandidate).find(Boolean);

  if (!parsed) {
    throw new Error(
      `Firebase service account in ${name} is not valid JSON. Use the base64-encoded service account JSON or the raw JSON.`
    );
  }

  return { name, value, parsed };
}

export function getServiceAccountPrivateKey(): string {
  try {
    return readServiceAccountEnv().parsed.private_key?.replace(/\\n/g, "\n") ?? "";
  } catch {
    return "";
  }
}

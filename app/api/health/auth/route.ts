import { hasSessionSecret } from "@/lib/session-token";
import {
  SERVICE_ACCOUNT_ENV_NAMES,
  hasServiceAccountEnv,
  readServiceAccountEnv,
} from "@/lib/service-account-env";

export function GET() {
  const checks = {
    firebaseApiKey: Boolean(
      process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    ),
    serviceAccountValue: hasServiceAccountEnv(),
    serviceAccountFields: false,
    sessionSecret: hasSessionSecret(),
  };

  let detail: string | undefined;
  try {
    const { parsed } = readServiceAccountEnv();
    checks.serviceAccountFields = Boolean(
      parsed.project_id && parsed.client_email && parsed.private_key
    );
    if (!checks.serviceAccountFields) {
      detail =
        "The configured Firebase service account is missing project_id, client_email, or private_key.";
    }
  } catch (error) {
    detail = error instanceof Error ? error.message : String(error);
  }

  const ok =
    checks.firebaseApiKey &&
    checks.serviceAccountValue &&
    checks.serviceAccountFields &&
    checks.sessionSecret;

  return Response.json(
    {
      ok,
      checks,
      detail,
      acceptedServiceAccountEnvNames: SERVICE_ACCOUNT_ENV_NAMES,
    },
    { status: ok ? 200 : 500 }
  );
}

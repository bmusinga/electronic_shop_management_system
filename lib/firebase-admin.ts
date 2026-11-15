import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

interface ServiceAccountJson {
  project_id?: string;
  client_email?: string;
  private_key?: string;
}

let app: App | null = null;

function readServiceAccount() {
  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!encoded) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_BASE64 is not configured. Add the base64-encoded Firebase service account JSON to the server environment."
    );
  }

  let parsed: ServiceAccountJson;
  try {
    parsed = JSON.parse(
      Buffer.from(encoded, "base64").toString("utf8")
    ) as ServiceAccountJson;
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_BASE64 is not valid base64-encoded JSON."
    );
  }

  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error(
      "The Firebase service account is missing project_id, client_email, or private_key."
    );
  }

  return {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key.replace(/\\n/g, "\n"),
  };
}

export function getAdminApp(): App {
  if (app) {
    return app;
  }

  const existing = getApps()[0];
  if (existing) {
    app = existing;
    return app;
  }

  const serviceAccount = readServiceAccount();
  app = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId,
  });
  return app;
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

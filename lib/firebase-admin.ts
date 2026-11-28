import "server-only";

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import {
  hasServiceAccountEnv,
  readServiceAccountEnv,
} from "./service-account-env.ts";

export { hasServiceAccountEnv } from "./service-account-env.ts";

let app: App | null = null;

function readServiceAccount() {
  const { parsed } = readServiceAccountEnv();

  const projectId = parsed.project_id || process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId || !parsed.client_email || !parsed.private_key) {
    throw new Error("The Firebase service account is missing project_id, client_email, or private_key.");
  }

  return {
    projectId,
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key.replace(/\\n/g, "\n"),
  };
}

export function getAdminApp(): App {
  if (app) return app;
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

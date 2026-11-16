import { assertSameOrigin, jsonError, readJson } from "@/lib/api";
import { getSettings, saveSettings } from "@/lib/firestore-admin";
import { AuthError, requireAdmin } from "@/lib/session";
import type { SettingsData } from "@/lib/types";

export const dynamic = "force-dynamic";

const ALLOWED_KEYS = [
  "fullName",
  "email",
  "phone",
  "storeName",
  "description",
  "contactEmail",
  "contactPhone",
  "categoryCards",
] as const;

interface SettingsBody {
  [key: string]: unknown;
}

function parseSettings(body: SettingsBody): SettingsData {
  const data: SettingsData = {};

  for (const key of ALLOWED_KEYS) {
    const value = body[key];
    if (key === "categoryCards") {
      if (typeof value === "string") {
        data[key] = value.slice(0, 200000);
      }
      continue;
    }
    if (typeof value === "string") {
      data[key] = value.trim().slice(0, 2000);
    }
  }

  if (Object.keys(data).length === 0) {
    throw new AuthError(400, "No settings provided.");
  }

  return data;
}

export async function GET() {
  try {
    await requireAdmin();
    return Response.json((await getSettings()) ?? {}, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const body = await readJson<SettingsBody>(request);
    await saveSettings(parseSettings(body));
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

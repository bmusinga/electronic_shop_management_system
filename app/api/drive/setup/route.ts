import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { jsonError } from "@/lib/api";
import { getDriveAuthUrl } from "@/lib/drive-server";
import { requireAdmin } from "@/lib/session";

const DRIVE_STATE_COOKIE = "drive_oauth_state";

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const origin = new URL(request.url).origin;
    const redirectUri = `${origin}/api/drive/callback`;
    const state = randomBytes(24).toString("base64url");

    const cookieStore = await cookies();
    cookieStore.set(DRIVE_STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/drive",
      maxAge: 10 * 60,
    });

    return Response.redirect(getDriveAuthUrl(redirectUri, state), 302);
  } catch (error) {
    return jsonError(error, "Could not start the Drive setup.");
  }
}

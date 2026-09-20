import { getDriveAuthUrl } from "@/lib/drive-server";

export async function GET(request: Request) {
  try {
    const origin = new URL(request.url).origin;
    const redirectUri = `${origin}/api/drive/callback`;
    return Response.redirect(getDriveAuthUrl(redirectUri), 302);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Could not start the Drive setup." },
      { status: 500 }
    );
  }
}
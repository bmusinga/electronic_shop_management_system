import { cookies } from "next/headers";
import { jsonError } from "@/lib/api";
import { exchangeCodeForToken } from "@/lib/drive-server";
import { AuthError, requireAdmin } from "@/lib/session";

const DRIVE_STATE_COOKIE = "drive_oauth_state";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

function htmlResponse(message: string): Response {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><title>Drive setup</title></head><body style="font-family:sans-serif;max-width:720px;margin:40px auto;line-height:1.6">${message}</body></html>`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");
    const state = url.searchParams.get("state");

    const cookieStore = await cookies();
    const expectedState = cookieStore.get(DRIVE_STATE_COOKIE)?.value;
    cookieStore.set(DRIVE_STATE_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/drive",
      maxAge: 0,
    });

    if (!state || !expectedState || state !== expectedState) {
      throw new AuthError(400, "Invalid Drive setup state. Start setup again.");
    }

    if (error) {
      return htmlResponse(
        `<h1>Drive setup cancelled</h1><p>${escapeHtml(error)}</p><p>Go back to Dashboard &gt; Products and try again later.</p>`
      );
    }

    if (!code) {
      throw new AuthError(400, "Missing Google authorization code.");
    }

    const redirectUri = `${url.origin}/api/drive/callback`;
    const data = await exchangeCodeForToken(code, redirectUri);
    const errorMessage = data.error_description || data.error || "";

    if (!data.refresh_token) {
      const message = errorMessage || "No refresh token returned";
      return htmlResponse(
        `<h1>Drive setup failed</h1><p>${escapeHtml(message)}</p><p>Make sure you sign in with the exact Google account you want photos saved to, then run setup again.</p>`
      );
    }

    return htmlResponse(
      `<h1>Google Drive connected!</h1>
      <p>Copy the refresh token below into your environment as <code>GOOGLE_DRIVE_REFRESH_TOKEN</code> (in <code>.env.local</code> locally, and in Vercel under Project &gt; Settings &gt; Environment Variables).</p>
      <p><strong>Keep this token secret.</strong> Anyone with it can upload files to your Drive account.</p>
      <textarea readonly rows="6" cols="80" style="width:100%;padding:12px;font-family:monospace;font-size:12px">${escapeHtml(data.refresh_token)}</textarea>
      <p>After saving it, restart the dev server (or redeploy). No one will need to sign in to Google from the dashboard again.</p>`
    );
  } catch (error) {
    return jsonError(error, "Could not finish the Drive setup.");
  }
}

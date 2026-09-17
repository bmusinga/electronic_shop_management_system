import { exchangeCodeForToken } from "@/lib/drive-server";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  if (error) {
    return new Response(
      `<html><body><h1>Drive setup cancelled</h1><p>${error}</p><p>Go back to Dashboard &gt; Products and try again later.</p></body></html>`,
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  }
  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  const redirectUri = `${url.origin}/api/drive/callback`;
  const data = await exchangeCodeForToken(code, redirectUri);

  if (!data.refresh_token) {
    const message = data.error_description || data.error || "No refresh token returned";
    return new Response(
      `<html><body><h1>Drive setup failed</h1><p>${message}</p><p>Make sure you sign in with the exact Google account you want photos saved to, then run setup again.</p></body></html>`,
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  }

  return new Response(
    `<html><body style="font-family:sans-serif;max-width:720px;margin:40px auto;line-height:1.6">
      <h1>Google Drive connected!</h1>
      <p>Copy the refresh token below into your environment as <code>GOOGLE_DRIVE_REFRESH_TOKEN</code> (in <code>.env.local</code> locally, and in Vercel under Project &gt; Settings &gt; Environment Variables).</p>
      <p><strong>Keep this token secret.</strong> Anyone with it can upload files to your Drive account.</p>
      <textarea readonly rows="6" cols="80" style="width:100%;padding:12px;font-family:monospace;font-size:12px" onclick="this.select()">${data.refresh_token}</textarea>
      <p>After saving it, restart the dev server (or redeploy). No one will need to sign in to Google from the dashboard again.</p>
    </body></html>`,
    { status: 200, headers: { "Content-Type": "text/html" } }
  );
}
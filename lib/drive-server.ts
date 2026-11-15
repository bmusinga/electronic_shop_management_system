import "server-only";

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
const PRODUCTS_FOLDER_ID = process.env.GOOGLE_DRIVE_PRODUCTS_FOLDER_ID;
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
}

interface CodeExchangeResult {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

let accessToken: string | null = null;
let tokenExpiresAt = 0;

function requireConfig(): void {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error(
      "Google Drive server credentials are not configured. Set GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET, and GOOGLE_DRIVE_REFRESH_TOKEN."
    );
  }
}

function requireProductsFolderId(): string {
  if (!PRODUCTS_FOLDER_ID) {
    throw new Error(
      "The product image folder is not configured. Set GOOGLE_DRIVE_PRODUCTS_FOLDER_ID to the EshopIMGs folder ID."
    );
  }
  return PRODUCTS_FOLDER_ID;
}

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiresAt - 60 * 1000) {
    return accessToken;
  }
  requireConfig();
  const params = new URLSearchParams({
    client_id: CLIENT_ID as string,
    client_secret: CLIENT_SECRET as string,
    refresh_token: REFRESH_TOKEN as string,
    grant_type: "refresh_token",
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) {
    throw new Error(
      `Could not refresh the Google Drive token (status ${res.status}). Re-run the one-time Drive setup.`
    );
  }
  const data = (await res.json()) as TokenResponse;
  accessToken = data.access_token ?? null;
  if (!accessToken) {
    throw new Error("Google did not return an access token.");
  }
  tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return accessToken;
}

export interface DriveUploadResult {
  id: string;
  url: string;
}

export async function uploadImageToDrive(
  buffer: ArrayBufferView | ArrayBuffer,
  mimeType?: string,
  fileName?: string
): Promise<DriveUploadResult> {
  const token = await getAccessToken();
  const folderId = requireProductsFolderId();
  const name = fileName || `product-${Date.now()}.jpg`;
  const mediaType = mimeType || "image/jpeg";
  const metadata = {
    name,
    mimeType: mediaType,
    parents: [folderId],
  };

  const formData = new FormData();
  formData.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  formData.append(
    "file",
    new Blob([buffer as BlobPart], { type: mediaType }),
    name
  );

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }
  );
  if (!uploadRes.ok) {
    if (uploadRes.status === 404) {
      throw new Error(
        "Google Drive could not find the product image folder. Check GOOGLE_DRIVE_PRODUCTS_FOLDER_ID, then re-run /api/drive/setup so the app has full Drive access."
      );
    }
    throw new Error(
      `Google Drive upload failed (status ${uploadRes.status}).`
    );
  }
  const file = (await uploadRes.json()) as { id: string };

  const permRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${file.id}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    }
  );
  if (!permRes.ok) {
    throw new Error("Uploaded, but could not make the image publicly viewable.");
  }

  return {
    id: file.id,
    url: `https://lh3.googleusercontent.com/d/${file.id}=w1200`,
  };
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (res.ok || res.status === 404) {
    return;
  }
  throw new Error(
    `Could not delete the file from Google Drive (status ${res.status}).`
  );
}

export function getDriveAuthUrl(redirectUri: string, state: string): string {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      "Google Drive OAuth credentials are not configured. Set GOOGLE_DRIVE_CLIENT_ID and GOOGLE_DRIVE_CLIENT_SECRET."
    );
  }

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: DRIVE_SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<CodeExchangeResult> {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      "Google Drive OAuth credentials are not configured. Set GOOGLE_DRIVE_CLIENT_ID and GOOGLE_DRIVE_CLIENT_SECRET."
    );
  }

  const params = new URLSearchParams({
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) {
    throw new Error(
      `Could not exchange the Google code (status ${res.status}).`
    );
  }
  return (await res.json()) as CodeExchangeResult;
}
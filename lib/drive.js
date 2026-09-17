const DRIVE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID;
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

let gisPromise = null;
let tokenClient = null;
let accessToken = null;
let tokenExpiry = 0;
let tokenResolver = null;

function loadGis() {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Google Drive uploads can only run in the browser.")
    );
  }
  if (typeof google !== "undefined" && google.accounts) {
    return Promise.resolve();
  }
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = resolve;
    script.onerror = () => {
      gisPromise = null;
      reject(new Error("Could not load Google Identity Services."));
    };
    document.head.appendChild(script);
  });
  return gisPromise;
}

export function isDriveConfigured() {
  return Boolean(DRIVE_CLIENT_ID);
}

export function preloadDrive() {
  return loadGis()
    .then(() => {
      if (!tokenClient) makeTokenClient();
    })
    .catch(() => {});
}

function makeTokenClient() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: DRIVE_CLIENT_ID,
    scope: DRIVE_SCOPE,
    callback: (resp) => {
      if (!tokenResolver) return;
      if (resp.error || resp.error_description) {
        const err = new Error(resp.error_description || resp.error);
        err.code = resp.error;
        tokenResolver.reject(err);
      } else {
        accessToken = resp.access_token;
        tokenExpiry = Date.now() + (resp.expires_in || 3600) * 1000;
        tokenResolver.resolve(accessToken);
      }
      tokenResolver = null;
    },
  });
}

export function requestDriveAccessToken() {
  if (!DRIVE_CLIENT_ID) {
    return Promise.reject(
      new Error(
        "Google Drive is not configured. Set NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID in your .env.local file."
      )
    );
  }
  if (!tokenClient) {
    return Promise.reject(
      new Error("Google sign-in is still loading. Please try again in a moment.")
    );
  }
  if (accessToken && Date.now() < tokenExpiry) {
    return Promise.resolve(accessToken);
  }
  return new Promise((resolve, reject) => {
    tokenResolver = { resolve, reject };
    try {
      tokenClient.requestAccessToken();
    } catch (err) {
      tokenResolver = null;
      reject(err);
    }
  });
}

export function hasDriveToken() {
  return Boolean(accessToken) && Date.now() < tokenExpiry;
}

export function driveImageUrl(fileId, width = 1200) {
  return `https://lh3.googleusercontent.com/d/${fileId}=w${width}`;
}

export async function uploadImageToDrive(imageBlob, fileName) {
  const token = await requestDriveAccessToken();

  const metadata = {
    name: fileName || `product-${Date.now()}.jpg`,
    mimeType: imageBlob.type || "image/jpeg",
  };

  const formData = new FormData();
  formData.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  formData.append("file", imageBlob);

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }
  );

  if (!uploadRes.ok) {
    if (uploadRes.status === 401 || uploadRes.status === 403) {
      throw new Error("Google Drive access was denied. Please try again.");
    }
    throw new Error(
      `Google Drive upload failed (status ${uploadRes.status}).`
    );
  }

  const file = await uploadRes.json();

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
    throw new Error(
      "Uploaded, but could not make the image publicly viewable."
    );
  }

  return {
    id: file.id,
    url: driveImageUrl(file.id),
  };
}
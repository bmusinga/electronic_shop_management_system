# Voltex Electronics - Setup Guide

## Prerequisites

- **Node.js** v18 or later: https://nodejs.org
- **npm** (comes with Node.js)
- A **Google account** for Firebase and Google Drive
- A **Vercel account** for deployment: https://vercel.com

> **Security model:** every environment variable is now server-only. The browser talks only to same-origin Next.js API routes, and the server uses the Firebase Admin SDK. No Firebase or Drive credentials are included in the client bundle.

---

## Step 1: Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add project**
3. Enter a project name, then click **Create project**
4. Open the project when it finishes

---

## Step 2: Enable Firebase Authentication

1. Click **Authentication** in the left sidebar
2. Click **Get started**
3. Under **Sign-in providers**, open **Email/Password**
4. Enable it and click **Save**

### Create an admin account

1. Open **Authentication > Users**
2. Click **Add user**
3. Enter the admin email and password
4. Click **Save**

You will use this email and password to sign in to the dashboard.

---

## Step 3: Create Firestore

1. Click **Firestore Database** in the left sidebar
2. Click **Create database**
3. Pick a location close to your users
4. Click **Enable**

### Set deny-all security rules

The app uses the Firebase Admin SDK on the server, which bypasses Firestore security rules. The rules should deny direct browser access completely.

1. Open Firestore **Rules**
2. Replace the rules with:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish**

The same rules are stored in `firestore.rules` in this repo.

---

## Step 4: Create a Firebase Service Account

The server needs a service account to read and write Firestore and to manage Firebase Auth users.

1. In Firebase, open **Project settings** (gear icon)
2. Open the **Service accounts** tab
3. Click **Generate new private key**
4. Save the JSON file somewhere private. **Never commit it to git.**
5. Base64-encode the JSON.

PowerShell:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\service-account.json")) | Set-Clipboard
```

macOS/Linux:

```bash
base64 -w 0 service-account.json
```

Paste the result into `FIREBASE_SERVICE_ACCOUNT_BASE64`.

---

## Step 5: Get the Firebase Web API Key

The server uses Firebase Identity Toolkit to verify email/password logins. It needs the Firebase web API key.

1. Open **Project settings > General**
2. Scroll to **Your apps**
3. If there is no web app, click the web icon (`</>`) and register one
4. Copy the `apiKey` value from the Firebase config

You also need the other config values for completeness. They are retained as server-only variables but are no longer used by the browser:

```
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## Step 6: Set Up Google Drive for Product Images

Product photos are stored in your Google Drive and shown publicly on the site. The server uses a saved refresh token, so no Google sign-in popup appears in the dashboard.

### 6a. Google Cloud setup (one time)

1. Go to https://console.cloud.google.com
2. Create or select a project
3. Enable the **Google Drive API** under **APIs & Services > Library**
4. Configure the **OAuth consent screen**:
   - Choose **External**
   - Add your app name and email
   - Add the Drive account you want to use as a **Test user**
   - Add the scope `https://www.googleapis.com/auth/drive`
   - Publish the app to **In production** so refresh tokens do not expire every 7 days
5. Create an **OAuth client ID**:
   - Go to **APIs & Services > Credentials**
   - Click **Create credentials > OAuth client ID**
   - Choose **Web application**
   - Add authorized JavaScript origins:
     - `http://localhost:3000`
     - `https://YOUR-SITE.vercel.app`
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/drive/callback`
     - `https://YOUR-SITE.vercel.app/api/drive/callback`
   - Click **Create**
   - Copy the **Client ID** and **Client Secret**
6. In Google Drive, create a folder named `EshopIMGs`
7. Open the folder and copy the folder ID from the URL:
   `https://drive.google.com/drive/folders/FOLDER_ID_HERE`

### 6b. Add the Drive variables

```
GOOGLE_DRIVE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_DRIVE_CLIENT_SECRET=your-client-secret
GOOGLE_DRIVE_REFRESH_TOKEN=(paste from step 6c)
GOOGLE_DRIVE_PRODUCTS_FOLDER_ID=(the EshopIMGs folder ID)
```

### 6c. Get the refresh token (one time)

1. Start the app with `npm run dev`
2. Sign in to the dashboard at http://localhost:3000/login
3. Open http://localhost:3000/api/drive/setup
4. Sign in to the Google account whose Drive you want to use and click **Allow**
5. Copy the refresh token shown after the redirect
6. Paste it into `GOOGLE_DRIVE_REFRESH_TOKEN` in `.env.local` and in Vercel
7. Restart the dev server or redeploy

`/api/drive/setup` now requires an admin dashboard session and uses an OAuth state cookie. The callback also requires the dashboard session.

> **Keep the refresh token secret.** Anyone with it can upload files to your Drive account.
>
> **Deleting images:** deleting a product, or replacing its image, deletes the old Drive file automatically.

---

## Step 7: Configure `.env.local`

Your `.env.local` should contain these names:

```
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_SERVICE_ACCOUNT_BASE64=
GOOGLE_DRIVE_CLIENT_ID=
GOOGLE_DRIVE_CLIENT_SECRET=
GOOGLE_DRIVE_REFRESH_TOKEN=
GOOGLE_DRIVE_PRODUCTS_FOLDER_ID=
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `FIREBASE_API_KEY` | Yes | Server-side email/password verification |
| `FIREBASE_AUTH_DOMAIN` | Retained | Kept for compatibility; not used by the browser |
| `FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `FIREBASE_STORAGE_BUCKET` | Retained | Kept for compatibility; not used by the browser |
| `FIREBASE_MESSAGING_SENDER_ID` | Retained | Kept for compatibility; not used by the browser |
| `FIREBASE_APP_ID` | Retained | Kept for compatibility; not used by the browser |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Yes | Firebase Admin SDK credentials |
| `GOOGLE_DRIVE_CLIENT_ID` | Yes | Drive OAuth client ID |
| `GOOGLE_DRIVE_CLIENT_SECRET` | Yes | Drive OAuth client secret |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | Yes | Drive refresh token |
| `GOOGLE_DRIVE_PRODUCTS_FOLDER_ID` | Yes | The `EshopIMGs` folder ID |

> **Do not add `NEXT_PUBLIC_` to any of these names.** In Vercel, `NEXT_PUBLIC_*` values are exposed to the browser and cannot be marked as Secret.

---

## Step 8: Test Locally

1. Run:

   ```bash
   npm run dev
   ```

2. Open http://localhost:3000 and check the public pages:
   - Home
   - About
   - Products
3. Test the theme toggle
4. Open http://localhost:3000/login and sign in with the admin account
5. You should be redirected to `/dashboard`
6. Check the overview, products, sales, and settings pages
7. Add a product with an image and confirm it appears on the public products page

Dashboard data updates live over Server-Sent Events (SSE). Public product pages fetch once.

---

## Step 9: Deploy to Vercel

### 9a. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/electronicsshop.git
git push -u origin main
```

### 9b. Import the project in Vercel

1. Go to https://vercel.com and click **Add new > Project**
2. Import the repository
3. Add every variable from `.env.local` under **Environment Variables**
4. Mark every variable as **Sensitive**
5. Click **Deploy**

Vercel does not allow variables beginning with `NEXT_PUBLIC_` to be marked as Secret. The renamed variables above are intentionally server-only.

### SSE duration limits

The dashboard streams use a 280-second window and reconnect automatically. This stays below Vercel's limits:

- Hobby: 300 seconds maximum
- Pro: 800 seconds maximum

---

## Troubleshooting

### Login returns "FIREBASE_SERVICE_ACCOUNT_BASE64 is not configured"

- Create the service account JSON in Firebase and base64-encode it
- Paste the encoded value into `FIREBASE_SERVICE_ACCOUNT_BASE64`
- Restart the dev server or redeploy

### Products do not appear

- Firestore rules deny direct browser access by design. The app reads through the server API.
- Check that `FIREBASE_SERVICE_ACCOUNT_BASE64` is valid and belongs to the same Firebase project
- Check the Vercel function logs for Admin SDK errors

### Product image upload fails with a Drive 404

- Confirm `GOOGLE_DRIVE_PRODUCTS_FOLDER_ID` is the actual `EshopIMGs` folder ID
- Re-run `/api/drive/setup` after changing the Drive scope
- Confirm the OAuth consent screen includes `https://www.googleapis.com/auth/drive`

### Upload is rejected as too large

- Images are limited to **4 MB** per upload to stay within Vercel request-body limits
- The dashboard compresses images before uploading, but very large originals can still be rejected

### Vercel says a `NEXT_PUBLIC_*` variable cannot be Secret

- Rename it by removing the `NEXT_PUBLIC_` prefix
- This app no longer reads any `NEXT_PUBLIC_*` variables

### Dark mode does not persist

- Theme preference is stored in `localStorage`; incognito windows reset it each session

---

## Project Structure

```
electronicsshop/
├── app/
│   ├── api/
│   │   ├── auth/          # login, logout, session, password
│   │   ├── drive/         # upload, delete, setup, callback
│   │   ├── messages/      # contact messages API
│   │   ├── products/      # products + SSE stream
│   │   ├── sales/         # sales + SSE stream
│   │   └── settings/      # store/profile settings
│   ├── dashboard/         # admin dashboard
│   ├── login/
│   ├── products/
│   └── contact/
├── components/
├── hooks/                 # useAuth, useCollectionStream, useTheme
├── lib/                   # firebase-admin, session, firestore-admin, drive-server
├── firestore.rules        # deny-all browser access
└── .env.local             # local secrets, never committed
```

---

## Security Notes

- All 11 environment variables are server-only.
- Session cookies are httpOnly, Secure in production, SameSite=Lax, and expire after 24 hours.
- Session tokens are random and only a SHA-256 hash is stored in Firestore.
- Any user created in Firebase Authentication can sign in to the dashboard.
- The old Firebase web API key is not rotated, per the current project decision. It is no longer included in browser bundles, but anyone who already has it can still use it.

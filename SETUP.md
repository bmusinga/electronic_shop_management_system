# Voltex Electronics - Setup Guide

## Prerequisites

Before you begin, make sure you have the following installed:
- **Node.js** (v18 or later) -- download from https://nodejs.org
- **npm** (comes with Node.js)
- A **Google account** (for Firebase)
- A **Vercel account** (for deployment) -- sign up free at https://vercel.com

---

## Step 1: Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Add project"**
3. Enter a project name (e.g., `voltex-electronics`)
4. Uncheck "Google Analytics" if you don't need it (optional)
5. Click **"Create project"**
6. Wait for it to finish, then click **"Continue"**

---

## Step 2: Set Up Firebase Authentication

1. In the Firebase console, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Under "Sign-in providers", click **"Email/Password"**
4. Toggle **Enable** on
5. Uncheck "Email link (passwordless sign-in)" if you only want password login
6. Click **"Save"**

### Create an Admin Account

1. Go to **Authentication > Users** tab
2. Click **"Add user"**
3. Enter an email and password for your admin account (e.g., `admin@voltex.com`)
4. Click **"Save"**
5. **Write down these credentials** -- you will use them to log into the dashboard

---

## Step 3: Set Up Firebase Firestore

1. In the Firebase console, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose a location (pick the one closest to your users, e.g., `us-central1`)
4. Select **"Start in test mode"** for now
5. Click **"Enable"**

### Set Up Security Rules

1. In Firestore, click the **"Rules"** tab
2. Replace the default rules with the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Products collection - anyone can read, only authenticated users can write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Settings collection - only authenticated users can read/write
    match /settings/{settingId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Orders collection - only authenticated users can read/write
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

---

## Step 4: Get Your Firebase Config Keys

1. In the Firebase console, click the **gear icon** (top-left) > **"Project settings"**
2. Scroll down to the **"Your apps"** section
3. If you don't see a web app yet, click the **web icon** (`</>`) to add one
4. Enter a nickname (e.g., `voltex-web`)
5. Click **"Register app"**
6. You will see a config object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "voltex-electronics.firebaseapp.com",
  projectId: "voltex-electronics",
  storageBucket: "voltex-electronics.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

7. Copy each value and paste it into your `.env.local` file:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=voltex-electronics.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=voltex-electronics
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=voltex-electronics.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## Step 5: Test Locally

1. Open a terminal in your project folder
2. Run:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000 in your browser
4. Check that all pages load correctly:
   - Home page (carousel, products, FAQs)
   - About page
   - Products page
   - Contact page
5. Test dark/light mode toggle (sun/moon icon in navbar)
6. Go to http://localhost:3000/login
7. Sign in with the admin credentials you created in Step 2
8. You should be redirected to the dashboard
9. Check the dashboard overview (stats cards, revenue chart)
10. Go to Dashboard > Products and test adding/removing products
11. Products you add here are stored in Firestore and will appear on the public Products page

---

## Step 6: Seed Your Products in Firestore

After signing into the dashboard:

1. Go to **Dashboard > Products**
2. Click **"Add Product"**
3. Fill in the details for each product:
   - **Name**: e.g., "iPhone 15 Pro"
   - **Description**: e.g., "Latest Apple flagship with A17 Pro chip"
   - **Price**: e.g., 1199
   - **Category**: Select from the dropdown
   - **Stock**: e.g., 45
   - **Image**: Click **"Upload from Device"** to pick a photo from your device or **"Take Photo"** to use your camera. The image is compressed, saved to your Google Drive, and a public link is stored with the product.
4. Click **"Add Product"**
5. Repeat for all products you want to display

> **Note:** The first time you upload an image you will be asked to sign in to your Google account to allow the app to save images to your Drive. Files are stored in a hidden app folder and made publicly viewable so they appear on the site.

The products page will pull from Firestore automatically once Firebase is configured.

---

## Step 7: Set Up Google Drive for Product Images (required for photo uploads)

Images you upload or capture in the dashboard are stored in your **free Google Drive** (15 GB) and shown publicly on the site. The app uses a **server-side token**, so photos are always saved to **your** Drive account from **any** device — no one ever has to sign in to Google from the dashboard.

### 7a. Google Cloud setup (one time)

1. Go to the **Google Cloud Console**: https://console.cloud.google.com
2. Create a new project (or select an existing one), e.g. `voltex-electronics`
3. Enable the **Google Drive API**:
   - Go to **APIs & Services > Library**
   - Search for **"Google Drive API"**, click it, then click **"Enable"**
4. Configure the **OAuth consent screen**:
   - Go to **APIs & Services > OAuth consent screen**
   - Choose **External**, fill in the app name (e.g. "Voltex") and your email, then click **Save**
   - Under **Test users**, click **Add users** and add the **email of the Drive account you want photos saved to**
   - Under **Scopes**, add the scope: `https://www.googleapis.com/auth/drive.file`
   - Click **Publish app > In production** so the token does not expire every 7 days. (Leave verification to Google; your app stays usable as an unverified personal app.)
5. Create the **OAuth Client ID**:
   - Go to **APIs & Services > Credentials**
   - Click **"Create credentials" > "OAuth client ID"**
   - Choose **Application type: Web application**
   - Under **Authorized JavaScript origins**, add:
     - `http://localhost:3000` (for local testing)
     - `https://YOUR-SITE.vercel.app` (your live site URL, e.g. `https://voltex-electronics.vercel.app`)
   - Under **Authorized redirect URIs**, add:
     - `http://localhost:3000/api/drive/callback` (for local testing)
     - `https://YOUR-SITE.vercel.app/api/drive/callback` (your live site)
   - Click **"Create"** and copy the **Client ID** (ends in `.apps.googleusercontent.com`), and note the **Client Secret**

### 7b. Add the credentials to your app

In `.env.local`, set:

```
NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_DRIVE_CLIENT_SECRET=your-client-secret
GOOGLE_DRIVE_REFRESH_TOKEN=(paste from step 7c)
```

### 7c. Get the refresh token (one time)

1. Restart your dev server (`npm run dev`).
2. Open this URL in your browser: `http://localhost:3000/api/drive/setup` (on the live site use `https://YOUR-SITE.vercel.app/api/drive/setup`).
3. Sign in to the Google account whose Drive you want to use and click **Allow**. (If Google shows an "unverified app" screen, click **Advanced > Go to <app name> (unsafe)** — expected for personal apps.)
4. You'll be redirected to a page showing a **refresh token** — copy it.
5. Paste it into `GOOGLE_DRIVE_REFRESH_TOKEN` in `.env.local` (and in Vercel), then restart/redeploy.

> **Important:** Keep the refresh token secret — anyone with it can upload to your Drive.
>
> **Deleting images:** When you delete a product (or replace its image), the uploaded file is automatically deleted from your Drive too.

---

## Step 8: Deploy to Vercel

### 7a. Push Your Code to GitHub

1. Create a new repository on GitHub (e.g., `voltex-electronics`)
2. In your project folder, initialize git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/voltex-electronics.git
   git push -u origin main
   ```

### 7b. Deploy on Vercel

1. Go to https://vercel.com
2. Sign in with your GitHub account
3. Click **"Add new..." > "Project"**
4. Find your `voltex-electronics` repository and click **"Import"**
5. Before deploying, add your environment variables:
   - Click **"Environment Variables"**
   - Add each variable from your `.env.local` file:
     | Name | Value |
     |------|-------|
     | `NEXT_PUBLIC_FIREBASE_API_KEY` | Your API key |
     | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Your auth domain |
     | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your project ID |
     | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Your storage bucket |
     | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID |
     | `NEXT_PUBLIC_FIREBASE_APP_ID` | Your app ID |
     | `NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID` | Your Google OAuth Client ID |
      | `GOOGLE_DRIVE_CLIENT_SECRET` | Your Google OAuth Client Secret |
      | `GOOGLE_DRIVE_REFRESH_TOKEN` | The refresh token from step 7c |
6. Click **"Deploy"**
7. Wait for the build to finish (usually 1-2 minutes)
8. Your site is now live at the URL Vercel gives you (e.g., `voltex-electronics.vercel.app`)

---

## Step 9: Set Up Your Custom Domain (Optional)

1. In Vercel, go to your project > **"Settings" > "Domains"**
2. Enter your domain name (e.g., `voltex.com`)
3. Vercel will give you DNS records to add
4. Go to your domain registrar (GoDaddy, Namecheap, etc.) and add those DNS records
5. Wait for DNS propagation (can take up to 48 hours)
6. Vercel will automatically issue an SSL certificate (HTTPS)

---

## Troubleshooting

### "Firebase: Error (auth/user-not-found)"
- Make sure you created a user in Firebase Authentication (Step 2)

### "Firebase: Error (auth/wrong-password)"
- Double-check the email and password you entered

### Products not showing on the public page
- Check that Firestore is in "test mode" or your security rules allow public reads
- Make sure your `.env.local` values match your Firebase config exactly

### Build fails with environment variable errors
- Make sure all `NEXT_PUBLIC_FIREBASE_*` variables are set in `.env.local`
- If deploying to Vercel, make sure they are added in the Vercel dashboard under Environment Variables

### Dark mode not persisting
- This is stored in localStorage. If using incognito mode, it will reset each session.

---

## Project Structure

```
electronicsshop/
├── app/                    # Pages (Next.js App Router)
│   ├── page.js            # Home page
│   ├── about/page.js      # About page
│   ├── products/page.js   # Products catalog
│   ├── contact/page.js    # Contact page
│   ├── login/page.js      # Login page
│   └── dashboard/         # Admin dashboard
│       ├── page.js        # Dashboard overview
│       ├── products/      # Product management
│       └── settings/      # Settings
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks (theme, auth)
├── lib/                    # Firebase config and helpers
└── .env.local             # Your Firebase credentials (not committed to git)
```

---

## What Each Dashboard Section Does

| Section | Description |
|---------|-------------|
| **Overview** | Shows total revenue, orders, products, and active users. Includes a revenue trend chart and recent orders table. |
| **Products** | Full product management. Add new products, view stock levels, remove products. Data is stored in Firestore. |
| **Settings** | Update your profile info, store details, and change your password. |

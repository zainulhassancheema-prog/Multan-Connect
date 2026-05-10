# Multan Connect Marketplace

A high-end, luxury marketplace connecting global buyers with Multani artisans specializing in Blue Pottery and handmade Khussa. Built using React + Vite.

## Stack
- Vite + React 18
- React Router DOM
- Zustand for lightweight state management (Cart, Auth)
- TanStack Query (React Query) for data fetching and Firestore syncing
- Firebase Backend (Auth, Firestore, Storage)
- Tailwind CSS w/ Shadcn UI
- Lucide Icons & Framer Motion

## Configuration & Environment Variables
Copy `.env.example` to `.env` or `.env.local` and add your Firebase credentials.
Since this web application shares the same Firebase instance as the accompanying Android app, make sure you configure `.env.local` with the same Firebase Web Client credentials!

```bash
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="your-app-id"
```

## Running the app
```bash
# Install dependencies
pnpm install

# Run the dev server
pnpm dev
```

## Setup Google Auth & Firebase Rules
1. In the Firebase console (Authentication), ensure **Google Sign-In** is enabled.
2. In the Firebase console (Firestore), deploy the following security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /orders/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Deployment
Vercel is pre-configured via `vercel.json` to handle React Router client-side rewrites and standard headers required by Firebase Google authentication popup (`Cross-Origin-Opener-Policy: same-origin-allow-popups`).

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` to deploy. Provide environment variables when prompted.

// Server-only Firebase Admin init. NEVER import this from a client component.
import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];
  const raw = process.env.FIREBASE_ADMIN_SDK_JSON;
  if (!raw) throw new Error("FIREBASE_ADMIN_SDK_JSON is not set. Paste the service-account JSON into .env.local.");
  const serviceAccount = JSON.parse(raw);
  return initializeApp({ credential: cert(serviceAccount), storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET });
}

export const adminApp = getAdminApp();
export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export const adminStorage = getStorage(adminApp);

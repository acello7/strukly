import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Ensure required NEXT_PUBLIC_FIREBASE_* env vars are present so the SDK
// doesn't fail with a vague "configuration-not-found" error at runtime.
const requiredFirebaseEnv = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_DATABASE_URL',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
];

// Only validate env vars on the server during module evaluation. In the
// browser `process.env` may not be available in the same way and Next's
// runtime will inline NEXT_PUBLIC_* values at build, so checking here can
// produce false positives and noisy console errors in development.
let missing: string[] = []
if (typeof window === 'undefined') {
  missing = requiredFirebaseEnv.filter((k) => !process.env[k])
  if (missing.length > 0) {
    const msg = `Missing required Firebase env vars: ${missing.join(', ')}.\n` +
      `Add them to your local env (e.g. .env.local) or your hosting environment. ` +
      `Example keys: ${requiredFirebaseEnv.join(', ')}`;
    // Throw on the server so the developer sees a clear error immediately.
    throw new Error(msg)
  }
} else {
  // In client bundles avoid logging an error here — instead rely on server-side
  // diagnostics endpoint (`/debug`) and Firebase SDK errors which are more
  // reliable for runtime failures. Keep `missing` empty for diagnostics.
  missing = []
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only on client side
export const analytics = typeof window !== "undefined" ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;

export default app;

// Diagnostic helper to inspect the initialized Firebase options at runtime.
export function getFirebaseDiagnostics() {
  try {
    const options = app.options || null;
    return {
      initialized: !!options,
      options,
      missingEnv: missing,
    };
  } catch (e) {
    return { initialized: false, options: null, missingEnv: missing };
  }
}

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const storageBucket =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  (projectId ? `${projectId}.firebasestorage.app` : undefined);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId,
  storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Se utiliza un patrón Singleton para evitar la inicialización múltiple durante el entorno de desarrollo (HMR) de Next.js
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = typeof window === "undefined" ? null : getStorage(app);

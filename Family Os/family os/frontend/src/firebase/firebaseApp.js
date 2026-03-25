import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import getFirebaseConfig, { missingFirebaseConfig } from "./firebaseConfig";

let firebaseInitError = null;
let app = null;

try {
  const firebaseConfig = getFirebaseConfig();
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  console.log("[Firebase] Initialized successfully");
} catch (error) {
  firebaseInitError = error;
  console.error("[Firebase] Init failed:", error?.message || error);
}

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
export const firebaseConfigMissing = missingFirebaseConfig.length > 0;
export { firebaseInitError };

const REQUIRED_KEYS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

export const missingFirebaseConfig = REQUIRED_KEYS.filter(
  (key) => !import.meta.env[key]
);

const buildFirebaseConfig = () => ({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const getFirebaseConfig = () => {
  if (missingFirebaseConfig.length) {
    console.error(
      `[Firebase] Missing config keys: ${missingFirebaseConfig.join(", ")}`
    );
    throw new Error(
      "Firebase config missing. Please create frontend/.env and add required VITE_FIREBASE_* variables."
    );
  }
  return buildFirebaseConfig();
};

export default getFirebaseConfig;

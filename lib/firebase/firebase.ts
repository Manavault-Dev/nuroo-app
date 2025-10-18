import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Access environment variables directly - they are embedded at build time by Expo
// EXPO_PUBLIC_ prefixed variables are available via process.env in both dev and production
const EXPO_PUBLIC_FIREBASE_API_KEY = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN =
  process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
const EXPO_PUBLIC_FIREBASE_PROJECT_ID =
  process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
const EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET =
  process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
const EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID =
  process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const EXPO_PUBLIC_FIREBASE_APP_ID = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;
const EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID =
  process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID;

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredFields = {
    apiKey: EXPO_PUBLIC_FIREBASE_API_KEY,
    projectId: EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    appId: EXPO_PUBLIC_FIREBASE_APP_ID,
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    const errorMessage = `❌ Firebase configuration error: Missing required fields: ${missingFields.join(', ')}. Please check your environment variables in EAS secrets or eas.json.`;
    console.error(errorMessage);
    console.error('All env vars:', {
      apiKey: EXPO_PUBLIC_FIREBASE_API_KEY
        ? `${EXPO_PUBLIC_FIREBASE_API_KEY.substring(0, 10)}...`
        : 'MISSING',
      authDomain: EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'MISSING',
      projectId: EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING',
      storageBucket: EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'MISSING',
      messagingSenderId: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'MISSING',
      appId: EXPO_PUBLIC_FIREBASE_APP_ID
        ? `${EXPO_PUBLIC_FIREBASE_APP_ID.substring(0, 15)}...`
        : 'MISSING',
      measurementId: EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'MISSING',
    });
    throw new Error(errorMessage);
  }
};

// Validate before initializing
validateFirebaseConfig();

const firebaseConfig = {
  apiKey: EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log('🔥 Initializing Firebase...');
console.log('  Project ID:', EXPO_PUBLIC_FIREBASE_PROJECT_ID);
console.log(
  '  API Key:',
  EXPO_PUBLIC_FIREBASE_API_KEY
    ? `${EXPO_PUBLIC_FIREBASE_API_KEY.substring(0, 10)}...`
    : 'MISSING',
);
console.log(
  '  App ID:',
  EXPO_PUBLIC_FIREBASE_APP_ID
    ? `${EXPO_PUBLIC_FIREBASE_APP_ID.substring(0, 15)}...`
    : 'MISSING',
);

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

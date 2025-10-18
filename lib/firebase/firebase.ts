import Constants from 'expo-constants';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const {
  EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID,
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
} = Constants.expoConfig?.extra ?? {};

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

console.log(
  '🔥 Initializing Firebase with project:',
  EXPO_PUBLIC_FIREBASE_PROJECT_ID,
);

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

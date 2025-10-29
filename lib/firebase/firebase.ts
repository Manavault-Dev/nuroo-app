import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, type Persistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// AsyncStorage persistence will be automatically set up by Firebase
// when it detects React Native environment and AsyncStorage package

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

declare global {
  // eslint-disable-next-line no-var
  var __firebaseAuth:
    | ReturnType<typeof initializeAuth>
    | ReturnType<typeof getAuth>
    | undefined;
}

// Try to get React Native persistence helper or create our own
let getReactNativePersistenceFn:
  | ((storage: typeof AsyncStorage) => Persistence)
  | null = null;

try {
  // Try to import from firebase/auth (may not be available in v12)
  const authModule = require('firebase/auth');
  if (authModule.getReactNativePersistence) {
    getReactNativePersistenceFn = authModule.getReactNativePersistence;
    console.log('✅ Found getReactNativePersistence in firebase/auth');
  }
} catch {
  // Continue with fallback
}

// Fallback: Create React Native persistence that matches Firebase's expected interface
if (!getReactNativePersistenceFn) {
  getReactNativePersistenceFn = (storage: typeof AsyncStorage): Persistence => {
    return {
      type: 'LOCAL' as const,
      async _isAvailable() {
        try {
          await storage.setItem('__firebase_availability_check__', '1');
          await storage.removeItem('__firebase_availability_check__');
          return true;
        } catch {
          return false;
        }
      },
      async _set(key: string, value: unknown) {
        await storage.setItem(key, JSON.stringify(value));
      },
      async _get<T>(key: string) {
        const json = await storage.getItem(key);
        return json ? (JSON.parse(json) as T) : null;
      },
      async _remove(key: string) {
        await storage.removeItem(key);
      },
      _addListener() {
        // Not supported in React Native
      },
      _removeListener() {
        // Not supported in React Native
      },
    } as Persistence;
  };
}

const getReactNativeAuth = () => {
  if (!globalThis.__firebaseAuth) {
    try {
      // Initialize Auth with AsyncStorage persistence for React Native
      const persistence = getReactNativePersistenceFn!(AsyncStorage);
      globalThis.__firebaseAuth = initializeAuth(app, {
        persistence,
      });
      console.log('✅ Auth initialized with AsyncStorage persistence');
    } catch (error: any) {
      // If already initialized (e.g., hot reload during development), use getAuth
      if (
        error.code === 'auth/already-initialized' ||
        error.message?.includes('already-initialized')
      ) {
        console.log('⚠️ Auth already initialized (hot reload), using getAuth');
        globalThis.__firebaseAuth = getAuth(app);
      } else {
        console.error('❌ Error initializing auth:', error);
        // Fallback to getAuth if initialization fails
        try {
          globalThis.__firebaseAuth = getAuth(app);
          console.log(
            '⚠️ Fallback: Using getAuth (persistence may be limited)',
          );
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
          throw error;
        }
      }
    }
  }

  return globalThis.__firebaseAuth;
};

export const auth = Platform.OS === 'web' ? getAuth(app) : getReactNativeAuth();

export const db = getFirestore(app);

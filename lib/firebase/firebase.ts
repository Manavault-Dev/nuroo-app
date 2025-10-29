import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, type Persistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Environment detection
const isExpoGo = Constants.appOwnership === 'expo';
const isDevelopment = __DEV__;

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
  var __firebaseAuth: ReturnType<typeof initializeAuth> | undefined;
  var __firebaseAuthInitialized: boolean | undefined;
}

// Try to get React Native persistence helper or create our own
let getReactNativePersistenceFn:
  | ((storage: typeof AsyncStorage) => Persistence)
  | null = null;

try {
  // Try dynamic import to check if getReactNativePersistence is available
  const authModule = require('firebase/auth');
  if (typeof authModule.getReactNativePersistence === 'function') {
    getReactNativePersistenceFn = authModule.getReactNativePersistence;
    console.log('✅ Found getReactNativePersistence in firebase/auth');
  }
} catch (e) {
  console.log('⚠️ Could not access firebase/auth module:', e);
}

// Fallback: Create React Native persistence that matches Firebase's expected interface
if (!getReactNativePersistenceFn) {
  console.log('🔧 Using fallback persistence implementation');
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

// Single initialization function - prevents duplicate instances
const initializeReactNativeAuth = () => {
  // Prevent multiple initializations
  if (globalThis.__firebaseAuthInitialized && globalThis.__firebaseAuth) {
    console.log('♻️ Reusing existing Firebase Auth instance');
    return globalThis.__firebaseAuth;
  }

  try {
    // Always use initializeAuth with persistence for React Native
    const persistence = getReactNativePersistenceFn!(AsyncStorage);
    globalThis.__firebaseAuth = initializeAuth(app, {
      persistence,
    });
    globalThis.__firebaseAuthInitialized = true;
    console.log('🔐 Firebase persistence active');
    console.log(`📍 Environment: ${isExpoGo ? 'Expo Go' : 'EAS Build'}`);
    return globalThis.__firebaseAuth;
  } catch (error: any) {
    // If already initialized, try to get the existing instance
    if (
      error.code === 'auth/already-initialized' ||
      error.message?.includes('already-initialized') ||
      error.message?.includes('INTERNAL ASSERTION')
    ) {
      console.log(
        '⚠️ Auth already initialized, attempting to get existing instance',
      );

      // Try to get existing auth instance
      try {
        // Check if auth.currentUser exists (means instance was created)
        const existingAuth = getAuth(app);
        globalThis.__firebaseAuth = existingAuth as ReturnType<
          typeof initializeAuth
        >;
        globalThis.__firebaseAuthInitialized = true;
        console.log(
          '⚠️ Using fallback: getAuth (may have limited persistence)',
        );
        return globalThis.__firebaseAuth;
      } catch (getError: any) {
        console.error('❌ Could not get existing auth instance:', getError);
        throw error;
      }
    } else {
      console.error('❌ Error initializing Firebase Auth:', error);
      throw error;
    }
  }
};

// Export single auth instance - prevents duplicates
export const auth =
  Platform.OS === 'web' ? getAuth(app) : initializeReactNativeAuth();

export const db = getFirestore(app);

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, type Persistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

console.log('🔥 [FIREBASE] Module loading started...');

const isExpoGo = (() => {
  console.log('🔍 [FIREBASE] Checking if Expo Go...');
  let result = false;
  try {
    if (
      Constants.ExecutionEnvironment &&
      Constants.executionEnvironment ===
        Constants.ExecutionEnvironment.StoreClient
    ) {
      console.log('✅ [FIREBASE] Detected Expo Go (StoreClient)');
      return true;
    }
  } catch (e) {
    console.log('⚠️ [FIREBASE] ExecutionEnvironment check failed');
  }

  try {
    if (Constants.appOwnership === 'expo') {
      console.log('✅ [FIREBASE] Detected Expo Go (appOwnership)');
      return true;
    }
  } catch (e) {
    console.log('⚠️ [FIREBASE] appOwnership check failed');
  }

  console.log('✅ [FIREBASE] Not Expo Go - production mode');
  return false;
})();
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

const validateFirebaseConfig = () => {
  console.log('🔍 [FIREBASE] Validating Firebase config...');

  const requiredFields = {
    apiKey: EXPO_PUBLIC_FIREBASE_API_KEY,
    projectId: EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    appId: EXPO_PUBLIC_FIREBASE_APP_ID,
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  console.log('🔍 [FIREBASE] Config check:', {
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

  if (missingFields.length > 0) {
    const errorMessage = `❌ Firebase configuration error: Missing required fields: ${missingFields.join(', ')}. Please check your environment variables in EAS secrets or eas.json.`;
    console.error('❌ [FIREBASE]', errorMessage);
    throw new Error(errorMessage);
  }

  console.log('✅ [FIREBASE] Config validation passed');
};

try {
  validateFirebaseConfig();
} catch (error) {
  console.error('❌ [FIREBASE] CRITICAL: Config validation failed!', error);
  throw error;
}

const firebaseConfig = {
  apiKey: EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log('🔥 [FIREBASE] Initializing Firebase app...');
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

export const app = (() => {
  try {
    console.log('📦 [FIREBASE] Calling initializeApp...');
    const appInstance = initializeApp(firebaseConfig);
    console.log('✅ [FIREBASE] Firebase app initialized successfully');
    return appInstance;
  } catch (error) {
    console.error(
      '❌ [FIREBASE] CRITICAL: Failed to initialize Firebase!',
      error,
    );
    throw error;
  }
})();

declare global {
  // eslint-disable-next-line no-var
  var __firebaseAuth: ReturnType<typeof initializeAuth> | undefined;
  var __firebaseAuthInitialized: boolean | undefined;
}

let getReactNativePersistenceFn:
  | ((storage: typeof AsyncStorage) => Persistence)
  | null = null;

try {
  const authModule = require('firebase/auth');
  if (typeof authModule.getReactNativePersistence === 'function') {
    getReactNativePersistenceFn = authModule.getReactNativePersistence;
    if (__DEV__) {
      console.log('✅ Found getReactNativePersistence in firebase/auth');
    }
  }
} catch (e) {
  if (__DEV__) {
    console.log('⚠️ Could not access firebase/auth module:', e);
  }
}

if (!getReactNativePersistenceFn) {
  if (__DEV__) {
    console.log('🔧 Using fallback persistence implementation');
  }
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
        try {
          await storage.setItem(key, JSON.stringify(value));
        } catch (error) {
          if (__DEV__) {
            console.error('❌ Error in persistence._set:', error);
          }
        }
      },
      async _get<T>(key: string) {
        try {
          const json = await storage.getItem(key);
          if (!json) return null;
          return JSON.parse(json) as T;
        } catch (error) {
          if (__DEV__) {
            console.error('❌ Error in persistence._get:', error);
          }
          return null;
        }
      },
      async _remove(key: string) {
        try {
          await storage.removeItem(key);
        } catch (error) {
          if (__DEV__) {
            console.error('❌ Error in persistence._remove:', error);
          }
        }
      },
      _addListener() {},
      _removeListener() {},
    } as Persistence;
  };
}

const initializeReactNativeAuth = () => {
  if (globalThis.__firebaseAuthInitialized && globalThis.__firebaseAuth) {
    if (__DEV__) {
      console.log('♻️ Reusing existing Firebase Auth instance');
    }
    return globalThis.__firebaseAuth;
  }

  try {
    const persistence = getReactNativePersistenceFn!(AsyncStorage);
    globalThis.__firebaseAuth = initializeAuth(app, {
      persistence,
    });
    globalThis.__firebaseAuthInitialized = true;
    if (__DEV__) {
      console.log('🔐 Firebase persistence active');
      console.log(`📍 Environment: ${isExpoGo ? 'Expo Go' : 'EAS Build'}`);
    }
    return globalThis.__firebaseAuth;
  } catch (error: any) {
    if (
      error.code === 'auth/already-initialized' ||
      error.message?.includes('already-initialized') ||
      error.message?.includes('INTERNAL ASSERTION')
    ) {
      if (__DEV__) {
        console.log(
          '⚠️ Auth already initialized, attempting to get existing instance',
        );
      }

      try {
        const existingAuth = getAuth(app);
        globalThis.__firebaseAuth = existingAuth as ReturnType<
          typeof initializeAuth
        >;
        globalThis.__firebaseAuthInitialized = true;
        if (__DEV__) {
          console.log(
            '⚠️ Using fallback: getAuth (may have limited persistence)',
          );
        }
        return globalThis.__firebaseAuth;
      } catch (getError: any) {
        if (__DEV__) {
          console.error('❌ Could not get existing auth instance:', getError);
        }
        throw error;
      }
    } else {
      if (__DEV__) {
        console.error('❌ Error initializing Firebase Auth:', error);
      }
      throw error;
    }
  }
};
console.log('🔐 [FIREBASE] Initializing auth...');
console.log('   Platform:', Platform.OS);

export const auth: ReturnType<typeof initializeAuth> = (() => {
  try {
    const authInstance =
      Platform.OS === 'web' ? getAuth(app) : initializeReactNativeAuth();
    console.log('✅ [FIREBASE] Auth initialized and exported');
    return authInstance as ReturnType<typeof initializeAuth>;
  } catch (error) {
    console.error('❌ [FIREBASE] CRITICAL: Auth init failed!', error);
    throw error;
  }
})();

console.log('📊 [FIREBASE] Initializing Firestore...');
export const db = (() => {
  try {
    const dbInstance = getFirestore(app);
    console.log('✅ [FIREBASE] Firestore initialized');
    return dbInstance;
  } catch (error) {
    console.error('❌ [FIREBASE] Firestore init failed!', error);
    throw error;
  }
})();

console.log('✅✅✅ [FIREBASE] MODULE FULLY LOADED ✅✅✅');

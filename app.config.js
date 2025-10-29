import 'dotenv/config';

const getEnvVar = (key) => process.env[key] ?? undefined;

const requiredEnvVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

const missingEnvVars = requiredEnvVars.filter((v) => !getEnvVar(v));
if (missingEnvVars.length > 0 && process.env.NODE_ENV !== 'development') {
  console.warn('⚠️ Missing Firebase env vars:', missingEnvVars.join(', '));
}

export default {
  expo: {
    name: 'Nuroo',
    slug: 'nuroo',
    scheme: 'nuroo',
    version: '1.0.9',
    orientation: 'portrait',
    icon: './assets/images/logo-bg.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/images/logo-bg.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],

    ios: {
      bundleIdentifier: 'nuroo.app',
      buildNumber: '8',
      jsEngine: 'jsc',
      supportsTablet: true,
      infoPlist: { ITSAppUsesNonExemptEncryption: false },
    },

    android: {
      package: 'nuroo.app',
      versionCode: 8,
      adaptiveIcon: {
        foregroundImage: './assets/images/logo-bg.png',
        backgroundColor: '#ffffff',
      },
      softwareKeyboardLayoutMode: 'resize',
    },

    plugins: [
      'expo-router',
      [
        'expo-notifications',
        { icon: './assets/images/logo-bg.png', color: '#ffffff' },
      ],
    ],

    extra: {
      eas: { projectId: '195d92c9-ef3a-4c31-ab02-bddee8cc627d' },

      // Firebase configuration
      EXPO_PUBLIC_FIREBASE_API_KEY: getEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY'),
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: getEnvVar(
        'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
      ),
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: getEnvVar(
        'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
      ),
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: getEnvVar(
        'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
      ),
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: getEnvVar(
        'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      ),
      EXPO_PUBLIC_FIREBASE_APP_ID: getEnvVar('EXPO_PUBLIC_FIREBASE_APP_ID'),
      EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: getEnvVar(
        'EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID',
      ),

      // App configuration
      EXPO_PUBLIC_FEEDBACK_EMAIL: getEnvVar('EXPO_PUBLIC_FEEDBACK_EMAIL'),
      EXPO_PUBLIC_PRIVACY_URL: getEnvVar('EXPO_PUBLIC_PRIVACY_URL'),
      EXPO_PUBLIC_HELP_URL: getEnvVar('EXPO_PUBLIC_HELP_URL'),

      // OpenAI configuration
      EXPO_PUBLIC_OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY'),
      EXPO_PUBLIC_OPENAI_PROJECT_ID: getEnvVar('OPENAI_PROJECT_ID'),
    },
  },
};

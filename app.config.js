import 'dotenv/config';

export default {
  expo: {
    name: 'Nuroo',
    slug: 'nuroo',
    scheme: 'nuroo',
    version: '1.0.0',

    ios: {
      bundleIdentifier: 'com.nuroo.app',
      buildNumber: '1',
      supportsTablet: true,
    },
    android: {
      package: 'com.nuroo.app',
      versionCode: 1,
    },

    owner: 'tilecho',

    plugins: ['expo-router'],

    extra: {
      // OPEN AI
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_PROJECT_ID: process.env.OPENAI_PROJECT_ID,

      // FIREBASE
      EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN:
        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      EXPO_PUBLIC_FIREBASE_PROJECT_ID:
        process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET:
        process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID:
        process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,

      // Custom URLs and email for ProfileScreen
      APP_STORE_URL: process.env.APP_STORE_URL,
      FEEDBACK_EMAIL: process.env.FEEDBACK_EMAIL,
      PRIVACY_URL: process.env.PRIVACY_URL,
      HELP_URL: process.env.HELP_URL,

      eas: {
        projectId: '195d92c9-ef3a-4c31-ab02-bddee8cc627d',
      },
    },
  },
};

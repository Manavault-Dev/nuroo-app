import 'dotenv/config';

export default {
  expo: {
    name: 'Nuroo',
    slug: 'nuroo',
    scheme: 'nuroo',
    version: '1.0.0',
    extra: {
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
    },
  },
};

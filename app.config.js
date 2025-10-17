import 'dotenv/config';

// Validate required environment variables
const requiredEnvVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName],
);
if (missingEnvVars.length > 0 && process.env.NODE_ENV !== 'development') {
  console.warn(
    '⚠️  Missing required environment variables:',
    missingEnvVars.join(', '),
  );
}

export default {
  expo: {
    name: 'Nuroo',
    slug: 'nuroo',
    scheme: 'nuroo',
    version: '1.0.5',
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
      buildNumber: '3',
      supportsTablet: true,
      jsEngine: 'jsc',
      infoPlist: {
        NSUserTrackingUsageDescription:
          'This app uses data to provide personalized development plans for your child.',
        NSCameraUsageDescription: 'Camera access is not required for this app.',
        NSMicrophoneUsageDescription:
          'Microphone access is not required for this app.',
        NSLocationWhenInUseUsageDescription:
          'Location access is not required for this app.',
        NSContactsUsageDescription:
          'Contacts access is not required for this app.',
        NSPhotoLibraryUsageDescription:
          'Photo library access is not required for this app.',
      },
    },
    android: {
      package: 'nuroo.app',
      versionCode: 3,
      adaptiveIcon: {
        foregroundImage: './assets/images/logo-bg.png',
        backgroundColor: '#ffffff',
      },
      permissions: [
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
        'android.permission.WAKE_LOCK',
        'android.permission.VIBRATE',
        'android.permission.RECEIVE_BOOT_COMPLETED',
        'android.permission.POST_NOTIFICATIONS',
      ],
      softwareKeyboardLayoutMode: 'resize',
    },
    web: {
      favicon: './assets/images/favicon.png',
      bundler: 'metro',
    },
    owner: 'tilecho',
    privacy: 'public',
    category: 'education',
    keywords: [
      'children',
      'development',
      'special needs',
      'autism',
      'ADHD',
      'parenting',
      'education',
      'therapy',
    ],
    description:
      'Nuroo helps parents support children with special needs through personalized AI-driven development plans, progress tracking, and expert guidance.',
    plugins: [
      'expo-router',
      'expo-web-browser',
      'expo-font',
      [
        'expo-notifications',
        {
          icon: './assets/images/logo-bg.png',
          color: '#ffffff',
        },
      ],
    ],

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

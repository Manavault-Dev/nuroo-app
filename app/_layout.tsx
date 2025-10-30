// External Imports
import Constants from 'expo-constants';
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Internal Imports
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import { AuthProvider } from '@/features/auth/AuthContext';
import { useAuthDebug } from '@/hooks/useAuthDebug';
import '@/i18n/i18n';
import { NotificationService } from '@/lib/services/notificationService';

const isExpoGo = (() => {
  try {
    if (
      Constants.ExecutionEnvironment &&
      Constants.executionEnvironment ===
        Constants.ExecutionEnvironment.StoreClient
    ) {
      return true;
    }
  } catch {}

  try {
    if (Constants.appOwnership === 'expo') {
      return true;
    }
  } catch {}

  return false;
})();

export default function RootLayout() {
  useAuthDebug();

  useEffect(() => {
    try {
      const globalAny = global as any;
      if (
        globalAny.ErrorUtils &&
        typeof globalAny.ErrorUtils.setGlobalHandler === 'function'
      ) {
        globalAny.ErrorUtils.setGlobalHandler(
          (error: unknown, isFatal?: boolean) => {
            if (__DEV__) {
              console.error('🔥 GLOBAL JS ERROR:', error, 'fatal:', !!isFatal);
            }
          },
        );
      }
    } catch {}

    if (__DEV__) {
      console.log('📱 App Environment:', {
        isExpoGo,
        isDevelopment: __DEV__,
        platform: Constants.platform?.ios
          ? 'iOS'
          : Constants.platform?.android
            ? 'Android'
            : 'Web',
      });
    }

    const initializeApp = async () => {
      try {
        if (__DEV__) console.log('🚀 Initializing app services...');
        await NotificationService.requestPermissions();
        await NotificationService.scheduleDailyNotification();
        if (__DEV__) console.log('✅ App services initialized');
      } catch (error) {
        if (__DEV__)
          console.error('❌ Error initializing app services:', error);
      }
    };

    initializeApp();

    if (__DEV__) {
      console.log('🔔 Setting up notification listeners...');
    }
    const cleanupNotificationListeners =
      NotificationService.setupNotificationListeners();

    return () => {
      if (cleanupNotificationListeners) {
        cleanupNotificationListeners();
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <Slot />
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

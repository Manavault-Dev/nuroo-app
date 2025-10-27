// External Imports
import Constants from 'expo-constants';
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Internal Imports
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import { AuthProvider } from '@/features/auth/AuthContext';
import '@/i18n/i18n';
import { NotificationService } from '@/lib/services/notificationService';

const isExpoGo = Constants.appOwnership === 'expo';

export default function RootLayout() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing app services...');
        await NotificationService.requestPermissions();
        await NotificationService.scheduleDailyNotification();
        console.log('✅ App services initialized');
      } catch (error) {
        console.error('❌ Error initializing app services:', error);
      }
    };

    initializeApp();

    console.log('🔔 Setting up notification listeners...');
    const cleanupNotificationListeners =
      NotificationService.setupNotificationListeners();

    return () => {
      console.log('🔔 Cleaning up notification listeners...');
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

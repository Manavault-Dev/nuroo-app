import { AuthProvider } from '@/context/AuthContext';
import '@/i18n/i18n';
import { NotificationService } from '@/lib/services/notificationService';
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import * as Notifications from 'expo-notifications';
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  useEffect(() => {
    // Initialize notifications (without background tasks for now)
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing app services...');

        // Request notification permissions
        await NotificationService.requestPermissions();

        // Schedule daily notifications
        await NotificationService.scheduleDailyNotification();

        // Note: Background tasks require iOS configuration
        // await NotificationService.initializeBackgroundTask();

        console.log('✅ App services initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing app services:', error);
      }
    };

    initializeApp();

    // Set up notification response handler
    const subscription = Notifications.addNotificationResponseReceivedListener(
      NotificationService.handleNotificationResponse,
    );

    return () => {
      subscription.remove();
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

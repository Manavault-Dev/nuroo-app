import { AuthProvider } from '@/features/auth/AuthContext';
import '@/i18n/i18n';
import { NotificationService } from '@/lib/services/notificationService';
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import * as Notifications from 'expo-notifications';
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await NotificationService.requestPermissions();

        await NotificationService.scheduleDailyNotification();
      } catch (error) {
        console.error('❌ Error initializing app services:', error);
      }
    };

    initializeApp();

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

import { AuthProvider } from '@/features/auth/AuthContext';
import '@/i18n/i18n';
import { NotificationService } from '@/lib/services/notificationService';
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import Constants from 'expo-constants';
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Check if we're in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

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

    // Only set up notification listener if not in Expo Go
    let subscription: any = null;
    if (!isExpoGo) {
      try {
        const Notifications = require('expo-notifications');
        subscription = Notifications.addNotificationResponseReceivedListener(
          NotificationService.handleNotificationResponse,
        );
      } catch (error) {
        console.warn('⚠️ Notification listener not available:', error);
      }
    }

    return () => {
      if (subscription) {
        subscription.remove();
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

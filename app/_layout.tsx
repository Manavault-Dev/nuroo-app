// External Imports
import Constants from 'expo-constants';
import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Internal Imports
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import { AuthProvider } from '@/features/auth/AuthContext';
import { NotificationService } from '@/lib/services/notificationService';

// Safely load i18n
try {
  require('@/i18n/i18n');
} catch (error) {
  console.warn('⚠️ i18n failed to load:', error);
}

// Safely check for Expo Go
let isExpoGo = false;
try {
  isExpoGo =
    Constants?.appOwnership === 'expo' ||
    Constants?.executionEnvironment === 'storeClient';
} catch (error) {
  console.warn('⚠️ Constants check failed:', error);
}

// Set up global error handler IMMEDIATELY
try {
  const globalAny = global as any;
  if (
    globalAny.ErrorUtils &&
    typeof globalAny.ErrorUtils.setGlobalHandler === 'function'
  ) {
    globalAny.ErrorUtils.setGlobalHandler(
      (error: unknown, isFatal?: boolean) => {
        console.error('🔥 CAUGHT GLOBAL ERROR:', error);
        console.error('   Fatal:', !!isFatal);
        console.error('   Stack:', (error as any)?.stack);

        // DON'T crash the app - just log
        return;
      },
    );
  }
} catch (error) {
  console.error('⚠️ Failed to set global error handler:', error);
}

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('📱 App Environment:', {
          isExpoGo,
          isDevelopment: __DEV__,
          platform: Constants?.platform?.ios
            ? 'iOS'
            : Constants?.platform?.android
              ? 'Android'
              : 'Web',
        });

        // Small delay to ensure everything is ready
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!isExpoGo) {
          try {
            console.log('🚀 Initializing app services...');

            // Add delay to ensure all modules are loaded
            await new Promise((resolve) => setTimeout(resolve, 500));

            await NotificationService.requestPermissions();
            await NotificationService.scheduleDailyNotification();
            console.log('✅ App services initialized');
          } catch (error) {
            console.warn('⚠️ Non-critical error with notifications:', error);
          }
        }

        setAppReady(true);
      } catch (error) {
        console.error('❌ App initialization error:', error);
        setInitError((error as any)?.message || 'Unknown initialization error');
        // Still mark as ready to show something to the user
        setAppReady(true);
      }
    };

    initApp();

    let cleanupNotificationListeners: (() => void) | null = null;

    if (!isExpoGo) {
      try {
        console.log('🔔 Setting up notification listeners...');
        cleanupNotificationListeners =
          NotificationService.setupNotificationListeners();
      } catch (error) {
        console.warn('⚠️ Error setting up notification listeners:', error);
      }
    }

    return () => {
      if (cleanupNotificationListeners) {
        try {
          cleanupNotificationListeners();
        } catch (error) {
          console.warn('⚠️ Error cleaning up:', error);
        }
      }
    };
  }, []);

  if (!appReady) {
    return (
      <SafeAreaProvider>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
          }}
        >
          <ActivityIndicator size="large" color="#1E266D" />
          <Text style={{ marginTop: 16, color: '#666' }}>Loading Nuroo...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (initError) {
    return (
      <SafeAreaProvider>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#FF0000',
              marginBottom: 10,
            }}
          >
            Initialization Error
          </Text>
          <Text style={{ color: '#666', textAlign: 'center' }}>
            {initError}
          </Text>
          <Text
            style={{
              marginTop: 20,
              color: '#999',
              textAlign: 'center',
              fontSize: 12,
            }}
          >
            Please restart the app
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

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

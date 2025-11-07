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

console.log('🚀 [ROOT] Module loading started...');

// Safely load i18n
try {
  console.log('📚 [ROOT] Loading i18n...');
  require('@/i18n/i18n');
  console.log('✅ [ROOT] i18n loaded successfully');
} catch (error) {
  console.error('❌ [ROOT] i18n failed to load:', error);
}

// Safely check for Expo Go
let isExpoGo = false;
try {
  console.log('🔍 [ROOT] Checking environment...');
  isExpoGo =
    Constants?.appOwnership === 'expo' ||
    Constants?.executionEnvironment === 'storeClient';
  console.log('✅ [ROOT] Environment check done. isExpoGo:', isExpoGo);
} catch (error) {
  console.error('❌ [ROOT] Constants check failed:', error);
}

// Set up global error handler IMMEDIATELY
try {
  console.log('🛡️ [ROOT] Setting up global error handler...');
  const globalAny = global as any;
  if (
    globalAny.ErrorUtils &&
    typeof globalAny.ErrorUtils.setGlobalHandler === 'function'
  ) {
    globalAny.ErrorUtils.setGlobalHandler(
      (error: unknown, isFatal?: boolean) => {
        console.error('🔥🔥🔥 CAUGHT GLOBAL ERROR 🔥🔥🔥');
        console.error('Error:', error);
        console.error('Fatal:', !!isFatal);
        console.error('Message:', (error as any)?.message);
        console.error('Stack:', (error as any)?.stack);
        console.error('🔥🔥🔥 END ERROR LOG 🔥🔥🔥');

        // DON'T crash the app - just log
        // Returning nothing prevents the crash
      },
    );
    console.log('✅ [ROOT] Global error handler installed successfully');
  } else {
    console.warn('⚠️ [ROOT] ErrorUtils not available');
  }
} catch (error) {
  console.error('❌ [ROOT] Failed to set global error handler:', error);
}

console.log('✅ [ROOT] Module initialization complete');

export default function RootLayout() {
  console.log('🏁 [ROOT] RootLayout component starting...');

  const [appReady, setAppReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    console.log('⚡ [ROOT] useEffect triggered');

    const initApp = async () => {
      try {
        console.log('📱 [INIT] Starting app initialization...');
        console.log('📱 [INIT] Environment:', {
          isExpoGo,
          isDevelopment: __DEV__,
          platform: Constants?.platform?.ios
            ? 'iOS'
            : Constants?.platform?.android
              ? 'Android'
              : 'Web',
        });

        console.log('⏱️ [INIT] Waiting 100ms for modules to settle...');
        await new Promise((resolve) => setTimeout(resolve, 100));
        console.log('✅ [INIT] Initial delay complete');

        if (!isExpoGo) {
          try {
            console.log('🚀 [INIT] Initializing app services (not Expo Go)...');
            console.log('⏱️ [INIT] Waiting 500ms for notification modules...');
            await new Promise((resolve) => setTimeout(resolve, 500));
            console.log('✅ [INIT] Notification delay complete');
            console.log('🔔 [INIT] Requesting notification permissions...');
            await NotificationService.requestPermissions();
            console.log('✅ [INIT] Permissions requested');
            console.log('📅 [INIT] Scheduling daily notification...');
            await NotificationService.scheduleDailyNotification();
            console.log('✅ [INIT] Daily notification scheduled');
            console.log('✅ [INIT] App services initialized successfully');
          } catch (error) {
            console.error(
              '⚠️ [INIT] Non-critical error with notifications:',
              error,
            );
            console.error('   Error message:', (error as any)?.message);
          }
        } else {
          console.log('⏭️ [INIT] Skipping notifications (Expo Go)');
        }

        console.log('✅ [INIT] Setting appReady to true...');
        setAppReady(true);
        console.log('✅ [INIT] App initialization complete!');
      } catch (error) {
        console.error('❌ [INIT] CRITICAL: App initialization error:', error);
        console.error('   Error message:', (error as any)?.message);
        console.error('   Error stack:', (error as any)?.stack);
        setInitError((error as any)?.message || 'Unknown initialization error');
        // Still mark as ready to show something to the user
        setAppReady(true);
      }
    };

    console.log('🏃 [ROOT] Calling initApp...');
    initApp();

    let cleanupNotificationListeners: (() => void) | null = null;

    if (!isExpoGo) {
      try {
        console.log('🔔 [ROOT] Setting up notification listeners...');
        cleanupNotificationListeners =
          NotificationService.setupNotificationListeners();
        console.log('✅ [ROOT] Notification listeners set up');
      } catch (error) {
        console.error(
          '⚠️ [ROOT] Error setting up notification listeners:',
          error,
        );
      }
    }

    return () => {
      console.log('🧹 [ROOT] Cleanup function called');
      if (cleanupNotificationListeners) {
        try {
          cleanupNotificationListeners();
          console.log('✅ [ROOT] Cleaned up notification listeners');
        } catch (error) {
          console.error('⚠️ [ROOT] Error cleaning up:', error);
        }
      }
    };
  }, []);

  console.log(
    '🎨 [ROOT] Rendering... appReady:',
    appReady,
    'initError:',
    !!initError,
  );

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

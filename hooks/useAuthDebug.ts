import { auth } from '@/lib/firebase/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useEffect } from 'react';

/**
 * Debug hook for monitoring auth state transitions
 * Only use in development mode
 */
export function useAuthDebug() {
  useEffect(() => {
    if (!__DEV__) {
      return; // Only run in development
    }

    console.log('🧩 [Auth Debug] Listening to auth state...');
    console.log(
      '📍 Environment:',
      Constants.appOwnership === 'expo' ? 'Expo Go' : 'EAS Build',
    );

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('🔄 [Auth Debug] Firebase user:', user?.email || 'none');
      console.log('🆔 [Auth Debug] User ID:', user?.uid || 'none');

      // Log all AsyncStorage keys related to auth
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const authKeys = allKeys.filter(
          (key) =>
            key.includes('auth') ||
            key.includes('firebase') ||
            key.includes('user') ||
            key.includes('token') ||
            key.includes('@nuroo'),
        );
        console.log('💾 [Auth Debug] AsyncStorage auth keys:', authKeys);

        // Log cached user if exists
        const cachedUser = await AsyncStorage.getItem('@nuroo_cached_user');
        if (cachedUser) {
          const userData = JSON.parse(cachedUser);
          console.log('🧠 [Auth Debug] Cached user data:', {
            email: userData.email,
            uid: userData.uid,
          });
        }
      } catch (error) {
        console.error('❌ [Auth Debug] Error reading AsyncStorage:', error);
      }
    });

    // Log initial state
    console.log(
      '🔍 [Auth Debug] Initial Firebase user:',
      auth.currentUser?.email || 'none',
    );
    console.log(
      '🔍 [Auth Debug] Auth instance ID:',
      auth.app?.name || 'default',
    );

    return () => {
      console.log('🧩 [Auth Debug] Cleaning up listener');
      unsubscribe();
    };
  }, []);
}

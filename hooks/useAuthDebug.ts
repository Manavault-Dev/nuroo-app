import { auth } from '@/lib/firebase/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useEffect } from 'react';

export function useAuthDebug() {
  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    console.log('🧩 [Auth Debug] Listening to auth state...');
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
    console.log('📍 Environment:', isExpoGo ? 'Expo Go' : 'EAS Build');

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('🔄 [Auth Debug] Firebase user:', user?.email || 'none');
      console.log('🆔 [Auth Debug] User ID:', user?.uid || 'none');

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

        const cachedUser = await AsyncStorage.getItem('@nuroo_cached_user');
        if (cachedUser) {
          try {
            const userData = JSON.parse(cachedUser);
            console.log('🧠 [Auth Debug] Cached user data:', {
              email: userData.email,
              uid: userData.uid,
            });
          } catch (parseError) {
            console.error(
              '❌ [Auth Debug] Error parsing cached user:',
              parseError,
            );
          }
        }
      } catch (error) {
        console.error('❌ [Auth Debug] Error reading AsyncStorage:', error);
      }
    });

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

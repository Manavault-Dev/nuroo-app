// External Imports
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { onAuthStateChanged, reload, signOut, User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Internal Imports
import { auth } from '@/lib/firebase/firebase';
import {
  clearCorruptedCache,
  safeGetItem,
  safeJSONParse,
  safeRemoveItem,
  safeSetItem,
} from '@/lib/utils/storage';

const CACHE_KEY_USER = '@nuroo_cached_user';
const CACHE_KEY_TOKEN = 'authToken';

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

const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  token: string | null;
  logout: () => Promise<void>;
}>({
  user: null,
  loading: true,
  token: null,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const cacheUserData = async (
    firebaseUser: User | null,
    userToken: string | null,
  ) => {
    try {
      if (firebaseUser && userToken) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        await safeSetItem(CACHE_KEY_USER, JSON.stringify(userData));
        await safeSetItem(CACHE_KEY_TOKEN, userToken);
        if (__DEV__) console.log('💾 Cached user data to AsyncStorage');
      } else {
        await safeRemoveItem(CACHE_KEY_USER);
        await safeRemoveItem(CACHE_KEY_TOKEN);
        if (__DEV__) console.log('🗑️ Cleared user cache from AsyncStorage');
      }
    } catch (error) {
      if (__DEV__) console.error('❌ Error caching user data:', error);
    }
  };

  const loadCachedUser = async () => {
    try {
      const [cachedUserDataRaw, cachedToken] = await Promise.all([
        safeGetItem(CACHE_KEY_USER),
        safeGetItem(CACHE_KEY_TOKEN),
      ]);

      if (cachedUserDataRaw && cachedToken) {
        const userData = safeJSONParse<{
          email?: string;
          uid?: string;
          displayName?: string;
          photoURL?: string;
        }>(cachedUserDataRaw);

        if (!userData) {
          await clearCorruptedCache([CACHE_KEY_USER, CACHE_KEY_TOKEN]);
          return null;
        }

        if (__DEV__) {
          console.log('🧠 Cached user loaded:', userData.email);
          console.log('⚠️ Using fallback AsyncStorage cache');
        }

        setToken(cachedToken);
        return { userData, token: cachedToken };
      }
    } catch (error) {
      if (__DEV__) console.error('❌ Error loading cached user:', error);
      await clearCorruptedCache([CACHE_KEY_USER, CACHE_KEY_TOKEN]);
    }
    return null;
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      if (__DEV__) console.log('🔑 Initializing auth state...');

      const cached = await loadCachedUser();

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!isMounted) return;

        if (__DEV__) {
          console.log(
            '🔄 Firebase user state changed:',
            firebaseUser ? `User: ${firebaseUser.email}` : 'No user',
          );
        }

        try {
          if (firebaseUser) {
            const freshToken = await firebaseUser.getIdToken();
            if (!isMounted) return;

            setUser(firebaseUser);
            setToken(freshToken);
            await cacheUserData(firebaseUser, freshToken);

            if (__DEV__) {
              console.log('🔑 Firebase state restored:', firebaseUser.email);
            }
          } else {
            if (cached && isExpoGo) {
              if (__DEV__) {
                console.log(
                  '⚠️ No Firebase user, but cached user exists - keeping token',
                );
              }
              if (isMounted) {
                setToken(cached.token);
              }
            } else {
              if (isMounted) {
                setUser(null);
                setToken(null);
              }
              await cacheUserData(null, null);
            }
          }
        } catch (error) {
          if (__DEV__) {
            console.error('❌ Error handling auth state change:', error);
          }

          if (cached && isMounted) {
            if (__DEV__) {
              console.log('⚠️ Auth error - using cached user as fallback');
            }
            setToken(cached.token);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      });

      return unsubscribe;
    };

    const unsubscribePromise = initializeAuth();

    return () => {
      isMounted = false;
      unsubscribePromise.then((unsubscribe) => unsubscribe?.());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    try {
      if (__DEV__) console.log('🔄 Logging out user...');

      setUser(null);
      setToken(null);

      await signOut(auth);
      if (__DEV__) console.log('✅ Firebase signOut completed');

      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(
        (key: string) =>
          key.includes('firebase') ||
          key.includes('@nuroo') ||
          key.includes('authToken') ||
          key.includes('auth') ||
          key.startsWith('firebase:'),
      );

      await Promise.all(keysToRemove.map((key: string) => safeRemoveItem(key)));

      if (__DEV__) {
        console.log('🗑️ User state and cache cleared');
        console.log('🧹 Removed keys:', keysToRemove);
      }
    } catch (error) {
      if (__DEV__) console.error('❌ Error signing out:', error);

      setUser(null);
      setToken(null);

      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const keysToRemove = allKeys.filter(
          (key: string) =>
            key.includes('firebase') ||
            key.includes('@nuroo') ||
            key.includes('authToken') ||
            key.includes('auth') ||
            key.startsWith('firebase:'),
        );
        await Promise.all(
          keysToRemove.map((key: string) => safeRemoveItem(key)),
        );
      } catch (clearError) {
        if (__DEV__) {
          console.error('❌ Error clearing cache:', clearError);
        }
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Helper to revalidate auth state
export const revalidateAuth = async () => {
  try {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      await auth.currentUser.getIdToken(true);
      if (__DEV__) {
        console.log('🔁 Revalidated Firebase user:', auth.currentUser.email);
      }
      return true;
    }
    if (__DEV__) console.log('⚠️ No user to revalidate');
    return false;
  } catch (error) {
    if (__DEV__) console.error('❌ Error revalidating auth:', error);
    return false;
  }
};

// External Imports
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { onAuthStateChanged, reload, signOut, User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Internal Imports
import { auth } from '@/lib/firebase/firebase';

// Cache keys
const CACHE_KEY_USER = '@nuroo_cached_user';
const CACHE_KEY_TOKEN = 'authToken';

// Environment detection
const isExpoGo = Constants.appOwnership === 'expo';

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

  // Helper to cache user data for fallback
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
        await AsyncStorage.setItem(CACHE_KEY_USER, JSON.stringify(userData));
        await AsyncStorage.setItem(CACHE_KEY_TOKEN, userToken);
        console.log('💾 Cached user data to AsyncStorage');
      } else {
        await AsyncStorage.removeItem(CACHE_KEY_USER);
        await AsyncStorage.removeItem(CACHE_KEY_TOKEN);
        console.log('🗑️ Cleared user cache from AsyncStorage');
      }
    } catch (error) {
      console.error('❌ Error caching user data:', error);
    }
  };

  // Helper to load cached user as fallback
  const loadCachedUser = async () => {
    try {
      const [cachedUserData, cachedToken] = await Promise.all([
        AsyncStorage.getItem(CACHE_KEY_USER),
        AsyncStorage.getItem(CACHE_KEY_TOKEN),
      ]);

      if (cachedUserData && cachedToken) {
        const userData = JSON.parse(cachedUserData);
        console.log('🧠 Cached user loaded:', userData.email);
        console.log('⚠️ Using fallback AsyncStorage cache');

        // Set temporary state (will be replaced by Firebase if available)
        setToken(cachedToken);

        // Note: We can't recreate a User object, but we can set token
        // Firebase onAuthStateChanged will handle the actual user restoration
        return { userData, token: cachedToken };
      }
    } catch (error) {
      console.error('❌ Error loading cached user:', error);
    }
    return null;
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      console.log('🔑 Initializing auth state...');

      // Load cached user as fallback (for Expo Go / when Firebase persistence fails)
      const cached = await loadCachedUser();

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!isMounted) return;

        console.log(
          '🔄 Firebase user state changed:',
          firebaseUser ? `User: ${firebaseUser.email}` : 'No user',
        );

        try {
          if (firebaseUser) {
            // Firebase persistence worked - user restored
            const freshToken = await firebaseUser.getIdToken();
            setUser(firebaseUser);
            setToken(freshToken);

            // Cache for fallback
            await cacheUserData(firebaseUser, freshToken);
            console.log('🔑 Firebase state restored:', firebaseUser.email);
          } else {
            // No user from Firebase
            // Check if we have cached user (fallback for Expo Go)
            if (cached && isExpoGo) {
              console.log(
                '⚠️ No Firebase user, but cached user exists - keeping token',
              );
              // Keep token from cache
              setToken(cached.token);
            } else {
              // Clear everything
              setUser(null);
              setToken(null);
              await cacheUserData(null, null);
            }
          }
        } catch (error) {
          console.error('❌ Error handling auth state change:', error);

          // On error, try to use cached user if available
          if (cached && isMounted) {
            console.log('⚠️ Auth error - using cached user as fallback');
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
      console.log('🔄 Logging out user...');
      await signOut(auth);
      console.log('✅ Firebase signOut completed');

      // Clear state
      setUser(null);
      setToken(null);

      // Clear all cached data
      await Promise.all([
        AsyncStorage.removeItem(CACHE_KEY_USER),
        AsyncStorage.removeItem(CACHE_KEY_TOKEN),
      ]);
      console.log('🗑️ User state and cache cleared');
    } catch (error) {
      console.error('❌ Error signing out:', error);
      // Still clear local state even if Firebase signOut fails
      setUser(null);
      setToken(null);
      await Promise.all([
        AsyncStorage.removeItem(CACHE_KEY_USER),
        AsyncStorage.removeItem(CACHE_KEY_TOKEN),
      ]);
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
      await auth.currentUser.getIdToken(true); // Force token refresh
      console.log('🔁 Revalidated Firebase user:', auth.currentUser.email);
      return true;
    }
    console.log('⚠️ No user to revalidate');
    return false;
  } catch (error) {
    console.error('❌ Error revalidating auth:', error);
    return false;
  }
};

// External Imports
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

// Internal Imports
import { auth } from '@/lib/firebase/firebase';

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

  useEffect(() => {
    const loadPersistedToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Error loading persisted auth token:', error);
      }
    };

    loadPersistedToken();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log(
        'Auth state changed:',
        firebaseUser ? `User: ${firebaseUser.email}` : 'No user',
      );

      try {
        if (firebaseUser) {
          const freshToken = await firebaseUser.getIdToken();
          setUser(firebaseUser);
          setToken(freshToken);
          // Сохраняем токен в AsyncStorage для персистентности
          await AsyncStorage.setItem('authToken', freshToken);
          console.log('✅ Token saved to AsyncStorage');
        } else {
          // Пользователь вышел - очищаем состояние
          // Токен будет удален в logout(), здесь только очищаем state
          setUser(null);
          setToken(null);
          // Не удаляем токен здесь, только при explicit logout
          // Токен удалится автоматически при вызове signOut() в logout()
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      console.log('🔄 Logging out user...');
      await signOut(auth);
      console.log('Firebase signOut completed');
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem('authToken');
      console.log('User state cleared');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

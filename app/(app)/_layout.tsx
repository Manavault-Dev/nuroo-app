// External Imports
import { Stack, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Internal Imports
import { useAuth } from '@/features/auth/AuthContext';
import { db } from '@/lib/firebase/firebase';

export default function AppLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    if (!loading && !user) {
      if (__DEV__) {
        console.log('🔄 No user after loading - redirecting to welcome');
      }
      router.replace('/welcome');
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (loading) return;

      if (!user) {
        router.replace('/welcome');
        return;
      }

      setCheckingOnboarding(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const isCompleted =
            userData.onboardingCompleted &&
            userData.name &&
            userData.age &&
            userData.diagnosis &&
            userData.developmentAreas;

          setOnboardingCompleted(isCompleted);
          if (__DEV__) {
            console.log(
              '📋 Onboarding status:',
              isCompleted ? 'completed' : 'incomplete',
            );
          }

          if (isCompleted) {
            router.replace('/(tabs)/home');
          } else {
            router.replace('/onboarding');
          }
        } else {
          setOnboardingCompleted(false);
          if (__DEV__) {
            console.log('📋 User document not found');
          }
          router.replace('/onboarding');
        }
      } catch (error) {
        if (__DEV__) {
          console.error('❌ Error checking onboarding:', error);
        }
        setOnboardingCompleted(false);
        router.replace('/onboarding');
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [user, loading, router]);

  if (loading || checkingOnboarding) {
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
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      />
    </SafeAreaProvider>
  );
}

// External Imports
import { Redirect } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Internal Imports
import { useAuth } from '@/features/auth/AuthContext';
import { db } from '@/lib/firebase/firebase';

export default function AppLayout() {
  const { user, loading } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (loading || !user) return;

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
          console.log(
            '📋 Onboarding status:',
            isCompleted ? 'completed' : 'incomplete',
          );
        } else {
          setOnboardingCompleted(false);
          console.log('📋 User document not found');
        }
      } catch (error) {
        console.error('❌ Error checking onboarding:', error);
        setOnboardingCompleted(false);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    if (user) {
      checkOnboarding();
    }
  }, [user, loading]);

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

  if (!user) {
    return <Redirect href="/signin" />;
  }

  // If onboarding not completed, redirect to onboarding
  if (onboardingCompleted === false) {
    console.log('🔄 Redirecting to onboarding');
    return <Redirect href="/onboarding" />;
  }

  // If onboarding is completed, redirect to home (tabs)
  if (onboardingCompleted === true) {
    console.log('🔄 Redirecting to home');
    return <Redirect href="/(tabs)/home" />;
  }

  // Still checking onboarding - show loading
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

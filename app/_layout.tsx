import { AuthProvider, useAuth } from '@/context/AuthTextInput';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = (segments[0] as string) === '(auth)';

    if (!loading) {
      if (!user && !inAuthGroup) {
        router.replace('/signin' as never);
      } else if (user && inAuthGroup) {
        router.replace('/');
      }
    }
  }, [user, loading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProtectedLayout>
          <Stack screenOptions={{ headerShown: false }} />
        </ProtectedLayout>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

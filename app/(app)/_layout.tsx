// External Imports
import { Redirect, Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Internal Imports
import { useAuth } from '@/features/auth/AuthContext';

export default function AppLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/signin" />;
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

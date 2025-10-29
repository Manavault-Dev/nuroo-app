// External Imports
import { Redirect, Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';

// Internal Imports
import { useAuth } from '@/features/auth/AuthContext';

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
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

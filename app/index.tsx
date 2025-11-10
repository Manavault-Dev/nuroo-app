// External Imports
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

// Internal Imports
import { useAuth } from '@/features/auth/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
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
    );
  }

  if (user) {
    if (__DEV__) {
      console.log('✅ User authenticated - routing to app');
    }
    return <Redirect href="/(app)" />;
  }

  if (__DEV__) {
    console.log('👤 No user - routing to welcome');
  }
  return <Redirect href="/welcome" />;
}

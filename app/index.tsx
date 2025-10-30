// External Imports
import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

// Internal Imports
import { useAuth } from '@/features/auth/AuthContext';

/**
 * Root index screen - handles initial routing based on auth state
 * - If user is authenticated: (app) layout will handle onboarding check and routing
 * - If user is not authenticated: redirect to welcome screen
 */
export default function Index() {
  const { user, loading } = useAuth();

  // Show loading while checking auth
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

  // If user is authenticated, (app) layout will check onboarding and route appropriately
  if (user) {
    console.log('✅ User authenticated - routing to app');
    return <Redirect href="/(app)" />;
  }

  // No user - show welcome screen
  console.log('👤 No user - routing to welcome');
  return <Redirect href="/welcome" />;
}

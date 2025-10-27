// External Imports
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Internal Imports
import { colors } from '@/lib/design/tokens';

export default function TabsLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('#ffffff00');
      NavigationBar.setButtonStyleAsync('dark');
      NavigationBar.setPositionAsync('absolute');
    }
  }, []);

  const tabBarHeight = Platform.OS === 'android' ? 70 : 80;
  const tabBarPaddingBottom =
    Platform.OS === 'android' ? Math.max(insets.bottom + 8, 16) : 8;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarHideOnKeyboard: Platform.OS === 'android',
        tabBarStyle: {
          borderTopWidth: 0,
          position: 'absolute',
          elevation: 8,
          height: tabBarHeight + tabBarPaddingBottom,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 8,
          backgroundColor: '#ffffff',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="ask-nuroo/index"
        options={{
          title: t('tabs.ask_nuroo'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress/index"
        options={{
          title: t('tabs.progress'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

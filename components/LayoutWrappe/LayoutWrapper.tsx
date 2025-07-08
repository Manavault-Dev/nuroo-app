// components/LayoutWrapper.tsx
import React, { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';

import designTokens from '@/lib/design/tokens';

interface LayoutWrapperProps {
  children: ReactNode;
  backgroundColor?: string;
}

const LayoutWrapper = ({ children, backgroundColor }: LayoutWrapperProps) => {
  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: backgroundColor || designTokens.colors.background },
      ]}
    >
      <View style={styles.container}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: Number(designTokens.spacing.md),
  },
});

export default LayoutWrapper;

import React, { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, ViewStyle } from 'react-native';

import { colors, spacing } from '@/lib/design/tokens';

interface LayoutWrapperProps {
  children: ReactNode;
  backgroundColor?: string;
  noPadding?: boolean;
  style?: ViewStyle;
}

const LayoutWrapper = ({
  children,
  backgroundColor,
  noPadding,
  style,
}: LayoutWrapperProps) => {
  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: backgroundColor || colors.background },
      ]}
    >
      <View style={[styles.container, noPadding && { padding: 0 }, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: Number(spacing.md),
  },
});

export default LayoutWrapper;

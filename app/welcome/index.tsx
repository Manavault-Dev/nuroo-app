import React from 'react';
import { Text } from 'react-native';
import LayoutWrapper from '@/components/LayoutWrappe/LayoutWrapper';

export default function WelcomeScreen() {
  return (
    <LayoutWrapper style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text>Hello</Text>
    </LayoutWrapper>
  );
}

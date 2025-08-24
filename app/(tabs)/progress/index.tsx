import LayoutWrapper from '@/components/LayoutWrappe/LayoutWrapper';
import { DevelopmentProgress } from '@/components/ProgressDevelopment/DevelopmentProgress';
import tw from '@/lib/design/tw';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function ProgressScreen() {
  return (
    <LayoutWrapper>
      <ScrollView contentContainerStyle={tw`pb-6`}>
        <View style={tw`mb-4`}>
          <Text style={tw`text-2xl font-bold text-primary`}>
            Development Progress
          </Text>
          <Text style={tw`text-gray-500`}>
            Track your child&apos;s development journey
          </Text>
        </View>

        <DevelopmentProgress
          onProgressUpdate={(progress) => {
            console.log('Development progress updated:', progress);
          }}
        />
      </ScrollView>
    </LayoutWrapper>
  );
}

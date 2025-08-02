import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import tw from '@/lib/design/tw';
import LayoutWrapper from '@/components/LayoutWrappe/LayoutWrapper';
import ProgressCalendar from '@/components/ProgressScreen/ProgressCalendar';
import WeeklyStats from '@/components/ProgressScreen/WeeklyStats';
import Achievements from '@/components/ProgressScreen/Achievements';

export default function ProgressScreen() {
  return (
    <LayoutWrapper>
      <ScrollView contentContainerStyle={tw`pb-6`}>
        <View style={tw`mb-4`}>
          <Text style={tw`text-2xl font-bold text-primary`}>
            Progress Tracking
          </Text>
          <Text style={tw`text-gray-500`}>See how far you&apos;ve come!</Text>
        </View>

        <ProgressCalendar />

        <WeeklyStats />

        <Achievements />
      </ScrollView>
    </LayoutWrapper>
  );
}

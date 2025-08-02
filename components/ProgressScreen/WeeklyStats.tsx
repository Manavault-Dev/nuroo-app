import React from 'react';
import { View, Text } from 'react-native';
import tw from '@/lib/design/tw';

const stats = [
  { week: 'Week 1', progress: 71, completed: 5 },
  { week: 'Week 2', progress: 86, completed: 6 },
  { week: 'Week 3', progress: 57, completed: 4 },
  { week: 'This week', progress: 40, completed: 2 },
];

export default function WeeklyStats() {
  return (
    <View style={tw`bg-white rounded-2xl p-4 mb-4 shadow-sm`}>
      <Text style={tw`text-xl font-bold text-primary mb-2`}>
        Weekly Statistics
      </Text>

      {stats.map(({ week, progress, completed }, index) => (
        <View key={index} style={tw`mb-3`}>
          <View style={tw`flex-row justify-between mb-1`}>
            <Text style={tw`text-primary`}>{week}</Text>
            <Text style={tw`text-primary`}>{progress}%</Text>
          </View>
          <View style={tw`h-2 rounded-full bg-gray-200 overflow-hidden`}>
            <View
              style={[
                tw`h-full rounded-full bg-teal-400`,
                { width: `${progress}%` },
              ]}
            />
          </View>
          <Text style={tw`text-gray-400 text-xs mt-1`}>{completed}/7 days</Text>
        </View>
      ))}
    </View>
  );
}

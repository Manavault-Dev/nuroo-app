import React from 'react';
import { View, Text } from 'react-native';
import tw from '@/lib/design/tw';

const achievements = [
  {
    title: 'First week completed!',
    icon: '🎯',
    date: 'June 7',
  },
  {
    title: '10 days in a row',
    icon: '🔥',
    date: 'June 17',
  },
  {
    title: '50 exercises done',
    icon: '⭐',
    date: 'June 19',
  },
];

export default function Achievements() {
  return (
    <View style={tw`bg-white rounded-2xl p-4 shadow-sm`}>
      <Text style={tw`text-xl font-bold text-primary mb-2`}>
        Recent Achievements
      </Text>

      {achievements.map((ach, index) => (
        <View
          key={index}
          style={tw`flex-row justify-between items-center mb-3`}
        >
          <View style={tw`flex-row items-center gap-2`}>
            <Text style={tw`text-lg`}>{ach.icon}</Text>
            <View>
              <Text style={tw`text-primary`}>{ach.title}</Text>
              <Text style={tw`text-gray-400 text-sm`}>{ach.date}</Text>
            </View>
          </View>
          <Text style={tw`text-primary`}>Completed</Text>
        </View>
      ))}
    </View>
  );
}

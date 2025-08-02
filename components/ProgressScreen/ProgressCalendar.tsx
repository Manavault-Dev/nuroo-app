import React from 'react';
import { View, Text } from 'react-native';
import tw from '@/lib/design/tw';

export default function ProgressCalendar() {
  return (
    <View style={tw`bg-white rounded-2xl p-4 mb-4 shadow-sm`}>
      <Text style={tw`text-xl font-bold text-primary mb-2`}>June 2025</Text>

      <View style={tw`flex-row justify-between mb-2`}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <Text key={day} style={tw`text-gray-400 text-xs text-center w-8`}>
            {day}
          </Text>
        ))}
      </View>

      <View style={tw`flex-row flex-wrap`}>
        {[...Array(30)].map((_, index) => {
          const day = index + 1;
          const isChecked = [1, 2, 5, 8, 9, 10, 12, 15, 16, 17, 19].includes(
            day,
          );

          return (
            <View key={day} style={tw`w-1/7 h-10 items-center justify-center`}>
              <View
                style={tw`w-8 h-8 rounded-full ${
                  isChecked
                    ? 'bg-teal-100 border border-teal-600'
                    : 'bg-gray-100'
                } items-center justify-center`}
              >
                <Text style={tw`text-primary text-sm`}>{day}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={tw`mt-4 items-center`}>
        <Text style={tw`text-3xl font-bold text-primary`}>12</Text>
        <Text style={tw`text-sm text-gray-500`}>days completed this month</Text>
      </View>
    </View>
  );
}

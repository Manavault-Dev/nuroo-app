import tw from '@/lib/design/tw';
import React from 'react';
import { View } from 'react-native';

export const HomeSkeleton = () => {
  return (
    <View style={tw`flex-1 bg-gray-50 p-4`}>
      <View style={tw`mb-6`}>
        <View style={tw`h-8 bg-gray-200 rounded-lg mb-2 w-3/4`} />
        <View style={tw`h-5 bg-gray-200 rounded-lg w-1/2`} />
      </View>

      <View
        style={tw`mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100`}
      >
        <View style={tw`h-6 bg-gray-200 rounded-lg mb-2 w-1/3`} />
        <View style={tw`h-4 bg-gray-200 rounded-lg mb-2 w-1/2`} />
        <View style={tw`w-full bg-gray-200 rounded-full h-2`} />
      </View>

      {[...Array(4)].map((_, index) => (
        <View
          key={index}
          style={tw`mb-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100`}
        >
          <View style={tw`flex-row items-center mb-3`}>
            <View style={tw`w-8 h-8 bg-gray-200 rounded-full mr-3`} />
            <View style={tw`flex-1`}>
              <View style={tw`h-5 bg-gray-200 rounded-lg mb-2 w-3/4`} />
              <View style={tw`h-4 bg-gray-200 rounded-lg w-1/2`} />
            </View>
          </View>
          <View style={tw`h-4 bg-gray-200 rounded-lg mb-3 w-full`} />
          <View style={tw`flex-row justify-between items-center`}>
            <View style={tw`h-8 bg-gray-200 rounded-lg w-20`} />
            <View style={tw`h-8 bg-gray-200 rounded-lg w-24`} />
          </View>
        </View>
      ))}
    </View>
  );
};

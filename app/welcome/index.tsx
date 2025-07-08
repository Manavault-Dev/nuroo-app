import React from 'react';
import { Image, Text, View } from 'react-native';
import LayoutWrapper from '@/components/LayoutWrappe/LayoutWrapper';
import tw from '@/lib/design/tw';
import { Button } from '@/components/ui/Button';
import InfoCard from '@/components/ui/InfoCard';

export default function WelcomeScreen() {
  return (
    <LayoutWrapper style={tw`flex-1  items-center px-6`}>
      <View style={tw`items-center`}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={tw`w-68 h-48 mb-6`}
          resizeMode="contain"
        />
        <Text style={tw`text-2xl font-bold mb-4 text-primary text-center`}>
          Welcome to Nuroo
        </Text>
        <Text style={tw`text-base mb-6 text-center text-gray-700`}>
          Support your child’s development with personalized AI-driven plans
        </Text>
      </View>

      <InfoCard style={tw`w-70`}>
        <Text style={tw`text-md mb-2 text-gray-600`}>
          • Daily personalized exercises
        </Text>
        <Text style={tw`text-md mb-2 text-gray-600`}>
          • Track your child’s progress
        </Text>
        <Text style={tw`text-md mb-2 text-gray-600`}>
          • Expert resources and support
        </Text>
      </InfoCard>

      <View style={tw`w-70`}>
        <Button
          style={tw`px-24 py-4`}
          title="Get Started"
          variant="teal"
          onPress={() => {
            /* navigate to login/register */
          }}
        />

        <Text style={tw`text-xs mt-8 text-center text-gray-500`}>
          Join thousands of parents supporting their child’s growth
        </Text>
      </View>
    </LayoutWrapper>
  );
}

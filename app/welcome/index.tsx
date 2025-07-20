import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, View, Dimensions } from 'react-native';
import LayoutWrapper from '@/components/LayoutWrappe/LayoutWrapper';
import tw from '@/lib/design/tw';
import { Button } from '@/components/ui/Button';
import InfoCard from '@/components/ui/InfoCard';
import { router } from 'expo-router';
import i18n from 'i18next';

export default function WelcomeScreen() {
  const { t, i18n } = useTranslation();
  return (
    <LayoutWrapper style={tw`flex-1 px-6 justify-between`}>
      <View style={tw`items-center mt-10`}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={tw`w-68 h-48 mb-6`}
          resizeMode="contain"
        />
        <Text style={tw`text-3xl font-bold mb-4 text-primary text-center`}>
          Welcome to Nuroo
        </Text>
        <Text style={tw`text-lg text-center text-gray-700`}>
          Support your child’s development with personalized AI-driven plans
        </Text>
      </View>

      <View style={tw`w-full max-w-md items-center`}>
        <InfoCard>
          <Text style={tw`text-lg mb-2 text-gray-700`}>
            • Daily personalized exercises
          </Text>
          <Text style={tw`text-lg mb-2 text-gray-700`}>
            • Track your child’s progress
          </Text>
          <Text style={tw`text-lg text-gray-700`}>
            • Expert resources and support
          </Text>
        </InfoCard>
      </View>

      <View style={tw`w-full max-w-md items-center mb-10`}>
        <Button
          title="Get Started"
          variant="teal"
          style={tw`w-full py-4 rounded-xl`}
          textStyle={tw`text-xl`}
          onPress={() => router.push('/signin')}
        />
        <Text style={tw`text-sm mt-6 text-center text-gray-500`}>
          Join thousands of parents supporting their child’s growth
        </Text>
      </View>
    </LayoutWrapper>
  );
}

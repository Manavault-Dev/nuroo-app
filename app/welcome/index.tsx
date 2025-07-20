import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import LayoutWrapper from '@/components/LayoutWrappe/LayoutWrapper';
import tw from '@/lib/design/tw';
import { Button } from '@/components/ui/Button';
import InfoCard from '@/components/ui/InfoCard';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ru' : 'en';
    i18n.changeLanguage(newLang);
  };
  return (
    <LayoutWrapper style={tw`flex-1 px-6 justify-between`}>
      <View style={tw`absolute top-10 right-6 z-10`}>
        <TouchableOpacity onPress={toggleLanguage} style={tw`p-2`}>
          <Text style={tw`text-xl`}>
            {i18n.language === 'en' ? '🇺🇸' : '🇷🇺'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={tw`items-center mt-10`}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={tw`w-68 h-48 mb-6`}
          resizeMode="contain"
        />
        <Text style={tw`text-3xl font-bold mb-4 text-primary text-center`}>
          {t('welcome_title')}
        </Text>

        <Text style={tw`text-lg text-center text-gray-700`}>
          {t('welcome_subtitle')}
        </Text>
      </View>

      <View style={tw`w-full max-w-md items-center`}>
        <InfoCard>
          <Text style={tw`text-lg mb-2 text-gray-700`}>{t('feature_1')}</Text>
          <Text style={tw`text-lg mb-2 text-gray-700`}>{t('feature_2')}</Text>
          <Text style={tw`text-lg text-gray-700`}>{t('feature_3')}</Text>
        </InfoCard>
      </View>

      <View style={tw`w-full max-w-md items-center mb-10`}>
        <Button
          title={t('get_started')}
          variant="teal"
          style={tw`w-full py-4 rounded-xl`}
          textStyle={tw`text-xl`}
          onPress={() => router.push('/signin')}
        />
        <Text style={tw`text-sm mt-6 text-center text-gray-500`}>
          {t('footer_note')}
        </Text>
      </View>
    </LayoutWrapper>
  );
}

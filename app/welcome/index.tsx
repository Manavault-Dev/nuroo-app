// External Imports
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Globe } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';

// Internal Imports
import LayoutWrapper from '@/components/LayoutWrappe/LayoutWrapper';
import { Button } from '@/components/ui/Button';
import InfoCard from '@/components/ui/InfoCard';
import { useAuth } from '@/features/auth/AuthContext';
import tw from '@/lib/design/tw';
import { db } from '@/lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export default function WelcomeScreen() {
  const { t, i18n } = useTranslation();
  const { user, loading } = useAuth();
  const [selectedLang, setSelectedLang] = useState(i18n.language);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return;

      if (user) {
        if (__DEV__) {
          console.log('✅ User already authenticated - checking onboarding...');
        }
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (
              userData.onboardingCompleted &&
              userData.name &&
              userData.age &&
              userData.diagnosis &&
              userData.developmentAreas
            ) {
              if (__DEV__) {
                console.log('✅ Onboarding complete - redirecting to home');
              }
              router.replace('/(tabs)/home');
              return;
            }
          }
          if (__DEV__) {
            console.log('⚠️ Onboarding incomplete - redirecting to onboarding');
          }
          router.replace('/onboarding');
        } catch (error) {
          if (__DEV__) {
            console.error('❌ Error checking user data:', error);
          }
        }
      }
    };

    checkAuth();
  }, [user, loading]);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setSelectedLang(lang);
    setShowDropdown(false);
  };

  const currentLang = LANGUAGES.find((l) => l.code === selectedLang);

  return (
    <LayoutWrapper style={tw`flex-1 px-6 justify-between`}>
      {showDropdown && (
        <Pressable
          onPress={() => setShowDropdown(false)}
          style={tw`absolute inset-0 z-40`}
        />
      )}

      <View style={tw`items-center mt-2 mb-4`}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={tw`w-68 h-48 mb-2`}
          contentFit="contain"
          transition={200}
        />
        <Text style={tw`text-3xl font-bold mb-2 text-primary text-center`}>
          {t('welcome.welcome_title')}
        </Text>
        <Text style={tw`text-lg text-center text-gray-700`}>
          {t('welcome.welcome_subtitle')}
        </Text>
      </View>

      <View style={tw`w-full max-w-md mt-4 mb-4 items-center`}>
        <InfoCard>
          <Text style={tw`text-lg mb-2 text-gray-700`}>
            {t('welcome.feature_1')}
          </Text>
          <Text style={tw`text-lg mb-2 text-gray-700`}>
            {t('welcome.feature_2')}
          </Text>
          <Text style={tw`text-lg text-gray-700`}>
            {t('welcome.feature_3')}
          </Text>
        </InfoCard>
      </View>

      <View style={tw`w-full mb-6 mt-4`}>
        <Text style={tw`text-base font-semibold text-primary mb-2`}>
          {t('welcome.choose_language')}
        </Text>

        <View style={tw`relative`}>
          <TouchableOpacity
            onPress={() => setShowDropdown(!showDropdown)}
            style={tw`flex-row items-center justify-between w-full px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm`}
          >
            <View style={tw`flex-row items-center`}>
              <Globe size={20} color="#1D2B64" style={tw`mr-2`} />
              <Text style={tw`text-base text-gray-800`}>
                {currentLang?.label}
              </Text>
            </View>
          </TouchableOpacity>

          {showDropdown && (
            <View
              style={tw`absolute top-16 left-0 right-0 bg-white border border-gray-300 rounded-xl shadow-md z-50`}
            >
              {LANGUAGES.map((lang) => (
                <Pressable
                  key={lang.code}
                  onPress={() => handleLanguageChange(lang.code)}
                  style={({ pressed }) =>
                    tw`px-4 py-3 ${pressed ? 'bg-gray-100' : ''}`
                  }
                >
                  <Text style={tw`text-base text-gray-800`}>
                    {lang.flag} {lang.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={tw`w-full max-w-md items-center mb-10`}>
        <Button
          title={t('welcome.get_started')}
          variant="teal"
          style={tw`w-full py-4 rounded-xl`}
          textStyle={tw`text-xl`}
          onPress={() => router.push('/signin')}
        />
        <Text style={tw`text-sm mt-6 text-center text-gray-500`}>
          {t('welcome.footer_note')}
        </Text>
      </View>
    </LayoutWrapper>
  );
}

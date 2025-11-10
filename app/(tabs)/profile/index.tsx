// External Imports
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Globe } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

// Internal Imports
import ChildProfileForm from '@/components/ChildProfileForm/ChildProfileForm';
import Option from '@/components/ui/Option';
import { useAuth } from '@/features/auth/AuthContext';
import { useLinks } from '@/hooks/useLinks';
import tw from '@/lib/design/tw';
import { auth, db } from '@/lib/firebase/firebase';
import {
  translateDevelopmentAreas,
  translateDiagnosis,
} from '@/lib/utils/translationHelpers';

interface ProfileData {
  fullName: string;
  initials: string;
  email: string | null;
  name?: string;
  age?: string;
  diagnosis?: string;
  developmentAreas?: string[];
}

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

const ProfileScreen = () => {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [childName, setChildName] = useState('');
  const [age, setAge] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);

  const { rateApp, shareFeedback, openPrivacy, openHelp } = useLinks();

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && isMounted) {
          const userData = userDoc.data() as ProfileData;

          const fullName = userData.fullName || '';
          const initials = fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();

          setProfile({
            ...userData,
            email: currentUser.email,
            fullName,
            initials,
          });
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching profile:', error);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (profile) {
      setChildName(profile.name || '');
      setAge(profile.age || '');
      setDiagnosis(profile.diagnosis || '');
    }
  }, [profile]);

  const handleLanguageChange = async (lang: string) => {
    i18n.changeLanguage(lang);
    setShowLanguageDropdown(false);

    // Save language preference to Firebase
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await setDoc(
          doc(db, 'users', currentUser.uid),
          { preferredLanguage: lang },
          { merge: true },
        );
        console.log('🌍 Language preference saved:', lang);
      }
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(t('common.logout'), t('common.logout_confirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.logout'),
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/welcome');
          } catch (error) {
            if (__DEV__) {
              console.error('❌ Error during logout:', error);
            }
            router.replace('/welcome');
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const profileData = {
      name: childName,
      age,
      diagnosis,
    };

    await setDoc(doc(db, 'users', currentUser.uid), profileData, {
      merge: true,
    });

    setProfile({
      ...profile!,
      ...profileData,
    });

    setIsEditing(false);
  };

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language);

  return (
    <ScrollView contentContainerStyle={tw`p-4 pt-16 pb-32`}>
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <View>
          <Text style={tw`text-2xl font-bold text-primary mb-1`}>
            {t('profile.settings')}
          </Text>
          <Text style={tw`text-gray-500`}>
            {t('profile.manage_account_preferences')}
          </Text>
        </View>

        <View style={tw`relative`}>
          <Pressable
            onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
            style={tw`flex-row items-center px-3 py-2 border border-gray-300 rounded-lg bg-gray-50`}
          >
            <Globe size={16} color="#1D2B64" style={tw`mr-2`} />
            <Text style={tw`text-sm text-gray-700`}>{currentLang?.flag}</Text>
          </Pressable>

          {showLanguageDropdown && (
            <View
              style={tw`absolute top-12 right-0 bg-white border border-gray-300 rounded-lg shadow-md z-50 min-w-32`}
            >
              {LANGUAGES.map((lang) => (
                <Pressable
                  key={lang.code}
                  onPress={() => handleLanguageChange(lang.code)}
                  style={tw`px-3 py-2 border-b border-gray-100 last:border-b-0`}
                >
                  <Text style={tw`text-sm text-gray-800`}>
                    {lang.flag} {lang.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      <View
        style={tw`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6`}
      >
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-row items-center`}>
            <View
              style={tw`bg-primary rounded-xl w-12 h-12 items-center justify-center mr-4`}
            >
              <Text style={tw`text-white text-lg font-bold`}>
                {profile?.initials || 'U'}
              </Text>
            </View>
            <View>
              <Text style={tw`text-primary font-semibold text-lg`}>
                {profile?.fullName || 'Unknown User'}
              </Text>
              <Text style={tw`text-gray-500`}>
                {profile?.email || 'no-email@example.com'}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
          >
            <Ionicons
              name={isEditing ? 'checkmark-outline' : 'create-outline'}
              size={20}
              color="#1D3557"
            />
          </Pressable>
        </View>

        <View style={tw`mt-4`}>
          <Text style={tw`text-primary font-bold mb-1`}>
            {t('profile.child_profile')}
          </Text>

          {isEditing ? (
            <ChildProfileForm
              childName={childName}
              setChildName={setChildName}
              age={age}
              setAge={setAge}
              diagnosis={diagnosis}
              setDiagnosis={setDiagnosis}
              onSave={handleSave}
            />
          ) : (
            <>
              <Text style={tw`text-gray-700 mb-1`}>
                {t('profile.name_label')}{' '}
                {profile?.name || t('profile.not_set')}
              </Text>
              <Text style={tw`text-gray-700 mb-1`}>
                {t('profile.age_label')} {profile?.age || t('profile.not_set')}
              </Text>
              <Text style={tw`text-gray-700 mb-1`}>
                {t('profile.diagnosis_label')}{' '}
                {profile?.diagnosis
                  ? translateDiagnosis(profile.diagnosis, t)
                  : t('profile.not_set')}
              </Text>
              <Text style={tw`text-gray-700 mb-1`}>
                {t('profile.development_areas_label')}{' '}
                {profile?.developmentAreas?.length
                  ? translateDevelopmentAreas(profile.developmentAreas, t).join(
                      ', ',
                    )
                  : t('profile.not_set')}
              </Text>
            </>
          )}
        </View>

        {/* Account Settings */}
      </View>

      <View
        style={tw`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4`}
      >
        <Text style={tw`text-lg font-bold mb-4`}>
          {t('profile.account_settings')}
        </Text>
        <Option label={t('profile.privacy_security')} onPress={openPrivacy} />
        <Option label={t('profile.help_support')} onPress={openHelp} />
        <Option
          label={t('common.logout')}
          onPress={handleLogout}
          textStyle={tw`text-red-600`}
        />
      </View>

      <View
        style={tw`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mt-2`}
      >
        <View style={tw`items-center`}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={tw`w-42 h-22 mb-2`}
            contentFit="contain"
            transition={200}
          />
          <Text style={tw`text-primary text-lg font-bold text-center`}>
            Nuroo
          </Text>
          <Text style={tw`text-gray-500 text-center mb-2`}>
            {t('profile.version')}
          </Text>
          <Text style={tw`text-gray-500 text-center mb-4`}>
            {t('profile.app_description')}
          </Text>
          <View style={tw`flex-row justify-center gap-4`}>
            <Pressable
              style={tw`border border-primary rounded-full px-4 py-2`}
              onPress={rateApp}
            >
              <Text style={tw`text-primary font-medium`}>
                {t('profile.rate_app')}
              </Text>
            </Pressable>
            <Pressable
              style={tw`border border-primary rounded-full px-4 py-2`}
              onPress={shareFeedback}
            >
              <Text style={tw`text-primary font-medium`}>
                {t('profile.share_feedback')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

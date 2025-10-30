// External Imports
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Internal Imports
import LayoutWrapper from '@/components/LayoutWrappe/LayoutWrapper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import tw from '@/lib/design/tw';
import { auth, db } from '@/lib/firebase/firebase';

export default function SignInScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return t('auth.invalid_credentials');
      case 'auth/invalid-email':
        return t('auth.invalid_email');
      case 'auth/user-disabled':
        return t('auth.account_disabled');
      case 'auth/too-many-requests':
        return t('auth.too_many_attempts');
      case 'auth/network-request-failed':
        return t('auth.network_error');
      default:
        return t('auth.login_failed');
    }
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('auth.error'), t('auth.fill_all_fields'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert(t('auth.error'), t('auth.invalid_email'));
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const user = userCredential.user;

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
            router.replace('/(tabs)/home');
          } else {
            router.replace('/onboarding');
          }
        } else {
          router.replace('/onboarding');
        }
      } catch (error) {
        router.replace('/onboarding');
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code || error.message);
      Alert.alert(t('auth.login_failed'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={tw`flex-grow`}
        keyboardShouldPersistTaps="handled"
      >
        <LayoutWrapper style={tw`p-6 justify-center flex-1`}>
          <View style={tw`items-center`}>
            <Image
              source={require('@/assets/images/sign-in.png')}
              style={tw`w-68 h-48 mb-6`}
              contentFit="contain"
              transition={200}
            />
            <Text style={tw`text-3xl font-bold mb-4 text-primary text-center`}>
              {t('auth.welcome_back')}
            </Text>
            <Text style={tw`text-lg text-center text-gray-700`}>
              {t('auth.sign_in_to_account')}
            </Text>
          </View>

          <View style={tw`mt-5 mb-4`}>
            <Text style={tw`text-base mb-2 text-[#1E266D] font-semibold`}>
              {t('auth.email_label')}
            </Text>
            <Input
              variant="outlined"
              placeholder={t('auth.email_placeholder')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={tw`mb-8`}>
            <Text style={tw`text-base mb-2 text-[#1E266D] font-semibold`}>
              {t('auth.password_label')}
            </Text>
            <Input
              variant="outlined"
              placeholder={t('auth.password_placeholder')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Button
            title={loading ? t('auth.signing_in') : t('auth.sign_in_button')}
            variant="teal"
            onPress={handleSignIn}
            disabled={loading}
            style={tw`w-full py-4 rounded-xl`}
            textStyle={tw`text-xl`}
          />

          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={tw`text-center text-primary mt-6 text-base`}>
              {t('auth.no_account')}{' '}
              <Text style={tw`underline`}>{t('auth.sign_up_link')}</Text>
            </Text>
          </TouchableOpacity>
        </LayoutWrapper>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import { useState } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import LayoutWrapper from '@/components/LayoutWrappe/LayoutWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import tw from '@/lib/design/tw';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { router } from 'expo-router';

export default function SignUpScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert(t('signup.passwords_do_not_match'));
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace('/onboarding');
    } catch (error: any) {
      console.error('Sign up error', error);
      Alert.alert(t('signup.signup_failed'), error.message);
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
          <View style={tw`items-center mb-8`}>
            <Image
              source={require('@/assets/images/sign-up.png')}
              style={tw`w-68 h-48 mb-3`}
              resizeMode="contain"
            />
            <Text style={tw`text-3xl font-bold mb-2 text-primary text-center`}>
              {t('signup.create_account')}
            </Text>
            <Text style={tw`text-lg text-center text-gray-700`}>
              {t('signup.sign_up_to_get_started')}
            </Text>
          </View>

          <View style={tw`mb-4`}>
            <Text style={tw`text-base mb-2 text-[#1E266D] font-semibold`}>
              {t('signup.email_label')}
            </Text>
            <Input
              variant="outlined"
              placeholder={t('signup.email_placeholder')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={tw`mb-4`}>
            <Text style={tw`text-base mb-2 text-[#1E266D] font-semibold`}>
              {t('signup.password_label')}
            </Text>
            <Input
              variant="outlined"
              placeholder={t('signup.password_placeholder')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={tw`mb-8`}>
            <Text style={tw`text-base mb-2 text-[#1E266D] font-semibold`}>
              {t('signup.confirm_password_label')}
            </Text>
            <Input
              variant="outlined"
              placeholder={t('signup.confirm_password_placeholder')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Button
            title={
              loading ? t('signup.signing_up') : t('signup.sign_up_button')
            }
            variant="teal"
            onPress={handleSignUp}
            disabled={loading}
            style={tw`w-full py-4 rounded-xl`}
            textStyle={tw`text-xl`}
          />

          <TouchableOpacity onPress={() => router.replace('/signin')}>
            <Text style={tw`text-center text-teal-500 mt-6 text-base`}>
              {t('signup.already_have_account')}{' '}
              <Text style={tw`underline`}>{t('signup.sign_in_link')}</Text>
            </Text>
          </TouchableOpacity>
        </LayoutWrapper>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

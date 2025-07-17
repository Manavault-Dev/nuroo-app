import { useState } from 'react';
import { View, Text, Alert, Image, TouchableOpacity } from 'react-native';
import LayoutWrapper from '@/components/LayoutWrappe/LayoutWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import tw from '@/lib/design/tw';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { router } from 'expo-router';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/');
    } catch (error: any) {
      console.error('Login error', error);
      Alert.alert('Login failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutWrapper style={tw`p-6 justify-center`}>
      <View style={tw`items-center`}>
        <Image
          source={require('@/assets/images/sign-in.png')}
          style={tw`w-68 h-48 mb-6`}
          resizeMode="contain"
        />
        <Text style={tw`text-3xl font-bold mb-4 text-primary text-center`}>
          Welcome Back
        </Text>
        <Text style={tw`text-lg text-center text-gray-700`}>
          Sign in to your account
        </Text>
      </View>

      <View style={tw`mt-5 mb-4`}>
        <Text style={tw`text-base mb-2 text-[#1E266D] font-semibold`}>
          Email
        </Text>
        <Input
          variant="outlined"
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={tw`mb-8`}>
        <Text style={tw`text-base mb-2 text-[#1E266D] font-semibold`}>
          Password
        </Text>
        <Input
          variant="outlined"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <Button
        title={loading ? 'Signing in...' : 'Sign In'}
        variant="teal"
        onPress={handleSignIn}
        disabled={loading}
        style={tw`w-full py-4 rounded-xl`}
        textStyle={tw`text-xl`}
      />

      <TouchableOpacity onPress={() => router.push('/signup')}>
        <Text style={tw`text-center text-teal-500 mt-6 text-base`}>
          Don’t have an account? <Text style={tw`underline`}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </LayoutWrapper>
  );
}

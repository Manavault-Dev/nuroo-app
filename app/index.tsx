import { View } from 'react-native';
import tw from '@/lib/design/tw';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/welcome" />;
}

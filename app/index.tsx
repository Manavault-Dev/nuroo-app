import { View } from 'react-native';
import tw from '@/lib/design/tw';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function Index() {
  return (
    <View style={tw`flex-1 justify-center items-center bg-white px-4`}>
      <Button style={tw`px-8 py-4`} title="Hello World" variant="teal" />
      <Input placeholder="Text" type="text" variant="outlined" />
    </View>
  );
}

import { Text, TouchableOpacity, View } from 'react-native';
import tw from '@/lib/design/tw';

export default function Index() {
  return (
    <View>
      <TouchableOpacity style={tw`mt-20 bg-primary py-md px-lg rounded-lg`}>
        <Text style={tw`text-coral px-25 text-base font-semibold`}>
          Welcome to Nuroo
        </Text>
      </TouchableOpacity>
    </View>
  );
}

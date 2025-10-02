import tw from '@/lib/design/tw';
// import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';

interface OptionProps {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: ViewStyle;
}

const Option: React.FC<OptionProps> = ({
  label,
  onPress,
  style,
  textStyle,
}) => (
  <Pressable
    onPress={onPress}
    style={[
      tw`flex-row justify-between items-center py-3 border-b border-gray-100`,
      style,
    ]}
  >
    <Text style={[tw`text-primary`, textStyle]}>{label}</Text>
    <Text style={tw`text-gray-400 font-bold text-lg`}>›</Text>
  </Pressable>
);

export default Option;

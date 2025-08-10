import React from 'react';
import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from '@/lib/design/tw';

interface OptionProps {
  label: string;
  onPress?: () => void;
}

const Option: React.FC<OptionProps> = ({ label, onPress }) => (
  <Pressable
    onPress={onPress}
    style={tw`flex-row justify-between items-center py-3 border-b border-gray-100`}
  >
    <Text style={tw`text-primary`}>{label}</Text>
    <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
  </Pressable>
);

export default Option;

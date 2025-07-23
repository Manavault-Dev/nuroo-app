import React from 'react';
import { Modal, Pressable, Text, View, FlatList } from 'react-native';
import tw from '@/lib/design/tw';

type Option = { label: string; value: string };

type ModalPickerProps = {
  visible: boolean;
  options: Option[];
  onSelect: (value: string) => void;
  onClose: () => void;
};

export default function ModalPicker({
  visible,
  options,
  onSelect,
  onClose,
}: ModalPickerProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={tw`flex-1 justify-end bg-black/40`} onPress={onClose}>
        <Pressable
          style={tw`bg-white rounded-t-2xl p-4 max-h-[50%]`}
          onPress={(e) => e.stopPropagation()}
        >
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <Pressable
                style={tw`py-3 border-b border-gray-200`}
                onPress={() => onSelect(item.value)}
              >
                <Text style={tw`text-base text-gray-800`}>{item.label}</Text>
              </Pressable>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import tw from '@/lib/design/tw';

export default function AskNurooScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const [messages, setMessages] = useState<
    { from: 'user' | 'nuroo'; text: string }[]
  >([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { from: 'user', text: input }]);
    setInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: 'nuroo', text: 'This is a mock response from Nuroo 🤖' },
      ]);
    }, 800);
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={tw`flex-1 max-h-[90%] bg-white`}
    >
      <View style={tw`pt-14 pb-4 px-4 border-b border-gray-200`}>
        <Text style={tw`text-2xl font-bold text-primary`}>Ask Nuroo 🤖</Text>
        <Text style={tw`text-gray-500 text-sm mt-1`}>
          Your personal assistant
        </Text>
      </View>

      <View style={tw`flex-1`}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={tw`px-4 pt-2 pb-4`}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          renderItem={({ item }) => (
            <View
              style={[
                tw`mb-2 max-w-[80%] p-3 rounded-xl`,
                item.from === 'user' ? tw`bg-blue-100` : tw`bg-gray-100`,
                { alignSelf: item.from === 'user' ? 'flex-end' : 'flex-start' },
              ]}
            >
              <Text style={tw`text-gray-800`}>{item.text}</Text>
            </View>
          )}
        />

        <View style={[tw`px-4 pt-2 pb-4 border-t border-gray-100 bg-white`]}>
          <View style={tw`flex-row items-center`}>
            <TextInput
              style={tw`flex-1 bg-gray-100 p-3 rounded-full text-base`}
              placeholder="Ask Nuroo something..."
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <Pressable
              style={tw`ml-2 px-4 py-3 bg-primary rounded-full`}
              onPress={sendMessage}
            >
              <Text style={tw`text-white font-bold`}>Send</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

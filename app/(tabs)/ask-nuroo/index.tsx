import { askNuroo } from '@/lib/api/openai';
import tw from '@/lib/design/tw';
import { auth, db } from '@/lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

interface Message {
  from: 'user' | 'nuroo';
  text: string;
  timestamp: Date;
}

interface ChildData {
  name?: string;
  age?: string;
  diagnosis?: string;
  developmentAreas?: string[];
}

export default function AskNurooScreen() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [childData, setChildData] = useState<ChildData | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchChildData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setChildData(userDoc.data() as ChildData);
        }
      }
    };
    fetchChildData();
  }, []);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim() === '' || loading) return;

    setLoading(true);
    const userMessage = input.trim();
    const timestamp = new Date();

    setMessages((prev) => [
      ...prev,
      { from: 'user', text: userMessage, timestamp },
    ]);
    setInput('');

    try {
      const reply = await askNuroo(userMessage, childData || undefined);
      setMessages((prev) => [
        ...prev,
        { from: 'nuroo', text: reply, timestamp: new Date() },
      ]);
    } catch (error: any) {
      console.error('Error in Ask Nuroo:', error);
      setMessages((prev) => [
        ...prev,
        {
          from: 'nuroo',
          text: t('ask_nuroo.error_message', {
            error: error.message || 'Unknown error',
          }),
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={tw`flex-1 max-h-[90%] bg-white`}
    >
      <View style={tw`pt-14 pb-4 px-4 border-b border-gray-200`}>
        <Text style={tw`text-2xl font-bold text-primary`}>
          {t('ask_nuroo.title')}
        </Text>
        <Text style={tw`text-gray-500 text-sm mt-1`}>
          {t('ask_nuroo.subtitle')}
        </Text>
      </View>

      {messages.length === 0 && (
        <View style={tw`flex-1 justify-center items-center px-8`}>
          <Text style={tw`text-2xl font-bold text-primary text-center mb-4`}>
            {t('ask_nuroo.welcome_title')}
          </Text>
          <Text style={tw`text-gray-600 text-center mb-6 leading-6`}>
            {t('ask_nuroo.welcome_message')}
          </Text>
          <View style={tw`space-y-2 mb-6`}>
            <Text style={tw`text-gray-700 text-center`}>
              {t('ask_nuroo.welcome_tip_1')}
            </Text>
            <Text style={tw`text-gray-700 text-center`}>
              {t('ask_nuroo.welcome_tip_2')}
            </Text>
            <Text style={tw`text-gray-700 text-center`}>
              {t('ask_nuroo.welcome_tip_3')}
            </Text>
            <Text style={tw`text-gray-700 text-center`}>
              {t('ask_nuroo.welcome_tip_4')}
            </Text>
          </View>
          <Pressable
            style={tw`px-6 py-3 bg-primary rounded-full`}
            onPress={() => {
              const welcomeMessage =
                "Hi! I'm new to Nuroo. Can you give me some tips for getting started with my child's development?";
              setInput(welcomeMessage);
            }}
          >
            <Text style={tw`text-white font-bold text-center`}>
              {t('ask_nuroo.get_started_button')}
            </Text>
          </Pressable>
        </View>
      )}

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
                tw`mb-3 max-w-[85%] p-3 rounded-xl`,
                item.from === 'user'
                  ? tw`bg-blue-100 ml-auto`
                  : tw`bg-gray-100`,
              ]}
            >
              <Text style={tw`text-gray-800 text-base`}>{item.text}</Text>
              <Text style={tw`text-xs text-gray-500 mt-1`}>
                {formatTime(item.timestamp)}
              </Text>
            </View>
          )}
        />

        <View style={[tw`px-4 pt-2 pb-4 border-t border-gray-100 bg-white`]}>
          <View style={tw`flex-row items-center`}>
            <TextInput
              style={tw`flex-1 border border-gray-300 rounded-full px-4 py-3 mr-2`}
              placeholder={t('ask_nuroo.placeholder')}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              editable={!loading}
            />
            <Pressable
              style={[
                tw`ml-2 px-4 py-3 rounded-full`,
                loading ? tw`bg-gray-400` : tw`bg-primary`,
              ]}
              onPress={sendMessage}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={tw`text-white font-bold`}>
                  {t('ask_nuroo.send_button')}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

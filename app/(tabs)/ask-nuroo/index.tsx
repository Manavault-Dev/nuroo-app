import { askNuroo } from '@/lib/api/openai';
import tw from '@/lib/design/tw';
import { auth, db } from '@/lib/firebase/firebase';
import { DailyLimitsService } from '@/lib/services/dailyLimitsService';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
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
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [childData, setChildData] = useState<ChildData | null>(null);
  const [messageLimit, setMessageLimit] = useState({
    remaining: 3,
    resetTime: 0,
  });
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilityReason, setAvailabilityReason] = useState<string>('');
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
    const checkAvailability = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const availability = await DailyLimitsService.isAskNurooAvailable(
          currentUser.uid,
        );
        setIsAvailable(availability.available);
        setAvailabilityReason(availability.reason || '');

        if (availability.available) {
          const limit = await DailyLimitsService.canSendMessage(
            currentUser.uid,
          );
          setMessageLimit({
            remaining: limit.remaining,
            resetTime: limit.resetTime,
          });
        }
      }
    };
    checkAvailability();
  }, []);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (input.trim() === '' || loading || !isAvailable) return;

    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const canSend = await DailyLimitsService.canSendMessage(currentUser.uid);
    if (!canSend.allowed) {
      Alert.alert(
        'Daily Limit Reached',
        canSend.message || 'You have reached your daily message limit.',
        [{ text: 'OK' }],
      );
      return;
    }

    setLoading(true);
    const userMessage = input.trim();
    const timestamp = new Date();

    setMessages((prev) => [
      ...prev,
      { from: 'user', text: userMessage, timestamp },
    ]);
    setInput('');

    try {
      await DailyLimitsService.recordMessageUsage(currentUser.uid);

      const reply = await askNuroo(
        userMessage,
        childData || undefined,
        i18n.language,
        currentUser.uid,
      );
      setMessages((prev) => [
        ...prev,
        { from: 'nuroo', text: reply, timestamp: new Date() },
      ]);

      const updatedLimit = await DailyLimitsService.canSendMessage(
        currentUser.uid,
      );
      setMessageLimit({
        remaining: updatedLimit.remaining,
        resetTime: updatedLimit.resetTime,
      });
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
  }, [input, loading, isAvailable, childData, i18n.language, t]);

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <View style={tw`flex-1 bg-white`}>
        <View style={tw`pt-12 pb-4 px-4 border-b border-gray-200 bg-white`}>
          <View style={tw`flex-row justify-between items-center`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-2xl font-bold text-primary`}>
                {t('ask_nuroo.title')}
              </Text>
              <Text style={tw`text-gray-500 text-sm mt-1`}>
                {t('ask_nuroo.subtitle')}
              </Text>
            </View>
            <View style={tw`items-end`}>
              <View style={tw`bg-primary px-3 py-1 rounded-full`}>
                <Text style={tw`text-white text-sm font-semibold`}>
                  {messageLimit.remaining}/3
                </Text>
              </View>
              <Text style={tw`text-gray-400 text-xs mt-1`}>
                {t('ask_nuroo.messages_today')}
              </Text>
            </View>
          </View>

          {!isAvailable && (
            <View
              style={tw`mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3`}
            >
              <View style={tw`flex-row items-center`}>
                <Ionicons name="time-outline" size={16} color="#f97316" />
                <Text style={tw`text-orange-700 text-sm ml-2 flex-1`}>
                  {availabilityReason}
                </Text>
              </View>
            </View>
          )}
        </View>

        <KeyboardAvoidingView
          behavior="padding"
          style={tw`flex-1`}
          keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
        >
          {messages.length === 0 && (
            <View
              style={tw`absolute inset-0 justify-center items-center px-8 z-0`}
            >
              <View style={tw`items-center`}>
                <View style={tw`space-y-3 mb-8`}>
                  <View style={tw`flex-row items-center`}>
                    <View
                      style={tw`w-8 h-8 bg-red-100 rounded-full items-center justify-center mr-3`}
                    >
                      <Text style={tw`text-red-600 font-bold`}>1</Text>
                    </View>
                    <Text style={tw`text-gray-700 text-base`}>
                      {t('ask_nuroo.welcome_tip_1')}
                    </Text>
                  </View>
                  <View style={tw`flex-row items-center`}>
                    <View
                      style={tw`w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3`}
                    >
                      <Text style={tw`text-green-600 font-bold`}>2</Text>
                    </View>
                    <Text style={tw`text-gray-700 text-base`}>
                      {t('ask_nuroo.welcome_tip_2')}
                    </Text>
                  </View>
                  <View style={tw`flex-row items-center`}>
                    <View
                      style={tw`w-8 h-8 bg-yellow-100 rounded-full items-center justify-center mr-3`}
                    >
                      <Text style={tw`text-yellow-600 font-bold`}>3</Text>
                    </View>
                    <Text style={tw`text-gray-700 text-base`}>
                      {t('ask_nuroo.welcome_tip_3')}
                    </Text>
                  </View>
                  <View style={tw`flex-row items-center`}>
                    <View
                      style={tw`w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3`}
                    >
                      <Text style={tw`text-purple-600 font-bold`}>4</Text>
                    </View>
                    <Text style={tw`text-gray-700 text-base`}>
                      {t('ask_nuroo.welcome_tip_4')}
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    tw`px-8 py-4 bg-primary rounded-2xl shadow-lg`,
                    pressed && tw`scale-95`,
                  ]}
                  onPress={() => {
                    const welcomeMessage = t('ask_nuroo.welcome_message_text');
                    setInput(welcomeMessage);
                  }}
                >
                  <Text style={tw`text-white font-bold text-lg text-center`}>
                    {t('ask_nuroo.get_started_button')}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={tw`px-4 pt-2 pb-6`}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            style={tw`flex-1`}
            renderItem={({ item }) => (
              <View
                style={[
                  tw`mb-4 max-w-[90%]`,
                  item.from === 'user' ? tw`ml-auto` : tw`mr-auto`,
                ]}
              >
                <View
                  style={[
                    tw`p-4 rounded-2xl shadow-sm`,
                    item.from === 'user' ? tw`bg-primary` : tw`bg-gray-100`,
                  ]}
                >
                  <Text
                    style={[
                      tw`text-base leading-6`,
                      item.from === 'user' ? tw`text-white` : tw`text-gray-800`,
                    ]}
                    numberOfLines={0}
                  >
                    {item.text}
                  </Text>
                  <Text
                    style={[
                      tw`text-xs mt-2`,
                      item.from === 'user'
                        ? tw`text-gray-100`
                        : tw`text-gray-500`,
                    ]}
                  >
                    {formatTime(item.timestamp)}
                  </Text>
                </View>
              </View>
            )}
          />

          <View style={tw`px-4 pt-4 pb-20 bg-white border-t border-gray-200`}>
            <View
              style={tw`flex-row items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200 shadow-sm`}
            >
              <TextInput
                style={tw`flex-1 text-base text-gray-800 min-h-[40px] max-h-24`}
                placeholder={
                  isAvailable
                    ? t('ask_nuroo.placeholder')
                    : 'Ask Nuroo is currently unavailable'
                }
                placeholderTextColor="#9CA3AF"
                value={input}
                onChangeText={setInput}
                onSubmitEditing={sendMessage}
                editable={!loading && isAvailable}
                multiline
                textAlignVertical="center"
              />
              <Pressable
                style={({ pressed }) => [
                  tw`ml-3 w-10 h-10 rounded-full items-center justify-center shadow-sm flex-shrink-0`,
                  loading || !isAvailable
                    ? tw`bg-gray-400`
                    : input.trim()
                      ? tw`bg-primary`
                      : tw`bg-gray-300`,
                  pressed && tw`scale-95`,
                ]}
                onPress={sendMessage}
                disabled={loading || !input.trim() || !isAvailable}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons
                    name="send"
                    size={18}
                    color={input.trim() && isAvailable ? 'white' : '#9CA3AF'}
                  />
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

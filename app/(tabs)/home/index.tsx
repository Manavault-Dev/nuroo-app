import { View, Text, FlatList, Pressable } from 'react-native';
import { Link } from 'expo-router';
import tw from '@/lib/design/tw';

const mockTasks = [
  {
    id: '1',
    title: 'Morning Greeting',
    description: `Practice saying ...`,
    category: 'Speech & Language',
    time: '5 min',
    emoji: '🌅',
  },
  {
    id: '2',
    title: 'Emotion Cards',
    description: 'Show cards with different emotions...',
    category: 'Social Skills',
    time: '10 min',
    emoji: '😊',
  },
  {
    id: '3',
    title: 'Block Tower',
    description: 'Stack blocks together...',
    category: 'Motor Skills',
    time: '8 min',
    emoji: '🧱',
  },
];

const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export default function HomeScreen() {
  return (
    <View style={tw`flex-1 bg-white px-4 pt-14`}>
      {/* Header */}
      <View style={tw`mb-6`}>
        <View style={tw`flex-row items-center justify-between mb-2`}>
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-primary font-bold text-lg`}>Nuroo</Text>
          </View>
        </View>

        <Text style={tw`text-2xl font-bold text-primary`}>
          Today&apos;s Plan
        </Text>
        <Text style={tw`text-sm text-gray-400 mt-1`}>{today}</Text>

        <View style={tw`mt-2`}>
          <Text style={tw`text-sm text-gray-400`}>
            Progress <Text style={tw`text-primary`}>0/3</Text>
          </Text>
          <View style={tw`h-2 bg-gray-200 rounded-full mt-1`}>
            <View style={tw`h-2 w-1/6 bg-primary rounded-full`} />
          </View>
        </View>
      </View>

      <FlatList
        data={mockTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={tw`pb-12`}
        renderItem={({ item }) => (
          <View
            style={tw`bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100`}
          >
            <Text style={tw`text-lg font-semibold text-primary`}>
              {item.emoji} {item.title}
            </Text>
            <Text style={tw`text-gray-500 mt-1`}>{item.description}</Text>
            <View style={tw`flex-row items-center justify-between mt-3`}>
              <Text style={tw`text-sm text-gray-400`}>
                {item.category} · {item.time}
              </Text>

              <Link href={`/tasks/${item.id}`} asChild>
                <Pressable style={tw`bg-blue-100 px-4 py-2 rounded-xl`}>
                  <Text style={tw`text-blue-700 font-medium`}>Start</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        )}
      />
    </View>
  );
}

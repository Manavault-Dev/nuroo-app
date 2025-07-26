import { useLocalSearchParams } from 'expo-router';
import { View, Text, Pressable, Alert } from 'react-native';
import tw from '@/lib/design/tw';

const mockTasks = [
  {
    id: '1',
    title: 'Morning Greeting',
    description: 'Practice saying "Good morning"...',
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

export default function TaskPage() {
  const { id } = useLocalSearchParams();
  const task = mockTasks.find((t) => t.id === String(id));

  if (!task) {
    return (
      <View style={tw`flex-1 justify-center items-center px-4`}>
        <Text style={tw`text-xl font-bold text-red-500`}>Task not found</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-white px-4 pt-14`}>
      <Text style={tw`text-2xl font-bold text-primary mb-2`}>
        {task.emoji} {task.title}
      </Text>
      <Text style={tw`text-base text-gray-600 mb-4`}>{task.description}</Text>

      <Text style={tw`text-sm text-gray-400 mb-6`}>
        Category: <Text style={tw`text-primary`}>{task.category}</Text> ·
        Duration: {task.time}
      </Text>

      <Pressable
        onPress={() =>
          Alert.alert('Completed', `You completed "${task.title}"!`)
        }
        style={tw`bg-primary py-3 px-5 rounded-xl self-start`}
      >
        <Text style={tw`text-white font-semibold text-center`}>
          Complete Task
        </Text>
      </Pressable>
    </View>
  );
}

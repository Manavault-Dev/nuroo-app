import tw from '@/lib/design/tw';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Task } from '../home.types';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
}) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/(home-stack)/tasks/${task.id}`);
  };

  const handleToggleComplete = () => {
    onToggleComplete(task.id);
  };

  return (
    <View
      style={tw`bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-4`}
    >
      <Pressable onPress={handlePress} style={tw`flex-1`}>
        <View style={tw`flex-row items-center mb-3`}>
          <Text style={tw`text-2xl mr-3`}>{task.emoji}</Text>
          <View style={tw`flex-1`}>
            <Text style={tw`text-lg font-semibold text-gray-900 mb-1`}>
              {task.title}
            </Text>
            <Text style={tw`text-sm text-gray-600 mb-2`}>
              {task.category} • {task.time}
            </Text>
            <Text style={tw`text-sm text-gray-700`} numberOfLines={2}>
              {task.description}
            </Text>
          </View>
        </View>
      </Pressable>

      <View style={tw`flex-row justify-between items-center`}>
        <View style={tw`flex-row items-center`}>
          <Text
            style={tw`text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700 mr-2`}
          >
            {task.difficulty}
          </Text>
          <Text style={tw`text-xs text-gray-500`}>
            {task.estimatedDuration} min
          </Text>
        </View>

        <Pressable
          onPress={handleToggleComplete}
          style={[
            tw`px-4 py-2 rounded-md border`,
            task.completed
              ? tw`bg-green-100 border-green-300`
              : tw`bg-gray-100 border-gray-300`,
          ]}
        >
          <Text
            style={[
              tw`text-sm font-medium`,
              task.completed ? tw`text-green-700` : tw`text-gray-700`,
            ]}
          >
            {task.completed ? 'Completed' : 'Mark Complete'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

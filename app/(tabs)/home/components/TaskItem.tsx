import tw from '@/lib/design/tw';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
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
  const [updating, setUpdating] = useState(false);

  const handlePress = () => {
    router.push(`/(home-stack)/tasks/${task.id}`);
  };

  const handleToggleComplete = async () => {
    if (updating) return;

    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setUpdating(true);
    try {
      await onToggleComplete(task.id);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error toggling task completion:', error);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View
      style={[
        tw`bg-white rounded-lg p-4 shadow-sm border mb-4 overflow-hidden`,
        task.completed ? tw`border-green-200 bg-green-50` : tw`border-gray-100`,
      ]}
    >
      <Pressable onPress={handlePress} style={tw`flex-1`}>
        <View style={tw`flex-row items-start mb-3`}>
          <Text style={tw`text-2xl mr-3 mt-1 flex-shrink-0`}>{task.emoji}</Text>
          <View style={tw`flex-1 min-w-0`}>
            <View style={tw`flex-row items-center mb-1`}>
              <Text
                style={[
                  tw`text-lg font-semibold flex-1 min-w-0`,
                  task.completed
                    ? tw`text-green-700 line-through`
                    : tw`text-gray-900`,
                ]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
              {task.completed && (
                <View
                  style={tw`ml-2 bg-green-100 rounded-full w-6 h-6 items-center justify-center flex-shrink-0`}
                >
                  <Text style={tw`text-green-600 text-sm font-bold`}>✓</Text>
                </View>
              )}
            </View>
            <Text style={tw`text-sm text-gray-600 mb-2`}>
              {task.category} • {task.time}
            </Text>
            <Text
              style={[
                tw`text-sm`,
                task.completed ? tw`text-gray-500` : tw`text-gray-700`,
              ]}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          </View>
        </View>
      </Pressable>

      <View style={tw`flex-row justify-between items-center`}>
        <View style={tw`flex-row items-center flex-1 min-w-0 mr-3`}>
          <Text
            style={tw`text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700 mr-2 flex-shrink-0`}
          >
            {task.difficulty}
          </Text>
          <Text style={tw`text-xs text-gray-500 flex-shrink-0`}>
            {task.estimatedDuration} min
          </Text>
        </View>

        <Pressable
          onPress={handleToggleComplete}
          disabled={updating}
          style={({ pressed }) => [
            tw`px-4 py-2 rounded-md border min-w-[120px] items-center justify-center shadow-sm flex-shrink-0`,
            task.completed
              ? tw`bg-green-100 border-green-300 shadow-green-200`
              : tw`bg-blue-100 border-blue-300 shadow-blue-200`,
            updating && tw`opacity-50`,
            pressed && tw`scale-95 opacity-80`,
          ]}
          android_ripple={{
            color: task.completed ? '#10B981' : '#3B82F6',
            borderless: false,
          }}
        >
          {updating ? (
            <View style={tw`flex-row items-center`}>
              <ActivityIndicator
                size="small"
                color={task.completed ? '#059669' : '#2563EB'}
              />
              <Text
                style={[
                  tw`text-sm font-semibold ml-2`,
                  task.completed ? tw`text-green-700` : tw`text-blue-700`,
                ]}
              >
                Updating...
              </Text>
            </View>
          ) : (
            <Text
              style={[
                tw`text-sm font-semibold`,
                task.completed ? tw`text-green-700` : tw`text-blue-700`,
              ]}
            >
              {task.completed ? '✓ Completed' : '✓ Mark Complete'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
};

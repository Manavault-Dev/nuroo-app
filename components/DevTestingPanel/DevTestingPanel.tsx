/**
 * DevTestingPanel - Development testing component
 *
 * This component provides testing controls for development only.
 * It allows you to test different scenarios without waiting for real time.
 */

import tw from '@/lib/design/tw';
import { ChildData } from '@/lib/home/home.types';
import { DevTestingUtils } from '@/lib/utils/devTestingUtils';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface DevTestingPanelProps {
  userId: string;
  childData: ChildData | null;
  onTasksUpdated?: () => void;
}

export const DevTestingPanel: React.FC<DevTestingPanelProps> = ({
  userId,
  childData,
  onTasksUpdated,
}) => {
  const [loading, setLoading] = useState(false);

  // Only show in development
  if (!__DEV__) {
    return null;
  }

  const handleAction = async (
    action: () => Promise<void>,
    actionName: string,
  ) => {
    if (!userId || !childData) {
      Alert.alert('Error', 'User ID or child data missing');
      return;
    }

    setLoading(true);
    try {
      await action();
      Alert.alert('Success', `${actionName} completed successfully!`);
      onTasksUpdated?.();
    } catch (error) {
      Alert.alert('Error', `Failed to ${actionName.toLowerCase()}`);
      console.error(`Error in ${actionName}:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-4`}>
      <Text style={tw`text-yellow-800 font-bold text-lg mb-3`}>
        🧪 Development Testing Panel
      </Text>

      <Text style={tw`text-yellow-700 text-sm mb-4`}>
        Use these controls to test task generation without waiting for 9 AM
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={tw`flex-row gap-2`}>
          <TouchableOpacity
            style={tw`bg-blue-500 px-3 py-2 rounded-lg`}
            onPress={() =>
              handleAction(
                () => DevTestingUtils.forceGenerateTasks(userId, childData!),
                'Force Generate Tasks',
              )
            }
            disabled={loading}
          >
            <Text style={tw`text-white text-xs font-medium`}>
              🚀 Generate Tasks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-green-500 px-3 py-2 rounded-lg`}
            onPress={() =>
              handleAction(
                () => DevTestingUtils.simulateNewDay(userId),
                'Simulate New Day',
              )
            }
            disabled={loading}
          >
            <Text style={tw`text-white text-xs font-medium`}>📅 New Day</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-purple-500 px-3 py-2 rounded-lg`}
            onPress={() =>
              handleAction(
                () => DevTestingUtils.resetLastTaskDate(userId),
                'Reset Last Date',
              )
            }
            disabled={loading}
          >
            <Text style={tw`text-white text-xs font-medium`}>
              🔄 Reset Date
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-orange-500 px-3 py-2 rounded-lg`}
            onPress={() =>
              handleAction(
                () => DevTestingUtils.completeAllTasks(userId),
                'Complete All Tasks',
              )
            }
            disabled={loading}
          >
            <Text style={tw`text-white text-xs font-medium`}>
              ✅ Complete All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-gray-500 px-3 py-2 rounded-lg`}
            onPress={() =>
              handleAction(
                () => DevTestingUtils.showStatus(userId),
                'Show Status',
              )
            }
            disabled={loading}
          >
            <Text style={tw`text-white text-xs font-medium`}>📊 Status</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {loading && (
        <Text style={tw`text-yellow-700 text-sm mt-2 text-center`}>
          Loading...
        </Text>
      )}
    </View>
  );
};

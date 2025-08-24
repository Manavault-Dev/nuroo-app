import { UserProgress } from '@/app/(tabs)/home/home.types';
import { useAuth } from '@/context/AuthContext';
import tw from '@/lib/design/tw';
import { ProgressService } from '@/lib/services/progressService';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

interface DevelopmentProgressProps {
  onProgressUpdate?: (progress: UserProgress) => void;
}

export const DevelopmentProgress: React.FC<DevelopmentProgressProps> = ({
  onProgressUpdate,
}) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const userProgress = await ProgressService.getProgress(user.uid);
      if (userProgress) {
        setProgress(userProgress);
        onProgressUpdate?.(userProgress);
      } else {
        const newProgress = await ProgressService.initializeProgress(user.uid);
        setProgress(newProgress);
        onProgressUpdate?.(newProgress);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, onProgressUpdate]);

  useEffect(() => {
    if (user?.uid) {
      loadProgress();
    }
  }, [user?.uid, loadProgress]);

  const updateProgress = async (area: keyof UserProgress, newValue: number) => {
    if (!user?.uid || !progress) return;

    try {
      await ProgressService.updateProgress(user.uid, area, newValue);

      const updatedProgress = { ...progress, [area]: newValue };
      setProgress(updatedProgress);
      onProgressUpdate?.(updatedProgress);

      console.log(`✅ Progress updated for ${area}: ${newValue}`);
    } catch (error) {
      console.error(`❌ Error updating progress for ${area}:`, error);
      Alert.alert('Error', 'Failed to update progress. Please try again.');
    }
  };

  const getProgressColor = (value: number) => {
    if (value < 30) return 'bg-red-100 text-red-700';
    if (value < 70) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const getProgressLabel = (value: number) => {
    if (value < 30) return 'Beginner';
    if (value < 70) return 'Intermediate';
    return 'Advanced';
  };

  if (loading) {
    return (
      <View
        style={tw`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4`}
      >
        <Text style={tw`text-lg font-bold mb-4`}>Development Progress</Text>
        <Text style={tw`text-gray-500`}>Loading progress...</Text>
      </View>
    );
  }

  if (!progress) {
    return null;
  }

  const progressAreas = [
    {
      key: 'communication' as keyof UserProgress,
      label: 'Communication',
      icon: '💬',
    },
    {
      key: 'motor_skills' as keyof UserProgress,
      label: 'Motor Skills',
      icon: '🏃',
    },
    { key: 'social' as keyof UserProgress, label: 'Social Skills', icon: '👥' },
    { key: 'cognitive' as keyof UserProgress, label: 'Cognitive', icon: '🧠' },
    { key: 'sensory' as keyof UserProgress, label: 'Sensory', icon: '👁️' },
    { key: 'behavior' as keyof UserProgress, label: 'Behavior', icon: '🎯' },
  ];

  return (
    <View
      style={tw`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4`}
    >
      <Text style={tw`text-lg font-bold mb-4`}>Development Progress</Text>

      {progressAreas.map(({ key, label, icon }) => (
        <View key={key} style={tw`mb-4`}>
          <View style={tw`flex-row items-center justify-between mb-2`}>
            <View style={tw`flex-row items-center`}>
              <Text style={tw`text-lg mr-2`}>{icon}</Text>
              <Text style={tw`font-medium text-gray-800`}>{label}</Text>
            </View>
            <View style={tw`flex-row items-center`}>
              <Text style={tw`text-sm font-semibold text-primary mr-2`}>
                {progress[key]}/100
              </Text>
              <Text
                style={tw`text-xs px-2 py-1 rounded-full ${getProgressColor(progress[key])}`}
              >
                {getProgressLabel(progress[key])}
              </Text>
            </View>
          </View>

          <View style={tw`w-full bg-gray-200 rounded-full h-3 mb-2`}>
            <View
              style={[
                tw`bg-primary h-3 rounded-full`,
                { width: `${progress[key]}%` },
              ]}
            />
          </View>

          <View style={tw`flex-row justify-between`}>
            <Pressable
              style={tw`bg-blue-100 px-3 py-1 rounded-lg`}
              onPress={() =>
                updateProgress(key, Math.max(0, progress[key] - 5))
              }
            >
              <Text style={tw`text-blue-700 text-sm font-medium`}>-5</Text>
            </Pressable>

            <Pressable
              style={tw`bg-green-100 px-3 py-1 rounded-lg`}
              onPress={() =>
                updateProgress(key, Math.min(100, progress[key] + 5))
              }
            >
              <Text style={tw`text-green-700 text-sm font-medium`}>+5</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <Text style={tw`text-xs text-gray-500 mt-4 text-center`}>
        💡 Adjust progress based on your child&apos;s development. This helps
        generate more personalized tasks.
      </Text>
    </View>
  );
};

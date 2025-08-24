import { UserProgress } from '@/app/(tabs)/home/home.types';
import { useProgressTracking } from '@/hooks/progressHooks/useProgressTracking';
import tw from '@/lib/design/tw';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

interface DevelopmentProgressProps {
  onProgressUpdate?: (progress: UserProgress) => void;
}

export const DevelopmentProgress: React.FC<DevelopmentProgressProps> = ({
  onProgressUpdate,
}) => {
  const { t } = useTranslation();
  const {
    progress,
    loading,
    updateProgress,
    getProgressColor,
    getProgressLabel,
  } = useProgressTracking({
    onProgressUpdate,
  });

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
              <Text style={tw`text-blue-700 text-sm font-medium`}>+5</Text>
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

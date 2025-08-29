import { UserProgress } from '@/app/(tabs)/home/home.types';
import { useAuth } from '@/context/AuthContext';
import tw from '@/lib/design/tw';
import { ProgressService } from '@/lib/services/progressService';
import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

interface LevelProgressProps {
  progress: UserProgress | null;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({ progress }) => {
  const { user } = useAuth();
  const [totalTasksCompleted, setTotalTasksCompleted] = useState(0);
  const [consecutiveDaysStreak, setConsecutiveDaysStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadTaskData = useCallback(async () => {
    try {
      setLoading(true);
      const [totalTasks, streak] = await Promise.all([
        ProgressService.getTotalTasksCompleted(user!.uid),
        ProgressService.getConsecutiveDaysStreak(user!.uid),
      ]);

      setTotalTasksCompleted(totalTasks);
      setConsecutiveDaysStreak(streak);
    } catch (error) {
      console.error('Error loading task data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadTaskData();
    }
  }, [user?.uid, loadTaskData]);

  if (!progress || loading) {
    return (
      <View
        style={tw`bg-white rounded-2xl p-6 shadow-sm border border-gray-100`}
      >
        <Text style={tw`text-lg text-gray-600 text-center`}>
          Loading level data...
        </Text>
      </View>
    );
  }

  const levelData =
    ProgressService.calculateProgressToNextLevel(totalTasksCompleted);
  const currentLevel = levelData.current;
  const progressToNextLevel = levelData.progress;

  const totalProgress = Object.values(progress).reduce(
    (sum, value) => sum + value,
    0,
  );
  const averageProgress = totalProgress / Object.keys(progress).length;

  const getLevelTitle = (level: number) => {
    if (level <= 3) return 'Beginner Explorer';
    if (level <= 6) return 'Growing Learner';
    if (level <= 9) return 'Skillful Developer';
    if (level <= 12) return 'Advanced Achiever';
    return 'Master Developer';
  };

  const getLevelColor = (level: number) => {
    if (level <= 3) return 'bg-blue-500';
    if (level <= 6) return 'bg-green-500';
    if (level <= 9) return 'bg-yellow-500';
    if (level <= 12) return 'bg-orange-500';
    return 'bg-purple-500';
  };

  return (
    <View style={tw`bg-white rounded-2xl shadow-sm border border-gray-100`}>
      <View style={tw`flex-row items-center justify-between mb-4 p-6 pb-0`}>
        <Text style={tw`text-2xl font-bold text-gray-800`}>
          Level {currentLevel}
        </Text>
        <View style={tw`bg-blue-100 px-3 py-1 rounded-full`}>
          <Text style={tw`text-blue-700 font-semibold text-sm`}>
            {getLevelTitle(currentLevel)}
          </Text>
        </View>
      </View>

      <View style={tw`items-center mb-6 px-6`}>
        <View
          style={[
            tw`w-24 h-24 rounded-full items-center justify-center mb-3`,
            tw`${getLevelColor(currentLevel)}`,
          ]}
        >
          <Text style={tw`text-white text-3xl font-bold`}>{currentLevel}</Text>
        </View>
        <Text style={tw`text-gray-600 text-center`}>
          {totalTasksCompleted} tasks completed
        </Text>
      </View>

      <View style={tw`mb-4 px-6`}>
        <View style={tw`flex-row items-center justify-between mb-2`}>
          <Text style={tw`text-sm font-medium text-gray-700`}>
            Progress to Level {currentLevel + 1}
          </Text>
          <Text style={tw`text-sm font-semibold text-primary`}>
            {Math.round(progressToNextLevel)}%
          </Text>
        </View>
        <View style={tw`w-full bg-gray-200 rounded-full h-3`}>
          <View
            style={[
              tw`bg-primary h-3 rounded-full`,
              { width: `${progressToNextLevel}%` },
            ]}
          />
        </View>
      </View>

      <View style={tw`flex-row justify-between mb-4 px-6`}>
        <View style={tw`items-center`}>
          <Text style={tw`text-2xl font-bold text-primary`}>
            {currentLevel}
          </Text>
          <Text style={tw`text-xs text-gray-500 text-center`}>
            Current Level
          </Text>
        </View>
        <View style={tw`items-center`}>
          <Text style={tw`text-2xl font-bold text-green-600`}>
            {totalTasksCompleted}
          </Text>
          <Text style={tw`text-xs text-gray-500 text-center`}>Tasks Done</Text>
        </View>
        <View style={tw`items-center`}>
          <Text style={tw`text-2xl font-bold text-blue-600`}>
            {Math.round(averageProgress)}%
          </Text>
          <Text style={tw`text-xs text-gray-500 text-center`}>
            Avg Progress
          </Text>
        </View>
      </View>

      <View
        style={tw`mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200 mx-6`}
      >
        <View style={tw`flex-row items-center justify-between`}>
          <View>
            <Text style={tw`text-orange-800 text-sm font-medium`}>
              🔥 Current Streak
            </Text>
            <Text style={tw`text-orange-600 text-xs`}>
              {consecutiveDaysStreak} consecutive days
            </Text>
          </View>
          <Text style={tw`text-2xl font-bold text-orange-600`}>
            {consecutiveDaysStreak}
          </Text>
        </View>
      </View>

      <View
        style={tw`mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 mx-6 mb-6`}
      >
        <Text style={tw`text-yellow-800 text-sm font-medium text-center`}>
          🎉 Level {currentLevel + 1} Reward: {getLevelTitle(currentLevel + 1)}{' '}
          Badge
        </Text>
        <Text style={tw`text-yellow-800 text-xs text-center mt-1`}>
          Complete {10 - Math.round(progressToNextLevel / 10)} more tasks to
          level up!
        </Text>
      </View>
    </View>
  );
};

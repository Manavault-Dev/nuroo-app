import { useAuth } from '@/context/AuthContext';
import tw from '@/lib/design/tw';
import { UserProgress } from '@/lib/home/home.types';
import { ProgressService } from '@/lib/services/progressService';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

interface LevelProgressProps {
  progress: UserProgress | null;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({ progress }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [totalTasksCompleted, setTotalTasksCompleted] = useState(0);
  const [consecutiveDaysStreak, setConsecutiveDaysStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [indexBuilding, setIndexBuilding] = useState(false);

  const loadTaskData = useCallback(async () => {
    try {
      setLoading(true);
      const [totalTasks, streak] = await Promise.all([
        ProgressService.getTotalTasksCompleted(user!.uid),
        ProgressService.getConsecutiveDaysStreak(user!.uid),
      ]);

      setTotalTasksCompleted(totalTasks);
      setConsecutiveDaysStreak(streak);

      if (streak === 1 && totalTasks > 1) {
        setIndexBuilding(true);
      }
    } catch (error) {
      console.error('Error loading task data:', error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('currently building')) {
        setIndexBuilding(true);
        setConsecutiveDaysStreak(1);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadTaskData();
    }
  }, [user?.uid]);

  if (!progress || loading) {
    return (
      <View
        style={tw`bg-white rounded-2xl p-6 shadow-sm border border-gray-100`}
      >
        <Text style={tw`text-lg text-gray-600 text-center`}>
          {t('progress.loading_level_data')}
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
    if (level <= 3) return t('progress.level_titles.beginner');
    if (level <= 6) return t('progress.level_titles.growing');
    if (level <= 9) return t('progress.level_titles.skillful');
    if (level <= 12) return t('progress.level_titles.advanced');
    return t('progress.level_titles.master');
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
          {t('progress.level')} {currentLevel}
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
          {totalTasksCompleted} {t('progress.tasks_completed')}
        </Text>
      </View>

      <View style={tw`mb-4 px-6`}>
        <View style={tw`flex-row items-center justify-between mb-2`}>
          <Text style={tw`text-sm font-medium text-gray-700`}>
            {t('progress.progress_to_next_level')} {currentLevel + 1}
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
            {t('progress.current_level')}
          </Text>
        </View>
        <View style={tw`items-center`}>
          <Text style={tw`text-2xl font-bold text-green-600`}>
            {totalTasksCompleted}
          </Text>
          <Text style={tw`text-xs text-gray-500 text-center`}>
            {t('progress.tasks_done')}
          </Text>
        </View>
        <View style={tw`items-center`}>
          <Text style={tw`text-2xl font-bold text-blue-600`}>
            {Math.round(averageProgress)}%
          </Text>
          <Text style={tw`text-xs text-gray-500 text-center`}>
            {t('progress.avg_progress')}
          </Text>
        </View>
      </View>

      <View
        style={tw`mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200 mx-6`}
      >
        <View style={tw`flex-row items-center justify-between`}>
          <View>
            <Text style={tw`text-orange-800 text-sm font-medium`}>
              🔥 {t('progress.current_streak')}
            </Text>
            <Text style={tw`text-orange-600 text-xs`}>
              {consecutiveDaysStreak} {t('progress.consecutive_days')}
            </Text>
            {indexBuilding && (
              <Text style={tw`text-orange-500 text-xs mt-1`}>
                ⏳ Updating streak calculation...
              </Text>
            )}
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
          🎉 {t('progress.level_reward', { level: currentLevel + 1 })}:{' '}
          {getLevelTitle(currentLevel + 1)} {t('progress.badge')}
        </Text>
        <Text style={tw`text-yellow-800 text-xs text-center mt-1`}>
          {t('progress.complete_tasks_to_level_up', {
            count: 10 - Math.round(progressToNextLevel / 10),
          })}
        </Text>
      </View>
    </View>
  );
};

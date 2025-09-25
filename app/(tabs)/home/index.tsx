import LayoutWrapper from '@/components/LayoutWrappe/LayoutWrapper';
import { TaskTimer } from '@/components/TaskTimer/TaskTimer';
import { useAuth } from '@/context/AuthContext';
import { useAutoTaskGeneration } from '@/hooks/homeHooks/useAutoTaskGeneration';
import { useChildData } from '@/hooks/homeHooks/useChildData';
import { useTaskManagement } from '@/hooks/homeHooks/useTaskManagement';
import tw from '@/lib/design/tw';
import { homeStyles } from '@/lib/home/home.styles';
import { Task } from '@/lib/home/home.types';
import { formatProgressPercentage } from '@/lib/home/home.utils';
import { ProgressService } from '@/lib/services/progressService';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { HomeSkeleton } from './components/HomeSkeleton';
import { TaskItem } from './components/TaskItem';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasIncompleteTasks, setHasIncompleteTasks] = useState(false);

  const { childData, fetchChildData } = useChildData();
  const { fetchTasks, toggleTaskCompletion, setLoadingState } =
    useTaskManagement(setTasks, setLoading);
  const { autoGenerating, checkAndGenerateTasks } = useAutoTaskGeneration(
    childData,
    setTasks,
    setLoadingState,
  );

  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 useTaskManagement hook recreated');
  }, [fetchTasks, toggleTaskCompletion, setLoadingState]);

  const today = new Date().toLocaleDateString(t('date.locale'), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const progressPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  useEffect(() => {
    if (user?.uid) {
      fetchChildData(user.uid);
    }
  }, [user?.uid, fetchChildData]);

  useEffect(() => {
    if (user?.uid && childData) {
      fetchTasks(user.uid).catch((error: unknown) => {
        console.error('❌ Error fetching tasks:', error);

        const errorMessage =
          error instanceof Error ? error.message : String(error);

        if (errorMessage.includes('requires an index')) {
          setFirebaseError(
            'Database configuration is being updated. Please wait a moment and refresh.',
          );
        } else {
          setFirebaseError(
            'Unable to load tasks. Please check your connection and try again.',
          );
        }
      });
    }
  }, [user?.uid, childData, fetchTasks]);

  useEffect(() => {
    if (childData && user?.uid) {
      checkAndGenerateTasks();
    }
  }, [childData, user?.uid, checkAndGenerateTasks]);

  useEffect(() => {
    const checkIncompleteTasks = async () => {
      if (user?.uid) {
        try {
          const incomplete = await ProgressService.hasIncompleteTasks(user.uid);
          setHasIncompleteTasks(incomplete);
        } catch (error) {
          console.error('Error checking incomplete tasks:', error);
        }
      }
    };

    checkIncompleteTasks();
  }, [user?.uid, tasks]);

  useEffect(() => {
    console.log('📊 Home screen state changed:', {
      loading,
      tasksCount: tasks.length,
      hasUser: !!user?.uid,
      hasChildData: !!childData,
    });
  }, [loading, tasks.length, user?.uid, childData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setFirebaseError(null);
    if (user?.uid) {
      try {
        await fetchTasks(user.uid);
      } catch (error: unknown) {
        console.error('❌ Error refreshing tasks:', error);

        const errorMessage =
          error instanceof Error ? error.message : String(error);

        if (errorMessage.includes('requires an index')) {
          setFirebaseError(
            'Database configuration is being updated. Please wait a moment and refresh.',
          );
        } else {
          setFirebaseError(
            'Unable to refresh tasks. Please check your connection and try again.',
          );
        }
      }
    }
    setRefreshing(false);
  };

  console.log('🔄 Render check - loading:', loading, 'tasks:', tasks.length);

  if (loading) {
    console.log(
      '🔄 Showing skeleton - loading:',
      loading,
      'tasks:',
      tasks.length,
    );
    return (
      <View style={tw`flex-1 bg-gray-50`}>
        <HomeSkeleton />
      </View>
    );
  }

  return (
    <LayoutWrapper>
      <ScrollView
        style={tw`flex-1 bg-gray-50`}
        contentContainerStyle={homeStyles.taskList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={tw`p-4`}>
          <View style={tw`mb-6`}>
            <Text style={homeStyles.headerTitle}>{t('home.title')}</Text>
            <Text style={homeStyles.headerSubtitle}>{today}</Text>

            {totalTasks > 0 && (
              <View
                style={tw`mt-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100`}
              >
                <Text style={tw`text-lg font-semibold text-primary mb-2`}>
                  {t('home.progress')}
                </Text>
                <View style={tw`flex-row items-center justify-between mb-2`}>
                  <Text style={tw`text-sm text-gray-600`}>
                    {completedTasks} {t('home.of')} {totalTasks}{' '}
                    {t('home.tasks_completed')}
                  </Text>
                  <Text style={tw`text-sm font-semibold text-primary`}>
                    {formatProgressPercentage(completedTasks, totalTasks)}
                  </Text>
                </View>

                <View style={tw`w-full bg-gray-200 rounded-lg h-2`}>
                  <View
                    style={[
                      tw`bg-primary h-2 rounded-lg`,
                      { width: `${progressPercentage}%` },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>

          {totalTasks === 0 && (
            <View style={tw`mt-4`}>
              <Text style={tw`text-sm text-gray-600 mb-3`}>
                📅 {t('home.no_tasks_title')}
              </Text>
              <Text style={tw`text-sm text-gray-500 text-center`}>
                {t('home.tasks_will_appear_automatically')}
              </Text>
            </View>
          )}
          <TaskTimer userId={user?.uid} />

          {hasIncompleteTasks && totalTasks > 0 && (
            <View
              style={tw`mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg`}
            >
              <Text style={tw`text-yellow-700 text-sm font-medium mb-1`}>
                {t('home.complete_all_tasks_to_unlock')}
              </Text>
              <Text style={tw`text-yellow-600 text-xs`}>
                {t('home.complete_tasks_to_unlock_help')}
              </Text>
            </View>
          )}
          <View style={tw`py-4`}>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={async (taskId) => {
                  try {
                    await toggleTaskCompletion(taskId);
                  } catch (error) {
                    console.error(
                      ' Home screen: Error toggling task completion:',
                      error,
                    );
                  }
                }}
              />
            ))}
          </View>

          {totalTasks > 0 && completedTasks === totalTasks && (
            <View style={tw`mt-6 mb-4`}>
              <View
                style={tw`bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-sm`}
              >
                <View style={tw`items-center`}>
                  <Text style={tw`text-4xl mb-2`}>🎉</Text>
                  <Text
                    style={tw`text-green-700 text-xl font-bold text-center mb-2`}
                  >
                    {t('home.all_tasks_completed')}
                  </Text>
                  <Text
                    style={tw`text-green-600 text-center text-base leading-6`}
                  >
                    {t('home.all_tasks_completed_message')}
                  </Text>
                  <Text style={tw`text-green-500 text-center text-sm mt-2`}>
                    {t('home.new_tasks_tomorrow')}
                  </Text>
                </View>
              </View>

              <View style={tw`mt-3`}></View>
            </View>
          )}
        </View>
      </ScrollView>
    </LayoutWrapper>
  );
}

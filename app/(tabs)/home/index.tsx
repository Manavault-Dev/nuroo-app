import LayoutWrapper from '@/components/LayoutWrappe/LayoutWrapper';
import { useAuth } from '@/context/AuthContext';
import { useAutoTaskGeneration } from '@/hooks/homeHooks/useAutoTaskGeneration';
import { useChildData } from '@/hooks/homeHooks/useChildData';
import { useTaskGeneration } from '@/hooks/homeHooks/useTaskGeneration';
import { useTaskManagement } from '@/hooks/homeHooks/useTaskManagement';
import tw from '@/lib/design/tw';
import { homeStyles } from '@/lib/home/home.styles';
import { Task } from '@/lib/home/home.types';
import { formatProgressPercentage } from '@/lib/home/home.utils';
import { ProgressService } from '@/lib/services/progressService';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
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
  const { generating, generateDailyTasks } = useTaskGeneration(childData);
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
    if (childData && user?.uid) {
      checkAndGenerateTasks();
    }
  }, [childData, user?.uid, checkAndGenerateTasks]);

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
          {firebaseError && (
            <View
              style={tw`mb-4 p-3 bg-red-50 border border-red-200 rounded-lg`}
            >
              <Text style={tw`text-red-700 text-sm font-medium mb-1`}>
                ⚠️ Database Configuration Issue
              </Text>
              <Text style={tw`text-red-600 text-xs`}>{firebaseError}</Text>
              <Text style={tw`text-red-500 text-xs mt-1`}>
                Please contact support if this persists.
              </Text>
            </View>
          )}

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
              {hasIncompleteTasks ? (
                <View
                  style={tw`mb-4 p-4 bg-red-50 border border-red-200 rounded-lg`}
                >
                  <Text
                    style={tw`text-red-700 text-base font-bold mb-2`}
                    numberOfLines={2}
                  >
                    {t('home.cannot_generate_tasks')}
                  </Text>
                  <Text
                    style={tw`text-red-600 text-sm mb-3 leading-5`}
                    numberOfLines={3}
                  >
                    {t('home.incomplete_tasks_warning')}
                  </Text>
                  <Text
                    style={tw`text-red-500 text-xs mb-3 leading-4`}
                    numberOfLines={2}
                  >
                    {t('home.incomplete_tasks_help')}
                  </Text>
                  <Pressable
                    style={tw`bg-red-100 border border-red-300 rounded-lg px-3 py-2`}
                    onPress={() => {
                      if (user?.uid) {
                        fetchTasks(user.uid);
                      }
                    }}
                  >
                    <Text
                      style={tw`text-red-700 text-xs font-medium text-center`}
                      numberOfLines={1}
                    >
                      {t('home.view_incomplete_tasks')}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <Text style={tw`text-sm text-gray-600 mb-3`}>
                    📅 {t('home.no_tasks_title')}
                  </Text>
                  <Pressable
                    style={[
                      homeStyles.generateButton,
                      hasIncompleteTasks && tw`opacity-50 bg-gray-400`,
                    ]}
                    onPress={() => generateDailyTasks(setTasks)}
                    disabled={
                      generating || autoGenerating || hasIncompleteTasks
                    }
                  >
                    {generating || autoGenerating ? (
                      <View style={tw`flex-row items-center`}>
                        <ActivityIndicator size="small" color="white" />
                        <Text style={homeStyles.generateButtonText}>
                          {autoGenerating
                            ? t('home.auto_generating')
                            : t('home.generating')}
                        </Text>
                      </View>
                    ) : hasIncompleteTasks ? (
                      <Text
                        style={[
                          homeStyles.generateButtonText,
                          tw`text-gray-600`,
                        ]}
                      >
                        {t('home.complete_all_tasks_first')}
                      </Text>
                    ) : (
                      <Text style={homeStyles.generateButtonText}>
                        {t('home.generate_button')}
                      </Text>
                    )}
                  </Pressable>
                  <Text style={homeStyles.helpText}>
                    💡 {t('home.help_text')}
                  </Text>
                </>
              )}
            </View>
          )}

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

          {/* Celebration and Generate More Tasks Section */}
          {totalTasks > 0 &&
            completedTasks === totalTasks &&
            !hasIncompleteTasks && (
              <View style={tw`mt-6 mb-4`}>
                <View
                  style={tw`bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-sm`}
                >
                  <View style={tw`items-center mb-4`}>
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
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      tw`bg-green-500 py-4 px-6 rounded-xl shadow-lg mb-3`,
                      pressed && tw`scale-95 opacity-90`,
                    ]}
                    onPress={async () => {
                      if (!childData || !user?.uid) return;

                      try {
                        const { TaskCompletionService } = await import(
                          '@/lib/services/taskCompletionService'
                        );
                        await TaskCompletionService.offerMoreTasks(
                          user.uid,
                          childData,
                          t('date.locale'),
                          (newTasks) => {
                            // Refresh tasks to show new ones
                            fetchTasks(user.uid);
                          },
                        );
                      } catch (error) {
                        console.error('Error offering more tasks:', error);
                        Alert.alert(
                          'Error',
                          'Failed to generate more tasks. Please try again.',
                        );
                      }
                    }}
                  >
                    <Text style={tw`text-white font-bold text-lg text-center`}>
                      {t('home.generate_more_tasks')}
                    </Text>
                  </Pressable>

                  <Text style={tw`text-green-600 text-center text-sm`}>
                    {t('home.generate_more_tasks_help')}
                  </Text>
                </View>
              </View>
            )}
        </View>
      </ScrollView>
    </LayoutWrapper>
  );
}

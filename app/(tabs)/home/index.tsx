import { HomeSkeleton } from '@/components/Home/HomeSkeleton';
import { TaskItem } from '@/components/Home/TaskItem';
import LayoutWrapper from '@/components/LayoutWrappe/LayoutWrapper';
import { TaskTimer } from '@/components/TaskTimer/TaskTimer';
import { useAuth } from '@/features/auth/AuthContext';
import { useAutoTaskGeneration } from '@/hooks/homeHooks/useAutoTaskGeneration';
import { useChildData } from '@/hooks/homeHooks/useChildData';
import { useTaskManagement } from '@/hooks/homeHooks/useTaskManagement';
import tw from '@/lib/design/tw';
import { homeStyles } from '@/lib/home/home.styles';
import { Task } from '@/lib/home/home.types';
import { formatProgressPercentage } from '@/lib/home/home.utils';
import { DailyLimitsService } from '@/lib/services/dailyLimitsService';
import { NotificationEvents } from '@/lib/services/notificationEventEmitter';
import { ProgressService } from '@/lib/services/progressService';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasIncompleteTasks, setHasIncompleteTasks] = useState(false);
  const [hasNewTasks, setHasNewTasks] = useState(false);
  const hasCheckedMorningTasks = useRef(false);
  const lastCompletedCount = useRef(0);
  const lastTaskCount = useRef(0);
  const bannerOpacity = useRef(new Animated.Value(0)).current;

  const { childData, fetchChildData } = useChildData();
  const { fetchTasks, toggleTaskCompletion, setLoadingState } =
    useTaskManagement(setTasks, setLoading);
  const { autoGenerating, checkAndGenerateTasks } = useAutoTaskGeneration(
    childData,
    setTasks,
    setLoadingState,
  );

  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const refreshOnFocus = async () => {
        if (user?.uid && childData && isMounted) {
          console.log('📱 Screen focused, checking for updates...');
          try {
            await fetchTasks(user.uid);
          } catch (error) {
            console.error('Error refreshing on focus:', error);
          }
        }
      };

      refreshOnFocus();

      return () => {
        isMounted = false;
      };
    }, [user?.uid, childData, fetchTasks]),
  );

  useEffect(() => {
    const currentTaskCount = tasks.length;

    if (lastTaskCount.current > 0 && currentTaskCount > lastTaskCount.current) {
      setHasNewTasks(true);
      showBanner();
    }

    lastTaskCount.current = currentTaskCount;
  }, [tasks.length]);

  // Animate banner in/out
  const showBanner = () => {
    Animated.sequence([
      Animated.timing(bannerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(5000),
      Animated.timing(bannerOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setHasNewTasks(false));
  };

  const handleBannerTap = async () => {
    setHasNewTasks(false);
    Animated.timing(bannerOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    await handleRefresh();
  };

  useEffect(() => {
    let isMounted = true;

    const checkMorningTasks = async () => {
      if (user && childData && !hasCheckedMorningTasks.current && isMounted) {
        hasCheckedMorningTasks.current = true;
        try {
          console.log('🌅 Checking for morning task generation...');
          const generated =
            await DailyLimitsService.generateMorningTasksIfNeeded(
              user.uid,
              childData,
              t('language.code', { lng: 'en' }),
            );

          if (generated && isMounted) {
            console.log('🌅 Morning tasks generated, refreshing task list...');
            await fetchTasks(user.uid);
          }
        } catch (error: unknown) {
          if (isMounted) {
            console.error('Error checking morning tasks:', error);
          }
        }
      }
    };

    checkMorningTasks();

    return () => {
      isMounted = false;
    };
  }, [user?.uid, childData?.name, fetchTasks, t]);

  const displayedTasks = tasks.slice(0, 4);
  const totalTasks = displayedTasks.length;
  const completedTasks = displayedTasks.filter((task) => task.completed).length;
  const progressPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  useEffect(() => {
    let isMounted = true;

    const autoGenerateWhenCompleted = async () => {
      if (user && childData && tasks.length > 0 && isMounted) {
        const allCompleted = tasks.every((task) => task.completed);
        if (allCompleted && lastCompletedCount.current !== completedTasks) {
          lastCompletedCount.current = completedTasks;
          try {
            console.log('🔄 All tasks completed, auto-generating new ones...');
            const generated =
              await DailyLimitsService.generateMorningTasksIfNeeded(
                user.uid,
                childData,
                t('language.code', { lng: 'en' }),
              );

            if (generated && isMounted) {
              console.log('🔄 New tasks auto-generated after completion');
              await fetchTasks(user.uid);
              lastCompletedCount.current = 0;
            }
          } catch (error: unknown) {
            if (isMounted) {
              console.error(
                'Error auto-generating tasks after completion:',
                error,
              );
            }
          }
        }
      }
    };

    autoGenerateWhenCompleted();

    return () => {
      isMounted = false;
    };
  }, [completedTasks, totalTasks, user, childData, fetchTasks, t]);

  const today = new Date().toLocaleDateString(t('date.locale'), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    if (user?.uid) {
      fetchChildData(user.uid);
    }
  }, [user?.uid, fetchChildData]);

  useEffect(() => {
    let isMounted = true;

    if (user?.uid && childData) {
      fetchTasks(user.uid).catch((error: unknown) => {
        if (!isMounted) return;

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

    return () => {
      isMounted = false;
    };
  }, [user?.uid, childData, fetchTasks]);

  useEffect(() => {
    let isMounted = true;

    if (childData && user?.uid && isMounted) {
      checkAndGenerateTasks();
    }

    return () => {
      isMounted = false;
    };
  }, [childData, user?.uid, checkAndGenerateTasks]);

  useEffect(() => {
    let isMounted = true;

    const checkIncompleteTasks = async () => {
      if (user?.uid && isMounted) {
        try {
          const incomplete = await ProgressService.hasIncompleteTasks(user.uid);
          if (isMounted) {
            setHasIncompleteTasks(incomplete);
          }
        } catch (error) {
          if (isMounted) {
            console.error('Error checking incomplete tasks:', error);
          }
        }
      }
    };

    checkIncompleteTasks();

    return () => {
      isMounted = false;
    };
  }, [user?.uid, tasks]);

  useEffect(() => {
    console.log('📊 Home screen state changed:', {
      loading,
      tasksCount: tasks.length,
      hasUser: !!user?.uid,
      hasChildData: !!childData,
    });
  }, [loading, tasks.length, user?.uid, childData]);

  // Listen for notification taps
  useEffect(() => {
    console.log('🔔 Setting up notification tap listener');

    const unsubscribe = NotificationEvents.onTasksGeneratedTap(async () => {
      console.log('📱 Notification tapped! Refreshing tasks...');

      // Haptic feedback for better UX
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Refresh tasks to show newly generated ones
      if (user?.uid) {
        try {
          setLoading(true);
          await Promise.all([fetchChildData(user.uid), fetchTasks(user.uid)]);
          console.log('✅ Tasks refreshed after notification tap');
        } catch (error) {
          console.error('❌ Error refreshing tasks after notification:', error);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => {
      console.log('🔔 Cleaning up notification tap listener');
      unsubscribe();
    };
  }, [user?.uid, fetchTasks, fetchChildData]);

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setLoading(true);
    setRefreshing(true);
    setFirebaseError(null);

    if (user?.uid) {
      try {
        await Promise.all([fetchChildData(user.uid), fetchTasks(user.uid)]);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error: unknown) {
        console.error('❌ Error refreshing tasks:', error);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

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

    setLoading(false);
    setRefreshing(false);
  };

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
      <View style={tw`flex-1`}>
        {/* New Tasks Banner - Instagram style */}
        {hasNewTasks && (
          <Animated.View
            style={[
              tw`absolute top-0 left-0 right-0 z-50`,
              { opacity: bannerOpacity },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleBannerTap}
              style={tw`mx-4 mt-2 bg-primary rounded-full shadow-lg`}
            >
              <View style={tw`px-5 py-3 flex-row items-center justify-center`}>
                <Text style={tw`text-white font-semibold mr-2`}>
                  🎯 New tasks available
                </Text>
                <Text style={tw`text-white/80`}>— tap to refresh</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        <ScrollView
          style={tw`flex-1 bg-gray-50`}
          contentContainerStyle={homeStyles.taskList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#4FD1C7"
              colors={['#4FD1C7', '#1D2B64']}
              progressBackgroundColor="#ffffff"
              title={t('home.loading')}
              titleColor="#6B7280"
            />
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
              {displayedTasks.map((task) => (
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
      </View>
    </LayoutWrapper>
  );
}

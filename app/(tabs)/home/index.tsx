import { HomeSkeleton } from '@/components/Home/HomeSkeleton';
import { TaskItem } from '@/components/Home/TaskItem';
import LayoutWrapper from '@/components/LayoutWrappe/LayoutWrapper';
import { TaskTimer } from '@/components/TaskTimer/TaskTimer';
import { useAuth } from '@/features/auth/AuthContext';
import { useChildData } from '@/hooks/homeHooks/useChildData';
import { useDailyTasksSync } from '@/hooks/homeHooks/useDailyTasksSync';
import tw from '@/lib/design/tw';
import { formatProgressPercentage } from '@/lib/home/home.utils';
import { NotificationEvents } from '@/lib/services/notificationEventEmitter';
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

  // State for UI interactions
  const [hasNewTasks, setHasNewTasks] = useState(false);
  const [lastTaskCount, setLastTaskCount] = useState(0);
  const bannerOpacity = useRef(new Animated.Value(0)).current;

  // Child data hook
  const { childData, fetchChildData } = useChildData();

  const { tasks, loading, refreshing, error, onRefresh, hasCheckedToday } =
    useDailyTasksSync({
      userId: user?.uid || '',
      childData,
    });

  // Debug logging helper
  const debugLog = useCallback((message: string, data?: any) => {
    if (__DEV__) {
      console.log(`🏠 [HomeScreen] ${message}`, data || '');
    }
  }, []);

  // Handle new tasks banner animation
  useEffect(() => {
    const currentTaskCount = tasks.length;

    if (lastTaskCount > 0 && currentTaskCount > lastTaskCount) {
      debugLog('New tasks detected, showing banner', {
        previous: lastTaskCount,
        current: currentTaskCount,
      });
      setHasNewTasks(true);
      showBanner();
    }

    setLastTaskCount(currentTaskCount);
  }, [tasks.length, lastTaskCount, debugLog]);

  // Animate banner in/out
  const showBanner = useCallback(() => {
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
  }, [bannerOpacity]);

  // Handle banner tap
  const handleBannerTap = useCallback(async () => {
    debugLog('Banner tapped, refreshing tasks');
    setHasNewTasks(false);
    Animated.timing(bannerOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await onRefresh();
  }, [onRefresh, bannerOpacity, debugLog]);

  // Handle manual refresh with haptic feedback
  const handleRefresh = useCallback(async () => {
    debugLog('Manual refresh triggered');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await Promise.all([fetchChildData(user?.uid || ''), onRefresh()]);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      debugLog('Error during refresh', { error: err });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [onRefresh, fetchChildData, user?.uid, debugLog]);

  // Handle task completion
  const handleTaskCompletion = useCallback(
    async (taskId: string) => {
      if (!user?.uid) return;

      debugLog('Task completion toggled', { taskId });

      try {
        // Find the task to get current completion status
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;

        // Toggle the completion status
        const newCompletedStatus = !task.completed;

        // Update in Firestore
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase/firebase');

        await updateDoc(doc(db, 'tasks', taskId), {
          completed: newCompletedStatus,
          completedAt: newCompletedStatus ? new Date().toISOString() : null,
        });

        Haptics.notificationAsync(
          newCompletedStatus
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Warning,
        );

        // Trigger refresh to update the UI
        await onRefresh();
      } catch (err) {
        debugLog('Error toggling task completion', { error: err });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    },
    [user?.uid, tasks, onRefresh, debugLog],
  );

  // Listen for notification taps
  useEffect(() => {
    debugLog('Setting up notification tap listener');

    const unsubscribe = NotificationEvents.onTasksGeneratedTap(async () => {
      debugLog('Notification tapped, refreshing tasks');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      try {
        await Promise.all([fetchChildData(user?.uid || ''), onRefresh()]);
        debugLog('Tasks refreshed after notification tap');
      } catch (err) {
        debugLog('Error refreshing after notification', { error: err });
      }
    });

    return () => {
      debugLog('Cleaning up notification tap listener');
      unsubscribe();
    };
  }, [onRefresh, fetchChildData, user?.uid]); // Remove debugLog from dependencies

  // Load child data on mount
  useEffect(() => {
    if (user?.uid) {
      debugLog('Loading child data on mount');
      fetchChildData(user.uid);
    }
  }, [user?.uid]); // Remove fetchChildData and debugLog from dependencies

  // Display logic
  const displayedTasks = tasks.slice(0, 4);
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Show skeleton while loading
  if (loading && tasks.length === 0) {
    return (
      <LayoutWrapper>
        <HomeSkeleton />
      </LayoutWrapper>
    );
  }

  // Show error state
  if (error && tasks.length === 0) {
    return (
      <LayoutWrapper>
        <View style={tw`flex-1 justify-center items-center p-6`}>
          <Text style={tw`text-lg text-red-600 text-center mb-4`}>{error}</Text>
          <TouchableOpacity
            style={tw`bg-primary px-6 py-3 rounded-lg`}
            onPress={handleRefresh}
          >
            <Text style={tw`text-white font-semibold`}>
              {t('common.try_again')}
            </Text>
          </TouchableOpacity>
        </View>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`pb-6`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
      >
        {/* New Tasks Banner */}
        {hasNewTasks && (
          <Animated.View
            style={[
              tw`mx-4 mb-4 bg-green-100 border border-green-200 rounded-lg p-3`,
              { opacity: bannerOpacity },
            ]}
          >
            <TouchableOpacity onPress={handleBannerTap}>
              <Text style={tw`text-green-800 text-center font-medium`}>
                🎉 {t('home.new_tasks_available')}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Progress Header */}
        <View style={tw`px-4 mb-6`}>
          <Text style={tw`text-2xl font-bold text-gray-800 mb-2`}>
            {t('home.good_morning')}, {childData?.name || t('home.user')}!
          </Text>

          <View
            style={tw`bg-white rounded-xl p-4 shadow-sm border border-gray-100`}
          >
            <View style={tw`flex-row items-center justify-between mb-3`}>
              <Text style={tw`text-lg font-semibold text-gray-700`}>
                {t('home.today_progress')}
              </Text>
              <Text style={tw`text-lg font-bold text-primary`}>
                {formatProgressPercentage(completedTasks, totalTasks)}
              </Text>
            </View>

            <View style={tw`w-full bg-gray-200 rounded-full h-3`}>
              <View
                style={[
                  tw`bg-primary h-3 rounded-full`,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>

            <Text style={tw`text-sm text-gray-600 mt-2`}>
              {completedTasks} {t('home.of')} {totalTasks}{' '}
              {t('home.tasks_completed')}
            </Text>
          </View>
        </View>

        {/* Tasks List */}
        <View style={tw`px-4`}>
          <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>
            {t('home.todays_tasks')}
          </Text>

          {displayedTasks.length > 0 ? (
            <View style={tw`gap-3`}>
              {displayedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={handleTaskCompletion}
                />
              ))}
            </View>
          ) : (
            <View style={tw`bg-gray-50 rounded-xl p-6 items-center`}>
              <Text style={tw`text-gray-600 text-center text-lg`}>
                {t('home.no_tasks_today')}
              </Text>
              <Text style={tw`text-gray-500 text-center text-sm mt-2`}>
                {t('home.pull_to_refresh')}
              </Text>
            </View>
          )}
        </View>

        {/* Task Timer */}
        {tasks.length > 0 && (
          <View style={tw`px-4 mt-6`}>
            <TaskTimer />
          </View>
        )}

        {/* Development Testing Panel */}
        {/* <DevTestingPanel
          userId={user?.uid || ''}
          childData={childData}
          onTasksUpdated={onRefresh}
        /> */}

        {/* Debug Info (Development Only) */}
        {/* {__DEV__ && (
          <View style={tw`mx-4 mt-4 p-3 bg-gray-100 rounded-lg`}>
            <Text style={tw`text-xs text-gray-600`}>
              Debug: Tasks: {tasks.length}, Loading: {loading.toString()}, 
              Refreshing: {refreshing.toString()}, Checked Today: {hasCheckedToday.toString()}
            </Text>
          </View>
        )} */}
      </ScrollView>
    </LayoutWrapper>
  );
}

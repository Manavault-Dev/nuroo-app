import LayoutWrapper from '@/components/LayoutWrappe/LayoutWrapper';
import { useAuth } from '@/context/AuthContext';
import { useAutoTaskGeneration } from '@/hooks/homeHooks/useAutoTaskGeneration';
import tw from '@/lib/design/tw';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { HomeSkeleton } from './components/HomeSkeleton';
import { TaskItem } from './components/TaskItem';
import {
  useChildData,
  useTaskGeneration,
  useTaskManagement,
} from './home.hooks';
import { homeStyles } from './home.styles';
import { Task } from './home.types';
import { formatProgressPercentage } from './home.utils';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { childData, fetchChildData } = useChildData();
  const { generating, generateDailyTasks } = useTaskGeneration(childData);
  const { fetchTasks, toggleTaskCompletion, setLoadingState } =
    useTaskManagement(setTasks, setLoading);
  const { autoGenerating, checkAndGenerateTasks } = useAutoTaskGeneration(
    childData,
    setTasks,
    setLoadingState,
  );

  const today = new Date().toLocaleDateString('en-US', {
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
      fetchTasks(user.uid);
    }
  }, [user?.uid, childData, fetchTasks]);

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
    if (user?.uid) {
      await fetchTasks(user.uid);
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
        <View style={tw`p-4`}>
          <Text style={tw`text-center text-gray-600 mb-4`}>
            Debug: Loading state is stuck. Tasks count: {tasks.length}
          </Text>

          <Pressable
            style={tw`bg-red-500 py-3 px-6 rounded-lg mb-2`}
            onPress={() => {
              console.log('🛑 Force stop loading');
              setLoading(false);
            }}
          >
            <Text style={tw`text-white font-semibold text-center`}>
              Force Stop Loading
            </Text>
          </Pressable>

          <Pressable
            style={tw`bg-blue-500 py-3 px-6 rounded-lg mb-2`}
            onPress={() => {
              console.log('🔍 Manual fetch tasks');
              if (user?.uid) {
                fetchTasks(user.uid);
              }
            }}
          >
            <Text style={tw`text-white font-semibold text-center`}>
              Manual Fetch Tasks
            </Text>
          </Pressable>

          <Pressable
            style={tw`bg-green-500 py-3 px-6 rounded-lg`}
            onPress={() => {
              console.log('🚀 Force generate tasks');
              if (user?.uid && childData) {
                generateDailyTasks(setTasks);
              }
            }}
          >
            <Text style={tw`text-white font-semibold text-center`}>
              Force Generate Tasks
            </Text>
          </Pressable>
        </View>
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
                    {completedTasks} of {totalTasks} tasks completed
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
              <Pressable
                style={homeStyles.generateButton}
                onPress={() => generateDailyTasks(setTasks)}
                disabled={generating || autoGenerating}
              >
                {generating || autoGenerating ? (
                  <View style={tw`flex-row items-center`}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={homeStyles.generateButtonText}>
                      {autoGenerating
                        ? '🤖 Auto-generating...'
                        : t('home.generating')}
                    </Text>
                  </View>
                ) : (
                  <Text style={homeStyles.generateButtonText}>
                    {t('home.generate_button')}
                  </Text>
                )}
              </Pressable>
              <Text style={homeStyles.helpText}>💡 {t('home.help_text')}</Text>
            </View>
          )}

          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={toggleTaskCompletion}
            />
          ))}
        </View>
      </ScrollView>
    </LayoutWrapper>
  );
}

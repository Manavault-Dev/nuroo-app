import tw from '@/lib/design/tw';
import { auth } from '@/lib/firebase/firebase';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { TaskItem } from './components/TaskItem';
import {
  useChildData,
  useTaskGeneration,
  useTaskManagement,
} from './home.hooks';
import { homeStyles } from './home.styles';
import { formatProgressPercentage } from './home.utils';

export default function HomeScreen() {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const { childData, fetchChildData } = useChildData();
  const {
    tasks,
    loading,
    fetchTasks,
    toggleTaskCompletion,
    clearTasks,
    setTasks,
  } = useTaskManagement();
  const { generating, generateDailyTasks } = useTaskGeneration(childData);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const fetchData = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    await Promise.all([
      fetchChildData(currentUser.uid),
      fetchTasks(currentUser.uid),
    ]);
  }, [fetchChildData, fetchTasks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleGenerateTasks = useCallback(async () => {
    await generateDailyTasks(setTasks);
  }, [generateDailyTasks, setTasks]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <View style={homeStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D3557" />
        <Text style={homeStyles.loadingText}>{t('home.loading')}</Text>
      </View>
    );
  }

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;

  return (
    <View style={homeStyles.container}>
      <View style={homeStyles.header}>
        <View style={homeStyles.headerRow}>
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-primary font-bold text-lg`}>Nuroo</Text>
          </View>
          {childData?.name && (
            <Text style={tw`text-sm text-gray-600`}>for {childData.name}</Text>
          )}
        </View>

        <Text style={homeStyles.headerTitle}>{t('home.title')}</Text>
        <Text style={homeStyles.headerSubtitle}>{today}</Text>

        <View style={homeStyles.progressContainer}>
          <Text style={homeStyles.progressText}>
            {t('home.progress')}{' '}
            <Text style={tw`text-primary`}>
              {completedTasks}/{totalTasks}
            </Text>
          </Text>
          <View style={homeStyles.progressBar}>
            <View
              style={[
                homeStyles.progressFill,
                { width: formatProgressPercentage(completedTasks, totalTasks) },
              ]}
            />
          </View>
        </View>

        {totalTasks === 0 && (
          <View style={tw`mt-4`}>
            <Text style={tw`text-sm text-gray-600 mb-3`}>
              📅 {t('home.no_tasks_title')}
            </Text>
            <Pressable
              style={homeStyles.generateButton}
              onPress={() => generateDailyTasks(setTasks)}
              disabled={generating}
            >
              {generating ? (
                <View style={tw`flex-row items-center`}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={homeStyles.generateButtonText}>
                    {t('home.generating')}
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
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={homeStyles.taskList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TaskItem task={item} onToggleComplete={toggleTaskCompletion} />
        )}
      />
    </View>
  );
}

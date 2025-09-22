import tw from '@/lib/design/tw';
import { auth, db } from '@/lib/firebase/firebase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  time: string;
  emoji: string;
  completed: boolean;
  createdAt: Date;
  developmentArea: string;
  userId: string;
}

export default function TaskPage() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser || !id) return;

        const taskDoc = await getDoc(doc(db, 'tasks', String(id)));
        if (taskDoc.exists()) {
          const taskData = taskDoc.data();
          setTask({
            ...taskData,
            id: taskDoc.id,
            createdAt: (taskData.createdAt as Timestamp).toDate(),
          } as Task);
        }
      } catch (error) {
        console.error('Error fetching task:', error);
        Alert.alert(t('common.error'), t('tasks.task_not_found'));
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, t]);

  const markTaskComplete = async () => {
    if (!task) return;

    setUpdating(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const updatedTask = { ...task, completed: !task.completed };
      setTask(updatedTask);

      await setDoc(
        doc(db, 'tasks', task.id),
        { completed: !task.completed },
        { merge: true },
      );

      Alert.alert(
        updatedTask.completed ? t('common.success') : t('common.success'),
        updatedTask.completed
          ? t('tasks.completed_message')
          : t('tasks.completed_subtitle'),
      );
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert(t('common.error'), t('common.error'));
      setTask(task);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={tw`flex-1 bg-gray-50 justify-center items-center`}>
        <ActivityIndicator size="large" color="#1D2B64" />
        <Text style={tw`text-gray-600 mt-4 text-lg`}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={tw`flex-1 justify-center items-center px-6 bg-gray-50`}>
        <View
          style={tw`bg-white p-8 rounded-2xl shadow-sm border border-gray-200 items-center`}
        >
          <Text style={tw`text-6xl mb-4`}>😕</Text>
          <Text style={tw`text-xl font-bold text-gray-800 mb-2 text-center`}>
            {t('tasks.task_not_found')}
          </Text>
          <Text style={tw`text-gray-600 text-center mb-6`}>
            This task might have been deleted or moved.
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={tw`bg-primary py-4 px-8 rounded-xl shadow-sm`}
          >
            <Text style={tw`text-white font-semibold text-lg`}>
              {t('tasks.go_back')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={tw`flex-1 bg-gray-50`}
      contentContainerStyle={tw`px-4 pt-16 pb-8`}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          tw`bg-white rounded-2xl p-6 mb-6 shadow-sm border`,
          task.completed
            ? tw`border-green-200 bg-gradient-to-br from-green-50 to-green-100/50`
            : tw`border-gray-200`,
        ]}
      >
        <View style={tw`flex-row items-center justify-between mb-4`}>
          <View
            style={tw`w-16 h-16 bg-gray-100 rounded-2xl items-center justify-center`}
          >
            <Text style={tw`text-3xl`}>{task.emoji}</Text>
          </View>
          <View
            style={[
              tw`px-4 py-2 rounded-full`,
              task.completed ? tw`bg-green-500` : tw`bg-blue-500`,
            ]}
          >
            <Text style={tw`text-white font-semibold text-sm`}>
              {task.completed
                ? t('tasks.completed_status')
                : t('tasks.in_progress_status')}
            </Text>
          </View>
        </View>

        <Text
          style={[
            tw`text-2xl font-bold leading-8 mb-2`,
            task.completed
              ? tw`text-green-700 line-through`
              : tw`text-gray-900`,
          ]}
        >
          {task.title}
        </Text>

        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-sm text-gray-500`}>📂</Text>
            <Text style={tw`text-sm text-gray-600 ml-1 font-medium`}>
              {task.category}
            </Text>
          </View>
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-sm text-gray-500`}>⏱️</Text>
            <Text style={tw`text-sm text-gray-600 ml-1 font-medium`}>
              {task.time}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={tw`bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200`}
      >
        <View style={tw`flex-row items-center mb-4`}>
          <Text style={tw`text-lg font-bold text-gray-900`}>📝</Text>
          <Text style={tw`text-lg font-bold text-gray-900 ml-2`}>
            {t('tasks.task_details')}
          </Text>
        </View>
        <Text style={tw`text-base text-gray-700 leading-6`}>
          {task.description}
        </Text>
      </View>

      <View style={tw`mb-6`}>
        <View
          style={tw`bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-200`}
        >
          <View style={tw`flex-row items-center`}>
            <View
              style={tw`w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mr-3`}
            >
              <Text style={tw`text-lg`}>📂</Text>
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm text-gray-500 mb-1`}>
                {t('tasks.category')}
              </Text>
              <Text style={tw`text-base font-semibold text-gray-900`}>
                {task.category}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={tw`bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-200`}
        >
          <View style={tw`flex-row items-center`}>
            <View
              style={tw`w-10 h-10 bg-yellow-100 rounded-xl items-center justify-center mr-3`}
            >
              <Text style={tw`text-lg`}>⏰</Text>
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm text-gray-500 mb-1`}>
                {t('tasks.duration')}
              </Text>
              <Text style={tw`text-base font-semibold text-gray-900`}>
                {task.time}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={tw`bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-200`}
        >
          <View style={tw`flex-row items-center`}>
            <View
              style={tw`w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mr-3`}
            >
              <Text style={tw`text-lg`}>🎯</Text>
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-sm text-gray-500 mb-1`}>
                {t('tasks.focus_area')}
              </Text>
              <Text
                style={tw`text-base font-semibold text-gray-900 capitalize`}
              >
                {task.developmentArea}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={tw`space-y-4`}>
        <Pressable
          onPress={markTaskComplete}
          disabled={updating}
          style={({ pressed }) => [
            tw`py-4 px-4 mb-4 rounded-2xl shadow-sm`,
            task.completed ? tw`bg-orange-500` : tw`bg-primary`,
            updating && tw`opacity-50`,
            pressed && tw`scale-95`,
          ]}
        >
          {updating ? (
            <View style={tw`flex-row items-center justify-center`}>
              <ActivityIndicator size="small" color="white" />
              <Text style={tw`text-white font-semibold ml-2 text-lg`}>
                {t('tasks.updating')}
              </Text>
            </View>
          ) : (
            <Text
              style={tw`text-white font-semibold text-center text-base`}
              numberOfLines={2}
            >
              {task.completed
                ? t('tasks.reopen_task')
                : t('tasks.mark_complete')}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            tw`py-4 px-6 rounded-2xl border border-gray-300 bg-white shadow-sm`,
            pressed && tw`scale-95 opacity-80`,
          ]}
        >
          <Text style={tw`text-gray-700 font-semibold text-center text-base`}>
            {t('tasks.back_to_tasks')}
          </Text>
        </Pressable>
      </View>

      {task.completed && (
        <View
          style={tw`mt-6 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 shadow-sm`}
        >
          <View style={tw`items-center`}>
            <Text style={tw`text-4xl mb-3`}>🎉</Text>
            <Text style={tw`text-green-700 text-center font-bold text-lg mb-2`}>
              {t('tasks.completed_message')}
            </Text>
            <Text style={tw`text-green-600 text-center text-base`}>
              {t('tasks.completed_subtitle')}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

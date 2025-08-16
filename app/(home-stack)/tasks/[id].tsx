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
      <View style={tw`flex-1 bg-white justify-center items-center`}>
        <ActivityIndicator size="large" color="#1D3557" />
        <Text style={tw`text-gray-600 mt-4`}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={tw`flex-1 justify-center items-center px-4`}>
        <Text style={tw`text-xl font-bold text-red-500`}>
          {t('tasks.task_not_found')}
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={tw`mt-4 bg-primary py-3 px-6 rounded-xl`}
        >
          <Text style={tw`text-white font-semibold`}>{t('tasks.go_back')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={tw`flex-1 bg-white`}
      contentContainerStyle={tw`px-4 pt-14 pb-8`}
    >
      <View
        style={[
          tw`p-6 rounded-2xl mb-6`,
          task.completed
            ? tw`bg-green-50 border border-green-200`
            : tw`bg-blue-50 border border-blue-200`,
        ]}
      >
        <Text style={tw`text-3xl mb-2`}>{task.emoji}</Text>
        <Text
          style={[
            tw`text-2xl font-bold mb-2`,
            task.completed ? tw`text-green-700` : tw`text-primary`,
          ]}
        >
          {task.title}
        </Text>
        <Text
          style={[
            tw`text-sm font-medium px-3 py-1 rounded-full self-start`,
            task.completed
              ? tw`bg-green-200 text-green-700`
              : tw`bg-blue-200 text-blue-700`,
          ]}
        >
          {task.completed
            ? t('tasks.completed_status')
            : t('tasks.in_progress_status')}
        </Text>
      </View>

      <View style={tw`mb-6`}>
        <Text style={tw`text-lg font-semibold text-gray-800 mb-3`}>
          {t('tasks.task_details')}
        </Text>

        <View style={tw`bg-gray-50 p-4 rounded-xl mb-4`}>
          <Text style={tw`text-base text-gray-700 leading-6`}>
            {task.description}
          </Text>
        </View>

        <View
          style={tw`flex-row items-center justify-between bg-white p-4 rounded-xl border border-gray-200`}
        >
          <View>
            <Text style={tw`text-sm text-gray-500`}>{t('tasks.category')}</Text>
            <Text style={tw`text-base font-medium text-primary`}>
              {task.category}
            </Text>
          </View>
          <View>
            <Text style={tw`text-sm text-gray-500`}>{t('tasks.duration')}</Text>
            <Text style={tw`text-base font-medium text-gray-800`}>
              {task.time}
            </Text>
          </View>
          <View>
            <Text style={tw`text-sm text-gray-500`}>
              {t('tasks.focus_area')}
            </Text>
            <Text style={tw`text-base font-medium text-gray-800 capitalize`}>
              {task.developmentArea}
            </Text>
          </View>
        </View>
      </View>

      <View style={tw`space-y-3`}>
        <Pressable
          onPress={markTaskComplete}
          disabled={updating}
          style={[
            tw`py-4 px-6 rounded-xl`,
            task.completed ? tw`bg-orange-500` : tw`bg-primary`,
          ]}
        >
          {updating ? (
            <View style={tw`flex-row items-center justify-center`}>
              <ActivityIndicator size="small" color="white" />
              <Text style={tw`text-white font-semibold ml-2`}>
                {t('tasks.updating')}
              </Text>
            </View>
          ) : (
            <Text style={tw`text-white font-semibold text-center text-lg`}>
              {task.completed
                ? t('tasks.reopen_task')
                : t('tasks.mark_complete')}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          style={tw`py-3 px-6 rounded-xl border border-gray-300`}
        >
          <Text style={tw`text-gray-700 font-medium text-center`}>
            {t('tasks.back_to_tasks')}
          </Text>
        </Pressable>
      </View>

      {task.completed && (
        <View
          style={tw`mt-6 p-4 bg-green-50 rounded-xl border border-green-200`}
        >
          <Text style={tw`text-green-700 text-center font-medium`}>
            {t('tasks.completed_message')}
          </Text>
          <Text style={tw`text-green-600 text-center text-sm mt-1`}>
            {t('tasks.completed_subtitle')}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

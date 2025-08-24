import { Task, UserProgress } from '@/app/(tabs)/home/home.types';
import { auth, db } from '@/lib/firebase/firebase';
import { NotificationService } from '@/lib/services/notificationService';
import { ProgressService } from '@/lib/services/progressService';
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

export const useTaskManagement = (
  externalSetTasks?: (tasks: Task[]) => void,
  externalSetLoading?: (loading: boolean) => void,
) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchDate, setLastFetchDate] = useState<string | null>(null);
  const [cache, setCache] = useState<Map<string, Task[]>>(new Map());

  const setTasksFunction = externalSetTasks || setTasks;

  const setLoadingState = useCallback(
    (isLoading: boolean) => {
      console.log('🔄 Setting loading state to:', isLoading);
      setLoading(isLoading);
      if (externalSetLoading) {
        externalSetLoading(isLoading);
      }
    },
    [externalSetLoading],
  );

  const mapDevelopmentAreaToProgress = useCallback(
    (developmentArea: string): keyof UserProgress | null => {
      const areaMap: Record<string, keyof UserProgress> = {
        speech: 'communication',
        language: 'communication',
        communication: 'communication',
        social: 'social',
        motor: 'motor_skills',
        cognitive: 'cognitive',
        sensory: 'sensory',
        behavior: 'behavior',
      };

      const result = areaMap[developmentArea.toLowerCase()];
      return result || null;
    },
    [],
  );

  const updateProgressForTask = useCallback(
    async (developmentArea: string, userId: string) => {
      try {
        const progressField = mapDevelopmentAreaToProgress(developmentArea);

        if (progressField) {
          const currentProgress = await ProgressService.getProgress(userId);
          if (currentProgress) {
            const currentValue = currentProgress[progressField];
            const newProgress = Math.min(100, currentValue + 2);
            await ProgressService.updateProgress(
              userId,
              progressField,
              newProgress,
            );
            console.log(
              `✅ Progress updated: ${progressField} increased to ${newProgress}/100`,
            );
          }
        }
      } catch (error) {
        console.error('❌ Error updating progress:', error);
      }
    },
    [mapDevelopmentAreaToProgress],
  );

  const fetchTasks = useCallback(
    async (userId: string) => {
      try {
        const today = new Date().toISOString().split('T')[0];

        if (lastFetchDate === today && tasks.length > 0) {
          console.log('📅 Using cached tasks for today');
          setLoadingState(false);
          return;
        }

        const cacheKey = `${userId}-${today}`;
        if (cache.has(cacheKey)) {
          console.log('📅 Using cached tasks from memory');
          const cachedTasks = cache.get(cacheKey)!;
          setTasksFunction(cachedTasks);
          setLastFetchDate(today);
          setLoadingState(false);
          return;
        }

        console.log('🔍 Fetching tasks for user:', userId);
        setLoadingState(true);

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Task fetching timeout')), 5000);
        });

        const fetchPromise = (async () => {
          const today = new Date().toISOString().split('T')[0];
          const todayAlt = new Date().toDateString();

          let todayTasksQuery = query(
            collection(db, 'tasks'),
            where('userId', '==', userId),
            where('dailyId', '==', today),
          );

          let todayTasksSnapshot = await getDocs(todayTasksQuery);

          if (todayTasksSnapshot.empty) {
            todayTasksQuery = query(
              collection(db, 'tasks'),
              where('userId', '==', userId),
              where('dailyId', '==', todayAlt),
            );
            todayTasksSnapshot = await getDocs(todayTasksQuery);
          }

          if (!todayTasksSnapshot.empty) {
            const existingTasks = todayTasksSnapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                ...data,
                id: doc.id,
                createdAt: data.createdAt?.toDate() || new Date(),
              };
            }) as Task[];

            console.log(`✅ Found ${existingTasks.length} tasks for today`);
            setTasksFunction(existingTasks);
            setLastFetchDate(today);
            setCache((prev) => new Map(prev.set(cacheKey, existingTasks)));
            setLoadingState(false);
            return;
          }

          const allTasksQuery = query(
            collection(db, 'tasks'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
          );

          const allTasksSnapshot = await getDocs(allTasksQuery);
          if (!allTasksSnapshot.empty) {
            const recentTasks = allTasksSnapshot.docs
              .slice(0, 4)
              .map((doc) => ({
                ...doc.data(),
                id: doc.id,
                createdAt: doc.data().createdAt?.toDate() || new Date(),
              })) as Task[];

            setTasksFunction(recentTasks);
            setLastFetchDate(today);
            setCache((prev) => new Map(prev.set(cacheKey, recentTasks)));
            setLoadingState(false);
            return;
          }

          setTasksFunction([]);
          setLastFetchDate(today);
          setCache((prev) => new Map(prev.set(cacheKey, [])));
          setLoadingState(false);
        })();

        await Promise.race([fetchPromise, timeoutPromise]);
      } catch (error: any) {
        console.error('❌ Error fetching tasks:', error);
        setLoadingState(false);
      }
    },
    [setTasksFunction, setLoadingState, lastFetchDate, tasks.length, cache],
  );

  const toggleTaskCompletion = useCallback(
    async (taskId: string) => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const currentTask = tasks.find((t) => t.id === taskId);
        if (!currentTask) return;

        const newCompletedState = !currentTask.completed;
        const updatedTasks = tasks.map((task) =>
          task.id === taskId ? { ...task, completed: newCompletedState } : task,
        );
        setTasksFunction(updatedTasks);

        const taskRef = doc(db, 'tasks', taskId);
        await setDoc(
          taskRef,
          { completed: newCompletedState },
          { merge: true },
        );

        if (newCompletedState) {
          try {
            console.log(
              '📈 Updating progress for completed task:',
              currentTask.developmentArea,
            );
            await updateProgressForTask(
              currentTask.developmentArea,
              currentUser.uid,
            );
            await NotificationService.sendTaskCompletionNotification(
              currentTask.title,
            );
          } catch (error) {
            console.error('❌ Error updating progress:', error);
          }
        }
      } catch (error) {
        console.error('Error updating task:', error);
        Alert.alert('Error', 'Failed to update task. Please try again.');
      }
    },
    [tasks, setTasksFunction, updateProgressForTask],
  );

  const clearTasks = useCallback(() => {
    setTasksFunction([]);
  }, [setTasksFunction]);

  return {
    tasks,
    loading,
    fetchTasks,
    toggleTaskCompletion,
    clearTasks,
    setTasks: setTasksFunction,
    setLoadingState,
  };
};

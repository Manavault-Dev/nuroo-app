import { auth, db } from '@/lib/firebase/firebase';
import { NotificationService } from '@/lib/services/notificationService';
import { ProgressService } from '@/lib/services/progressService';
import { TaskGenerationService } from '@/lib/services/taskGenerationService';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { ChildData, Task, UserProgress } from './home.types';

export const useChildData = () => {
  const [childData, setChildData] = useState<ChildData | null>(null);

  const fetchChildData = useCallback(async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setChildData(data as ChildData);
        console.log('✅ Child data loaded:', data);
      } else {
        console.log('📄 No child data found for user');
      }
    } catch (error) {
      console.error('❌ Error fetching child data:', error);
    }
  }, []);

  return { childData, fetchChildData };
};

export const useTaskGeneration = (childData: ChildData | null) => {
  const [generating, setGenerating] = useState(false);

  const generateDailyTasks = useCallback(
    async (setTasks: (tasks: Task[]) => void) => {
      if (!childData?.developmentAreas?.length) {
        Alert.alert('Error', 'Please complete onboarding first');
        return;
      }

      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          Alert.alert('Error', 'Please sign in first');
          return;
        }

        setGenerating(true);
        console.log('🚀 Starting manual task generation...');

        const shouldGenerate = await ProgressService.shouldGenerateTasks(
          currentUser.uid,
        );

        if (!shouldGenerate) {
          Alert.alert('Info', 'Tasks already exist for today');
          return;
        }

        const newTasks = await TaskGenerationService.generatePersonalizedTasks(
          currentUser.uid,
          childData,
        );

        if (newTasks.length > 0) {
          await TaskGenerationService['storeDailyTasks'](
            currentUser.uid,
            newTasks,
            childData,
          );
          await ProgressService.updateLastTaskDate(currentUser.uid);

          await NotificationService.sendTaskGenerationNotification(
            newTasks.length,
          );

          setTasks(newTasks);
          Alert.alert(
            'Success',
            `Generated ${newTasks.length} personalized AI-powered tasks!`,
          );
        } else {
          Alert.alert('Error', 'Failed to generate tasks. Please try again.');
        }
      } catch (error: any) {
        console.error('Error generating tasks:', error);
        Alert.alert(
          'Error',
          `Failed to generate tasks: ${error.message || 'Unknown error'}`,
        );
      } finally {
        setGenerating(false);
      }
    },
    [childData],
  );

  return { generating, generateDailyTasks };
};

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

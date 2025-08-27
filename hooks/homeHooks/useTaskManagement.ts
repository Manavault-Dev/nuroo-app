import { Task, UserProgress } from '@/app/(tabs)/home/home.types';
import { auth, db } from '@/lib/firebase/firebase';
import { NotificationService } from '@/lib/services/notificationService';
import { ProgressService } from '@/lib/services/progressService';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';

export const useTaskManagement = (
  externalSetTasks?: (tasks: Task[]) => void,
  externalSetLoading?: (loading: boolean) => void,
) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchDate, setLastFetchDate] = useState<string | null>(null);
  const [cache, setCache] = useState<Map<string, Task[]>>(new Map());

  // Use ref to preserve tasks state across re-renders
  const tasksRef = useRef<Task[]>([]);
  tasksRef.current = tasks;

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

        // Don't use cache if we have local tasks that might be updated
        if (lastFetchDate === today && tasks.length > 0) {
          console.log(
            '📅 Using existing tasks for today (local state preserved)',
          );
          setLoadingState(false);
          return;
        }

        const cacheKey = `${userId}-${today}`;
        if (cache.has(cacheKey) && tasks.length === 0) {
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

            // Merge with existing local tasks to preserve completion status
            const mergedTasks = existingTasks.map((existingTask) => {
              const localTask = tasksRef.current.find(
                (t) => t.id === existingTask.id,
              );
              return localTask
                ? { ...existingTask, completed: localTask.completed }
                : existingTask;
            });

            setTasksFunction(mergedTasks);
            setLastFetchDate(today);
            setCache((prev) => new Map(prev.set(cacheKey, mergedTasks)));
            setLoadingState(false);
            return;
          }

          const allTasksQuery = query(
            collection(db, 'tasks'),
            where('userId', '==', userId),
            // Removed orderBy to avoid index requirement - we'll sort locally
          );

          const allTasksSnapshot = await getDocs(allTasksQuery);
          if (!allTasksSnapshot.empty) {
            const recentTasks = allTasksSnapshot.docs
              .map((doc) => ({
                ...doc.data(),
                id: doc.id,
                createdAt: doc.data().createdAt?.toDate() || new Date(),
              }))
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) // Sort locally
              .slice(0, 4) as Task[];

            // Merge with existing local tasks to preserve completion status
            const mergedTasks = recentTasks.map((recentTask) => {
              const localTask = tasksRef.current.find(
                (t) => t.id === recentTask.id,
              );
              return localTask
                ? { ...recentTask, completed: localTask.completed }
                : recentTask;
            });

            setTasksFunction(mergedTasks);
            setLastFetchDate(today);
            setCache((prev) => new Map(prev.set(cacheKey, mergedTasks)));
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

        // Handle specific Firebase index errors
        if (error.message && error.message.includes('requires an index')) {
          console.error(
            '🔧 Firebase index required. Please create the index in Firebase Console.',
          );
          console.error('📋 Index details:', error.message);

          // Still try to show some tasks if possible
          try {
            const today = new Date().toISOString().split('T')[0];
            const simpleQuery = query(
              collection(db, 'tasks'),
              where('userId', '==', userId),
            );
            const simpleSnapshot = await getDocs(simpleQuery);
            if (!simpleSnapshot.empty) {
              const fallbackTasks = simpleSnapshot.docs
                .map((doc) => ({
                  ...doc.data(),
                  id: doc.id,
                  createdAt: doc.data().createdAt?.toDate() || new Date(),
                }))
                .slice(0, 4) as Task[];

              setTasksFunction(fallbackTasks);
              setLastFetchDate(today);
              console.log('✅ Using fallback task fetching (no sorting)');
            }
          } catch (fallbackError) {
            console.error('❌ Fallback fetching also failed:', fallbackError);
          }
        }

        setLoadingState(false);
      }
    },
    [setTasksFunction, setLoadingState, lastFetchDate, tasks.length, cache],
  );

  const toggleTaskCompletion = useCallback(
    async (taskId: string) => {
      try {
        console.log('🔄 Toggling task completion for:', taskId);
        const currentTasks = tasksRef.current;
        console.log(
          '📋 Available tasks:',
          currentTasks.map((t) => ({
            id: t.id,
            title: t.title,
            completed: t.completed,
          })),
        );

        const currentUser = auth.currentUser;
        if (!currentUser) {
          console.error('❌ No current user found');
          return;
        }

        // First try to find in local state
        let currentTask = currentTasks.find((t) => t.id === taskId);

        // If not found locally, try to fetch from Firebase
        if (!currentTask) {
          console.log('🔍 Task not found locally, fetching from Firebase...');
          try {
            const taskDoc = await getDoc(doc(db, 'tasks', taskId));
            if (taskDoc.exists()) {
              const taskData = taskDoc.data();
              currentTask = {
                ...taskData,
                id: taskDoc.id,
                createdAt: taskData.createdAt?.toDate() || new Date(),
              } as Task;
              console.log('✅ Task fetched from Firebase:', currentTask);
            }
          } catch (fetchError) {
            console.error('❌ Error fetching task from Firebase:', fetchError);
          }
        }

        if (!currentTask) {
          console.error('❌ Task not found locally or in Firebase:', taskId);
          Alert.alert('Error', 'Task not found. Please refresh and try again.');
          return;
        }

        console.log('📝 Current task state:', currentTask.completed);
        const newCompletedState = !currentTask.completed;
        console.log('🔄 New completion state:', newCompletedState);

        // Update local state immediately for better UX
        const updatedTasks = currentTasks.map((task) =>
          task.id === taskId ? { ...task, completed: newCompletedState } : task,
        );
        setTasksFunction(updatedTasks);
        console.log('✅ Local state updated');

        // Invalidate cache to prevent it from overriding local changes
        setCache(new Map());
        setLastFetchDate(null);
        console.log('🗑️ Cache invalidated to preserve local changes');

        // Update Firebase
        const taskRef = doc(db, 'tasks', taskId);
        await setDoc(
          taskRef,
          { completed: newCompletedState },
          { merge: true },
        );
        console.log('✅ Firebase updated successfully');

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
            console.log('✅ Progress and notification updated');
          } catch (error) {
            console.error('❌ Error updating progress:', error);
            // Don't fail the entire operation if progress update fails
          }
        }

        console.log('🎉 Task completion toggled successfully');
      } catch (error) {
        console.error('❌ Error updating task:', error);

        // Revert local state on error
        const currentTasks = tasksRef.current;
        const currentTask = currentTasks.find((t) => t.id === taskId);
        if (currentTask) {
          const revertedTasks = currentTasks.map((task) =>
            task.id === taskId
              ? { ...task, completed: currentTask.completed }
              : task,
          );
          setTasksFunction(revertedTasks);
          console.log('🔄 Local state reverted due to error');
        }

        Alert.alert('Error', 'Failed to update task. Please try again.');
        throw error; // Re-throw to let the UI handle it
      }
    },
    [setTasksFunction, updateProgressForTask],
  );

  const clearTasks = useCallback(() => {
    setTasksFunction([]);
  }, [setTasksFunction]);

  const invalidateCache = useCallback(() => {
    console.log('🗑️ Invalidating task cache');
    setCache(new Map());
    setLastFetchDate(null);
  }, []);

  return {
    tasks,
    loading,
    fetchTasks,
    toggleTaskCompletion,
    clearTasks,
    setTasks: setTasksFunction,
    setLoadingState,
    invalidateCache,
  };
};

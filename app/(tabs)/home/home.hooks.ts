import { generateDevelopmentTask } from '@/lib/api/openai';
import { auth, db } from '@/lib/firebase/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { ChildData, Task } from './home.types';
import { parseTaskFromAI } from './home.utils';

export const useChildData = () => {
  const [childData, setChildData] = useState<ChildData | null>(null);

  const fetchChildData = useCallback(async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setChildData({
          name: userData.name,
          age: userData.age,
          diagnosis: userData.diagnosis,
          developmentAreas: userData.developmentAreas,
        });
      }
    } catch (error) {
      console.error('Error fetching child data:', error);
    }
  }, []);

  return { childData, fetchChildData };
};

export const useTaskGeneration = (childData: ChildData | null) => {
  const [generating, setGenerating] = useState(false);

  const generateDailyTasks = useCallback(
    async (setTasks: (tasks: Task[]) => void) => {
      if (!childData?.developmentAreas?.length) {
        Alert.alert(
          'No Development Areas',
          'Please complete onboarding first to set development areas.',
        );
        return;
      }

      setGenerating(true);
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const newTasks: Task[] = [];
        const areas = childData.developmentAreas;

        for (let i = 0; i < Math.min(areas.length, 6); i++) {
          const area = areas[i];

          try {
            const taskDescription = await generateDevelopmentTask(
              area,
              childData,
            );
            const task = parseTaskFromAI(area, taskDescription, i + 1);
            newTasks.push(task);

            const taskRef = doc(collection(db, 'tasks'));
            await setDoc(taskRef, {
              ...task,
              id: taskRef.id,
              userId: currentUser.uid,
              createdAt: new Date(),
              dailyId: new Date().toDateString(),
            });
          } catch (error: any) {
            console.error(`Error generating task for ${area}:`, error);
            Alert.alert(
              'Error',
              `Failed to generate task for ${area}: ${error.message}`,
            );
            return;
          }
        }

        setTasks(newTasks);
        Alert.alert(
          'Success',
          `Generated ${newTasks.length} AI-powered tasks!`,
        );
      } catch (error: any) {
        console.error('Error in generateDailyTasks:', error);
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

export const useTaskManagement = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async (userId: string) => {
    try {
      const today = new Date().toDateString();

      const todayTasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('dailyId', '==', today),
      );

      const todayTasksSnapshot = await getDocs(todayTasksQuery);

      if (!todayTasksSnapshot.empty) {
        const existingTasks = todayTasksSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Task[];

        setTasks(existingTasks);
        setLoading(false);
        return;
      }

      setTasks([]);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  }, []);

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
        setTasks(updatedTasks);

        const taskRef = doc(db, 'tasks', taskId);
        await setDoc(
          taskRef,
          { completed: newCompletedState },
          { merge: true },
        );
      } catch (error) {
        console.error('Error updating task:', error);
        Alert.alert('Error', 'Failed to update task. Please try again.');
      }
    },
    [tasks],
  );

  const clearTasks = useCallback(() => {
    setTasks([]);
  }, []);

  return {
    tasks,
    loading,
    fetchTasks,
    toggleTaskCompletion,
    clearTasks,
    setTasks,
  };
};

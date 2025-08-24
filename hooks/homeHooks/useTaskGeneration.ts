import { ChildData, Task } from '@/app/(tabs)/home/home.types';
import { auth } from '@/lib/firebase/firebase';
import { NotificationService } from '@/lib/services/notificationService';
import { ProgressService } from '@/lib/services/progressService';
import { TaskGenerationService } from '@/lib/services/taskGenerationService';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

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

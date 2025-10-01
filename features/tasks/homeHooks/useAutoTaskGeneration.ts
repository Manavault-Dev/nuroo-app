import { ChildData, Task } from '@/lib/home/home.types';
import { auth } from '@/lib/firebase/firebase';
import { NotificationService } from '@/lib/services/notificationService';
import { ProgressService } from '@/lib/services/progressService';
import { TaskGenerationService } from '@/lib/services/taskGenerationService';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useAutoTaskGeneration = (
  childData: ChildData | null,
  setTasks: (tasks: Task[]) => void,
  setLoadingState: (loading: boolean) => void,
) => {
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [hasCheckedToday, setHasCheckedToday] = useState(false);
  const { i18n } = useTranslation();

  const checkAndGenerateTasks = useCallback(async () => {
    if (hasCheckedToday) {
      console.log('📅 Already checked today, skipping auto-generation');
      return;
    }

    if (!childData?.developmentAreas?.length) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      console.log('🔍 Checking if tasks need to be generated...');
      console.log('🌍 Current language:', i18n.language);

      const shouldGenerate = await ProgressService.shouldGenerateTasks(
        currentUser.uid,
      );

      if (shouldGenerate) {
        console.log('🆕 Auto-generating daily tasks...');
        setAutoGenerating(true);

        const newTasks = await TaskGenerationService.generatePersonalizedTasks(
          currentUser.uid,
          childData,
          i18n.language,
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
          console.log(
            '✅ Auto-generated tasks successfully, count:',
            newTasks.length,
          );
        }
      } else {
        console.log('📅 Tasks already exist for today');
      }

      setHasCheckedToday(true);
    } catch (error) {
      console.error('❌ Error in auto task generation:', error);
    } finally {
      setAutoGenerating(false);
    }
  }, [childData, setTasks, hasCheckedToday, i18n.language]);

  return { autoGenerating, checkAndGenerateTasks };
};

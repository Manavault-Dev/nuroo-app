import { auth } from '@/lib/firebase/firebase';
import { ChildData, Task } from '@/lib/home/home.types';
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
      return;
    }

    if (!childData?.developmentAreas?.length) return;

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const shouldGenerate = await ProgressService.shouldGenerateTasks(
        currentUser.uid,
      );

      if (shouldGenerate) {
        setAutoGenerating(true);

        // Use user's preferred language from childData or fall back to i18n language
        const userLanguage = childData.preferredLanguage || i18n.language;
        console.log('🌍 Auto-generating tasks in language:', userLanguage);

        const newTasks = await TaskGenerationService.generatePersonalizedTasks(
          currentUser.uid,
          childData,
          userLanguage,
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

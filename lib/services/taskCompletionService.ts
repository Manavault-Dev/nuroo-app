import { db } from '@/lib/firebase/firebase';
import { ChildData, Task, UserProgress } from '@/lib/home/home.types';
import { ProgressService } from '@/lib/services/progressService';
import { TaskGenerationService } from '@/lib/services/taskGenerationService';
import { doc, getDoc } from 'firebase/firestore';
import { Alert } from 'react-native';

export class TaskCompletionService {
  static async handleAllTasksCompleted(
    userId: string,
    completedTasks: Task[],
    onNewTasksGenerated?: (tasks: Task[]) => void,
    language: string = 'en',
  ): Promise<void> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        console.error('❌ User data not found');
        return;
      }

      const childData = userDoc.data() as ChildData;

      await this.showCompletionCelebration(completedTasks.length, language);
      await this.updateProgressForCompletion(userId, completedTasks);

      const bonusTasks = await this.generateBonusTasks(
        userId,
        childData,
        language,
      );

      if (bonusTasks.length > 0 && onNewTasksGenerated) {
        onNewTasksGenerated(bonusTasks);
        await this.showBonusTasksNotification(bonusTasks.length, language);
      }
    } catch (error) {
      console.error('❌ Error handling task completion:', error);
    }
  }

  private static async showCompletionCelebration(
    taskCount: number,
    language: string,
  ): Promise<void> {
    const messages = {
      en: {
        title: '🎉 Amazing Work!',
        message: `Congratulations! You've completed all ${taskCount} tasks today! Your dedication to your child's development is inspiring.`,
        bonus: 'Bonus tasks are being generated to keep the momentum going!',
      },
      ru: {
        title: '🎉 Отличная работа!',
        message: `Поздравляем! Вы выполнили все ${taskCount} задач сегодня! Ваша преданность развитию вашего ребёнка вдохновляет.`,
        bonus: 'Генерируются бонусные задачи, чтобы сохранить импульс!',
      },
    };

    const msg = messages[language as keyof typeof messages] || messages.en;

    Alert.alert(msg.title, `${msg.message}\n\n${msg.bonus}`, [
      { text: 'Continue', style: 'default' },
    ]);
  }

  private static async updateProgressForCompletion(
    userId: string,
    completedTasks: Task[],
  ): Promise<void> {
    try {
      const progress = await ProgressService.getProgress(userId);
      if (!progress) return;

      const developmentAreas = [
        ...new Set(completedTasks.map((task) => task.developmentArea)),
      ];

      for (const area of developmentAreas) {
        const progressField = this.mapDevelopmentAreaToProgress(area);
        if (progressField) {
          const currentValue = progress[progressField];
          const bonusProgress = Math.min(100, currentValue + 5);
          await ProgressService.updateProgress(
            userId,
            progressField,
            bonusProgress,
          );
          console.log(
            `🎯 Bonus progress: ${progressField} increased to ${bonusProgress}/100`,
          );
        }
      }
    } catch (error) {
      console.error('❌ Error updating completion progress:', error);
    }
  }

  private static async generateBonusTasks(
    userId: string,
    childData: ChildData,
    language: string,
  ): Promise<Task[]> {
    try {
      const bonusTasks = await TaskGenerationService.generatePersonalizedTasks(
        userId,
        childData,
        language,
      );

      if (bonusTasks.length > 0) {
        const bonusDailyId = `bonus_${new Date().toISOString().split('T')[0]}`;

        const bonusTasksWithId = bonusTasks.map((task) => ({
          ...task,
          dailyId: bonusDailyId,
        }));

        await TaskGenerationService['storeDailyTasks'](
          userId,
          bonusTasksWithId,
          childData,
        );
      }

      return bonusTasks;
    } catch (error) {
      console.error('❌ Error generating bonus tasks:', error);
      return [];
    }
  }

  private static async showBonusTasksNotification(
    taskCount: number,
    language: string,
  ): Promise<void> {
    const messages = {
      en: {
        title: '🎁 Bonus Tasks Ready!',
        message: `${taskCount} new bonus tasks have been generated to keep you engaged!`,
      },
      ru: {
        title: '🎁 Бонусные задачи готовы!',
        message: `Сгенерировано ${taskCount} новых бонусных задач для продолжения работы!`,
      },
    };

    const msg = messages[language as keyof typeof messages] || messages.en;

    Alert.alert(msg.title, msg.message, [
      { text: 'View Tasks', style: 'default' },
    ]);
  }

  private static mapDevelopmentAreaToProgress(
    developmentArea: string,
  ): keyof UserProgress | null {
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

    return areaMap[developmentArea.toLowerCase()] || null;
  }

  static async offerMoreTasks(
    userId: string,
    childData: ChildData,
    language: string = 'en',
    onNewTasksGenerated?: (tasks: Task[]) => void,
  ): Promise<void> {
    const messages = {
      en: {
        title: 'Keep Going?',
        message:
          "Would you like to generate more tasks to continue your child's development journey?",
        yes: 'Yes, Generate More',
        no: 'Maybe Later',
      },
      ru: {
        title: 'Продолжить?',
        message:
          'Хотите сгенерировать больше задач для продолжения развития вашего ребёнка?',
        yes: 'Да, сгенерировать',
        no: 'Может быть позже',
      },
    };

    const msg = messages[language as keyof typeof messages] || messages.en;

    Alert.alert(msg.title, msg.message, [
      { text: msg.no, style: 'cancel' },
      {
        text: msg.yes,
        style: 'default',
        onPress: async () => {
          try {
            const newTasks =
              await TaskGenerationService.generatePersonalizedTasks(
                userId,
                childData,
                language,
              );

            if (newTasks.length > 0) {
              await TaskGenerationService['storeDailyTasks'](
                userId,
                newTasks,
                childData,
              );
              if (onNewTasksGenerated) {
                onNewTasksGenerated(newTasks);
              }
              Alert.alert('Success', `${newTasks.length} new tasks generated!`);
            }
          } catch (error) {
            console.error('Error generating more tasks:', error);
            Alert.alert(
              'Error',
              'Failed to generate more tasks. Please try again.',
            );
          }
        },
      },
    ]);
  }
}

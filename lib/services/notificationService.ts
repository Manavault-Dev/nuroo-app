import i18n from '@/i18n/i18n';
import { auth, db } from '@/lib/firebase/firebase';
import { ChildData } from '@/lib/home/home.types';
import * as BackgroundFetch from 'expo-background-fetch';
import Constants from 'expo-constants';
import type * as NotificationsTypes from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { doc, getDoc } from 'firebase/firestore';
import { ProgressService } from './progressService';
import { TaskGenerationService } from './taskGenerationService';

// Check if we're in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Conditionally import notifications only if not in Expo Go
let Notifications: typeof NotificationsTypes | null = null;
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    if (Notifications) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }
  } catch (error) {
    console.warn('⚠️ Notifications not available:', error);
  }
}

export class NotificationService {
  private static BACKGROUND_TASK_NAME = 'background-task-generation';

  /**
   * Request notification permissions
   */
  static async requestPermissions(): Promise<boolean> {
    if (isExpoGo || !Notifications) {
      console.warn(`⚠️ ${i18n.t('notifications.not_available_expo_go')}`);
      return false;
    }
    try {
      const { status } = await Notifications!.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Schedule daily task generation notification
   */
  static async scheduleDailyNotification(): Promise<void> {
    if (isExpoGo || !Notifications) {
      console.warn(`⚠️ ${i18n.t('notifications.not_available_expo_go')}`);
      return;
    }
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return;
      }

      await Notifications!.cancelAllScheduledNotificationsAsync();

      await Notifications!.scheduleNotificationAsync({
        content: {
          title: i18n.t('notifications.good_morning'),
          body: i18n.t('notifications.daily_tasks_ready'),
          data: { type: 'daily_tasks' },
        },
        trigger: {
          type: Notifications!.SchedulableTriggerInputTypes.DAILY,
          hour: 9,
          minute: 0,
        },
      });
    } catch (error) {
      console.error('❌ Error scheduling daily notification:', error);
    }
  }

  /**
   * Send notification when tasks are generated
   */
  static async sendTaskGenerationNotification(
    taskCount: number,
  ): Promise<void> {
    if (isExpoGo || !Notifications) {
      console.warn(`⚠️ ${i18n.t('notifications.not_available_expo_go')}`);
      return;
    }
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      await Notifications!.scheduleNotificationAsync({
        content: {
          title: i18n.t('notifications.new_tasks_generated'),
          body: i18n.t('notifications.new_activities_count', {
            count: taskCount,
          }),
          data: { type: 'tasks_generated', taskCount },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('❌ Error sending task generation notification:', error);
    }
  }

  /**
   * Initialize background task for automatic task generation
   */
  static async initializeBackgroundTask(): Promise<void> {
    if (isExpoGo || !Notifications) {
      console.warn(`⚠️ ${i18n.t('notifications.not_available_expo_go')}`);
      return;
    }
    try {
      TaskManager.defineTask(this.BACKGROUND_TASK_NAME, async () => {
        try {
          const currentUser = auth.currentUser;
          if (!currentUser) {
            return BackgroundFetch.BackgroundFetchResult.NoData;
          }

          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (!userDoc.exists()) {
            return BackgroundFetch.BackgroundFetchResult.NoData;
          }

          const userData = userDoc.data() as ChildData;

          const shouldGenerate = await ProgressService.shouldGenerateTasks(
            currentUser.uid,
          );

          if (shouldGenerate) {
            const tasks = await TaskGenerationService.generatePersonalizedTasks(
              currentUser.uid,
              userData,
            );

            if (tasks.length > 0) {
              await TaskGenerationService['storeDailyTasks'](
                currentUser.uid,
                tasks,
                userData,
              );
              await ProgressService.updateLastTaskDate(currentUser.uid);

              await this.sendTaskGenerationNotification(tasks.length);

              return BackgroundFetch.BackgroundFetchResult.NewData;
            }
          }

          return BackgroundFetch.BackgroundFetchResult.NoData;
        } catch (error) {
          console.error('❌ Background task error:', error);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      });

      await BackgroundFetch.registerTaskAsync(this.BACKGROUND_TASK_NAME, {
        minimumInterval: 60 * 60, // 1 hour minimum
        stopOnTerminate: false,
        startOnBoot: true,
      });
    } catch (error) {
      console.error('❌ Error initializing background task:', error);
    }
  }

  /**
   * Handle notification response
   */
  static async handleNotificationResponse(
    response: NotificationsTypes.NotificationResponse,
  ): Promise<void> {
    try {
      const { type, taskCount, taskTitle } = response.notification.request
        .content.data as any;

      switch (type) {
        case 'daily_tasks':
          break;

        case 'tasks_generated':
          console.log(
            `📱 User tapped tasks generated notification (${taskCount} tasks)`,
          );

          break;

        case 'task_completed':
          console.log(
            `📱 User tapped task completion notification: ${taskTitle}`,
          );

          break;
      }
    } catch (error) {
      console.error('❌ Error handling notification response:', error);
    }
  }

  /**
   * Get notification token for push notifications
   */
  static async getNotificationToken(): Promise<string | null> {
    if (isExpoGo || !Notifications) {
      console.warn(`⚠️ ${i18n.t('notifications.not_available_expo_go')}`);
      return null;
    }
    try {
      const token = await Notifications!.getExpoPushTokenAsync();
      return token.data;
    } catch (error) {
      console.error('❌ Error getting notification token:', error);
      return null;
    }
  }
}

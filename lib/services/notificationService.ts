import { ChildData } from '@/app/(tabs)/home/home.types';
import { auth, db } from '@/lib/firebase/firebase';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { doc, getDoc } from 'firebase/firestore';
import { ProgressService } from './progressService';
import { TaskGenerationService } from './taskGenerationService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  private static BACKGROUND_TASK_NAME = 'background-task-generation';

  /**
   * Request notification permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
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
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('❌ Notification permissions not granted');
        return;
      }

      // Cancel existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule daily notification at 9 AM
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌅 Good Morning!',
          body: 'Your personalized daily tasks are ready!',
          data: { type: 'daily_tasks' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });

      console.log('✅ Daily notification scheduled');
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
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 New Tasks Generated!',
          body: `You have ${taskCount} new personalized activities for today!`,
          data: { type: 'tasks_generated', taskCount },
        },
        trigger: null, // Send immediately
      });

      console.log('✅ Task generation notification sent');
    } catch (error) {
      console.error('❌ Error sending task generation notification:', error);
    }
  }

  /**
   * Send task completion notification
   */
  static async sendTaskCompletionNotification(
    taskTitle: string,
  ): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Task Completed!',
          body: `Great job completing: ${taskTitle}`,
          data: { type: 'task_completed', taskTitle },
        },
        trigger: null, // Send immediately
      });

      console.log('✅ Task completion notification sent');
    } catch (error) {
      console.error('❌ Error sending task completion notification:', error);
    }
  }

  /**
   * Initialize background task for automatic task generation
   */
  static async initializeBackgroundTask(): Promise<void> {
    try {
      // Define background task
      TaskManager.defineTask(this.BACKGROUND_TASK_NAME, async () => {
        try {
          console.log('🔄 Background task: Checking for task generation...');

          const currentUser = auth.currentUser;
          if (!currentUser) {
            console.log('❌ No user logged in, skipping background task');
            return BackgroundFetch.BackgroundFetchResult.NoData;
          }

          // Get user data
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (!userDoc.exists()) {
            console.log('❌ User document not found, skipping background task');
            return BackgroundFetch.BackgroundFetchResult.NoData;
          }

          const userData = userDoc.data() as ChildData;

          // Check if tasks need to be generated
          const shouldGenerate = await ProgressService.shouldGenerateTasks(
            currentUser.uid,
          );

          if (shouldGenerate) {
            console.log('🆕 Background task: Generating daily tasks...');

            // Generate tasks
            const tasks = await TaskGenerationService.generatePersonalizedTasks(
              currentUser.uid,
              userData,
            );

            if (tasks.length > 0) {
              // Store tasks
              await TaskGenerationService['storeDailyTasks'](
                currentUser.uid,
                tasks,
                userData,
              );
              await ProgressService.updateLastTaskDate(currentUser.uid);

              // Send notification
              await this.sendTaskGenerationNotification(tasks.length);

              console.log('✅ Background task: Tasks generated successfully');
              return BackgroundFetch.BackgroundFetchResult.NewData;
            }
          }

          console.log('📅 Background task: No tasks needed');
          return BackgroundFetch.BackgroundFetchResult.NoData;
        } catch (error) {
          console.error('❌ Background task error:', error);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      });

      // Register background fetch
      await BackgroundFetch.registerTaskAsync(this.BACKGROUND_TASK_NAME, {
        minimumInterval: 60 * 60, // 1 hour minimum
        stopOnTerminate: false,
        startOnBoot: true,
      });

      console.log('✅ Background task initialized');
    } catch (error) {
      console.error('❌ Error initializing background task:', error);
    }
  }

  /**
   * Handle notification response
   */
  static async handleNotificationResponse(
    response: Notifications.NotificationResponse,
  ): Promise<void> {
    try {
      const { type, taskCount, taskTitle } = response.notification.request
        .content.data as any;

      switch (type) {
        case 'daily_tasks':
          console.log('📱 User tapped daily tasks notification');
          // Navigate to home screen (handled by app navigation)
          break;

        case 'tasks_generated':
          console.log(
            `📱 User tapped tasks generated notification (${taskCount} tasks)`,
          );
          // Navigate to home screen (handled by app navigation)
          break;

        case 'task_completed':
          console.log(
            `📱 User tapped task completion notification: ${taskTitle}`,
          );
          // Navigate to tasks screen (handled by app navigation)
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
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch (error) {
      console.error('❌ Error getting notification token:', error);
      return null;
    }
  }
}

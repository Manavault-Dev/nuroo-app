// External Imports
import * as BackgroundFetch from 'expo-background-fetch';
import Constants from 'expo-constants';
import type * as NotificationsTypes from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { doc, getDoc } from 'firebase/firestore';

// Internal Imports
import { auth, db } from '@/lib/firebase/firebase';
import { NotificationEvents } from './notificationEventEmitter';
import { ProgressService } from './progressService';
import { TaskGenerationService } from './taskGenerationService';

// Check if running in Expo Go (not a production build)
const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === 'storeClient';

// Conditionally import notifications only if not in Expo Go
let Notifications: typeof NotificationsTypes | null = null;
let notificationsInitialized = false;

const initializeNotifications = () => {
  if (notificationsInitialized || isExpoGo) {
    return;
  }

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
      notificationsInitialized = true;
      if (__DEV__) {
        console.log('✅ Notifications initialized successfully');
      }
    }
  } catch (error) {
    console.warn('⚠️ Notifications not available:', error);
  }
};

export class NotificationService {
  private static BACKGROUND_TASK_NAME = 'background-task-generation';

  /**
   * Request notification permissions
   */
  static async requestPermissions(): Promise<boolean> {
    if (isExpoGo) {
      if (__DEV__) {
        console.warn('⚠️ Notifications not available in Expo Go');
      }
      return false;
    }

    initializeNotifications();

    if (!Notifications) {
      console.warn('⚠️ Notifications module not available');
      return false;
    }

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
    if (isExpoGo) {
      if (__DEV__) {
        console.warn('⚠️ Notifications not available in Expo Go');
      }
      return;
    }

    initializeNotifications();

    if (!Notifications) {
      console.warn('⚠️ Notifications module not available');
      return;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌅 Good Morning!',
          body: 'Your personalized daily tasks are ready!',
          data: { type: 'daily_tasks' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
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
    if (isExpoGo) {
      if (__DEV__) {
        console.warn('⚠️ Notifications not available in Expo Go');
      }
      return;
    }

    initializeNotifications();

    if (!Notifications) {
      console.warn('⚠️ Notifications module not available');
      return;
    }

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
    } catch (error) {
      console.error('❌ Error sending task generation notification:', error);
    }
  }

  /**
   * Initialize background task for automatic task generation
   */
  static async initializeBackgroundTask(): Promise<void> {
    if (isExpoGo) {
      if (__DEV__) {
        console.warn('⚠️ Background tasks not available in Expo Go');
      }
      return;
    }

    initializeNotifications();

    if (!Notifications) {
      console.warn('⚠️ Notifications module not available');
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

          const userData = userDoc.data() as any;

          // Get user's language preference or default to 'en'
          const userLanguage = userData.preferredLanguage || 'en';
          console.log('🌍 Background task: Using language:', userLanguage);

          const shouldGenerate = await ProgressService.shouldGenerateTasks(
            currentUser.uid,
          );

          if (shouldGenerate) {
            const tasks = await TaskGenerationService.generatePersonalizedTasks(
              currentUser.uid,
              userData,
              userLanguage,
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
   * Handle notification response (when user taps a notification)
   */
  static async handleNotificationResponse(
    response: NotificationsTypes.NotificationResponse,
  ): Promise<void> {
    try {
      const { type, taskCount, taskTitle } = response.notification.request
        .content.data as any;

      console.log(`📱 Notification tapped - Type: ${type}`);

      switch (type) {
        case 'daily_tasks':
          console.log('📱 User tapped daily tasks notification');
          // Trigger task refresh
          NotificationEvents.emitRefreshTasks();
          break;

        case 'tasks_generated':
          console.log(
            `📱 User tapped tasks generated notification (${taskCount} tasks)`,
          );
          // Trigger task refresh to show newly generated tasks
          NotificationEvents.emitRefreshTasks();
          break;

        case 'task_completed':
          console.log(
            `📱 User tapped task completion notification: ${taskTitle}`,
          );
          // Could navigate to specific task or refresh list
          NotificationEvents.emitRefreshTasks();
          break;

        default:
          console.log(`📱 Unknown notification type: ${type}`);
          // Default action: refresh tasks
          NotificationEvents.emitRefreshTasks();
      }
    } catch (error) {
      console.error('❌ Error handling notification response:', error);
    }
  }

  /**
   * Setup notification listeners
   * Call this when the app starts
   */
  static setupNotificationListeners(): (() => void) | null {
    if (isExpoGo) {
      if (__DEV__) {
        console.warn('⚠️ Notifications not available in Expo Go');
      }
      return null;
    }

    initializeNotifications();

    if (!Notifications) {
      console.warn('⚠️ Notifications module not available');
      return null;
    }

    try {
      // Listen for notifications received while app is foregrounded
      const foregroundSubscription =
        Notifications.addNotificationReceivedListener((notification) => {
          console.log('📬 Notification received in foreground:', notification);
        });

      // Listen for user interactions with notifications
      const responseSubscription =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log('📱 User interacted with notification');
          this.handleNotificationResponse(response);
        });

      // Return cleanup function
      return () => {
        foregroundSubscription.remove();
        responseSubscription.remove();
      };
    } catch (error) {
      console.error('❌ Error setting up notification listeners:', error);
      return null;
    }
  }

  /**
   * Get notification token for push notifications
   */
  static async getNotificationToken(): Promise<string | null> {
    if (isExpoGo) {
      if (__DEV__) {
        console.warn('⚠️ Notifications not available in Expo Go');
      }
      return null;
    }

    initializeNotifications();

    if (!Notifications) {
      console.warn('⚠️ Notifications module not available');
      return null;
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch (error) {
      console.error('❌ Error getting notification token:', error);
      return null;
    }
  }
}

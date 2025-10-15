import { db } from '@/lib/firebase/firebase';
import { ChildData } from '@/lib/home/home.types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationService } from './notificationService';
import { ProgressService } from './progressService';
import { TaskGenerationService } from './taskGenerationService';

export interface DailyMessageLimit {
  userId: string;
  date: string;
  messagesUsed: number;
  maxMessages: number;
  resetTime: number;
}

export interface MorningTaskSchedule {
  userId: string;
  lastGenerationDate: string;
  nextGenerationTime: number;
  isEnabled: boolean;
}

export class DailyLimitsService {
  private static readonly MESSAGE_LIMIT_KEY = 'daily_message_limit_';
  private static readonly TASK_SCHEDULE_KEY = 'morning_task_schedule_';
  private static readonly MAX_DAILY_MESSAGES = 3;
  private static readonly MORNING_TASK_HOUR = 9; // 9 AM

  /**
   * Check if user can send a message today
   */
  static async canSendMessage(userId: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    message?: string;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `${this.MESSAGE_LIMIT_KEY}${userId}_${today}`;

      const stored = await AsyncStorage.getItem(key);

      if (!stored) {
        const limit: DailyMessageLimit = {
          userId,
          date: today,
          messagesUsed: 0,
          maxMessages: this.MAX_DAILY_MESSAGES,
          resetTime: this.getNextDayResetTime(),
        };

        await AsyncStorage.setItem(key, JSON.stringify(limit));

        return {
          allowed: true,
          remaining: this.MAX_DAILY_MESSAGES,
          resetTime: limit.resetTime,
        };
      }

      const limit: DailyMessageLimit = JSON.parse(stored);

      if (limit.messagesUsed >= limit.maxMessages) {
        const hoursUntilReset = Math.ceil(
          (limit.resetTime - Date.now()) / (1000 * 60 * 60),
        );

        return {
          allowed: false,
          remaining: 0,
          resetTime: limit.resetTime,
          message: `You've used all ${this.MAX_DAILY_MESSAGES} messages for today. New messages will be available tomorrow at 9 AM.`,
        };
      }

      return {
        allowed: true,
        remaining: limit.maxMessages - limit.messagesUsed,
        resetTime: limit.resetTime,
      };
    } catch (error) {
      console.error('Error checking message limit:', error);
      return {
        allowed: true,
        remaining: this.MAX_DAILY_MESSAGES,
        resetTime: this.getNextDayResetTime(),
      };
    }
  }

  /**
   * Record a message usage
   */
  static async recordMessageUsage(userId: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `${this.MESSAGE_LIMIT_KEY}${userId}_${today}`;

      const stored = await AsyncStorage.getItem(key);

      if (!stored) {
        const limit: DailyMessageLimit = {
          userId,
          date: today,
          messagesUsed: 1,
          maxMessages: this.MAX_DAILY_MESSAGES,
          resetTime: this.getNextDayResetTime(),
        };

        await AsyncStorage.setItem(key, JSON.stringify(limit));
        return;
      }

      const limit: DailyMessageLimit = JSON.parse(stored);
      limit.messagesUsed += 1;

      await AsyncStorage.setItem(key, JSON.stringify(limit));
    } catch (error) {
      console.error('Error recording message usage:', error);
    }
  }

  /**
   * Check if it's time for morning task generation
   */
  static async shouldGenerateMorningTasks(userId: string): Promise<boolean> {
    try {
      const key = `${this.TASK_SCHEDULE_KEY}${userId}`;
      const stored = await AsyncStorage.getItem(key);

      if (!stored) {
        const schedule: MorningTaskSchedule = {
          userId,
          lastGenerationDate: '',
          nextGenerationTime: this.getNextMorningTime(),
          isEnabled: true,
        };

        await AsyncStorage.setItem(key, JSON.stringify(schedule));
        return true;
      }

      const schedule: MorningTaskSchedule = JSON.parse(stored);
      const now = Date.now();

      if (now >= schedule.nextGenerationTime) {
        schedule.lastGenerationDate = new Date().toISOString().split('T')[0];
        schedule.nextGenerationTime = this.getNextMorningTime();

        await AsyncStorage.setItem(key, JSON.stringify(schedule));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking morning task schedule:', error);
      return false;
    }
  }

  /**
   * Generate morning tasks if it's time
   */
  static async generateMorningTasksIfNeeded(
    userId: string,
    childData: ChildData,
    language: string = 'en',
  ): Promise<boolean> {
    try {
      const shouldGenerate = await this.shouldGenerateMorningTasks(userId);

      if (!shouldGenerate) {
        return false;
      }

      const hasTodayTasks = await ProgressService.shouldGenerateTasks(userId);

      if (!hasTodayTasks) {
        console.log('📋 Tasks for today already exist, skipping generation');
        return false;
      }

      console.log('🌅 Time for morning task generation! Generating tasks...');

      const tasks = await TaskGenerationService.generatePersonalizedTasks(
        userId,
        childData,
        language,
      );

      if (tasks.length > 0) {
        await TaskGenerationService['storeDailyTasks'](
          userId,
          tasks,
          childData,
        );

        await ProgressService.updateLastTaskDate(userId);

        await NotificationService.sendTaskGenerationNotification(tasks.length);

        console.log(
          `🌅 Morning tasks generated successfully: ${tasks.length} tasks`,
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error generating morning tasks:', error);
      return false;
    }
  }

  /**
   * Get time until next message reset
   */
  static async getTimeUntilMessageReset(userId: string): Promise<string> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `${this.MESSAGE_LIMIT_KEY}${userId}_${today}`;

      const stored = await AsyncStorage.getItem(key);

      if (!stored) {
        return 'Available now';
      }

      const limit: DailyMessageLimit = JSON.parse(stored);
      const now = Date.now();
      const diff = limit.resetTime - now;

      if (diff <= 0) {
        return 'Available now';
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
    } catch (error) {
      console.error('Error getting reset time:', error);
      return 'Available now';
    }
  }

  /**
   * Get time until next morning task generation
   */
  static async getTimeUntilNextMorningTasks(userId: string): Promise<string> {
    try {
      const key = `${this.TASK_SCHEDULE_KEY}${userId}`;
      const stored = await AsyncStorage.getItem(key);

      if (!stored) {
        return 'Next morning at 9 AM';
      }

      const schedule: MorningTaskSchedule = JSON.parse(stored);
      const now = Date.now();
      const diff = schedule.nextGenerationTime - now;

      if (diff <= 0) {
        return 'Available now';
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        return `${hours}h ${minutes}m until 9 AM`;
      } else {
        return `${minutes}m until 9 AM`;
      }
    } catch (error) {
      console.error('Error getting next morning time:', error);
      return 'Next morning at 9 AM';
    }
  }

  /**
   * Check if Ask Nuroo is available (no time restrictions - available 24/7)
   */
  static async isAskNurooAvailable(userId: string): Promise<{
    available: boolean;
    reason?: string;
    nextAvailableTime?: string;
  }> {
    try {
      // Ask Nuroo is available 24/7 - only check message limit
      const messageLimit = await this.canSendMessage(userId);

      if (!messageLimit.allowed) {
        return {
          available: false,
          reason: messageLimit.message || 'Daily message limit reached',
          nextAvailableTime: await this.getTimeUntilMessageReset(userId),
        };
      }

      return {
        available: true,
      };
    } catch (error) {
      console.error('Error checking Ask Nuroo availability:', error);
      return {
        available: true,
      };
    }
  }

  /**
   * Get next day reset time (9 AM tomorrow)
   */
  private static getNextDayResetTime(): number {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(this.MORNING_TASK_HOUR, 0, 0, 0);
    return tomorrow.getTime();
  }

  /**
   * Get next morning time (9 AM today or tomorrow)
   */
  private static getNextMorningTime(): number {
    const today = new Date();
    const morningTime = new Date(today);
    morningTime.setHours(this.MORNING_TASK_HOUR, 0, 0, 0);

    // If it's already past 9 AM today, schedule for tomorrow
    if (today.getTime() >= morningTime.getTime()) {
      morningTime.setDate(morningTime.getDate() + 1);
    }

    return morningTime.getTime();
  }

  /**
   * Check if user needs new tasks (completed all tasks or it's a new day)
   */
  static async shouldGenerateNewTasks(userId: string): Promise<boolean> {
    try {
      // Check if it's time for morning generation
      const morningTime = await this.shouldGenerateMorningTasks(userId);
      if (morningTime) {
        return true;
      }

      // Check if user has completed all tasks and needs more
      const today = new Date().toISOString().split('T')[0];
      const { collection, query, where, getDocs } = await import(
        'firebase/firestore'
      );

      const todayTasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('dailyId', '==', today),
      );

      const todayTasksSnapshot = await getDocs(todayTasksQuery);
      const tasks = todayTasksSnapshot.docs.map((doc) => doc.data());

      if (tasks.length > 0) {
        const allCompleted = tasks.every((task) => task.completed);
        if (allCompleted) {
          console.log('🔄 All tasks completed, generating new ones...');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking if should generate new tasks:', error);
      return false;
    }
  }

  /**
   * Reset daily limits (admin function)
   */
  static async resetDailyLimits(userId: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter(
        (key) =>
          key.includes(userId) &&
          (key.includes(this.MESSAGE_LIMIT_KEY) ||
            key.includes(this.TASK_SCHEDULE_KEY)),
      );

      await AsyncStorage.multiRemove(userKeys);
    } catch (error) {
      console.error('Error resetting daily limits:', error);
    }
  }
}

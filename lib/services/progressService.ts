import { db } from '@/lib/firebase/firebase';
import { ChildData, UserProgress } from '@/lib/home/home.types';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export class ProgressService {
  static async initializeProgress(userId: string): Promise<UserProgress> {
    const defaultProgress: UserProgress = {
      communication: 25,
      motor_skills: 25,
      social: 25,
      cognitive: 25,
      sensory: 25,
      behavior: 25,
    };

    await setDoc(
      doc(db, 'users', userId),
      {
        progress: defaultProgress,
        lastTaskDate: new Date().toISOString().split('T')[0],
      },
      { merge: true },
    );

    return defaultProgress;
  }

  static async getProgress(userId: string): Promise<UserProgress | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as ChildData;
        return userData.progress || null;
      }
      return null;
    } catch (error) {
      console.error('Error fetching progress:', error);
      return null;
    }
  }

  static async updateProgress(
    userId: string,
    area: keyof UserProgress,
    newValue: number,
  ): Promise<void> {
    try {
      const currentProgress = await this.getProgress(userId);
      if (!currentProgress) {
        await this.initializeProgress(userId);
        return;
      }

      const clampedValue = Math.max(0, Math.min(100, newValue));

      await updateDoc(doc(db, 'users', userId), {
        [`progress.${area}`]: clampedValue,
      });

      console.log(`✅ Progress updated for ${area}: ${clampedValue}`);
    } catch (error) {
      console.error(`❌ Error updating progress for ${area}:`, error);
      throw error;
    }
  }

  static calculateDifficulty(
    progress: number,
  ): 'beginner' | 'intermediate' | 'advanced' {
    if (progress < 30) return 'beginner';
    if (progress < 70) return 'intermediate';
    return 'advanced';
  }

  static getPersonalizedDifficulties(
    progress: UserProgress,
  ): Record<keyof UserProgress, 'beginner' | 'intermediate' | 'advanced'> {
    return {
      communication: this.calculateDifficulty(progress.communication),
      motor_skills: this.calculateDifficulty(progress.motor_skills),
      social: this.calculateDifficulty(progress.social),
      cognitive: this.calculateDifficulty(progress.cognitive),
      sensory: this.calculateDifficulty(progress.sensory),
      behavior: this.calculateDifficulty(progress.behavior),
    };
  }

  static async shouldGenerateTasks(userId: string): Promise<boolean> {
    try {
      console.log(
        '🔍 Checking if tasks need to be generated for user:',
        userId,
      );

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        console.log('📅 User document not found, should generate tasks');
        return true;
      }

      const userData = userDoc.data() as ChildData;
      const lastTaskDate = userData.lastTaskDate;
      const today = new Date().toISOString().split('T')[0];

      console.log('📅 Date comparison:', {
        lastTaskDate,
        today,
        shouldGenerate: lastTaskDate !== today,
      });

      // If lastTaskDate is different from today, check for incomplete tasks first
      if (lastTaskDate !== today) {
        console.log(
          '📅 Last task date different from today, checking for incomplete tasks...',
        );

        // Check if there are any incomplete tasks from previous days
        const hasIncompleteTasks = await this.hasIncompleteTasks(userId);

        if (hasIncompleteTasks) {
          console.log(
            '⚠️ Found incomplete tasks from previous days, NOT generating new tasks',
          );
          return false;
        }

        console.log('✅ No incomplete tasks found, should generate new tasks');
        return true;
      }

      console.log(
        '📅 Last task date matches today, checking if tasks actually exist...',
      );

      const { collection, query, where, getDocs } = await import(
        'firebase/firestore'
      );
      const todayTasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('dailyId', '==', today),
      );

      const todayTasksSnapshot = await getDocs(todayTasksQuery);
      const hasTasks = !todayTasksSnapshot.empty;

      console.log(
        `📅 Tasks exist for today: ${hasTasks} (count: ${todayTasksSnapshot.size})`,
      );

      if (!hasTasks) {
        console.log('📅 No tasks found despite matching date, should generate');
        return true;
      }

      console.log('📅 Tasks already exist for today, no need to generate');
      return false;
    } catch (error) {
      console.error('❌ Error checking task generation need:', error);
      return true; // Generate tasks if there's an error
    }
  }

  /**
   * Check if user has any incomplete tasks from previous days
   */
  static async hasIncompleteTasks(userId: string): Promise<boolean> {
    try {
      const { collection, query, where, getDocs } = await import(
        'firebase/firestore'
      );

      // Query for all tasks that are not completed
      const incompleteTasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('completed', '==', false),
      );

      const incompleteTasksSnapshot = await getDocs(incompleteTasksQuery);
      const incompleteCount = incompleteTasksSnapshot.size;

      console.log(`🔍 Found ${incompleteCount} incomplete tasks`);

      if (incompleteCount > 0) {
        // Log details about incomplete tasks
        incompleteTasksSnapshot.forEach((doc) => {
          const task = doc.data();
          console.log(
            `📋 Incomplete task: "${task.title}" (Date: ${task.dailyId})`,
          );
        });
      }

      return incompleteCount > 0;
    } catch (error) {
      console.error('❌ Error checking for incomplete tasks:', error);
      return false; // If there's an error, assume no incomplete tasks
    }
  }

  static async updateLastTaskDate(userId: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      await updateDoc(doc(db, 'users', userId), {
        lastTaskDate: today,
      });
      console.log('✅ Last task date updated:', today);
    } catch (error) {
      console.error('❌ Error updating last task date:', error);
      throw error;
    }
  }

  static async getTotalTasksCompleted(userId: string): Promise<number> {
    try {
      const { collection, query, where, getDocs } = await import(
        'firebase/firestore'
      );
      const completedTasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('completed', '==', true),
      );

      const completedTasksSnapshot = await getDocs(completedTasksQuery);
      return completedTasksSnapshot.size;
    } catch (error) {
      console.error('❌ Error getting total tasks completed:', error);
      return 0;
    }
  }

  static async getTasksCompletedForDate(
    userId: string,
    date: string,
  ): Promise<number> {
    try {
      const { collection, query, where, getDocs } = await import(
        'firebase/firestore'
      );
      const dateTasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('dailyId', '==', date),
        where('completed', '==', true),
      );

      const dateTasksSnapshot = await getDocs(dateTasksQuery);
      return dateTasksSnapshot.size;
    } catch (error) {
      console.error('❌ Error getting tasks completed for date:', error);
      return 0;
    }
  }

  static async getConsecutiveDaysStreak(userId: string): Promise<number> {
    try {
      console.log('�� Calculating consecutive days streak for user:', userId);

      const { collection, query, where, getDocs } = await import(
        'firebase/firestore'
      );

      // TEMPORARY WORKAROUND: Use simple query while index builds
      // Get all completed tasks for the user (no complex ordering)
      const completedTasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('completed', '==', true),
      );

      const completedTasksSnapshot = await getDocs(completedTasksQuery);

      if (completedTasksSnapshot.empty) {
        console.log('🔥 No completed tasks found, streak is 0');
        return 0;
      }

      // Extract unique dates from completed tasks
      const completedDates = new Set<string>();
      completedTasksSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.dailyId) {
          completedDates.add(data.dailyId);
        }
      });

      // Convert to sorted array (most recent first) - sort locally
      const sortedDates = Array.from(completedDates)
        .map((date) => new Date(date))
        .sort((a, b) => b.getTime() - a.getTime())
        .map((date) => date.toISOString().split('T')[0]);

      console.log('🔥 Completed dates found:', sortedDates);

      if (sortedDates.length === 0) {
        return 0;
      }

      // Calculate consecutive days streak
      let streak = 0;
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Check if today has completed tasks
      const hasTodayTasks = sortedDates.includes(todayStr);
      if (!hasTodayTasks) {
        // If no tasks completed today, check if yesterday has tasks
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (!sortedDates.includes(yesterdayStr)) {
          console.log('🔥 No tasks completed today or yesterday, streak is 0');
          return 0;
        }

        // Start counting from yesterday
        streak = 1;
        let checkDate = new Date(yesterday);

        for (let i = 1; i < sortedDates.length; i++) {
          checkDate.setDate(checkDate.getDate() - 1);
          const checkDateStr = checkDate.toISOString().split('T')[0];

          if (sortedDates.includes(checkDateStr)) {
            streak++;
          } else {
            break;
          }
        }
      } else {
        // Start counting from today
        streak = 1;
        let checkDate = new Date(today);

        for (let i = 1; i < sortedDates.length; i++) {
          checkDate.setDate(checkDate.getDate() - 1);
          const checkDateStr = checkDate.toISOString().split('T')[0];

          if (sortedDates.includes(checkDateStr)) {
            streak++;
          } else {
            break;
          }
        }
      }

      console.log('🔥 Calculated consecutive days streak:', streak);
      return streak;
    } catch (error) {
      console.error('❌ Error getting consecutive days streak:', error);

      // Type-safe error handling
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // If it's still the index building error, return a temporary value
      if (errorMessage.includes('currently building')) {
        console.log(
          '🔥 Index still building, returning temporary streak value',
        );
        return 1; // Return a reasonable default while index builds
      }

      return 0;
    }
  }

  static calculateLevelFromTasks(totalTasksCompleted: number): number {
    return Math.floor(totalTasksCompleted / 10) + 1;
  }

  static calculateProgressToNextLevel(totalTasksCompleted: number): {
    current: number;
    next: number;
    progress: number;
  } {
    const currentLevel = this.calculateLevelFromTasks(totalTasksCompleted);
    const tasksForCurrentLevel = (currentLevel - 1) * 10;
    const tasksInCurrentLevel = totalTasksCompleted - tasksForCurrentLevel;
    const progress = (tasksInCurrentLevel / 10) * 100;

    return {
      current: currentLevel,
      next: currentLevel + 1,
      progress: Math.min(100, progress),
    };
  }
}

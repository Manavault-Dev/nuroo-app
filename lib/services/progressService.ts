import { ChildData, UserProgress } from '@/app/(tabs)/home/home.types';
import { db } from '@/lib/firebase/firebase';
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

  /**

   */
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

      // If lastTaskDate is different from today, we should generate
      if (lastTaskDate !== today) {
        console.log('📅 Last task date different from today, should generate');
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
}

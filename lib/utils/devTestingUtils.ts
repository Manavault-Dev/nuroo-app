/**
 * Development Testing Utilities
 *
 * This file provides testing utilities for development only.
 * It allows you to simulate different scenarios without waiting for real time.
 */

import { ChildData } from '@/lib/home/home.types';
import { ProgressService } from '@/lib/services/progressService';
import { TaskGenerationService } from '@/lib/services/taskGenerationService';

export class DevTestingUtils {
  /**
   * Force generate new tasks for testing
   * This bypasses the date check and generates tasks immediately
   */
  static async forceGenerateTasks(
    userId: string,
    childData: ChildData,
    language: string = 'en',
  ): Promise<void> {
    if (!__DEV__) {
      console.warn('DevTestingUtils only works in development mode');
      return;
    }

    console.log('🧪 [DEV] Force generating tasks for testing...');

    try {
      // Generate tasks
      const newTasks = await TaskGenerationService.generatePersonalizedTasks(
        userId,
        childData,
        language,
      );

      if (newTasks.length > 0) {
        // Store tasks
        await TaskGenerationService['storeDailyTasks'](
          userId,
          newTasks,
          childData,
        );

        // Update last task date to today
        await ProgressService.updateLastTaskDate(userId);

        console.log(`✅ [DEV] Generated ${newTasks.length} tasks for testing`);
        console.log(
          '📋 [DEV] Tasks:',
          newTasks.map((t) => t.title),
        );
      } else {
        console.log('❌ [DEV] No tasks generated');
      }
    } catch (error) {
      console.error('❌ [DEV] Error generating test tasks:', error);
    }
  }

  /**
   * Simulate a new day by clearing today's tasks
   * This makes the system think it's a new day
   */
  static async simulateNewDay(userId: string): Promise<void> {
    if (!__DEV__) {
      console.warn('DevTestingUtils only works in development mode');
      return;
    }

    console.log('🧪 [DEV] Simulating new day...');

    try {
      const { collection, query, where, getDocs, deleteDoc, doc } =
        await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/firebase');

      const today = new Date().toISOString().split('T')[0];

      // Find today's tasks
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('dailyId', '==', today),
      );

      const tasksSnapshot = await getDocs(tasksQuery);

      if (tasksSnapshot.empty) {
        console.log('📅 [DEV] No tasks found for today');
        return;
      }

      // Delete today's tasks
      const deletePromises = tasksSnapshot.docs.map((taskDoc) =>
        deleteDoc(doc(db, 'tasks', taskDoc.id)),
      );

      await Promise.all(deletePromises);

      console.log(`🗑️ [DEV] Deleted ${tasksSnapshot.size} tasks for today`);
      console.log(
        '🔄 [DEV] Next time you load the app, it will generate new tasks',
      );
    } catch (error) {
      console.error('❌ [DEV] Error simulating new day:', error);
    }
  }

  /**
   * Reset user's last task date to yesterday
   * This forces the system to think it's a new day
   */
  static async resetLastTaskDate(userId: string): Promise<void> {
    if (!__DEV__) {
      console.warn('DevTestingUtils only works in development mode');
      return;
    }

    console.log('🧪 [DEV] Resetting last task date...');

    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/firebase');

      // Set last task date to yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      await updateDoc(doc(db, 'users', userId), {
        lastTaskDate: yesterdayString,
      });

      console.log(`📅 [DEV] Set last task date to: ${yesterdayString}`);
      console.log(
        '🔄 [DEV] Next time you load the app, it will generate new tasks',
      );
    } catch (error) {
      console.error('❌ [DEV] Error resetting last task date:', error);
    }
  }

  /**
   * Complete all tasks for testing
   */
  static async completeAllTasks(userId: string): Promise<void> {
    if (!__DEV__) {
      console.warn('DevTestingUtils only works in development mode');
      return;
    }

    console.log('🧪 [DEV] Completing all tasks...');

    try {
      const { collection, query, where, getDocs, updateDoc, doc } =
        await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/firebase');

      const today = new Date().toISOString().split('T')[0];

      // Find today's incomplete tasks
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('dailyId', '==', today),
        where('completed', '==', false),
      );

      const tasksSnapshot = await getDocs(tasksQuery);

      if (tasksSnapshot.empty) {
        console.log('✅ [DEV] All tasks already completed');
        return;
      }

      // Complete all tasks
      const completePromises = tasksSnapshot.docs.map((taskDoc) =>
        updateDoc(doc(db, 'tasks', taskDoc.id), {
          completed: true,
          completedAt: new Date().toISOString(),
        }),
      );

      await Promise.all(completePromises);

      console.log(`✅ [DEV] Completed ${tasksSnapshot.size} tasks`);
    } catch (error) {
      console.error('❌ [DEV] Error completing tasks:', error);
    }
  }

  /**
   * Show current testing status
   */
  static async showStatus(userId: string): Promise<void> {
    if (!__DEV__) {
      console.warn('DevTestingUtils only works in development mode');
      return;
    }

    console.log('🧪 [DEV] Current Status:');

    try {
      const { collection, query, where, getDocs, doc, getDoc } = await import(
        'firebase/firestore'
      );
      const { db } = await import('@/lib/firebase/firebase');

      const today = new Date().toISOString().split('T')[0];

      // Get user data
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();

      console.log(`📅 Today: ${today}`);
      console.log(`📅 Last Task Date: ${userData?.lastTaskDate || 'Never'}`);

      // Get today's tasks
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('dailyId', '==', today),
      );

      const tasksSnapshot = await getDocs(tasksQuery);
      const completedTasks = tasksSnapshot.docs.filter(
        (doc) => doc.data().completed,
      ).length;

      console.log(
        `📋 Today's Tasks: ${tasksSnapshot.size} total, ${completedTasks} completed`,
      );

      if (tasksSnapshot.size > 0) {
        tasksSnapshot.docs.forEach((taskDoc) => {
          const task = taskDoc.data();
          console.log(`  ${task.completed ? '✅' : '⏳'} ${task.title}`);
        });
      }
    } catch (error) {
      console.error('❌ [DEV] Error getting status:', error);
    }
  }
}

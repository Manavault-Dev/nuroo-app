// External Imports
import { doc, setDoc } from 'firebase/firestore';
import { Alert } from 'react-native';

// Internal Imports
import { auth, db } from '@/lib/firebase/firebase';
import { Task, UserProgress } from '@/lib/home/home.types';
import { ProgressService } from './progressService';
import { TaskFetchingService } from './taskFetchingService';

export class TaskCompletionService {
  /**
   * Map development area to progress field
   */
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

    const result = areaMap[developmentArea.toLowerCase()];
    return result || null;
  }

  /**
   * Update progress for completed task
   */
  private static async updateProgressForTask(
    developmentArea: string,
    userId: string,
  ): Promise<void> {
    try {
      const progressField = this.mapDevelopmentAreaToProgress(developmentArea);

      if (progressField) {
        const currentProgress = await ProgressService.getProgress(userId);
        if (currentProgress) {
          const currentValue = currentProgress[progressField];
          const newProgress = Math.min(100, currentValue + 2);
          await ProgressService.updateProgress(
            userId,
            progressField,
            newProgress,
          );
          console.log(
            `✅ Progress updated: ${progressField} increased to ${newProgress}/100`,
          );
        }
      }
    } catch (error) {
      console.error('❌ Error updating progress:', error);
    }
  }

  /**
   * Toggle task completion status
   */
  static async toggleTaskCompletion(
    taskId: string,
    currentTasks: Task[],
  ): Promise<{ success: boolean; updatedTasks: Task[]; error?: string }> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return {
          success: false,
          updatedTasks: currentTasks,
          error: 'No current user found',
        };
      }

      // Find the task in local state
      let currentTask: Task | undefined = currentTasks.find(
        (t) => t.id === taskId,
      );

      // If not found locally, fetch from Firebase
      if (!currentTask) {
        const fetchedTask = await TaskFetchingService.fetchTaskById(taskId);
        currentTask = fetchedTask ?? undefined;
      }

      if (!currentTask) {
        Alert.alert('Error', 'Task not found. Please refresh and try again.');
        return {
          success: false,
          updatedTasks: currentTasks,
          error: 'Task not found',
        };
      }

      const newCompletedState = !currentTask.completed;

      // Update local tasks
      const updatedTasks = currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: newCompletedState } : task,
      );

      // Update Firebase
      const taskRef = doc(db, 'tasks', taskId);
      await setDoc(taskRef, { completed: newCompletedState }, { merge: true });

      // Update progress if task is completed
      if (newCompletedState) {
        try {
          await this.updateProgressForTask(
            currentTask.developmentArea,
            currentUser.uid,
          );
        } catch (error) {
          console.error('❌ Error updating progress:', error);
        }
      }

      return { success: true, updatedTasks };
    } catch (error: any) {
      console.error('❌ Error toggling task completion:', error);
      Alert.alert('Error', 'Failed to update task. Please try again.');

      return {
        success: false,
        updatedTasks: currentTasks,
        error: error.message || 'Unknown error',
      };
    }
  }
}

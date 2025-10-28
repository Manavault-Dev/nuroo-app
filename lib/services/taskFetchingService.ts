// External Imports
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

// Internal Imports
import { db } from '@/lib/firebase/firebase';
import { Task } from '@/lib/home/home.types';

export interface TaskFetchOptions {
  userId: string;
  cacheKey?: string;
  forceRefresh?: boolean;
  lastFetchDate?: string | null;
  localTasks?: Task[];
}

export class TaskFetchingService {
  /**
   * Fetch today's tasks for a user
   */
  static async fetchTodayTasks(options: TaskFetchOptions): Promise<Task[]> {
    const { userId } = options;
    const today = new Date().toISOString().split('T')[0];

    // Try today's format first
    let todayTasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
      where('dailyId', '==', today),
    );

    let todayTasksSnapshot = await getDocs(todayTasksQuery);

    // If empty, try alternative date format
    if (todayTasksSnapshot.empty) {
      const todayAlt = new Date().toDateString();
      todayTasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('dailyId', '==', todayAlt),
      );
      todayTasksSnapshot = await getDocs(todayTasksQuery);
    }

    if (!todayTasksSnapshot.empty) {
      const existingTasks = todayTasksSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      }) as Task[];

      return this.mergeWithLocalTasks(existingTasks, options.localTasks || []);
    }

    // If no tasks for today, get recent tasks
    const recentTasks = await this.fetchRecentTasks(userId);
    return recentTasks;
  }

  /**
   * Fetch recent tasks as fallback
   */
  static async fetchRecentTasks(userId: string): Promise<Task[]> {
    const allTasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', userId),
    );

    const allTasksSnapshot = await getDocs(allTasksQuery);

    if (allTasksSnapshot.empty) {
      return [];
    }

    return allTasksSnapshot.docs
      .map((doc) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 4) as Task[];
  }

  /**
   * Fetch a single task by ID
   */
  static async fetchTaskById(taskId: string): Promise<Task | null> {
    try {
      const taskDoc = await getDoc(doc(db, 'tasks', taskId));
      if (taskDoc.exists()) {
        const taskData = taskDoc.data();
        return {
          ...taskData,
          id: taskDoc.id,
          createdAt: taskData.createdAt?.toDate() || new Date(),
        } as Task;
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching task from Firebase:', error);
      return null;
    }
  }

  /**
   * Merge server tasks with local tasks to preserve completion state
   */
  private static mergeWithLocalTasks(
    serverTasks: Task[],
    localTasks: Task[],
  ): Task[] {
    return serverTasks.map((serverTask) => {
      const localTask = localTasks.find((t) => t.id === serverTask.id);
      return localTask
        ? { ...serverTask, completed: localTask.completed }
        : serverTask;
    });
  }
}

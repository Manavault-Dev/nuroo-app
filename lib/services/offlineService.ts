import { Task, UserProgress } from '@/lib/home/home.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class OfflineService {
  private static readonly STORAGE_KEYS = {
    TASKS: 'offline_tasks',
    PROGRESS: 'offline_progress',
    CHILD_DATA: 'offline_child_data',
    LAST_SYNC: 'last_sync_timestamp',
    PENDING_ACTIONS: 'pending_actions',
  };

  static async saveTasksOffline(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.TASKS,
        JSON.stringify(tasks),
      );
    } catch (error) {}
  }

  static async getTasksOffline(): Promise<Task[]> {
    try {
      const tasksData = await AsyncStorage.getItem(this.STORAGE_KEYS.TASKS);
      return tasksData ? JSON.parse(tasksData) : [];
    } catch (error) {
      return [];
    }
  }

  static async saveProgressOffline(progress: UserProgress): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.PROGRESS,
        JSON.stringify(progress),
      );
    } catch (error) {}
  }

  static async getProgressOffline(): Promise<UserProgress | null> {
    try {
      const progressData = await AsyncStorage.getItem(
        this.STORAGE_KEYS.PROGRESS,
      );
      return progressData ? JSON.parse(progressData) : null;
    } catch (error) {
      return null;
    }
  }

  static async saveChildDataOffline(childData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.CHILD_DATA,
        JSON.stringify(childData),
      );
    } catch (error) {}
  }

  static async getChildDataOffline(): Promise<any> {
    try {
      const childData = await AsyncStorage.getItem(
        this.STORAGE_KEYS.CHILD_DATA,
      );
      return childData ? JSON.parse(childData) : null;
    } catch (error) {
      return null;
    }
  }

  static async setLastSyncTimestamp(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.LAST_SYNC,
        new Date().toISOString(),
      );
    } catch (error) {}
  }

  static async getLastSyncTimestamp(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      return null;
    }
  }

  static async addPendingAction(action: {
    type: string;
    data: any;
    timestamp: string;
  }): Promise<void> {
    try {
      const pendingActions = await this.getPendingActions();
      pendingActions.push(action);
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.PENDING_ACTIONS,
        JSON.stringify(pendingActions),
      );
    } catch (error) {}
  }

  static async getPendingActions(): Promise<any[]> {
    try {
      const actionsData = await AsyncStorage.getItem(
        this.STORAGE_KEYS.PENDING_ACTIONS,
      );
      return actionsData ? JSON.parse(actionsData) : [];
    } catch (error) {
      return [];
    }
  }

  static async clearPendingActions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEYS.PENDING_ACTIONS);
    } catch (error) {}
  }

  static async clearAllOfflineData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.STORAGE_KEYS.TASKS),
        AsyncStorage.removeItem(this.STORAGE_KEYS.PROGRESS),
        AsyncStorage.removeItem(this.STORAGE_KEYS.CHILD_DATA),
        AsyncStorage.removeItem(this.STORAGE_KEYS.LAST_SYNC),
        AsyncStorage.removeItem(this.STORAGE_KEYS.PENDING_ACTIONS),
      ]);
    } catch (error) {}
  }

  static async isDataStale(maxAgeHours: number = 24): Promise<boolean> {
    try {
      const lastSync = await this.getLastSyncTimestamp();
      if (!lastSync) return true;

      const lastSyncDate = new Date(lastSync);
      const now = new Date();
      const hoursDiff =
        (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60);

      return hoursDiff > maxAgeHours;
    } catch (error) {
      return true;
    }
  }
}

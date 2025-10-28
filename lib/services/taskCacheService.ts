// External Imports

// Internal Imports
import { Task } from '@/lib/home/home.types';

export class TaskCacheService {
  private cache = new Map<string, Task[]>();
  private lastFetchDate: string | null = null;

  /**
   * Get cached tasks if available
   */
  getCachedTasks(cacheKey: string): Task[] | null {
    return this.cache.get(cacheKey) || null;
  }

  /**
   * Set tasks in cache
   */
  setCachedTasks(cacheKey: string, tasks: Task[]): void {
    this.cache.set(cacheKey, tasks);
  }

  /**
   * Get last fetch date
   */
  getLastFetchDate(): string | null {
    return this.lastFetchDate;
  }

  /**
   * Set last fetch date
   */
  setLastFetchDate(date: string): void {
    this.lastFetchDate = date;
  }

  /**
   * Check if it's a new day
   */
  isNewDay(today: string): boolean {
    return this.lastFetchDate !== null && this.lastFetchDate !== today;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.lastFetchDate = null;
  }

  /**
   * Check if should skip fetch (same day, has tasks, no force)
   */
  shouldSkipFetch(
    today: string,
    currentTasksCount: number,
    forceRefresh: boolean,
  ): boolean {
    return (
      this.lastFetchDate === today && currentTasksCount > 0 && !forceRefresh
    );
  }
}

// External Imports
import { useCallback, useRef, useState } from 'react';

// Internal Imports
import { Task } from '@/lib/home/home.types';
import { TaskCacheService } from '@/lib/services/taskCacheService';
import { TaskCompletionService } from '@/lib/services/taskCompletionService';
import { TaskFetchingService } from '@/lib/services/taskFetchingService';

export const useTaskManagement = (
  externalSetTasks?: (tasks: Task[]) => void,
  externalSetLoading?: (loading: boolean) => void,
) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const cacheService = useRef(new TaskCacheService());
  const tasksRef = useRef<Task[]>([]);
  tasksRef.current = tasks;

  const setTasksFunction = externalSetTasks || setTasks;

  const setLoadingState = useCallback(
    (isLoading: boolean) => {
      setLoading(isLoading);
      if (externalSetLoading) {
        externalSetLoading(isLoading);
      }
    },
    [externalSetLoading],
  );

  /**
   * Fetch tasks for the user
   */
  const fetchTasks = useCallback(
    async (userId: string, forceRefresh: boolean = false) => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const cacheKey = `${userId}-${today}`;

        // Check if it's a new day
        if (cacheService.current.isNewDay(today)) {
          console.log(`📅 New day detected! Clearing old tasks...`);
          setTasksFunction([]);
          cacheService.current.clearCache();
        }

        // Skip fetch if we already have today's tasks (unless force refresh)
        if (
          cacheService.current.shouldSkipFetch(
            today,
            tasksRef.current.length,
            forceRefresh,
          )
        ) {
          console.log('📅 Using existing tasks for today');
          setLoadingState(false);
          return;
        }

        // If we have local tasks and no force refresh, prefer local over remote
        if (!forceRefresh && tasksRef.current.length > 0) {
          console.log(
            '📋 Using local tasks state (preserving completion status)',
          );
          setLoadingState(false);
          return;
        }

        // Check cache first
        if (!forceRefresh) {
          const cachedTasks = cacheService.current.getCachedTasks(cacheKey);
          if (cachedTasks && tasksRef.current.length === 0) {
            setTasksFunction(cachedTasks);
            cacheService.current.setLastFetchDate(today);
            setLoadingState(false);
            return;
          }
        }

        console.log(`🔄 Fetching fresh tasks for ${today}...`);
        setLoadingState(true);

        const fetchedTasks = await TaskFetchingService.fetchTodayTasks({
          userId,
          cacheKey,
          forceRefresh,
          lastFetchDate: cacheService.current.getLastFetchDate(),
          localTasks: tasksRef.current,
        });

        // Only update if we got tasks, or if we explicitly need to clear them
        if (fetchedTasks.length > 0 || forceRefresh) {
          console.log(`✅ Loaded ${fetchedTasks.length} tasks for today`);
          setTasksFunction(fetchedTasks);
          cacheService.current.setLastFetchDate(today);
          cacheService.current.setCachedTasks(cacheKey, fetchedTasks);
        } else {
          console.log(
            `⚠️ No tasks fetched, preserving existing ${tasksRef.current.length} tasks`,
          );
        }
        setLoadingState(false);
      } catch (error: any) {
        console.error('❌ Error fetching tasks:', error);

        if (error.message && error.message.includes('requires an index')) {
          console.error('🔧 Firebase index required');
        }

        setLoadingState(false);
      }
    },
    [setTasksFunction, setLoadingState],
  );

  /**
   * Toggle task completion status
   */
  const toggleTaskCompletion = useCallback(
    async (taskId: string, userId?: string) => {
      try {
        const result = await TaskCompletionService.toggleTaskCompletion(
          taskId,
          tasksRef.current,
        );

        if (result.success) {
          console.log('📋 Updated tasks count:', result.updatedTasks.length);
          console.log(
            '📋 Updated tasks:',
            result.updatedTasks.map((t) => ({
              id: t.id,
              title: t.title,
              completed: t.completed,
            })),
          );
          setTasksFunction(result.updatedTasks);

          // Update cache with the new completion state
          if (userId) {
            const today = new Date().toISOString().split('T')[0];
            const cacheKey = `${userId}-${today}`;

            // Store the updated tasks in cache to prevent refetch from overriding it
            cacheService.current.setCachedTasks(cacheKey, result.updatedTasks);
            cacheService.current.setLastFetchDate(today);
            console.log('✅ Cache updated to preserve completion state');
            console.log(
              '📊 Tasks in state after update:',
              tasksRef.current.length,
            );
          }
        }
      } catch (error) {
        console.error('❌ Error in toggleTaskCompletion:', error);
        throw error;
      }
    },
    [setTasksFunction],
  );

  /**
   * Clear all tasks
   */
  const clearTasks = useCallback(() => {
    setTasksFunction([]);
  }, [setTasksFunction]);

  /**
   * Invalidate cache
   */
  const invalidateCache = useCallback(() => {
    cacheService.current.clearCache();
  }, []);

  return {
    tasks,
    loading,
    fetchTasks,
    toggleTaskCompletion,
    clearTasks,
    setTasks: setTasksFunction,
    setLoadingState,
    invalidateCache,
  };
};

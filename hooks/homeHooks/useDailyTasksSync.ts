import { ChildData, Task } from '@/lib/home/home.types';
import { ProgressService } from '@/lib/services/progressService';
import { TaskGenerationService } from '@/lib/services/taskGenerationService';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UseDailyTasksSyncProps {
  userId: string;
  childData: ChildData | null;
}

interface UseDailyTasksSyncReturn {
  tasks: Task[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  onRefresh: () => Promise<void>;
  hasCheckedToday: boolean;
}

export const useDailyTasksSync = ({
  userId,
  childData,
}: UseDailyTasksSyncProps): UseDailyTasksSyncReturn => {
  const { t } = useTranslation();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs to prevent infinite loops
  const hasInitialized = useRef(false);
  const lastCheckedDate = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  const today = new Date().toISOString().split('T')[0];

  // Debug logging helper
  const debugLog = useCallback((message: string, data?: any) => {
    if (__DEV__) {
      console.log(`🔄 [useDailyTasksSync] ${message}`, data || '');
    }
  }, []);

  const loadTasks = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!userId || !childData || isLoadingRef.current) {
        debugLog('Skipping loadTasks - missing data or already loading', {
          userId: !!userId,
          childData: !!childData,
          isLoading: isLoadingRef.current,
        });
        return;
      }

      isLoadingRef.current = true;
      setError(null);

      try {
        debugLog('Loading tasks', { forceRefresh, today });

        const shouldGenerateNewTasks =
          await ProgressService.shouldGenerateTasks(userId);

        if (shouldGenerateNewTasks) {
          debugLog('Generating new daily tasks');

          const newTasks =
            await TaskGenerationService.generatePersonalizedTasks(
              userId,
              childData,
              t('language.code', { lng: 'en' }),
            );

          if (newTasks.length > 0) {
            await TaskGenerationService['storeDailyTasks'](
              userId,
              newTasks,
              childData,
            );
            await ProgressService.updateLastTaskDate(userId);

            setTasks(newTasks);
            debugLog('New tasks generated and stored', {
              count: newTasks.length,
            });
          } else {
            debugLog('No tasks generated');
          }
        } else {
          // 2. Load existing tasks for today
          debugLog('Loading existing tasks for today');

          const { collection, query, where, getDocs } = await import(
            'firebase/firestore'
          );
          const { db } = await import('@/lib/firebase/firebase');

          const tasksQuery = query(
            collection(db, 'tasks'),
            where('userId', '==', userId),
            where('dailyId', '==', today),
          );

          const tasksSnapshot = await getDocs(tasksQuery);
          const existingTasks = tasksSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Task[];

          setTasks(existingTasks);
          debugLog('Loaded existing tasks', { count: existingTasks.length });
        }

        // Update last checked date
        lastCheckedDate.current = today;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load tasks';
        debugLog('Error loading tasks', { error: errorMessage });

        setError(errorMessage);

        // Don't show technical errors to users
        if (errorMessage.includes('requires an index')) {
          setError('Database is updating. Please wait a moment and refresh.');
        } else if (
          errorMessage.includes('network') ||
          errorMessage.includes('Network')
        ) {
          setError('Please check your internet connection and try again.');
        } else {
          setError('Unable to load tasks. Please try again.');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        isLoadingRef.current = false;
      }
    },
    [userId, childData, today, t, debugLog],
  );

  // Manual refresh function - stable reference
  const onRefresh = useCallback(async () => {
    if (isLoadingRef.current) {
      debugLog('Refresh already in progress, skipping');
      return;
    }

    debugLog('Manual refresh triggered');
    setRefreshing(true);
    setError(null);

    // Force refresh by resetting the checked date
    lastCheckedDate.current = null;
    hasInitialized.current = false;

    await loadTasks(true);
  }, [loadTasks, debugLog]);

  // Initialize tasks on mount - stable effect
  useEffect(() => {
    if (!userId || !childData || hasInitialized.current) {
      return;
    }

    debugLog('Initializing tasks on mount');
    hasInitialized.current = true;
    loadTasks();
  }, [userId, childData]); // Only depend on userId and childData

  // Check for new day - stable effect
  useEffect(() => {
    if (!hasInitialized.current || !lastCheckedDate.current) {
      return;
    }

    const isNewDay = lastCheckedDate.current !== today;

    if (isNewDay) {
      debugLog('New day detected, refreshing tasks', {
        lastChecked: lastCheckedDate.current,
        today,
      });

      // Reset state for new day
      lastCheckedDate.current = null;
      hasInitialized.current = false;

      // Load tasks for new day
      loadTasks();
    }
  }, [today]); // Only depend on today

  return {
    tasks,
    loading,
    refreshing,
    error,
    onRefresh,
    hasCheckedToday: lastCheckedDate.current === today,
  };
};

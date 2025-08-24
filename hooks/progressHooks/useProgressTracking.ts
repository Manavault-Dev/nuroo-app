import { UserProgress } from '@/app/(tabs)/home/home.types';
import { useAuth } from '@/context/AuthContext';
import { ProgressService } from '@/lib/services/progressService';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface UseProgressTrackingProps {
  onProgressUpdate?: (progress: UserProgress) => void;
}

export const useProgressTracking = ({
  onProgressUpdate,
}: UseProgressTrackingProps = {}) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const userProgress = await ProgressService.getProgress(user.uid);
      if (userProgress) {
        setProgress(userProgress);
        onProgressUpdate?.(userProgress);
      } else {
        const newProgress = await ProgressService.initializeProgress(user.uid);
        setProgress(newProgress);
        onProgressUpdate?.(newProgress);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, onProgressUpdate]);

  useEffect(() => {
    if (user?.uid) {
      loadProgress();
    }
  }, [user?.uid, loadProgress]);

  const updateProgress = useCallback(
    async (area: keyof UserProgress, newValue: number) => {
      if (!user?.uid || !progress) return;

      try {
        await ProgressService.updateProgress(user.uid, area, newValue);

        const updatedProgress = { ...progress, [area]: newValue };
        setProgress(updatedProgress);
        onProgressUpdate?.(updatedProgress);

        console.log(`✅ Progress updated for ${area}: ${newValue}`);
      } catch (error) {
        console.error(`❌ Error updating progress for ${area}:`, error);
        Alert.alert('Error', 'Failed to update progress. Please try again.');
      }
    },
    [user?.uid, progress, onProgressUpdate],
  );

  const getProgressColor = useCallback((value: number) => {
    if (value >= 80) return 'bg-green-100 text-green-800';
    if (value >= 60) return 'bg-blue-100 text-blue-800';
    if (value >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }, []);

  const getProgressLabel = useCallback((value: number) => {
    if (value >= 80) return 'Advanced';
    if (value >= 60) return 'Intermediate';
    if (value >= 40) return 'Basic';
    return 'Beginner';
  }, []);

  return {
    progress,
    loading,
    updateProgress,
    getProgressColor,
    getProgressLabel,
    refreshProgress: loadProgress,
  };
};

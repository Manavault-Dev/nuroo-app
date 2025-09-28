import { UserProgress } from '@/lib/architecture/entities/UserProgress';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProgressState {
  progress: UserProgress | null;
  loading: boolean;
  error: string | null;
  totalTasksCompleted: number;
  consecutiveDaysStreak: number;
}

const initialState: ProgressState = {
  progress: null,
  loading: false,
  error: null,
  totalTasksCompleted: 0,
  consecutiveDaysStreak: 0,
};

export const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setProgress: (state, action: PayloadAction<UserProgress>) => {
      state.progress = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateProgress: (
      state,
      action: PayloadAction<{ area: keyof UserProgress; value: number }>,
    ) => {
      if (state.progress) {
        state.progress[action.payload.area] = action.payload.value;
      }
    },
    setTotalTasksCompleted: (state, action: PayloadAction<number>) => {
      state.totalTasksCompleted = action.payload;
    },
    setConsecutiveDaysStreak: (state, action: PayloadAction<number>) => {
      state.consecutiveDaysStreak = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearProgress: (state) => {
      state.progress = null;
      state.error = null;
      state.totalTasksCompleted = 0;
      state.consecutiveDaysStreak = 0;
    },
  },
});

export const {
  setLoading,
  setProgress,
  updateProgress,
  setTotalTasksCompleted,
  setConsecutiveDaysStreak,
  setError,
  clearProgress,
} = progressSlice.actions;

export default progressSlice.reducer;

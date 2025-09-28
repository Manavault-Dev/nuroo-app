import { Task } from '@/lib/architecture/entities/Task';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  lastFetchDate: string | null;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  lastFetchDate: null,
};

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.loading = false;
      state.error = null;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(
        (task) => task.id === action.payload.id,
      );
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },
    toggleTaskCompletion: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find((task) => task.id === action.payload);
      if (task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date() : undefined;
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setLastFetchDate: (state, action: PayloadAction<string | null>) => {
      state.lastFetchDate = action.payload;
    },
    clearTasks: (state) => {
      state.tasks = [];
      state.error = null;
      state.lastFetchDate = null;
    },
  },
});

export const {
  setLoading,
  setTasks,
  addTask,
  updateTask,
  removeTask,
  toggleTaskCompletion,
  setError,
  setLastFetchDate,
  clearTasks,
} = taskSlice.actions;

export default taskSlice.reducer;

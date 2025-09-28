import { configureStore } from '@reduxjs/toolkit';
import { authSlice } from './slices/authSlice';
import { progressSlice } from './slices/progressSlice';
import { taskSlice } from './slices/taskSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    tasks: taskSlice.reducer,
    progress: progressSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

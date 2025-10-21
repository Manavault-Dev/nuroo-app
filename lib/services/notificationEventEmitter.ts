import { EventEmitter } from 'events';

class NotificationEventEmitter extends EventEmitter {
  // Event types
  static readonly TASKS_GENERATED = 'tasks_generated';
  static readonly REFRESH_TASKS = 'refresh_tasks';
  static readonly TASK_COMPLETED = 'task_completed';
}

// Singleton instance
export const notificationEvents = new NotificationEventEmitter();

// Type-safe event listeners
export const NotificationEvents = {
  onTasksGeneratedTap: (callback: () => void) => {
    notificationEvents.on(NotificationEventEmitter.REFRESH_TASKS, callback);
    return () =>
      notificationEvents.off(NotificationEventEmitter.REFRESH_TASKS, callback);
  },

  emitRefreshTasks: () => {
    console.log('📱 Emitting refresh tasks event');
    notificationEvents.emit(NotificationEventEmitter.REFRESH_TASKS);
  },
};

/**
 * Simple event emitter for React Native
 * No Node.js dependencies required
 */

type EventCallback = () => void;

class SimpleEventEmitter {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  emit(event: string): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// Event types
const EVENTS = {
  REFRESH_TASKS: 'refresh_tasks',
  TASKS_GENERATED: 'tasks_generated',
  TASK_COMPLETED: 'task_completed',
} as const;

// Singleton instance
const notificationEvents = new SimpleEventEmitter();

// Type-safe event listeners
export const NotificationEvents = {
  onTasksGeneratedTap: (callback: () => void) => {
    notificationEvents.on(EVENTS.REFRESH_TASKS, callback);
    return () => notificationEvents.off(EVENTS.REFRESH_TASKS, callback);
  },

  emitRefreshTasks: () => {
    console.log('📱 Emitting refresh tasks event');
    notificationEvents.emit(EVENTS.REFRESH_TASKS);
  },
};

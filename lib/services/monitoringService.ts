// import * as Sentry from '@sentry/react-native';
import {
  getAnalytics,
  logEvent,
  setUserId,
  setUserProperties,
} from 'firebase/analytics';

export class MonitoringService {
  private static analytics: any = null;
  private static isInitialized = false;

  static async initialize() {
    if (this.isInitialized) return;

    try {
      // Sentry.init({
      //   dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      //   environment: __DEV__ ? 'development' : 'production',
      //   debug: __DEV__,
      //   tracesSampleRate: __DEV__ ? 1.0 : 0.1,
      //   beforeSend(event: any) {
      //     if (__DEV__ && event.exception) {
      //     }
      //     return event;
      //   },
      // });

      if (typeof window !== 'undefined') {
        this.analytics = getAnalytics();
      }

      this.isInitialized = true;
    } catch (error) {}
  }

  static captureException(error: Error, context?: any) {
    console.error('Error captured:', error, context);
    // if (context) {
    //   Sentry.withScope((scope) => {
    //     Object.keys(context).forEach((key) => {
    //       scope.setContext(key, context[key]);
    //     });
    //     Sentry.captureException(error);
    //   });
    // } else {
    //   Sentry.captureException(error);
    // }
  }

  static captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
  ) {
    console.log(`Message (${level}):`, message);
    // Sentry.captureMessage(message, level);
  }

  static setUser(userId: string, userProperties?: any) {
    // Sentry.setUser({ id: userId, ...userProperties });

    if (this.analytics) {
      setUserId(this.analytics, userId);
      if (userProperties) {
        setUserProperties(this.analytics, userProperties);
      }
    }
  }

  static logEvent(eventName: string, parameters?: any) {
    if (this.analytics) {
      logEvent(this.analytics, eventName, parameters);
    }
  }

  static logAppStart() {
    this.logEvent('app_start', {
      timestamp: new Date().toISOString(),
      platform: 'mobile',
    });
  }

  static logAppBackground() {
    this.logEvent('app_background', {
      timestamp: new Date().toISOString(),
    });
  }

  static logAppForeground() {
    this.logEvent('app_foreground', {
      timestamp: new Date().toISOString(),
    });
  }

  static logUserSignUp(method: string) {
    this.logEvent('sign_up', {
      method,
      timestamp: new Date().toISOString(),
    });
  }

  static logUserSignIn(method: string) {
    this.logEvent('login', {
      method,
      timestamp: new Date().toISOString(),
    });
  }

  static logUserSignOut() {
    this.logEvent('logout', {
      timestamp: new Date().toISOString(),
    });
  }

  static logTaskCreated(taskId: string, category: string, difficulty: string) {
    this.logEvent('task_created', {
      task_id: taskId,
      category,
      difficulty,
      timestamp: new Date().toISOString(),
    });
  }

  static logTaskCompleted(
    taskId: string,
    category: string,
    timeSpent?: number,
  ) {
    this.logEvent('task_completed', {
      task_id: taskId,
      category,
      time_spent: timeSpent,
      timestamp: new Date().toISOString(),
    });
  }

  static logTaskSkipped(taskId: string, category: string, reason?: string) {
    this.logEvent('task_skipped', {
      task_id: taskId,
      category,
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  static logProgressUpdate(area: string, oldValue: number, newValue: number) {
    this.logEvent('progress_updated', {
      area,
      old_value: oldValue,
      new_value: newValue,
      improvement: newValue - oldValue,
      timestamp: new Date().toISOString(),
    });
  }

  static logLevelUp(level: number, totalTasks: number) {
    this.logEvent('level_up', {
      level,
      total_tasks: totalTasks,
      timestamp: new Date().toISOString(),
    });
  }

  static logAIChatMessage(messageLength: number, responseTime?: number) {
    this.logEvent('ai_chat_message', {
      message_length: messageLength,
      response_time: responseTime,
      timestamp: new Date().toISOString(),
    });
  }

  static logAITaskGeneration(
    category: string,
    difficulty: string,
    success: boolean,
  ) {
    this.logEvent('ai_task_generation', {
      category,
      difficulty,
      success,
      timestamp: new Date().toISOString(),
    });
  }

  static logError(errorType: string, errorMessage: string, context?: any) {
    this.logEvent('app_error', {
      error_type: errorType,
      error_message: errorMessage,
      context: JSON.stringify(context),
      timestamp: new Date().toISOString(),
    });
  }

  static logPerformance(metric: string, value: number, unit: string = 'ms') {
    this.logEvent('performance_metric', {
      metric,
      value,
      unit,
      timestamp: new Date().toISOString(),
    });
  }

  static logFeatureUsage(
    feature: string,
    action: string,
    success: boolean = true,
  ) {
    this.logEvent('feature_usage', {
      feature,
      action,
      success,
      timestamp: new Date().toISOString(),
    });
  }

  static logScreenView(screenName: string, screenClass?: string) {
    this.logEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenClass,
      timestamp: new Date().toISOString(),
    });
  }

  static logCustomEvent(eventName: string, parameters?: any) {
    this.logEvent(eventName, {
      ...parameters,
      timestamp: new Date().toISOString(),
    });
  }

  static setUserProperty(key: string, value: any) {
    if (this.analytics) {
      setUserProperties(this.analytics, { [key]: value });
    }
  }

  static startSession() {
    this.logEvent('session_start', {
      timestamp: new Date().toISOString(),
    });
  }

  static endSession() {
    this.logEvent('session_end', {
      timestamp: new Date().toISOString(),
    });
  }
}

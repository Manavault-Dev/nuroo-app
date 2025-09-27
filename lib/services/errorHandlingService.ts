/**
 * Comprehensive Error Handling Service
 * Provides error logging, retry logic, and error recovery
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: string;
  additionalData?: Record<string, any>;
}

export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
}

export interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export class ErrorHandlingService {
  private static readonly ERROR_LOG_KEY = 'error_logs';
  private static readonly MAX_LOG_ENTRIES = 100;
  
  /**
   * Log an error with context
   */
  static async logError(
    error: Error,
    context: ErrorContext = {},
    severity: ErrorLog['severity'] = 'medium'
  ): Promise<void> {
    try {
      const errorLog: ErrorLog = {
        id: this.generateErrorId(),
        message: error.message,
        stack: error.stack,
        context: {
          ...context,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
        severity,
        resolved: false,
      };

      // Store in local storage
      await this.storeErrorLog(errorLog);

      // In production, send to monitoring service
      await this.sendToMonitoringService(errorLog);

      console.error('Error logged:', errorLog);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  /**
   * Retry a function with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    config: RetryConfig = {
      maxAttempts: 3,
      delayMs: 1000,
      backoffMultiplier: 2,
      maxDelayMs: 10000,
    },
    context?: ErrorContext
  ): Promise<T> {
    let lastError: Error;
    let delay = config.delayMs;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === config.maxAttempts) {
          await this.logError(lastError, {
            ...context,
            action: `retry_failed_after_${attempt}_attempts`,
          }, 'high');
          throw lastError;
        }

        // Log retry attempt
        await this.logError(lastError, {
          ...context,
          action: `retry_attempt_${attempt}`,
        }, 'low');

        // Wait before next attempt
        await this.delay(delay);
        delay = Math.min(delay * config.backoffMultiplier, config.maxDelayMs);
      }
    }

    throw lastError!;
  }

  /**
   * Handle API errors with specific recovery strategies
   */
  static async handleApiError(
    error: Error,
    context: ErrorContext = {}
  ): Promise<{ recoverable: boolean; message: string; action?: string }> {
    const errorMessage = error.message.toLowerCase();

    // Network errors
    if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      await this.logError(error, { ...context, action: 'network_error' }, 'medium');
      return {
        recoverable: true,
        message: 'Network connection issue. Please check your internet connection.',
        action: 'retry',
      };
    }

    // Authentication errors
    if (errorMessage.includes('unauthorized') || errorMessage.includes('auth')) {
      await this.logError(error, { ...context, action: 'auth_error' }, 'high');
      return {
        recoverable: false,
        message: 'Authentication failed. Please sign in again.',
        action: 'redirect_to_login',
      };
    }

    // Rate limiting errors
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
      await this.logError(error, { ...context, action: 'rate_limit' }, 'medium');
      return {
        recoverable: true,
        message: 'Too many requests. Please wait a moment and try again.',
        action: 'retry_later',
      };
    }

    // Server errors
    if (errorMessage.includes('server error') || errorMessage.includes('500')) {
      await this.logError(error, { ...context, action: 'server_error' }, 'high');
      return {
        recoverable: true,
        message: 'Server error. Please try again later.',
        action: 'retry',
      };
    }

    // Generic error
    await this.logError(error, { ...context, action: 'generic_error' }, 'medium');
    return {
      recoverable: true,
      message: 'Something went wrong. Please try again.',
      action: 'retry',
    };
  }

  /**
   * Handle Firebase errors
   */
  static async handleFirebaseError(
    error: Error,
    context: ErrorContext = {}
  ): Promise<{ recoverable: boolean; message: string; action?: string }> {
    const errorMessage = error.message.toLowerCase();

    // Firebase auth errors
    if (errorMessage.includes('auth/')) {
      await this.logError(error, { ...context, action: 'firebase_auth_error' }, 'high');
      
      if (errorMessage.includes('user-not-found')) {
        return {
          recoverable: false,
          message: 'User account not found. Please sign up.',
          action: 'redirect_to_signup',
        };
      }
      
      if (errorMessage.includes('wrong-password')) {
        return {
          recoverable: false,
          message: 'Incorrect password. Please try again.',
          action: 'show_password_error',
        };
      }
      
      if (errorMessage.includes('email-already-in-use')) {
        return {
          recoverable: false,
          message: 'Email already in use. Please sign in instead.',
          action: 'redirect_to_signin',
        };
      }
    }

    // Firebase Firestore errors
    if (errorMessage.includes('firestore/')) {
      await this.logError(error, { ...context, action: 'firestore_error' }, 'medium');
      
      if (errorMessage.includes('permission-denied')) {
        return {
          recoverable: false,
          message: 'Permission denied. Please contact support.',
          action: 'contact_support',
        };
      }
      
      if (errorMessage.includes('unavailable')) {
        return {
          recoverable: true,
          message: 'Service temporarily unavailable. Please try again.',
          action: 'retry',
        };
      }
    }

    // Generic Firebase error
    await this.logError(error, { ...context, action: 'firebase_error' }, 'medium');
    return {
      recoverable: true,
      message: 'Database error. Please try again.',
      action: 'retry',
    };
  }

  /**
   * Handle OpenAI API errors
   */
  static async handleOpenAIError(
    error: Error,
    context: ErrorContext = {}
  ): Promise<{ recoverable: boolean; message: string; action?: string }> {
    const errorMessage = error.message.toLowerCase();

    // API key errors
    if (errorMessage.includes('api key') || errorMessage.includes('unauthorized')) {
      await this.logError(error, { ...context, action: 'openai_auth_error' }, 'critical');
      return {
        recoverable: false,
        message: 'AI service authentication failed. Please contact support.',
        action: 'contact_support',
      };
    }

    // Rate limiting
    if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
      await this.logError(error, { ...context, action: 'openai_rate_limit' }, 'medium');
      return {
        recoverable: true,
        message: 'AI service is busy. Please try again in a moment.',
        action: 'retry_later',
      };
    }

    // Model errors
    if (errorMessage.includes('model') || errorMessage.includes('not found')) {
      await this.logError(error, { ...context, action: 'openai_model_error' }, 'high');
      return {
        recoverable: false,
        message: 'AI service configuration error. Please contact support.',
        action: 'contact_support',
      };
    }

    // Generic OpenAI error
    await this.logError(error, { ...context, action: 'openai_error' }, 'medium');
    return {
      recoverable: true,
      message: 'AI service temporarily unavailable. Please try again.',
      action: 'retry',
    };
  }

  /**
   * Get error logs
   */
  static async getErrorLogs(): Promise<ErrorLog[]> {
    try {
      const logsJson = await AsyncStorage.getItem(this.ERROR_LOG_KEY);
      return logsJson ? JSON.parse(logsJson) : [];
    } catch (error) {
      console.error('Failed to get error logs:', error);
      return [];
    }
  }

  /**
   * Clear error logs
   */
  static async clearErrorLogs(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.ERROR_LOG_KEY);
    } catch (error) {
      console.error('Failed to clear error logs:', error);
    }
  }

  /**
   * Mark error as resolved
   */
  static async markErrorResolved(errorId: string): Promise<void> {
    try {
      const logs = await this.getErrorLogs();
      const updatedLogs = logs.map(log => 
        log.id === errorId ? { ...log, resolved: true } : log
      );
      await AsyncStorage.setItem(this.ERROR_LOG_KEY, JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('Failed to mark error as resolved:', error);
    }
  }

  /**
   * Store error log in local storage
   */
  private static async storeErrorLog(errorLog: ErrorLog): Promise<void> {
    try {
      const existingLogs = await this.getErrorLogs();
      const updatedLogs = [errorLog, ...existingLogs].slice(0, this.MAX_LOG_ENTRIES);
      await AsyncStorage.setItem(this.ERROR_LOG_KEY, JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('Failed to store error log:', error);
    }
  }

  /**
   * Send error to monitoring service (placeholder for production)
   */
  private static async sendToMonitoringService(errorLog: ErrorLog): Promise<void> {
    // In production, this would send to Sentry, Crashlytics, etc.
    console.log('Sending to monitoring service:', errorLog.id);
  }

  /**
   * Generate unique error ID
   */
  private static generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delay utility
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

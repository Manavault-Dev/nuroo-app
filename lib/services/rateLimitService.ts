/**
 * API Rate Limiting Service
 * Prevents abuse and manages API usage limits
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
  keyPrefix: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class RateLimitService {
  private static readonly STORAGE_KEY_PREFIX = 'rate_limit_';
  
  // Default rate limits
  private static readonly DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
    openai_ask: {
      maxRequests: 10,
      windowMs: 60 * 60 * 1000, // 1 hour
      keyPrefix: 'openai_ask',
    },
    openai_tasks: {
      maxRequests: 5,
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      keyPrefix: 'openai_tasks',
    },
    firebase_auth: {
      maxRequests: 20,
      windowMs: 60 * 1000, // 1 minute
      keyPrefix: 'firebase_auth',
    },
    firebase_write: {
      maxRequests: 100,
      windowMs: 60 * 1000, // 1 minute
      keyPrefix: 'firebase_write',
    },
  };

  /**
   * Check if request is allowed based on rate limit
   */
  static async checkRateLimit(
    userId: string,
    limitType: keyof typeof RateLimitService.DEFAULT_LIMITS,
    customConfig?: RateLimitConfig
  ): Promise<RateLimitResult> {
    const config = customConfig || this.DEFAULT_LIMITS[limitType];
    const key = `${this.STORAGE_KEY_PREFIX}${config.keyPrefix}_${userId}`;
    
    try {
      const stored = await AsyncStorage.getItem(key);
      const now = Date.now();
      
      if (!stored) {
        // First request
        await this.recordRequest(key, now, config);
        return {
          allowed: true,
          remaining: config.maxRequests - 1,
          resetTime: now + config.windowMs,
        };
      }

      const data = JSON.parse(stored);
      const { requests, windowStart } = data;
      
      // Check if window has expired
      if (now - windowStart >= config.windowMs) {
        // Reset window
        await this.recordRequest(key, now, config);
        return {
          allowed: true,
          remaining: config.maxRequests - 1,
          resetTime: now + config.windowMs,
        };
      }

      // Check if limit exceeded
      if (requests >= config.maxRequests) {
        const resetTime = windowStart + config.windowMs;
        const retryAfter = Math.ceil((resetTime - now) / 1000);
        
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter,
        };
      }

      // Increment request count
      await this.recordRequest(key, windowStart, config, requests + 1);
      
      return {
        allowed: true,
        remaining: config.maxRequests - (requests + 1),
        resetTime: windowStart + config.windowMs,
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: Date.now() + config.windowMs,
      };
    }
  }

  /**
   * Record a request in storage
   */
  private static async recordRequest(
    key: string,
    windowStart: number,
    config: RateLimitConfig,
    requestCount: number = 1
  ): Promise<void> {
    const data = {
      requests: requestCount,
      windowStart,
    };
    
    await AsyncStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * Get current rate limit status
   */
  static async getRateLimitStatus(
    userId: string,
    limitType: keyof typeof RateLimitService.DEFAULT_LIMITS
  ): Promise<RateLimitResult> {
    const config = this.DEFAULT_LIMITS[limitType];
    const key = `${this.STORAGE_KEY_PREFIX}${config.keyPrefix}_${userId}`;
    
    try {
      const stored = await AsyncStorage.getItem(key);
      const now = Date.now();
      
      if (!stored) {
        return {
          allowed: true,
          remaining: config.maxRequests,
          resetTime: now + config.windowMs,
        };
      }

      const data = JSON.parse(stored);
      const { requests, windowStart } = data;
      
      // Check if window has expired
      if (now - windowStart >= config.windowMs) {
        return {
          allowed: true,
          remaining: config.maxRequests,
          resetTime: now + config.windowMs,
        };
      }

      const remaining = Math.max(0, config.maxRequests - requests);
      const resetTime = windowStart + config.windowMs;
      
      return {
        allowed: remaining > 0,
        remaining,
        resetTime,
        retryAfter: remaining === 0 ? Math.ceil((resetTime - now) / 1000) : undefined,
      };
    } catch (error) {
      console.error('Rate limit status check failed:', error);
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
      };
    }
  }

  /**
   * Reset rate limit for a user (admin function)
   */
  static async resetRateLimit(
    userId: string,
    limitType: keyof typeof RateLimitService.DEFAULT_LIMITS
  ): Promise<void> {
    const config = this.DEFAULT_LIMITS[limitType];
    const key = `${this.STORAGE_KEY_PREFIX}${config.keyPrefix}_${userId}`;
    
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Rate limit reset failed:', error);
    }
  }

  /**
   * Clear all rate limits for a user
   */
  static async clearAllRateLimits(userId: string): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter(key => key.includes(userId));
      await AsyncStorage.multiRemove(userKeys);
    } catch (error) {
      console.error('Clear all rate limits failed:', error);
    }
  }

  /**
   * Get formatted time until reset
   */
  static formatTimeUntilReset(resetTime: number): string {
    const now = Date.now();
    const diff = resetTime - now;
    
    if (diff <= 0) {
      return 'Available now';
    }
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m`;
    }
  }
}

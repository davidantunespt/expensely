import { LRUCache } from "lru-cache";

export interface RateLimitOptions {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max number of unique tokens per interval
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (limit: number, token: string): RateLimitResult => {
      const tokenCount = (tokenCache.get(token) as number[]) || [0];
      const now = Date.now();
      const windowStart = now - options.interval;

      // Remove old requests
      while (tokenCount.length && tokenCount[0] < windowStart) {
        tokenCount.shift();
      }

      // Check if limit is exceeded
      if (tokenCount.length >= limit) {
        return {
          success: false,
          limit,
          remaining: 0,
          reset: tokenCount[0] + options.interval,
        };
      }

      // Add current request
      tokenCount.push(now);
      tokenCache.set(token, tokenCount);

      return {
        success: true,
        limit,
        remaining: limit - tokenCount.length,
        reset: now + options.interval,
      };
    },
  };
}

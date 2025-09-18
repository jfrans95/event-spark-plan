/**
 * Global Error Handler and Circuit Breaker for Blocked Requests
 * 
 * This module handles persistent ERR_BLOCKED_BY_CLIENT errors caused by
 * ad-blockers blocking analytics/telemetry services like:
 * - lovable.dev/ingest (Lovable's analytics)
 * - sentry.io (Error tracking)
 */

interface ErrorPattern {
  url: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
  blocked: boolean;
}

class ErrorCircuitBreaker {
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private readonly maxErrors = 3;
  private readonly timeWindow = 30000; // 30 seconds
  private readonly cleanupInterval = 300000; // 5 minutes

  constructor() {
    this.startCleanup();
    this.setupGlobalErrorHandlers();
  }

  private getUrlPattern(url: string): string {
    try {
      const urlObj = new URL(url);
      // Group by domain and main path
      return `${urlObj.hostname}${urlObj.pathname.split('/').slice(0, 3).join('/')}`;
    } catch {
      return url.substring(0, 50); // Fallback for invalid URLs
    }
  }

  private isBlockedError(error: any): boolean {
    const errorStr = String(error).toLowerCase();
    const messageStr = error?.message?.toLowerCase() || '';
    
    return errorStr.includes('err_blocked_by_client') || 
           errorStr.includes('net::err_blocked_by_client') ||
           messageStr.includes('blocked by client') ||
           errorStr.includes('failed to fetch');
  }

  private isAnalyticsUrl(url: string): boolean {
    const analyticsPatterns = [
      'lovable.dev/ingest',
      'sentry.io',
      'google-analytics.com',
      'googletagmanager.com',
      'facebook.com/tr',
      'mixpanel.com',
      'amplitude.com'
    ];
    
    return analyticsPatterns.some(pattern => url.includes(pattern));
  }

  public handleError(error: any, url?: string): boolean {
    if (!this.isBlockedError(error)) {
      return false; // Let other errors pass through
    }

    const targetUrl = url || error.filename || 'unknown';
    const pattern = this.getUrlPattern(targetUrl);
    const now = Date.now();

    let errorData = this.errorPatterns.get(pattern);
    
    if (!errorData) {
      errorData = {
        url: targetUrl,
        count: 1,
        firstSeen: now,
        lastSeen: now,
        blocked: false
      };
      this.errorPatterns.set(pattern, errorData);
    } else {
      errorData.count++;
      errorData.lastSeen = now;
    }

    // Activate circuit breaker if too many errors in time window
    if (errorData.count >= this.maxErrors && 
        (now - errorData.firstSeen) < this.timeWindow) {
      errorData.blocked = true;
      
      if (!this.isAnalyticsUrl(targetUrl)) {
        console.warn(`🔴 Circuit breaker activated for ${pattern} (${errorData.count} errors)`);
      }
      
      return true; // Block this error from propagating
    }

    // Log only first few errors for analytics services
    if (this.isAnalyticsUrl(targetUrl) && errorData.count <= 2) {
      console.info(`🟡 Analytics service blocked by client: ${pattern} (count: ${errorData.count})`);
      return true; // Block analytics errors from spamming console
    }

    return false;
  }

  private startCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, error] of this.errorPatterns.entries()) {
        // Remove old error patterns
        if (now - error.lastSeen > this.cleanupInterval) {
          this.errorPatterns.delete(key);
        }
        // Reset circuit breaker after time window
        else if (error.blocked && (now - error.firstSeen) > this.timeWindow * 2) {
          error.blocked = false;
          error.count = 0;
          error.firstSeen = now;
        }
      }
    }, this.cleanupInterval);
  }

  private setupGlobalErrorHandlers(): void {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      if (this.handleError(event.error, event.filename)) {
        event.preventDefault(); // Prevent default logging
      }
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (this.handleError(event.reason)) {
        event.preventDefault(); // Prevent default logging
      }
    });

    // Intercept console.error to filter blocked client errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const errorStr = args.join(' ').toLowerCase();
      
      if (errorStr.includes('err_blocked_by_client') && 
          (errorStr.includes('lovable.dev') || errorStr.includes('sentry.io'))) {
        // Suppress repetitive blocked client errors for analytics
        return;
      }
      
      originalConsoleError.apply(console, args);
    };
  }

  public getStats(): { [key: string]: ErrorPattern } {
    const stats: { [key: string]: ErrorPattern } = {};
    for (const [key, value] of this.errorPatterns.entries()) {
      stats[key] = { ...value };
    }
    return stats;
  }

  public reset(): void {
    this.errorPatterns.clear();
  }
}

// Create singleton instance
export const errorCircuitBreaker = new ErrorCircuitBreaker();

// Export utility functions
export const handleBlockedClientError = (error: any, url?: string): boolean => {
  return errorCircuitBreaker.handleError(error, url);
};

export const getErrorStats = () => {
  return errorCircuitBreaker.getStats();
};

// Development helper
if (process.env.NODE_ENV === 'development') {
  (window as any).getErrorStats = getErrorStats;
  (window as any).resetErrorHandler = () => errorCircuitBreaker.reset();
}
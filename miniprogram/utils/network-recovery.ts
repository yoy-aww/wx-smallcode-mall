// utils/network-recovery.ts
/**
 * Network error recovery system for cart operations
 */

/**
 * Network status interface
 */
interface NetworkStatus {
  isConnected: boolean;
  networkType: string;
  isWifi: boolean;
  isMobile: boolean;
  signalStrength?: number;
}

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryCondition?: (error: any) => boolean;
}

/**
 * Network recovery manager
 */
export class NetworkRecovery {
  private static networkStatus: NetworkStatus | null = null;
  private static retryQueues = new Map<string, Array<() => Promise<any>>>();
  private static isMonitoring = false;

  /**
   * Initialize network monitoring
   */
  static initialize(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.startNetworkMonitoring();
    console.log('Network recovery system initialized');
  }

  /**
   * Start monitoring network status
   */
  private static startNetworkMonitoring(): void {
    // Get initial network status
    this.updateNetworkStatus();

    // Monitor network changes
    wx.onNetworkStatusChange((res) => {
      console.log('Network status changed:', res);
      
      const wasConnected = this.networkStatus?.isConnected || false;
      this.updateNetworkStatus();
      
      // If network recovered, process retry queues
      if (!wasConnected && this.networkStatus?.isConnected) {
        this.onNetworkRecovered();
      }
    });
  }

  /**
   * Update current network status
   */
  private static updateNetworkStatus(): void {
    wx.getNetworkType({
      success: (res) => {
        const isConnected = res.networkType !== 'none';
        
        this.networkStatus = {
          isConnected,
          networkType: res.networkType,
          isWifi: res.networkType === 'wifi',
          isMobile: ['2g', '3g', '4g', '5g'].includes(res.networkType)
        };

        console.log('Network status updated:', this.networkStatus);
      },
      fail: () => {
        this.networkStatus = {
          isConnected: false,
          networkType: 'unknown',
          isWifi: false,
          isMobile: false
        };
      }
    });
  }

  /**
   * Handle network recovery
   */
  private static async onNetworkRecovered(): Promise<void> {
    console.log('Network recovered, processing retry queues');
    
    const { CartFeedback } = await import('./cart-feedback');
    CartFeedback.showNetworkFeedback('recovered');

    // Process all retry queues
    for (const [queueName, queue] of this.retryQueues) {
      if (queue.length > 0) {
        console.log(`Processing ${queue.length} queued operations for ${queueName}`);
        
        // Process operations one by one to avoid overwhelming the network
        while (queue.length > 0) {
          const operation = queue.shift();
          if (operation) {
            try {
              await operation();
              await this.delay(100); // Small delay between operations
            } catch (error) {
              console.error('Queued operation failed:', error);
            }
          }
        }
      }
    }
  }

  /**
   * Execute operation with network recovery
   */
  static async executeWithRecovery<T>(
    operation: () => Promise<T>,
    operationName: string,
    config: Partial<RetryConfig> = {}
  ): Promise<T | null> {
    const retryConfig: RetryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2,
      ...config
    };

    let lastError: any;
    
    for (let attempt = 1; attempt <= retryConfig.maxRetries + 1; attempt++) {
      try {
        // Check network status before attempting
        if (!this.isNetworkAvailable() && attempt > 1) {
          throw new Error('Network not available');
        }

        const result = await operation();
        
        // Success - remove from retry queue if it was there
        this.removeFromRetryQueue(operationName, operation);
        
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`Operation ${operationName} failed (attempt ${attempt}):`, error);

        // Check if we should retry
        if (attempt <= retryConfig.maxRetries) {
          const shouldRetry = retryConfig.retryCondition 
            ? retryConfig.retryCondition(error)
            : this.shouldRetryError(error);

          if (shouldRetry) {
            const delay = Math.min(
              retryConfig.baseDelay * Math.pow(retryConfig.backoffFactor, attempt - 1),
              retryConfig.maxDelay
            );
            
            console.log(`Retrying ${operationName} in ${delay}ms`);
            await this.delay(delay);
            continue;
          }
        }

        // If network is unavailable, queue for later
        if (!this.isNetworkAvailable()) {
          this.addToRetryQueue(operationName, operation);
          
          const { CartFeedback } = await import('./cart-feedback');
          CartFeedback.showNetworkFeedback('offline');
          
          return null;
        }

        // Final failure
        break;
      }
    }

    // Handle final failure
    await this.handleNetworkError(lastError, operationName);
    return null;
  }

  /**
   * Check if network is available
   */
  static isNetworkAvailable(): boolean {
    return this.networkStatus?.isConnected || false;
  }

  /**
   * Get current network status
   */
  static getNetworkStatus(): NetworkStatus | null {
    return this.networkStatus;
  }

  /**
   * Check if error should be retried
   */
  private static shouldRetryError(error: any): boolean {
    if (!error) return false;

    const errorMessage = error.message?.toLowerCase() || '';
    const retryableErrors = [
      'network',
      'timeout',
      'connection',
      'unreachable',
      'failed to fetch',
      'request failed',
      'server error',
      '500',
      '502',
      '503',
      '504'
    ];

    return retryableErrors.some(keyword => errorMessage.includes(keyword));
  }

  /**
   * Add operation to retry queue
   */
  private static addToRetryQueue(queueName: string, operation: () => Promise<any>): void {
    if (!this.retryQueues.has(queueName)) {
      this.retryQueues.set(queueName, []);
    }
    
    const queue = this.retryQueues.get(queueName)!;
    
    // Avoid duplicate operations
    if (!queue.includes(operation)) {
      queue.push(operation);
      console.log(`Added operation to retry queue: ${queueName}`);
    }
  }

  /**
   * Remove operation from retry queue
   */
  private static removeFromRetryQueue(queueName: string, operation: () => Promise<any>): void {
    const queue = this.retryQueues.get(queueName);
    if (queue) {
      const index = queue.indexOf(operation);
      if (index > -1) {
        queue.splice(index, 1);
        console.log(`Removed operation from retry queue: ${queueName}`);
      }
    }
  }

  /**
   * Handle network error
   */
  private static async handleNetworkError(error: any, operationName: string): Promise<void> {
    console.error(`Network error in ${operationName}:`, error);
    
    const { CartErrorHandler, CartErrorType } = await import('./cart-error-handler');
    
    await CartErrorHandler.handleNetworkError(error, operationName);
  }

  /**
   * Delay utility
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear all retry queues
   */
  static clearRetryQueues(): void {
    this.retryQueues.clear();
    console.log('All retry queues cleared');
  }

  /**
   * Get retry queue status
   */
  static getRetryQueueStatus(): { [queueName: string]: number } {
    const status: { [queueName: string]: number } = {};
    
    this.retryQueues.forEach((queue, queueName) => {
      status[queueName] = queue.length;
    });
    
    return status;
  }

  /**
   * Force retry all queued operations
   */
  static async forceRetryAll(): Promise<void> {
    if (!this.isNetworkAvailable()) {
      console.warn('Cannot force retry - network not available');
      return;
    }

    await this.onNetworkRecovered();
  }

  /**
   * Check network quality
   */
  static async checkNetworkQuality(): Promise<{
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    latency?: number;
    available: boolean;
  }> {
    if (!this.isNetworkAvailable()) {
      return { quality: 'poor', available: false };
    }

    try {
      const startTime = Date.now();
      
      // Simple network test - try to make a small request
      await new Promise((resolve, reject) => {
        wx.request({
          url: 'https://httpbin.org/get',
          method: 'GET',
          timeout: 5000,
          success: resolve,
          fail: reject
        });
      });

      const latency = Date.now() - startTime;
      
      let quality: 'excellent' | 'good' | 'fair' | 'poor';
      if (latency < 200) {
        quality = 'excellent';
      } else if (latency < 500) {
        quality = 'good';
      } else if (latency < 1000) {
        quality = 'fair';
      } else {
        quality = 'poor';
      }

      return { quality, latency, available: true };
    } catch (error) {
      console.error('Network quality check failed:', error);
      return { quality: 'poor', available: false };
    }
  }

  /**
   * Cleanup resources
   */
  static cleanup(): void {
    this.clearRetryQueues();
    this.isMonitoring = false;
    console.log('Network recovery system cleaned up');
  }
}

/**
 * Utility function to wrap operations with network recovery
 */
export async function withNetworkRecovery<T>(
  operation: () => Promise<T>,
  operationName: string,
  config?: Partial<RetryConfig>
): Promise<T | null> {
  return NetworkRecovery.executeWithRecovery(operation, operationName, config);
}

/**
 * Network-aware operation wrapper
 */
export class NetworkAwareOperation<T> {
  private operation: () => Promise<T>;
  private operationName: string;
  private config: Partial<RetryConfig>;

  constructor(
    operation: () => Promise<T>,
    operationName: string,
    config: Partial<RetryConfig> = {}
  ) {
    this.operation = operation;
    this.operationName = operationName;
    this.config = config;
  }

  /**
   * Execute the operation
   */
  async execute(): Promise<T | null> {
    return NetworkRecovery.executeWithRecovery(
      this.operation,
      this.operationName,
      this.config
    );
  }

  /**
   * Execute with loading feedback
   */
  async executeWithFeedback(loadingMessage?: string): Promise<T | null> {
    const { CartFeedback } = await import('./cart-feedback');
    
    if (loadingMessage) {
      CartFeedback.showLoading(loadingMessage);
    }

    try {
      const result = await this.execute();
      return result;
    } finally {
      if (loadingMessage) {
        CartFeedback.hideLoading();
      }
    }
  }
}
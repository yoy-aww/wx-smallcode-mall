/**
 * Cart performance optimization utilities
 * Implements lazy loading, debouncing, and memory management for cart operations
 */

/**
 * Debounce utility for cart operations
 */
export class CartDebouncer {
  private static timers = new Map<string, number>();

  /**
   * Debounce function execution
   */
  static debounce<T extends (...args: any[]) => any>(
    key: string,
    func: T,
    delay: number = 300
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      // Clear existing timer
      const existingTimer = this.timers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new timer
      const timer = setTimeout(() => {
        func(...args);
        this.timers.delete(key);
      }, delay);

      this.timers.set(key, timer);
    };
  }

  /**
   * Clear all debounce timers
   */
  static clearAll(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }
}

/**
 * Throttle utility for scroll events
 */
export class CartThrottler {
  private static lastExecution = new Map<string, number>();

  /**
   * Throttle function execution
   */
  static throttle<T extends (...args: any[]) => any>(
    key: string,
    func: T,
    delay: number = 100
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      const now = Date.now();
      const lastTime = this.lastExecution.get(key) || 0;

      if (now - lastTime >= delay) {
        func(...args);
        this.lastExecution.set(key, now);
      }
    };
  }
}

/**
 * Image lazy loading manager
 */
export class CartImageLazyLoader {
  private static loadedImages = new Set<string>();
  private static loadingImages = new Set<string>();

  /**
   * Load image with lazy loading
   */
  static async loadImage(imageUrl: string): Promise<string> {
    // Return immediately if already loaded
    if (this.loadedImages.has(imageUrl)) {
      return imageUrl;
    }

    // Return promise if currently loading
    if (this.loadingImages.has(imageUrl)) {
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (this.loadedImages.has(imageUrl)) {
            resolve(imageUrl);
          } else {
            setTimeout(checkLoaded, 50);
          }
        };
        checkLoaded();
      });
    }

    // Start loading
    this.loadingImages.add(imageUrl);

    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: imageUrl,
        success: () => {
          this.loadedImages.add(imageUrl);
          this.loadingImages.delete(imageUrl);
          resolve(imageUrl);
        },
        fail: (error) => {
          this.loadingImages.delete(imageUrl);
          console.warn('Failed to load image:', imageUrl, error);
          // Return placeholder image
          resolve('/images/placeholders/product-placeholder.png');
        }
      });
    });
  }

  /**
   * Preload images for better performance
   */
  static preloadImages(imageUrls: string[]): void {
    imageUrls.forEach(url => {
      if (!this.loadedImages.has(url) && !this.loadingImages.has(url)) {
        this.loadImage(url).catch(() => {
          // Ignore preload errors
        });
      }
    });
  }

  /**
   * Clear image cache
   */
  static clearCache(): void {
    this.loadedImages.clear();
    this.loadingImages.clear();
  }
}

/**
 * Virtual scroll manager for large cart lists
 */
export class CartVirtualScroller {
  private itemHeight: number;
  private containerHeight: number;
  private buffer: number;

  constructor(itemHeight: number = 120, containerHeight: number = 600, buffer: number = 3) {
    this.itemHeight = itemHeight;
    this.containerHeight = containerHeight;
    this.buffer = buffer;
  }

  /**
   * Calculate visible items based on scroll position
   */
  getVisibleRange(scrollTop: number, totalItems: number): {
    startIndex: number;
    endIndex: number;
    visibleItems: number;
  } {
    const visibleItems = Math.ceil(this.containerHeight / this.itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
    const endIndex = Math.min(totalItems - 1, startIndex + visibleItems + this.buffer * 2);

    return {
      startIndex,
      endIndex,
      visibleItems
    };
  }

  /**
   * Get transform style for virtual scrolling
   */
  getTransformStyle(startIndex: number): string {
    const translateY = startIndex * this.itemHeight;
    return `translateY(${translateY}px)`;
  }

  /**
   * Get container height for virtual scrolling
   */
  getContainerHeight(totalItems: number): number {
    return totalItems * this.itemHeight;
  }
}

/**
 * Memory management for cart operations
 */
export class CartMemoryManager {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Set cache with TTL
   */
  static setCache(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Get cache if not expired
   */
  static getCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Clear expired cache entries
   */
  static clearExpiredCache(): void {
    const now = Date.now();
    
    this.cache.forEach((cached, key) => {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Clear all cache
   */
  static clearAllCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    totalEntries: number;
    expiredEntries: number;
    memoryUsage: number;
  } {
    const now = Date.now();
    let expiredEntries = 0;
    let memoryUsage = 0;

    this.cache.forEach((cached) => {
      if (now - cached.timestamp > cached.ttl) {
        expiredEntries++;
      }
      memoryUsage += JSON.stringify(cached.data).length;
    });

    return {
      totalEntries: this.cache.size,
      expiredEntries,
      memoryUsage
    };
  }
}

/**
 * Performance monitoring for cart operations
 */
export class CartPerformanceMonitor {
  private static metrics = new Map<string, {
    count: number;
    totalTime: number;
    minTime: number;
    maxTime: number;
    lastTime: number;
  }>();

  /**
   * Start performance measurement
   */
  static startMeasure(key: string): () => void {
    const startTime = Date.now();

    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      this.recordMetric(key, duration);
    };
  }

  /**
   * Record performance metric
   */
  private static recordMetric(key: string, duration: number): void {
    const existing = this.metrics.get(key);

    if (existing) {
      existing.count++;
      existing.totalTime += duration;
      existing.minTime = Math.min(existing.minTime, duration);
      existing.maxTime = Math.max(existing.maxTime, duration);
      existing.lastTime = duration;
    } else {
      this.metrics.set(key, {
        count: 1,
        totalTime: duration,
        minTime: duration,
        maxTime: duration,
        lastTime: duration
      });
    }
  }

  /**
   * Get performance metrics
   */
  static getMetrics(): Record<string, {
    count: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
    lastTime: number;
  }> {
    const result: Record<string, any> = {};

    this.metrics.forEach((metric, key) => {
      result[key] = {
        count: metric.count,
        averageTime: metric.totalTime / metric.count,
        minTime: metric.minTime,
        maxTime: metric.maxTime,
        lastTime: metric.lastTime
      };
    });

    return result;
  }

  /**
   * Clear all metrics
   */
  static clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Log performance summary
   */
  static logSummary(): void {
    const metrics = this.getMetrics();
    console.log('Cart Performance Metrics:', metrics);
  }
}

/**
 * Batch operation optimizer
 */
export class CartBatchOptimizer {
  private static pendingOperations = new Map<string, {
    operations: Array<() => Promise<any>>;
    timer: number;
  }>();

  /**
   * Add operation to batch
   */
  static addToBatch(
    batchKey: string,
    operation: () => Promise<any>,
    delay: number = 500
  ): void {
    const existing = this.pendingOperations.get(batchKey);

    if (existing) {
      existing.operations.push(operation);
      clearTimeout(existing.timer);
    } else {
      this.pendingOperations.set(batchKey, {
        operations: [operation],
        timer: 0
      });
    }

    // Set new timer
    const batch = this.pendingOperations.get(batchKey)!;
    batch.timer = setTimeout(() => {
      this.executeBatch(batchKey);
    }, delay);
  }

  /**
   * Execute batch operations
   */
  private static async executeBatch(batchKey: string): Promise<void> {
    const batch = this.pendingOperations.get(batchKey);
    
    if (!batch) {
      return;
    }

    this.pendingOperations.delete(batchKey);

    try {
      console.log(`Executing batch ${batchKey} with ${batch.operations.length} operations`);
      
      // Execute all operations in parallel
      await Promise.all(batch.operations.map(op => op()));
      
      console.log(`Batch ${batchKey} completed successfully`);
    } catch (error) {
      console.error(`Batch ${batchKey} failed:`, error);
    }
  }

  /**
   * Clear all pending batches
   */
  static clearAllBatches(): void {
    this.pendingOperations.forEach(batch => {
      clearTimeout(batch.timer);
    });
    this.pendingOperations.clear();
  }
}

/**
 * Main performance optimizer class
 */
export class CartPerformanceOptimizer {
  private static initialized = false;

  /**
   * Initialize performance optimization
   */
  static initialize(): void {
    if (this.initialized) {
      return;
    }

    console.log('Initializing cart performance optimizer');

    // Set up periodic cache cleanup
    setInterval(() => {
      CartMemoryManager.clearExpiredCache();
    }, 60000); // Every minute

    // Set up performance monitoring
    setInterval(() => {
      CartPerformanceMonitor.logSummary();
    }, 300000); // Every 5 minutes

    this.initialized = true;
  }

  /**
   * Cleanup all performance optimizations
   */
  static cleanup(): void {
    CartDebouncer.clearAll();
    CartImageLazyLoader.clearCache();
    CartMemoryManager.clearAllCache();
    CartPerformanceMonitor.clearMetrics();
    CartBatchOptimizer.clearAllBatches();
    
    this.initialized = false;
  }

  /**
   * Get optimization statistics
   */
  static getStats(): {
    cache: ReturnType<typeof CartMemoryManager.getCacheStats>;
    performance: ReturnType<typeof CartPerformanceMonitor.getMetrics>;
  } {
    return {
      cache: CartMemoryManager.getCacheStats(),
      performance: CartPerformanceMonitor.getMetrics()
    };
  }
}
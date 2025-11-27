// utils/toast-manager.ts
/**
 * Enhanced toast notification system for cart operations
 */

/**
 * Toast configuration interface
 */
interface ToastConfig {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  duration?: number;
  position?: 'top' | 'center' | 'bottom';
  showIcon?: boolean;
  mask?: boolean;
  vibrate?: boolean;
  onShow?: () => void;
  onHide?: () => void;
}

/**
 * Toast queue item
 */
interface ToastQueueItem {
  id: string;
  config: ToastConfig;
  timestamp: number;
  priority: number;
}

/**
 * Toast manager class
 */
export class ToastManager {
  private static queue: ToastQueueItem[] = [];
  private static currentToast: ToastQueueItem | null = null;
  private static isProcessing = false;
  private static nextId = 1;

  /**
   * Show success toast
   */
  static success(message: string, options: Partial<ToastConfig> = {}): string {
    return this.show({
      message,
      type: 'success',
      duration: 2000,
      showIcon: true,
      vibrate: true,
      ...options,
    });
  }

  /**
   * Show error toast
   */
  static error(message: string, options: Partial<ToastConfig> = {}): string {
    return this.show({
      message,
      type: 'error',
      duration: 3000,
      showIcon: true,
      vibrate: true,
      ...options,
    });
  }

  /**
   * Show warning toast
   */
  static warning(message: string, options: Partial<ToastConfig> = {}): string {
    return this.show({
      message,
      type: 'warning',
      duration: 2500,
      showIcon: false,
      ...options,
    });
  }

  /**
   * Show info toast
   */
  static info(message: string, options: Partial<ToastConfig> = {}): string {
    return this.show({
      message,
      type: 'info',
      duration: 2000,
      showIcon: false,
      ...options,
    });
  }

  /**
   * Show loading toast
   */
  static loading(message: string = '加载中...', options: Partial<ToastConfig> = {}): string {
    return this.show({
      message,
      type: 'loading',
      duration: 0,
      mask: true,
      showIcon: true,
      ...options,
    });
  }

  /**
   * Show toast with custom configuration
   */
  static show(config: ToastConfig): string {
    const id = `toast_${this.nextId++}`;
    const priority = this.getPriority(config.type);

    const toastItem: ToastQueueItem = {
      id,
      config,
      timestamp: Date.now(),
      priority,
    };

    // Add to queue
    this.queue.push(toastItem);

    // Sort queue by priority (higher priority first)
    this.queue.sort((a, b) => b.priority - a.priority);

    // Process queue
    this.processQueue();

    return id;
  }

  /**
   * Hide specific toast
   */
  static hide(id: string): void {
    // Remove from queue
    this.queue = this.queue.filter(item => item.id !== id);

    // If it's the current toast, hide it
    if (this.currentToast?.id === id) {
      this.hideCurrentToast();
    }
  }

  /**
   * Hide all toasts
   */
  static hideAll(): void {
    this.queue = [];
    this.hideCurrentToast();
  }

  /**
   * Update toast message
   */
  static update(id: string, message: string): void {
    // Update in queue
    const queueItem = this.queue.find(item => item.id === id);
    if (queueItem) {
      queueItem.config.message = message;
    }

    // Update current toast if it matches
    if (this.currentToast?.id === id) {
      this.currentToast.config.message = message;
      this.showToast(this.currentToast.config);
    }
  }

  /**
   * Process toast queue
   */
  private static async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const nextToast = this.queue.shift()!;

      // Skip if toast is too old (older than 10 seconds)
      if (Date.now() - nextToast.timestamp > 10000) {
        continue;
      }

      await this.displayToast(nextToast);
    }

    this.isProcessing = false;
  }

  /**
   * Display a single toast
   */
  private static async displayToast(toastItem: ToastQueueItem): Promise<void> {
    // Hide current toast if exists
    if (this.currentToast) {
      this.hideCurrentToast();
      await this.delay(100); // Small delay between toasts
    }

    this.currentToast = toastItem;

    // Trigger onShow callback
    if (toastItem.config.onShow) {
      try {
        toastItem.config.onShow();
      } catch (error) {
        console.error('Toast onShow callback error:', error);
      }
    }

    // Show the toast
    this.showToast(toastItem.config);

    // Handle vibration
    if (toastItem.config.vibrate) {
      this.vibrate(toastItem.config.type);
    }

    // Auto hide if duration is set
    if (toastItem.config.duration && toastItem.config.duration > 0) {
      setTimeout(() => {
        if (this.currentToast?.id === toastItem.id) {
          this.hideCurrentToast();
        }
      }, toastItem.config.duration);
    }
  }

  /**
   * Show native toast
   */
  private static showToast(config: ToastConfig): void {
    const iconMap = {
      success: 'success',
      error: 'error',
      warning: 'none',
      info: 'none',
      loading: 'loading',
    };

    wx.showToast({
      title: config.message,
      icon: config.showIcon ? (iconMap[config.type] as any) : 'none',
      duration: config.duration || 2000,
      mask: config.mask || false,
    });
  }

  /**
   * Hide current toast
   */
  private static hideCurrentToast(): void {
    if (this.currentToast) {
      wx.hideToast();

      // Trigger onHide callback
      if (this.currentToast.config.onHide) {
        try {
          this.currentToast.config.onHide();
        } catch (error) {
          console.error('Toast onHide callback error:', error);
        }
      }

      this.currentToast = null;
    }
  }

  /**
   * Get priority for toast type
   */
  private static getPriority(type: string): number {
    const priorities = {
      error: 100,
      warning: 80,
      loading: 70,
      success: 60,
      info: 50,
    };

    return priorities[type as keyof typeof priorities] || 50;
  }

  /**
   * Trigger haptic feedback
   */
  private static vibrate(type: string): void {
    try {
      const vibrationType = type === 'error' ? 'heavy' : type === 'warning' ? 'medium' : 'light';

      if (wx.vibrateShort) {
        wx.vibrateShort({
          type: vibrationType as any,
          fail: () => {
            // Fallback to basic vibration
            if (type === 'error') {
              wx.vibrateLong?.();
            }
          },
        });
      }
    } catch (error) {
      console.warn('Vibration not supported:', error);
    }
  }

  /**
   * Delay utility
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get queue status
   */
  static getQueueStatus(): {
    queueLength: number;
    currentToast: string | null;
    isProcessing: boolean;
  } {
    return {
      queueLength: this.queue.length,
      currentToast: this.currentToast?.config.message || null,
      isProcessing: this.isProcessing,
    };
  }

  /**
   * Clear expired toasts from queue
   */
  static clearExpired(): void {
    const now = Date.now();
    const maxAge = 30000; // 30 seconds

    this.queue = this.queue.filter(item => now - item.timestamp < maxAge);
  }
}

/**
 * Cart-specific toast utilities
 */
export class CartToast {
  /**
   * Show cart operation success
   */
  static operationSuccess(
    operation: 'add' | 'remove' | 'update' | 'clear',
    details?: { productName?: string; quantity?: number }
  ): string {
    let message = '';

    switch (operation) {
      case 'add':
        message = details?.productName
          ? `已添加 ${details.productName} 到购物车`
          : '已添加到购物车';
        break;
      case 'remove':
        message = details?.productName ? `已从购物车移除 ${details.productName}` : '已从购物车移除';
        break;
      case 'update':
        message = details?.quantity ? `数量已更新为 ${details.quantity}` : '数量已更新';
        break;
      case 'clear':
        message = '购物车已清空';
        break;
    }

    return ToastManager.success(message);
  }

  /**
   * Show cart operation error
   */
  static operationError(operation: 'add' | 'remove' | 'update' | 'clear', reason?: string): string {
    let message = '';

    switch (operation) {
      case 'add':
        message = reason || '添加到购物车失败';
        break;
      case 'remove':
        message = reason || '移除商品失败';
        break;
      case 'update':
        message = reason || '更新数量失败';
        break;
      case 'clear':
        message = reason || '清空购物车失败';
        break;
    }

    return ToastManager.error(message);
  }

  /**
   * Show stock warning
   */
  static stockWarning(
    type: 'insufficient' | 'adjusted' | 'unavailable',
    details: { productName?: string; available?: number; adjusted?: number }
  ): string {
    let message = '';

    switch (type) {
      case 'insufficient':
        message = details.productName
          ? `${details.productName} 库存不足，仅剩 ${details.available} 件`
          : `库存不足，仅剩 ${details.available} 件`;
        break;
      case 'adjusted':
        message = details.productName
          ? `${details.productName} 数量已调整为 ${details.adjusted} 件`
          : `数量已调整为 ${details.adjusted} 件`;
        break;
      case 'unavailable':
        message = details.productName ? `${details.productName} 暂时缺货` : '商品暂时缺货';
        break;
    }

    return ToastManager.warning(message);
  }

  /**
   * Show network status
   */
  static networkStatus(status: 'offline' | 'slow' | 'recovered' | 'error'): string {
    let message = '';

    switch (status) {
      case 'offline':
        message = '网络连接已断开';
        break;
      case 'slow':
        message = '网络连接较慢';
        break;
      case 'recovered':
        message = '网络连接已恢复';
        break;
      case 'error':
        message = '网络请求失败';
        break;
    }

    return status === 'recovered' ? ToastManager.success(message) : ToastManager.error(message);
  }

  /**
   * Show loading with cart context
   */
  static loading(operation: string): string {
    const messages = {
      loading_cart: '加载购物车...',
      adding_item: '添加中...',
      removing_item: '删除中...',
      updating_quantity: '更新中...',
      checking_stock: '检查库存...',
      processing_checkout: '处理订单...',
      syncing_data: '同步数据...',
    };

    const message = messages[operation as keyof typeof messages] || '处理中...';
    return ToastManager.loading(message);
  }
}

/**
 * Batch toast operations
 */
export class BatchToast {
  private static batchId = 0;
  private static batches = new Map<string, string[]>();

  /**
   * Start a batch operation
   */
  static startBatch(batchName: string): string {
    const batchId = `batch_${++this.batchId}`;
    this.batches.set(batchId, []);

    const loadingId = ToastManager.loading(`${batchName}中...`);
    this.batches.get(batchId)!.push(loadingId);

    return batchId;
  }

  /**
   * Add toast to batch
   */
  static addToBatch(batchId: string, toastId: string): void {
    const batch = this.batches.get(batchId);
    if (batch) {
      batch.push(toastId);
    }
  }

  /**
   * Complete batch operation
   */
  static completeBatch(batchId: string, success: boolean, message: string, count?: number): void {
    const batch = this.batches.get(batchId);
    if (batch) {
      // Hide all toasts in batch
      batch.forEach(toastId => ToastManager.hide(toastId));

      // Show completion message
      const finalMessage = count ? `${message} (${count}项)` : message;

      if (success) {
        ToastManager.success(finalMessage);
      } else {
        ToastManager.error(finalMessage);
      }

      // Clean up batch
      this.batches.delete(batchId);
    }
  }

  /**
   * Cancel batch operation
   */
  static cancelBatch(batchId: string): void {
    const batch = this.batches.get(batchId);
    if (batch) {
      batch.forEach(toastId => ToastManager.hide(toastId));
      this.batches.delete(batchId);
    }
  }
}

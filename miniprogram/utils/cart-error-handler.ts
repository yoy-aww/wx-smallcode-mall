// utils/cart-error-handler.ts
/**
 * Comprehensive error handling system for cart functionality
 */

/**
 * Cart error types
 */
export enum CartErrorType {
  NETWORK_ERROR = 'network_error',
  STORAGE_ERROR = 'storage_error',
  VALIDATION_ERROR = 'validation_error',
  STOCK_ERROR = 'stock_error',
  PERMISSION_ERROR = 'permission_error',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  TIMEOUT_ERROR = 'timeout_error',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Cart error severity levels
 */
export enum CartErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Cart error interface
 */
export interface CartError {
  type: CartErrorType;
  severity: CartErrorSeverity;
  message: string;
  productId?: string;
  retryable: boolean;
  userMessage: string;
  actionRequired?: string;
  timestamp: Date;
}

/**
 * Error recovery action interface
 */
export interface ErrorRecoveryAction {
  label: string;
  action: () => Promise<void>;
  primary?: boolean;
}

/**
 * Cart error handler class
 */
export class CartErrorHandler {
  private static errorHistory: CartError[] = [];
  private static readonly MAX_ERROR_HISTORY = 50;

  /**
   * Create a cart error
   */
  static createError(
    type: CartErrorType,
    message: string,
    options: {
      severity?: CartErrorSeverity;
      productId?: string;
      retryable?: boolean;
      userMessage?: string;
      actionRequired?: string;
    } = {}
  ): CartError {
    const error: CartError = {
      type,
      severity: options.severity || this.getDefaultSeverity(type),
      message,
      productId: options.productId,
      retryable: options.retryable !== undefined ? options.retryable : this.isRetryableByDefault(type),
      userMessage: options.userMessage || this.getDefaultUserMessage(type),
      actionRequired: options.actionRequired,
      timestamp: new Date()
    };

    // Add to error history
    this.addToHistory(error);

    return error;
  }

  /**
   * Handle cart error with appropriate user feedback
   */
  static async handleError(error: CartError): Promise<void> {
    console.error('Cart error occurred:', error);

    // Show user feedback based on severity
    switch (error.severity) {
      case CartErrorSeverity.LOW:
        this.showToast(error.userMessage, 'none');
        break;
      case CartErrorSeverity.MEDIUM:
        this.showToast(error.userMessage, 'error');
        break;
      case CartErrorSeverity.HIGH:
      case CartErrorSeverity.CRITICAL:
        await this.showModal(error);
        break;
    }

    // Perform automatic recovery if possible
    if (error.retryable && error.severity !== CartErrorSeverity.CRITICAL) {
      await this.attemptAutoRecovery(error);
    }
  }

  /**
   * Handle network errors with retry mechanism
   */
  static async handleNetworkError(
    originalError: any,
    context: string,
    retryAction?: () => Promise<any>
  ): Promise<CartError> {
    const error = this.createError(
      CartErrorType.NETWORK_ERROR,
      `Network error in ${context}: ${originalError.message || 'Unknown network error'}`,
      {
        severity: CartErrorSeverity.MEDIUM,
        retryable: true,
        userMessage: '网络连接异常，请检查网络后重试',
        actionRequired: retryAction ? 'retry' : 'check_network'
      }
    );

    await this.handleError(error);
    return error;
  }

  /**
   * Handle storage errors with recovery
   */
  static async handleStorageError(
    originalError: any,
    context: string
  ): Promise<CartError> {
    const error = this.createError(
      CartErrorType.STORAGE_ERROR,
      `Storage error in ${context}: ${originalError.message || 'Storage operation failed'}`,
      {
        severity: CartErrorSeverity.HIGH,
        retryable: true,
        userMessage: '数据存储异常，正在尝试恢复',
        actionRequired: 'clear_storage'
      }
    );

    await this.handleError(error);
    return error;
  }

  /**
   * Handle validation errors
   */
  static async handleValidationError(
    message: string,
    productId?: string,
    userGuidance?: string
  ): Promise<CartError> {
    const error = this.createError(
      CartErrorType.VALIDATION_ERROR,
      message,
      {
        severity: CartErrorSeverity.MEDIUM,
        productId,
        retryable: false,
        userMessage: userGuidance || '输入信息有误，请检查后重试',
        actionRequired: 'user_correction'
      }
    );

    await this.handleError(error);
    return error;
  }

  /**
   * Handle stock errors with automatic adjustment
   */
  static async handleStockError(
    productId: string,
    requestedQuantity: number,
    availableStock: number
  ): Promise<CartError> {
    const error = this.createError(
      CartErrorType.STOCK_ERROR,
      `Stock insufficient for product ${productId}: requested ${requestedQuantity}, available ${availableStock}`,
      {
        severity: CartErrorSeverity.MEDIUM,
        productId,
        retryable: true,
        userMessage: `库存不足，已自动调整为最大可购买数量 ${availableStock}`,
        actionRequired: 'adjust_quantity'
      }
    );

    await this.handleError(error);
    return error;
  }

  /**
   * Show toast message
   */
  private static showToast(message: string, icon: 'success' | 'error' | 'loading' | 'none' = 'none') {
    wx.showToast({
      title: message,
      icon,
      duration: 2000,
      mask: false
    });
  }

  /**
   * Show modal dialog for serious errors
   */
  private static async showModal(error: CartError): Promise<void> {
    return new Promise((resolve) => {
      const actions = this.getRecoveryActions(error);
      
      wx.showModal({
        title: '操作失败',
        content: error.userMessage,
        showCancel: actions.length > 1,
        cancelText: actions.length > 1 ? '取消' : undefined,
        confirmText: actions.find(a => a.primary)?.label || '确定',
        success: async (res) => {
          if (res.confirm) {
            const primaryAction = actions.find(a => a.primary) || actions[0];
            if (primaryAction) {
              try {
                await primaryAction.action();
              } catch (actionError) {
                console.error('Error recovery action failed:', actionError);
              }
            }
          }
          resolve();
        },
        fail: () => resolve()
      });
    });
  }

  /**
   * Get recovery actions for error
   */
  private static getRecoveryActions(error: CartError): ErrorRecoveryAction[] {
    const actions: ErrorRecoveryAction[] = [];

    switch (error.actionRequired) {
      case 'retry':
        actions.push({
          label: '重试',
          action: async () => {
            // Retry logic would be implemented by the caller
            this.showToast('正在重试...', 'loading');
          },
          primary: true
        });
        break;

      case 'clear_storage':
        actions.push({
          label: '清理数据',
          action: async () => {
            await this.clearCorruptedData();
            this.showToast('数据已清理，请重新操作', 'success');
          },
          primary: true
        });
        break;

      case 'check_network':
        actions.push({
          label: '检查网络',
          action: async () => {
            this.showToast('请检查网络连接后重试', 'none');
          },
          primary: true
        });
        break;

      case 'adjust_quantity':
        actions.push({
          label: '确定',
          action: async () => {
            // Quantity adjustment would be handled by the caller
          },
          primary: true
        });
        break;

      default:
        actions.push({
          label: '确定',
          action: async () => {},
          primary: true
        });
    }

    return actions;
  }

  /**
   * Attempt automatic error recovery
   */
  private static async attemptAutoRecovery(error: CartError): Promise<void> {
    console.log('Attempting auto recovery for error:', error.type);

    try {
      switch (error.type) {
        case CartErrorType.STORAGE_ERROR:
          await this.recoverFromStorageError();
          break;

        case CartErrorType.NETWORK_ERROR:
          await this.recoverFromNetworkError();
          break;

        case CartErrorType.STOCK_ERROR:
          await this.recoverFromStockError(error);
          break;

        default:
          console.log('No auto recovery available for error type:', error.type);
      }
    } catch (recoveryError) {
      console.error('Auto recovery failed:', recoveryError);
    }
  }

  /**
   * Recover from storage errors
   */
  private static async recoverFromStorageError(): Promise<void> {
    try {
      // Clear potentially corrupted data
      await this.clearCorruptedData();
      
      // Reinitialize cart
      const { CartService } = await import('../services/cart');
      await CartService.initializeCart();
      
      console.log('Storage error recovery completed');
    } catch (error) {
      console.error('Storage recovery failed:', error);
      throw error;
    }
  }

  /**
   * Recover from network errors
   */
  private static async recoverFromNetworkError(): Promise<void> {
    // For now, just log the attempt
    // In a real implementation, you might check network status
    console.log('Network error recovery - checking connectivity');
    
    // Could implement network status check here
    // wx.getNetworkType() etc.
  }

  /**
   * Recover from stock errors
   */
  private static async recoverFromStockError(error: CartError): Promise<void> {
    if (!error.productId) return;

    try {
      // Auto-adjust quantity to available stock
      const { CartService } = await import('../services/cart');
      const { ProductService } = await import('../services/product');
      
      const productResponse = await ProductService.getProductById(error.productId);
      if (productResponse.success && productResponse.data) {
        const availableStock = productResponse.data.stock;
        if (availableStock > 0) {
          await CartService.updateCartItemQuantity(error.productId, availableStock);
          console.log(`Auto-adjusted quantity for ${error.productId} to ${availableStock}`);
        } else {
          await CartService.removeFromCart(error.productId);
          console.log(`Removed out-of-stock product ${error.productId}`);
        }
      }
    } catch (recoveryError) {
      console.error('Stock error recovery failed:', recoveryError);
      throw recoveryError;
    }
  }

  /**
   * Clear corrupted data
   */
  private static async clearCorruptedData(): Promise<void> {
    try {
      const { CART_STORAGE_KEYS } = await import('../constants/cart');
      
      // Clear cart data
      wx.removeStorageSync(CART_STORAGE_KEYS.CART_ITEMS);
      wx.removeStorageSync(CART_STORAGE_KEYS.CART_SELECTIONS);
      wx.removeStorageSync(CART_STORAGE_KEYS.CART_BADGE);
      
      // Clear tab bar badge
      wx.removeTabBarBadge({ index: 2 });
      
      console.log('Corrupted cart data cleared');
    } catch (error) {
      console.error('Failed to clear corrupted data:', error);
    }
  }

  /**
   * Get default severity for error type
   */
  private static getDefaultSeverity(type: CartErrorType): CartErrorSeverity {
    switch (type) {
      case CartErrorType.NETWORK_ERROR:
        return CartErrorSeverity.MEDIUM;
      case CartErrorType.STORAGE_ERROR:
        return CartErrorSeverity.HIGH;
      case CartErrorType.VALIDATION_ERROR:
        return CartErrorSeverity.MEDIUM;
      case CartErrorType.STOCK_ERROR:
        return CartErrorSeverity.MEDIUM;
      case CartErrorType.PERMISSION_ERROR:
        return CartErrorSeverity.HIGH;
      case CartErrorType.SERVICE_UNAVAILABLE:
        return CartErrorSeverity.HIGH;
      case CartErrorType.TIMEOUT_ERROR:
        return CartErrorSeverity.MEDIUM;
      default:
        return CartErrorSeverity.MEDIUM;
    }
  }

  /**
   * Check if error type is retryable by default
   */
  private static isRetryableByDefault(type: CartErrorType): boolean {
    switch (type) {
      case CartErrorType.NETWORK_ERROR:
      case CartErrorType.STORAGE_ERROR:
      case CartErrorType.STOCK_ERROR:
      case CartErrorType.SERVICE_UNAVAILABLE:
      case CartErrorType.TIMEOUT_ERROR:
        return true;
      case CartErrorType.VALIDATION_ERROR:
      case CartErrorType.PERMISSION_ERROR:
        return false;
      default:
        return false;
    }
  }

  /**
   * Get default user message for error type
   */
  private static getDefaultUserMessage(type: CartErrorType): string {
    switch (type) {
      case CartErrorType.NETWORK_ERROR:
        return '网络连接异常，请检查网络后重试';
      case CartErrorType.STORAGE_ERROR:
        return '数据存储异常，正在尝试恢复';
      case CartErrorType.VALIDATION_ERROR:
        return '输入信息有误，请检查后重试';
      case CartErrorType.STOCK_ERROR:
        return '库存不足，请调整购买数量';
      case CartErrorType.PERMISSION_ERROR:
        return '权限不足，请重新登录';
      case CartErrorType.SERVICE_UNAVAILABLE:
        return '服务暂时不可用，请稍后重试';
      case CartErrorType.TIMEOUT_ERROR:
        return '操作超时，请重试';
      default:
        return '操作失败，请重试';
    }
  }

  /**
   * Add error to history
   */
  private static addToHistory(error: CartError): void {
    this.errorHistory.unshift(error);
    
    // Keep only recent errors
    if (this.errorHistory.length > this.MAX_ERROR_HISTORY) {
      this.errorHistory = this.errorHistory.slice(0, this.MAX_ERROR_HISTORY);
    }
  }

  /**
   * Get error history for debugging
   */
  static getErrorHistory(): CartError[] {
    return [...this.errorHistory];
  }

  /**
   * Clear error history
   */
  static clearErrorHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Get error statistics
   */
  static getErrorStats(): {
    totalErrors: number;
    errorsByType: { [key in CartErrorType]?: number };
    errorsBySeverity: { [key in CartErrorSeverity]?: number };
    recentErrors: number;
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const errorsByType: { [key in CartErrorType]?: number } = {};
    const errorsBySeverity: { [key in CartErrorSeverity]?: number } = {};
    let recentErrors = 0;

    this.errorHistory.forEach(error => {
      // Count by type
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      
      // Count by severity
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
      
      // Count recent errors
      if (error.timestamp > oneHourAgo) {
        recentErrors++;
      }
    });

    return {
      totalErrors: this.errorHistory.length,
      errorsByType,
      errorsBySeverity,
      recentErrors
    };
  }
}

/**
 * Utility function to wrap async operations with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  errorType: CartErrorType = CartErrorType.UNKNOWN_ERROR
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    const cartError = CartErrorHandler.createError(
      errorType,
      `Error in ${context}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        retryable: true
      }
    );
    
    await CartErrorHandler.handleError(cartError);
    return null;
  }
}

/**
 * Utility function for network operations with retry
 */
export async function withNetworkRetry<T>(
  operation: () => Promise<T>,
  context: string,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T | null> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Network operation failed (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt < maxRetries) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }
  
  // All retries failed
  await CartErrorHandler.handleNetworkError(lastError, context, operation);
  return null;
}
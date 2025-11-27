/**
 * Cart error handling utility
 * Provides centralized error handling for cart operations
 */

import { CART_ERROR_MESSAGES } from '../constants/cart';

/**
 * Cart error handler class
 */
export class CartErrorHandler {
  /**
   * Handle cart operation errors
   */
  static handleError(error: CartError): void {
    console.error('Cart error:', error);

    switch (error.type) {
      case CartErrorType.NETWORK_ERROR:
        this.showNetworkError(error);
        break;
      case CartErrorType.STORAGE_ERROR:
        this.showStorageError(error);
        break;
      case CartErrorType.VALIDATION_ERROR:
        this.showValidationError(error);
        break;
      case CartErrorType.STOCK_ERROR:
        this.showStockError(error);
        break;
      case CartErrorType.PERMISSION_ERROR:
        this.showPermissionError(error);
        break;
      default:
        this.showGenericError(error);
    }
  }

  /**
   * Show network error message
   */
  private static showNetworkError(error: CartError): void {
    wx.showToast({
      title: CART_ERROR_MESSAGES.NETWORK_ERROR,
      icon: 'none',
      duration: 3000
    });

    if (error.retryable) {
      this.showRetryOption(error);
    }
  }

  /**
   * Show storage error message
   */
  private static showStorageError(error: CartError): void {
    wx.showToast({
      title: CART_ERROR_MESSAGES.STORAGE_ERROR,
      icon: 'none',
      duration: 2000
    });
  }

  /**
   * Show validation error message
   */
  private static showValidationError(error: CartError): void {
    wx.showToast({
      title: error.message || CART_ERROR_MESSAGES.VALIDATION_ERROR,
      icon: 'none',
      duration: 2000
    });
  }

  /**
   * Show stock error message
   */
  private static showStockError(error: CartError): void {
    wx.showModal({
      title: '库存不足',
      content: error.message || CART_ERROR_MESSAGES.STOCK_ERROR,
      showCancel: false,
      confirmText: '知道了'
    });
  }

  /**
   * Show permission error message
   */
  private static showPermissionError(error: CartError): void {
    wx.showModal({
      title: '需要登录',
      content: CART_ERROR_MESSAGES.PERMISSION_ERROR,
      confirmText: '去登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // Navigate to login page
          wx.navigateTo({
            url: '/pages/login/index'
          });
        }
      }
    });
  }

  /**
   * Show generic error message
   */
  private static showGenericError(error: CartError): void {
    wx.showToast({
      title: error.message || CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      icon: 'none',
      duration: 2000
    });
  }

  /**
   * Show retry option for retryable errors
   */
  private static showRetryOption(error: CartError): void {
    setTimeout(() => {
      wx.showModal({
        title: '操作失败',
        content: '是否重试？',
        confirmText: '重试',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // Emit retry event
            wx.$emit?.('cartRetryOperation', { error });
          }
        }
      });
    }, 1000);
  }

  /**
   * Create cart error object
   */
  static createError(
    type: CartErrorType,
    message: string,
    productId?: string,
    retryable: boolean = false
  ): CartError {
    return {
      type,
      message,
      productId,
      retryable
    };
  }

  /**
   * Handle async cart operation with error handling
   */
  static async handleAsyncOperation<T>(
    operation: () => Promise<T>,
    errorContext: string = '购物车操作'
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      console.error(`${errorContext} failed:`, error);
      
      let cartError: CartError;
      
      if (error instanceof Error) {
        // Determine error type based on error message or type
        if (error.message.includes('网络') || error.message.includes('network')) {
          cartError = this.createError(CartErrorType.NETWORK_ERROR, error.message, undefined, true);
        } else if (error.message.includes('存储') || error.message.includes('storage')) {
          cartError = this.createError(CartErrorType.STORAGE_ERROR, error.message);
        } else if (error.message.includes('库存') || error.message.includes('stock')) {
          cartError = this.createError(CartErrorType.STOCK_ERROR, error.message);
        } else if (error.message.includes('权限') || error.message.includes('permission')) {
          cartError = this.createError(CartErrorType.PERMISSION_ERROR, error.message);
        } else {
          cartError = this.createError(CartErrorType.VALIDATION_ERROR, error.message);
        }
      } else {
        cartError = this.createError(CartErrorType.VALIDATION_ERROR, `${errorContext}失败`);
      }
      
      this.handleError(cartError);
      return null;
    }
  }

  /**
   * Validate cart operation input
   */
  static validateInput(productId: string, quantity?: number): CartError | null {
    if (!productId || typeof productId !== 'string') {
      return this.createError(
        CartErrorType.VALIDATION_ERROR,
        '商品ID无效'
      );
    }

    if (quantity !== undefined) {
      if (!Number.isInteger(quantity) || quantity < 1) {
        return this.createError(
          CartErrorType.VALIDATION_ERROR,
          '商品数量必须为正整数'
        );
      }

      if (quantity > 999) {
        return this.createError(
          CartErrorType.VALIDATION_ERROR,
          '商品数量不能超过999'
        );
      }
    }

    return null;
  }
}
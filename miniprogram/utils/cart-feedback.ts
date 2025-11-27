// utils/cart-feedback.ts
/**
 * User feedback system for cart operations
 */

/**
 * Feedback types
 */
export enum FeedbackType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  LOADING = 'loading'
}

/**
 * Feedback options interface
 */
export interface FeedbackOptions {
  duration?: number;
  mask?: boolean;
  position?: 'top' | 'center' | 'bottom';
  showIcon?: boolean;
  vibrate?: boolean;
}

/**
 * Confirmation dialog options
 */
export interface ConfirmationOptions {
  title?: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  confirmColor?: string;
  cancelColor?: string;
}

/**
 * Action sheet options
 */
export interface ActionSheetOptions {
  itemList: string[];
  itemColor?: string;
}

/**
 * Cart feedback manager
 */
export class CartFeedback {
  private static loadingCount = 0;
  private static currentToast: string | null = null;

  /**
   * Show success message
   */
  static showSuccess(message: string, options: FeedbackOptions = {}): void {
    this.showToast(message, FeedbackType.SUCCESS, options);
    
    if (options.vibrate !== false) {
      this.vibrate('light');
    }
  }

  /**
   * Show error message
   */
  static showError(message: string, options: FeedbackOptions = {}): void {
    this.showToast(message, FeedbackType.ERROR, options);
    
    if (options.vibrate !== false) {
      this.vibrate('medium');
    }
  }

  /**
   * Show warning message
   */
  static showWarning(message: string, options: FeedbackOptions = {}): void {
    this.showToast(message, FeedbackType.WARNING, options);
  }

  /**
   * Show info message
   */
  static showInfo(message: string, options: FeedbackOptions = {}): void {
    this.showToast(message, FeedbackType.INFO, options);
  }

  /**
   * Show loading message
   */
  static showLoading(message: string = '加载中...', options: FeedbackOptions = {}): void {
    this.loadingCount++;
    this.showToast(message, FeedbackType.LOADING, {
      duration: 0,
      mask: true,
      ...options
    });
  }

  /**
   * Hide loading message
   */
  static hideLoading(): void {
    this.loadingCount = Math.max(0, this.loadingCount - 1);
    
    if (this.loadingCount === 0) {
      wx.hideToast();
      this.currentToast = null;
    }
  }

  /**
   * Show confirmation dialog
   */
  static async showConfirmation(options: ConfirmationOptions): Promise<boolean> {
    return new Promise((resolve) => {
      wx.showModal({
        title: options.title || '确认操作',
        content: options.content,
        showCancel: options.showCancel !== false,
        confirmText: options.confirmText || '确定',
        cancelText: options.cancelText || '取消',
        confirmColor: options.confirmColor || '#007AFF',
        cancelColor: options.cancelColor || '#000000',
        success: (res) => {
          resolve(res.confirm);
        },
        fail: () => {
          resolve(false);
        }
      });
    });
  }

  /**
   * Show action sheet
   */
  static async showActionSheet(options: ActionSheetOptions): Promise<number | null> {
    return new Promise((resolve) => {
      wx.showActionSheet({
        itemList: options.itemList,
        itemColor: options.itemColor || '#000000',
        success: (res) => {
          resolve(res.tapIndex);
        },
        fail: () => {
          resolve(null);
        }
      });
    });
  }

  /**
   * Show cart operation feedback
   */
  static showCartOperationFeedback(
    operation: 'add' | 'remove' | 'update' | 'clear' | 'select',
    success: boolean,
    details?: {
      productName?: string;
      quantity?: number;
      count?: number;
    }
  ): void {
    if (success) {
      switch (operation) {
        case 'add':
          this.showSuccess(
            details?.productName 
              ? `已添加 ${details.productName} 到购物车`
              : '已添加到购物车'
          );
          break;
        case 'remove':
          this.showSuccess(
            details?.productName
              ? `已从购物车移除 ${details.productName}`
              : '已从购物车移除'
          );
          break;
        case 'update':
          this.showSuccess(
            details?.quantity
              ? `数量已更新为 ${details.quantity}`
              : '数量已更新'
          );
          break;
        case 'clear':
          this.showSuccess('购物车已清空');
          break;
        case 'select':
          this.showInfo(
            details?.count
              ? `已选择 ${details.count} 件商品`
              : '选择已更新'
          );
          break;
      }
    } else {
      switch (operation) {
        case 'add':
          this.showError('添加到购物车失败');
          break;
        case 'remove':
          this.showError('移除商品失败');
          break;
        case 'update':
          this.showError('更新数量失败');
          break;
        case 'clear':
          this.showError('清空购物车失败');
          break;
        case 'select':
          this.showError('选择操作失败');
          break;
      }
    }
  }

  /**
   * Show stock-related feedback
   */
  static showStockFeedback(
    type: 'insufficient' | 'adjusted' | 'unavailable',
    details: {
      productName?: string;
      requested?: number;
      available?: number;
      adjusted?: number;
    }
  ): void {
    switch (type) {
      case 'insufficient':
        this.showWarning(
          details.productName
            ? `${details.productName} 库存不足，仅剩 ${details.available} 件`
            : `库存不足，仅剩 ${details.available} 件`
        );
        break;
      case 'adjusted':
        this.showWarning(
          details.productName
            ? `${details.productName} 数量已调整为 ${details.adjusted} 件`
            : `数量已调整为 ${details.adjusted} 件`
        );
        break;
      case 'unavailable':
        this.showError(
          details.productName
            ? `${details.productName} 暂时缺货`
            : '商品暂时缺货'
        );
        break;
    }
  }

  /**
   * Show network-related feedback
   */
  static showNetworkFeedback(
    type: 'offline' | 'slow' | 'error' | 'recovered',
    action?: string
  ): void {
    switch (type) {
      case 'offline':
        this.showError('网络连接已断开，请检查网络设置');
        break;
      case 'slow':
        this.showWarning('网络连接较慢，请耐心等待');
        break;
      case 'error':
        this.showError(
          action 
            ? `${action}失败，请检查网络后重试`
            : '网络请求失败，请重试'
        );
        break;
      case 'recovered':
        this.showSuccess('网络连接已恢复');
        break;
    }
  }

  /**
   * Show validation feedback
   */
  static showValidationFeedback(
    field: string,
    issue: 'required' | 'invalid' | 'range' | 'format',
    details?: {
      min?: number;
      max?: number;
      current?: number;
    }
  ): void {
    let message = '';
    
    switch (issue) {
      case 'required':
        message = `请输入${field}`;
        break;
      case 'invalid':
        message = `${field}无效`;
        break;
      case 'range':
        if (details?.min !== undefined && details?.max !== undefined) {
          message = `${field}应在 ${details.min} 到 ${details.max} 之间`;
        } else if (details?.min !== undefined) {
          message = `${field}不能少于 ${details.min}`;
        } else if (details?.max !== undefined) {
          message = `${field}不能超过 ${details.max}`;
        } else {
          message = `${field}超出有效范围`;
        }
        break;
      case 'format':
        message = `${field}格式不正确`;
        break;
    }
    
    this.showWarning(message);
  }

  /**
   * Show batch operation feedback
   */
  static showBatchOperationFeedback(
    operation: 'delete' | 'select' | 'move',
    count: number,
    success: boolean
  ): void {
    if (success) {
      switch (operation) {
        case 'delete':
          this.showSuccess(`已删除 ${count} 件商品`);
          break;
        case 'select':
          this.showInfo(`已选择 ${count} 件商品`);
          break;
        case 'move':
          this.showSuccess(`已移动 ${count} 件商品`);
          break;
      }
    } else {
      switch (operation) {
        case 'delete':
          this.showError(`删除 ${count} 件商品失败`);
          break;
        case 'select':
          this.showError(`选择 ${count} 件商品失败`);
          break;
        case 'move':
          this.showError(`移动 ${count} 件商品失败`);
          break;
      }
    }
  }

  /**
   * Show checkout feedback
   */
  static showCheckoutFeedback(
    type: 'validation' | 'processing' | 'success' | 'failed',
    details?: {
      message?: string;
      orderId?: string;
      amount?: number;
    }
  ): void {
    switch (type) {
      case 'validation':
        this.showWarning(details?.message || '请检查商品信息后重试');
        break;
      case 'processing':
        this.showLoading('正在处理订单...');
        break;
      case 'success':
        this.hideLoading();
        this.showSuccess(
          details?.orderId
            ? `订单提交成功，订单号：${details.orderId}`
            : '订单提交成功'
        );
        break;
      case 'failed':
        this.hideLoading();
        this.showError(details?.message || '订单提交失败，请重试');
        break;
    }
  }

  /**
   * Private method to show toast
   */
  private static showToast(
    message: string,
    type: FeedbackType,
    options: FeedbackOptions = {}
  ): void {
    // Hide current toast if exists
    if (this.currentToast && type !== FeedbackType.LOADING) {
      wx.hideToast();
    }

    const iconMap = {
      [FeedbackType.SUCCESS]: 'success',
      [FeedbackType.ERROR]: 'error',
      [FeedbackType.WARNING]: 'none',
      [FeedbackType.INFO]: 'none',
      [FeedbackType.LOADING]: 'loading'
    };

    const icon = options.showIcon !== false ? iconMap[type] : 'none';
    const duration = options.duration !== undefined ? options.duration : 2000;

    wx.showToast({
      title: message,
      icon: icon as any,
      duration: type === FeedbackType.LOADING ? 0 : duration,
      mask: options.mask || false
    });

    this.currentToast = message;

    // Auto hide non-loading toasts
    if (type !== FeedbackType.LOADING && duration > 0) {
      setTimeout(() => {
        if (this.currentToast === message) {
          this.currentToast = null;
        }
      }, duration);
    }
  }

  /**
   * Trigger haptic feedback
   */
  private static vibrate(type: 'light' | 'medium' | 'heavy' = 'light'): void {
    try {
      if (wx.vibrateShort) {
        wx.vibrateShort({
          type: type as any,
          fail: () => {
            // Fallback to basic vibration
            wx.vibrateLong?.();
          }
        });
      }
    } catch (error) {
      console.warn('Vibration not supported:', error);
    }
  }

  /**
   * Clear all feedback
   */
  static clearAll(): void {
    wx.hideToast();
    this.currentToast = null;
    this.loadingCount = 0;
  }

  /**
   * Show contextual help
   */
  static async showHelp(
    topic: 'cart_usage' | 'quantity_limits' | 'checkout_process' | 'stock_issues'
  ): Promise<void> {
    const helpContent = this.getHelpContent(topic);
    
    await this.showConfirmation({
      title: '使用帮助',
      content: helpContent,
      showCancel: false,
      confirmText: '知道了'
    });
  }

  /**
   * Get help content for topics
   */
  private static getHelpContent(topic: string): string {
    const helpTexts = {
      cart_usage: '在购物车中，您可以：\n• 调整商品数量\n• 选择要结算的商品\n• 删除不需要的商品\n• 查看价格合计',
      quantity_limits: '商品数量限制：\n• 最少购买1件\n• 最多不超过库存数量\n• 部分商品可能有购买限制',
      checkout_process: '结算流程：\n• 选择要购买的商品\n• 点击"去结算"按钮\n• 确认订单信息\n• 选择支付方式',
      stock_issues: '库存问题处理：\n• 库存不足时会自动调整数量\n• 缺货商品会被移除\n• 建议及时下单避免缺货'
    };
    
    return helpTexts[topic as keyof typeof helpTexts] || '暂无相关帮助信息';
  }
}

/**
 * Utility functions for common feedback scenarios
 */

/**
 * Show confirmation for destructive actions
 */
export async function confirmDestructiveAction(
  action: string,
  target?: string
): Promise<boolean> {
  return CartFeedback.showConfirmation({
    title: '确认操作',
    content: target ? `确定要${action} ${target} 吗？` : `确定要${action}吗？`,
    confirmText: '确定',
    cancelText: '取消',
    confirmColor: '#FF3B30'
  });
}

/**
 * Show quantity adjustment confirmation
 */
export async function confirmQuantityAdjustment(
  productName: string,
  oldQuantity: number,
  newQuantity: number
): Promise<boolean> {
  return CartFeedback.showConfirmation({
    title: '数量调整',
    content: `${productName}\n数量将从 ${oldQuantity} 调整为 ${newQuantity}`,
    confirmText: '确定',
    cancelText: '取消'
  });
}

/**
 * Show stock adjustment notification
 */
export function notifyStockAdjustment(
  productName: string,
  requestedQuantity: number,
  availableQuantity: number
): void {
  CartFeedback.showStockFeedback('adjusted', {
    productName,
    requested: requestedQuantity,
    available: availableQuantity,
    adjusted: availableQuantity
  });
}

/**
 * Show operation progress
 */
export class OperationProgress {
  private static operations = new Map<string, boolean>();

  static start(operationId: string, message: string = '处理中...'): void {
    this.operations.set(operationId, true);
    CartFeedback.showLoading(message);
  }

  static finish(operationId: string, success: boolean, message?: string): void {
    if (this.operations.has(operationId)) {
      this.operations.delete(operationId);
      CartFeedback.hideLoading();
      
      if (message) {
        if (success) {
          CartFeedback.showSuccess(message);
        } else {
          CartFeedback.showError(message);
        }
      }
    }
  }

  static isRunning(operationId: string): boolean {
    return this.operations.has(operationId);
  }

  static clear(): void {
    this.operations.clear();
    CartFeedback.hideLoading();
  }
}
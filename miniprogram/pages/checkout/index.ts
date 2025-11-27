// pages/checkout/index.ts
import { CartService } from '../../services/cart';
import { CartManager, CartEventType } from '../../utils/cart-manager';
import { CART_ERROR_MESSAGES } from '../../constants/cart';

/**
 * 结算页面数据接口
 */
interface CheckoutPageData extends WechatMiniprogram.Page.DataOption {
  /** 结算商品列表 */
  checkoutItems: CartItemWithProduct[];
  /** 选中的收货地址 */
  selectedAddress: any | null;
  /** 订单备注 */
  orderNote: string;
  /** 选中的优惠券 */
  selectedCoupon: any | null;
  /** 价格汇总 */
  summary: CartSummary;
  /** 页面加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: string;
  /** 是否可以提交订单 */
  canSubmit: boolean;
  /** 提交按钮文本 */
  submitButtonText: string;
  /** 是否显示库存不足提示 */
  showStockAlert: boolean;
  /** 库存错误列表 */
  stockErrors: Array<{
    productId: string;
    productName: string;
    availableStock: number;
    requestedQuantity: number;
  }>;
}

/**
 * 库存验证结果
 */
interface StockValidationResult {
  isValid: boolean;
  errors: Array<{
    productId: string;
    productName: string;
    availableStock: number;
    requestedQuantity: number;
  }>;
}

/**
 * 结算状态
 */
interface CheckoutState {
  /** 结算商品数据 */
  items: CartItemWithProduct[];
  /** 价格汇总 */
  summary: CartSummary;
  /** 创建时间 */
  createdAt: Date;
  /** 是否已验证 */
  validated: boolean;
}

/**
 * 结算页面
 * 实现结算流程集成，包括数据传递、库存验证、状态保持等功能
 */
Page<CheckoutPageData, WechatMiniprogram.Page.CustomOption>({
  /**
   * 页面数据
   */
  data: {
    checkoutItems: [],
    selectedAddress: null,
    orderNote: '',
    selectedCoupon: null,
    summary: {
      totalItems: 0,
      totalPrice: 0,
      discountAmount: 0,
      finalPrice: 0
    },
    loading: true,
    error: '',
    canSubmit: false,
    submitButtonText: '提交订单',
    showStockAlert: false,
    stockErrors: []
  },

  /**
   * 页面生命周期 - 加载
   */
  onLoad(options: Record<string, string>) {
    console.log('Checkout page loaded with options:', options);
    this.initializePage(options);
  },

  /**
   * 页面生命周期 - 显示
   */
  onShow() {
    console.log('Checkout page shown');
    this.validateCheckoutData();
  },

  /**
   * 页面生命周期 - 隐藏
   */
  onHide() {
    console.log('Checkout page hidden');
    this.saveCheckoutState();
  },

  /**
   * 页面生命周期 - 卸载
   */
  onUnload() {
    console.log('Checkout page unloaded');
    this.cleanup();
  },

  /**
   * 初始化页面
   */
  async initializePage(options: Record<string, string>) {
    try {
      console.log('Initializing checkout page');
      
      // 设置页面标题
      wx.setNavigationBarTitle({
        title: '确认订单'
      });

      // 解析传入的数据
      await this.parseCheckoutData(options);

      // 验证结算数据
      await this.validateCheckoutData();

      // 加载用户地址信息
      await this.loadUserAddress();

      // 检查页面状态
      this.updatePageState();

      console.log('Checkout page initialized successfully');
    } catch (error) {
      console.error('Failed to initialize checkout page:', error);
      this.handleError(error instanceof Error ? error.message : '页面初始化失败');
    }
  },

  /**
   * 解析结算数据
   */
  async parseCheckoutData(options: Record<string, string>) {
    try {
      console.log('Parsing checkout data from options');

      let checkoutItems: CartItemWithProduct[] = [];
      let summary: CartSummary = {
        totalItems: 0,
        totalPrice: 0,
        discountAmount: 0,
        finalPrice: 0
      };

      // 优先从会话ID加载数据
      if (options.sessionId) {
        console.log('Loading checkout data from session:', options.sessionId);
        
        const sessionResponse = await CartService.getCheckoutSession(options.sessionId);
        
        if (sessionResponse.success && sessionResponse.data) {
          const sessionData = sessionResponse.data;
          checkoutItems = sessionData.items;
          summary = sessionData.summary;
          
          console.log('Loaded checkout data from session:', {
            itemCount: checkoutItems.length,
            summary,
            validated: sessionData.validated
          });
        } else {
          console.log('Session not found or expired, falling back to URL data');
        }
      }

      // 如果会话数据不可用，从URL参数解析
      if (checkoutItems.length === 0 && options.data) {
        console.log('Parsing checkout data from URL parameters');
        
        const checkoutData = JSON.parse(decodeURIComponent(options.data));
        checkoutItems = checkoutData.items || [];
        summary = checkoutData.summary || summary;
        
        console.log('Parsed checkout data from URL:', { 
          itemCount: checkoutItems.length, 
          summary 
        });
      }

      // 最后尝试从购物车服务获取选中商品
      if (checkoutItems.length === 0) {
        console.log('Loading selected items from cart service');
        
        const selectedItemsResponse = await CartService.getSelectedItems();
        
        if (!selectedItemsResponse.success || !selectedItemsResponse.data) {
          throw new Error('获取结算商品失败，请返回购物车重试');
        }

        checkoutItems = selectedItemsResponse.data;
        
        if (checkoutItems.length === 0) {
          throw new Error('没有选中的商品，请返回购物车选择商品');
        }

        // 计算价格汇总
        const selectedIds = checkoutItems.map(item => item.productId);
        const summaryResponse = await CartService.calculateSelectedTotal(selectedIds);
        
        if (summaryResponse.success && summaryResponse.data) {
          summary = summaryResponse.data;
        }
      }

      // 保存结算状态
      await this.saveCheckoutState({
        items: checkoutItems,
        summary,
        createdAt: new Date(),
        validated: false
      });

      // 更新页面数据
      this.setData({
        checkoutItems,
        summary,
        loading: false
      });

      console.log('Checkout data parsed successfully:', {
        itemCount: checkoutItems.length,
        totalPrice: summary.finalPrice
      });

    } catch (error) {
      console.error('Failed to parse checkout data:', error);
      throw error;
    }
  },

  /**
   * 验证结算数据
   */
  async validateCheckoutData() {
    try {
      console.log('Validating checkout data');

      const { checkoutItems } = this.data;
      
      if (checkoutItems.length === 0) {
        this.handleError('没有要结算的商品');
        return;
      }

      // 验证库存
      const stockValidation = await this.validateStock(checkoutItems);
      
      if (!stockValidation.isValid) {
        console.log('Stock validation failed:', stockValidation.errors);
        
        this.setData({
          showStockAlert: true,
          stockErrors: stockValidation.errors,
          canSubmit: false,
          submitButtonText: '库存不足'
        });
        
        return;
      }

      // 重新计算价格（防止价格变动）
      await this.recalculatePrices();

      // 更新结算状态为已验证
      const currentState = await this.getCheckoutState();
      if (currentState) {
        await this.saveCheckoutState({
          ...currentState,
          validated: true
        });
      }

      console.log('Checkout data validation completed successfully');

    } catch (error) {
      console.error('Failed to validate checkout data:', error);
      this.handleError('数据验证失败，请重试');
    }
  },

  /**
   * 验证库存
   */
  async validateStock(items: CartItemWithProduct[]): Promise<StockValidationResult> {
    try {
      console.log('Validating stock for checkout items');

      const errors: StockValidationResult['errors'] = [];

      // 重新获取最新的商品信息进行库存检查
      const { ProductService } = await import('../../services/product');

      for (const item of items) {
        const productResponse = await ProductService.getProductById(item.productId);
        
        if (!productResponse.success || !productResponse.data) {
          errors.push({
            productId: item.productId,
            productName: item.product.name,
            availableStock: 0,
            requestedQuantity: item.quantity
          });
          continue;
        }

        const currentProduct = productResponse.data;
        
        if (item.quantity > currentProduct.stock) {
          errors.push({
            productId: item.productId,
            productName: item.product.name,
            availableStock: currentProduct.stock,
            requestedQuantity: item.quantity
          });
        }
      }

      const isValid = errors.length === 0;

      console.log('Stock validation result:', { isValid, errorCount: errors.length });

      return {
        isValid,
        errors
      };

    } catch (error) {
      console.error('Failed to validate stock:', error);
      return {
        isValid: false,
        errors: []
      };
    }
  },

  /**
   * 重新计算价格
   */
  async recalculatePrices() {
    try {
      console.log('Recalculating prices');

      const { checkoutItems } = this.data;
      const selectedIds = checkoutItems.map(item => item.productId);
      
      const summaryResponse = await CartService.calculateSelectedTotal(selectedIds);
      
      if (summaryResponse.success && summaryResponse.data) {
        this.setData({
          summary: summaryResponse.data
        });
        
        console.log('Prices recalculated:', summaryResponse.data);
      }

    } catch (error) {
      console.error('Failed to recalculate prices:', error);
    }
  },

  /**
   * 加载用户地址
   */
  async loadUserAddress() {
    try {
      console.log('Loading user address');

      // 这里应该调用地址服务获取用户默认地址
      // 暂时使用模拟数据
      const mockAddress = {
        id: '1',
        name: '张三',
        phone: '138****8888',
        address: '北京市朝阳区某某街道某某小区某某号楼某某单元某某室'
      };

      this.setData({
        selectedAddress: mockAddress
      });

      console.log('User address loaded');

    } catch (error) {
      console.error('Failed to load user address:', error);
      // 地址加载失败不影响结算流程
    }
  },

  /**
   * 更新页面状态
   */
  updatePageState() {
    const { checkoutItems, selectedAddress, showStockAlert } = this.data;
    
    // 检查是否可以提交订单
    const canSubmit = checkoutItems.length > 0 && 
                     selectedAddress !== null && 
                     !showStockAlert;

    let submitButtonText = '提交订单';
    
    if (showStockAlert) {
      submitButtonText = '库存不足';
    } else if (!selectedAddress) {
      submitButtonText = '请选择收货地址';
    } else if (checkoutItems.length === 0) {
      submitButtonText = '没有商品';
    }

    this.setData({
      canSubmit,
      submitButtonText
    });

    console.log('Page state updated:', { canSubmit, submitButtonText });
  },

  /**
   * 地址选择
   */
  onAddressSelect() {
    console.log('Address selection requested');
    
    // 跳转到地址选择页面
    wx.navigateTo({
      url: '/pages/address/select'
    });
  },

  /**
   * 优惠券选择
   */
  onCouponSelect() {
    console.log('Coupon selection requested');
    
    // 跳转到优惠券选择页面
    wx.navigateTo({
      url: '/pages/coupon/select'
    });
  },

  /**
   * 订单备注输入
   */
  onNoteInput(event: WechatMiniprogram.Input) {
    const { value } = event.detail;
    
    this.setData({
      orderNote: value
    });
    
    console.log('Order note updated:', value);
  },

  /**
   * 提交订单
   */
  async onSubmitOrder() {
    try {
      const { canSubmit, checkoutItems, selectedAddress, orderNote, summary } = this.data;
      
      if (!canSubmit) {
        this.showToast('请检查订单信息', 'none');
        return;
      }

      console.log('Submitting order');

      // 显示加载状态
      this.setData({
        canSubmit: false,
        submitButtonText: '提交中...'
      });

      // 最后一次库存验证
      const stockValidation = await this.validateStock(checkoutItems);
      
      if (!stockValidation.isValid) {
        this.setData({
          showStockAlert: true,
          stockErrors: stockValidation.errors,
          canSubmit: false,
          submitButtonText: '库存不足'
        });
        return;
      }

      // 构建订单数据
      const orderData = {
        items: checkoutItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.discountedPrice || item.product.originalPrice
        })),
        address: selectedAddress,
        note: orderNote,
        summary,
        paymentMethod: 'wechat',
        deliveryMethod: 'standard'
      };

      console.log('Order data prepared:', orderData);

      // 这里应该调用订单服务创建订单
      // 暂时模拟订单创建
      await this.simulateOrderCreation(orderData);

      // 清理结算状态
      await this.clearCheckoutState();

      // 跳转到支付页面或订单详情页
      wx.redirectTo({
        url: '/pages/order/detail?id=mock_order_id'
      });

    } catch (error) {
      console.error('Failed to submit order:', error);
      this.handleError(error instanceof Error ? error.message : '订单提交失败');
      
      // 恢复按钮状态
      this.updatePageState();
    }
  },

  /**
   * 模拟订单创建
   */
  async simulateOrderCreation(orderData: any): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Order created successfully (simulated)');
        resolve();
      }, 1500);
    });
  },

  /**
   * 关闭库存不足提示
   */
  onCloseStockAlert() {
    this.setData({
      showStockAlert: false
    });
  },

  /**
   * 返回购物车
   */
  onBackToCart() {
    console.log('Navigating back to cart');
    
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 重试
   */
  async onRetry() {
    console.log('Retrying checkout initialization');
    
    this.setData({
      loading: true,
      error: ''
    });

    try {
      await this.validateCheckoutData();
      await this.loadUserAddress();
      this.updatePageState();
    } catch (error) {
      this.handleError(error instanceof Error ? error.message : '重试失败');
    }
  },

  /**
   * 保存结算状态
   */
  async saveCheckoutState(state?: CheckoutState) {
    try {
      const checkoutState = state || {
        items: this.data.checkoutItems,
        summary: this.data.summary,
        createdAt: new Date(),
        validated: false
      };

      wx.setStorageSync('checkout_state', JSON.stringify(checkoutState));
      console.log('Checkout state saved');

    } catch (error) {
      console.error('Failed to save checkout state:', error);
    }
  },

  /**
   * 获取结算状态
   */
  async getCheckoutState(): Promise<CheckoutState | null> {
    try {
      const stateData = wx.getStorageSync('checkout_state');
      
      if (!stateData) {
        return null;
      }

      const state: CheckoutState = JSON.parse(stateData);
      
      // 检查状态是否过期（30分钟）
      const now = new Date();
      const createdAt = new Date(state.createdAt);
      const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
      
      if (diffMinutes > 30) {
        console.log('Checkout state expired, clearing');
        await this.clearCheckoutState();
        return null;
      }

      return state;

    } catch (error) {
      console.error('Failed to get checkout state:', error);
      return null;
    }
  },

  /**
   * 清理结算状态
   */
  async clearCheckoutState() {
    try {
      wx.removeStorageSync('checkout_state');
      console.log('Checkout state cleared');
    } catch (error) {
      console.error('Failed to clear checkout state:', error);
    }
  },

  /**
   * 清理资源
   */
  cleanup() {
    console.log('Cleaning up checkout page resources');
    
    // 清理定时器等资源
    // 这里可以添加其他清理逻辑
  },

  /**
   * 错误处理
   */
  handleError(message: string) {
    console.error('Checkout page error:', message);
    
    this.setData({
      error: message,
      loading: false,
      canSubmit: false
    });

    // 显示错误提示
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 3000
    });
  },

  /**
   * 显示提示信息
   */
  showToast(message: string, icon: 'success' | 'error' | 'none' = 'success') {
    wx.showToast({
      title: message,
      icon: icon,
      duration: 2000
    });
  },

  /**
   * 页面分享
   */
  onShareAppMessage() {
    return {
      title: '确认订单',
      path: '/pages/checkout/index'
    };
  }
});
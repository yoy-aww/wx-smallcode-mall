// pages/cart/index.ts
import { CartService } from '../../services/cart';
import { CartManager, CartEventType } from '../../utils/cart-manager';

/**
 * 购物车页面
 * 实现商品展示、选择、数量调整、删除和结算功能
 */
Page<CartPageData, WechatMiniprogram.Page.CustomOption>({
  /**
   * 页面数据
   */
  data: {
    // 购物车商品列表
    cartItems: [],
    // 选中的商品ID列表
    selectedItems: [],
    // 是否全选
    selectAll: false,
    // 页面加载状态
    loading: true,
    // 错误信息
    error: '',
    // 合计信息
    summary: {
      totalItems: 0,
      totalPrice: 0,
      discountAmount: 0,
      finalPrice: 0
    },
    // 编辑模式
    editMode: false
  },

  /**
   * 页面生命周期 - 加载
   */
  onLoad() {
    console.log('Cart page loaded');
    this.initializePage();
  },

  /**
   * 页面生命周期 - 显示
   */
  onShow() {
    console.log('Cart page shown');
    this.refreshCartData();
  },

  /**
   * 页面生命周期 - 隐藏
   */
  onHide() {
    console.log('Cart page hidden');
    this.saveCurrentState();
  },

  /**
   * 页面生命周期 - 卸载
   */
  onUnload() {
    console.log('Cart page unloaded');
    this.cleanup();
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    console.log('Pull down refresh triggered');
    this.refreshCartData().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 初始化页面
   */
  async initializePage() {
    try {
      console.log('Initializing cart page');
      
      // 设置页面标题
      wx.setNavigationBarTitle({
        title: '购物车'
      });

      // 初始化购物车管理器
      CartManager.initialize();

      // 注册事件监听器
      this.registerEventListeners();

      // 加载购物车数据
      await this.loadCartData();

      console.log('Cart page initialized successfully');
    } catch (error) {
      console.error('Failed to initialize cart page:', error);
      this.handleError('页面初始化失败，请重试');
    }
  },

  /**
   * 注册事件监听器
   */
  registerEventListeners() {
    console.log('Registering cart event listeners');

    // 监听购物车项目变化
    CartManager.addEventListener(CartEventType.ITEM_ADDED, () => {
      this.refreshCartData();
    });

    CartManager.addEventListener(CartEventType.ITEM_REMOVED, () => {
      this.refreshCartData();
    });

    CartManager.addEventListener(CartEventType.ITEM_UPDATED, () => {
      this.refreshCartData();
    });

    CartManager.addEventListener(CartEventType.CART_CLEARED, () => {
      this.refreshCartData();
    });

    CartManager.addEventListener(CartEventType.BATCH_OPERATION_COMPLETED, () => {
      this.refreshCartData();
    });
  },

  /**
   * 加载购物车数据
   */
  async loadCartData() {
    try {
      console.log('Loading cart data');
      
      this.setData({ loading: true, error: '' });

      // 获取购物车商品
      const cartItemsResponse = await CartService.getCartItemsWithProducts();
      
      if (!cartItemsResponse.success) {
        throw new Error(cartItemsResponse.error || '获取购物车数据失败');
      }

      const cartItems = cartItemsResponse.data || [];

      // 获取选择状态
      const selections = await CartService.getSelections();
      const selectedItems = Array.from(selections.entries())
        .filter(([_, selected]) => selected)
        .map(([productId, _]) => productId);

      // 计算全选状态
      const selectAll = cartItems.length > 0 && selectedItems.length === cartItems.length;

      // 计算合计信息
      const summary = await this.calculateSummary(selectedItems);

      // 更新页面数据
      this.setData({
        cartItems,
        selectedItems,
        selectAll,
        summary,
        loading: false
      });

      console.log('Cart data loaded successfully:', {
        itemCount: cartItems.length,
        selectedCount: selectedItems.length,
        summary
      });

    } catch (error) {
      console.error('Failed to load cart data:', error);
      this.setData({ loading: false });
      this.handleError(error instanceof Error ? error.message : '加载购物车数据失败');
    }
  },

  /**
   * 刷新购物车数据
   */
  async refreshCartData() {
    try {
      console.log('Refreshing cart data');
      
      // 验证购物车数据
      const validationResponse = await CartService.validateCartItems();
      
      if (validationResponse.success && validationResponse.data) {
        const { invalidItems, stockAdjustedItems } = validationResponse.data;
        
        // 显示验证结果提示
        if (invalidItems.length > 0) {
          this.showToast(`${invalidItems.length}件商品已失效，已自动移除`);
        }
        
        if (stockAdjustedItems.length > 0) {
          this.showToast(`${stockAdjustedItems.length}件商品库存不足，已调整数量`);
        }
      }

      // 重新加载数据
      await this.loadCartData();

    } catch (error) {
      console.error('Failed to refresh cart data:', error);
      this.handleError('刷新数据失败，请重试');
    }
  },

  /**
   * 商品选择状态切换
   */
  async onItemSelect(event: WechatMiniprogram.CustomEvent) {
    try {
      const { productId } = event.detail;
      console.log('Item selection toggled:', productId);

      const response = await CartService.toggleItemSelection(productId);
      
      if (!response.success) {
        throw new Error(response.error || '切换选择状态失败');
      }

      // 更新本地状态
      await this.updateSelectionState();

    } catch (error) {
      console.error('Failed to toggle item selection:', error);
      this.handleError('操作失败，请重试');
    }
  },

  /**
   * 全选/取消全选
   */
  async onSelectAll() {
    try {
      const { selectAll } = this.data;
      console.log('Select all toggled:', !selectAll);

      let response;
      if (selectAll) {
        // 取消全选
        response = await CartService.clearAllSelections();
      } else {
        // 全选
        response = await CartService.selectAllItems();
      }

      if (!response.success) {
        throw new Error(response.error || '全选操作失败');
      }

      // 更新本地状态
      await this.updateSelectionState();

    } catch (error) {
      console.error('Failed to toggle select all:', error);
      this.handleError('操作失败，请重试');
    }
  },

  /**
   * 商品数量变化
   */
  async onQuantityChange(event: WechatMiniprogram.CustomEvent) {
    try {
      const { productId, quantity } = event.detail;
      console.log('Quantity changed:', productId, quantity);

      const response = await CartService.updateCartItemQuantity(productId, quantity);
      
      if (!response.success) {
        throw new Error(response.error || '更新数量失败');
      }

      // 刷新数据
      await this.refreshCartData();

      this.showToast('数量已更新');

    } catch (error) {
      console.error('Failed to update quantity:', error);
      this.handleError(error instanceof Error ? error.message : '更新数量失败');
    }
  },

  /**
   * 删除商品
   */
  async onItemDelete(event: WechatMiniprogram.CustomEvent) {
    try {
      const { productId } = event.detail;
      console.log('Item delete requested:', productId);

      const response = await CartService.removeFromCart(productId);
      
      if (!response.success) {
        throw new Error(response.error || '删除商品失败');
      }

      // 刷新数据
      await this.refreshCartData();

      this.showToast('商品已删除');

    } catch (error) {
      console.error('Failed to delete item:', error);
      this.handleError('删除失败，请重试');
    }
  },

  /**
   * 批量删除
   */
  async onBatchDelete() {
    try {
      const { selectedItems } = this.data;
      
      if (selectedItems.length === 0) {
        this.showToast('请选择要删除的商品');
        return;
      }

      console.log('Batch delete requested:', selectedItems);

      const response = await CartService.batchRemoveFromCart(selectedItems);
      
      if (!response.success) {
        throw new Error(response.error || '批量删除失败');
      }

      // 刷新数据
      await this.refreshCartData();

      this.showToast(`已删除${selectedItems.length}件商品`);

    } catch (error) {
      console.error('Failed to batch delete:', error);
      this.handleError('删除失败，请重试');
    }
  },

  /**
   * 结算
   */
  async onCheckout() {
    try {
      const { selectedItems, summary } = this.data;
      
      if (selectedItems.length === 0) {
        this.showToast('请选择要结算的商品');
        return;
      }

      console.log('Checkout requested:', { selectedItems, summary });

      // 获取选中商品详情
      const selectedItemsResponse = await CartService.getSelectedItems();
      
      if (!selectedItemsResponse.success || !selectedItemsResponse.data) {
        throw new Error('获取结算商品失败');
      }

      const selectedProducts = selectedItemsResponse.data;

      // 检查库存
      const stockCheckFailed = selectedProducts.some(item => 
        item.quantity > item.product.stock
      );

      if (stockCheckFailed) {
        this.showToast('部分商品库存不足，请调整数量');
        await this.refreshCartData();
        return;
      }

      // 跳转到结算页面
      wx.navigateTo({
        url: `/pages/checkout/index?data=${encodeURIComponent(JSON.stringify({
          items: selectedProducts,
          summary
        }))}`
      });

    } catch (error) {
      console.error('Failed to checkout:', error);
      this.handleError('结算失败，请重试');
    }
  },

  /**
   * 切换编辑模式
   */
  toggleEditMode() {
    const { editMode } = this.data;
    console.log('Edit mode toggled:', !editMode);
    
    this.setData({
      editMode: !editMode
    });

    // 更新导航栏标题
    wx.setNavigationBarTitle({
      title: !editMode ? '编辑购物车' : '购物车'
    });
  },

  /**
   * 更新选择状态
   */
  async updateSelectionState() {
    try {
      const { cartItems } = this.data;
      
      // 获取最新选择状态
      const selections = await CartService.getSelections();
      const selectedItems = Array.from(selections.entries())
        .filter(([_, selected]) => selected)
        .map(([productId, _]) => productId);

      // 计算全选状态
      const selectAll = cartItems.length > 0 && selectedItems.length === cartItems.length;

      // 计算合计信息
      const summary = await this.calculateSummary(selectedItems);

      // 更新页面数据
      this.setData({
        selectedItems,
        selectAll,
        summary
      });

      console.log('Selection state updated:', {
        selectedCount: selectedItems.length,
        selectAll,
        summary
      });

    } catch (error) {
      console.error('Failed to update selection state:', error);
    }
  },

  /**
   * 计算合计信息
   */
  async calculateSummary(selectedItems: string[]): Promise<CartPageData['summary']> {
    try {
      if (selectedItems.length === 0) {
        return {
          totalItems: 0,
          totalPrice: 0,
          discountAmount: 0,
          finalPrice: 0
        };
      }

      const response = await CartService.calculateSelectedTotal(selectedItems);
      
      if (!response.success || !response.data) {
        throw new Error('计算合计失败');
      }

      return response.data;

    } catch (error) {
      console.error('Failed to calculate summary:', error);
      return {
        totalItems: 0,
        totalPrice: 0,
        discountAmount: 0,
        finalPrice: 0
      };
    }
  },

  /**
   * 保存当前状态
   */
  async saveCurrentState() {
    try {
      console.log('Saving current cart state');
      
      // 状态已通过 CartService 自动保存到本地存储
      // 这里可以添加额外的状态保存逻辑

    } catch (error) {
      console.error('Failed to save current state:', error);
    }
  },

  /**
   * 清理资源
   */
  cleanup() {
    console.log('Cleaning up cart page resources');
    
    // 清理事件监听器
    // CartManager 会在页面卸载时自动清理
  },

  /**
   * 错误处理
   */
  handleError(message: string) {
    console.error('Cart page error:', message);
    
    this.setData({
      error: message,
      loading: false
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
   * 重试加载数据
   */
  async onRetry() {
    console.log('Retry loading cart data');
    await this.loadCartData();
  },

  /**
   * 商品点击事件
   */
  onProductTap(event: WechatMiniprogram.CustomEvent) {
    const { productId } = event.detail;
    console.log('Product tapped:', productId);

    // 跳转到商品详情页
    wx.navigateTo({
      url: `/pages/product-detail/index?id=${productId}`
    });
  },

  /**
   * 长按商品事件
   */
  onProductLongPress(event: WechatMiniprogram.CustomEvent) {
    const { productId } = event.detail;
    console.log('Product long pressed:', productId);

    // 进入编辑模式
    if (!this.data.editMode) {
      this.toggleEditMode();
    }
  },

  /**
   * 优惠详情点击
   */
  onDiscountDetailTap() {
    console.log('Discount detail tapped');
    
    // 显示优惠详情
    wx.showModal({
      title: '优惠详情',
      content: `优惠金额：¥${this.data.summary.discountAmount.toFixed(2)}`,
      showCancel: false
    });
  },

  /**
   * 去购物按钮点击
   */
  goShopping() {
    console.log('Go shopping tapped');
    
    // 跳转到首页
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  /**
   * 页面分享
   */
  onShareAppMessage() {
    return {
      title: '我的购物车',
      path: '/pages/cart/index'
    };
  }
});
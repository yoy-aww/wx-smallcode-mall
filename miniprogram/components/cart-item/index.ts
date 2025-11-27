// components/cart-item/index.ts

Component({
  /**
   * 组件属性定义
   */
  properties: {
    // 购物车商品项数据
    item: {
      type: null,
      value: null,
      observer: 'onItemChange'
    },
    // 是否选中
    selected: {
      type: Boolean,
      value: false
    },
    // 是否编辑模式
    editMode: {
      type: Boolean,
      value: false
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件数据
   */
  data: {
    // 图片加载状态
    imageLoading: true,
    imageError: false,
    
    // 删除确认状态
    showDeleteConfirm: false,
    
    // 动画状态
    animating: false,
    
    // 库存状态
    stockStatus: 'normal' as 'normal' | 'low' | 'out',
    
    // 促销标签
    promotionTags: [] as string[]
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    /**
     * 组件创建时
     */
    created() {
      console.log('CartItem component created');
    },

    /**
     * 组件挂载到页面时
     */
    attached() {
      console.log('CartItem component attached');
      this.initializeComponent();
    },

    /**
     * 组件从页面移除时
     */
    detached() {
      console.log('CartItem component detached');
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 初始化组件
     */
    initializeComponent() {
      this.updateStockStatus();
      this.updatePromotionTags();
    },

    /**
     * 商品数据变化观察者
     */
    onItemChange(newItem: CartItemWithProduct) {
      console.log('Cart item data changed:', newItem);
      
      if (newItem) {
        // 重置图片状态
        this.setData({
          imageLoading: true,
          imageError: false
        });
        
        // 更新状态
        this.updateStockStatus();
        this.updatePromotionTags();
      }
    },

    /**
     * 更新库存状态
     */
    updateStockStatus() {
      const { item } = this.properties;
      
      if (!item || !item.product) {
        return;
      }

      let stockStatus: 'normal' | 'low' | 'out' = 'normal';
      
      if (item.product.stock <= 0) {
        stockStatus = 'out';
      } else if (item.product.stock <= 5) {
        stockStatus = 'low';
      }

      this.setData({
        stockStatus
      });

      console.log('Stock status updated:', stockStatus);
    },

    /**
     * 更新促销标签
     */
    updatePromotionTags() {
      const { item } = this.properties;
      
      if (!item || !item.product) {
        return;
      }

      const tags: string[] = [];
      
      // 折扣标签
      if (item.product.discountedPrice && item.product.discountedPrice < item.product.originalPrice) {
        const discount = item.product.discountedPrice / item.product.originalPrice;
        const discountText = Math.round(discount * 10) / 10;
        tags.push(`${discountText}折`);
      }
      
      // 库存紧张标签
      if (item.product.stock <= 5 && item.product.stock > 0) {
        tags.push('库存紧张');
      }
      
      // 7天无理由退货标签（模拟）
      if (item.product.stock > 0) {
        tags.push('7天无理由退货');
      }
      
      // 商品自带标签
      if (item.product.tags) {
        tags.push(...item.product.tags);
      }

      this.setData({
        promotionTags: tags
      });

      console.log('Promotion tags updated:', tags);
    },

    /**
     * 图片加载成功处理
     */
    onImageLoad() {
      console.log('Cart item image loaded successfully');
      this.setData({
        imageLoading: false,
        imageError: false
      });
    },

    /**
     * 图片加载失败处理
     */
    onImageError() {
      console.error('Cart item image failed to load');
      this.setData({
        imageLoading: false,
        imageError: true
      });
    },

    /**
     * 选择状态切换
     */
    onSelectToggle() {
      const { disabled, item } = this.properties;
      
      if (disabled || !item) {
        return;
      }

      console.log('Toggling cart item selection:', item.productId);

      // 添加触觉反馈
      this.addHapticFeedback('light');

      // 触发选择事件
      this.triggerEvent('select', {
        productId: item.productId,
        selected: !this.properties.selected
      }, {
        bubbles: true,
        composed: true
      });
    },

    /**
     * 数量变化处理
     */
    onQuantityChange(event: WechatMiniprogram.CustomEvent) {
      const { disabled, item } = this.properties;
      
      if (disabled || !item) {
        return;
      }

      const { quantity } = event.detail;
      
      console.log('Cart item quantity changed:', item.productId, quantity);

      // 触发数量变化事件
      this.triggerEvent('quantitychange', {
        productId: item.productId,
        quantity: quantity,
        previousQuantity: item.quantity
      }, {
        bubbles: true,
        composed: true
      });
    },

    /**
     * 删除按钮点击
     */
    onDeleteTap() {
      const { disabled, item } = this.properties;
      
      if (disabled || !item) {
        return;
      }

      console.log('Delete button tapped for item:', item.productId);

      // 添加触觉反馈
      this.addHapticFeedback('medium');

      // 显示删除确认
      this.showDeleteConfirmation();
    },

    /**
     * 显示删除确认对话框
     */
    showDeleteConfirmation() {
      const { item } = this.properties;
      
      if (!item) {
        return;
      }

      wx.showModal({
        title: '确认删除',
        content: `确定要删除"${item.product.name}"吗？`,
        confirmText: '删除',
        confirmColor: '#ff4757',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.confirmDelete();
          }
        }
      });
    },

    /**
     * 确认删除
     */
    confirmDelete() {
      const { item } = this.properties;
      
      if (!item) {
        return;
      }

      console.log('Confirming delete for item:', item.productId);

      // 添加删除动画
      this.showDeleteAnimation();

      // 延迟触发删除事件，让动画播放完成
      setTimeout(() => {
        this.triggerEvent('delete', {
          productId: item.productId,
          item: item
        }, {
          bubbles: true,
          composed: true
        });
      }, 200);
    },

    /**
     * 商品点击处理
     */
    onProductTap() {
      const { disabled, item } = this.properties;
      
      if (disabled || !item) {
        return;
      }

      console.log('Cart item product tapped:', item.productId);

      // 添加触觉反馈
      this.addHapticFeedback('light');

      // 触发商品点击事件
      this.triggerEvent('producttap', {
        productId: item.productId,
        product: item.product
      }, {
        bubbles: true,
        composed: true
      });
    },

    /**
     * 获取显示价格
     */
    getDisplayPrice(): string {
      const { item } = this.properties;
      
      if (!item || !item.product) {
        return '¥0.00';
      }

      const price = item.product.discountedPrice || item.product.originalPrice;
      return `¥${price.toFixed(2)}`;
    },

    /**
     * 获取原价（用于显示划线价格）
     */
    getOriginalPrice(): string {
      const { item } = this.properties;
      
      if (!item || !item.product) {
        return '¥0.00';
      }

      return `¥${item.product.originalPrice.toFixed(2)}`;
    },

    /**
     * 检查是否有折扣
     */
    hasDiscount(): boolean {
      const { item } = this.properties;
      
      return !!(item && item.product && item.product.discountedPrice && 
                item.product.discountedPrice < item.product.originalPrice);
    },

    /**
     * 获取库存状态文本
     */
    getStockStatusText(): string {
      const { item } = this.properties;
      
      if (!item || !item.product) {
        return '暂无库存';
      }

      const { stock } = item.product;
      
      if (stock <= 0) {
        return '暂无库存';
      } else if (stock <= 5) {
        return `仅剩 ${stock} 件`;
      } else {
        return `库存充足`;
      }
    },

    /**
     * 获取小计金额
     */
    getSubtotal(): string {
      const { item } = this.properties;
      
      if (!item || !item.product) {
        return '¥0.00';
      }

      const price = item.product.discountedPrice || item.product.originalPrice;
      const subtotal = price * item.quantity;
      
      return `¥${subtotal.toFixed(2)}`;
    },

    /**
     * 检查是否可以调整数量
     */
    canAdjustQuantity(): boolean {
      const { disabled, item } = this.properties;
      const { stockStatus } = this.data;
      
      return !disabled && !!item && stockStatus !== 'out';
    },

    /**
     * 显示删除动画
     */
    showDeleteAnimation() {
      if (this.data.animating) {
        return;
      }

      this.setData({
        animating: true
      });

      // 创建删除动画
      const animation = wx.createAnimation({
        duration: 200,
        timingFunction: 'ease-out'
      });

      // 向右滑出动画
      animation.translateX(300).opacity(0).step();

      this.setData({
        deleteAnimation: animation.export()
      });

      // 重置动画状态
      setTimeout(() => {
        this.setData({
          animating: false,
          deleteAnimation: null
        });
      }, 200);
    },

    /**
     * 显示选择动画
     */
    showSelectAnimation() {
      const animation = wx.createAnimation({
        duration: 150,
        timingFunction: 'ease-out'
      });

      // 选择框缩放动画
      animation.scale(1.2).step();
      animation.scale(1).step();

      this.setData({
        selectAnimation: animation.export()
      });

      setTimeout(() => {
        this.setData({
          selectAnimation: null
        });
      }, 300);
    },

    /**
     * 添加触觉反馈
     */
    addHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
      try {
        wx.vibrateShort({
          type: type
        });
      } catch (error) {
        console.warn('Haptic feedback not supported:', error);
      }
    },

    /**
     * 重试加载图片
     */
    retryImageLoad() {
      const { item } = this.properties;
      
      if (!item || !item.product || !item.product.image) {
        return;
      }

      console.log('Retrying image load for cart item:', item.productId);
      
      this.setData({
        imageLoading: true,
        imageError: false
      });
    },

    /**
     * 获取组件状态
     */
    getComponentState() {
      const { item, selected, editMode, disabled } = this.properties;
      const { stockStatus, imageLoading, imageError, animating } = this.data;
      
      return {
        item,
        selected,
        editMode,
        disabled,
        stockStatus,
        imageLoading,
        imageError,
        animating,
        hasDiscount: this.hasDiscount(),
        canAdjustQuantity: this.canAdjustQuantity(),
        displayPrice: this.getDisplayPrice(),
        originalPrice: this.getOriginalPrice(),
        subtotal: this.getSubtotal(),
        stockStatusText: this.getStockStatusText()
      };
    },

    /**
     * 处理长按事件
     */
    onLongPress() {
      const { disabled, item, editMode } = this.properties;
      
      if (disabled || !item || editMode) {
        return;
      }

      console.log('Cart item long pressed:', item.productId);

      // 添加触觉反馈
      this.addHapticFeedback('heavy');

      // 触发长按事件
      this.triggerEvent('longpress', {
        productId: item.productId,
        item: item
      }, {
        bubbles: true,
        composed: true
      });
    },

    /**
     * 处理滑动删除
     */
    onSwipeDelete() {
      const { disabled, item } = this.properties;
      
      if (disabled || !item) {
        return;
      }

      console.log('Swipe delete triggered for item:', item.productId);

      // 显示删除确认
      this.showDeleteConfirmation();
    }
  }
});
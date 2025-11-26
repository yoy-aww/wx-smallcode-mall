// components/product-card/index.ts

Component({
  /**
   * 组件属性定义
   */
  properties: {
    // 产品数据
    product: {
      type: null,
      value: null,
      observer: 'onProductChange'
    }
  },

  /**
   * 组件数据
   */
  data: {
    // 图片加载状态
    imageLoading: true,
    imageError: false,
    
    // 添加到购物车状态
    addingToCart: false,
    
    // 计算的折扣百分比
    discountPercentage: 0
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    /**
     * 组件创建时
     */
    created() {
      console.log('ProductCard component created');
    },

    /**
     * 组件挂载到页面时
     */
    attached() {
      console.log('ProductCard component attached');
      this.calculateDiscount();
    },

    /**
     * 组件从页面移除时
     */
    detached() {
      console.log('ProductCard component detached');
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 产品数据变化时的观察者
     */
    onProductChange(newProduct: Product) {
      console.log('Product data changed:', newProduct);
      
      if (newProduct) {
        // 重置图片状态
        this.setData({
          imageLoading: true,
          imageError: false
        });
        
        // 重新计算折扣
        this.calculateDiscount();
      }
    },

    /**
     * 计算折扣百分比
     */
    calculateDiscount() {
      const { product } = this.properties;
      
      if (!product || !product.discountedPrice || product.discountedPrice >= product.originalPrice) {
        this.setData({
          discountPercentage: 0
        });
        return;
      }

      // 计算折扣百分比 (保留一位小数)
      const discount = product.discountedPrice / product.originalPrice;
      const discountPercentage = Math.round(discount * 10) / 10;
      
      this.setData({
        discountPercentage: discountPercentage
      });

      console.log('Discount calculated:', discountPercentage);
    },

    /**
     * 图片加载成功处理
     */
    onImageLoad() {
      console.log('Product image loaded successfully');
      this.setData({
        imageLoading: false,
        imageError: false
      });
    },

    /**
     * 图片加载失败处理
     */
    onImageError() {
      console.error('Product image failed to load');
      this.setData({
        imageLoading: false,
        imageError: true
      });
    },

    /**
     * 产品卡片点击处理
     */
    onProductTap() {
      const { product } = this.properties;
      
      if (!product) {
        console.error('No product data available');
        return;
      }

      console.log('Product card tapped:', product.id);

      // 添加触觉反馈
      wx.vibrateShort({
        type: 'light'
      });

      // 触发自定义事件，传递产品ID给父组件
      this.triggerEvent('producttap', {
        productId: product.id,
        product: product
      }, {
        bubbles: true,
        composed: true
      });
    },

    /**
     * 添加到购物车处理
     */
    async onAddToCart() {
      // Note: WeChat miniprogram events don't have stopPropagation
      // We'll handle this at the component level instead
      
      const { product } = this.properties;
      
      if (!product) {
        console.error('No product data available');
        return;
      }

      // 检查库存
      if (product.stock <= 0) {
        wx.showToast({
          title: '商品暂无库存',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      // 防止重复点击
      if (this.data.addingToCart) {
        console.log('Already adding to cart, ignoring duplicate tap');
        return;
      }

      console.log('Adding product to cart:', product.id);

      try {
        // 设置加载状态
        this.setData({
          addingToCart: true
        });

        // 添加触觉反馈
        wx.vibrateShort({
          type: 'medium'
        });

        // 模拟添加到购物车的网络请求
        await new Promise(resolve => setTimeout(resolve, 800));

        // 触发自定义事件，传递产品信息给父组件
        this.triggerEvent('addtocart', {
          productId: product.id,
          product: product,
          quantity: 1
        }, {
          bubbles: true,
          composed: true
        });

        // 显示成功动画
        this.showAddToCartAnimation();
        
        // 显示成功提示
        wx.showToast({
          title: '已添加到购物车',
          icon: 'success',
          duration: 1500
        });

        console.log('Product added to cart successfully');

      } catch (error) {
        console.error('Failed to add product to cart:', error);
        
        // 显示错误提示并提供重试选项
        this.handleAddToCartError(error instanceof Error ? error.message : '添加失败');
      } finally {
        // 重置加载状态
        this.setData({
          addingToCart: false
        });
      }
    },

    /**
     * 获取产品的显示价格
     */
    getDisplayPrice(): string {
      const { product } = this.properties;
      
      if (!product) {
        return '¥0';
      }

      const price = product.discountedPrice || product.originalPrice;
      return `¥${price.toFixed(2)}`;
    },

    /**
     * 获取产品的原价（用于显示划线价格）
     */
    getOriginalPrice(): string {
      const { product } = this.properties;
      
      if (!product) {
        return '¥0';
      }

      return `¥${product.originalPrice.toFixed(2)}`;
    },

    /**
     * 检查产品是否有折扣
     */
    hasDiscount(): boolean {
      const { product } = this.properties;
      
      return !!(product && product.discountedPrice && product.discountedPrice < product.originalPrice);
    },

    /**
     * 获取库存状态文本
     */
    getStockStatusText(): string {
      const { product } = this.properties;
      
      if (!product) {
        return '暂无库存';
      }

      if (product.stock <= 0) {
        return '暂无库存';
      } else if (product.stock <= 5) {
        return `仅剩 ${product.stock} 件`;
      } else {
        return `库存 ${product.stock} 件`;
      }
    },

    /**
     * 重试加载图片
     */
    retryImageLoad() {
      const { product } = this.properties;
      
      if (!product || !product.image) {
        return;
      }

      console.log('Retrying image load for product:', product.id);
      
      this.setData({
        imageLoading: true,
        imageError: false
      });

      // 触发图片重新加载
      // 注意：在实际应用中，可能需要添加时间戳或其他参数来强制重新加载
    },

    /**
     * 显示添加到购物车动画
     */
    showAddToCartAnimation() {
      console.log('Showing add to cart animation');
      
      // 添加按钮点击动画类
      const query = this.createSelectorQuery();
      query.select('.add-to-cart-btn').boundingClientRect();
      query.exec((res) => {
        if (res[0]) {
          // 创建动画效果
          const animation = wx.createAnimation({
            duration: 300,
            timingFunction: 'ease-out'
          });
          
          // 按钮缩放动画
          animation.scale(0.95).step();
          animation.scale(1).step();
          
          // 应用动画（注意：在实际应用中可能需要通过setData应用动画）
          console.log('Add to cart animation completed');
        }
      });
      
      // 添加成功反馈动画
      this.triggerSuccessAnimation();
    },

    /**
     * 触发成功动画
     */
    triggerSuccessAnimation() {
      // 可以在这里添加更复杂的成功动画
      // 比如从按钮位置飞向购物车图标的动画
      console.log('Success animation triggered');
      
      // 添加轻微的震动反馈
      wx.vibrateShort({
        type: 'light'
      });
    },

    /**
     * 处理添加到购物车错误
     */
    handleAddToCartError(errorMessage: string) {
      const { product } = this.properties;
      
      if (!product) {
        return;
      }

      console.error('Add to cart error in product card:', errorMessage);
      
      // 显示错误提示并提供重试选项
      wx.showModal({
        title: '添加失败',
        content: `${errorMessage}，是否重试？`,
        confirmText: '重试',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 重试添加到购物车
            this.retryAddToCart();
          }
        }
      });
    },

    /**
     * 产品长按处理
     */
    onProductLongPress() {
      const { product } = this.properties;
      
      if (!product) {
        console.error('No product data available for long press');
        return;
      }

      console.log('Product card long pressed:', product.id);

      // 添加触觉反馈
      wx.vibrateShort({
        type: 'heavy'
      });

      // 触发自定义长按事件，传递产品信息给父组件
      this.triggerEvent('longpress', {
        productId: product.id,
        product: product
      }, {
        bubbles: true,
        composed: true
      });
    },

    /**
     * 重试添加到购物车
     */
    async retryAddToCart() {
      const { product } = this.properties;
      
      if (!product) {
        console.error('No product data for retry');
        return;
      }

      console.log('Retrying add to cart from product card:', product.id);
      
      // 检查库存
      if (product.stock <= 0) {
        wx.showToast({
          title: '商品暂无库存',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      try {
        // 设置重试加载状态
        this.setData({
          addingToCart: true
        });

        // 显示重试提示
        wx.showLoading({
          title: '重试中...',
          mask: true
        });

        // 模拟重试网络请求
        await new Promise(resolve => setTimeout(resolve, 1000));

        wx.hideLoading();

        // 触发重试成功事件
        this.triggerEvent('addtocart', {
          productId: product.id,
          product: product,
          quantity: 1,
          isRetry: true
        }, {
          bubbles: true,
          composed: true
        });

        // 显示重试成功提示
        wx.showToast({
          title: '重试成功，已添加到购物车',
          icon: 'success',
          duration: 2000
        });

        // 显示成功动画
        this.showAddToCartAnimation();

        console.log('Retry add to cart successful');

      } catch (error) {
        wx.hideLoading();
        console.error('Retry add to cart failed:', error);
        
        wx.showToast({
          title: '重试失败，请稍后再试',
          icon: 'none',
          duration: 3000
        });
      } finally {
        // 重置加载状态
        this.setData({
          addingToCart: false
        });
      }
    }
  }
});
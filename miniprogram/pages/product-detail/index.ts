// pages/product-detail/index.ts

Page({
  data: {
    product: null as Product | null,
    loading: true,
    quantity: 1,
    addingToCart: false
  },

  onLoad(options: { productId?: string }) {
    console.log('Product detail page loaded with options:', options);
    
    if (options.productId) {
      this.loadProductDetail(options.productId);
    } else {
      console.error('No product ID provided');
      this.handleLoadError('产品ID缺失');
    }
  },

  onShow() {
    console.log('Product detail page shown');
  },

  onReady() {
    console.log('Product detail page ready');
  },

  /**
   * 加载产品详情
   */
  async loadProductDetail(productId: string) {
    try {
      console.log('Loading product detail for ID:', productId);
      
      this.setData({
        loading: true
      });

      // 导入产品服务
      const { ProductService } = await import('../../services/product');
      
      // 加载产品详情
      const response = await ProductService.getProductById(productId);
      
      if (response.success && response.data) {
        this.setData({
          product: response.data,
          loading: false
        });
        
        console.log('Product detail loaded successfully:', response.data);
        
        // 设置页面标题
        wx.setNavigationBarTitle({
          title: response.data.name
        });
        
      } else {
        this.handleLoadError(response.error || '加载产品详情失败');
      }
      
    } catch (error) {
      console.error('Error loading product detail:', error);
      this.handleLoadError('网络错误，请检查网络连接');
    }
  },

  /**
   * 处理加载错误
   */
  handleLoadError(errorMessage: string) {
    this.setData({
      loading: false,
      product: null
    });

    wx.showModal({
      title: '加载失败',
      content: errorMessage,
      showCancel: true,
      confirmText: '重试',
      cancelText: '返回',
      success: (res) => {
        if (res.confirm) {
          // 重试加载
          const pages = getCurrentPages();
          const currentPage = pages[pages.length - 1];
          const options = currentPage.options as { productId?: string };
          
          if (options.productId) {
            this.loadProductDetail(options.productId);
          }
        } else {
          // 返回上一页
          wx.navigateBack();
        }
      }
    });
  },

  /**
   * 数量减少
   */
  onQuantityDecrease() {
    if (this.data.quantity > 1) {
      this.setData({
        quantity: this.data.quantity - 1
      });
    }
  },

  /**
   * 数量增加
   */
  onQuantityIncrease() {
    const { product } = this.data;
    
    if (product && this.data.quantity < product.stock) {
      this.setData({
        quantity: this.data.quantity + 1
      });
    } else {
      wx.showToast({
        title: '库存不足',
        icon: 'none',
        duration: 1500
      });
    }
  },

  /**
   * 添加到购物车
   */
  async onAddToCart() {
    const { product, quantity } = this.data;
    
    if (!product) {
      wx.showToast({
        title: '产品信息不完整',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (product.stock <= 0) {
      wx.showToast({
        title: '商品暂无库存',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (this.data.addingToCart) {
      return;
    }

    try {
      this.setData({
        addingToCart: true
      });

      // 导入购物车服务
      const { CartService } = await import('../../services/cart');
      
      // 添加到购物车
      const response = await CartService.addToCart(product.id, quantity);
      
      if (response.success) {
        wx.showToast({
          title: `已添加 ${quantity} 件到购物车`,
          icon: 'success',
          duration: 2000
        });
        
        // 触觉反馈
        wx.vibrateShort({
          type: 'medium'
        });
        
        console.log('Product added to cart from detail page');
        
      } else {
        wx.showToast({
          title: response.error || '添加失败',
          icon: 'none',
          duration: 2000
        });
      }
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({
        addingToCart: false
      });
    }
  },

  /**
   * 立即购买
   */
  onBuyNow() {
    const { product, quantity } = this.data;
    
    if (!product) {
      wx.showToast({
        title: '产品信息不完整',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (product.stock <= 0) {
      wx.showToast({
        title: '商品暂无库存',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 导航到订单页面（如果存在）
    wx.navigateTo({
      url: `/pages/order/index?productId=${product.id}&quantity=${quantity}`,
      fail: () => {
        // 如果订单页面不存在，先添加到购物车然后跳转到购物车页面
        this.onAddToCart().then(() => {
          wx.switchTab({
            url: '/pages/cart/index'
          });
        });
      }
    });
  },

  /**
   * 返回上一页
   */
  onBack() {
    wx.navigateBack();
  }
});
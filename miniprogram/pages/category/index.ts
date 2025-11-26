// pages/category/index.ts
import { CategoryService } from '../../services/category';
import { ProductService } from '../../services/product';

Page<CategoryPageData>({
  data: {
    categories: [],
    selectedCategoryId: '',
    products: [],
    loading: false,
    productLoading: false
  },

  onLoad() {
    console.log('Category page loaded');
    this.initializePage();
  },

  onShow() {
    // 页面显示时的逻辑
    console.log('Category page shown');
  },

  onReady() {
    // 页面初次渲染完成
    console.log('Category page ready');
  },

  /**
   * 初始化页面
   */
  async initializePage() {
    console.log('Initializing category page...');
    await this.loadCategories();
  },

  /**
   * 加载分类数据
   */
  async loadCategories() {
    try {
      // 设置加载状态
      this.setData({
        loading: true
      });

      // 调用分类服务加载数据
      const response = await CategoryService.loadCategories();
      
      if (response.success && response.data) {
        const categories = response.data;
        
        // 设置默认选中第一个分类
        const defaultCategoryId = categories.length > 0 ? categories[0].id : '';
        
        this.setData({
          categories: categories,
          selectedCategoryId: defaultCategoryId,
          loading: false
        });

        console.log('Categories loaded successfully:', categories);
        
        // 加载默认分类的产品
        if (defaultCategoryId) {
          await this.loadProducts(defaultCategoryId);
        }
      } else {
        // 处理加载失败
        this.handleCategoryLoadError(response.error || '加载分类失败');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      this.handleCategoryLoadError('网络错误，请检查网络连接');
    }
  },

  /**
   * 处理分类加载错误
   */
  handleCategoryLoadError(errorMessage: string) {
    this.setData({
      loading: false,
      categories: []
    });

    // 显示错误提示
    wx.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 3000
    });

    // 提供重试选项
    wx.showModal({
      title: '加载失败',
      content: `${errorMessage}，是否重试？`,
      confirmText: '重试',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.loadCategories();
        }
      }
    });
  },

  /**
   * 刷新分类数据
   */
  async refreshCategories() {
    try {
      console.log('Refreshing categories...');
      
      const response = await CategoryService.refreshCategories();
      
      if (response.success && response.data) {
        const categories = response.data;
        
        // 保持当前选中的分类，如果不存在则选择第一个
        let selectedCategoryId = this.data.selectedCategoryId;
        if (!categories.find(cat => cat.id === selectedCategoryId)) {
          selectedCategoryId = categories.length > 0 ? categories[0].id : '';
        }
        
        this.setData({
          categories: categories,
          selectedCategoryId: selectedCategoryId
        });

        wx.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 1500
        });

        console.log('Categories refreshed successfully');
      } else {
        throw new Error(response.error || '刷新失败');
      }
    } catch (error) {
      console.error('Error refreshing categories:', error);
      wx.showToast({
        title: '刷新失败，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 分类选择处理
   */
  async onCategorySelect(categoryId: string) {
    console.log('Category selected:', categoryId);
    
    // 查找选中的分类信息
    const selectedCategory = this.data.categories.find(cat => cat.id === categoryId);
    
    if (selectedCategory) {
      console.log('Selected category:', selectedCategory.name);
      
      // 触发分类切换动画
      this.triggerCategorySwitchAnimation();
      
      // 加载对应分类的产品
      await this.loadProducts(categoryId);
      
      // 可选：显示切换提示
      if (this.data.selectedCategoryId !== categoryId) {
        wx.showToast({
          title: `切换到${selectedCategory.name}`,
          icon: 'none',
          duration: 1000
        });
      }
    }
  },

  /**
   * 触发分类切换动画
   */
  triggerCategorySwitchAnimation() {
    // 添加切换动画类
    const query = this.createSelectorQuery();
    query.select('.category-item.active').boundingClientRect();
    query.exec((res) => {
      if (res[0]) {
        // 可以在这里添加更复杂的动画逻辑
        console.log('Category switch animation triggered');
      }
    });
  },

  /**
   * 产品点击处理
   */
  onProductTap(event: WechatMiniprogram.CustomEvent<ProductCardEvents.ProductTapDetail>) {
    const { productId, product } = event.detail;
    console.log('Product tapped:', productId, product);

    // 添加触觉反馈
    wx.vibrateShort({
      type: 'light'
    });

    // 导航到产品详情页
    wx.navigateTo({
      url: `/pages/product-detail/index?productId=${productId}`,
      success: () => {
        console.log('Navigated to product detail page');
      },
      fail: (error) => {
        console.error('Failed to navigate to product detail:', error);
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 添加到购物车处理
   */
  async onAddToCart(event: WechatMiniprogram.CustomEvent<ProductCardEvents.AddToCartDetail>) {
    const { productId, product, quantity } = event.detail;
    console.log('Add to cart:', productId, product, quantity);

    try {
      // 这里将在后续任务中实现实际的购物车逻辑
      // 目前只是模拟成功添加
      
      // 添加触觉反馈
      wx.vibrateShort({
        type: 'medium'
      });

      // 模拟网络请求延迟
      await new Promise(resolve => setTimeout(resolve, 500));

      // 显示成功提示
      wx.showToast({
        title: `${product.name} 已添加到购物车`,
        icon: 'success',
        duration: 2000
      });

      // 这里可以触发购物车数量更新等逻辑
      console.log('Product added to cart successfully');

    } catch (error) {
      console.error('Failed to add product to cart:', error);
      
      wx.showToast({
        title: '添加失败，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 分类点击事件处理
   */
  async onCategoryTap(event: WechatMiniprogram.TouchEvent) {
    const categoryId = event.currentTarget.dataset.categoryId;
    console.log('Category tapped:', categoryId);
    
    // 防止重复选择同一分类
    if (categoryId === this.data.selectedCategoryId) {
      console.log('Same category selected, ignoring');
      return;
    }

    // 验证分类是否存在
    const category = this.data.categories.find(cat => cat.id === categoryId);
    if (!category) {
      console.error('Category not found:', categoryId);
      wx.showToast({
        title: '分类不存在',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 添加触觉反馈
    wx.vibrateShort({
      type: 'light'
    });
    
    // 更新选中状态
    this.setData({
      selectedCategoryId: categoryId
    });
    
    // 调用分类选择处理方法
    await this.onCategorySelect(categoryId);
  },

  /**
   * 下拉刷新分类
   */
  async onRefresherRefresh() {
    await this.refreshCategories();
  },

  /**
   * 下拉刷新产品
   */
  async onProductRefresherRefresh() {
    await this.refreshProducts();
  },

  /**
   * 获取当前选中的分类信息
   */
  getCurrentCategory(): Category | null {
    return this.data.categories.find(cat => cat.id === this.data.selectedCategoryId) || null;
  },

  /**
   * 选择下一个分类
   */
  selectNextCategory() {
    const currentIndex = this.data.categories.findIndex(cat => cat.id === this.data.selectedCategoryId);
    if (currentIndex >= 0 && currentIndex < this.data.categories.length - 1) {
      const nextCategory = this.data.categories[currentIndex + 1];
      this.setData({
        selectedCategoryId: nextCategory.id
      });
      this.onCategorySelect(nextCategory.id);
    }
  },

  /**
   * 选择上一个分类
   */
  selectPreviousCategory() {
    const currentIndex = this.data.categories.findIndex(cat => cat.id === this.data.selectedCategoryId);
    if (currentIndex > 0) {
      const previousCategory = this.data.categories[currentIndex - 1];
      this.setData({
        selectedCategoryId: previousCategory.id
      });
      this.onCategorySelect(previousCategory.id);
    }
  },

  /**
   * 根据分类ID选择分类
   */
  selectCategoryById(categoryId: string) {
    const category = this.data.categories.find(cat => cat.id === categoryId);
    if (category) {
      this.setData({
        selectedCategoryId: categoryId
      });
      this.onCategorySelect(categoryId);
      return true;
    }
    return false;
  },

  /**
   * 加载产品数据
   */
  async loadProducts(categoryId: string) {
    try {
      console.log('Loading products for category:', categoryId);
      
      // 设置产品加载状态
      this.setData({
        productLoading: true
      });

      // 调用产品服务加载数据
      const response = await ProductService.loadProductsByCategory(categoryId);
      
      if (response.success && response.data) {
        const products = response.data;
        
        this.setData({
          products: products,
          productLoading: false
        });

        console.log('Products loaded successfully:', products);
      } else {
        // 处理加载失败
        this.handleProductLoadError(response.error || '加载产品失败');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      this.handleProductLoadError('网络错误，请检查网络连接');
    }
  },

  /**
   * 处理产品加载错误
   */
  handleProductLoadError(errorMessage: string) {
    this.setData({
      productLoading: false,
      products: []
    });

    // 显示错误提示
    wx.showToast({
      title: errorMessage,
      icon: 'none',
      duration: 3000
    });

    // 提供重试选项
    wx.showModal({
      title: '加载失败',
      content: `${errorMessage}，是否重试？`,
      confirmText: '重试',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm && this.data.selectedCategoryId) {
          this.loadProducts(this.data.selectedCategoryId);
        }
      }
    });
  },

  /**
   * 刷新产品数据
   */
  async refreshProducts() {
    if (!this.data.selectedCategoryId) {
      console.log('No category selected, skipping product refresh');
      return;
    }

    try {
      console.log('Refreshing products for category:', this.data.selectedCategoryId);
      
      const response = await ProductService.refreshProducts(this.data.selectedCategoryId);
      
      if (response.success && response.data) {
        const products = response.data;
        
        this.setData({
          products: products
        });

        wx.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 1500
        });

        console.log('Products refreshed successfully');
      } else {
        throw new Error(response.error || '刷新失败');
      }
    } catch (error) {
      console.error('Error refreshing products:', error);
      wx.showToast({
        title: '刷新失败，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 过滤产品（按关键词）
   */
  async filterProducts(keyword: string) {
    if (!keyword.trim()) {
      // 如果关键词为空，重新加载当前分类的所有产品
      if (this.data.selectedCategoryId) {
        await this.loadProducts(this.data.selectedCategoryId);
      }
      return;
    }

    try {
      console.log('Filtering products by keyword:', keyword);
      
      this.setData({
        productLoading: true
      });

      const response = await ProductService.searchProducts(keyword);
      
      if (response.success && response.data) {
        // 如果有选中的分类，进一步过滤结果
        let filteredProducts = response.data;
        if (this.data.selectedCategoryId) {
          filteredProducts = response.data.filter(product => 
            product.categoryId === this.data.selectedCategoryId
          );
        }
        
        this.setData({
          products: filteredProducts,
          productLoading: false
        });

        console.log('Products filtered successfully:', filteredProducts);
      } else {
        this.handleProductLoadError(response.error || '搜索失败');
      }
    } catch (error) {
      console.error('Error filtering products:', error);
      this.handleProductLoadError('搜索出错，请重试');
    }
  },

  /**
   * 获取当前分类的产品数量
   */
  getCurrentCategoryProductCount(): number {
    return this.data.products.length;
  },

  /**
   * 检查是否有产品在加载
   */
  isProductsLoading(): boolean {
    return this.data.productLoading;
  },

  /**
   * 获取当前产品列表
   */
  getCurrentProducts(): Product[] {
    return this.data.products;
  }
});
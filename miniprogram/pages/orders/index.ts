// pages/orders/index.ts
Page({
  data: {
    currentTab: 'all',
    orders: [] as any[],
    loading: true,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad(options: { status?: string }) {
    console.log('Orders page loaded with options:', options);
    
    // Set initial tab based on status parameter
    if (options.status) {
      this.setData({
        currentTab: options.status
      });
    }
    
    this.loadOrders();
  },

  onShow() {
    console.log('Orders page shown');
    // Refresh orders when page becomes visible
    this.refreshOrders();
  },

  onPullDownRefresh() {
    this.refreshOrders().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreOrders();
    }
  },

  // Tab switching
  onTabChange(e: any) {
    const tab = e.currentTarget.dataset.tab;
    if (tab !== this.data.currentTab) {
      this.setData({
        currentTab: tab,
        orders: [],
        page: 1,
        hasMore: true
      });
      this.loadOrders();
    }
  },

  // Load orders
  async loadOrders() {
    try {
      this.setData({ loading: true });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockOrders = this.generateMockOrders();
      
      this.setData({
        orders: mockOrders,
        loading: false,
        hasMore: mockOrders.length >= this.data.pageSize
      });
      
    } catch (error) {
      console.error('Failed to load orders:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    }
  },

  // Refresh orders
  async refreshOrders() {
    this.setData({
      orders: [],
      page: 1,
      hasMore: true
    });
    await this.loadOrders();
  },

  // Load more orders
  async loadMoreOrders() {
    try {
      this.setData({ loading: true });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const moreOrders = this.generateMockOrders();
      
      this.setData({
        orders: [...this.data.orders, ...moreOrders],
        page: this.data.page + 1,
        loading: false,
        hasMore: moreOrders.length >= this.data.pageSize
      });
      
    } catch (error) {
      console.error('Failed to load more orders:', error);
      this.setData({ loading: false });
    }
  },

  // Generate mock orders
  generateMockOrders() {
    const { currentTab } = this.data;
    const statuses = {
      all: ['pending_payment', 'pending_shipment', 'pending_receipt', 'pending_review', 'completed'],
      pending_payment: ['pending_payment'],
      pending_shipment: ['pending_shipment'],
      pending_receipt: ['pending_receipt'],
      pending_review: ['pending_review'],
      refund_aftersales: ['refund', 'aftersales']
    };
    
    const statusList = statuses[currentTab as keyof typeof statuses] || statuses.all;
    
    return Array.from({ length: this.data.pageSize }, (_, index) => ({
      id: `order_${Date.now()}_${index}`,
      orderNo: `${Date.now()}${index.toString().padStart(3, '0')}`,
      status: statusList[Math.floor(Math.random() * statusList.length)],
      createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      totalAmount: Math.floor(Math.random() * 500) + 50,
      items: [
        {
          id: `item_${index}_1`,
          name: '优质陈皮',
          image: '/images/imgs/herb_ingredients_0.jpg',
          price: 29.9,
          quantity: 1
        }
      ]
    }));
  },

  // Order item tap
  onOrderTap(e: any) {
    const orderId = e.currentTarget.dataset.orderId;
    wx.navigateTo({
      url: `/pages/order-detail/index?id=${orderId}`
    });
  },

  // Order action (pay, confirm receipt, etc.)
  onOrderAction(e: any) {
    const { action, orderId } = e.currentTarget.dataset;
    
    switch (action) {
      case 'pay':
        this.handlePayment(orderId);
        break;
      case 'confirm':
        this.handleConfirmReceipt(orderId);
        break;
      case 'review':
        this.handleReview(orderId);
        break;
      case 'cancel':
        this.handleCancel(orderId);
        break;
    }
  },

  // Handle payment
  handlePayment(orderId: string) {
    wx.showModal({
      title: '确认支付',
      content: '确定要支付此订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '支付成功',
            icon: 'success'
          });
          this.refreshOrders();
        }
      }
    });
  },

  // Handle confirm receipt
  handleConfirmReceipt(orderId: string) {
    wx.showModal({
      title: '确认收货',
      content: '确定已收到商品吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '确认收货成功',
            icon: 'success'
          });
          this.refreshOrders();
        }
      }
    });
  },

  // Handle review
  handleReview(orderId: string) {
    wx.navigateTo({
      url: `/pages/review/index?orderId=${orderId}`
    });
  },

  // Handle cancel
  handleCancel(orderId: string) {
    wx.showModal({
      title: '取消订单',
      content: '确定要取消此订单吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '订单已取消',
            icon: 'success'
          });
          this.refreshOrders();
        }
      }
    });
  }
});
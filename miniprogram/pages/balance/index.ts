// pages/balance/index.ts
Page({
  data: {
    balance: 0,
    transactions: [] as any[],
    loading: true
  },

  onLoad() {
    this.loadBalanceData();
  },

  async loadBalanceData() {
    try {
      this.setData({ loading: true });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTransactions = Array.from({ length: 10 }, (_, index) => ({
        id: `trans_${index}`,
        type: Math.random() > 0.5 ? 'income' : 'expense',
        amount: Math.floor(Math.random() * 100) + 10,
        description: ['充值', '消费', '退款', '奖励'][Math.floor(Math.random() * 4)],
        time: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      this.setData({
        balance: 128.50,
        transactions: mockTransactions,
        loading: false
      });
      
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  onRecharge() {
    wx.showModal({
      title: '充值',
      content: '充值功能开发中',
      showCancel: false
    });
  }
});
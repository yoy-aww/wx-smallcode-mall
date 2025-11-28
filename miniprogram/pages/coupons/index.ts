// pages/coupons/index.ts
Page({
  data: {
    currentTab: 'available',
    coupons: [] as any[],
    loading: true
  },

  onLoad() {
    this.loadCoupons();
  },

  onTabChange(e: any) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    this.loadCoupons();
  },

  async loadCoupons() {
    try {
      this.setData({ loading: true });
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockCoupons = [
        { id: '1', name: '满100减20', amount: 20, minAmount: 100, status: 'available', expiry: '2024-12-31' },
        { id: '2', name: '新用户专享', amount: 50, minAmount: 200, status: 'available', expiry: '2024-12-31' }
      ];
      
      this.setData({ coupons: mockCoupons, loading: false });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  }
});
// pages/points/index.ts
Page({
  data: {
    points: 1250,
    records: [] as any[],
    loading: true
  },

  onLoad() {
    this.loadPointsData();
  },

  async loadPointsData() {
    try {
      this.setData({ loading: true });
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockRecords = Array.from({ length: 8 }, (_, index) => ({
        id: `point_${index}`,
        type: Math.random() > 0.5 ? 'earn' : 'spend',
        points: Math.floor(Math.random() * 50) + 10,
        description: ['签到奖励', '购物获得', '兑换商品', '活动奖励'][Math.floor(Math.random() * 4)],
        time: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      this.setData({
        records: mockRecords,
        loading: false
      });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onExchange() {
    wx.showModal({
      title: '积分兑换',
      content: '积分兑换功能开发中',
      showCancel: false
    });
  }
});
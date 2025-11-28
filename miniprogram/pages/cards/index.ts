// pages/cards/index.ts
Page({
  data: {
    cards: [] as any[],
    loading: true
  },

  onLoad() {
    this.loadCards();
  },

  async loadCards() {
    try {
      this.setData({ loading: true });
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockCards = [
        { id: '1', name: '会员卡', type: 'membership', status: 'active', balance: 0 },
        { id: '2', name: '储值卡', type: 'prepaid', status: 'active', balance: 200 }
      ];
      
      this.setData({ cards: mockCards, loading: false });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  }
});
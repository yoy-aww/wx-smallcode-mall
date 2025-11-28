// pages/address/index.ts
Page({
  data: {
    addresses: [] as any[],
    loading: true
  },

  onLoad() {
    this.loadAddresses();
  },

  async loadAddresses() {
    try {
      this.setData({ loading: true });
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockAddresses = [
        {
          id: '1',
          name: '张三',
          phone: '138****8888',
          address: '北京市朝阳区xxx街道xxx号',
          isDefault: true
        }
      ];
      
      this.setData({ addresses: mockAddresses, loading: false });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  onAddAddress() {
    wx.navigateTo({
      url: '/pages/address-edit/index'
    });
  },

  onEditAddress(e: any) {
    const addressId = e.currentTarget.dataset.addressId;
    wx.navigateTo({
      url: `/pages/address-edit/index?id=${addressId}`
    });
  }
});
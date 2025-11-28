// pages/account-security/index.ts
Page({
  data: {
    securityItems: [
      { id: 'password', title: '登录密码', desc: '已设置', hasArrow: true },
      { id: 'phone', title: '手机号', desc: '138****8888', hasArrow: true },
      { id: 'wechat', title: '微信绑定', desc: '已绑定', hasArrow: false },
      { id: 'logout', title: '退出登录', desc: '', hasArrow: true, isAction: true }
    ]
  },

  onItemTap(e: any) {
    const itemId = e.currentTarget.dataset.itemId;
    
    switch (itemId) {
      case 'password':
        this.handlePasswordChange();
        break;
      case 'phone':
        this.handlePhoneChange();
        break;
      case 'logout':
        this.handleLogout();
        break;
      default:
        wx.showToast({
          title: '功能开发中',
          icon: 'none'
        });
    }
  },

  handlePasswordChange() {
    wx.showModal({
      title: '修改密码',
      content: '密码修改功能开发中',
      showCancel: false
    });
  },

  handlePhoneChange() {
    wx.showModal({
      title: '更换手机号',
      content: '手机号更换功能开发中',
      showCancel: false
    });
  },

  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/index/index'
            });
          }, 1500);
        }
      }
    });
  }
});
// pages/personal-info/index.ts
Page({
  data: {
    userInfo: {
      avatar: '/images/default-avatar.png',
      nickname: '用户昵称',
      phone: '138****8888',
      gender: '男',
      birthday: '1990-01-01'
    }
  },

  onLoad() {
    this.loadUserInfo();
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      userInfo: {
        ...this.data.userInfo,
        ...userInfo
      }
    });
  },

  onEditAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.setData({
          'userInfo.avatar': tempFilePath
        });
        wx.showToast({
          title: '头像已更新',
          icon: 'success'
        });
      }
    });
  },

  onEditNickname() {
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: this.data.userInfo.nickname,
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({
            'userInfo.nickname': res.content
          });
          wx.showToast({
            title: '昵称已更新',
            icon: 'success'
          });
        }
      }
    });
  },

  onEditGender() {
    wx.showActionSheet({
      itemList: ['男', '女'],
      success: (res) => {
        const gender = res.tapIndex === 0 ? '男' : '女';
        this.setData({
          'userInfo.gender': gender
        });
        wx.showToast({
          title: '性别已更新',
          icon: 'success'
        });
      }
    });
  },

  onEditBirthday() {
    wx.showModal({
      title: '修改生日',
      content: '生日修改功能开发中',
      showCancel: false
    });
  }
});
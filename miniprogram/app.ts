// app.ts
import { initializeCartManager } from './utils/cart-manager';

App<IAppOption>({
  globalData: {},
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 初始化购物车管理器
    initializeCartManager();

    // 登录
    wx.login({
      success: res => {
        console.log("登录 code: " + res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    })
  },
})
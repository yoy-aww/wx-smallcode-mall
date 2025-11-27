// app.ts
import { initializeCartManager, CartManagerExtended } from './utils/cart-manager';

App<IAppOption>({
  globalData: {},
  async onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 初始化购物车管理器（基础版本）
    initializeCartManager();

    // 初始化增强版购物车管理器（带数据持久化）
    try {
      await CartManagerExtended.initializeWithPersistence();
      console.log('Enhanced cart manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize enhanced cart manager:', error);
    }

    // 登录
    wx.login({
      success: res => {
        console.log("登录 code: " + res.code)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    })
  },

  onShow() {
    // 应用从后台进入前台时，检查购物车数据状态
    this.checkCartDataHealth();
  },

  onHide() {
    // 应用进入后台时，执行数据同步
    this.syncCartData();
  },

  /**
   * 检查购物车数据健康状态
   */
  async checkCartDataHealth() {
    try {
      const cartStatus = await CartManagerExtended.getCartStatus();
      
      if (!cartStatus.isHealthy) {
        console.log('Cart data health check failed, performing maintenance');
        await CartManagerExtended.performMaintenance();
      }
    } catch (error) {
      console.error('Error checking cart data health:', error);
    }
  },

  /**
   * 同步购物车数据
   */
  async syncCartData() {
    try {
      const { CartStateSynchronizer } = await import('./utils/cart-state-sync');
      await CartStateSynchronizer.syncToStorage();
      console.log('Cart data synced on app hide');
    } catch (error) {
      console.error('Error syncing cart data on app hide:', error);
    }
  }
})
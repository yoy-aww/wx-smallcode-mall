// pages/profile/index.ts
import { ServiceFactory } from '../../services/index';
import { User } from '../../models/user';
import { AccountMetrics } from '../../models/account';
import { OrderCounts } from '../../models/order';

interface ProfilePageData {
  // User data
  isLoggedIn: boolean;
  userInfo?: {
    avatar: string;
    nickname: string;
    membershipLevel: string;
  };
  
  // Account metrics
  accountMetrics: AccountMetrics;
  accountMetricsLoading: boolean;
  
  // Order counts
  orderCounts: OrderCounts;
  orderCountsLoading: boolean;
  
  // Page state
  pageLoading: boolean;
  hasError: boolean;
  errorMessage: string;
}

Page({
  data: {
    // User data
    isLoggedIn: false,
    userInfo: undefined,
    
    // Account metrics
    accountMetrics: {
      balance: 0,
      points: 0,
      cards: 0,
      coupons: 0
    },
    accountMetricsLoading: true,
    
    // Order counts
    orderCounts: {
      pending_payment: 0,
      pending_shipment: 0,
      pending_receipt: 0,
      pending_review: 0,
      refund_aftersales: 0,
      total: 0
    },
    orderCountsLoading: true,
    
    // Page state
    pageLoading: true,
    hasError: false,
    errorMessage: ''
  } as ProfilePageData,

  /**
   * Page lifecycle - onLoad
   */
  onLoad() {
    console.log('Profile page loaded');
    this.loadPageData();
  },

  /**
   * Page lifecycle - onShow
   */
  onShow() {
    console.log('Profile page shown');
    // Refresh data when page becomes visible
    this.loadPageData();
  },

  /**
   * Pull down refresh handler
   */
  onPullDownRefresh() {
    console.log('Profile page pull down refresh');
    this.loadPageData().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * Load all page data
   */
  async loadPageData() {
    try {
      this.setData({
        pageLoading: true,
        hasError: false,
        errorMessage: ''
      });

      // Load data in parallel for better performance
      const promises = [
        this.loadUserData(),
        this.loadAccountMetrics(),
        this.loadOrderCounts()
      ];

      await Promise.allSettled(promises);

    } catch (error) {
      console.error('Error loading profile page data:', error);
      this.setData({
        hasError: true,
        errorMessage: '加载失败，请重试'
      });
    } finally {
      this.setData({
        pageLoading: false
      });
    }
  },

  /**
   * Load user data
   */
  async loadUserData() {
    try {
      const userService = ServiceFactory.getUserService();
      const user = await userService.getCurrentUser();
      
      if (user && user.isLoggedIn) {
        this.setData({
          isLoggedIn: true,
          userInfo: {
            avatar: user.avatar,
            nickname: user.nickname,
            membershipLevel: user.membershipLevel
          }
        });
      } else {
        this.setData({
          isLoggedIn: false,
          userInfo: undefined
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.setData({
        isLoggedIn: false,
        userInfo: undefined
      });
    }
  },

  /**
   * Load account metrics
   */
  async loadAccountMetrics() {
    try {
      this.setData({ accountMetricsLoading: true });
      
      const accountService = ServiceFactory.getAccountService();
      const metrics = await accountService.getAccountMetrics();
      
      this.setData({
        accountMetrics: metrics,
        accountMetricsLoading: false
      });
    } catch (error) {
      console.error('Error loading account metrics:', error);
      this.setData({
        accountMetrics: {
          balance: 0,
          points: 0,
          cards: 0,
          coupons: 0
        },
        accountMetricsLoading: false
      });
    }
  },

  /**
   * Load order counts
   */
  async loadOrderCounts() {
    try {
      this.setData({ orderCountsLoading: true });
      
      const orderService = ServiceFactory.getOrderService();
      const counts = await orderService.getOrderCounts();
      
      this.setData({
        orderCounts: counts,
        orderCountsLoading: false
      });
    } catch (error) {
      console.error('Error loading order counts:', error);
      this.setData({
        orderCounts: {
          pending_payment: 0,
          pending_shipment: 0,
          pending_receipt: 0,
          pending_review: 0,
          refund_aftersales: 0,
          total: 0
        },
        orderCountsLoading: false
      });
    }
  },

  /**
   * Handle login button tap
   */
  onLoginTap() {
    console.log('Login button tapped');
    // Navigate to login page
    wx.navigateTo({
      url: '/pages/login/index'
    });
  },

  /**
   * Handle account metric tap
   */
  onAccountMetricTap(event: any) {
    const { type } = event.detail;
    console.log('Account metric tapped:', type);
    
    // Navigate to corresponding detail page
    const routes: Record<string, string> = {
      balance: '/pages/balance/index',
      points: '/pages/points/index',
      cards: '/pages/cards/index',
      coupons: '/pages/coupons/index'
    };
    
    const route = routes[type];
    if (route) {
      wx.navigateTo({
        url: route
      });
    }
  },

  /**
   * Handle view all orders tap
   */
  onViewAllOrdersTap() {
    console.log('View all orders tapped');
    wx.navigateTo({
      url: '/pages/orders/index'
    });
  },

  /**
   * Handle order status tap
   */
  onOrderStatusTap(event: any) {
    const { status } = event.detail;
    console.log('Order status tapped:', status);
    
    wx.navigateTo({
      url: `/pages/orders/index?status=${status}`
    });
  },

  /**
   * Handle service menu item tap
   */
  onServiceMenuTap(event: any) {
    const { serviceId } = event.detail;
    console.log('Service menu tapped:', serviceId);
    
    // Handle different service actions
    switch (serviceId) {
      case 'task-center':
        wx.navigateTo({
          url: '/pages/task-center/index'
        });
        break;
      case 'delivery-address':
        wx.navigateTo({
          url: '/pages/address/index'
        });
        break;
      case 'call-merchant':
        wx.makePhoneCall({
          phoneNumber: '400-123-4567'
        });
        break;
      case 'personal-info':
        wx.navigateTo({
          url: '/pages/personal-info/index'
        });
        break;
      case 'account-security':
        wx.navigateTo({
          url: '/pages/account-security/index'
        });
        break;
      default:
        console.warn('Unknown service ID:', serviceId);
    }
  },

  /**
   * Handle retry button tap
   */
  onRetryTap() {
    console.log('Retry button tapped');
    this.loadPageData();
  }
});
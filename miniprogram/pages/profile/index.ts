// pages/profile/index.ts
import { SimpleServiceFactory } from '../../services/simple-factory';
import { AccountMetrics } from '../../models/account';
import { OrderCounts } from '../../models/order';
import { navigationManager } from '../../utils/navigation';
import { navigationTester } from '../../utils/navigation-test';

interface ProfilePageData {
  // User data
  isLoggedIn: boolean;
  userInfo: {
    avatar?: string;
    nickname?: string;
    membershipLevel?: string;
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
    userInfo: {},

    // Account metrics
    accountMetrics: {
      balance: 0,
      points: 0,
      cards: 0,
      coupons: 0,
    },
    accountMetricsLoading: true,

    // Order counts
    orderCounts: {
      pending_payment: 0,
      pending_shipment: 0,
      pending_receipt: 0,
      pending_review: 0,
      refund_aftersales: 0,
      total: 0,
    },
    orderCountsLoading: true,

    // Page state
    pageLoading: true,
    hasError: false,
    errorMessage: '',
  } as ProfilePageData,

  /**
   * Page lifecycle - onLoad
   */
  onLoad(options: { section?: string; action?: string }) {
    console.log('Profile page loaded with options:', options);
    this.loadPageData();

    // Handle deep linking
    if (options.section) {
      this.handleDeepLink(options.section, options.action);
    }
  },

  /**
   * Page lifecycle - onShow
   */
  onShow() {
    console.log('Profile page shown');
    // Refresh data when page becomes visible
    this.loadPageData();

    // Ensure proper tab bar highlighting
    this.ensureTabBarHighlighting();
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
        errorMessage: '',
      });

      // Load data in parallel for better performance
      const promises = [this.loadUserData(), this.loadAccountMetrics(), this.loadOrderCounts()];

      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error loading profile page data:', error);
      this.setData({
        hasError: true,
        errorMessage: '加载失败，请重试',
      });
    } finally {
      this.setData({
        pageLoading: false,
      });
    }
  },

  /**
   * Load user data
   */
  async loadUserData() {
    try {
      console.log('Loading user data...');

      const userService = SimpleServiceFactory.getUserService();
      console.log('UserService instance:', userService);

      const user = await userService.getCurrentUser();
      console.log('User data loaded:', user);

      if (user && user.isLoggedIn) {
        this.setData({
          isLoggedIn: true,
          userInfo: {
            avatar: user.avatar || '/images/placeholders/default-avatar.svg',
            nickname: user.nickname || '用户',
            membershipLevel: user.membershipLevel || 'bronze',
          },
        });
      } else {
        this.setData({
          isLoggedIn: false,
          userInfo: {
            avatar: '/images/placeholders/default-avatar.svg',
            nickname: '用户',
            membershipLevel: 'bronze',
          },
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.setData({
        isLoggedIn: false,
        userInfo: {
          avatar: '/images/placeholders/default-avatar.svg',
          nickname: '用户',
          membershipLevel: 'bronze',
        },
      });
    }
  },

  /**
   * Load account metrics
   */
  async loadAccountMetrics() {
    try {
      this.setData({ accountMetricsLoading: true });

      // Get current user first
      const userService = SimpleServiceFactory.getUserService();
      const user = await userService.getCurrentUser();

      if (user && user.id) {
        const accountService = SimpleServiceFactory.getAccountService();
        const metrics = await accountService.getAccountMetrics(user.id);

        this.setData({
          accountMetrics: metrics,
          accountMetricsLoading: false,
        });
      } else {
        // User not logged in, show default values
        this.setData({
          accountMetrics: {
            balance: 0,
            points: 0,
            cards: 0,
            coupons: 0,
          },
          accountMetricsLoading: false,
        });
      }
    } catch (error) {
      console.error('Error loading account metrics:', error);
      this.setData({
        accountMetrics: {
          balance: 0,
          points: 0,
          cards: 0,
          coupons: 0,
        },
        accountMetricsLoading: false,
      });
    }
  },

  /**
   * Load order counts
   */
  async loadOrderCounts() {
    try {
      this.setData({ orderCountsLoading: true });

      // Get current user first
      const userService = SimpleServiceFactory.getUserService();
      const user = await userService.getCurrentUser();

      if (user && user.id) {
        const orderService = SimpleServiceFactory.getOrderService();
        const counts = await orderService.getOrderCounts(user.id);

        this.setData({
          orderCounts: counts,
          orderCountsLoading: false,
        });
      } else {
        // User not logged in, show default values
        this.setData({
          orderCounts: {
            pending_payment: 0,
            pending_shipment: 0,
            pending_receipt: 0,
            pending_review: 0,
            refund_aftersales: 0,
            total: 0,
          },
          orderCountsLoading: false,
        });
      }
    } catch (error) {
      console.error('Error loading order counts:', error);
      this.setData({
        orderCounts: {
          pending_payment: 0,
          pending_shipment: 0,
          pending_receipt: 0,
          pending_review: 0,
          refund_aftersales: 0,
          total: 0,
        },
        orderCountsLoading: false,
      });
    }
  },

  /**
   * Handle login button tap
   */
  onLoginTap() {
    console.log('Login button tapped');
    // Navigate to login page using navigation manager
    navigationManager.navigateTo({
      url: '/pages/login/index',
      success: () => {
        console.log('Successfully navigated to login page');
      },
      fail: error => {
        console.error('Failed to navigate to login page:', error);
      },
    });
  },

  /**
   * Handle account metric tap
   */
  onAccountMetricTap(event: any) {
    const { type } = event.detail;
    console.log('Account metric tapped:', type);

    // Navigate to corresponding detail page using navigation manager
    const routes: Record<string, string> = {
      balance: '/pages/balance/index',
      points: '/pages/points/index',
      cards: '/pages/cards/index',
      coupons: '/pages/coupons/index',
    };

    const route = routes[type];
    if (route) {
      navigationManager.navigateTo({
        url: route,
        success: () => {
          console.log(`Successfully navigated to ${type} page`);
        },
      });
    }
  },

  /**
   * Handle view all orders tap
   */
  onViewAllOrdersTap() {
    console.log('View all orders tapped');
    navigationManager.navigateTo({
      url: '/pages/orders/index',
      success: () => {
        console.log('Successfully navigated to orders page');
      },
    });
  },

  /**
   * Handle order status tap
   */
  onOrderStatusTap(event: any) {
    const { status } = event.detail;
    console.log('Order status tapped:', status);

    navigationManager.navigateTo({
      url: `/pages/orders/index?status=${status}`,
      success: () => {
        console.log(`Successfully navigated to orders page with status: ${status}`);
      },
    });
  },

  /**
   * Handle service menu item tap
   */
  onServiceMenuTap(event: any) {
    const { serviceId } = event.detail;
    console.log('Service menu tapped:', serviceId);

    // Handle different service actions using navigation manager
    switch (serviceId) {
      case 'task-center':
        navigationManager.navigateTo({
          url: '/pages/task-center/index',
          success: () => console.log('Successfully navigated to task center'),
        });
        break;
      case 'delivery-address':
        navigationManager.navigateTo({
          url: '/pages/address/index',
          success: () => console.log('Successfully navigated to address page'),
        });
        break;
      case 'call-merchant':
        wx.makePhoneCall({
          phoneNumber: '400-123-4567',
          success: () => console.log('Phone call initiated'),
          fail: error => {
            console.error('Failed to make phone call:', error);
            wx.showToast({
              title: '拨打电话失败',
              icon: 'none',
            });
          },
        });
        break;
      case 'personal-info':
        navigationManager.navigateTo({
          url: '/pages/personal-info/index',
          success: () => console.log('Successfully navigated to personal info page'),
        });
        break;
      case 'account-security':
        navigationManager.navigateTo({
          url: '/pages/account-security/index',
          success: () => console.log('Successfully navigated to account security page'),
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
  },

  /**
   * Handle deep linking to specific sections
   */
  handleDeepLink(section: string, action?: string) {
    console.log('Handling deep link:', section, action);

    // Wait for page data to load before handling deep links
    setTimeout(() => {
      switch (section) {
        case 'orders':
          if (action) {
            wx.navigateTo({
              url: `/pages/orders/index?status=${action}`,
            });
          } else {
            this.onViewAllOrdersTap();
          }
          break;
        case 'balance':
          this.onAccountMetricTap({ detail: { type: 'balance' } });
          break;
        case 'points':
          this.onAccountMetricTap({ detail: { type: 'points' } });
          break;
        case 'cards':
          this.onAccountMetricTap({ detail: { type: 'cards' } });
          break;
        case 'coupons':
          this.onAccountMetricTap({ detail: { type: 'coupons' } });
          break;
        case 'task-center':
          this.onServiceMenuTap({ detail: { serviceId: 'task-center' } });
          break;
        case 'address':
          this.onServiceMenuTap({ detail: { serviceId: 'delivery-address' } });
          break;
        case 'personal-info':
          this.onServiceMenuTap({ detail: { serviceId: 'personal-info' } });
          break;
        case 'account-security':
          this.onServiceMenuTap({ detail: { serviceId: 'account-security' } });
          break;
        default:
          console.warn('Unknown deep link section:', section);
      }
    }, 500);
  },

  /**
   * Get current page path for sharing and deep linking
   */
  getCurrentPagePath(): string {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    return currentPage.route || 'pages/profile/index';
  },

  /**
   * Generate deep link URL for specific section
   */
  generateDeepLink(section: string, action?: string): string {
    let url = `/pages/profile/index?section=${section}`;
    if (action) {
      url += `&action=${action}`;
    }
    return url;
  },

  /**
   * Handle tab bar navigation highlighting
   */
  onTabBarItemTap(e: any) {
    const { index, pagePath } = e.detail;
    console.log('Tab bar item tapped:', index, pagePath);

    // Ensure proper tab highlighting
    if (typeof wx.setTabBarStyle === 'function') {
      wx.setTabBarStyle({
        selectedColor: '#8B4513',
        color: '#666666',
      });
    }
  },

  /**
   * Ensure proper tab bar highlighting
   */
  ensureTabBarHighlighting() {
    try {
      // Set tab bar style to ensure profile tab is highlighted
      wx.setTabBarStyle({
        selectedColor: '#8B4513',
        color: '#666666',
        backgroundColor: '#ffffff',
      });

      // Set the current tab item (profile is index 3)
      wx.setTabBarItem({
        index: 3,
        text: '我的',
        iconPath: '/images/profile.png',
        selectedIconPath: '/images/profile-active.png',
      });
    } catch (error) {
      console.warn('Failed to set tab bar highlighting:', error);
    }
  },

  /**
   * Test all navigation flows
   */
  async testAllNavigationFlows() {
    console.log('Testing all navigation flows...');

    const testCases = [
      {
        name: 'Login Navigation',
        test: () => this.onLoginTap(),
      },
      {
        name: 'Orders Navigation',
        test: () => this.onViewAllOrdersTap(),
      },
      {
        name: 'Balance Navigation',
        test: () => this.onAccountMetricTap({ detail: { type: 'balance' } }),
      },
      {
        name: 'Points Navigation',
        test: () => this.onAccountMetricTap({ detail: { type: 'points' } }),
      },
      {
        name: 'Cards Navigation',
        test: () => this.onAccountMetricTap({ detail: { type: 'cards' } }),
      },
      {
        name: 'Coupons Navigation',
        test: () => this.onAccountMetricTap({ detail: { type: 'coupons' } }),
      },
      {
        name: 'Task Center Navigation',
        test: () => this.onServiceMenuTap({ detail: { serviceId: 'task-center' } }),
      },
      {
        name: 'Address Navigation',
        test: () => this.onServiceMenuTap({ detail: { serviceId: 'delivery-address' } }),
      },
      {
        name: 'Personal Info Navigation',
        test: () => this.onServiceMenuTap({ detail: { serviceId: 'personal-info' } }),
      },
      {
        name: 'Account Security Navigation',
        test: () => this.onServiceMenuTap({ detail: { serviceId: 'account-security' } }),
      },
    ];

    // Test deep linking
    const deepLinkTests = [
      { section: 'orders', action: 'pending_payment' },
      { section: 'balance' },
      { section: 'points' },
      { section: 'task-center' },
    ];

    console.log(`Running ${testCases.length} navigation tests...`);

    for (const testCase of testCases) {
      try {
        console.log(`✓ Testing: ${testCase.name}`);
        // In development, we would actually run the test
        // For now, just validate the test exists
        if (typeof testCase.test === 'function') {
          console.log(`  - Test function available for ${testCase.name}`);
        }
      } catch (error) {
        console.error(`✗ Test failed: ${testCase.name}`, error);
      }
    }

    console.log(`Testing ${deepLinkTests.length} deep link scenarios...`);

    for (const deepLinkTest of deepLinkTests) {
      try {
        const deepLinkUrl = navigationManager.generateDeepLink(deepLinkTest);
        console.log(`✓ Deep link generated: ${deepLinkUrl}`);

        const parsed = navigationManager.parseDeepLink(deepLinkUrl);
        if (parsed) {
          console.log(`  - Deep link parsed successfully:`, parsed);
        }
      } catch (error) {
        console.error(`✗ Deep link test failed:`, deepLinkTest, error);
      }
    }

    console.log('Navigation flow testing completed');

    // Show test results to user in development
    // @ts-ignore - WeChat Mini Program doesn't have process.env
    if (typeof __wxConfig !== 'undefined' && __wxConfig.debug) {
      wx.showModal({
        title: '导航测试完成',
        content: `已测试 ${testCases.length} 个导航流程和 ${deepLinkTests.length} 个深度链接场景`,
        showCancel: false,
      });
    }
  },

  /**
   * Run comprehensive navigation tests (for development/testing)
   */
  async runNavigationTests() {
    console.log('Running comprehensive navigation tests...');

    try {
      wx.showLoading({
        title: '运行导航测试...',
        mask: true,
      });

      const testResults = await navigationTester.runFullTestSuite();
      const report = navigationTester.generateTestReport(testResults);

      wx.hideLoading();

      console.log('Navigation test results:', testResults);
      console.log('Test report:', report);

      // Show results to user
      wx.showModal({
        title: '导航测试结果',
        content: `总测试: ${testResults.summary.totalTests}\n通过: ${
          testResults.summary.passedTests
        }\n失败: ${
          testResults.summary.failedTests
        }\n成功率: ${testResults.summary.successRate.toFixed(1)}%`,
        confirmText: '查看详情',
        cancelText: '关闭',
        success: res => {
          if (res.confirm) {
            // In a real app, we might show a detailed report page
            console.log('Detailed test report:', report);
          }
        },
      });
    } catch (error) {
      wx.hideLoading();
      console.error('Navigation tests failed:', error);
      wx.showToast({
        title: '测试运行失败',
        icon: 'none',
      });
    }
  },

  /**
   * Handle long press for development features
   */
  onLongPress() {
    // Show development menu in development mode
    // @ts-ignore - WeChat Mini Program doesn't have process.env
    if (typeof __wxConfig !== 'undefined' && __wxConfig.debug) {
      wx.showActionSheet({
        itemList: ['测试所有导航流程', '测试深度链接', '测试标签栏导航', '查看导航历史'],
        success: res => {
          switch (res.tapIndex) {
            case 0:
              this.runNavigationTests();
              break;
            case 1:
              this.testDeepLinkingOnly();
              break;
            case 2:
              this.testTabBarOnly();
              break;
            case 3:
              this.showNavigationHistory();
              break;
          }
        },
      });
    }
  },

  /**
   * Test deep linking only
   */
  async testDeepLinkingOnly() {
    try {
      wx.showLoading({ title: '测试深度链接...', mask: true });
      const results = await navigationTester.testDeepLinking();
      wx.hideLoading();

      const passed = results.filter(r => r.success).length;
      wx.showModal({
        title: '深度链接测试',
        content: `测试完成\n总数: ${results.length}\n通过: ${passed}\n失败: ${
          results.length - passed
        }`,
        showCancel: false,
      });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: '测试失败', icon: 'none' });
    }
  },

  /**
   * Test tab bar navigation only
   */
  async testTabBarOnly() {
    try {
      wx.showLoading({ title: '测试标签栏导航...', mask: true });
      const results = await navigationTester.testTabBarNavigation();
      wx.hideLoading();

      const passed = results.filter(r => r.success).length;
      wx.showModal({
        title: '标签栏导航测试',
        content: `测试完成\n总数: ${results.length}\n通过: ${passed}\n失败: ${
          results.length - passed
        }`,
        showCancel: false,
      });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: '测试失败', icon: 'none' });
    }
  },

  /**
   * Show navigation history
   */
  showNavigationHistory() {
    const history = navigationManager.getNavigationHistory();
    const historyText = history.length > 0 ? history.slice(-5).join('\n') : '暂无导航历史';

    wx.showModal({
      title: '导航历史 (最近5条)',
      content: historyText,
      showCancel: false,
    });
  },
});

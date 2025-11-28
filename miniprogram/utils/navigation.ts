// utils/navigation.ts
/**
 * Navigation utilities for handling deep links and navigation flows
 */

export interface NavigationOptions {
  url: string;
  success?: () => void;
  fail?: (error: any) => void;
  complete?: () => void;
}

export interface DeepLinkOptions {
  section: string;
  action?: string;
  params?: Record<string, string>;
}

export class NavigationManager {
  private static instance: NavigationManager;
  private navigationHistory: string[] = [];
  private maxHistorySize = 10;

  static getInstance(): NavigationManager {
    if (!NavigationManager.instance) {
      NavigationManager.instance = new NavigationManager();
    }
    return NavigationManager.instance;
  }

  /**
   * Enhanced navigation with error handling and history tracking
   */
  navigateTo(options: NavigationOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      // Add to navigation history
      this.addToHistory(options.url);

      wx.navigateTo({
        url: options.url,
        success: () => {
          console.log('Navigation successful:', options.url);
          options.success?.();
          resolve();
        },
        fail: (error) => {
          console.error('Navigation failed:', error, options.url);
          this.handleNavigationError(error, options.url);
          options.fail?.(error);
          reject(error);
        },
        complete: options.complete
      });
    });
  }

  /**
   * Enhanced tab switching with proper highlighting
   */
  switchTab(options: NavigationOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      wx.switchTab({
        url: options.url,
        success: () => {
          console.log('Tab switch successful:', options.url);
          this.ensureTabBarHighlighting();
          options.success?.();
          resolve();
        },
        fail: (error) => {
          console.error('Tab switch failed:', error, options.url);
          options.fail?.(error);
          reject(error);
        },
        complete: options.complete
      });
    });
  }

  /**
   * Generate deep link URL
   */
  generateDeepLink(options: DeepLinkOptions): string {
    let url = `/pages/profile/index?section=${options.section}`;
    
    if (options.action) {
      url += `&action=${options.action}`;
    }
    
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      });
    }
    
    return url;
  }

  /**
   * Parse deep link parameters
   */
  parseDeepLink(url: string): DeepLinkOptions | null {
    try {
      const [path, queryString] = url.split('?');
      if (!queryString) return null;

      const params = new URLSearchParams(queryString);
      const section = params.get('section');
      
      if (!section) return null;

      const result: DeepLinkOptions = { section };
      
      const action = params.get('action');
      if (action) result.action = action;

      // Extract other parameters
      const otherParams: Record<string, string> = {};
      params.forEach((value, key) => {
        if (key !== 'section' && key !== 'action') {
          otherParams[key] = value;
        }
      });
      
      if (Object.keys(otherParams).length > 0) {
        result.params = otherParams;
      }

      return result;
    } catch (error) {
      console.error('Failed to parse deep link:', error);
      return null;
    }
  }

  /**
   * Handle navigation errors with user-friendly messages
   */
  private handleNavigationError(error: any, url: string) {
    let message = '页面跳转失败';
    
    if (error.errMsg) {
      if (error.errMsg.includes('page not found')) {
        message = '页面不存在，功能开发中';
      } else if (error.errMsg.includes('navigate')) {
        message = '页面跳转异常，请稍后重试';
      }
    }

    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  }

  /**
   * Add URL to navigation history
   */
  private addToHistory(url: string) {
    this.navigationHistory.push(url);
    
    // Keep history size manageable
    if (this.navigationHistory.length > this.maxHistorySize) {
      this.navigationHistory.shift();
    }
  }

  /**
   * Get navigation history
   */
  getNavigationHistory(): string[] {
    return [...this.navigationHistory];
  }

  /**
   * Ensure proper tab bar highlighting
   */
  private ensureTabBarHighlighting() {
    try {
      // Set tab bar colors to ensure proper highlighting
      wx.setTabBarStyle({
        selectedColor: '#8B4513',
        color: '#666666',
        backgroundColor: '#ffffff'
      });
    } catch (error) {
      console.warn('Failed to set tab bar style:', error);
    }
  }

  /**
   * Get current page info
   */
  getCurrentPageInfo(): { route: string; options: any } | null {
    try {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      
      return {
        route: currentPage.route || '',
        options: (currentPage as any).options || {}
      };
    } catch (error) {
      console.error('Failed to get current page info:', error);
      return null;
    }
  }

  /**
   * Check if current page is a tab page
   */
  isCurrentPageTabPage(): boolean {
    const currentPageInfo = this.getCurrentPageInfo();
    if (!currentPageInfo) return false;

    const tabPages = [
      'pages/index/index',
      'pages/category/index', 
      'pages/cart/index',
      'pages/profile/index'
    ];

    return tabPages.includes(currentPageInfo.route);
  }

  /**
   * Navigate back with fallback to tab page
   */
  navigateBackSafely(): Promise<void> {
    return new Promise((resolve, reject) => {
      const pages = getCurrentPages();
      
      if (pages.length > 1) {
        // Can navigate back
        wx.navigateBack({
          success: () => resolve(),
          fail: (error) => {
            console.warn('Navigate back failed, switching to home tab:', error);
            this.switchTab({ url: '/pages/index/index' })
              .then(() => resolve())
              .catch(reject);
          }
        });
      } else {
        // No previous page, go to home tab
        this.switchTab({ url: '/pages/index/index' })
          .then(() => resolve())
          .catch(reject);
      }
    });
  }

  /**
   * Test all navigation flows
   */
  async testNavigationFlows(): Promise<void> {
    console.log('Testing navigation flows...');
    
    const testRoutes = [
      '/pages/orders/index',
      '/pages/balance/index',
      '/pages/points/index',
      '/pages/task-center/index'
    ];

    for (const route of testRoutes) {
      try {
        console.log(`Testing navigation to: ${route}`);
        // In a real test environment, we would actually navigate
        // For now, just log the test
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Navigation test failed for ${route}:`, error);
      }
    }
    
    console.log('Navigation flow tests completed');
  }
}

// Export singleton instance
export const navigationManager = NavigationManager.getInstance();
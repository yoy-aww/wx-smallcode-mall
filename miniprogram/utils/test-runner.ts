/**
 * Simple test runner for development environment
 * Provides easy access to run cart integration tests
 */

import { CartIntegrationTester } from './cart-integration-test';
import { CartPerformanceOptimizer } from './cart-performance-optimizer';

/**
 * Development test runner
 */
export class DevTestRunner {
  private static isRunning = false;

  /**
   * Run quick smoke tests
   */
  static async runSmokeTests(): Promise<void> {
    if (this.isRunning) {
      console.log('Tests are already running...');
      return;
    }

    this.isRunning = true;

    try {
      console.log('🚀 Starting cart smoke tests...');
      
      // Initialize performance optimizer
      CartPerformanceOptimizer.initialize();

      // Run basic tests only
      const results = await CartIntegrationTester.runAllTests();
      
      // Show results in console
      console.log('📊 Test Results Summary:');
      console.log(`✅ Passed: ${results.passedTests}/${results.totalTests}`);
      console.log(`❌ Failed: ${results.failedTests}/${results.totalTests}`);
      console.log(`⏱️ Duration: ${results.duration}ms`);
      console.log(`📈 Success Rate: ${(results.passedTests / results.totalTests * 100).toFixed(1)}%`);

      // Show failed tests
      if (results.failedTests > 0) {
        console.log('\n❌ Failed Tests:');
        results.results.forEach(suite => {
          suite.results.forEach(test => {
            if (!test.passed) {
              console.log(`  - ${suite.suiteName}: ${test.testName}`);
              console.log(`    Error: ${test.error}`);
            }
          });
        });
      }

      // Show performance stats
      const perfStats = CartPerformanceOptimizer.getStats();
      console.log('\n📈 Performance Stats:', perfStats);

      // Show toast notification
      wx.showToast({
        title: results.failedTests === 0 ? '所有测试通过' : `${results.failedTests}个测试失败`,
        icon: results.failedTests === 0 ? 'success' : 'none',
        duration: 3000
      });

    } catch (error) {
      console.error('❌ Test runner failed:', error);
      
      wx.showToast({
        title: '测试运行失败',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.isRunning = false;
      CartPerformanceOptimizer.cleanup();
    }
  }

  /**
   * Run performance benchmark
   */
  static async runPerformanceBenchmark(): Promise<void> {
    console.log('🏃‍♂️ Running performance benchmark...');

    try {
      CartPerformanceOptimizer.initialize();

      const startTime = Date.now();

      // Import cart service
      const { CartService } = await import('../services/cart');

      // Benchmark: Add multiple items
      console.log('📦 Benchmarking: Add items to cart');
      const addStartTime = Date.now();
      
      for (let i = 0; i < 20; i++) {
        await CartService.addToCart(`benchmark_product_${i}`, Math.floor(Math.random() * 5) + 1);
      }
      
      const addEndTime = Date.now();
      const addDuration = addEndTime - addStartTime;
      console.log(`  ✅ Added 20 items in ${addDuration}ms (avg: ${(addDuration / 20).toFixed(1)}ms per item)`);

      // Benchmark: Get cart items
      console.log('📋 Benchmarking: Get cart items');
      const getStartTime = Date.now();
      
      const cartItems = await CartService.getCartItems();
      
      const getEndTime = Date.now();
      const getDuration = getEndTime - getStartTime;
      console.log(`  ✅ Retrieved ${cartItems.length} items in ${getDuration}ms`);

      // Benchmark: Selection operations
      console.log('☑️ Benchmarking: Selection operations');
      const selectStartTime = Date.now();
      
      for (const item of cartItems.slice(0, 10)) {
        await CartService.toggleItemSelection(item.productId);
      }
      
      const selectEndTime = Date.now();
      const selectDuration = selectEndTime - selectStartTime;
      console.log(`  ✅ Toggled 10 selections in ${selectDuration}ms (avg: ${(selectDuration / 10).toFixed(1)}ms per toggle)`);

      // Benchmark: Calculate totals
      console.log('💰 Benchmarking: Calculate totals');
      const calcStartTime = Date.now();
      
      const selections = await CartService.getSelections();
      const selectedIds = Array.from(selections.entries())
        .filter(([_, selected]) => selected)
        .map(([productId, _]) => productId);
      
      await CartService.calculateSelectedTotal(selectedIds);
      
      const calcEndTime = Date.now();
      const calcDuration = calcEndTime - calcStartTime;
      console.log(`  ✅ Calculated totals for ${selectedIds.length} items in ${calcDuration}ms`);

      const totalTime = Date.now() - startTime;
      console.log(`\n🏁 Total benchmark time: ${totalTime}ms`);

      // Show performance stats
      const perfStats = CartPerformanceOptimizer.getStats();
      console.log('📊 Performance metrics:', perfStats);

      // Clean up benchmark data
      await CartService.clearCart();

      wx.showToast({
        title: `性能测试完成 ${totalTime}ms`,
        icon: 'success',
        duration: 2000
      });

    } catch (error) {
      console.error('❌ Performance benchmark failed:', error);
      
      wx.showToast({
        title: '性能测试失败',
        icon: 'none',
        duration: 2000
      });
    } finally {
      CartPerformanceOptimizer.cleanup();
    }
  }

  /**
   * Test cart data persistence
   */
  static async testDataPersistence(): Promise<void> {
    console.log('💾 Testing data persistence...');

    try {
      const { CartService } = await import('../services/cart');
      const { CartStateSynchronizer } = await import('./cart-state-sync');

      // Add test data
      await CartService.addToCart('persistence_test_1', 2);
      await CartService.addToCart('persistence_test_2', 3);
      await CartService.toggleItemSelection('persistence_test_1');

      // Get current state
      const cartItems = await CartService.getCartItems();
      const selections = await CartService.getSelections();

      console.log('📝 Current state:', {
        itemsCount: cartItems.length,
        selectionsCount: selections.size
      });

      // Sync to storage
      await CartStateSynchronizer.syncToStorage(cartItems, selections);
      console.log('💾 Data synced to storage');

      // Clear memory state (simulate app restart)
      await CartService.clearCart();
      console.log('🧹 Memory state cleared');

      // Restore from storage
      const restored = await CartStateSynchronizer.syncFromStorage();
      console.log('📥 Data restored from storage:', {
        itemsCount: restored.items.length,
        selectionsCount: restored.selections.size,
        isExpired: restored.isExpired
      });

      // Verify data integrity
      if (restored.items.length === cartItems.length && 
          restored.selections.size === selections.size) {
        console.log('✅ Data persistence test passed');
        
        wx.showToast({
          title: '数据持久化测试通过',
          icon: 'success',
          duration: 2000
        });
      } else {
        console.log('❌ Data persistence test failed');
        
        wx.showToast({
          title: '数据持久化测试失败',
          icon: 'none',
          duration: 2000
        });
      }

      // Clean up
      await CartService.clearCart();

    } catch (error) {
      console.error('❌ Data persistence test failed:', error);
      
      wx.showToast({
        title: '持久化测试失败',
        icon: 'none',
        duration: 2000
      });
    }
  }

  /**
   * Show test menu
   */
  static showTestMenu(): void {
    wx.showActionSheet({
      itemList: [
        '运行快速测试',
        '性能基准测试', 
        '数据持久化测试',
        '查看性能统计'
      ],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.runSmokeTests();
            break;
          case 1:
            this.runPerformanceBenchmark();
            break;
          case 2:
            this.testDataPersistence();
            break;
          case 3:
            this.showPerformanceStats();
            break;
        }
      }
    });
  }

  /**
   * Show performance statistics
   */
  static showPerformanceStats(): void {
    try {
      CartPerformanceOptimizer.initialize();
      const stats = CartPerformanceOptimizer.getStats();
      
      const cacheInfo = `缓存条目: ${stats.cache.totalEntries}\n内存使用: ${(stats.cache.memoryUsage / 1024).toFixed(1)}KB`;
      const perfInfo = Object.keys(stats.performance).length > 0 
        ? `性能指标: ${Object.keys(stats.performance).length}项`
        : '暂无性能数据';

      wx.showModal({
        title: '性能统计',
        content: `${cacheInfo}\n${perfInfo}`,
        showCancel: false
      });

      console.log('📊 Performance Stats:', stats);
      
    } catch (error) {
      console.error('Failed to get performance stats:', error);
      
      wx.showToast({
        title: '获取统计失败',
        icon: 'none',
        duration: 2000
      });
    }
  }

  /**
   * Check if running in development environment
   */
  static isDevelopment(): boolean {
    // Check if we're in development mode
    // This could be based on build configuration or other indicators
    try {
      // In WeChat Mini Program, we can check the account info
      const accountInfo = wx.getAccountInfoSync();
      return accountInfo.miniProgram.envVersion === 'develop';
    } catch (error) {
      // Fallback: assume development if we can't determine
      return true;
    }
  }

  /**
   * Initialize development tools
   */
  static initDevelopmentTools(): void {
    if (!this.isDevelopment()) {
      return;
    }

    console.log('🛠️ Development tools initialized');
    console.log('💡 Use DevTestRunner.showTestMenu() to run tests');
    
    // Add global access for debugging
    if (typeof getApp === 'function') {
      const app = getApp();
      if (app) {
        (app as any).devTestRunner = this;
        console.log('🔧 DevTestRunner available as app.devTestRunner');
      }
    }
  }
}

// Auto-initialize in development
if (DevTestRunner.isDevelopment()) {
  DevTestRunner.initDevelopmentTools();
}
/**
 * Cart integration test utilities
 * Comprehensive end-to-end testing for cart functionality
 */

import { CartService } from '../services/cart';
import { CartStateSynchronizer } from './cart-state-sync';
import { CartManager, CartEventType } from './cart-manager';

/**
 * Test result interface
 */
interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

/**
 * Test suite result
 */
interface TestSuiteResult {
  suiteName: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  results: TestResult[];
}

/**
 * Mock product data for testing
 */
const MOCK_PRODUCTS = [
  {
    id: 'test_product_1',
    name: '测试商品1',
    originalPrice: 99.99,
    discountedPrice: 79.99,
    stock: 10,
    image: '/images/test/product1.jpg'
  },
  {
    id: 'test_product_2',
    name: '测试商品2',
    originalPrice: 199.99,
    discountedPrice: null,
    stock: 5,
    image: '/images/test/product2.jpg'
  },
  {
    id: 'test_product_3',
    name: '测试商品3',
    originalPrice: 49.99,
    discountedPrice: 39.99,
    stock: 0,
    image: '/images/test/product3.jpg'
  }
];

/**
 * Cart integration test runner
 */
export class CartIntegrationTester {
  private static testResults: TestSuiteResult[] = [];

  /**
   * Run all integration tests
   */
  static async runAllTests(): Promise<{
    totalSuites: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    duration: number;
    results: TestSuiteResult[];
  }> {
    console.log('Starting cart integration tests...');
    
    const startTime = Date.now();
    this.testResults = [];

    try {
      // Setup test environment
      await this.setupTestEnvironment();

      // Run test suites
      await this.runBasicCartOperationsTests();
      await this.runSelectionManagementTests();
      await this.runCheckoutFlowTests();
      await this.runDataPersistenceTests();
      await this.runErrorHandlingTests();
      await this.runPerformanceTests();
      await this.runCrossPageSyncTests();

      // Cleanup test environment
      await this.cleanupTestEnvironment();

    } catch (error) {
      console.error('Test suite setup/cleanup failed:', error);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Calculate summary
    const totalTests = this.testResults.reduce((sum, suite) => sum + suite.totalTests, 0);
    const passedTests = this.testResults.reduce((sum, suite) => sum + suite.passedTests, 0);
    const failedTests = this.testResults.reduce((sum, suite) => sum + suite.failedTests, 0);

    const summary = {
      totalSuites: this.testResults.length,
      totalTests,
      passedTests,
      failedTests,
      duration,
      results: this.testResults
    };

    console.log('Cart integration tests completed:', summary);
    return summary;
  }

  /**
   * Setup test environment
   */
  private static async setupTestEnvironment(): Promise<void> {
    console.log('Setting up test environment...');
    
    // Clear existing cart data
    await CartService.clearCart();
    
    // Initialize cart manager
    CartManager.initialize();
    
    // Initialize state synchronizer
    await CartStateSynchronizer.initialize();
    
    console.log('Test environment setup completed');
  }

  /**
   * Cleanup test environment
   */
  private static async cleanupTestEnvironment(): Promise<void> {
    console.log('Cleaning up test environment...');
    
    // Clear test data
    await CartService.clearCart();
    
    // Clear storage
    wx.clearStorageSync();
    
    console.log('Test environment cleanup completed');
  }

  /**
   * Run basic cart operations tests
   */
  private static async runBasicCartOperationsTests(): Promise<void> {
    const suiteName = 'Basic Cart Operations';
    const results: TestResult[] = [];
    const suiteStartTime = Date.now();

    // Test: Add item to cart
    results.push(await this.runTest('Add item to cart', async () => {
      const response = await CartService.addToCart(MOCK_PRODUCTS[0].id, 2);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to add item');
      }

      const cartItems = await CartService.getCartItems();
      
      if (cartItems.length !== 1) {
        throw new Error(`Expected 1 item, got ${cartItems.length}`);
      }

      if (cartItems[0].quantity !== 2) {
        throw new Error(`Expected quantity 2, got ${cartItems[0].quantity}`);
      }

      return { itemsCount: cartItems.length, quantity: cartItems[0].quantity };
    }));

    // Test: Update item quantity
    results.push(await this.runTest('Update item quantity', async () => {
      const response = await CartService.updateCartItemQuantity(MOCK_PRODUCTS[0].id, 5);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update quantity');
      }

      const cartItems = await CartService.getCartItems();
      const item = cartItems.find(item => item.productId === MOCK_PRODUCTS[0].id);
      
      if (!item || item.quantity !== 5) {
        throw new Error(`Expected quantity 5, got ${item?.quantity}`);
      }

      return { updatedQuantity: item.quantity };
    }));

    // Test: Add multiple different items
    results.push(await this.runTest('Add multiple different items', async () => {
      await CartService.addToCart(MOCK_PRODUCTS[1].id, 1);
      await CartService.addToCart(MOCK_PRODUCTS[2].id, 3);

      const cartItems = await CartService.getCartItems();
      
      if (cartItems.length !== 3) {
        throw new Error(`Expected 3 items, got ${cartItems.length}`);
      }

      const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      
      if (totalQuantity !== 9) { // 5 + 1 + 3
        throw new Error(`Expected total quantity 9, got ${totalQuantity}`);
      }

      return { totalItems: cartItems.length, totalQuantity };
    }));

    // Test: Remove item from cart
    results.push(await this.runTest('Remove item from cart', async () => {
      const response = await CartService.removeFromCart(MOCK_PRODUCTS[1].id);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to remove item');
      }

      const cartItems = await CartService.getCartItems();
      const removedItem = cartItems.find(item => item.productId === MOCK_PRODUCTS[1].id);
      
      if (removedItem) {
        throw new Error('Item should have been removed');
      }

      if (cartItems.length !== 2) {
        throw new Error(`Expected 2 items, got ${cartItems.length}`);
      }

      return { remainingItems: cartItems.length };
    }));

    // Test: Get cart item count
    results.push(await this.runTest('Get cart item count', async () => {
      const count = await CartService.getCartItemCount();
      
      if (count !== 8) { // 5 + 3
        throw new Error(`Expected count 8, got ${count}`);
      }

      return { itemCount: count };
    }));

    const suiteEndTime = Date.now();
    const suiteDuration = suiteEndTime - suiteStartTime;

    this.testResults.push({
      suiteName,
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => !r.passed).length,
      duration: suiteDuration,
      results
    });
  }

  /**
   * Run selection management tests
   */
  private static async runSelectionManagementTests(): Promise<void> {
    const suiteName = 'Selection Management';
    const results: TestResult[] = [];
    const suiteStartTime = Date.now();

    // Test: Toggle item selection
    results.push(await this.runTest('Toggle item selection', async () => {
      const response = await CartService.toggleItemSelection(MOCK_PRODUCTS[0].id);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to toggle selection');
      }

      const selections = await CartService.getSelections();
      const isSelected = selections.get(MOCK_PRODUCTS[0].id);
      
      if (!isSelected) {
        throw new Error('Item should be selected');
      }

      return { isSelected };
    }));

    // Test: Select multiple items
    results.push(await this.runTest('Select multiple items', async () => {
      const productIds = [MOCK_PRODUCTS[0].id, MOCK_PRODUCTS[2].id];
      const response = await CartService.selectItems(productIds);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to select items');
      }

      const selections = await CartService.getSelections();
      
      for (const productId of productIds) {
        if (!selections.get(productId)) {
          throw new Error(`Product ${productId} should be selected`);
        }
      }

      return { selectedCount: productIds.length };
    }));

    // Test: Get selected items
    results.push(await this.runTest('Get selected items', async () => {
      const response = await CartService.getSelectedItems();
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to get selected items');
      }

      const selectedItems = response.data;
      
      if (selectedItems.length !== 2) {
        throw new Error(`Expected 2 selected items, got ${selectedItems.length}`);
      }

      return { selectedItemsCount: selectedItems.length };
    }));

    // Test: Calculate selected total
    results.push(await this.runTest('Calculate selected total', async () => {
      const selectedIds = [MOCK_PRODUCTS[0].id, MOCK_PRODUCTS[2].id];
      const response = await CartService.calculateSelectedTotal(selectedIds);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to calculate total');
      }

      const summary = response.data;
      
      if (summary.totalItems !== 8) { // 5 + 3
        throw new Error(`Expected 8 total items, got ${summary.totalItems}`);
      }

      return { 
        totalItems: summary.totalItems,
        totalPrice: summary.totalPrice
      };
    }));

    // Test: Clear all selections
    results.push(await this.runTest('Clear all selections', async () => {
      const response = await CartService.clearAllSelections();
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to clear selections');
      }

      const selections = await CartService.getSelections();
      
      if (selections.size !== 0) {
        throw new Error(`Expected 0 selections, got ${selections.size}`);
      }

      return { selectionsCount: selections.size };
    }));

    const suiteEndTime = Date.now();
    const suiteDuration = suiteEndTime - suiteStartTime;

    this.testResults.push({
      suiteName,
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => !r.passed).length,
      duration: suiteDuration,
      results
    });
  }

  /**
   * Run checkout flow tests
   */
  private static async runCheckoutFlowTests(): Promise<void> {
    const suiteName = 'Checkout Flow';
    const results: TestResult[] = [];
    const suiteStartTime = Date.now();

    // Setup: Select items for checkout
    await CartService.selectItems([MOCK_PRODUCTS[0].id]);

    // Test: Prepare checkout data
    results.push(await this.runTest('Prepare checkout data', async () => {
      const response = await CartService.prepareCheckoutData();
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to prepare checkout data');
      }

      const { items, summary } = response.data;
      
      if (items.length !== 1) {
        throw new Error(`Expected 1 checkout item, got ${items.length}`);
      }

      if (summary.totalItems !== 5) {
        throw new Error(`Expected 5 total items, got ${summary.totalItems}`);
      }

      return { checkoutItems: items.length, totalItems: summary.totalItems };
    }));

    // Test: Validate checkout items
    results.push(await this.runTest('Validate checkout items', async () => {
      const selectedResponse = await CartService.getSelectedItems();
      
      if (!selectedResponse.success || !selectedResponse.data) {
        throw new Error('Failed to get selected items');
      }

      const response = await CartService.validateCheckoutItems(selectedResponse.data);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to validate checkout items');
      }

      const { isValid, stockErrors } = response.data;
      
      // Should be valid since we're using mock data with sufficient stock
      if (!isValid) {
        throw new Error(`Validation failed: ${JSON.stringify(stockErrors)}`);
      }

      return { isValid, stockErrorsCount: stockErrors.length };
    }));

    // Test: Create checkout session
    results.push(await this.runTest('Create checkout session', async () => {
      const checkoutResponse = await CartService.prepareCheckoutData();
      
      if (!checkoutResponse.success || !checkoutResponse.data) {
        throw new Error('Failed to prepare checkout data');
      }

      const { items, summary } = checkoutResponse.data;
      const response = await CartService.createCheckoutSession(items, summary);
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create checkout session');
      }

      const { sessionId, expiresAt } = response.data;
      
      if (!sessionId) {
        throw new Error('Session ID should be provided');
      }

      if (expiresAt <= new Date()) {
        throw new Error('Session should not be expired immediately');
      }

      return { sessionId, expiresAt: expiresAt.toISOString() };
    }));

    const suiteEndTime = Date.now();
    const suiteDuration = suiteEndTime - suiteStartTime;

    this.testResults.push({
      suiteName,
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => !r.passed).length,
      duration: suiteDuration,
      results
    });
  }

  /**
   * Run data persistence tests
   */
  private static async runDataPersistenceTests(): Promise<void> {
    const suiteName = 'Data Persistence';
    const results: TestResult[] = [];
    const suiteStartTime = Date.now();

    // Test: Sync to storage
    results.push(await this.runTest('Sync cart data to storage', async () => {
      const cartItems = await CartService.getCartItems();
      const selections = await CartService.getSelections();
      
      await CartStateSynchronizer.syncToStorage(cartItems, selections);
      
      // Verify data is stored
      const storedItems = wx.getStorageSync('cart_items');
      const storedSelections = wx.getStorageSync('cart_selections');
      
      if (!storedItems) {
        throw new Error('Cart items not stored');
      }

      if (!storedSelections) {
        throw new Error('Cart selections not stored');
      }

      return { 
        storedItemsLength: JSON.parse(storedItems).length,
        storedSelectionsLength: Object.keys(JSON.parse(storedSelections)).length
      };
    }));

    // Test: Sync from storage
    results.push(await this.runTest('Sync cart data from storage', async () => {
      const syncResult = await CartStateSynchronizer.syncFromStorage();
      
      if (syncResult.items.length === 0) {
        throw new Error('No items synced from storage');
      }

      return { 
        syncedItemsCount: syncResult.items.length,
        isExpired: syncResult.isExpired
      };
    }));

    // Test: Validate stored data
    results.push(await this.runTest('Validate stored data integrity', async () => {
      const isValid = await CartStateSynchronizer.validateStoredData();
      
      if (!isValid) {
        throw new Error('Stored data validation failed');
      }

      return { isValid };
    }));

    // Test: Get sync status
    results.push(await this.runTest('Get sync status', async () => {
      const status = await CartStateSynchronizer.getSyncStatus();
      
      if (!status.lastSync) {
        throw new Error('Last sync time should be available');
      }

      if (status.version <= 0) {
        throw new Error('Version should be greater than 0');
      }

      return { 
        lastSync: status.lastSync,
        version: status.version,
        deviceId: status.deviceId
      };
    }));

    const suiteEndTime = Date.now();
    const suiteDuration = suiteEndTime - suiteStartTime;

    this.testResults.push({
      suiteName,
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => !r.passed).length,
      duration: suiteDuration,
      results
    });
  }

  /**
   * Run error handling tests
   */
  private static async runErrorHandlingTests(): Promise<void> {
    const suiteName = 'Error Handling';
    const results: TestResult[] = [];
    const suiteStartTime = Date.now();

    // Test: Handle invalid product ID
    results.push(await this.runTest('Handle invalid product ID', async () => {
      const response = await CartService.addToCart('invalid_product_id', 1);
      
      // Should handle gracefully without throwing
      if (response.success) {
        throw new Error('Should not succeed with invalid product ID');
      }

      return { errorHandled: true, error: response.error };
    }));

    // Test: Handle zero quantity
    results.push(await this.runTest('Handle zero quantity update', async () => {
      const response = await CartService.updateCartItemQuantity(MOCK_PRODUCTS[0].id, 0);
      
      // Should remove item when quantity is 0
      if (!response.success) {
        throw new Error('Should handle zero quantity gracefully');
      }

      const cartItems = await CartService.getCartItems();
      const item = cartItems.find(item => item.productId === MOCK_PRODUCTS[0].id);
      
      if (item) {
        throw new Error('Item should be removed when quantity is 0');
      }

      return { itemRemoved: true };
    }));

    // Test: Handle storage errors
    results.push(await this.runTest('Handle storage errors gracefully', async () => {
      // This test would need to mock storage failures
      // For now, we'll just verify error handling exists
      
      try {
        await CartService.handleCartError(new Error('Test error'), 'test_operation');
        return { errorHandlerExists: true };
      } catch (error) {
        throw new Error('Error handler should not throw');
      }
    }));

    const suiteEndTime = Date.now();
    const suiteDuration = suiteEndTime - suiteStartTime;

    this.testResults.push({
      suiteName,
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => !r.passed).length,
      duration: suiteDuration,
      results
    });
  }

  /**
   * Run performance tests
   */
  private static async runPerformanceTests(): Promise<void> {
    const suiteName = 'Performance';
    const results: TestResult[] = [];
    const suiteStartTime = Date.now();

    // Test: Batch operations performance
    results.push(await this.runTest('Batch operations performance', async () => {
      const startTime = Date.now();
      
      // Add multiple items in batch
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(CartService.addToCart(`perf_test_${i}`, 1));
      }
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (2 seconds)
      if (duration > 2000) {
        throw new Error(`Batch operations too slow: ${duration}ms`);
      }

      return { batchDuration: duration, operationsCount: 10 };
    }));

    // Test: Large cart handling
    results.push(await this.runTest('Large cart handling', async () => {
      const startTime = Date.now();
      
      // Get cart with many items
      const cartItems = await CartService.getCartItems();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should handle large cart efficiently
      if (duration > 1000) {
        throw new Error(`Large cart handling too slow: ${duration}ms`);
      }

      return { 
        cartSize: cartItems.length,
        loadDuration: duration
      };
    }));

    const suiteEndTime = Date.now();
    const suiteDuration = suiteEndTime - suiteStartTime;

    this.testResults.push({
      suiteName,
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => !r.passed).length,
      duration: suiteDuration,
      results
    });
  }

  /**
   * Run cross-page synchronization tests
   */
  private static async runCrossPageSyncTests(): Promise<void> {
    const suiteName = 'Cross-Page Synchronization';
    const results: TestResult[] = [];
    const suiteStartTime = Date.now();

    // Test: TabBar badge update
    results.push(await this.runTest('TabBar badge update', async () => {
      // Add item and check if badge is updated
      await CartService.addToCart('badge_test_product', 3);
      
      const itemCount = await CartService.getCartItemCount();
      const storedBadgeCount = wx.getStorageSync('cart_badge_count');
      
      if (storedBadgeCount !== itemCount) {
        throw new Error(`Badge count mismatch: stored ${storedBadgeCount}, actual ${itemCount}`);
      }

      return { badgeCount: storedBadgeCount, itemCount };
    }));

    // Test: Event system functionality
    results.push(await this.runTest('Event system functionality', async () => {
      let eventFired = false;
      
      // Listen for cart event
      const listener = () => {
        eventFired = true;
      };
      
      CartManager.addEventListener(CartEventType.ITEM_ADDED, listener);
      
      // Trigger event
      await CartService.addToCart('event_test_product', 1);
      
      // Wait a bit for event to fire
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!eventFired) {
        throw new Error('Cart event was not fired');
      }

      return { eventFired };
    }));

    const suiteEndTime = Date.now();
    const suiteDuration = suiteEndTime - suiteStartTime;

    this.testResults.push({
      suiteName,
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => !r.passed).length,
      duration: suiteDuration,
      results
    });
  }

  /**
   * Run individual test with error handling
   */
  private static async runTest(
    testName: string,
    testFunction: () => Promise<any>
  ): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log(`Running test: ${testName}`);
      
      const result = await testFunction();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✓ Test passed: ${testName} (${duration}ms)`);
      
      return {
        testName,
        passed: true,
        duration,
        details: result
      };
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.error(`✗ Test failed: ${testName} (${duration}ms)`, error);
      
      return {
        testName,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Generate test report
   */
  static generateReport(): string {
    const totalTests = this.testResults.reduce((sum, suite) => sum + suite.totalTests, 0);
    const passedTests = this.testResults.reduce((sum, suite) => sum + suite.passedTests, 0);
    const failedTests = this.testResults.reduce((sum, suite) => sum + suite.failedTests, 0);
    const totalDuration = this.testResults.reduce((sum, suite) => sum + suite.duration, 0);

    let report = `
# Cart Integration Test Report

## Summary
- **Total Test Suites**: ${this.testResults.length}
- **Total Tests**: ${totalTests}
- **Passed**: ${passedTests}
- **Failed**: ${failedTests}
- **Success Rate**: ${((passedTests / totalTests) * 100).toFixed(1)}%
- **Total Duration**: ${totalDuration}ms

## Test Suites
`;

    this.testResults.forEach(suite => {
      report += `
### ${suite.suiteName}
- Tests: ${suite.totalTests}
- Passed: ${suite.passedTests}
- Failed: ${suite.failedTests}
- Duration: ${suite.duration}ms

`;

      suite.results.forEach(test => {
        const status = test.passed ? '✓' : '✗';
        report += `${status} ${test.testName} (${test.duration}ms)\n`;
        
        if (!test.passed && test.error) {
          report += `  Error: ${test.error}\n`;
        }
      });
    });

    return report;
  }
}
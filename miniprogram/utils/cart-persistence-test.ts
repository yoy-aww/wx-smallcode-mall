/**
 * Cart data persistence and synchronization test utility
 * Used for testing the implementation of task 8
 */

import { CartService } from '../services/cart';
import { CartStateSynchronizer } from './cart-state-sync';
import { CartDataValidator } from './cart-data-validator';
import { CartManagerExtended } from './cart-manager';

/**
 * Test result interface
 */
interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  details?: any;
}

/**
 * Cart persistence test suite
 */
export class CartPersistenceTest {
  /**
   * Run all persistence tests
   */
  static async runAllTests(): Promise<TestResult[]> {
    console.log('Running cart persistence and synchronization tests');

    const tests = [
      this.testDataPersistence,
      this.testSelectionPersistence,
      this.testDataExpiry,
      this.testConflictResolution,
      this.testDataValidation,
      this.testSynchronization,
      this.testEventIntegration,
      this.testDataCleanup
    ];

    const results: TestResult[] = [];

    for (const test of tests) {
      try {
        const result = await test.call(this);
        results.push(result);
        console.log(`Test ${result.testName}: ${result.passed ? 'PASSED' : 'FAILED'}`);
        if (!result.passed && result.error) {
          console.error(`Error: ${result.error}`);
        }
      } catch (error) {
        results.push({
          testName: test.name,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.error(`Test ${test.name} threw exception:`, error);
      }
    }

    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;

    console.log(`\nTest Summary: ${passedTests}/${totalTests} tests passed`);

    return results;
  }

  /**
   * Test data persistence functionality
   */
  static async testDataPersistence(): Promise<TestResult> {
    try {
      // Clear existing data
      await CartService.clearCart();

      // Add test items
      const testProductId = 'test_product_1';
      await CartService.addToCart(testProductId, 2);

      // Get items and verify
      const items = await CartService.getCartItems();
      
      if (items.length !== 1 || items[0].productId !== testProductId || items[0].quantity !== 2) {
        return {
          testName: 'testDataPersistence',
          passed: false,
          error: 'Cart items not persisted correctly',
          details: { items }
        };
      }

      // Test persistence after restart simulation
      const syncResult = await CartStateSynchronizer.syncFromStorage();
      
      if (syncResult.items.length !== 1 || syncResult.items[0].productId !== testProductId) {
        return {
          testName: 'testDataPersistence',
          passed: false,
          error: 'Cart items not restored from storage correctly',
          details: { syncResult }
        };
      }

      return {
        testName: 'testDataPersistence',
        passed: true
      };
    } catch (error) {
      return {
        testName: 'testDataPersistence',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test selection persistence functionality
   */
  static async testSelectionPersistence(): Promise<TestResult> {
    try {
      // Clear existing data
      await CartService.clearCart();
      await CartService.clearAllSelections();

      // Add test items
      const testProductId1 = 'test_product_1';
      const testProductId2 = 'test_product_2';
      await CartService.addToCart(testProductId1, 1);
      await CartService.addToCart(testProductId2, 1);

      // Select first item
      await CartService.toggleItemSelection(testProductId1);

      // Get selections and verify
      const selections = await CartService.getSelections();
      
      if (!selections.get(testProductId1) || selections.get(testProductId2)) {
        return {
          testName: 'testSelectionPersistence',
          passed: false,
          error: 'Selection state not persisted correctly',
          details: { selections: Object.fromEntries(selections) }
        };
      }

      // Test persistence after restart simulation
      const syncResult = await CartStateSynchronizer.syncFromStorage();
      
      if (!syncResult.selections.get(testProductId1) || syncResult.selections.get(testProductId2)) {
        return {
          testName: 'testSelectionPersistence',
          passed: false,
          error: 'Selection state not restored from storage correctly',
          details: { selections: Object.fromEntries(syncResult.selections) }
        };
      }

      return {
        testName: 'testSelectionPersistence',
        passed: true
      };
    } catch (error) {
      return {
        testName: 'testSelectionPersistence',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test data expiry validation
   */
  static async testDataExpiry(): Promise<TestResult> {
    try {
      // Create test item with old timestamp
      const oldDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 days ago
      const testItem: CartItem = {
        productId: 'test_product_expired',
        quantity: 1,
        selectedAt: oldDate
      };

      // Test expiry validation
      const isExpired = await CartDataValidator.validateDataExpiry(oldDate.getTime());
      
      if (!isExpired) {
        return {
          testName: 'testDataExpiry',
          passed: false,
          error: 'Data expiry validation failed - should be expired',
          details: { oldDate, isExpired }
        };
      }

      // Test validation report
      const report = await CartDataValidator.generateValidationReport([testItem]);
      
      if (report.expiredItems !== 1) {
        return {
          testName: 'testDataExpiry',
          passed: false,
          error: 'Validation report incorrect for expired items',
          details: { report }
        };
      }

      return {
        testName: 'testDataExpiry',
        passed: true
      };
    } catch (error) {
      return {
        testName: 'testDataExpiry',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test conflict resolution
   */
  static async testConflictResolution(): Promise<TestResult> {
    try {
      // Create conflicting data scenarios
      const localSelections = new Map([
        ['product1', true],
        ['product2', false]
      ]);

      const remoteSelections = new Map([
        ['product1', false],
        ['product2', true],
        ['product3', true]
      ]);

      // Test selection conflict resolution
      await CartStateSynchronizer.syncSelections(localSelections);
      const resolvedSelections = await CartStateSynchronizer.getSelections();

      // Should contain merged selections (local takes precedence)
      if (!resolvedSelections.get('product1') || !resolvedSelections.get('product2')) {
        return {
          testName: 'testConflictResolution',
          passed: false,
          error: 'Selection conflict resolution failed',
          details: { 
            local: Object.fromEntries(localSelections),
            resolved: Object.fromEntries(resolvedSelections)
          }
        };
      }

      return {
        testName: 'testConflictResolution',
        passed: true
      };
    } catch (error) {
      return {
        testName: 'testConflictResolution',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test data validation functionality
   */
  static async testDataValidation(): Promise<TestResult> {
    try {
      // Test data integrity validation
      const validData = [
        {
          productId: 'valid_product',
          quantity: 2,
          selectedAt: new Date()
        }
      ];

      const invalidData = [
        {
          productId: '', // Invalid
          quantity: 0,   // Invalid
          selectedAt: 'invalid_date' // Invalid
        }
      ];

      const validResult = await CartDataValidator.validateDataIntegrity(validData);
      const invalidResult = await CartDataValidator.validateDataIntegrity(invalidData);

      if (!validResult || invalidResult) {
        return {
          testName: 'testDataValidation',
          passed: false,
          error: 'Data integrity validation failed',
          details: { validResult, invalidResult }
        };
      }

      return {
        testName: 'testDataValidation',
        passed: true
      };
    } catch (error) {
      return {
        testName: 'testDataValidation',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test synchronization functionality
   */
  static async testSynchronization(): Promise<TestResult> {
    try {
      // Initialize synchronizer
      await CartStateSynchronizer.initialize();

      // Test sync status
      const syncStatus = await CartStateSynchronizer.getSyncStatus();
      
      if (!syncStatus.deviceId || syncStatus.version < 0) {
        return {
          testName: 'testSynchronization',
          passed: false,
          error: 'Sync status invalid',
          details: { syncStatus }
        };
      }

      // Test sync to storage
      const testItems: CartItem[] = [{
        productId: 'sync_test_product',
        quantity: 1,
        selectedAt: new Date()
      }];

      const testSelections = new Map([['sync_test_product', true]]);

      await CartStateSynchronizer.syncToStorage(testItems, testSelections);

      // Test sync from storage
      const syncResult = await CartStateSynchronizer.syncFromStorage();
      
      if (syncResult.items.length !== 1 || !syncResult.selections.get('sync_test_product')) {
        return {
          testName: 'testSynchronization',
          passed: false,
          error: 'Synchronization failed',
          details: { syncResult }
        };
      }

      return {
        testName: 'testSynchronization',
        passed: true
      };
    } catch (error) {
      return {
        testName: 'testSynchronization',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test event system integration
   */
  static async testEventIntegration(): Promise<TestResult> {
    try {
      let eventReceived = false;
      let eventData: any = null;

      // Set up event listener
      const { CartManager, CartEventType } = await import('./cart-manager');
      
      const testListener = (data: any) => {
        eventReceived = true;
        eventData = data;
      };

      CartManager.addEventListener(CartEventType.ITEM_ADDED, testListener);

      // Trigger event through cart service
      await CartService.addToCart('event_test_product', 1);

      // Wait a bit for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Clean up listener
      CartManager.removeEventListener(CartEventType.ITEM_ADDED, testListener);

      if (!eventReceived || !eventData || eventData.productId !== 'event_test_product') {
        return {
          testName: 'testEventIntegration',
          passed: false,
          error: 'Event integration failed',
          details: { eventReceived, eventData }
        };
      }

      return {
        testName: 'testEventIntegration',
        passed: true
      };
    } catch (error) {
      return {
        testName: 'testEventIntegration',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test data cleanup functionality
   */
  static async testDataCleanup(): Promise<TestResult> {
    try {
      // Create test data with mixed validity
      const testItems: CartItem[] = [
        {
          productId: 'valid_product',
          quantity: 2,
          selectedAt: new Date()
        },
        {
          productId: 'expired_product',
          quantity: 1,
          selectedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
        }
      ];

      // Perform data cleanup
      const cleanupResult = await CartDataValidator.performDataCleanup(testItems);

      // Should have cleaned up expired items
      if (cleanupResult.cleanedItems.length >= testItems.length) {
        return {
          testName: 'testDataCleanup',
          passed: false,
          error: 'Data cleanup did not remove expired items',
          details: { cleanupResult }
        };
      }

      // Test maintenance function
      const maintenanceResult = await CartService.performDataMaintenance();
      
      if (!maintenanceResult.success) {
        return {
          testName: 'testDataCleanup',
          passed: false,
          error: 'Data maintenance failed',
          details: { maintenanceResult }
        };
      }

      return {
        testName: 'testDataCleanup',
        passed: true
      };
    } catch (error) {
      return {
        testName: 'testDataCleanup',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Clean up test data
   */
  static async cleanupTestData(): Promise<void> {
    try {
      console.log('Cleaning up test data');
      
      await CartService.clearCart();
      await CartService.clearAllSelections();
      await CartDataValidator.clearPriceCache();
      
      // Clear test storage keys
      const storageInfo = wx.getStorageInfoSync();
      const testKeys = storageInfo.keys.filter(key => 
        key.includes('test') || key.includes('sync_test') || key.includes('event_test')
      );
      
      testKeys.forEach(key => {
        wx.removeStorageSync(key);
      });

      console.log('Test data cleanup completed');
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  }

  /**
   * Generate test report
   */
  static generateTestReport(results: TestResult[]): string {
    const passedTests = results.filter(r => r.passed);
    const failedTests = results.filter(r => !r.passed);

    let report = '\n=== Cart Persistence Test Report ===\n';
    report += `Total Tests: ${results.length}\n`;
    report += `Passed: ${passedTests.length}\n`;
    report += `Failed: ${failedTests.length}\n`;
    report += `Success Rate: ${((passedTests.length / results.length) * 100).toFixed(1)}%\n\n`;

    if (failedTests.length > 0) {
      report += 'Failed Tests:\n';
      failedTests.forEach(test => {
        report += `- ${test.testName}: ${test.error}\n`;
      });
    }

    report += '\nPassed Tests:\n';
    passedTests.forEach(test => {
      report += `- ${test.testName}\n`;
    });

    return report;
  }
}

/**
 * Quick test runner for development
 */
export async function runCartPersistenceTests(): Promise<void> {
  console.log('Starting cart persistence tests...');
  
  try {
    const results = await CartPersistenceTest.runAllTests();
    const report = CartPersistenceTest.generateTestReport(results);
    
    console.log(report);
    
    // Clean up after tests
    await CartPersistenceTest.cleanupTestData();
    
  } catch (error) {
    console.error('Error running cart persistence tests:', error);
  }
}
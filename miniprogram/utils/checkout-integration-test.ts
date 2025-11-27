// utils/checkout-integration-test.ts
/**
 * Checkout integration test utilities
 * Tests the complete checkout flow from cart to order submission
 */

import { CartService } from '../services/cart';
import { ProductService } from '../services/product';

/**
 * Test result interface
 */
interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Checkout integration test class
 */
export class CheckoutIntegrationTest {
  /**
   * Run complete checkout flow test
   */
  static async runCompleteTest(): Promise<TestResult> {
    try {
      console.log('Starting checkout integration test');

      // Step 1: Add test products to cart
      const addResult = await this.testAddProductsToCart();
      if (!addResult.success) {
        return addResult;
      }

      // Step 2: Select products for checkout
      const selectResult = await this.testProductSelection();
      if (!selectResult.success) {
        return selectResult;
      }

      // Step 3: Prepare checkout data
      const prepareResult = await this.testCheckoutPreparation();
      if (!prepareResult.success) {
        return prepareResult;
      }

      // Step 4: Validate stock
      const stockResult = await this.testStockValidation();
      if (!stockResult.success) {
        return stockResult;
      }

      // Step 5: Create checkout session
      const sessionResult = await this.testCheckoutSession();
      if (!sessionResult.success) {
        return sessionResult;
      }

      // Step 6: Test session persistence
      const persistenceResult = await this.testSessionPersistence();
      if (!persistenceResult.success) {
        return persistenceResult;
      }

      console.log('Checkout integration test completed successfully');

      return {
        success: true,
        message: '结算流程集成测试通过',
        details: {
          steps: [
            'Add products to cart',
            'Select products',
            'Prepare checkout data',
            'Validate stock',
            'Create checkout session',
            'Test session persistence'
          ]
        }
      };

    } catch (error) {
      console.error('Checkout integration test failed:', error);
      return {
        success: false,
        message: '结算流程集成测试失败',
        details: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * Test adding products to cart
   */
  private static async testAddProductsToCart(): Promise<TestResult> {
    try {
      console.log('Testing add products to cart');

      // Clear cart first
      await CartService.clearCart();

      // Add test products
      const testProducts = ['product_1', 'product_2', 'product_3'];
      
      for (const productId of testProducts) {
        const result = await CartService.addToCart(productId, 2);
        
        if (!result.success) {
          return {
            success: false,
            message: `添加商品 ${productId} 到购物车失败`,
            details: result.error
          };
        }
      }

      // Verify cart contents
      const cartItems = await CartService.getCartItems();
      
      if (cartItems.length !== testProducts.length) {
        return {
          success: false,
          message: '购物车商品数量不正确',
          details: { expected: testProducts.length, actual: cartItems.length }
        };
      }

      console.log('Add products to cart test passed');
      return { success: true, message: '添加商品到购物车测试通过' };

    } catch (error) {
      return {
        success: false,
        message: '添加商品到购物车测试失败',
        details: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * Test product selection
   */
  private static async testProductSelection(): Promise<TestResult> {
    try {
      console.log('Testing product selection');

      // Get cart items
      const cartItems = await CartService.getCartItems();
      
      if (cartItems.length === 0) {
        return {
          success: false,
          message: '购物车为空，无法测试商品选择'
        };
      }

      // Select first two products
      const selectedIds = cartItems.slice(0, 2).map(item => item.productId);
      
      const selectResult = await CartService.selectItems(selectedIds);
      
      if (!selectResult.success) {
        return {
          success: false,
          message: '选择商品失败',
          details: selectResult.error
        };
      }

      // Verify selection
      const selectedItems = await CartService.getSelectedItems();
      
      if (!selectedItems.success || !selectedItems.data) {
        return {
          success: false,
          message: '获取选中商品失败',
          details: selectedItems.error
        };
      }

      if (selectedItems.data.length !== selectedIds.length) {
        return {
          success: false,
          message: '选中商品数量不正确',
          details: { expected: selectedIds.length, actual: selectedItems.data.length }
        };
      }

      console.log('Product selection test passed');
      return { success: true, message: '商品选择测试通过' };

    } catch (error) {
      return {
        success: false,
        message: '商品选择测试失败',
        details: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * Test checkout preparation
   */
  private static async testCheckoutPreparation(): Promise<TestResult> {
    try {
      console.log('Testing checkout preparation');

      const prepareResult = await CartService.prepareCheckoutData();
      
      if (!prepareResult.success || !prepareResult.data) {
        return {
          success: false,
          message: '准备结算数据失败',
          details: prepareResult.error
        };
      }

      const { items, summary, validationResult } = prepareResult.data;

      // Verify data structure
      if (!Array.isArray(items) || items.length === 0) {
        return {
          success: false,
          message: '结算商品列表无效'
        };
      }

      if (!summary || typeof summary.finalPrice !== 'number') {
        return {
          success: false,
          message: '价格汇总数据无效'
        };
      }

      if (!validationResult) {
        return {
          success: false,
          message: '验证结果数据无效'
        };
      }

      console.log('Checkout preparation test passed');
      return { 
        success: true, 
        message: '结算数据准备测试通过',
        details: { itemCount: items.length, totalPrice: summary.finalPrice }
      };

    } catch (error) {
      return {
        success: false,
        message: '结算数据准备测试失败',
        details: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * Test stock validation
   */
  private static async testStockValidation(): Promise<TestResult> {
    try {
      console.log('Testing stock validation');

      const selectedItems = await CartService.getSelectedItems();
      
      if (!selectedItems.success || !selectedItems.data) {
        return {
          success: false,
          message: '获取选中商品失败'
        };
      }

      const validationResult = await CartService.validateCheckoutItems(selectedItems.data);
      
      if (!validationResult.success || !validationResult.data) {
        return {
          success: false,
          message: '库存验证失败',
          details: validationResult.error
        };
      }

      const { isValid, stockErrors } = validationResult.data;

      console.log('Stock validation result:', { isValid, errorCount: stockErrors.length });

      console.log('Stock validation test passed');
      return { 
        success: true, 
        message: '库存验证测试通过',
        details: { isValid, errorCount: stockErrors.length }
      };

    } catch (error) {
      return {
        success: false,
        message: '库存验证测试失败',
        details: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * Test checkout session creation
   */
  private static async testCheckoutSession(): Promise<TestResult> {
    try {
      console.log('Testing checkout session creation');

      const selectedItems = await CartService.getSelectedItems();
      
      if (!selectedItems.success || !selectedItems.data) {
        return {
          success: false,
          message: '获取选中商品失败'
        };
      }

      const selectedIds = selectedItems.data.map(item => item.productId);
      const summaryResult = await CartService.calculateSelectedTotal(selectedIds);
      
      if (!summaryResult.success || !summaryResult.data) {
        return {
          success: false,
          message: '计算价格汇总失败'
        };
      }

      const sessionResult = await CartService.createCheckoutSession(
        selectedItems.data,
        summaryResult.data
      );
      
      if (!sessionResult.success || !sessionResult.data) {
        return {
          success: false,
          message: '创建结算会话失败',
          details: sessionResult.error
        };
      }

      const { sessionId, expiresAt } = sessionResult.data;

      if (!sessionId || !expiresAt) {
        return {
          success: false,
          message: '结算会话数据无效'
        };
      }

      console.log('Checkout session created:', sessionId);
      console.log('Session expires at:', expiresAt);

      console.log('Checkout session test passed');
      return { 
        success: true, 
        message: '结算会话创建测试通过',
        details: { sessionId, expiresAt }
      };

    } catch (error) {
      return {
        success: false,
        message: '结算会话创建测试失败',
        details: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * Test session persistence
   */
  private static async testSessionPersistence(): Promise<TestResult> {
    try {
      console.log('Testing session persistence');

      // Create a test session first
      const selectedItems = await CartService.getSelectedItems();
      
      if (!selectedItems.success || !selectedItems.data) {
        return {
          success: false,
          message: '获取选中商品失败'
        };
      }

      const selectedIds = selectedItems.data.map(item => item.productId);
      const summaryResult = await CartService.calculateSelectedTotal(selectedIds);
      
      if (!summaryResult.success || !summaryResult.data) {
        return {
          success: false,
          message: '计算价格汇总失败'
        };
      }

      const sessionResult = await CartService.createCheckoutSession(
        selectedItems.data,
        summaryResult.data
      );
      
      if (!sessionResult.success || !sessionResult.data) {
        return {
          success: false,
          message: '创建测试会话失败'
        };
      }

      const { sessionId } = sessionResult.data;

      // Test retrieving the session
      const retrieveResult = await CartService.getCheckoutSession(sessionId);
      
      if (!retrieveResult.success) {
        return {
          success: false,
          message: '获取结算会话失败',
          details: retrieveResult.error
        };
      }

      if (!retrieveResult.data) {
        return {
          success: false,
          message: '结算会话数据为空'
        };
      }

      const sessionData = retrieveResult.data;

      // Verify session data
      if (!sessionData.items || sessionData.items.length === 0) {
        return {
          success: false,
          message: '会话商品数据无效'
        };
      }

      if (!sessionData.summary || typeof sessionData.summary.finalPrice !== 'number') {
        return {
          success: false,
          message: '会话价格数据无效'
        };
      }

      // Test clearing the session
      const clearResult = await CartService.clearCheckoutSession(sessionId);
      
      if (!clearResult.success) {
        return {
          success: false,
          message: '清理结算会话失败',
          details: clearResult.error
        };
      }

      // Verify session is cleared
      const verifyResult = await CartService.getCheckoutSession(sessionId);
      
      if (verifyResult.success && verifyResult.data !== null) {
        return {
          success: false,
          message: '结算会话未正确清理'
        };
      }

      console.log('Session persistence test passed');
      return { 
        success: true, 
        message: '会话持久化测试通过',
        details: { sessionId }
      };

    } catch (error) {
      return {
        success: false,
        message: '会话持久化测试失败',
        details: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * Test stock error scenario
   */
  static async testStockErrorScenario(): Promise<TestResult> {
    try {
      console.log('Testing stock error scenario');

      // Clear cart and add a product with low stock
      await CartService.clearCart();
      
      // Add product_3 which has low stock (5 items)
      const addResult = await CartService.addToCart('product_3', 10); // Request more than available
      
      if (addResult.success) {
        return {
          success: false,
          message: '应该因库存不足而失败，但操作成功了'
        };
      }

      // Add valid quantity
      const validAddResult = await CartService.addToCart('product_3', 3);
      
      if (!validAddResult.success) {
        return {
          success: false,
          message: '添加有效数量的商品失败',
          details: validAddResult.error
        };
      }

      // Select the product
      await CartService.selectItems(['product_3']);

      // Get selected items
      const selectedItems = await CartService.getSelectedItems();
      
      if (!selectedItems.success || !selectedItems.data) {
        return {
          success: false,
          message: '获取选中商品失败'
        };
      }

      // Manually modify quantity to exceed stock for testing
      const testItems = selectedItems.data.map(item => ({
        ...item,
        quantity: 10 // Exceed available stock
      }));

      // Test stock validation
      const validationResult = await CartService.validateCheckoutItems(testItems);
      
      if (!validationResult.success || !validationResult.data) {
        return {
          success: false,
          message: '库存验证失败',
          details: validationResult.error
        };
      }

      const { isValid, stockErrors } = validationResult.data;

      if (isValid || stockErrors.length === 0) {
        return {
          success: false,
          message: '应该检测到库存错误，但验证通过了'
        };
      }

      console.log('Stock error scenario test passed');
      return { 
        success: true, 
        message: '库存错误场景测试通过',
        details: { errorCount: stockErrors.length, errors: stockErrors }
      };

    } catch (error) {
      return {
        success: false,
        message: '库存错误场景测试失败',
        details: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * Clean up test data
   */
  static async cleanup(): Promise<void> {
    try {
      console.log('Cleaning up test data');
      
      await CartService.clearCart();
      await CartService.clearAllSelections();
      
      // Clear any test sessions
      const testSessionIds = ['test_session_1', 'test_session_2'];
      
      for (const sessionId of testSessionIds) {
        await CartService.clearCheckoutSession(sessionId);
      }

      console.log('Test data cleanup completed');
      
    } catch (error) {
      console.error('Failed to cleanup test data:', error);
    }
  }
}
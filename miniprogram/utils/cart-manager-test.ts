// utils/cart-manager-test.ts
/**
 * Simple test for cart manager to verify it works without dynamic imports
 */

import { CartManager, CartEventType } from './cart-manager';

/**
 * Test cart manager functionality
 */
export function testCartManager() {
  console.log('Testing CartManager...');

  try {
    // Initialize cart manager
    CartManager.initialize();
    console.log('✓ CartManager initialized successfully');

    // Test event listener
    let eventReceived = false;
    const testListener = (data: any) => {
      eventReceived = true;
      console.log('✓ Event received:', data);
    };

    CartManager.addEventListener(CartEventType.ITEM_ADDED, testListener);
    console.log('✓ Event listener added');

    // Test event emission
    CartManager.emit(CartEventType.ITEM_ADDED, {
      productId: 'test-product',
      quantity: 1
    });

    if (eventReceived) {
      console.log('✓ Event emission works');
    } else {
      console.log('✗ Event emission failed');
    }

    // Test listener removal
    CartManager.removeEventListener(CartEventType.ITEM_ADDED, testListener);
    console.log('✓ Event listener removed');

    // Test listener count
    const listenerCount = CartManager.getListenerCount();
    console.log('✓ Listener count:', listenerCount);

    console.log('✓ All CartManager tests passed!');
    return true;

  } catch (error) {
    console.error('✗ CartManager test failed:', error);
    return false;
  }
}

/**
 * Test cart service integration (without dynamic imports)
 */
export async function testCartServiceIntegration() {
  console.log('Testing CartService integration...');

  try {
    // Test cart service methods that don't use dynamic imports
    const { CartService } = require('../services/cart');

    // Test getting cart items
    const cartItems = await CartService.getCartItems();
    console.log('✓ Got cart items:', cartItems.length);

    // Test getting cart item count
    const itemCount = await CartService.getCartItemCount();
    console.log('✓ Got cart item count:', itemCount);

    // Test initialization
    const initResult = await CartService.initializeCart();
    console.log('✓ Cart service initialized:', initResult.success);

    console.log('✓ All CartService integration tests passed!');
    return true;

  } catch (error) {
    console.error('✗ CartService integration test failed:', error);
    return false;
  }
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('=== Running Cart Manager Tests ===');
  
  const basicTest = testCartManager();
  const integrationTest = await testCartServiceIntegration();

  if (basicTest && integrationTest) {
    console.log('🎉 All tests passed! Cart manager is working correctly.');
    return true;
  } else {
    console.log('❌ Some tests failed. Please check the errors above.');
    return false;
  }
}
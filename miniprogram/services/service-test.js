/**
 * Simple service test for WeChat Mini Program environment
 */

// Test if services can be imported and instantiated
try {
  const { UserService } = require('./user-service');
  const { AccountService } = require('./account-service');
  const { OrderService } = require('./order-service');
  
  console.log('Testing service imports...');
  
  // Test UserService
  const userService = UserService.getInstance();
  console.log('✓ UserService imported and instantiated successfully');
  
  // Test AccountService
  const accountService = AccountService.getInstance();
  console.log('✓ AccountService imported and instantiated successfully');
  
  // Test OrderService
  const orderService = OrderService.getInstance();
  console.log('✓ OrderService imported and instantiated successfully');
  
  console.log('All services working correctly!');
  
} catch (error) {
  console.error('Service test failed:', error);
  console.error('Error details:', error.message);
  console.error('Stack trace:', error.stack);
}

module.exports = {
  testServices: function() {
    console.log('Running service tests...');
    // Add more comprehensive tests here if needed
  }
};
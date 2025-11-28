/**
 * Simple test file to verify profile data validation functions
 * This is a basic test without external testing frameworks
 */

import { 
  validateUser, 
  validateAccountMetrics, 
  validateOrderCounts,
  validateApiResponse 
} from './profile-data-validator';

// Simple test runner
function runTests() {
  console.log('Running profile data validator tests...');
  
  // Test validateUser
  console.log('Testing validateUser...');
  const validUser = validateUser({
    id: '123',
    nickname: 'Test User',
    avatar: '/images/avatar.png',
    phone: '13800138000',
    membershipLevel: 'gold',
    isLoggedIn: true
  });
  console.log('Valid user test:', validUser ? 'PASS' : 'FAIL');
  
  const invalidUser = validateUser({
    id: '123',
    nickname: 'Test User',
    avatar: '/images/avatar.png',
    membershipLevel: 'invalid_level',
    isLoggedIn: true
  });
  console.log('Invalid user test:', !invalidUser ? 'PASS' : 'FAIL');
  
  // Test validateAccountMetrics
  console.log('Testing validateAccountMetrics...');
  const validMetrics = validateAccountMetrics({
    balance: 100.50,
    points: 1500,
    cards: 3,
    coupons: 5
  });
  console.log('Valid metrics test:', validMetrics ? 'PASS' : 'FAIL');
  
  const invalidMetrics = validateAccountMetrics({
    balance: -100,
    points: 1500,
    cards: 3,
    coupons: 5
  });
  console.log('Invalid metrics test:', !invalidMetrics ? 'PASS' : 'FAIL');
  
  // Test validateOrderCounts
  console.log('Testing validateOrderCounts...');
  const validOrderCounts = validateOrderCounts({
    pending_payment: 2,
    pending_shipment: 1,
    pending_receipt: 3,
    pending_review: 0,
    refund_aftersales: 1,
    total: 7
  });
  console.log('Valid order counts test:', validOrderCounts ? 'PASS' : 'FAIL');
  
  // Test validateApiResponse
  console.log('Testing validateApiResponse...');
  const validResponse = validateApiResponse({
    code: 200,
    message: 'Success',
    data: { test: 'data' }
  });
  console.log('Valid API response test:', validResponse.isValid ? 'PASS' : 'FAIL');
  
  const invalidResponse = validateApiResponse({
    code: 500,
    message: 'Internal Server Error',
    data: null
  });
  console.log('Invalid API response test:', !invalidResponse.isValid ? 'PASS' : 'FAIL');
  
  console.log('Profile data validator tests completed!');
}

// Export for potential use in other contexts
export { runTests };

// Run tests immediately
runTests();
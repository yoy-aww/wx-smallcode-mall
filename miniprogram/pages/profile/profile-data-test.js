/**
 * Simple test for profile page data handling
 */

// Mock setData function
const mockSetData = function(data) {
  console.log('Setting data:', JSON.stringify(data, null, 2));
  
  // Check for undefined values
  for (const key in data) {
    if (data[key] === undefined) {
      console.warn(`⚠️  Warning: Setting ${key} to undefined`);
    }
  }
  
  // Check userInfo specifically
  if (data.userInfo !== undefined) {
    if (data.userInfo === null) {
      console.warn('⚠️  Warning: Setting userInfo to null');
    } else if (typeof data.userInfo === 'object') {
      console.log('✅ userInfo is an object:', data.userInfo);
    } else {
      console.warn('⚠️  Warning: userInfo is not an object:', typeof data.userInfo);
    }
  }
};

// Test scenarios
console.log('Testing profile page data handling...\n');

// Test 1: User logged in
console.log('1. Testing logged in user:');
mockSetData({
  isLoggedIn: true,
  userInfo: {
    avatar: '/images/avatar.jpg',
    nickname: '测试用户',
    membershipLevel: 'gold'
  }
});

// Test 2: User not logged in (should use empty object, not null)
console.log('\n2. Testing logged out user:');
mockSetData({
  isLoggedIn: false,
  userInfo: {} // Should be empty object, not null
});

// Test 3: Error case (should use empty object, not null)
console.log('\n3. Testing error case:');
mockSetData({
  isLoggedIn: false,
  userInfo: {} // Should be empty object, not null
});

// Test 4: Invalid case - what NOT to do
console.log('\n4. Testing invalid case (what NOT to do):');
try {
  mockSetData({
    isLoggedIn: false,
    userInfo: null // This would cause the warning
  });
} catch (error) {
  console.error('Error:', error.message);
}

console.log('\nProfile data tests completed!');

module.exports = {
  runTests: function() {
    console.log('Running profile data tests...');
    // Tests would run here in a real environment
  }
};
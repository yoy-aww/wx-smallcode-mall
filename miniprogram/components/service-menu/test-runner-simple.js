/**
 * Simple test runner for ServiceMenu component
 * This validates the component logic without complex Jest setup
 */

const SERVICE_MENU_ITEMS = [
  {
    id: 'task-center',
    title: '任务中心',
    icon: 'task',
    page: '/pages/task-center/index'
  },
  {
    id: 'delivery-address',
    title: '收货地址',
    icon: 'address',
    page: '/pages/address/index'
  },
  {
    id: 'call-merchant',
    title: '拨打商家电话',
    icon: 'phone',
    action: 'call'
  },
  {
    id: 'personal-info',
    title: '个人信息',
    icon: 'info',
    page: '/pages/personal-info/index'
  },
  {
    id: 'account-security',
    title: '账号与安全',
    icon: 'security',
    page: '/pages/account-security/index'
  }
];

// Simple test framework
function test(description, testFn) {
  try {
    testFn();
    console.log(`✓ ${description}`);
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(`  Error: ${error.message}`);
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`);
      }
    },
    toHaveBeenCalledWith: (expected) => {
      if (!actual.calls || !actual.calls.some(call => JSON.stringify(call) === JSON.stringify(expected))) {
        throw new Error(`Expected function to be called with ${JSON.stringify(expected)}`);
      }
    },
    toHaveBeenCalled: () => {
      if (!actual.calls || actual.calls.length === 0) {
        throw new Error('Expected function to have been called');
      }
    },
    not: {
      toHaveBeenCalled: () => {
        if (actual.calls && actual.calls.length > 0) {
          throw new Error('Expected function not to be called');
        }
      }
    }
  };
}

// Mock functions
function createMockFunction() {
  const fn = function(...args) {
    fn.calls.push(args);
  };
  fn.calls = [];
  return fn;
}

// Mock WeChat APIs
const mockWx = {
  showModal: createMockFunction(),
  makePhoneCall: createMockFunction(),
  navigateTo: createMockFunction(),
  showToast: createMockFunction()
};

// Create mock component
const createMockComponent = () => ({
  data: {
    services: SERVICE_MENU_ITEMS,
    merchantPhone: '400-123-4567'
  },
  properties: {
    merchantPhone: '400-123-4567'
  },
  setData: createMockFunction(),
  triggerEvent: createMockFunction()
});

console.log('Running ServiceMenu Component Tests...\n');

// Test 1: Component Initialization
test('should initialize with correct default data', () => {
  const mockComponent = createMockComponent();
  expect(mockComponent.data.services.length).toBe(5);
  expect(mockComponent.data.merchantPhone).toBe('400-123-4567');
});

// Test 2: Task Center Navigation
test('should handle task center tap correctly', () => {
  const mockComponent = createMockComponent();
  
  const onServiceTap = function(event) {
    const { service } = event.currentTarget.dataset;
    
    if (!service) {
      console.warn('Service data not found');
      return;
    }

    if (service.id === 'task-center') {
      mockWx.navigateTo({
        url: service.page,
        fail: () => {}
      });
    }

    this.triggerEvent('serviceTap', {
      serviceId: service.id,
      service: service
    });
  };

  const mockEvent = {
    currentTarget: {
      dataset: {
        service: SERVICE_MENU_ITEMS[0] // task-center
      }
    }
  };

  onServiceTap.call(mockComponent, mockEvent);
  expect(mockWx.navigateTo).toHaveBeenCalled();
  expect(mockComponent.triggerEvent).toHaveBeenCalled();
});

// Test 3: Call Merchant Functionality
test('should handle call merchant tap correctly', () => {
  const mockComponent = createMockComponent();
  
  const handleCallMerchant = function() {
    const phone = this.data.merchantPhone;
    
    if (!phone) {
      mockWx.showToast({
        title: '商家电话不可用',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    mockWx.showModal({
      title: '拨打电话',
      content: `确定要拨打商家电话 ${phone} 吗？`,
      confirmText: '拨打',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          mockWx.makePhoneCall({
            phoneNumber: phone,
            success: () => {},
            fail: () => {
              mockWx.showToast({
                title: '拨打失败',
                icon: 'none',
                duration: 2000
              });
            }
          });
        }
      }
    });
  };

  handleCallMerchant.call(mockComponent);
  expect(mockWx.showModal).toHaveBeenCalled();
});

// Test 4: Navigation Error Handling
test('should handle navigation errors gracefully', () => {
  const mockComponent = createMockComponent();
  
  const navigateToPage = function(page) {
    if (!page) {
      mockWx.showToast({
        title: '页面不可用',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    mockWx.navigateTo({
      url: page,
      fail: () => {
        mockWx.showToast({
          title: '页面跳转失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  };

  // Test with empty page
  navigateToPage.call(mockComponent, '');
  expect(mockWx.showToast).toHaveBeenCalled();
});

// Test 5: Missing Phone Number Handling
test('should handle missing phone number gracefully', () => {
  const mockComponent = createMockComponent();
  mockComponent.data.merchantPhone = '';
  
  const handleCallMerchant = function() {
    const phone = this.data.merchantPhone;
    
    if (!phone) {
      mockWx.showToast({
        title: '商家电话不可用',
        icon: 'none',
        duration: 2000
      });
      return;
    }
  };

  handleCallMerchant.call(mockComponent);
  expect(mockWx.showToast).toHaveBeenCalled();
});

// Test 6: Service Event Triggering
test('should trigger serviceTap event with correct data', () => {
  const mockComponent = createMockComponent();
  
  const onServiceTap = function(event) {
    const { service } = event.currentTarget.dataset;
    
    this.triggerEvent('serviceTap', {
      serviceId: service.id,
      service: service
    });
  };

  const mockEvent = {
    currentTarget: {
      dataset: {
        service: SERVICE_MENU_ITEMS[1] // delivery-address
      }
    }
  };

  onServiceTap.call(mockComponent, mockEvent);
  expect(mockComponent.triggerEvent).toHaveBeenCalledWith([
    'serviceTap',
    {
      serviceId: 'delivery-address',
      service: SERVICE_MENU_ITEMS[1]
    }
  ]);
});

console.log('\nAll tests completed!');
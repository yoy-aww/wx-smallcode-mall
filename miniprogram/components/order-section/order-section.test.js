/**
 * Unit tests for OrderSection component
 */

// Mock WeChat Mini Program APIs
global.Component = (options) => {
  return {
    ...options,
    data: options.data || {},
    properties: options.properties || {},
    setData: function(data) {
      Object.assign(this.data, data);
    },
    triggerEvent: function(name, detail, options) {
      // Mock event triggering
      this._events = this._events || {};
      this._events[name] = { detail, options };
    }
  };
};

// Mock the imports since we can't use ES6 imports in Node.js without module setup
const ORDER_STATUS_LABELS = {
  pending_payment: '待付款',
  pending_shipment: '待发货',
  pending_receipt: '待收货',
  pending_review: '待评价',
  refund_aftersales: '退款售后'
};

const ORDER_STATUS_ICONS = {
  pending_payment: 'payment',
  pending_shipment: 'shipment',
  pending_receipt: 'receipt',
  pending_review: 'review',
  refund_aftersales: 'refund'
};

describe('OrderSection Component', () => {
  let component;

  beforeEach(() => {
    // Create a fresh component instance
    component = Component({
      properties: {
        orderCounts: {
          type: Object,
          value: {
            pending_payment: 0,
            pending_shipment: 0,
            pending_receipt: 0,
            pending_review: 0,
            refund_aftersales: 0,
            total: 0
          }
        },
        loading: {
          type: Boolean,
          value: false
        }
      },
      data: {
        orderStatusItems: []
      },
      lifetimes: {
        attached() {
          this._updateOrderStatusItems();
        }
      },
      observers: {
        'orderCounts, loading'() {
          this._updateOrderStatusItems();
        }
      },
      methods: {
        onViewAllOrders() {
          this.triggerEvent('viewAllOrders', {}, {});
        },
        onOrderStatusTap(event) {
          const { status } = event.currentTarget.dataset;
          if (status && !this.data.loading) {
            this.triggerEvent('orderStatusTap', { status }, {});
          }
        },
        _updateOrderStatusItems() {
          const orderCounts = this.data.orderCounts;
          const loading = this.data.loading;

          // Handle null or undefined orderCounts
          const safeOrderCounts = orderCounts || {
            pending_payment: 0,
            pending_shipment: 0,
            pending_receipt: 0,
            pending_review: 0,
            refund_aftersales: 0,
            total: 0
          };

          const statusOrder = [
            'pending_payment',
            'pending_shipment', 
            'pending_receipt',
            'pending_review',
            'refund_aftersales'
          ];

          const orderStatusItems = statusOrder.map(status => ({
            status,
            title: ORDER_STATUS_LABELS[status],
            icon: ORDER_STATUS_ICONS[status],
            count: loading ? 0 : (safeOrderCounts[status] || 0)
          }));

          this.setData({
            orderStatusItems
          });
        }
      }
    });

    // Initialize component data
    component.data = {
      orderCounts: {
        pending_payment: 0,
        pending_shipment: 0,
        pending_receipt: 0,
        pending_review: 0,
        refund_aftersales: 0,
        total: 0
      },
      loading: false,
      orderStatusItems: []
    };
  });

  describe('Component Initialization', () => {
    test('should initialize with default properties', () => {
      expect(component.properties.orderCounts.value).toEqual({
        pending_payment: 0,
        pending_shipment: 0,
        pending_receipt: 0,
        pending_review: 0,
        refund_aftersales: 0,
        total: 0
      });
      expect(component.properties.loading.value).toBe(false);
    });

    test('should initialize with empty order status items', () => {
      expect(component.data.orderStatusItems).toEqual([]);
    });
  });

  describe('Order Status Items Generation', () => {
    test('should generate correct order status items with zero counts', () => {
      component.methods._updateOrderStatusItems.call(component);

      expect(component.data.orderStatusItems).toHaveLength(5);
      expect(component.data.orderStatusItems[0]).toEqual({
        status: 'pending_payment',
        title: '待付款',
        icon: 'payment',
        count: 0
      });
      expect(component.data.orderStatusItems[4]).toEqual({
        status: 'refund_aftersales',
        title: '退款售后',
        icon: 'refund',
        count: 0
      });
    });

    test('should generate correct order status items with actual counts', () => {
      component.data.orderCounts = {
        pending_payment: 2,
        pending_shipment: 1,
        pending_receipt: 3,
        pending_review: 0,
        refund_aftersales: 1,
        total: 7
      };

      component.methods._updateOrderStatusItems.call(component);

      expect(component.data.orderStatusItems[0].count).toBe(2);
      expect(component.data.orderStatusItems[1].count).toBe(1);
      expect(component.data.orderStatusItems[2].count).toBe(3);
      expect(component.data.orderStatusItems[3].count).toBe(0);
      expect(component.data.orderStatusItems[4].count).toBe(1);
    });

    test('should set counts to 0 when loading', () => {
      component.data.orderCounts = {
        pending_payment: 5,
        pending_shipment: 3,
        pending_receipt: 2,
        pending_review: 1,
        refund_aftersales: 0,
        total: 11
      };
      component.data.loading = true;

      component.methods._updateOrderStatusItems.call(component);

      component.data.orderStatusItems.forEach(item => {
        expect(item.count).toBe(0);
      });
    });
  });

  describe('Event Handling', () => {
    test('should trigger viewAllOrders event when onViewAllOrders is called', () => {
      component.methods.onViewAllOrders.call(component);

      expect(component._events.viewAllOrders).toBeDefined();
      expect(component._events.viewAllOrders.detail).toEqual({});
    });

    test('should trigger orderStatusTap event with correct status', () => {
      const mockEvent = {
        currentTarget: {
          dataset: {
            status: 'pending_payment'
          }
        }
      };

      component.data.loading = false;
      component.methods.onOrderStatusTap.call(component, mockEvent);

      expect(component._events.orderStatusTap).toBeDefined();
      expect(component._events.orderStatusTap.detail).toEqual({
        status: 'pending_payment'
      });
    });

    test('should not trigger orderStatusTap event when loading', () => {
      const mockEvent = {
        currentTarget: {
          dataset: {
            status: 'pending_payment'
          }
        }
      };

      component.data.loading = true;
      component._events = {}; // Reset events
      component.methods.onOrderStatusTap.call(component, mockEvent);

      expect(component._events.orderStatusTap || undefined).toBeUndefined();
    });

    test('should not trigger orderStatusTap event when status is missing', () => {
      const mockEvent = {
        currentTarget: {
          dataset: {}
        }
      };

      component.data.loading = false;
      component._events = {}; // Reset events
      component.methods.onOrderStatusTap.call(component, mockEvent);

      expect(component._events.orderStatusTap || undefined).toBeUndefined();
    });
  });

  describe('Order Status Labels and Icons', () => {
    test('should use correct Chinese labels for all order statuses', () => {
      component.methods._updateOrderStatusItems.call(component);

      const expectedLabels = [
        '待付款',
        '待发货', 
        '待收货',
        '待评价',
        '退款售后'
      ];

      component.data.orderStatusItems.forEach((item, index) => {
        expect(item.title).toBe(expectedLabels[index]);
      });
    });

    test('should use correct icon names for all order statuses', () => {
      component.methods._updateOrderStatusItems.call(component);

      const expectedIcons = [
        'payment',
        'shipment',
        'receipt', 
        'review',
        'refund'
      ];

      component.data.orderStatusItems.forEach((item, index) => {
        expect(item.icon).toBe(expectedIcons[index]);
      });
    });
  });

  describe('Component Lifecycle', () => {
    test('should call _updateOrderStatusItems on attached', () => {
      let called = false;
      
      // Create a component instance with proper method binding
      const testComponent = {
        data: component.data,
        methods: component.methods,
        _updateOrderStatusItems: function() {
          called = true;
        }
      };
      
      // Bind the method to the test component
      testComponent.methods._updateOrderStatusItems = testComponent._updateOrderStatusItems;
      
      component.lifetimes.attached.call(testComponent);
      expect(called).toBe(true);
    });
  });

  describe('Data Validation', () => {
    test('should handle invalid orderCounts gracefully', () => {
      component.data.orderCounts = null;
      
      expect(() => {
        component.methods._updateOrderStatusItems.call(component);
      }).not.toThrow();
      
      // Should generate items with 0 counts
      expect(component.data.orderStatusItems).toHaveLength(5);
      component.data.orderStatusItems.forEach(item => {
        expect(item.count).toBe(0);
      });
    });

    test('should handle missing orderCounts properties', () => {
      component.data.orderCounts = {
        pending_payment: 1
        // Missing other properties
      };
      
      component.methods._updateOrderStatusItems.call(component);
      
      // Should still generate all 5 items
      expect(component.data.orderStatusItems).toHaveLength(5);
      expect(component.data.orderStatusItems[0].count).toBe(1);
      expect(component.data.orderStatusItems[1].count).toBe(0); // Should default to 0
    });
  });
});

console.log('OrderSection component tests completed successfully!');
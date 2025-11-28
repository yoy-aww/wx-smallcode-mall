/**
 * Unit tests for OrderService
 */

import { OrderService } from '../order-service';
import { OrderCounts, OrderStatus } from '../../models/order';

// Mock wx global object
const mockWx = {
  getStorageSync: jest.fn(),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  request: jest.fn()
};

// @ts-ignore
global.wx = mockWx;

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = OrderService.getInstance();
    jest.clearAllMocks();
  });

  describe('getOrderCounts', () => {
    it('should return cached order counts when cache is valid', async () => {
      const mockCounts: OrderCounts = {
        pending_payment: 2,
        pending_shipment: 1,
        pending_receipt: 3,
        pending_review: 1,
        refund_aftersales: 0,
        total: 7
      };

      mockWx.getStorageSync
        .mockReturnValueOnce(JSON.stringify({
          data: mockCounts,
          timestamp: Date.now()
        })) // getCachedOrderCounts
        .mockReturnValueOnce(JSON.stringify({
          data: mockCounts,
          timestamp: Date.now()
        })); // isCacheValid

      const result = await orderService.getOrderCounts('user1');
      expect(result).toEqual(mockCounts);
    });

    it('should fetch from server when cache is invalid', async () => {
      const mockCounts: OrderCounts = {
        pending_payment: 1,
        pending_shipment: 2,
        pending_receipt: 1,
        pending_review: 2,
        refund_aftersales: 1,
        total: 7
      };

      mockWx.getStorageSync
        .mockReturnValueOnce(null) // getCachedOrderCounts - no cache
        .mockReturnValueOnce('valid_token'); // API call token

      mockWx.request.mockImplementation(({ success }) => {
        success({
          statusCode: 200,
          data: {
            code: 200,
            data: mockCounts
          }
        });
      });

      const result = await orderService.getOrderCounts('user1');
      expect(result).toEqual(mockCounts);
      expect(mockWx.setStorageSync).toHaveBeenCalled();
    });

    it('should return default counts on error with no cache', async () => {
      mockWx.getStorageSync.mockReturnValue(null);
      mockWx.request.mockImplementation(({ fail }) => {
        fail({ errMsg: 'Network error' });
      });

      const result = await orderService.getOrderCounts('user1');
      expect(result).toEqual({
        pending_payment: 0,
        pending_shipment: 0,
        pending_receipt: 0,
        pending_review: 0,
        refund_aftersales: 0,
        total: 0
      });
    });

    it('should return cached counts on error when cache exists', async () => {
      const mockCounts: OrderCounts = {
        pending_payment: 2,
        pending_shipment: 1,
        pending_receipt: 3,
        pending_review: 1,
        refund_aftersales: 0,
        total: 7
      };

      mockWx.getStorageSync
        .mockReturnValueOnce(null) // getCachedOrderCounts - no cache initially
        .mockReturnValueOnce('valid_token') // API call token
        .mockReturnValueOnce(JSON.stringify({
          data: mockCounts,
          timestamp: Date.now()
        })); // fallback getCachedOrderCounts

      mockWx.request.mockImplementation(({ fail }) => {
        fail({ errMsg: 'Network error' });
      });

      const result = await orderService.getOrderCounts('user1');
      expect(result).toEqual(mockCounts);
    });
  });

  describe('getOrdersByStatus', () => {
    it('should return cached orders when cache is valid', async () => {
      const mockOrders = [
        { id: '1', status: 'pending_payment', total: 100 },
        { id: '2', status: 'pending_payment', total: 200 }
      ];

      mockWx.getStorageSync
        .mockReturnValueOnce(JSON.stringify({
          data: mockOrders,
          timestamp: Date.now()
        })) // getCachedOrders
        .mockReturnValueOnce(JSON.stringify({
          data: mockOrders,
          timestamp: Date.now()
        })); // isCacheValid

      const result = await orderService.getOrdersByStatus('user1', 'pending_payment');
      expect(result).toEqual(mockOrders);
    });

    it('should fetch from server when cache is invalid', async () => {
      const mockOrders = [
        { id: '3', status: 'pending_shipment', total: 150 }
      ];

      mockWx.getStorageSync
        .mockReturnValueOnce(null) // getCachedOrders - no cache
        .mockReturnValueOnce('valid_token'); // API call token

      mockWx.request.mockImplementation(({ success }) => {
        success({
          statusCode: 200,
          data: {
            code: 200,
            data: {
              orders: mockOrders,
              total: 1,
              page: 1,
              pageSize: 10
            }
          }
        });
      });

      const result = await orderService.getOrdersByStatus('user1', 'pending_shipment');
      expect(result).toEqual(mockOrders);
      expect(mockWx.setStorageSync).toHaveBeenCalled();
    });

    it('should return empty array on error with no cache', async () => {
      mockWx.getStorageSync.mockReturnValue(null);
      mockWx.request.mockImplementation(({ fail }) => {
        fail({ errMsg: 'Network error' });
      });

      const result = await orderService.getOrdersByStatus('user1', 'pending_payment');
      expect(result).toEqual([]);
    });

    it('should return cached orders on error when cache exists', async () => {
      const mockOrders = [
        { id: '1', status: 'pending_payment', total: 100 }
      ];

      mockWx.getStorageSync
        .mockReturnValueOnce(null) // getCachedOrders - no cache initially
        .mockReturnValueOnce('valid_token') // API call token
        .mockReturnValueOnce(JSON.stringify({
          data: mockOrders,
          timestamp: Date.now()
        })); // fallback getCachedOrders

      mockWx.request.mockImplementation(({ fail }) => {
        fail({ errMsg: 'Network error' });
      });

      const result = await orderService.getOrdersByStatus('user1', 'pending_payment');
      expect(result).toEqual(mockOrders);
    });
  });

  describe('getAllOrders', () => {
    it('should return cached orders when cache is valid', async () => {
      const mockOrders = [
        { id: '1', status: 'pending_payment', total: 100 },
        { id: '2', status: 'pending_shipment', total: 200 },
        { id: '3', status: 'completed', total: 150 }
      ];

      mockWx.getStorageSync
        .mockReturnValueOnce(JSON.stringify({
          data: mockOrders,
          timestamp: Date.now()
        })) // getCachedOrders
        .mockReturnValueOnce(JSON.stringify({
          data: mockOrders,
          timestamp: Date.now()
        })); // isCacheValid

      const result = await orderService.getAllOrders('user1');
      expect(result).toEqual(mockOrders);
    });

    it('should fetch from server when cache is invalid', async () => {
      const mockOrders = [
        { id: '1', status: 'pending_payment', total: 100 },
        { id: '2', status: 'completed', total: 200 }
      ];

      mockWx.getStorageSync
        .mockReturnValueOnce(null) // getCachedOrders - no cache
        .mockReturnValueOnce('valid_token'); // API call token

      mockWx.request.mockImplementation(({ success }) => {
        success({
          statusCode: 200,
          data: {
            code: 200,
            data: {
              orders: mockOrders,
              total: 2,
              page: 1,
              pageSize: 10
            }
          }
        });
      });

      const result = await orderService.getAllOrders('user1');
      expect(result).toEqual(mockOrders);
      expect(mockWx.setStorageSync).toHaveBeenCalled();
    });

    it('should return empty array on error with no cache', async () => {
      mockWx.getStorageSync.mockReturnValue(null);
      mockWx.request.mockImplementation(({ fail }) => {
        fail({ errMsg: 'Network error' });
      });

      const result = await orderService.getAllOrders('user1');
      expect(result).toEqual([]);
    });
  });

  describe('refreshOrderCounts', () => {
    it('should clear cache and fetch fresh data', async () => {
      const mockCounts: OrderCounts = {
        pending_payment: 3,
        pending_shipment: 2,
        pending_receipt: 1,
        pending_review: 2,
        refund_aftersales: 1,
        total: 9
      };

      mockWx.getStorageSync
        .mockReturnValueOnce(null) // getCachedOrderCounts after clear
        .mockReturnValueOnce('valid_token'); // API call token

      mockWx.request.mockImplementation(({ success }) => {
        success({
          statusCode: 200,
          data: {
            code: 200,
            data: mockCounts
          }
        });
      });

      const result = await orderService.refreshOrderCounts('user1');
      
      expect(result).toEqual(mockCounts);
      expect(mockWx.removeStorageSync).toHaveBeenCalledWith('order_counts_user1');
      // Should also clear related orders cache
      expect(mockWx.removeStorageSync).toHaveBeenCalledWith('orders_cache_user1_all');
      expect(mockWx.removeStorageSync).toHaveBeenCalledWith('orders_cache_user1_pending_payment');
    });

    it('should throw error on refresh failure', async () => {
      mockWx.getStorageSync.mockReturnValue(null);
      mockWx.request.mockImplementation(({ fail }) => {
        fail({ errMsg: 'Network error' });
      });

      await expect(orderService.refreshOrderCounts('user1'))
        .rejects.toThrow();
    });
  });

  describe('retry mechanism', () => {
    it('should retry failed requests up to MAX_RETRIES times', async () => {
      let attemptCount = 0;
      const mockCounts: OrderCounts = {
        pending_payment: 1,
        pending_shipment: 1,
        pending_receipt: 1,
        pending_review: 1,
        refund_aftersales: 0,
        total: 4
      };

      mockWx.getStorageSync
        .mockReturnValueOnce(null) // getCachedOrderCounts - no cache
        .mockReturnValue('valid_token'); // API call token

      mockWx.request.mockImplementation(({ success, fail }) => {
        attemptCount++;
        if (attemptCount < 3) {
          fail({ errMsg: 'Network error' });
        } else {
          success({
            statusCode: 200,
            data: {
              code: 200,
              data: mockCounts
            }
          });
        }
      });

      const result = await orderService.getOrderCounts('user1');
      expect(result).toEqual(mockCounts);
      expect(attemptCount).toBe(3);
    });

    it('should fail after MAX_RETRIES attempts', async () => {
      mockWx.getStorageSync
        .mockReturnValueOnce(null) // getCachedOrderCounts - no cache
        .mockReturnValue('valid_token'); // API call token

      mockWx.request.mockImplementation(({ fail }) => {
        fail({ errMsg: 'Network error' });
      });

      await expect(orderService.getOrderCounts('user1'))
        .rejects.toThrow();
    });
  });

  describe('cache management', () => {
    it('should handle storage errors gracefully', async () => {
      mockWx.getStorageSync.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = await orderService.getOrderCounts('user1');
      expect(result).toEqual({
        pending_payment: 0,
        pending_shipment: 0,
        pending_receipt: 0,
        pending_review: 0,
        refund_aftersales: 0,
        total: 0
      });
    });

    it('should handle cache write errors gracefully', async () => {
      const mockCounts: OrderCounts = {
        pending_payment: 1,
        pending_shipment: 1,
        pending_receipt: 1,
        pending_review: 1,
        refund_aftersales: 0,
        total: 4
      };

      mockWx.getStorageSync.mockReturnValue(null);
      mockWx.setStorageSync.mockImplementation(() => {
        throw new Error('Storage write error');
      });

      mockWx.request.mockImplementation(({ success }) => {
        success({
          statusCode: 200,
          data: {
            code: 200,
            data: mockCounts
          }
        });
      });

      // Should not throw error even if cache write fails
      const result = await orderService.getOrderCounts('user1');
      expect(result).toEqual(mockCounts);
    });
  });
});
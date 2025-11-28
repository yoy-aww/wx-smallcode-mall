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
  });
});
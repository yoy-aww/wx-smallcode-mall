/**
 * Unit tests for AccountService
 */

import { AccountService } from '../account-service';
import { Account, AccountMetrics } from '../../models/account';

// Mock wx global object
const mockWx = {
  getStorageSync: jest.fn(),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  request: jest.fn()
};

// @ts-ignore
global.wx = mockWx;

describe('AccountService', () => {
  let accountService: AccountService;

  beforeEach(() => {
    accountService = AccountService.getInstance();
    jest.clearAllMocks();
  });

  describe('getAccountMetrics', () => {
    it('should return cached metrics when cache is valid', async () => {
      const mockMetrics: AccountMetrics = {
        balance: 100,
        points: 500,
        cards: 3,
        coupons: 5
      };

      mockWx.getStorageSync
        .mockReturnValueOnce(JSON.stringify({
          data: mockMetrics,
          timestamp: Date.now()
        })) // getCachedMetrics
        .mockReturnValueOnce(JSON.stringify({
          data: mockMetrics,
          timestamp: Date.now()
        })); // isCacheValid

      const result = await accountService.getAccountMetrics('user1');
      expect(result).toEqual(mockMetrics);
    });

    it('should fetch from server when cache is invalid', async () => {
      const mockMetrics: AccountMetrics = {
        balance: 200,
        points: 1000,
        cards: 2,
        coupons: 8
      };

      mockWx.getStorageSync
        .mockReturnValueOnce(null) // getCachedMetrics - no cache
        .mockReturnValueOnce('valid_token'); // API call token

      mockWx.request.mockImplementation(({ success }) => {
        success({
          statusCode: 200,
          data: {
            code: 200,
            data: mockMetrics
          }
        });
      });

      const result = await accountService.getAccountMetrics('user1');
      expect(result).toEqual(mockMetrics);
      expect(mockWx.setStorageSync).toHaveBeenCalled();
    });

    it('should return default metrics on error with no cache', async () => {
      mockWx.getStorageSync.mockReturnValue(null);
      mockWx.request.mockImplementation(({ fail }) => {
        fail({ errMsg: 'Network error' });
      });

      const result = await accountService.getAccountMetrics('user1');
      expect(result).toEqual({
        balance: 0,
        points: 0,
        cards: 0,
        coupons: 0
      });
    });
  });
});
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

    it('should return cached metrics on error when cache exists', async () => {
      const mockMetrics: AccountMetrics = {
        balance: 100,
        points: 500,
        cards: 3,
        coupons: 5
      };

      mockWx.getStorageSync
        .mockReturnValueOnce(null) // getCachedMetrics - no cache initially
        .mockReturnValueOnce('valid_token') // API call token
        .mockReturnValueOnce(JSON.stringify({
          data: mockMetrics,
          timestamp: Date.now()
        })); // fallback getCachedMetrics

      mockWx.request.mockImplementation(({ fail }) => {
        fail({ errMsg: 'Network error' });
      });

      const result = await accountService.getAccountMetrics('user1');
      expect(result).toEqual(mockMetrics);
    });
  });

  describe('getAccount', () => {
    it('should return cached account when cache is valid', async () => {
      const mockAccount: Account = {
        userId: 'user1',
        balance: 100,
        points: 500,
        cards: 3,
        coupons: 5,
        lastUpdated: new Date()
      };

      mockWx.getStorageSync
        .mockReturnValueOnce(JSON.stringify({
          data: mockAccount,
          timestamp: Date.now()
        })) // getCachedAccount
        .mockReturnValueOnce(JSON.stringify({
          data: mockAccount,
          timestamp: Date.now()
        })); // isCacheValid

      const result = await accountService.getAccount('user1');
      expect(result.userId).toBe(mockAccount.userId);
      expect(result.balance).toBe(mockAccount.balance);
    });

    it('should fetch from server when cache is invalid', async () => {
      const mockAccount: Account = {
        userId: 'user1',
        balance: 200,
        points: 1000,
        cards: 2,
        coupons: 8,
        lastUpdated: new Date()
      };

      mockWx.getStorageSync
        .mockReturnValueOnce(null) // getCachedAccount - no cache
        .mockReturnValueOnce('valid_token'); // API call token

      mockWx.request.mockImplementation(({ success }) => {
        success({
          statusCode: 200,
          data: {
            code: 200,
            data: mockAccount
          }
        });
      });

      const result = await accountService.getAccount('user1');
      expect(result.userId).toBe(mockAccount.userId);
      expect(result.balance).toBe(mockAccount.balance);
      expect(mockWx.setStorageSync).toHaveBeenCalled();
    });

    it('should return default account on error with no cache', async () => {
      mockWx.getStorageSync.mockReturnValue(null);
      mockWx.request.mockImplementation(({ fail }) => {
        fail({ errMsg: 'Network error' });
      });

      const result = await accountService.getAccount('user1');
      expect(result).toEqual({
        userId: 'user1',
        balance: 0,
        points: 0,
        cards: 0,
        coupons: 0,
        lastUpdated: expect.any(Date)
      });
    });
  });

  describe('updateBalance', () => {
    it('should update balance successfully', async () => {
      const mockAccount: Account = {
        userId: 'user1',
        balance: 150,
        points: 500,
        cards: 3,
        coupons: 5,
        lastUpdated: new Date()
      };

      mockWx.request.mockImplementation(({ success }) => {
        success({
          statusCode: 200,
          data: {
            code: 200,
            data: mockAccount
          }
        });
      });

      const result = await accountService.updateBalance('user1', 50);
      expect(result.balance).toBe(150);
      expect(mockWx.setStorageSync).toHaveBeenCalled();
    });

    it('should throw error on update failure', async () => {
      mockWx.request.mockImplementation(({ success }) => {
        success({
          statusCode: 200,
          data: {
            code: 400,
            message: 'Insufficient balance'
          }
        });
      });

      await expect(accountService.updateBalance('user1', -200))
        .rejects.toThrow('Insufficient balance');
    });
  });

  describe('updatePoints', () => {
    it('should update points successfully', async () => {
      const mockAccount: Account = {
        userId: 'user1',
        balance: 100,
        points: 600,
        cards: 3,
        coupons: 5,
        lastUpdated: new Date()
      };

      mockWx.request.mockImplementation(({ success }) => {
        success({
          statusCode: 200,
          data: {
            code: 200,
            data: mockAccount
          }
        });
      });

      const result = await accountService.updatePoints('user1', 100);
      expect(result.points).toBe(600);
      expect(mockWx.setStorageSync).toHaveBeenCalled();
    });

    it('should throw error on update failure', async () => {
      mockWx.request.mockImplementation(({ success }) => {
        success({
          statusCode: 200,
          data: {
            code: 400,
            message: 'Invalid points amount'
          }
        });
      });

      await expect(accountService.updatePoints('user1', -1000))
        .rejects.toThrow('Invalid points amount');
    });
  });

  describe('refreshAccountData', () => {
    it('should clear cache and fetch fresh data', async () => {
      const mockAccount: Account = {
        userId: 'user1',
        balance: 300,
        points: 1500,
        cards: 4,
        coupons: 10,
        lastUpdated: new Date()
      };

      mockWx.getStorageSync
        .mockReturnValueOnce(null) // getCachedAccount after clear
        .mockReturnValueOnce('valid_token'); // API call token

      mockWx.request.mockImplementation(({ success }) => {
        success({
          statusCode: 200,
          data: {
            code: 200,
            data: mockAccount
          }
        });
      });

      const result = await accountService.refreshAccountData('user1');
      
      expect(result.balance).toBe(300);
      expect(mockWx.removeStorageSync).toHaveBeenCalledWith('account_cache_user1');
      expect(mockWx.removeStorageSync).toHaveBeenCalledWith('metrics_cache_user1');
    });

    it('should throw error on refresh failure', async () => {
      mockWx.getStorageSync.mockReturnValue(null);
      mockWx.request.mockImplementation(({ fail }) => {
        fail({ errMsg: 'Network error' });
      });

      await expect(accountService.refreshAccountData('user1'))
        .rejects.toThrow();
    });
  });

  describe('retry mechanism', () => {
    it('should retry failed requests up to MAX_RETRIES times', async () => {
      let attemptCount = 0;
      const mockAccount: Account = {
        userId: 'user1',
        balance: 100,
        points: 500,
        cards: 3,
        coupons: 5,
        lastUpdated: new Date()
      };

      mockWx.getStorageSync
        .mockReturnValueOnce(null) // getCachedAccount - no cache
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
              data: mockAccount
            }
          });
        }
      });

      const result = await accountService.getAccount('user1');
      expect(result.userId).toBe('user1');
      expect(attemptCount).toBe(3);
    });

    it('should fail after MAX_RETRIES attempts', async () => {
      mockWx.getStorageSync
        .mockReturnValueOnce(null) // getCachedAccount - no cache
        .mockReturnValue('valid_token'); // API call token

      mockWx.request.mockImplementation(({ fail }) => {
        fail({ errMsg: 'Network error' });
      });

      await expect(accountService.getAccount('user1'))
        .rejects.toThrow();
    });
  });
});
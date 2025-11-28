/**
 * Unit tests for UserService
 */

import { UserService } from '../user-service';
import { User } from '../../models/user';

// Mock wx global object
const mockWx = {
  getStorageSync: jest.fn(),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  request: jest.fn()
};

// @ts-ignore
global.wx = mockWx;

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = UserService.getInstance();
    jest.clearAllMocks();
  });

  describe('isLoggedIn', () => {
    it('should return true when user has token and cached user is logged in', () => {
      mockWx.getStorageSync
        .mockReturnValueOnce('valid_token') // TOKEN_KEY
        .mockReturnValueOnce(JSON.stringify({
          data: { id: '1', isLoggedIn: true },
          timestamp: Date.now()
        })); // CACHE_KEY

      const result = userService.isLoggedIn();
      expect(result).toBe(true);
    });

    it('should return false when no token exists', () => {
      mockWx.getStorageSync.mockReturnValue(null);

      const result = userService.isLoggedIn();
      expect(result).toBe(false);
    });

    it('should handle storage errors gracefully', () => {
      mockWx.getStorageSync.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = userService.isLoggedIn();
      expect(result).toBe(false);
    });
  });
});
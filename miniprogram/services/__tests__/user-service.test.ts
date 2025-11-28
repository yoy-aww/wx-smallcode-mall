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

    it('should return false when user is not logged in', () => {
      mockWx.getStorageSync
        .mockReturnValueOnce('valid_token') // TOKEN_KEY
        .mockReturnValueOnce(JSON.stringify({
          data: { id: '1', isLoggedIn: false },
          timestamp: Date.now()
        })); // CACHE_KEY

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

  describe('getCurrentUser', () => {
    it('should return cached user when cache is valid', async () => {
      const mockUser: User = {
        id: '1',
        nickname: 'Test User',
        avatar: 'avatar.jpg',
        membershipLevel: 'gold',
        isLoggedIn: true
      };

      mockWx.getStorageSync
        .mockReturnValueOnce('valid_token') // isLoggedIn check
        .mockReturnValueOnce(JSON.stringify({
          data: mockUser,
          timestamp: Date.now()
        })) // getCachedUser
        .mockReturnValueOnce(JSON.stringify({
          data: mockUser,
          timestamp: Date.now()
        })); // isCacheValid

      const result = await userService.getCurrentUser();
      expect(result).toEqual(mockUser);
    });

    it('should return null when user is not logged in', async () => {
      mockWx.getStorageSync.mockReturnValue(null);

      const result = await userService.getCurrentUser();
      expect(result).toBe(null);
    });

    it('should fetch from server when cache is invalid', async () => {
      const mockUser: User = {
        id: '1',
        nickname: 'Test User',
        avatar: 'avatar.jpg',
        membershipLevel: 'gold',
        isLoggedIn: true
      };

      mockWx.getStorageSync
        .mockReturnValueOnce('valid_token') // isLoggedIn check
        .mockReturnValueOnce(null) // getCachedUser - no cache
        .mockReturnValueOnce('valid_token') // isLoggedIn check again
        .mockReturnValueOnce(null) // getCachedUser - no cache again
        .mockReturnValueOnce('valid_token'); // API call token

      mockWx.request.mockImplementation(({ success }) => {
        success({
          statusCode: 200,
          data: {
            code: 200,
            data: mockUser
          }
        });
      });

      const result = await userService.getCurrentUser();
      expect(result).toEqual(mockUser);
      expect(mockWx.setStorageSync).toHaveBeenCalled();
    });

    it('should return cached user on API error', async () => {
      const mockUser: User = {
        id: '1',
        nickname: 'Test User',
        avatar: 'avatar.jpg',
        membershipLevel: 'gold',
        isLoggedIn: true
      };

      mockWx.getStorageSync
        .mockReturnValueOnce('valid_token') // isLoggedIn check
        .mockReturnValueOnce(null) // getCachedUser - no cache
        .mockReturnValueOnce('valid_token') // isLoggedIn check again
        .mockReturnValueOnce(null) // getCachedUser - no cache again
        .mockReturnValueOnce('valid_token') // API call token
        .mockReturnValueOnce(JSON.stringify({
          data: mockUser,
          timestamp: Date.now()
        })); // fallback getCachedUser

      mockWx.request.mockImplementation(({ fail }) => {
        fail({ errMsg: 'Network error' });
      });

      const result = await userService.getCurrentUser();
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should login successfully and cache user data', async () => {
      const mockUser: User = {
        id: '1',
        nickname: 'Test User',
        avatar: 'avatar.jpg',
        membershipLevel: 'gold',
        isLoggedIn: true
      };

      const mockResponse = {
        code: 200,
        data: {
          user: mockUser,
          token: 'new_token'
        }
      };

      mockWx.request.mockImplementation(({ success }) => {
        success({
          statusCode: 200,
          data: mockResponse
        });
      });

      const result = await userService.login('1234567890', '123456');
      
      expect(result).toEqual(mockUser);
      expect(mockWx.setStorageSync).toHaveBeenCalledWith('auth_token', 'new_token');
      expect(mockWx.setStorageSync).toHaveBeenCalledWith('user_cache', expect.any(String));
    });

    it('should throw error on login failure', async () => {
      mockWx.request.mockImplementation(({ success }) => {
        success({
          statusCode: 200,
          data: {
            code: 400,
            message: 'Invalid credentials'
          }
        });
      });

      await expect(userService.login('1234567890', '123456'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error on network failure', async () => {
      mockWx.request.mockImplementation(({ fail }) => {
        fail({ errMsg: 'Network error' });
      });

      await expect(userService.login('1234567890', '123456'))
        .rejects.toThrow('Network error: Network error');
    });
  });

  describe('logout', () => {
    it('should clear local storage on logout', async () => {
      mockWx.request.mockImplementation(({ success }) => {
        success({ statusCode: 200, data: { code: 200 } });
      });

      await userService.logout();

      expect(mockWx.removeStorageSync).toHaveBeenCalledWith('auth_token');
      expect(mockWx.removeStorageSync).toHaveBeenCalledWith('user_cache');
    });

    it('should clear local storage even if API fails', async () => {
      mockWx.request.mockImplementation(({ fail }) => {
        fail({ errMsg: 'Network error' });
      });

      await userService.logout();

      expect(mockWx.removeStorageSync).toHaveBeenCalledWith('auth_token');
      expect(mockWx.removeStorageSync).toHaveBeenCalledWith('user_cache');
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile successfully', async () => {
      const mockUser: User = {
        id: '1',
        nickname: 'Test User',
        avatar: 'avatar.jpg',
        membershipLevel: 'gold',
        isLoggedIn: true
      };

      mockWx.request.mockImplementation(({ success }) => {
        success({
          statusCode: 200,
          data: {
            code: 200,
            data: mockUser
          }
        });
      });

      const result = await userService.getUserProfile('1');
      
      expect(result).toEqual({
        avatar: 'avatar.jpg',
        nickname: 'Test User',
        membershipLevel: 'gold'
      });
    });

    it('should throw error on API failure', async () => {
      mockWx.request.mockImplementation(({ success }) => {
        success({
          statusCode: 200,
          data: {
            code: 404,
            message: 'User not found'
          }
        });
      });

      await expect(userService.getUserProfile('1'))
        .rejects.toThrow('User not found');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const mockUser: User = {
        id: '1',
        nickname: 'Updated User',
        avatar: 'new_avatar.jpg',
        membershipLevel: 'platinum',
        isLoggedIn: true
      };

      mockWx.request.mockImplementation(({ success }) => {
        success({
          statusCode: 200,
          data: {
            code: 200,
            data: mockUser
          }
        });
      });

      const result = await userService.updateUserProfile('1', {
        nickname: 'Updated User',
        avatar: 'new_avatar.jpg'
      });
      
      expect(result).toEqual({
        avatar: 'new_avatar.jpg',
        nickname: 'Updated User',
        membershipLevel: 'platinum'
      });
      expect(mockWx.setStorageSync).toHaveBeenCalled();
    });

    it('should throw error on update failure', async () => {
      mockWx.request.mockImplementation(({ success }) => {
        success({
          statusCode: 200,
          data: {
            code: 400,
            message: 'Update failed'
          }
        });
      });

      await expect(userService.updateUserProfile('1', { nickname: 'New Name' }))
        .rejects.toThrow('Update failed');
    });
  });
});
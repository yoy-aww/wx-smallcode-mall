/**
 * User service for authentication and profile management
 */

import { User, UserInfo } from '../models/user';

export interface IUserService {
  /**
   * Get current user information
   */
  getCurrentUser(): Promise<User | null>;
  
  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean;
  
  /**
   * Login user with phone number
   */
  login(phone: string, code: string): Promise<User>;
  
  /**
   * Logout current user
   */
  logout(): Promise<void>;
  
  /**
   * Get user profile information
   */
  getUserProfile(userId: string): Promise<UserInfo>;
  
  /**
   * Update user profile
   */
  updateUserProfile(userId: string, profile: Partial<UserInfo>): Promise<UserInfo>;
}

export interface UserApiResponse {
  code: number;
  message: string;
  data: User | null;
}

export interface LoginRequest {
  phone: string;
  code: string;
}

export interface LoginResponse {
  code: number;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

/**
 * UserService implementation with caching and error handling
 */
export class UserService implements IUserService {
  private static instance: UserService;
  private readonly CACHE_KEY = 'user_cache';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Check if user is logged in
   */
  public isLoggedIn(): boolean {
    try {
      const token = wx.getStorageSync(this.TOKEN_KEY);
      const cachedUser = this.getCachedUser();
      return !!(token && cachedUser?.isLoggedIn);
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  /**
   * Get current user information
   */
  public async getCurrentUser(): Promise<User | null> {
    try {
      // Check cache first
      const cachedUser = this.getCachedUser();
      if (cachedUser && this.isCacheValid()) {
        return cachedUser;
      }

      // If not logged in, return null
      if (!this.isLoggedIn()) {
        return null;
      }

      // Fetch from server with retry
      const user = await this.fetchUserWithRetry();
      if (user) {
        this.cacheUser(user);
      }
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      // Return cached user as fallback
      return this.getCachedUser();
    }
  }

  /**
   * Login user with phone number
   */
  public async login(phone: string, code: string): Promise<User> {
    try {
      const response = await this.makeApiCall<LoginResponse>('/api/auth/login', {
        method: 'POST',
        data: { phone, code }
      });

      if (response.code === 200 && response.data) {
        const { user, token } = response.data;
        user.isLoggedIn = true;
        
        // Store token and user data
        wx.setStorageSync(this.TOKEN_KEY, token);
        this.cacheUser(user);
        
        return user;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout current user
   */
  public async logout(): Promise<void> {
    try {
      // Call logout API
      await this.makeApiCall('/api/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local cleanup even if API fails
    } finally {
      // Clear local storage
      wx.removeStorageSync(this.TOKEN_KEY);
      wx.removeStorageSync(this.CACHE_KEY);
    }
  }

  /**
   * Get user profile information
   */
  public async getUserProfile(userId: string): Promise<UserInfo> {
    try {
      const response = await this.makeApiCall<UserApiResponse>(`/api/users/${userId}/profile`);
      
      if (response.code === 200 && response.data) {
        const user = response.data as User;
        return {
          avatar: user.avatar,
          nickname: user.nickname,
          membershipLevel: user.membershipLevel
        };
      } else {
        throw new Error(response.message || 'Failed to get user profile');
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  public async updateUserProfile(userId: string, profile: Partial<UserInfo>): Promise<UserInfo> {
    try {
      const response = await this.makeApiCall<UserApiResponse>(`/api/users/${userId}/profile`, {
        method: 'PUT',
        data: profile
      });

      if (response.code === 200 && response.data) {
        const user = response.data as User;
        // Update cache
        this.cacheUser(user);
        
        return {
          avatar: user.avatar,
          nickname: user.nickname,
          membershipLevel: user.membershipLevel
        };
      } else {
        throw new Error(response.message || 'Failed to update user profile');
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Get cached user data
   */
  private getCachedUser(): User | null {
    try {
      const cached = wx.getStorageSync(this.CACHE_KEY);
      if (cached) {
        return JSON.parse(cached).data;
      }
    } catch (error) {
      console.error('Error reading cached user:', error);
    }
    return null;
  }

  /**
   * Cache user data
   */
  private cacheUser(user: User): void {
    try {
      const cacheData = {
        data: user,
        timestamp: Date.now()
      };
      wx.setStorageSync(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching user:', error);
    }
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(): boolean {
    try {
      const cached = wx.getStorageSync(this.CACHE_KEY);
      if (cached) {
        const { timestamp } = JSON.parse(cached);
        return Date.now() - timestamp < this.CACHE_DURATION;
      }
    } catch (error) {
      console.error('Error checking cache validity:', error);
    }
    return false;
  }

  /**
   * Fetch user with retry mechanism
   */
  private async fetchUserWithRetry(): Promise<User | null> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await this.makeApiCall<UserApiResponse>('/api/auth/me');
        
        if (response.code === 200) {
          return response.data;
        } else if (response.code === 401) {
          // Unauthorized, clear auth data
          await this.logout();
          return null;
        } else {
          throw new Error(response.message || 'Failed to fetch user');
        }
      } catch (error) {
        console.error(`User fetch attempt ${attempt} failed:`, error);
        
        if (attempt === this.MAX_RETRIES) {
          throw error;
        }
        
        // Wait before retry
        await this.delay(this.RETRY_DELAY * attempt);
      }
    }
    return null;
  }

  /**
   * Make API call with authentication
   */
  private async makeApiCall<T>(url: string, options: any = {}): Promise<T> {
    const token = wx.getStorageSync(this.TOKEN_KEY);
    
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://api.example.com${url}`, // Replace with actual API base URL
        method: options.method || 'GET',
        data: options.data,
        header: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.header
        },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data as T);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.data}`));
          }
        },
        fail: (error) => {
          reject(new Error(`Network error: ${error.errMsg}`));
        }
      });
    });
  }

  /**
   * Delay utility for retry mechanism
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
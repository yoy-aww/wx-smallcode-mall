/**
 * Account service for balance, points, cards, and coupons data
 */

import { Account, AccountMetrics } from '../models/account';

export interface IAccountService {
  /**
   * Get account metrics for a user
   */
  getAccountMetrics(userId: string): Promise<AccountMetrics>;
  
  /**
   * Get full account information
   */
  getAccount(userId: string): Promise<Account>;
  
  /**
   * Update account balance
   */
  updateBalance(userId: string, amount: number): Promise<Account>;
  
  /**
   * Update account points
   */
  updatePoints(userId: string, points: number): Promise<Account>;
  
  /**
   * Refresh account data from server
   */
  refreshAccountData(userId: string): Promise<Account>;
}

export interface AccountApiResponse {
  code: number;
  message: string;
  data: Account | AccountMetrics;
}

export interface BalanceUpdateRequest {
  userId: string;
  amount: number;
  operation: 'add' | 'subtract';
}

export interface PointsUpdateRequest {
  userId: string;
  points: number;
  operation: 'add' | 'subtract';
}

/**
 * AccountService implementation with caching and error handling
 */
export class AccountService implements IAccountService {
  private static instance: AccountService;
  private readonly CACHE_KEY_PREFIX = 'account_cache_';
  private readonly METRICS_CACHE_KEY_PREFIX = 'metrics_cache_';
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for account data
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  private constructor() {}

  public static getInstance(): AccountService {
    if (!AccountService.instance) {
      AccountService.instance = new AccountService();
    }
    return AccountService.instance;
  }

  /**
   * Get account metrics for a user
   */
  public async getAccountMetrics(userId: string): Promise<AccountMetrics> {
    try {
      // Check cache first
      const cachedMetrics = this.getCachedMetrics(userId);
      if (cachedMetrics && this.isCacheValid(this.METRICS_CACHE_KEY_PREFIX + userId)) {
        return cachedMetrics;
      }

      // Fetch from server with retry
      const metrics = await this.fetchMetricsWithRetry(userId);
      if (metrics) {
        this.cacheMetrics(userId, metrics);
      }
      return metrics;
    } catch (error) {
      console.error('Error getting account metrics:', error);
      // Return cached metrics as fallback
      const cachedMetrics = this.getCachedMetrics(userId);
      if (cachedMetrics) {
        return cachedMetrics;
      }
      // Return default metrics if no cache available
      return {
        balance: 0,
        points: 0,
        cards: 0,
        coupons: 0
      };
    }
  }

  /**
   * Get full account information
   */
  public async getAccount(userId: string): Promise<Account> {
    try {
      // Check cache first
      const cachedAccount = this.getCachedAccount(userId);
      if (cachedAccount && this.isCacheValid(this.CACHE_KEY_PREFIX + userId)) {
        return cachedAccount;
      }

      // Fetch from server with retry
      const account = await this.fetchAccountWithRetry(userId);
      if (account) {
        this.cacheAccount(userId, account);
      }
      return account;
    } catch (error) {
      console.error('Error getting account:', error);
      // Return cached account as fallback
      const cachedAccount = this.getCachedAccount(userId);
      if (cachedAccount) {
        return cachedAccount;
      }
      // Return default account if no cache available
      return {
        userId,
        balance: 0,
        points: 0,
        cards: 0,
        coupons: 0,
        lastUpdated: new Date()
      };
    }
  }

  /**
   * Update account balance
   */
  public async updateBalance(userId: string, amount: number): Promise<Account> {
    try {
      const response = await this.makeApiCall<AccountApiResponse>(`/api/accounts/${userId}/balance`, {
        method: 'PUT',
        data: { amount }
      });

      if (response.code === 200 && response.data) {
        const account = response.data as Account;
        account.lastUpdated = new Date();
        this.cacheAccount(userId, account);
        return account;
      } else {
        throw new Error(response.message || 'Failed to update balance');
      }
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  }

  /**
   * Update account points
   */
  public async updatePoints(userId: string, points: number): Promise<Account> {
    try {
      const response = await this.makeApiCall<AccountApiResponse>(`/api/accounts/${userId}/points`, {
        method: 'PUT',
        data: { points }
      });

      if (response.code === 200 && response.data) {
        const account = response.data as Account;
        account.lastUpdated = new Date();
        this.cacheAccount(userId, account);
        return account;
      } else {
        throw new Error(response.message || 'Failed to update points');
      }
    } catch (error) {
      console.error('Error updating points:', error);
      throw error;
    }
  }

  /**
   * Refresh account data from server
   */
  public async refreshAccountData(userId: string): Promise<Account> {
    try {
      // Clear cache first
      this.clearCache(userId);
      
      // Fetch fresh data
      return await this.getAccount(userId);
    } catch (error) {
      console.error('Error refreshing account data:', error);
      throw error;
    }
  }

  /**
   * Get cached account data
   */
  private getCachedAccount(userId: string): Account | null {
    try {
      const cached = wx.getStorageSync(this.CACHE_KEY_PREFIX + userId);
      if (cached) {
        const account = JSON.parse(cached).data;
        // Convert lastUpdated back to Date object
        account.lastUpdated = new Date(account.lastUpdated);
        return account;
      }
    } catch (error) {
      console.error('Error reading cached account:', error);
    }
    return null;
  }

  /**
   * Cache account data
   */
  private cacheAccount(userId: string, account: Account): void {
    try {
      const cacheData = {
        data: account,
        timestamp: Date.now()
      };
      wx.setStorageSync(this.CACHE_KEY_PREFIX + userId, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching account:', error);
    }
  }

  /**
   * Get cached metrics data
   */
  private getCachedMetrics(userId: string): AccountMetrics | null {
    try {
      const cached = wx.getStorageSync(this.METRICS_CACHE_KEY_PREFIX + userId);
      if (cached) {
        return JSON.parse(cached).data;
      }
    } catch (error) {
      console.error('Error reading cached metrics:', error);
    }
    return null;
  }

  /**
   * Cache metrics data
   */
  private cacheMetrics(userId: string, metrics: AccountMetrics): void {
    try {
      const cacheData = {
        data: metrics,
        timestamp: Date.now()
      };
      wx.setStorageSync(this.METRICS_CACHE_KEY_PREFIX + userId, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching metrics:', error);
    }
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(cacheKey: string): boolean {
    try {
      const cached = wx.getStorageSync(cacheKey);
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
   * Clear cache for user
   */
  private clearCache(userId: string): void {
    try {
      wx.removeStorageSync(this.CACHE_KEY_PREFIX + userId);
      wx.removeStorageSync(this.METRICS_CACHE_KEY_PREFIX + userId);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Fetch account with retry mechanism
   */
  private async fetchAccountWithRetry(userId: string): Promise<Account> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await this.makeApiCall<AccountApiResponse>(`/api/accounts/${userId}`);
        
        if (response.code === 200 && response.data) {
          const account = response.data as Account;
          account.lastUpdated = new Date();
          return account;
        } else {
          throw new Error(response.message || 'Failed to fetch account');
        }
      } catch (error) {
        console.error(`Account fetch attempt ${attempt} failed:`, error);
        
        if (attempt === this.MAX_RETRIES) {
          throw error;
        }
        
        // Wait before retry
        await this.delay(this.RETRY_DELAY * attempt);
      }
    }
    throw new Error('Failed to fetch account after retries');
  }

  /**
   * Fetch metrics with retry mechanism
   */
  private async fetchMetricsWithRetry(userId: string): Promise<AccountMetrics> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await this.makeApiCall<AccountApiResponse>(`/api/accounts/${userId}/metrics`);
        
        if (response.code === 200 && response.data) {
          return response.data as AccountMetrics;
        } else {
          throw new Error(response.message || 'Failed to fetch metrics');
        }
      } catch (error) {
        console.error(`Metrics fetch attempt ${attempt} failed:`, error);
        
        if (attempt === this.MAX_RETRIES) {
          throw error;
        }
        
        // Wait before retry
        await this.delay(this.RETRY_DELAY * attempt);
      }
    }
    throw new Error('Failed to fetch metrics after retries');
  }

  /**
   * Make API call with authentication
   */
  private async makeApiCall<T>(url: string, options: any = {}): Promise<T> {
    const token = wx.getStorageSync('auth_token');
    
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
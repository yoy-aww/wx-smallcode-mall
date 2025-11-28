/**
 * Order service for order count retrieval and management
 */

import { OrderCounts, OrderStatus } from '../models/order';

export interface IOrderService {
  /**
   * Get order counts by status for a user
   */
  getOrderCounts(userId: string): Promise<OrderCounts>;
  
  /**
   * Get orders by status
   */
  getOrdersByStatus(userId: string, status: OrderStatus): Promise<any[]>;
  
  /**
   * Get all orders for a user
   */
  getAllOrders(userId: string): Promise<any[]>;
  
  /**
   * Refresh order counts from server
   */
  refreshOrderCounts(userId: string): Promise<OrderCounts>;
}

export interface OrderCountsApiResponse {
  code: number;
  message: string;
  data: OrderCounts;
}

export interface OrderListApiResponse {
  code: number;
  message: string;
  data: {
    orders: any[];
    total: number;
    page: number;
    pageSize: number;
  };
}

/**
 * OrderService implementation with caching and error handling
 */
export class OrderService implements IOrderService {
  private static instance: OrderService;
  private readonly COUNTS_CACHE_KEY_PREFIX = 'order_counts_';
  private readonly ORDERS_CACHE_KEY_PREFIX = 'orders_cache_';
  private readonly CACHE_DURATION = 3 * 60 * 1000; // 3 minutes for order data
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  private constructor() {}

  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  /**
   * Get order counts by status for a user
   */
  public async getOrderCounts(userId: string): Promise<OrderCounts> {
    try {
      // Check cache first
      const cachedCounts = this.getCachedOrderCounts(userId);
      if (cachedCounts && this.isCacheValid(this.COUNTS_CACHE_KEY_PREFIX + userId)) {
        return cachedCounts;
      }

      // Fetch from server with retry
      const counts = await this.fetchOrderCountsWithRetry(userId);
      if (counts) {
        this.cacheOrderCounts(userId, counts);
      }
      return counts;
    } catch (error) {
      console.error('Error getting order counts:', error);
      // Return cached counts as fallback
      const cachedCounts = this.getCachedOrderCounts(userId);
      if (cachedCounts) {
        return cachedCounts;
      }
      // Return default counts if no cache available
      return {
        pending_payment: 0,
        pending_shipment: 0,
        pending_receipt: 0,
        pending_review: 0,
        refund_aftersales: 0,
        total: 0
      };
    }
  }

  /**
   * Get orders by status
   */
  public async getOrdersByStatus(userId: string, status: OrderStatus): Promise<any[]> {
    try {
      // Check cache first
      const cacheKey = `${this.ORDERS_CACHE_KEY_PREFIX}${userId}_${status}`;
      const cachedOrders = this.getCachedOrders(cacheKey);
      if (cachedOrders && this.isCacheValid(cacheKey)) {
        return cachedOrders;
      }

      // Fetch from server with retry
      const orders = await this.fetchOrdersByStatusWithRetry(userId, status);
      if (orders) {
        this.cacheOrders(cacheKey, orders);
      }
      return orders;
    } catch (error) {
      console.error('Error getting orders by status:', error);
      // Return cached orders as fallback
      const cacheKey = `${this.ORDERS_CACHE_KEY_PREFIX}${userId}_${status}`;
      const cachedOrders = this.getCachedOrders(cacheKey);
      return cachedOrders || [];
    }
  }

  /**
   * Get all orders for a user
   */
  public async getAllOrders(userId: string): Promise<any[]> {
    try {
      // Check cache first
      const cacheKey = `${this.ORDERS_CACHE_KEY_PREFIX}${userId}_all`;
      const cachedOrders = this.getCachedOrders(cacheKey);
      if (cachedOrders && this.isCacheValid(cacheKey)) {
        return cachedOrders;
      }

      // Fetch from server with retry
      const orders = await this.fetchAllOrdersWithRetry(userId);
      if (orders) {
        this.cacheOrders(cacheKey, orders);
      }
      return orders;
    } catch (error) {
      console.error('Error getting all orders:', error);
      // Return cached orders as fallback
      const cacheKey = `${this.ORDERS_CACHE_KEY_PREFIX}${userId}_all`;
      const cachedOrders = this.getCachedOrders(cacheKey);
      return cachedOrders || [];
    }
  }

  /**
   * Refresh order counts from server
   */
  public async refreshOrderCounts(userId: string): Promise<OrderCounts> {
    try {
      // Clear cache first
      this.clearOrderCountsCache(userId);
      
      // Fetch fresh data
      return await this.getOrderCounts(userId);
    } catch (error) {
      console.error('Error refreshing order counts:', error);
      throw error;
    }
  }

  /**
   * Get cached order counts
   */
  private getCachedOrderCounts(userId: string): OrderCounts | null {
    try {
      const cached = wx.getStorageSync(this.COUNTS_CACHE_KEY_PREFIX + userId);
      if (cached) {
        return JSON.parse(cached).data;
      }
    } catch (error) {
      console.error('Error reading cached order counts:', error);
    }
    return null;
  }

  /**
   * Cache order counts
   */
  private cacheOrderCounts(userId: string, counts: OrderCounts): void {
    try {
      const cacheData = {
        data: counts,
        timestamp: Date.now()
      };
      wx.setStorageSync(this.COUNTS_CACHE_KEY_PREFIX + userId, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching order counts:', error);
    }
  }

  /**
   * Get cached orders
   */
  private getCachedOrders(cacheKey: string): any[] | null {
    try {
      const cached = wx.getStorageSync(cacheKey);
      if (cached) {
        return JSON.parse(cached).data;
      }
    } catch (error) {
      console.error('Error reading cached orders:', error);
    }
    return null;
  }

  /**
   * Cache orders
   */
  private cacheOrders(cacheKey: string, orders: any[]): void {
    try {
      const cacheData = {
        data: orders,
        timestamp: Date.now()
      };
      wx.setStorageSync(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching orders:', error);
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
   * Clear order counts cache for user
   */
  private clearOrderCountsCache(userId: string): void {
    try {
      wx.removeStorageSync(this.COUNTS_CACHE_KEY_PREFIX + userId);
      // Also clear related orders cache
      const keys = ['all', 'pending_payment', 'pending_shipment', 'pending_receipt', 'pending_review', 'refund_aftersales'];
      keys.forEach(key => {
        wx.removeStorageSync(`${this.ORDERS_CACHE_KEY_PREFIX}${userId}_${key}`);
      });
    } catch (error) {
      console.error('Error clearing order counts cache:', error);
    }
  }

  /**
   * Fetch order counts with retry mechanism
   */
  private async fetchOrderCountsWithRetry(userId: string): Promise<OrderCounts> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await this.makeApiCall<OrderCountsApiResponse>(`/api/orders/${userId}/counts`);
        
        if (response.code === 200 && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch order counts');
        }
      } catch (error) {
        console.error(`Order counts fetch attempt ${attempt} failed:`, error);
        
        if (attempt === this.MAX_RETRIES) {
          throw error;
        }
        
        // Wait before retry
        await this.delay(this.RETRY_DELAY * attempt);
      }
    }
    throw new Error('Failed to fetch order counts after retries');
  }

  /**
   * Fetch orders by status with retry mechanism
   */
  private async fetchOrdersByStatusWithRetry(userId: string, status: OrderStatus): Promise<any[]> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await this.makeApiCall<OrderListApiResponse>(`/api/orders/${userId}?status=${status}`);
        
        if (response.code === 200 && response.data) {
          return response.data.orders;
        } else {
          throw new Error(response.message || 'Failed to fetch orders by status');
        }
      } catch (error) {
        console.error(`Orders by status fetch attempt ${attempt} failed:`, error);
        
        if (attempt === this.MAX_RETRIES) {
          throw error;
        }
        
        // Wait before retry
        await this.delay(this.RETRY_DELAY * attempt);
      }
    }
    throw new Error('Failed to fetch orders by status after retries');
  }

  /**
   * Fetch all orders with retry mechanism
   */
  private async fetchAllOrdersWithRetry(userId: string): Promise<any[]> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await this.makeApiCall<OrderListApiResponse>(`/api/orders/${userId}`);
        
        if (response.code === 200 && response.data) {
          return response.data.orders;
        } else {
          throw new Error(response.message || 'Failed to fetch all orders');
        }
      } catch (error) {
        console.error(`All orders fetch attempt ${attempt} failed:`, error);
        
        if (attempt === this.MAX_RETRIES) {
          throw error;
        }
        
        // Wait before retry
        await this.delay(this.RETRY_DELAY * attempt);
      }
    }
    throw new Error('Failed to fetch all orders after retries');
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
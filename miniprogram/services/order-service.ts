/**
 * Order service interface for order count retrieval and management
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
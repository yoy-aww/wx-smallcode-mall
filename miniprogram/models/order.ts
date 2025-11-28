/**
 * Order model interfaces and types
 */

export type OrderStatus = 
  | 'pending_payment'
  | 'pending_shipment' 
  | 'pending_receipt'
  | 'pending_review'
  | 'refund_aftersales'
  | 'completed'
  | 'cancelled';

export interface OrderCounts {
  pending_payment: number;
  pending_shipment: number;
  pending_receipt: number;
  pending_review: number;
  refund_aftersales: number;
  total: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}
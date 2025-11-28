/**
 * Order model interfaces and types for order management
 */

export interface OrderCounts {
  pending_payment: number;
  pending_shipment: number;
  pending_receipt: number;
  pending_review: number;
  refund_aftersales: number;
  total: number;
}

export type OrderStatus = 
  | 'pending_payment' 
  | 'pending_shipment' 
  | 'pending_receipt' 
  | 'pending_review' 
  | 'refund_aftersales';

export interface OrderStatusInfo {
  status: OrderStatus;
  title: string;
  icon: string;
  count: number;
}
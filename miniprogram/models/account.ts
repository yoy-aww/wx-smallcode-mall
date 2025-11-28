/**
 * Account model interfaces and types for account metrics
 */

export interface Account {
  userId: string;
  balance: number;
  points: number;
  cards: number;
  coupons: number;
  lastUpdated: Date;
}

export interface AccountMetrics {
  balance: number;
  points: number;
  cards: number;
  coupons: number;
}

export type AccountMetricType = 'balance' | 'points' | 'cards' | 'coupons';
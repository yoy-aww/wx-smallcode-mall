/**
 * Account service interface for balance, points, cards, and coupons data
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
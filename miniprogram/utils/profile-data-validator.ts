/**
 * Data validation functions for profile page API responses
 */

import { User, UserInfo } from '../models/user';
import { Account, AccountMetrics } from '../models/account';
import { OrderCounts } from '../models/order';

/**
 * Validate user data from API response
 */
export function validateUser(data: any): User | null {
  if (!data || typeof data !== 'object') {
    console.error('Invalid user data: not an object');
    return null;
  }

  const { id, nickname, avatar, phone, membershipLevel, isLoggedIn } = data;

  if (!id || typeof id !== 'string') {
    console.error('Invalid user data: missing or invalid id');
    return null;
  }

  if (!nickname || typeof nickname !== 'string') {
    console.error('Invalid user data: missing or invalid nickname');
    return null;
  }

  if (!avatar || typeof avatar !== 'string') {
    console.error('Invalid user data: missing or invalid avatar');
    return null;
  }

  const validMembershipLevels = ['regular', 'silver', 'gold', 'platinum'];
  if (membershipLevel && validMembershipLevels.indexOf(membershipLevel) === -1) {
    console.error('Invalid user data: invalid membershipLevel');
    return null;
  }

  return {
    id,
    nickname,
    avatar,
    phone: phone || undefined,
    membershipLevel: membershipLevel || 'regular',
    isLoggedIn: Boolean(isLoggedIn)
  };
}

/**
 * Validate user info data from API response
 */
export function validateUserInfo(data: any): UserInfo | null {
  if (!data || typeof data !== 'object') {
    console.error('Invalid user info data: not an object');
    return null;
  }

  const { avatar, nickname, membershipLevel } = data;

  if (!avatar || typeof avatar !== 'string') {
    console.error('Invalid user info data: missing or invalid avatar');
    return null;
  }

  if (!nickname || typeof nickname !== 'string') {
    console.error('Invalid user info data: missing or invalid nickname');
    return null;
  }

  if (!membershipLevel || typeof membershipLevel !== 'string') {
    console.error('Invalid user info data: missing or invalid membershipLevel');
    return null;
  }

  return {
    avatar,
    nickname,
    membershipLevel
  };
}

/**
 * Validate account data from API response
 */
export function validateAccount(data: any): Account | null {
  if (!data || typeof data !== 'object') {
    console.error('Invalid account data: not an object');
    return null;
  }

  const { userId, balance, points, cards, coupons, lastUpdated } = data;

  if (!userId || typeof userId !== 'string') {
    console.error('Invalid account data: missing or invalid userId');
    return null;
  }

  if (typeof balance !== 'number' || balance < 0) {
    console.error('Invalid account data: invalid balance');
    return null;
  }

  if (typeof points !== 'number' || points < 0) {
    console.error('Invalid account data: invalid points');
    return null;
  }

  if (typeof cards !== 'number' || cards < 0) {
    console.error('Invalid account data: invalid cards');
    return null;
  }

  if (typeof coupons !== 'number' || coupons < 0) {
    console.error('Invalid account data: invalid coupons');
    return null;
  }

  let parsedLastUpdated: Date;
  if (lastUpdated) {
    parsedLastUpdated = new Date(lastUpdated);
    if (isNaN(parsedLastUpdated.getTime())) {
      console.error('Invalid account data: invalid lastUpdated date');
      return null;
    }
  } else {
    parsedLastUpdated = new Date();
  }

  return {
    userId,
    balance,
    points,
    cards,
    coupons,
    lastUpdated: parsedLastUpdated
  };
}

/**
 * Validate account metrics data from API response
 */
export function validateAccountMetrics(data: any): AccountMetrics | null {
  if (!data || typeof data !== 'object') {
    console.error('Invalid account metrics data: not an object');
    return null;
  }

  const { balance, points, cards, coupons } = data;

  if (typeof balance !== 'number' || balance < 0) {
    console.error('Invalid account metrics data: invalid balance');
    return null;
  }

  if (typeof points !== 'number' || points < 0) {
    console.error('Invalid account metrics data: invalid points');
    return null;
  }

  if (typeof cards !== 'number' || cards < 0) {
    console.error('Invalid account metrics data: invalid cards');
    return null;
  }

  if (typeof coupons !== 'number' || coupons < 0) {
    console.error('Invalid account metrics data: invalid coupons');
    return null;
  }

  return {
    balance,
    points,
    cards,
    coupons
  };
}

/**
 * Validate order counts data from API response
 */
export function validateOrderCounts(data: any): OrderCounts | null {
  if (!data || typeof data !== 'object') {
    console.error('Invalid order counts data: not an object');
    return null;
  }

  const { 
    pending_payment, 
    pending_shipment, 
    pending_receipt, 
    pending_review, 
    refund_aftersales,
    total 
  } = data;

  if (typeof pending_payment !== 'number' || pending_payment < 0) {
    console.error('Invalid order counts data: invalid pending_payment');
    return null;
  }

  if (typeof pending_shipment !== 'number' || pending_shipment < 0) {
    console.error('Invalid order counts data: invalid pending_shipment');
    return null;
  }

  if (typeof pending_receipt !== 'number' || pending_receipt < 0) {
    console.error('Invalid order counts data: invalid pending_receipt');
    return null;
  }

  if (typeof pending_review !== 'number' || pending_review < 0) {
    console.error('Invalid order counts data: invalid pending_review');
    return null;
  }

  if (typeof refund_aftersales !== 'number' || refund_aftersales < 0) {
    console.error('Invalid order counts data: invalid refund_aftersales');
    return null;
  }

  // Calculate total if not provided or validate if provided
  const calculatedTotal = pending_payment + pending_shipment + pending_receipt + pending_review + refund_aftersales;
  const finalTotal = typeof total === 'number' ? total : calculatedTotal;

  return {
    pending_payment,
    pending_shipment,
    pending_receipt,
    pending_review,
    refund_aftersales,
    total: finalTotal
  };
}

/**
 * Validate API response structure
 */
export function validateApiResponse(response: any): { isValid: boolean; data: any; error?: string } {
  if (!response || typeof response !== 'object') {
    return {
      isValid: false,
      data: null,
      error: 'Invalid response: not an object'
    };
  }

  const { code, message, data } = response;

  if (typeof code !== 'number') {
    return {
      isValid: false,
      data: null,
      error: 'Invalid response: missing or invalid code'
    };
  }

  if (typeof message !== 'string') {
    return {
      isValid: false,
      data: null,
      error: 'Invalid response: missing or invalid message'
    };
  }

  // Success codes are typically 200 or 0
  if (code !== 200 && code !== 0) {
    return {
      isValid: false,
      data: null,
      error: `API error: ${message} (code: ${code})`
    };
  }

  return {
    isValid: true,
    data: data || null
  };
}
/**
 * User model interfaces and types
 */

export interface User {
  id: string;
  nickname: string;
  avatar: string;
  membershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  isLoggedIn: boolean;
}

export interface UserInfo {
  avatar: string;
  nickname: string;
  membershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
}
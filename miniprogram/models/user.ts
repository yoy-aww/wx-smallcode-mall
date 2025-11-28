/**
 * User model interfaces and types for the profile page
 */

export interface User {
  id: string;
  nickname: string;
  avatar: string;
  phone?: string;
  membershipLevel: 'regular' | 'silver' | 'gold' | 'platinum';
  isLoggedIn: boolean;
}

export interface UserInfo {
  avatar: string;
  nickname: string;
  membershipLevel: string;
}

export interface LoginPromptData {
  message: string;
  buttonText: string;
}
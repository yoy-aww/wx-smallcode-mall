/**
 * User service interface for authentication and profile management
 */

import { User, UserInfo } from '../models/user';

export interface IUserService {
  /**
   * Get current user information
   */
  getCurrentUser(): Promise<User | null>;
  
  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean;
  
  /**
   * Login user with phone number
   */
  login(phone: string, code: string): Promise<User>;
  
  /**
   * Logout current user
   */
  logout(): Promise<void>;
  
  /**
   * Get user profile information
   */
  getUserProfile(userId: string): Promise<UserInfo>;
  
  /**
   * Update user profile
   */
  updateUserProfile(userId: string, profile: Partial<UserInfo>): Promise<UserInfo>;
}

export interface UserApiResponse {
  code: number;
  message: string;
  data: User | null;
}

export interface LoginRequest {
  phone: string;
  code: string;
}

export interface LoginResponse {
  code: number;
  message: string;
  data: {
    user: User;
    token: string;
  };
}
/**
 * Simple service factory for WeChat Mini Program
 */

import { UserService } from './user-service';
import { AccountService } from './account-service';
import { OrderService } from './order-service';

/**
 * Simple service factory that creates and manages service instances
 */
class SimpleServiceFactory {
  private static userServiceInstance: UserService | null = null;
  private static accountServiceInstance: AccountService | null = null;
  private static orderServiceInstance: OrderService | null = null;

  /**
   * Get UserService instance
   */
  static getUserService(): UserService {
    if (!SimpleServiceFactory.userServiceInstance) {
      SimpleServiceFactory.userServiceInstance = UserService.getInstance();
    }
    return SimpleServiceFactory.userServiceInstance;
  }

  /**
   * Get AccountService instance
   */
  static getAccountService(): AccountService {
    if (!SimpleServiceFactory.accountServiceInstance) {
      SimpleServiceFactory.accountServiceInstance = AccountService.getInstance();
    }
    return SimpleServiceFactory.accountServiceInstance;
  }

  /**
   * Get OrderService instance
   */
  static getOrderService(): OrderService {
    if (!SimpleServiceFactory.orderServiceInstance) {
      SimpleServiceFactory.orderServiceInstance = OrderService.getInstance();
    }
    return SimpleServiceFactory.orderServiceInstance;
  }

  /**
   * Clear all instances (for testing)
   */
  static clearAll(): void {
    SimpleServiceFactory.userServiceInstance = null;
    SimpleServiceFactory.accountServiceInstance = null;
    SimpleServiceFactory.orderServiceInstance = null;
  }
}

export { SimpleServiceFactory };
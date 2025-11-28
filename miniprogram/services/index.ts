/**
 * Services index - exports all service classes and interfaces
 */

// User Service
export { UserService, IUserService } from './user-service';
export type { 
  UserApiResponse, 
  LoginRequest, 
  LoginResponse 
} from './user-service';

// Account Service
export { AccountService, IAccountService } from './account-service';
export type { 
  AccountApiResponse, 
  BalanceUpdateRequest, 
  PointsUpdateRequest 
} from './account-service';

// Order Service
export { OrderService, IOrderService } from './order-service';
export type { 
  OrderCountsApiResponse, 
  OrderListApiResponse 
} from './order-service';

// Service factory for getting singleton instances
export class ServiceFactory {
  private static userService: UserService;
  private static accountService: AccountService;
  private static orderService: OrderService;

  /**
   * Get UserService singleton instance
   */
  public static getUserService(): UserService {
    if (!ServiceFactory.userService) {
      ServiceFactory.userService = UserService.getInstance();
    }
    return ServiceFactory.userService;
  }

  /**
   * Get AccountService singleton instance
   */
  public static getAccountService(): AccountService {
    if (!ServiceFactory.accountService) {
      ServiceFactory.accountService = AccountService.getInstance();
    }
    return ServiceFactory.accountService;
  }

  /**
   * Get OrderService singleton instance
   */
  public static getOrderService(): OrderService {
    if (!ServiceFactory.orderService) {
      ServiceFactory.orderService = OrderService.getInstance();
    }
    return ServiceFactory.orderService;
  }

  /**
   * Clear all service instances (useful for testing)
   */
  public static clearInstances(): void {
    ServiceFactory.userService = null as any;
    ServiceFactory.accountService = null as any;
    ServiceFactory.orderService = null as any;
  }
}
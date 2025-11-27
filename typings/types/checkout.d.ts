/**
 * Checkout page type definitions
 * Defines interfaces for checkout flow, validation, and state management
 */

/**
 * Checkout page data interface
 */
interface CheckoutPageData extends WechatMiniprogram.Page.DataOption {
  /** Checkout items with product details */
  checkoutItems: CartItemWithProduct[];
  /** Selected delivery address */
  selectedAddress: DeliveryAddress | null;
  /** Order note */
  orderNote: string;
  /** Selected coupon */
  selectedCoupon: Coupon | null;
  /** Price summary */
  summary: CartSummary;
  /** Page loading state */
  loading: boolean;
  /** Error message */
  error: string;
  /** Whether order can be submitted */
  canSubmit: boolean;
  /** Submit button text */
  submitButtonText: string;
  /** Whether to show stock alert */
  showStockAlert: boolean;
  /** Stock error list */
  stockErrors: StockError[];
}

/**
 * Delivery address interface
 */
interface DeliveryAddress {
  /** Address ID */
  id: string;
  /** Recipient name */
  name: string;
  /** Phone number */
  phone: string;
  /** Full address */
  address: string;
  /** Whether this is default address */
  isDefault?: boolean;
  /** Province */
  province?: string;
  /** City */
  city?: string;
  /** District */
  district?: string;
  /** Detailed address */
  detail?: string;
  /** Postal code */
  postalCode?: string;
}

/**
 * Coupon interface
 */
interface Coupon {
  /** Coupon ID */
  id: string;
  /** Coupon name */
  name: string;
  /** Coupon type */
  type: 'discount' | 'amount' | 'shipping';
  /** Discount value */
  value: number;
  /** Minimum order amount */
  minAmount?: number;
  /** Expiry date */
  expiryDate: Date;
  /** Usage conditions */
  conditions?: string;
}

/**
 * Stock error interface
 */
interface StockError {
  /** Product ID */
  productId: string;
  /** Product name */
  productName: string;
  /** Available stock */
  availableStock: number;
  /** Requested quantity */
  requestedQuantity: number;
}

/**
 * Stock validation result
 */
interface StockValidationResult {
  /** Whether stock is valid */
  isValid: boolean;
  /** Stock errors */
  errors: StockError[];
}

/**
 * Checkout state for persistence
 */
interface CheckoutState {
  /** Checkout items */
  items: CartItemWithProduct[];
  /** Price summary */
  summary: CartSummary;
  /** Creation timestamp */
  createdAt: Date;
  /** Whether data is validated */
  validated: boolean;
}

/**
 * Checkout session data
 */
interface CheckoutSession {
  /** Session ID */
  sessionId: string;
  /** Checkout items */
  items: CartItemWithProduct[];
  /** Price summary */
  summary: CartSummary;
  /** Creation timestamp */
  createdAt: Date;
  /** Expiry timestamp */
  expiresAt: Date;
  /** Whether session is validated */
  validated: boolean;
}

/**
 * Order data for submission
 */
interface OrderData {
  /** Order items */
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  /** Delivery address */
  address: DeliveryAddress;
  /** Order note */
  note: string;
  /** Price summary */
  summary: CartSummary;
  /** Payment method */
  paymentMethod: string;
  /** Delivery method */
  deliveryMethod: string;
  /** Applied coupon */
  coupon?: Coupon;
}

/**
 * Checkout preparation result
 */
interface CheckoutPreparationResult {
  /** Checkout items */
  items: CartItemWithProduct[];
  /** Price summary */
  summary: CartSummary;
  /** Validation result */
  validationResult: CartValidationResult;
}

/**
 * Checkout validation response
 */
interface CheckoutValidationResponse {
  /** Whether validation passed */
  isValid: boolean;
  /** Stock errors */
  stockErrors: StockError[];
}

/**
 * Checkout session response
 */
interface CheckoutSessionResponse {
  /** Session ID */
  sessionId: string;
  /** Expiry timestamp */
  expiresAt: Date;
}

/**
 * Checkout page methods interface
 */
interface CheckoutPageMethods {
  /** Page lifecycle methods */
  onLoad(options: Record<string, string>): void;
  onShow(): void;
  onHide(): void;
  onUnload(): void;

  /** Initialization methods */
  initializePage(options: Record<string, string>): Promise<void>;
  parseCheckoutData(options: Record<string, string>): Promise<void>;

  /** Validation methods */
  validateCheckoutData(): Promise<void>;
  validateStock(items: CartItemWithProduct[]): Promise<StockValidationResult>;
  recalculatePrices(): Promise<void>;

  /** User interaction methods */
  onAddressSelect(): void;
  onCouponSelect(): void;
  onNoteInput(event: WechatMiniprogram.Input): void;
  onSubmitOrder(): Promise<void>;

  /** Stock alert methods */
  onCloseStockAlert(): void;
  onBackToCart(): void;

  /** State management methods */
  saveCheckoutState(state?: CheckoutState): Promise<void>;
  getCheckoutState(): Promise<CheckoutState | null>;
  clearCheckoutState(): Promise<void>;

  /** Utility methods */
  updatePageState(): void;
  loadUserAddress(): Promise<void>;
  handleError(message: string): void;
  showToast(message: string, icon?: 'success' | 'error' | 'none'): void;
  onRetry(): Promise<void>;
  cleanup(): void;
}

/**
 * Extended CartService interface for checkout
 */
interface CartServiceCheckoutExtensions {
  /** Prepare checkout data with validation */
  prepareCheckoutData(selectedIds?: string[]): Promise<CartServiceResponse<CheckoutPreparationResult>>;

  /** Validate checkout items for stock */
  validateCheckoutItems(items: CartItemWithProduct[]): Promise<CartServiceResponse<CheckoutValidationResponse>>;

  /** Create checkout session */
  createCheckoutSession(items: CartItemWithProduct[], summary: CartSummary): Promise<CartServiceResponse<CheckoutSessionResponse>>;

  /** Get checkout session */
  getCheckoutSession(sessionId: string): Promise<CartServiceResponse<CheckoutSession | null>>;

  /** Clear checkout session */
  clearCheckoutSession(sessionId: string): Promise<CartServiceResponse<boolean>>;
}

/**
 * Checkout event types
 */
declare enum CheckoutEventType {
  SESSION_CREATED = 'checkout:session_created',
  VALIDATION_COMPLETED = 'checkout:validation_completed',
  STOCK_ERROR = 'checkout:stock_error',
  ORDER_SUBMITTED = 'checkout:order_submitted',
  SESSION_EXPIRED = 'checkout:session_expired'
}

/**
 * Checkout event data
 */
interface CheckoutEventData {
  sessionId?: string;
  items?: CartItemWithProduct[];
  stockErrors?: StockError[];
  orderId?: string;
  error?: string;
}

/**
 * Checkout constants
 */
declare const CHECKOUT_CONSTANTS: {
  readonly SESSION_EXPIRY_MINUTES: 30;
  readonly MAX_ORDER_NOTE_LENGTH: 200;
  readonly STOCK_CHECK_RETRY_COUNT: 3;
  readonly VALIDATION_DEBOUNCE_MS: 500;
};

/**
 * Checkout storage keys
 */
declare const CHECKOUT_STORAGE_KEYS: {
  readonly CHECKOUT_STATE: 'checkout_state';
  readonly CHECKOUT_SESSION_PREFIX: 'checkout_session_';
  readonly SELECTED_ADDRESS: 'selected_address';
  readonly ORDER_DRAFT: 'order_draft';
};

/**
 * Checkout error types
 */
declare enum CheckoutErrorType {
  STOCK_INSUFFICIENT = 'stock_insufficient',
  PRODUCT_UNAVAILABLE = 'product_unavailable',
  ADDRESS_REQUIRED = 'address_required',
  PAYMENT_FAILED = 'payment_failed',
  SESSION_EXPIRED = 'session_expired',
  VALIDATION_FAILED = 'validation_failed'
}

/**
 * Checkout error interface
 */
interface CheckoutError {
  /** Error type */
  type: CheckoutErrorType;
  /** Error message */
  message: string;
  /** Related product ID */
  productId?: string;
  /** Additional error data */
  data?: any;
  /** Whether error is recoverable */
  recoverable: boolean;
}
/**
 * Shopping cart page type definitions
 * Extends existing cart types with page-specific interfaces for selection, state management, and error handling
 */

/**
 * Basic product interface
 */
interface Product {
  /** Product ID */
  id: string;
  /** Product name */
  name: string;
  /** Product image URL */
  image: string;
  /** Original price */
  originalPrice: number;
  /** Discounted price (optional) */
  discountedPrice?: number;
  /** Category ID */
  categoryId: string;
  /** Product description */
  description?: string;
  /** Available stock */
  stock: number;
  /** Product tags */
  tags?: string[];
}

/**
 * Basic cart item interface
 */
interface CartItem {
  /** Product ID */
  productId: string;
  /** Quantity in cart */
  quantity: number;
  /** When item was added/updated */
  selectedAt: Date;
}

/**
 * Cart item selection state
 */
interface CartItemSelection {
  /** Product ID */
  productId: string;
  /** Whether the item is selected */
  selected: boolean;
}

/**
 * Cart operation result
 */
interface CartOperationResult {
  /** Operation success status */
  success: boolean;
  /** List of affected product IDs */
  affectedItems: string[];
  /** Success message */
  message?: string;
  /** Error message if operation failed */
  error?: string;
}

/**
 * Cart validation result
 */
interface CartValidationResult {
  /** Valid cart items */
  validItems: CartItemWithProduct[];
  /** Invalid cart items (removed products) */
  invalidItems: CartItem[];
  /** Items with adjusted stock quantities */
  stockAdjustedItems: CartItem[];
}

/**
 * Cart page state management
 */
interface CartPageState {
  /** Cart items with product details */
  items: CartItemWithProduct[];
  /** Selection state map (productId -> selected) */
  selections: Map<string, boolean>;
  /** Whether page is in edit mode */
  editMode: boolean;
  /** Page loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
}

/**
 * Cart page data interface
 */
interface CartPageData extends WechatMiniprogram.Page.DataOption {
  /** Cart items with product details */
  cartItems: CartItemWithProduct[];
  /** Selected item IDs */
  selectedItems: string[];
  /** Whether all items are selected */
  selectAll: boolean;
  /** Page loading state */
  loading: boolean;
  /** Error message */
  error: string;
  /** Cart summary information */
  summary: {
    /** Total number of selected items */
    totalItems: number;
    /** Total price of selected items */
    totalPrice: number;
    /** Discount amount */
    discountAmount: number;
    /** Final price after discount */
    finalPrice: number;
  };
  /** Whether page is in edit mode */
  editMode: boolean;
}

/**
 * Cart error types
 */
enum CartErrorType {
  NETWORK_ERROR = 'network_error',
  STORAGE_ERROR = 'storage_error',
  VALIDATION_ERROR = 'validation_error',
  STOCK_ERROR = 'stock_error',
  PERMISSION_ERROR = 'permission_error',
}

/**
 * Cart error interface
 */
interface CartError {
  /** Error type */
  type: CartErrorType;
  /** Error message */
  message: string;
  /** Related product ID (optional) */
  productId?: string;
  /** Whether the operation can be retried */
  retryable: boolean;
}

/**
 * Cart page methods interface
 */
interface CartPageMethods {
  /** Page lifecycle methods */
  onLoad(): void;
  onShow(): void;
  onHide(): void;

  /** Data loading methods */
  loadCartData(): Promise<void>;
  refreshCartData(): Promise<void>;

  /** Item selection methods */
  onItemSelect(productId: string): void;
  onSelectAll(): void;

  /** Quantity adjustment methods */
  onQuantityChange(productId: string, quantity: number): void;
  onQuantityIncrease(productId: string): void;
  onQuantityDecrease(productId: string): void;

  /** Item deletion methods */
  onItemDelete(productId: string): void;
  onBatchDelete(): void;

  /** Checkout methods */
  onCheckout(): void;

  /** Edit mode methods */
  toggleEditMode(): void;

  /** Error handling methods */
  handleError(error: string): void;
  showToast(message: string): void;
}

/**
 * Storage keys for cart data persistence
 */
declare const CART_STORAGE_KEYS: {
  readonly CART_ITEMS: 'shopping_cart';
  readonly CART_SELECTIONS: 'cart_selections';
  readonly CART_BADGE: 'cart_badge_count';
};

/**
 * Cart selections storage format
 */
interface CartSelectionsStorage {
  [productId: string]: boolean;
}

/**
 * Extended CartService interface with selection functionality
 */
interface CartServiceExtensions {
  /** Select multiple items */
  selectItems(productIds: string[]): Promise<CartServiceResponse<boolean>>;

  /** Get selected items */
  getSelectedItems(): Promise<CartServiceResponse<CartItemWithProduct[]>>;

  /** Batch remove items from cart */
  batchRemoveFromCart(productIds: string[]): Promise<CartServiceResponse<boolean>>;

  /** Validate cart items */
  validateCartItems(): Promise<CartServiceResponse<CartValidationResult>>;

  /** Calculate total for selected items */
  calculateSelectedTotal(selectedIds: string[]): Promise<CartServiceResponse<CartSummary>>;
}

/**
 * Cart component props interfaces
 */

/**
 * Cart item component props
 */
interface CartItemProps {
  /** Cart item with product details */
  item: CartItemWithProduct;
  /** Whether item is selected */
  selected: boolean;
  /** Whether page is in edit mode */
  editMode: boolean;
  /** Selection change callback */
  onSelect: (productId: string) => void;
  /** Quantity change callback */
  onQuantityChange: (productId: string, quantity: number) => void;
  /** Delete callback */
  onDelete: (productId: string) => void;
}

/**
 * Quantity selector component props
 */
interface QuantitySelectorProps {
  /** Current quantity */
  quantity: number;
  /** Maximum allowed quantity */
  maxQuantity: number;
  /** Minimum allowed quantity */
  minQuantity: number;
  /** Whether selector is disabled */
  disabled: boolean;
  /** Quantity change callback */
  onChange: (quantity: number) => void;
}

/**
 * Cart bottom bar component props
 */
interface CartBottomBarProps {
  /** Whether all items are selected */
  selectAll: boolean;
  /** Number of selected items */
  selectedCount: number;
  /** Total price of selected items */
  totalPrice: number;
  /** Discount amount */
  discountAmount: number;
  /** Final price after discount */
  finalPrice: number;
  /** Whether page is in edit mode */
  editMode: boolean;
  /** Select all callback */
  onSelectAll: () => void;
  /** Checkout callback */
  onCheckout: () => void;
  /** Batch delete callback */
  onBatchDelete: () => void;
}

/**
 * Cart page event handlers
 */
declare namespace CartPageEvents {
  /** Item selection event handler */
  type ItemSelectHandler = (productId: string) => void;

  /** Quantity change event handler */
  type QuantityChangeHandler = (productId: string, quantity: number) => void;

  /** Item delete event handler */
  type ItemDeleteHandler = (productId: string) => void;

  /** Checkout event handler */
  type CheckoutHandler = () => void;

  /** Generic cart event handler */
  type CartEventHandler<T extends WechatMiniprogram.IAnyObject = WechatMiniprogram.IAnyObject> = (
    event: WechatMiniprogram.BaseEvent<T>
  ) => void;
}

/**
 * Cart manager event types
 */
interface CartManagerEvents {
  /** Item added to cart */
  itemAdded: { productId: string; quantity: number };
  /** Item removed from cart */
  itemRemoved: { productId: string };
  /** Item quantity updated */
  itemUpdated: { productId: string; quantity: number };
  /** Cart cleared */
  cartCleared: {};
  /** Item selection changed */
  selectionChanged: { productId: string; selected: boolean };
  /** Batch operation completed */
  batchOperationCompleted: { operation: string; affectedItems: string[] };
}

/**
 * Cart state synchronization interface
 */
interface CartStateSynchronizer {
  /** Sync cart state to storage */
  syncToStorage(): Promise<void>;
  /** Sync cart state from storage */
  syncFromStorage(): Promise<void>;
  /** Sync selection state */
  syncSelections(selections: Map<string, boolean>): Promise<void>;
  /** Get selection state */
  getSelections(): Promise<Map<string, boolean>>;
}

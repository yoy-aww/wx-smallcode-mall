/**
 * Cart constants and configuration
 * Centralized constants for cart functionality
 */

/**
 * Storage keys for cart data persistence
 */
export const CART_STORAGE_KEYS = {
  CART_ITEMS: 'shopping_cart',
  CART_SELECTIONS: 'cart_selections',
  CART_BADGE: 'cart_badge_count',
} as const;

/**
 * Cart error messages
 */
export const CART_ERROR_MESSAGES = {
  UNKNOWN_ERROR: '未知错误',
  NETWORK_ERROR: '网络连接失败',
  STORAGE_ERROR: '存储操作失败',
  VALIDATION_ERROR: '数据验证失败',
  STOCK_ERROR: '库存不足',
  PERMISSION_ERROR: '权限不足',
  PRODUCT_NOT_FOUND: '商品不存在',
  INVALID_QUANTITY: '数量无效',
  CART_EMPTY: '购物车为空',
  CHECKOUT_FAILED: '结算失败',
} as const;

/**
 * Cart validation rules
 */
export const CART_VALIDATION = {
  MAX_QUANTITY: 999,
  MIN_QUANTITY: 1,
  MAX_ITEMS: 100,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes
  DATA_EXPIRY_DAYS: 7, // 7 days
} as const;

/**
 * Cart operation types
 */
export const CART_OPERATIONS = {
  ADD_ITEM: 'add_item',
  REMOVE_ITEM: 'remove_item',
  UPDATE_QUANTITY: 'update_quantity',
  SELECT_ITEM: 'select_item',
  SELECT_ALL: 'select_all',
  CLEAR_CART: 'clear_cart',
  CHECKOUT: 'checkout',
} as const;

/**
 * Cart event types
 */
export const CART_EVENTS = {
  ITEM_ADDED: 'item_added',
  ITEM_REMOVED: 'item_removed',
  ITEM_UPDATED: 'item_updated',
  SELECTION_CHANGED: 'selection_changed',
  CART_CLEARED: 'cart_cleared',
  CHECKOUT_STARTED: 'checkout_started',
  CHECKOUT_COMPLETED: 'checkout_completed',
} as const;

/**
 * Cart performance settings
 */
export const CART_PERFORMANCE = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 50,
} as const;
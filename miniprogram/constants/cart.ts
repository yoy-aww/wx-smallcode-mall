/**
 * Cart-related constants and storage keys
 */

/**
 * Storage keys for cart data persistence
 */
export const CART_STORAGE_KEYS = {
  CART_ITEMS: 'shopping_cart',
  CART_SELECTIONS: 'cart_selections',
  CART_BADGE: 'cart_badge_count'
} as const;

/**
 * Cart operation types
 */
export const CART_OPERATIONS = {
  ADD: 'add',
  REMOVE: 'remove',
  UPDATE: 'update',
  SELECT: 'select',
  SELECT_ALL: 'selectAll',
  CLEAR_SELECTIONS: 'clearSelections',
  BATCH_DELETE: 'batchDelete'
} as const;

/**
 * Cart validation constants
 */
export const CART_VALIDATION = {
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 999,
  DATA_EXPIRY_DAYS: 7
} as const;

/**
 * Cart error messages
 */
export const CART_ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  STORAGE_ERROR: '数据存储失败，请重试',
  VALIDATION_ERROR: '数据验证失败，请检查输入',
  STOCK_ERROR: '库存不足，请调整数量',
  PERMISSION_ERROR: '权限不足，请先登录',
  UNKNOWN_ERROR: '操作失败，请重试'
} as const;

/**
 * Cart UI constants
 */
export const CART_UI = {
  TOAST_DURATION: 2000,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  MAX_BADGE_COUNT: 99
} as const;

/**
 * Cart synchronization constants
 */
export const CART_SYNC = {
  AUTO_SYNC_DEBOUNCE: 1000,
  MAINTENANCE_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  CONFLICT_RESOLUTION_STRATEGY: 'local_priority',
  MAX_BACKUP_COUNT: 5
} as const;

/**
 * Cart data validation constants
 */
export const CART_DATA_VALIDATION = {
  MAX_PRODUCT_NAME_LENGTH: 100,
  MAX_QUANTITY_PER_ITEM: 999,
  MIN_QUANTITY_PER_ITEM: 1,
  MAX_CART_ITEMS: 100,
  PRICE_CACHE_EXPIRY: 60 * 60 * 1000 // 1 hour
} as const;
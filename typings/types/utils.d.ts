/**
 * Utility type definitions for common patterns
 */

/**
 * API response wrapper type
 */
interface ApiResponse<T = any> {
  /** Success status */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error message if failed */
  message?: string;
  /** Error code if failed */
  code?: number;
}

/**
 * Pagination parameters for API requests
 */
interface PaginationParams {
  /** Page number (1-based) */
  page: number;
  /** Items per page */
  pageSize: number;
}

/**
 * Paginated response wrapper
 */
interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  /** Pagination metadata */
  pagination: {
    /** Current page */
    page: number;
    /** Items per page */
    pageSize: number;
    /** Total number of items */
    total: number;
    /** Total number of pages */
    totalPages: number;
    /** Whether there are more pages */
    hasMore: boolean;
  };
}

/**
 * Generic callback function type
 */
type Callback<T = void> = (result: T) => void;

/**
 * Generic error callback function type
 */
type ErrorCallback = (error: Error | string) => void;

/**
 * Promise-based operation result
 */
type OperationResult<T = void> = Promise<{
  success: boolean;
  data?: T;
  error?: string;
}>;

/**
 * Image loading states
 */
type ImageLoadState = 'loading' | 'loaded' | 'error';

/**
 * Network request states
 */
type RequestState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Common component states
 */
interface ComponentState {
  /** Loading state */
  loading: boolean;
  /** Error message */
  error?: string;
  /** Whether component is visible */
  visible: boolean;
  /** Whether component is disabled */
  disabled: boolean;
}
/**
 * Shopping cart type declarations
 * Local declarations inside miniprogramRoot for WeChat DevTools TypeScript compiler
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
  /** Product specs (optional) */
  specs?: any[];
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
  /** Selected spec (optional) */
  selectedSpec?: any;
}

/**
 * Cart service response interface
 */
interface CartServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Extended cart item with product details
 */
interface CartItemWithProduct extends CartItem {
  product: Product;
}

/**
 * Cart summary information
 */
interface CartSummary {
  totalItems: number;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
}
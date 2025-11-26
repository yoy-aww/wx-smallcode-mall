/**
 * Category-related type definitions for the category page
 */

/**
 * Category model representing a product category
 */
interface Category {
  /** Unique identifier for the category */
  id: string;
  /** Display name of the category */
  name: string;
  /** Optional icon URL or identifier */
  icon?: string;
  /** Number of products in this category */
  productCount: number;
  /** Sort order for category display */
  sortOrder: number;
}

/**
 * Product model representing a product item
 */
interface Product {
  /** Unique identifier for the product */
  id: string;
  /** Product name */
  name: string;
  /** Product image URL */
  image: string;
  /** Original price before discount */
  originalPrice: number;
  /** Discounted price (optional) */
  discountedPrice?: number;
  /** Category this product belongs to */
  categoryId: string;
  /** Product description (optional) */
  description?: string;
  /** Available stock quantity */
  stock: number;
  /** Product tags (optional) */
  tags?: string[];
}

/**
 * Cart item model representing an item in the shopping cart
 */
interface CartItem {
  /** Product ID in the cart */
  productId: string;
  /** Quantity of the product */
  quantity: number;
  /** When the item was added to cart */
  selectedAt: Date;
}

/**
 * Page data interface for CategoryPage component
 */
interface CategoryPageData {
  /** List of available categories */
  categories: Category[];
  /** Currently selected category ID */
  selectedCategoryId: string;
  /** Products for the selected category */
  products: Product[];
  /** Loading state for initial page load */
  loading: boolean;
  /** Loading state for product data */
  productLoading: boolean;
}
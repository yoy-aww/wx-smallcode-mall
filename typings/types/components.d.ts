/**
 * Component props and event handler type definitions for category page components
 */

/**
 * Props for CategorySidebar component
 */
interface CategorySidebarProps {
  /** List of categories to display */
  categories: Category[];
  /** Currently selected category ID */
  selectedCategoryId: string;
  /** Callback when a category is selected */
  onCategorySelect: (categoryId: string) => void;
}

/**
 * Props for ProductCard component
 */
interface ProductCardProps {
  /** Product data to display */
  product: Product;
  /** Callback when product card is tapped */
  onProductTap: (productId: string) => void;
  /** Callback when add to cart button is tapped */
  onAddToCart: (productId: string) => void;
}

/**
 * Props for ProductList component
 */
interface ProductListProps {
  /** List of products to display */
  products: Product[];
  /** Loading state for products */
  loading: boolean;
  /** Callback when product card is tapped */
  onProductTap: (productId: string) => void;
  /** Callback when add to cart button is tapped */
  onAddToCart: (productId: string) => void;
}

/**
 * Event handler types for category page interactions
 */
declare namespace CategoryPageEvents {
  /** Category selection event handler */
  type CategorySelectHandler = (categoryId: string) => void;
  
  /** Product tap event handler */
  type ProductTapHandler = (productId: string) => void;
  
  /** Add to cart event handler */
  type AddToCartHandler = (productId: string) => void;
  
  /** Generic event handler for WeChat Mini Program events */
  type WxEventHandler<T extends WechatMiniprogram.IAnyObject = WechatMiniprogram.IAnyObject> = (event: WechatMiniprogram.BaseEvent<T>) => void;
  
  /** Touch event handler for gestures */
  type TouchEventHandler = (event: WechatMiniprogram.TouchEvent) => void;
}

/**
 * Loading state types for different components
 */
interface LoadingStates {
  /** Category loading state */
  categories: boolean;
  /** Product loading state */
  products: boolean;
  /** Add to cart operation state */
  addToCart: boolean;
}

/**
 * Error state types for error handling
 */
interface ErrorStates {
  /** Category loading error */
  categoryError?: string;
  /** Product loading error */
  productError?: string;
  /** Add to cart error */
  cartError?: string;
}
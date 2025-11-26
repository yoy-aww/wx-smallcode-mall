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

/**
 * ProductCard component type definitions
 */

/**
 * ProductCard component properties
 */
interface ProductCardProperties {
  /** Product data to display */
  product: Product | null;
}

/**
 * ProductCard component data
 */
interface ProductCardData {
  /** Image loading state */
  imageLoading: boolean;
  /** Image error state */
  imageError: boolean;
  /** Add to cart loading state */
  addingToCart: boolean;
  /** Calculated discount percentage */
  discountPercentage: number;
}

/**
 * ProductCard component methods
 */
interface ProductCardMethods {
  /** Handle product data change */
  onProductChange: (newProduct: Product) => void;
  /** Calculate discount percentage */
  calculateDiscount: () => void;
  /** Handle image load success */
  onImageLoad: () => void;
  /** Handle image load error */
  onImageError: () => void;
  /** Handle product card tap */
  onProductTap: () => void;
  /** Handle add to cart button tap */
  onAddToCart: () => Promise<void>;
  /** Get display price */
  getDisplayPrice: () => string;
  /** Get original price */
  getOriginalPrice: () => string;
  /** Check if product has discount */
  hasDiscount: () => boolean;
  /** Get stock status text */
  getStockStatusText: () => string;
  /** Retry image loading */
  retryImageLoad: () => void;
  /** Show add to cart animation */
  showAddToCartAnimation: () => void;
  /** Trigger success animation */
  triggerSuccessAnimation: () => void;
  /** Handle add to cart error */
  handleAddToCartError: (errorMessage: string) => void;
  /** Retry add to cart */
  retryAddToCart: () => Promise<void>;
}

/**
 * ProductCard component events
 */
declare namespace ProductCardEvents {
  /** Product tap event detail */
  interface ProductTapDetail {
    productId: string;
    product: Product;
  }
  
  /** Add to cart event detail */
  interface AddToCartDetail {
    productId: string;
    product: Product;
    quantity: number;
  }
}
/**
 * Page-specific type definitions for WeChat Mini Program pages
 */

/**
 * Category page data interface extending WeChat Mini Program page data
 */
interface CategoryPageData extends WechatMiniprogram.Page.DataOption {
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
  /** Error states for different operations */
  errors: ErrorStates;
  /** Loading states for different operations */
  loadingStates: LoadingStates;
}

/**
 * Category page methods interface
 */
interface CategoryPageMethods {
  /** Handle category selection */
  onCategorySelect: CategoryPageEvents.CategorySelectHandler;
  /** Handle product tap */
  onProductTap: CategoryPageEvents.ProductTapHandler;
  /** Handle add to cart */
  onAddToCart: CategoryPageEvents.AddToCartHandler;
  /** Load categories from API */
  loadCategories: () => Promise<void>;
  /** Load products for selected category */
  loadProducts: (categoryId: string) => Promise<void>;
  /** Handle loading states */
  setLoading: (type: keyof LoadingStates, loading: boolean) => void;
  /** Handle error states */
  setError: (type: keyof ErrorStates, error?: string) => void;
}

/**
 * Complete category page interface combining data and methods
 */
interface CategoryPage extends CategoryPageData, CategoryPageMethods, WechatMiniprogram.Page.InstanceMethods<CategoryPageData> {
  data: CategoryPageData;
}

/**
 * Category page options for Page() constructor
 */
interface CategoryPageOptions extends WechatMiniprogram.Page.Options<CategoryPageData, WechatMiniprogram.Page.CustomOption> {
  data: CategoryPageData;
  onLoad: (options?: Record<string, string | undefined>) => void;
  onReady?: () => void;
  onShow?: () => void;
  onHide?: () => void;
  onUnload?: () => void;
  onCategorySelect: CategoryPageEvents.CategorySelectHandler;
  onProductTap: CategoryPageEvents.ProductTapHandler;
  onAddToCart: CategoryPageEvents.AddToCartHandler;
}
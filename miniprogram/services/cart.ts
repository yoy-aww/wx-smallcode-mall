// services/cart.ts
/**
 * Shopping cart service for managing cart operations
 */

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

import { CART_STORAGE_KEYS, CART_ERROR_MESSAGES } from '../constants/cart';

/**
 * Cart service class for managing shopping cart operations
 * Extended with selection and batch operation functionality
 */
export class CartService {
  private static readonly CART_STORAGE_KEY = CART_STORAGE_KEYS.CART_ITEMS;
  private static readonly CART_BADGE_KEY = CART_STORAGE_KEYS.CART_BADGE;

  /**
   * Add product to cart
   */
  static async addToCart(
    productId: string,
    quantity: number = 1
  ): Promise<CartServiceResponse<CartItem>> {
    try {
      console.log('Adding product to cart:', productId, quantity);

      // Validate product and stock
      const { ProductService } = await import('./product');
      const productResponse = await ProductService.getProductById(productId);

      if (!productResponse.success || !productResponse.data) {
        return {
          success: false,
          error: CART_ERROR_MESSAGES.VALIDATION_ERROR,
        };
      }

      const product = productResponse.data;

      // Get current cart items
      const cartItems = await this.getCartItems();

      // Check if product already exists in cart
      const existingItemIndex = cartItems.findIndex(item => item.productId === productId);
      let finalQuantity = quantity;

      if (existingItemIndex >= 0) {
        finalQuantity = cartItems[existingItemIndex].quantity + quantity;
      }

      // Check stock availability
      if (finalQuantity > product.stock) {
        return {
          success: false,
          error: CART_ERROR_MESSAGES.STOCK_ERROR,
        };
      }

      if (existingItemIndex >= 0) {
        // Update quantity if product already exists
        cartItems[existingItemIndex].quantity = finalQuantity;
        cartItems[existingItemIndex].selectedAt = new Date();
      } else {
        // Add new item to cart
        const newItem: CartItem = {
          productId,
          quantity,
          selectedAt: new Date(),
        };
        cartItems.push(newItem);
      }

      // Save updated cart
      await this.saveCartItems(cartItems);

      // Update cart badge
      await this.updateCartBadge();

      // Notify cart manager
      const { CartManager } = await import('../utils/cart-manager');
      CartManager.notifyItemAdded(productId, quantity);

      console.log('Product added to cart successfully');

      return {
        success: true,
        data: cartItems.find(item => item.productId === productId),
      };
    } catch (error) {
      console.error('Error adding product to cart:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Remove product from cart
   */
  static async removeFromCart(productId: string): Promise<CartServiceResponse<boolean>> {
    try {
      console.log('Removing product from cart:', productId);

      const cartItems = await this.getCartItems();
      const filteredItems = cartItems.filter(item => item.productId !== productId);

      await this.saveCartItems(filteredItems);
      await this.updateCartBadge();

      // Notify cart manager
      const { CartManager } = await import('../utils/cart-manager');
      CartManager.notifyItemRemoved(productId);

      console.log('Product removed from cart successfully');

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error('Error removing product from cart:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Update product quantity in cart
   */
  static async updateCartItemQuantity(
    productId: string,
    quantity: number
  ): Promise<CartServiceResponse<CartItem>> {
    try {
      console.log('Updating cart item quantity:', productId, quantity);

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        await this.removeFromCart(productId);
        return {
          success: true,
          data: undefined,
        };
      }

      // Validate quantity against stock
      const { ProductService } = await import('./product');
      const productResponse = await ProductService.getProductById(productId);

      if (productResponse.success && productResponse.data) {
        const product = productResponse.data;
        if (quantity > product.stock) {
          return {
            success: false,
            error: CART_ERROR_MESSAGES.STOCK_ERROR,
          };
        }
      }

      const cartItems = await this.getCartItems();
      const itemIndex = cartItems.findIndex(item => item.productId === productId);

      if (itemIndex >= 0) {
        cartItems[itemIndex].quantity = quantity;
        cartItems[itemIndex].selectedAt = new Date();

        await this.saveCartItems(cartItems);
        await this.updateCartBadge();

        // Notify cart manager
        const { CartManager } = await import('../utils/cart-manager');
        CartManager.notifyItemUpdated(productId, quantity);

        return {
          success: true,
          data: cartItems[itemIndex],
        };
      } else {
        return {
          success: false,
          error: CART_ERROR_MESSAGES.VALIDATION_ERROR,
        };
      }
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Get all cart items
   */
  static async getCartItems(): Promise<CartItem[]> {
    try {
      const cartData = wx.getStorageSync(this.CART_STORAGE_KEY);

      if (!cartData) {
        return [];
      }

      // Parse and validate cart data
      const cartItems: CartItem[] = JSON.parse(cartData);

      // Convert selectedAt strings back to Date objects
      return cartItems.map(item => ({
        ...item,
        selectedAt: new Date(item.selectedAt),
      }));
    } catch (error) {
      console.error('Error getting cart items:', error);
      return [];
    }
  }

  /**
   * Get cart items with product details
   */
  static async getCartItemsWithProducts(): Promise<CartServiceResponse<CartItemWithProduct[]>> {
    try {
      const cartItems = await this.getCartItems();

      if (cartItems.length === 0) {
        return {
          success: true,
          data: [],
        };
      }

      // Import ProductService dynamically to avoid circular dependency
      const { ProductService } = await import('./product');

      const cartItemsWithProducts: CartItemWithProduct[] = [];

      for (const cartItem of cartItems) {
        const productResponse = await ProductService.getProductById(cartItem.productId);

        if (productResponse.success && productResponse.data) {
          cartItemsWithProducts.push({
            ...cartItem,
            product: productResponse.data,
          });
        }
      }

      return {
        success: true,
        data: cartItemsWithProducts,
      };
    } catch (error) {
      console.error('Error getting cart items with products:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Get cart summary
   */
  static async getCartSummary(): Promise<CartServiceResponse<CartSummary>> {
    try {
      const cartItemsResponse = await this.getCartItemsWithProducts();

      if (!cartItemsResponse.success || !cartItemsResponse.data) {
        return {
          success: false,
          error: cartItemsResponse.error || '获取购物车信息失败',
        };
      }

      const cartItems = cartItemsResponse.data;

      let totalItems = 0;
      let totalPrice = 0;
      let discountAmount = 0;

      for (const item of cartItems) {
        totalItems += item.quantity;

        const itemPrice = item.product.discountedPrice || item.product.originalPrice;
        totalPrice += itemPrice * item.quantity;

        if (item.product.discountedPrice) {
          discountAmount +=
            (item.product.originalPrice - item.product.discountedPrice) * item.quantity;
        }
      }

      const finalPrice = totalPrice;

      return {
        success: true,
        data: {
          totalItems,
          totalPrice: totalPrice + discountAmount, // Original total
          discountAmount,
          finalPrice,
        },
      };
    } catch (error) {
      console.error('Error getting cart summary:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Clear entire cart
   */
  static async clearCart(): Promise<CartServiceResponse<boolean>> {
    try {
      console.log('Clearing cart');

      await this.saveCartItems([]);
      await this.updateCartBadge();

      // Notify cart manager
      const { CartManager } = await import('../utils/cart-manager');
      CartManager.notifyCartCleared();

      console.log('Cart cleared successfully');

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Get cart item count
   */
  static async getCartItemCount(): Promise<number> {
    try {
      const cartItems = await this.getCartItems();
      return cartItems.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error('Error getting cart item count:', error);
      return 0;
    }
  }

  /**
   * Check if product is in cart
   */
  static async isProductInCart(productId: string): Promise<boolean> {
    try {
      const cartItems = await this.getCartItems();
      return cartItems.some(item => item.productId === productId);
    } catch (error) {
      console.error('Error checking if product is in cart:', error);
      return false;
    }
  }

  /**
   * Get product quantity in cart
   */
  static async getProductQuantityInCart(productId: string): Promise<number> {
    try {
      const cartItems = await this.getCartItems();
      const cartItem = cartItems.find(item => item.productId === productId);
      return cartItem ? cartItem.quantity : 0;
    } catch (error) {
      console.error('Error getting product quantity in cart:', error);
      return 0;
    }
  }

  /**
   * Save cart items to storage
   */
  private static async saveCartItems(cartItems: CartItem[]): Promise<void> {
    try {
      const cartData = JSON.stringify(cartItems);
      wx.setStorageSync(this.CART_STORAGE_KEY, cartData);
    } catch (error) {
      console.error('Error saving cart items:', error);
      throw new Error(CART_ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  /**
   * Update cart badge count in tab bar
   */
  private static async updateCartBadge(): Promise<void> {
    try {
      const itemCount = await this.getCartItemCount();

      // Update tab bar badge
      if (itemCount > 0) {
        wx.setTabBarBadge({
          index: 2, // Assuming cart is the 3rd tab (index 2)
          text: itemCount > 99 ? '99+' : itemCount.toString(),
        });
      } else {
        wx.removeTabBarBadge({
          index: 2,
        });
      }

      // Store badge count for other components to access
      wx.setStorageSync(this.CART_BADGE_KEY, itemCount);

      console.log('Cart badge updated:', itemCount);
    } catch (error) {
      console.error('Error updating cart badge:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Get current cart badge count
   */
  static getCartBadgeCount(): number {
    try {
      return wx.getStorageSync(this.CART_BADGE_KEY) || 0;
    } catch (error) {
      console.error('Error getting cart badge count:', error);
      return 0;
    }
  }

  /**
   * Validate cart items (remove invalid products)
   */
  static async validateCart(): Promise<CartServiceResponse<boolean>> {
    try {
      console.log('Validating cart items');

      const cartItems = await this.getCartItems();
      const { ProductService } = await import('./product');

      const validCartItems: CartItem[] = [];

      for (const cartItem of cartItems) {
        const productResponse = await ProductService.getProductById(cartItem.productId);

        if (productResponse.success && productResponse.data) {
          // Check if product is still available and has stock
          const product = productResponse.data;
          if (product.stock > 0) {
            // Adjust quantity if it exceeds available stock
            const adjustedQuantity = Math.min(cartItem.quantity, product.stock);
            validCartItems.push({
              ...cartItem,
              quantity: adjustedQuantity,
            });
          }
        }
      }

      // Save validated cart
      await this.saveCartItems(validCartItems);
      await this.updateCartBadge();

      console.log('Cart validation completed');

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error('Error validating cart:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.VALIDATION_ERROR,
      };
    }
  }

  // Extended functionality for shopping cart page

  /**
   * Select multiple items in cart
   */
  static async selectItems(productIds: string[]): Promise<CartServiceResponse<boolean>> {
    try {
      console.log('Selecting cart items:', productIds);

      const selections = await this.getSelections();

      // Update selections
      productIds.forEach(productId => {
        selections.set(productId, true);
      });

      await this.saveSelections(selections);

      // Notify cart manager
      const { CartManager } = await import('../utils/cart-manager');
      productIds.forEach(productId => {
        CartManager.notifySelectionChanged(productId, true);
      });

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error('Error selecting cart items:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Get selected cart items with product details
   */
  static async getSelectedItems(): Promise<CartServiceResponse<CartItemWithProduct[]>> {
    try {
      const cartItemsResponse = await this.getCartItemsWithProducts();

      if (!cartItemsResponse.success || !cartItemsResponse.data) {
        return {
          success: false,
          error: cartItemsResponse.error || '获取购物车商品失败',
        };
      }

      const selections = await this.getSelections();
      const selectedItems = cartItemsResponse.data.filter(
        item => selections.get(item.productId) === true
      );

      return {
        success: true,
        data: selectedItems,
      };
    } catch (error) {
      console.error('Error getting selected items:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Batch remove items from cart
   */
  static async batchRemoveFromCart(productIds: string[]): Promise<CartServiceResponse<boolean>> {
    try {
      console.log('Batch removing items from cart:', productIds);

      const cartItems = await this.getCartItems();
      const filteredItems = cartItems.filter(item => !productIds.includes(item.productId));

      await this.saveCartItems(filteredItems);
      await this.updateCartBadge();

      // Remove from selections
      const selections = await this.getSelections();
      productIds.forEach(productId => {
        selections.delete(productId);
      });
      await this.saveSelections(selections);

      // Notify cart manager
      const { CartManager } = await import('../utils/cart-manager');
      CartManager.notifyBatchOperationCompleted('remove', productIds);

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error('Error batch removing items:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Validate cart items with detailed results
   */
  static async validateCartItems(): Promise<CartServiceResponse<CartValidationResult>> {
    try {
      console.log('Validating cart items with details');

      const cartItems = await this.getCartItems();
      const { ProductService } = await import('./product');

      const validItems: CartItemWithProduct[] = [];
      const invalidItems: CartItem[] = [];
      const stockAdjustedItems: CartItem[] = [];

      for (const cartItem of cartItems) {
        const productResponse = await ProductService.getProductById(cartItem.productId);

        if (productResponse.success && productResponse.data) {
          const product = productResponse.data;

          if (product.stock > 0) {
            if (cartItem.quantity > product.stock) {
              // Stock adjusted item
              const adjustedItem = {
                ...cartItem,
                quantity: product.stock,
              };
              stockAdjustedItems.push(adjustedItem);
              validItems.push({
                ...adjustedItem,
                product,
              });
            } else {
              // Valid item
              validItems.push({
                ...cartItem,
                product,
              });
            }
          } else {
            // No stock - invalid item
            invalidItems.push(cartItem);
          }
        } else {
          // Product not found - invalid item
          invalidItems.push(cartItem);
        }
      }

      // Save only valid items
      const validCartItems = validItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        selectedAt: item.selectedAt,
      }));

      await this.saveCartItems(validCartItems);
      await this.updateCartBadge();

      const result: CartValidationResult = {
        validItems,
        invalidItems,
        stockAdjustedItems,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error validating cart items:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.VALIDATION_ERROR,
      };
    }
  }

  /**
   * Calculate total for selected items
   */
  static async calculateSelectedTotal(
    selectedIds: string[]
  ): Promise<CartServiceResponse<CartSummary>> {
    try {
      const cartItemsResponse = await this.getCartItemsWithProducts();

      if (!cartItemsResponse.success || !cartItemsResponse.data) {
        return {
          success: false,
          error: cartItemsResponse.error || '获取购物车信息失败',
        };
      }

      const selectedItems = cartItemsResponse.data.filter(item =>
        selectedIds.includes(item.productId)
      );

      let totalItems = 0;
      let totalPrice = 0;
      let discountAmount = 0;

      for (const item of selectedItems) {
        totalItems += item.quantity;

        const itemPrice = item.product.discountedPrice || item.product.originalPrice;
        totalPrice += itemPrice * item.quantity;

        if (item.product.discountedPrice) {
          discountAmount +=
            (item.product.originalPrice - item.product.discountedPrice) * item.quantity;
        }
      }

      const finalPrice = totalPrice;

      return {
        success: true,
        data: {
          totalItems,
          totalPrice: totalPrice + discountAmount, // Original total
          discountAmount,
          finalPrice,
        },
      };
    } catch (error) {
      console.error('Error calculating selected total:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  // Selection management methods

  /**
   * Get current selections from storage
   */
  static async getSelections(): Promise<Map<string, boolean>> {
    try {
      const selectionsData = wx.getStorageSync(CART_STORAGE_KEYS.CART_SELECTIONS);

      if (!selectionsData) {
        return new Map();
      }

      const selections: CartSelectionsStorage = JSON.parse(selectionsData);
      return new Map(Object.entries(selections));
    } catch (error) {
      console.error('Error getting selections:', error);
      return new Map();
    }
  }

  /**
   * Save selections to storage
   */
  static async saveSelections(selections: Map<string, boolean>): Promise<void> {
    try {
      const selectionsObj: CartSelectionsStorage = {};
      selections.forEach((selected, productId) => {
        selectionsObj[productId] = selected;
      });

      const selectionsData = JSON.stringify(selectionsObj);
      wx.setStorageSync(CART_STORAGE_KEYS.CART_SELECTIONS, selectionsData);
    } catch (error) {
      console.error('Error saving selections:', error);
      throw new Error(CART_ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  /**
   * Toggle item selection
   */
  static async toggleItemSelection(productId: string): Promise<CartServiceResponse<boolean>> {
    try {
      const selections = await this.getSelections();
      const currentSelection = selections.get(productId) || false;
      const newSelection = !currentSelection;

      selections.set(productId, newSelection);
      await this.saveSelections(selections);

      // Notify cart manager
      const { CartManager } = await import('../utils/cart-manager');
      CartManager.notifySelectionChanged(productId, newSelection);

      return {
        success: true,
        data: newSelection,
      };
    } catch (error) {
      console.error('Error toggling item selection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Select all items
   */
  static async selectAllItems(): Promise<CartServiceResponse<boolean>> {
    try {
      const cartItems = await this.getCartItems();
      const selections = new Map<string, boolean>();

      cartItems.forEach(item => {
        selections.set(item.productId, true);
      });

      await this.saveSelections(selections);

      // Notify cart manager
      const { CartManager } = await import('../utils/cart-manager');
      CartManager.notifyBatchOperationCompleted(
        'selectAll',
        cartItems.map(item => item.productId)
      );

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error('Error selecting all items:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Clear all selections
   */
  static async clearAllSelections(): Promise<CartServiceResponse<boolean>> {
    try {
      await this.saveSelections(new Map());

      // Notify cart manager
      const { CartManager } = await import('../utils/cart-manager');
      CartManager.notifyBatchOperationCompleted('clearSelections', []);

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error('Error clearing selections:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Batch update item selections
   */
  static async batchUpdateSelections(
    updates: { productId: string; selected: boolean }[]
  ): Promise<CartServiceResponse<boolean>> {
    try {
      console.log('Batch updating selections:', updates);

      const selections = await this.getSelections();

      updates.forEach(update => {
        if (update.selected) {
          selections.set(update.productId, true);
        } else {
          selections.delete(update.productId);
        }
      });

      await this.saveSelections(selections);

      // Notify cart manager for each update
      const { CartManager } = await import('../utils/cart-manager');
      updates.forEach(update => {
        CartManager.notifySelectionChanged(update.productId, update.selected);
      });

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error('Error batch updating selections:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Get selection status for multiple items
   */
  static async getItemSelections(
    productIds: string[]
  ): Promise<CartServiceResponse<{ [productId: string]: boolean }>> {
    try {
      const selections = await this.getSelections();
      const result: { [productId: string]: boolean } = {};

      productIds.forEach(productId => {
        result[productId] = selections.get(productId) || false;
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Error getting item selections:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Check if all items are selected
   */
  static async areAllItemsSelected(): Promise<CartServiceResponse<boolean>> {
    try {
      const cartItems = await this.getCartItems();
      const selections = await this.getSelections();

      if (cartItems.length === 0) {
        return {
          success: true,
          data: false,
        };
      }

      const allSelected = cartItems.every(item => selections.get(item.productId) === true);

      return {
        success: true,
        data: allSelected,
      };
    } catch (error) {
      console.error('Error checking if all items are selected:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }
}

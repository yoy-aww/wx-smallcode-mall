// services/cart-simple.ts
/**
 * Simplified shopping cart service for WeChat Mini Program compatibility
 */

import { CART_STORAGE_KEYS, CART_ERROR_MESSAGES } from '../constants/cart';

/**
 * Cart service class for managing shopping cart operations
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

      // Get current cart items
      const cartItems = await this.getCartItems();

      // Check if product already exists in cart
      const existingItemIndex = cartItems.findIndex(item => item.productId === productId);
      let finalQuantity = quantity;

      if (existingItemIndex >= 0) {
        finalQuantity = cartItems[existingItemIndex].quantity + quantity;
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
      await this.updateCartBadge();

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

      const cartItems = await this.getCartItems();
      const itemIndex = cartItems.findIndex(item => item.productId === productId);

      if (itemIndex >= 0) {
        cartItems[itemIndex].quantity = quantity;
        cartItems[itemIndex].selectedAt = new Date();

        await this.saveCartItems(cartItems);
        await this.updateCartBadge();

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
   * Clear entire cart
   */
  static async clearCart(): Promise<CartServiceResponse<boolean>> {
    try {
      console.log('Clearing cart');

      await this.saveCartItems([]);
      await this.updateCartBadge();

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
   * Simple error handling for cart operations
   */
  static async handleCartError(error: any, operation: string, productId?: string): Promise<void> {
    console.error(`Cart operation error in ${operation}:`, error);

    // Show simple error toast
    wx.showToast({
      title: error.message || '操作失败',
      icon: 'none',
      duration: 2000,
    });
  }
}

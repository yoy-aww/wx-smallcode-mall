// services/cart.ts
/**
 * Comprehensive shopping cart service for WeChat Mini Program
 * Implements all cart functionality including selection, checkout, and validation
 */

import { CART_STORAGE_KEYS, CART_ERROR_MESSAGES } from '../constants/cart';

/**
 * Cart service response interface
 */
interface CartServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Cart service class for managing shopping cart operations
 */
export class CartService {
  private static readonly CART_STORAGE_KEY = CART_STORAGE_KEYS.CART_ITEMS;
  private static readonly CART_SELECTIONS_KEY = CART_STORAGE_KEYS.CART_SELECTIONS;
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

      // Also remove from selections
      const selections = await this.getSelections();
      selections.delete(productId);
      await this.saveSelections(selections);

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

      // Import ProductService using require to avoid circular dependency
      const { ProductService } = require('./product');

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
   * Clear entire cart
   */
  static async clearCart(): Promise<CartServiceResponse<boolean>> {
    try {
      console.log('Clearing cart');

      await this.saveCartItems([]);
      await this.updateCartBadge();
      await this.clearAllSelections();

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
   * Toggle item selection
   */
  static async toggleItemSelection(productId: string): Promise<CartServiceResponse<boolean>> {
    try {
      const selections = await this.getSelections();
      const isSelected = selections.get(productId) || false;
      
      selections.set(productId, !isSelected);
      await this.saveSelections(selections);

      return {
        success: true,
        data: !isSelected,
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
   * Select items
   */
  static async selectItems(productIds: string[]): Promise<CartServiceResponse<boolean>> {
    try {
      const selections = await this.getSelections();
      
      productIds.forEach(productId => {
        selections.set(productId, true);
      });
      
      await this.saveSelections(selections);

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error('Error selecting items:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Get selections
   */
  static async getSelections(): Promise<Map<string, boolean>> {
    try {
      const selectionsData = wx.getStorageSync(this.CART_SELECTIONS_KEY);
      
      if (!selectionsData) {
        return new Map();
      }

      const selectionsObj = JSON.parse(selectionsData);
      return new Map(Object.entries(selectionsObj));
    } catch (error) {
      console.error('Error getting selections:', error);
      return new Map();
    }
  }

  /**
   * Get selected items
   */
  static async getSelectedItems(): Promise<CartServiceResponse<CartItemWithProduct[]>> {
    try {
      const cartItemsResponse = await this.getCartItemsWithProducts();
      
      if (!cartItemsResponse.success || !cartItemsResponse.data) {
        return {
          success: false,
          error: 'Failed to get cart items',
        };
      }

      const selections = await this.getSelections();
      const selectedItems = cartItemsResponse.data.filter(item => 
        selections.get(item.productId) === true
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
   * Calculate selected total
   */
  static async calculateSelectedTotal(selectedIds: string[]): Promise<CartServiceResponse<CartSummary>> {
    try {
      const cartItemsResponse = await this.getCartItemsWithProducts();
      
      if (!cartItemsResponse.success || !cartItemsResponse.data) {
        return {
          success: false,
          error: 'Failed to get cart items',
        };
      }

      const selectedItems = cartItemsResponse.data.filter(item => 
        selectedIds.includes(item.productId)
      );

      let totalItems = 0;
      let totalPrice = 0;

      selectedItems.forEach(item => {
        totalItems += item.quantity;
        const price = item.product.discountedPrice || item.product.originalPrice;
        totalPrice += price * item.quantity;
      });

      const summary: CartSummary = {
        totalItems,
        totalPrice,
        discountAmount: 0,
        finalPrice: totalPrice,
      };

      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      console.error('Error calculating selected total:', error);
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
   * Prepare checkout data
   */
  static async prepareCheckoutData(): Promise<CartServiceResponse<{
    items: CartItemWithProduct[];
    summary: CartSummary;
  }>> {
    try {
      const selectedItemsResponse = await this.getSelectedItems();
      
      if (!selectedItemsResponse.success || !selectedItemsResponse.data) {
        return {
          success: false,
          error: 'No selected items for checkout',
        };
      }

      const selectedIds = selectedItemsResponse.data.map(item => item.productId);
      const summaryResponse = await this.calculateSelectedTotal(selectedIds);
      
      if (!summaryResponse.success || !summaryResponse.data) {
        return {
          success: false,
          error: 'Failed to calculate summary',
        };
      }

      return {
        success: true,
        data: {
          items: selectedItemsResponse.data,
          summary: summaryResponse.data,
        },
      };
    } catch (error) {
      console.error('Error preparing checkout data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Validate checkout items
   */
  static async validateCheckoutItems(items: CartItemWithProduct[]): Promise<CartServiceResponse<{
    isValid: boolean;
    stockErrors: Array<{
      productId: string;
      productName: string;
      requestedQuantity: number;
      availableStock: number;
    }>;
  }>> {
    try {
      const stockErrors: Array<{
        productId: string;
        productName: string;
        requestedQuantity: number;
        availableStock: number;
      }> = [];

      // Import ProductService using require
      const { ProductService } = require('./product');

      for (const item of items) {
        const productResponse = await ProductService.getProductById(item.productId);
        
        if (productResponse.success && productResponse.data) {
          const product = productResponse.data;
          
          if (item.quantity > product.stock) {
            stockErrors.push({
              productId: item.productId,
              productName: product.name,
              requestedQuantity: item.quantity,
              availableStock: product.stock,
            });
          }
        } else {
          stockErrors.push({
            productId: item.productId,
            productName: item.product.name,
            requestedQuantity: item.quantity,
            availableStock: 0,
          });
        }
      }

      return {
        success: true,
        data: {
          isValid: stockErrors.length === 0,
          stockErrors,
        },
      };
    } catch (error) {
      console.error('Error validating checkout items:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Create checkout session
   */
  static async createCheckoutSession(
    items: CartItemWithProduct[],
    summary: CartSummary
  ): Promise<CartServiceResponse<{
    sessionId: string;
    expiresAt: Date;
  }>> {
    try {
      const sessionId = `checkout_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      const sessionData = {
        sessionId,
        items,
        summary,
        createdAt: new Date(),
        expiresAt,
        validated: false,
      };

      wx.setStorageSync(`checkout_session_${sessionId}`, JSON.stringify(sessionData));

      return {
        success: true,
        data: {
          sessionId,
          expiresAt,
        },
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.STORAGE_ERROR,
      };
    }
  }

  /**
   * Get checkout session
   */
  static async getCheckoutSession(sessionId: string): Promise<CartServiceResponse<{
    sessionId: string;
    items: CartItemWithProduct[];
    summary: CartSummary;
    createdAt: Date;
    expiresAt: Date;
    validated: boolean;
  } | null>> {
    try {
      const sessionData = wx.getStorageSync(`checkout_session_${sessionId}`);
      
      if (!sessionData) {
        return {
          success: true,
          data: null,
        };
      }

      const session = JSON.parse(sessionData);
      
      // Check if session is expired
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      
      if (now > expiresAt) {
        // Clean up expired session
        wx.removeStorageSync(`checkout_session_${sessionId}`);
        return {
          success: true,
          data: null,
        };
      }

      return {
        success: true,
        data: {
          ...session,
          createdAt: new Date(session.createdAt),
          expiresAt: new Date(session.expiresAt),
        },
      };
    } catch (error) {
      console.error('Error getting checkout session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.STORAGE_ERROR,
      };
    }
  }

  /**
   * Clear checkout session
   */
  static async clearCheckoutSession(sessionId: string): Promise<CartServiceResponse<boolean>> {
    try {
      wx.removeStorageSync(`checkout_session_${sessionId}`);
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error('Error clearing checkout session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.STORAGE_ERROR,
      };
    }
  }

  /**
   * Initialize cart service
   */
  static async initializeCart(): Promise<CartServiceResponse<{
    items: CartItem[];
    initialized: boolean;
  }>> {
    try {
      console.log('Initializing cart service');

      // Load existing cart items
      const cartItems = await this.getCartItems();
      
      // Update badge
      await this.updateCartBadge();

      return {
        success: true,
        data: {
          items: cartItems,
          initialized: true,
        },
      };
    } catch (error) {
      console.error('Error initializing cart:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Get sync status
   */
  static async getSyncStatus(): Promise<CartServiceResponse<{
    lastSyncTime: Date | null;
    isExpired: boolean;
    itemCount: number;
  }>> {
    try {
      const lastSyncTime = wx.getStorageSync('cart_last_sync');
      const itemCount = await this.getCartItemCount();
      
      const syncTime = lastSyncTime ? new Date(lastSyncTime) : null;
      const isExpired = syncTime ? (Date.now() - syncTime.getTime()) > 24 * 60 * 60 * 1000 : true;

      return {
        success: true,
        data: {
          lastSyncTime: syncTime,
          isExpired,
          itemCount,
        },
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : CART_ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  /**
   * Get product quantity in cart
   */
  static async getProductQuantityInCart(productId: string): Promise<number> {
    try {
      const cartItems = await this.getCartItems();
      const item = cartItems.find(item => item.productId === productId);
      return item ? item.quantity : 0;
    } catch (error) {
      console.error('Error getting product quantity in cart:', error);
      return 0;
    }
  }

  /**
   * Perform data maintenance
   */
  static async performDataMaintenance(): Promise<CartServiceResponse<{
    cleanedItems: number;
    validatedItems: number;
    errors: string[];
  }>> {
    try {
      console.log('Performing cart data maintenance');

      const errors: string[] = [];
      let cleanedItems = 0;
      let validatedItems = 0;

      // Clean up expired checkout sessions
      const storage = wx.getStorageInfoSync();
      const sessionKeys = storage.keys.filter(key => key.startsWith('checkout_session_'));
      
      for (const key of sessionKeys) {
        try {
          const sessionData = wx.getStorageSync(key);
          if (sessionData) {
            const session = JSON.parse(sessionData);
            const expiresAt = new Date(session.expiresAt);
            
            if (new Date() > expiresAt) {
              wx.removeStorageSync(key);
              cleanedItems++;
            } else {
              validatedItems++;
            }
          }
        } catch (error) {
          wx.removeStorageSync(key);
          cleanedItems++;
          errors.push(`Failed to validate session ${key}`);
        }
      }

      // Update badge
      await this.updateCartBadge();

      return {
        success: true,
        data: {
          cleanedItems,
          validatedItems,
          errors,
        },
      };
    } catch (error) {
      console.error('Error performing data maintenance:', error);
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
   * Save selections to storage
   */
  private static async saveSelections(selections: Map<string, boolean>): Promise<void> {
    try {
      const selectionsObj = Object.fromEntries(selections);
      const selectionsData = JSON.stringify(selectionsObj);
      wx.setStorageSync(this.CART_SELECTIONS_KEY, selectionsData);
    } catch (error) {
      console.error('Error saving selections:', error);
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

      // Update sync time
      wx.setStorageSync('cart_last_sync', new Date().toISOString());

      console.log('Cart badge updated:', itemCount);
    } catch (error) {
      console.error('Error updating cart badge:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Simple error handling for cart operations
   */
  static async handleCartError(
    error: any,
    operation: string
  ): Promise<void> {
    console.error(`Cart operation error in ${operation}:`, error);
    
    // Show simple error toast
    wx.showToast({
      title: error.message || '操作失败',
      icon: 'none',
      duration: 2000
    });
  }
}
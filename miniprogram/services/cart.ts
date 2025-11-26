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

/**
 * Cart service class for managing shopping cart operations
 */
export class CartService {
  private static readonly CART_STORAGE_KEY = 'shopping_cart';
  private static readonly CART_BADGE_KEY = 'cart_badge_count';

  /**
   * Add product to cart
   */
  static async addToCart(productId: string, quantity: number = 1): Promise<CartServiceResponse<CartItem>> {
    try {
      console.log('Adding product to cart:', productId, quantity);

      // Get current cart items
      const cartItems = await this.getCartItems();
      
      // Check if product already exists in cart
      const existingItemIndex = cartItems.findIndex(item => item.productId === productId);
      
      if (existingItemIndex >= 0) {
        // Update quantity if product already exists
        cartItems[existingItemIndex].quantity += quantity;
        cartItems[existingItemIndex].selectedAt = new Date();
      } else {
        // Add new item to cart
        const newItem: CartItem = {
          productId,
          quantity,
          selectedAt: new Date()
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
        data: cartItems.find(item => item.productId === productId)
      };

    } catch (error) {
      console.error('Error adding product to cart:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '添加到购物车失败'
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
        data: true
      };

    } catch (error) {
      console.error('Error removing product from cart:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '从购物车移除失败'
      };
    }
  }

  /**
   * Update product quantity in cart
   */
  static async updateCartItemQuantity(productId: string, quantity: number): Promise<CartServiceResponse<CartItem>> {
    try {
      console.log('Updating cart item quantity:', productId, quantity);

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        await this.removeFromCart(productId);
        return {
          success: true,
          data: undefined
        };
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
          data: cartItems[itemIndex]
        };
      } else {
        return {
          success: false,
          error: '购物车中未找到该商品'
        };
      }

    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新数量失败'
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
        selectedAt: new Date(item.selectedAt)
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
          data: []
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
            product: productResponse.data
          });
        }
      }

      return {
        success: true,
        data: cartItemsWithProducts
      };

    } catch (error) {
      console.error('Error getting cart items with products:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取购物车商品详情失败'
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
          error: cartItemsResponse.error || '获取购物车信息失败'
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
          discountAmount += (item.product.originalPrice - item.product.discountedPrice) * item.quantity;
        }
      }

      const finalPrice = totalPrice;

      return {
        success: true,
        data: {
          totalItems,
          totalPrice: totalPrice + discountAmount, // Original total
          discountAmount,
          finalPrice
        }
      };

    } catch (error) {
      console.error('Error getting cart summary:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '计算购物车总计失败'
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
        data: true
      };

    } catch (error) {
      console.error('Error clearing cart:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '清空购物车失败'
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
      throw new Error('保存购物车数据失败');
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
          text: itemCount > 99 ? '99+' : itemCount.toString()
        });
      } else {
        wx.removeTabBarBadge({
          index: 2
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
              quantity: adjustedQuantity
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
        data: true
      };

    } catch (error) {
      console.error('Error validating cart:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '购物车验证失败'
      };
    }
  }
}
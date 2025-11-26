// utils/cart-manager.ts
/**
 * Global cart state manager for handling cart updates across the app
 */

/**
 * Cart event types
 */
export enum CartEventType {
  ITEM_ADDED = 'cart:item_added',
  ITEM_REMOVED = 'cart:item_removed',
  ITEM_UPDATED = 'cart:item_updated',
  CART_CLEARED = 'cart:cleared',
  BADGE_UPDATED = 'cart:badge_updated'
}

/**
 * Cart event data interface
 */
interface CartEventData {
  productId?: string;
  quantity?: number;
  totalItems?: number;
  product?: Product;
}

/**
 * Cart event listener interface
 */
interface CartEventListener {
  (eventData: CartEventData): void;
}

/**
 * Global cart manager class
 */
export class CartManager {
  private static listeners: Map<CartEventType, CartEventListener[]> = new Map();
  private static initialized = false;

  /**
   * Initialize cart manager
   */
  static initialize() {
    if (this.initialized) {
      return;
    }

    console.log('Initializing CartManager');
    
    // Initialize event listener maps
    Object.values(CartEventType).forEach(eventType => {
      this.listeners.set(eventType, []);
    });

    this.initialized = true;
  }

  /**
   * Add event listener
   */
  static addEventListener(eventType: CartEventType, listener: CartEventListener) {
    this.initialize();
    
    const listeners = this.listeners.get(eventType) || [];
    listeners.push(listener);
    this.listeners.set(eventType, listeners);
    
    console.log(`Added listener for ${eventType}, total listeners: ${listeners.length}`);
  }

  /**
   * Remove event listener
   */
  static removeEventListener(eventType: CartEventType, listener: CartEventListener) {
    const listeners = this.listeners.get(eventType) || [];
    const index = listeners.indexOf(listener);
    
    if (index > -1) {
      listeners.splice(index, 1);
      this.listeners.set(eventType, listeners);
      console.log(`Removed listener for ${eventType}, remaining listeners: ${listeners.length}`);
    }
  }

  /**
   * Emit cart event
   */
  static emit(eventType: CartEventType, eventData: CartEventData = {}) {
    console.log(`Emitting cart event: ${eventType}`, eventData);
    
    const listeners = this.listeners.get(eventType) || [];
    
    listeners.forEach(listener => {
      try {
        listener(eventData);
      } catch (error) {
        console.error(`Error in cart event listener for ${eventType}:`, error);
      }
    });
  }

  /**
   * Notify item added to cart
   */
  static notifyItemAdded(productId: string, quantity: number, product?: Product) {
    this.emit(CartEventType.ITEM_ADDED, {
      productId,
      quantity,
      product
    });
    
    // Also update badge
    this.updateBadge();
  }

  /**
   * Notify item removed from cart
   */
  static notifyItemRemoved(productId: string, product?: Product) {
    this.emit(CartEventType.ITEM_REMOVED, {
      productId,
      product
    });
    
    // Also update badge
    this.updateBadge();
  }

  /**
   * Notify item quantity updated
   */
  static notifyItemUpdated(productId: string, quantity: number, product?: Product) {
    this.emit(CartEventType.ITEM_UPDATED, {
      productId,
      quantity,
      product
    });
    
    // Also update badge
    this.updateBadge();
  }

  /**
   * Notify cart cleared
   */
  static notifyCartCleared() {
    this.emit(CartEventType.CART_CLEARED, {});
    
    // Also update badge
    this.updateBadge();
  }

  /**
   * Update cart badge
   */
  static async updateBadge() {
    try {
      // Import CartService dynamically to avoid circular dependency
      const { CartService } = await import('../services/cart');
      const totalItems = await CartService.getCartItemCount();
      
      this.emit(CartEventType.BADGE_UPDATED, {
        totalItems
      });
      
      console.log('Cart badge updated:', totalItems);
      
    } catch (error) {
      console.error('Failed to update cart badge:', error);
    }
  }

  /**
   * Get current cart item count
   */
  static async getCurrentItemCount(): Promise<number> {
    try {
      const { CartService } = await import('../services/cart');
      return await CartService.getCartItemCount();
    } catch (error) {
      console.error('Failed to get current cart item count:', error);
      return 0;
    }
  }

  /**
   * Check if product is in cart
   */
  static async isProductInCart(productId: string): Promise<boolean> {
    try {
      const { CartService } = await import('../services/cart');
      return await CartService.isProductInCart(productId);
    } catch (error) {
      console.error('Failed to check if product is in cart:', error);
      return false;
    }
  }

  /**
   * Get product quantity in cart
   */
  static async getProductQuantityInCart(productId: string): Promise<number> {
    try {
      const { CartService } = await import('../services/cart');
      return await CartService.getProductQuantityInCart(productId);
    } catch (error) {
      console.error('Failed to get product quantity in cart:', error);
      return 0;
    }
  }

  /**
   * Clear all listeners (for cleanup)
   */
  static clearAllListeners() {
    console.log('Clearing all cart event listeners');
    this.listeners.clear();
    this.initialized = false;
  }

  /**
   * Get listener count for debugging
   */
  static getListenerCount(eventType?: CartEventType): number {
    if (eventType) {
      return this.listeners.get(eventType)?.length || 0;
    }
    
    let total = 0;
    this.listeners.forEach(listeners => {
      total += listeners.length;
    });
    
    return total;
  }
}

/**
 * Convenience function to initialize cart manager in app.ts
 */
export function initializeCartManager() {
  CartManager.initialize();
  
  // Set up global cart update handler
  if (typeof wx !== 'undefined') {
    // Add global event emitter if not exists
    if (!(wx as any).$emit) {
      const eventListeners: { [key: string]: Function[] } = {};
      
      (wx as any).$emit = function(eventName: string, data?: any) {
        const listeners = eventListeners[eventName] || [];
        listeners.forEach(listener => {
          try {
            listener(data);
          } catch (error) {
            console.error(`Error in global event listener for ${eventName}:`, error);
          }
        });
      };
      
      (wx as any).$on = function(eventName: string, listener: Function) {
        if (!eventListeners[eventName]) {
          eventListeners[eventName] = [];
        }
        eventListeners[eventName].push(listener);
      };
      
      (wx as any).$off = function(eventName: string, listener?: Function) {
        if (!listener) {
          delete eventListeners[eventName];
        } else {
          const listeners = eventListeners[eventName] || [];
          const index = listeners.indexOf(listener);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        }
      };
    }
    
    // Listen for global cart updates
    (wx as any).$on('cartUpdated', () => {
      CartManager.updateBadge();
    });
  }
  
  console.log('Cart manager initialized successfully');
}
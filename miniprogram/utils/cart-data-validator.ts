/**
 * Cart data validation utility
 * Handles data expiry validation and cleanup operations
 */

import { CART_VALIDATION, CART_ERROR_MESSAGES } from '../constants/cart';

/**
 * Data validation result interface
 */
interface DataValidationResult {
  /** Whether data is valid */
  isValid: boolean;
  /** Whether data is expired */
  isExpired: boolean;
  /** Validation errors */
  errors: string[];
  /** Items that need adjustment */
  adjustments: {
    productId: string;
    oldQuantity: number;
    newQuantity: number;
    reason: string;
  }[];
}

/**
 * Product availability check result
 */
interface ProductAvailabilityResult {
  /** Whether product is available */
  isAvailable: boolean;
  /** Current stock level */
  currentStock: number;
  /** Whether price has changed */
  priceChanged: boolean;
  /** New price if changed */
  newPrice?: number;
}

/**
 * Cart data validator class
 */
export class CartDataValidator {
  /**
   * Validate cart data expiry
   */
  static async validateDataExpiry(lastUpdateTime: number): Promise<boolean> {
    try {
      const currentTime = Date.now();
      const expiryTime = CART_VALIDATION.DATA_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      
      const isExpired = (currentTime - lastUpdateTime) > expiryTime;
      
      if (isExpired) {
        console.log(`Cart data expired. Last update: ${new Date(lastUpdateTime)}, Current: ${new Date(currentTime)}`);
      }
      
      return isExpired;
    } catch (error) {
      console.error('Error validating data expiry:', error);
      return true; // Assume expired on error for safety
    }
  }

  /**
   * Validate cart items against current product data
   */
  static async validateCartItems(cartItems: CartItem[]): Promise<DataValidationResult> {
    try {
      console.log('Validating cart items against current product data');

      const result: DataValidationResult = {
        isValid: true,
        isExpired: false,
        errors: [],
        adjustments: []
      };

      const { ProductService } = await import('../services/product');

      for (const cartItem of cartItems) {
        try {
          // Check product availability
          const availabilityResult = await this.checkProductAvailability(cartItem.productId);
          
          if (!availabilityResult.isAvailable) {
            result.isValid = false;
            result.errors.push(`Product ${cartItem.productId} is no longer available`);
            continue;
          }

          // Check quantity against stock
          if (cartItem.quantity > availabilityResult.currentStock) {
            result.adjustments.push({
              productId: cartItem.productId,
              oldQuantity: cartItem.quantity,
              newQuantity: availabilityResult.currentStock,
              reason: 'Stock reduced'
            });
          }

          // Check for price changes
          if (availabilityResult.priceChanged) {
            console.log(`Price changed for product ${cartItem.productId}: ${availabilityResult.newPrice}`);
          }

          // Check data age
          const itemAge = Date.now() - cartItem.selectedAt.getTime();
          const maxAge = CART_VALIDATION.DATA_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
          
          if (itemAge > maxAge) {
            result.isExpired = true;
          }

        } catch (itemError) {
          console.error(`Error validating cart item ${cartItem.productId}:`, itemError);
          result.errors.push(`Failed to validate product ${cartItem.productId}`);
          result.isValid = false;
        }
      }

      console.log(`Cart validation completed. Valid: ${result.isValid}, Expired: ${result.isExpired}, Errors: ${result.errors.length}, Adjustments: ${result.adjustments.length}`);

      return result;
    } catch (error) {
      console.error('Error validating cart items:', error);
      return {
        isValid: false,
        isExpired: true,
        errors: [CART_ERROR_MESSAGES.VALIDATION_ERROR],
        adjustments: []
      };
    }
  }

  /**
   * Check product availability and current status
   */
  static async checkProductAvailability(productId: string): Promise<ProductAvailabilityResult> {
    try {
      const { ProductService } = await import('../services/product');
      const productResponse = await ProductService.getProductById(productId);

      if (!productResponse.success || !productResponse.data) {
        return {
          isAvailable: false,
          currentStock: 0,
          priceChanged: false
        };
      }

      const product = productResponse.data;

      // Get cached product data for price comparison
      const cachedPrice = await this.getCachedProductPrice(productId);
      const currentPrice = product.discountedPrice || product.originalPrice;
      const priceChanged = cachedPrice !== null && cachedPrice !== currentPrice;

      // Update cached price
      await this.setCachedProductPrice(productId, currentPrice);

      return {
        isAvailable: product.stock > 0,
        currentStock: product.stock,
        priceChanged,
        newPrice: priceChanged ? currentPrice : undefined
      };
    } catch (error) {
      console.error(`Error checking product availability for ${productId}:`, error);
      return {
        isAvailable: false,
        currentStock: 0,
        priceChanged: false
      };
    }
  }

  /**
   * Apply validation adjustments to cart items
   */
  static async applyValidationAdjustments(
    cartItems: CartItem[],
    adjustments: DataValidationResult['adjustments']
  ): Promise<CartItem[]> {
    try {
      console.log('Applying validation adjustments to cart items');

      const adjustmentMap = new Map(
        adjustments.map(adj => [adj.productId, adj.newQuantity])
      );

      const adjustedItems = cartItems
        .map(item => {
          const newQuantity = adjustmentMap.get(item.productId);
          if (newQuantity !== undefined) {
            console.log(`Adjusting quantity for ${item.productId}: ${item.quantity} -> ${newQuantity}`);
            return {
              ...item,
              quantity: newQuantity
            };
          }
          return item;
        })
        .filter(item => item.quantity > 0); // Remove items with 0 quantity

      console.log(`Applied ${adjustments.length} adjustments, ${adjustedItems.length} items remaining`);

      return adjustedItems;
    } catch (error) {
      console.error('Error applying validation adjustments:', error);
      return cartItems; // Return original items on error
    }
  }

  /**
   * Remove invalid items from cart
   */
  static async removeInvalidItems(
    cartItems: CartItem[],
    errors: string[]
  ): Promise<CartItem[]> {
    try {
      console.log('Removing invalid items from cart');

      const invalidProductIds = new Set<string>();
      
      // Extract product IDs from error messages
      errors.forEach(error => {
        const match = error.match(/Product (\w+)/);
        if (match) {
          invalidProductIds.add(match[1]);
        }
      });

      const validItems = cartItems.filter(item => !invalidProductIds.has(item.productId));

      console.log(`Removed ${cartItems.length - validItems.length} invalid items`);

      return validItems;
    } catch (error) {
      console.error('Error removing invalid items:', error);
      return cartItems; // Return original items on error
    }
  }

  /**
   * Perform comprehensive cart data cleanup
   */
  static async performDataCleanup(cartItems: CartItem[]): Promise<{
    cleanedItems: CartItem[];
    removedCount: number;
    adjustedCount: number;
    errors: string[];
  }> {
    try {
      console.log('Performing comprehensive cart data cleanup');

      // Validate all items
      const validationResult = await this.validateCartItems(cartItems);

      // Remove invalid items
      let cleanedItems = await this.removeInvalidItems(cartItems, validationResult.errors);

      // Apply adjustments
      cleanedItems = await this.applyValidationAdjustments(cleanedItems, validationResult.adjustments);

      const removedCount = cartItems.length - cleanedItems.length;
      const adjustedCount = validationResult.adjustments.length;

      console.log(`Data cleanup completed. Removed: ${removedCount}, Adjusted: ${adjustedCount}`);

      return {
        cleanedItems,
        removedCount,
        adjustedCount,
        errors: validationResult.errors
      };
    } catch (error) {
      console.error('Error performing data cleanup:', error);
      return {
        cleanedItems: cartItems,
        removedCount: 0,
        adjustedCount: 0,
        errors: [CART_ERROR_MESSAGES.VALIDATION_ERROR]
      };
    }
  }

  /**
   * Get cached product price
   */
  private static async getCachedProductPrice(productId: string): Promise<number | null> {
    try {
      const cacheKey = `product_price_${productId}`;
      const cachedPrice = wx.getStorageSync(cacheKey);
      return cachedPrice ? parseFloat(cachedPrice) : null;
    } catch (error) {
      console.error(`Error getting cached price for ${productId}:`, error);
      return null;
    }
  }

  /**
   * Set cached product price
   */
  private static async setCachedProductPrice(productId: string, price: number): Promise<void> {
    try {
      const cacheKey = `product_price_${productId}`;
      wx.setStorageSync(cacheKey, price.toString());
    } catch (error) {
      console.error(`Error setting cached price for ${productId}:`, error);
    }
  }

  /**
   * Clear all cached product prices
   */
  static async clearPriceCache(): Promise<void> {
    try {
      console.log('Clearing product price cache');
      
      // Get all storage keys
      const storageInfo = wx.getStorageInfoSync();
      const priceKeys = storageInfo.keys.filter(key => key.startsWith('product_price_'));
      
      // Remove price cache keys
      priceKeys.forEach(key => {
        wx.removeStorageSync(key);
      });

      console.log(`Cleared ${priceKeys.length} cached prices`);
    } catch (error) {
      console.error('Error clearing price cache:', error);
    }
  }

  /**
   * Validate cart data integrity
   */
  static async validateDataIntegrity(data: any): Promise<boolean> {
    try {
      // Check if data is an array
      if (!Array.isArray(data)) {
        console.warn('Cart data is not an array');
        return false;
      }

      // Validate each cart item
      for (const item of data) {
        if (!item.productId || typeof item.productId !== 'string') {
          console.warn('Invalid productId in cart item:', item);
          return false;
        }

        if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
          console.warn('Invalid quantity in cart item:', item);
          return false;
        }

        if (!item.selectedAt) {
          console.warn('Missing selectedAt in cart item:', item);
          return false;
        }

        // Try to parse selectedAt as Date
        try {
          new Date(item.selectedAt);
        } catch (dateError) {
          console.warn('Invalid selectedAt date in cart item:', item);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating data integrity:', error);
      return false;
    }
  }

  /**
   * Generate data validation report
   */
  static async generateValidationReport(cartItems: CartItem[]): Promise<{
    totalItems: number;
    validItems: number;
    expiredItems: number;
    invalidItems: number;
    adjustedItems: number;
    oldestItem: Date | null;
    newestItem: Date | null;
  }> {
    try {
      console.log('Generating cart data validation report');

      const validationResult = await this.validateCartItems(cartItems);
      
      let oldestItem: Date | null = null;
      let newestItem: Date | null = null;
      let expiredItems = 0;

      const maxAge = CART_VALIDATION.DATA_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      const currentTime = Date.now();

      cartItems.forEach(item => {
        const itemDate = item.selectedAt;
        
        if (!oldestItem || itemDate < oldestItem) {
          oldestItem = itemDate;
        }
        
        if (!newestItem || itemDate > newestItem) {
          newestItem = itemDate;
        }

        if (currentTime - itemDate.getTime() > maxAge) {
          expiredItems++;
        }
      });

      const report = {
        totalItems: cartItems.length,
        validItems: cartItems.length - validationResult.errors.length,
        expiredItems,
        invalidItems: validationResult.errors.length,
        adjustedItems: validationResult.adjustments.length,
        oldestItem,
        newestItem
      };

      console.log('Validation report generated:', report);

      return report;
    } catch (error) {
      console.error('Error generating validation report:', error);
      return {
        totalItems: cartItems.length,
        validItems: 0,
        expiredItems: 0,
        invalidItems: cartItems.length,
        adjustedItems: 0,
        oldestItem: null,
        newestItem: null
      };
    }
  }
}
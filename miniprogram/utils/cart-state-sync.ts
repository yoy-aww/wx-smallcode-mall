/**
 * Cart state synchronization utility
 * Handles synchronization between local storage and cart state with data persistence and conflict resolution
 */

import { CART_STORAGE_KEYS, CART_VALIDATION, CART_ERROR_MESSAGES } from '../constants/cart';
import { CartManager, CartEventType } from './cart-manager';

/**
 * Data synchronization metadata
 */
interface SyncMetadata {
  /** Last sync timestamp */
  lastSync: number;
  /** Data version for conflict detection */
  version: number;
  /** User ID for multi-user support */
  userId?: string;
  /** Device ID for conflict resolution */
  deviceId: string;
}

/**
 * Cart data with metadata
 */
interface CartDataWithMetadata {
  /** Cart items */
  items: CartItem[];
  /** Selection state */
  selections: { [productId: string]: boolean };
  /** Sync metadata */
  metadata: SyncMetadata;
}

/**
 * Data conflict resolution result
 */
interface ConflictResolutionResult {
  /** Resolved cart items */
  resolvedItems: CartItem[];
  /** Resolved selections */
  resolvedSelections: Map<string, boolean>;
  /** Conflict details */
  conflicts: {
    type: 'items' | 'selections';
    localData: any;
    remoteData: any;
    resolution: 'local' | 'remote' | 'merged';
  }[];
}

/**
 * Cart state synchronizer implementation with enhanced persistence
 */
export class CartStateSynchronizer {
  private static readonly SYNC_METADATA_KEY = 'cart_sync_metadata';
  private static readonly DEVICE_ID_KEY = 'device_id';
  private static deviceId: string;

  /**
   * Initialize synchronizer
   */
  static async initialize(): Promise<void> {
    try {
      // Generate or retrieve device ID
      this.deviceId = wx.getStorageSync(this.DEVICE_ID_KEY);
      if (!this.deviceId) {
        this.deviceId = this.generateDeviceId();
        wx.setStorageSync(this.DEVICE_ID_KEY, this.deviceId);
      }

      // Set up event listeners for automatic sync
      CartManager.addEventListener(CartEventType.ITEM_ADDED, () => this.autoSync());
      CartManager.addEventListener(CartEventType.ITEM_REMOVED, () => this.autoSync());
      CartManager.addEventListener(CartEventType.ITEM_UPDATED, () => this.autoSync());
      CartManager.addEventListener(CartEventType.SELECTION_CHANGED, () => this.autoSync());
      CartManager.addEventListener(CartEventType.BATCH_OPERATION_COMPLETED, () => this.autoSync());

      console.log('Cart state synchronizer initialized');
    } catch (error) {
      console.error('Error initializing cart state synchronizer:', error);
    }
  }

  /**
   * Sync cart state to storage with metadata
   */
  static async syncToStorage(
    items?: CartItem[],
    selections?: Map<string, boolean>
  ): Promise<void> {
    try {
      console.log('Syncing cart state to storage with metadata');

      // Get current data if not provided
      let cartItems = items;
      if (!cartItems) {
        const { CartService } = await import('../services/cart');
        cartItems = await CartService.getCartItems();
      }

      let cartSelections = selections;
      if (!cartSelections) {
        cartSelections = await this.getSelections();
      }

      // Create metadata
      const metadata: SyncMetadata = {
        lastSync: Date.now(),
        version: await this.getNextVersion(),
        deviceId: this.deviceId,
        userId: await this.getCurrentUserId()
      };

      // Create data with metadata
      const dataWithMetadata: CartDataWithMetadata = {
        items: cartItems,
        selections: this.mapToObject(cartSelections),
        metadata
      };

      // Save to storage
      wx.setStorageSync(CART_STORAGE_KEYS.CART_ITEMS, JSON.stringify(cartItems));
      wx.setStorageSync(CART_STORAGE_KEYS.CART_SELECTIONS, JSON.stringify(dataWithMetadata.selections));
      wx.setStorageSync(this.SYNC_METADATA_KEY, JSON.stringify(metadata));

      console.log('Cart state synced to storage successfully');
    } catch (error) {
      console.error('Error syncing cart state to storage:', error);
      throw new Error(CART_ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  /**
   * Sync cart state from storage with validation
   */
  static async syncFromStorage(): Promise<{
    items: CartItem[];
    selections: Map<string, boolean>;
    isExpired: boolean;
  }> {
    try {
      console.log('Syncing cart state from storage');

      // Validate stored data first
      const isValid = await this.validateStoredData();
      if (!isValid) {
        await this.cleanupInvalidData();
        return {
          items: [],
          selections: new Map(),
          isExpired: false
        };
      }

      // Get stored data
      const itemsData = wx.getStorageSync(CART_STORAGE_KEYS.CART_ITEMS);
      const selectionsData = wx.getStorageSync(CART_STORAGE_KEYS.CART_SELECTIONS);
      const metadataData = wx.getStorageSync(this.SYNC_METADATA_KEY);

      let items: CartItem[] = [];
      let selections = new Map<string, boolean>();
      let isExpired = false;

      // Parse items
      if (itemsData) {
        const parsedItems = JSON.parse(itemsData);
        items = parsedItems.map((item: any) => ({
          ...item,
          selectedAt: new Date(item.selectedAt)
        }));
      }

      // Parse selections
      if (selectionsData) {
        const parsedSelections = JSON.parse(selectionsData);
        selections = new Map(Object.entries(parsedSelections));
      }

      // Check expiry
      if (metadataData) {
        const metadata: SyncMetadata = JSON.parse(metadataData);
        isExpired = await this.isDataExpired(metadata);
        
        if (isExpired) {
          console.log('Cart data is expired, validating items');
          const validationResult = await this.validateExpiredData(items);
          items = validationResult.validItems;
          
          // Update storage with validated data
          await this.syncToStorage(items, selections);
        }
      }

      console.log('Cart state synced from storage successfully');
      return { items, selections, isExpired };
    } catch (error) {
      console.error('Error syncing cart state from storage:', error);
      throw new Error(CART_ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  /**
   * Sync selection state to storage with automatic conflict resolution
   */
  static async syncSelections(selections: Map<string, boolean>): Promise<void> {
    try {
      console.log('Syncing selection state to storage');

      // Get current selections for conflict detection
      const currentSelections = await this.getSelections();
      
      // Resolve conflicts if any
      const resolvedSelections = await this.resolveSelectionConflicts(currentSelections, selections);

      const selectionsObj = this.mapToObject(resolvedSelections);
      const selectionsData = JSON.stringify(selectionsObj);
      wx.setStorageSync(CART_STORAGE_KEYS.CART_SELECTIONS, selectionsData);
      
      // Update metadata
      await this.updateSyncMetadata();
      
      console.log('Selection state synced to storage successfully');
    } catch (error) {
      console.error('Error syncing selections:', error);
      throw new Error(CART_ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  /**
   * Get selection state from storage with validation
   */
  static async getSelections(): Promise<Map<string, boolean>> {
    try {
      const selectionsData = wx.getStorageSync(CART_STORAGE_KEYS.CART_SELECTIONS);
      
      if (!selectionsData) {
        return new Map();
      }

      const selections: { [key: string]: boolean } = JSON.parse(selectionsData);
      
      // Validate selections against current cart items
      const validatedSelections = await this.validateSelections(new Map(Object.entries(selections)));
      
      return validatedSelections;
    } catch (error) {
      console.error('Error getting selections from storage:', error);
      return new Map();
    }
  }

  /**
   * Clear all stored selections with metadata update
   */
  static async clearSelections(): Promise<void> {
    try {
      wx.removeStorageSync(CART_STORAGE_KEYS.CART_SELECTIONS);
      await this.updateSyncMetadata();
      
      console.log('All selections cleared from storage');
    } catch (error) {
      console.error('Error clearing selections:', error);
      throw new Error(CART_ERROR_MESSAGES.STORAGE_ERROR);
    }
  }

  /**
   * Validate stored data integrity with comprehensive checks
   */
  static async validateStoredData(): Promise<boolean> {
    try {
      // Check cart items data
      const cartData = wx.getStorageSync(CART_STORAGE_KEYS.CART_ITEMS);
      if (cartData) {
        try {
          const cartItems = JSON.parse(cartData);
          if (!Array.isArray(cartItems)) {
            console.warn('Invalid cart items data format - not an array');
            return false;
          }

          // Validate each cart item structure
          for (const item: any of cartItems) {
            if (!item.productId || typeof item.quantity !== 'number' || !item.selectedAt) {
              console.warn('Invalid cart item structure:', item);
              return false;
            }
          }
        } catch (parseError) {
          console.warn('Failed to parse cart items data:', parseError);
          return false;
        }
      }

      // Check selections data
      const selectionsData = wx.getStorageSync(CART_STORAGE_KEYS.CART_SELECTIONS);
      if (selectionsData) {
        try {
          const selections = JSON.parse(selectionsData);
          if (typeof selections !== 'object' || selections === null || Array.isArray(selections)) {
            console.warn('Invalid selections data format');
            return false;
          }
        } catch (parseError) {
          console.warn('Failed to parse selections data:', parseError);
          return false;
        }
      }

      // Check metadata
      const metadataData = wx.getStorageSync(this.SYNC_METADATA_KEY);
      if (metadataData) {
        try {
          const metadata: SyncMetadata = JSON.parse(metadataData);
          if (!metadata.lastSync || !metadata.version || !metadata.deviceId) {
            console.warn('Invalid metadata structure:', metadata);
            return false;
          }
        } catch (parseError) {
          console.warn('Failed to parse metadata:', parseError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating stored data:', error);
      return false;
    }
  }

  /**
   * Clean up invalid stored data with backup
   */
  static async cleanupInvalidData(): Promise<void> {
    try {
      console.log('Cleaning up invalid cart data');

      // Create backup before cleanup
      await this.createDataBackup();

      // Remove invalid cart data
      wx.removeStorageSync(CART_STORAGE_KEYS.CART_ITEMS);
      wx.removeStorageSync(CART_STORAGE_KEYS.CART_SELECTIONS);
      wx.removeStorageSync(CART_STORAGE_KEYS.CART_BADGE);
      wx.removeStorageSync(this.SYNC_METADATA_KEY);

      console.log('Invalid cart data cleaned up successfully');
    } catch (error) {
      console.error('Error cleaning up invalid data:', error);
    }
  }

  /**
   * Automatic sync triggered by cart events
   */
  private static async autoSync(): Promise<void> {
    try {
      // Debounce auto sync to avoid excessive storage operations
      if (this.autoSyncTimeout) {
        clearTimeout(this.autoSyncTimeout);
      }

      this.autoSyncTimeout = setTimeout(async () => {
        await this.syncToStorage();
      }, 1000); // 1 second debounce
    } catch (error) {
      console.error('Error in auto sync:', error);
    }
  }

  private static autoSyncTimeout: number | null = null;

  /**
   * Resolve data conflicts between local and remote data
   */
  static async resolveDataConflicts(
    localData: CartDataWithMetadata,
    remoteData: CartDataWithMetadata
  ): Promise<ConflictResolutionResult> {
    try {
      console.log('Resolving data conflicts');

      const conflicts: ConflictResolutionResult['conflicts'] = [];
      let resolvedItems: CartItem[] = [];
      let resolvedSelections = new Map<string, boolean>();

      // Resolve items conflicts
      if (localData.metadata.version !== remoteData.metadata.version) {
        // Use timestamp-based resolution for items
        if (localData.metadata.lastSync > remoteData.metadata.lastSync) {
          resolvedItems = localData.items;
          conflicts.push({
            type: 'items',
            localData: localData.items,
            remoteData: remoteData.items,
            resolution: 'local'
          });
        } else {
          resolvedItems = remoteData.items;
          conflicts.push({
            type: 'items',
            localData: localData.items,
            remoteData: remoteData.items,
            resolution: 'remote'
          });
        }
      } else {
        resolvedItems = localData.items;
      }

      // Resolve selections conflicts (merge approach)
      const localSelections = new Map(Object.entries(localData.selections));
      const remoteSelections = new Map(Object.entries(remoteData.selections));
      
      // Merge selections - prefer local selections for conflicts
      resolvedSelections = new Map([...remoteSelections, ...localSelections]);
      
      if (localSelections.size !== remoteSelections.size || 
          ![...localSelections.entries()].every(([key, value]) => remoteSelections.get(key) === value)) {
        conflicts.push({
          type: 'selections',
          localData: Object.fromEntries(localSelections),
          remoteData: Object.fromEntries(remoteSelections),
          resolution: 'merged'
        });
      }

      console.log(`Resolved ${conflicts.length} conflicts`);

      return {
        resolvedItems,
        resolvedSelections,
        conflicts
      };
    } catch (error) {
      console.error('Error resolving data conflicts:', error);
      // Fallback to local data
      return {
        resolvedItems: localData.items,
        resolvedSelections: new Map(Object.entries(localData.selections)),
        conflicts: []
      };
    }
  }

  /**
   * Check if data is expired based on validation period
   */
  private static async isDataExpired(metadata: SyncMetadata): Promise<boolean> {
    const expiryTime = CART_VALIDATION.DATA_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    const currentTime = Date.now();
    return (currentTime - metadata.lastSync) > expiryTime;
  }

  /**
   * Validate expired data against current product information
   */
  private static async validateExpiredData(items: CartItem[]): Promise<{ validItems: CartItem[] }> {
    try {
      console.log('Validating expired cart data');

      const { ProductService } = await import('../services/product');
      const validItems: CartItem[] = [];

      for (const item of items) {
        const productResponse = await ProductService.getProductById(item.productId);
        
        if (productResponse.success && productResponse.data) {
          const product = productResponse.data;
          
          // Check if product is still available and has stock
          if (product.stock > 0) {
            // Adjust quantity if it exceeds available stock
            const adjustedQuantity = Math.min(item.quantity, product.stock);
            validItems.push({
              ...item,
              quantity: adjustedQuantity
            });
          }
        }
      }

      console.log(`Validated ${validItems.length} out of ${items.length} expired items`);
      return { validItems };
    } catch (error) {
      console.error('Error validating expired data:', error);
      return { validItems: [] };
    }
  }

  /**
   * Validate selections against current cart items
   */
  private static async validateSelections(selections: Map<string, boolean>): Promise<Map<string, boolean>> {
    try {
      const { CartService } = await import('../services/cart');
      const cartItems = await CartService.getCartItems();
      const validProductIds = new Set(cartItems.map(item => item.productId));

      const validatedSelections = new Map<string, boolean>();
      
      selections.forEach((selected, productId) => {
        if (validProductIds.has(productId)) {
          validatedSelections.set(productId, selected);
        }
      });

      return validatedSelections;
    } catch (error) {
      console.error('Error validating selections:', error);
      return new Map();
    }
  }

  /**
   * Resolve selection conflicts
   */
  private static async resolveSelectionConflicts(
    currentSelections: Map<string, boolean>,
    newSelections: Map<string, boolean>
  ): Promise<Map<string, boolean>> {
    // Simple merge strategy - new selections take precedence
    return new Map([...currentSelections, ...newSelections]);
  }

  /**
   * Update sync metadata
   */
  private static async updateSyncMetadata(): Promise<void> {
    try {
      const metadata: SyncMetadata = {
        lastSync: Date.now(),
        version: await this.getNextVersion(),
        deviceId: this.deviceId,
        userId: await this.getCurrentUserId()
      };

      wx.setStorageSync(this.SYNC_METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error updating sync metadata:', error);
    }
  }

  /**
   * Get next version number
   */
  private static async getNextVersion(): Promise<number> {
    try {
      const metadataData = wx.getStorageSync(this.SYNC_METADATA_KEY);
      if (metadataData) {
        const metadata: SyncMetadata = JSON.parse(metadataData);
        return metadata.version + 1;
      }
      return 1;
    } catch (error) {
      console.error('Error getting next version:', error);
      return 1;
    }
  }

  /**
   * Get current user ID (placeholder for actual user management)
   */
  private static async getCurrentUserId(): Promise<string | undefined> {
    try {
      // This would integrate with actual user authentication system
      return wx.getStorageSync('user_id') || undefined;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return undefined;
    }
  }

  /**
   * Generate unique device ID
   */
  private static generateDeviceId(): string {
    return 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  }

  /**
   * Convert Map to plain object
   */
  private static mapToObject(map: Map<string, boolean>): { [key: string]: boolean } {
    const obj: { [key: string]: boolean } = {};
    map.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }

  /**
   * Create data backup before cleanup
   */
  private static async createDataBackup(): Promise<void> {
    try {
      const timestamp = Date.now();
      const backupKey = `cart_backup_${timestamp}`;
      
      const cartData = wx.getStorageSync(CART_STORAGE_KEYS.CART_ITEMS);
      const selectionsData = wx.getStorageSync(CART_STORAGE_KEYS.CART_SELECTIONS);
      const metadataData = wx.getStorageSync(this.SYNC_METADATA_KEY);

      const backup = {
        cartData,
        selectionsData,
        metadataData,
        timestamp
      };

      wx.setStorageSync(backupKey, JSON.stringify(backup));
      console.log('Data backup created:', backupKey);
    } catch (error) {
      console.error('Error creating data backup:', error);
    }
  }

  /**
   * Get sync status information
   */
  static async getSyncStatus(): Promise<{
    lastSync: number | null;
    version: number;
    deviceId: string;
    isExpired: boolean;
  }> {
    try {
      const metadataData = wx.getStorageSync(this.SYNC_METADATA_KEY);
      
      if (!metadataData) {
        return {
          lastSync: null,
          version: 0,
          deviceId: this.deviceId,
          isExpired: false
        };
      }

      const metadata: SyncMetadata = JSON.parse(metadataData);
      const isExpired = await this.isDataExpired(metadata);

      return {
        lastSync: metadata.lastSync,
        version: metadata.version,
        deviceId: metadata.deviceId,
        isExpired
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        lastSync: null,
        version: 0,
        deviceId: this.deviceId,
        isExpired: false
      };
    }
  }
}
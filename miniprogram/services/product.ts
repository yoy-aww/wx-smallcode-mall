// services/product.ts
/**
 * Product service for managing product operations
 * Mock implementation for checkout integration
 */

import { MOCK_PRODUCTS, CATEGORY_PRODUCTS, ALL_PRODUCTS, POPULAR_PRODUCTS } from '../data/mock-products';

/**
 * Product service response interface
 */
interface ProductServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Product service class
 */
export class ProductService {
  /**
   * Get product by ID
   */
  static async getProductById(productId: string): Promise<ProductServiceResponse<Product>> {
    try {
      console.log('Getting product by ID:', productId);

      const product = MOCK_PRODUCTS[productId];

      if (!product) {
        return {
          success: false,
          error: '商品不存在',
        };
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      console.error('Failed to get product by ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取商品信息失败',
      };
    }
  }

  /**
   * Get multiple products by IDs
   */
  static async getProductsByIds(productIds: string[]): Promise<ProductServiceResponse<Product[]>> {
    try {
      console.log('Getting products by IDs:', productIds);

      const products: Product[] = [];

      for (const productId of productIds) {
        const productResponse = await this.getProductById(productId);

        if (productResponse.success && productResponse.data) {
          products.push(productResponse.data);
        }
      }

      return {
        success: true,
        data: products,
      };
    } catch (error) {
      console.error('Failed to get products by IDs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取商品信息失败',
      };
    }
  }

  /**
   * Check product stock
   */
  static async checkProductStock(
    productId: string,
    quantity: number
  ): Promise<
    ProductServiceResponse<{
      available: boolean;
      currentStock: number;
      requestedQuantity: number;
    }>
  > {
    try {
      console.log('Checking product stock:', productId, quantity);

      const productResponse = await this.getProductById(productId);

      if (!productResponse.success || !productResponse.data) {
        return {
          success: false,
          error: productResponse.error || '商品不存在',
        };
      }

      const product = productResponse.data;
      const available = quantity <= product.stock;

      return {
        success: true,
        data: {
          available,
          currentStock: product.stock,
          requestedQuantity: quantity,
        },
      };
    } catch (error) {
      console.error('Failed to check product stock:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '检查库存失败',
      };
    }
  }

  /**
   * Update product stock (for order processing)
   */
  static async updateProductStock(
    productId: string,
    quantity: number
  ): Promise<ProductServiceResponse<boolean>> {
    try {
      console.log('Updating product stock:', productId, quantity);

      // In real implementation, this would update the database
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 100));

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      console.error('Failed to update product stock:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新库存失败',
      };
    }
  }

  /**
   * Search products
   */
  static async searchProducts(query: string): Promise<ProductServiceResponse<Product[]>> {
    try {
      console.log('Searching products:', query);

      // Simple search filter using imported products
      const results = POPULAR_PRODUCTS.filter(
        product =>
          product.name.includes(query) ||
          product.description?.includes(query) ||
          product.tags?.some(tag => tag.includes(query))
      );

      await new Promise(resolve => setTimeout(resolve, 200));

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      console.error('Failed to search products:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '搜索商品失败',
      };
    }
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(
    categoryId: string
  ): Promise<ProductServiceResponse<Product[]>> {
    try {
      console.log('Getting products by category:', categoryId);

      const products = CATEGORY_PRODUCTS[categoryId] || [];

      await new Promise(resolve => setTimeout(resolve, 150));

      return {
        success: true,
        data: products,
      };
    } catch (error) {
      console.error('Failed to get products by category:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取分类商品失败',
      };
    }
  }
}

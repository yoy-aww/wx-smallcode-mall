/**
 * Product service — 从后端 API 获取商品数据
 */

function request(url: string): Promise<{ data: any; statusCode: number }> {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'GET',
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res as { data: any; statusCode: number });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        }
      },
      fail: (err) => reject(err),
    });
  });
}

/** POST 请求封装 */
function requestPost(url: string, body: any): Promise<{ data: any; statusCode: number }> {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: body,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res as { data: any; statusCode: number });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        }
      },
      fail: (err) => reject(err),
    });
  });
}

interface ProductServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

const API_BASE_URL = 'http://43.153.148.187:3000';

// 本地缓存全部商品（减少重复请求）
let _cachedAllProducts: Product[] = [];

export class ProductService {

  /** 获取全部商品（带本地缓存） */
  static async getAllProducts(): Promise<ProductServiceResponse<Product[]>> {
    try {
      const { data } = await request(`${API_BASE_URL}/api/products`);
      const list = Array.isArray(data?.data) ? data.data : [];
      _cachedAllProducts = list;
      return { success: true, data: list };
    } catch (e) {
      console.error('[ProductService] getAllProducts 失败:', (e as Error).message);
      return { success: false, error: (e as Error).message || '加载商品失败' };
    }
  }

  /** 获取商品详情 */
  static async getProductById(productId: string): Promise<ProductServiceResponse<Product>> {
    try {
      // 优先从缓存命中
      if (_cachedAllProducts.length > 0) {
        const hit = _cachedAllProducts.find(p => p.id === productId);
        if (hit) return { success: true, data: hit };
      }
      const { data } = await request(`${API_BASE_URL}/api/products/${productId}`);
      return { success: true, data: data?.data || data };
    } catch (e) {
      console.error('[ProductService] getProductById 失败:', (e as Error).message);
      return { success: false, error: (e as Error).message || '获取商品失败' };
    }
  }

  /** 获取分类下的商品 */
  static async getProductsByCategory(categoryId: string): Promise<ProductServiceResponse<Product[]>> {
    try {
      await this.getAllProducts();
      const filtered = _cachedAllProducts.filter(p => p.categoryId === categoryId);
      return { success: true, data: filtered };
    } catch (e) {
      return { success: false, error: (e as Error).message || '获取分类商品失败' };
    }
  }

  /** 搜索商品（关键词搜索） */
  static async searchProducts(query: string): Promise<ProductServiceResponse<Product[]>> {
    try {
      await this.getAllProducts();
      const q = (query || '').trim();
      const results = _cachedAllProducts.filter(p => {
        if (!q) return true;
        return (
          p.name?.includes(q) ||
          (p.description || '').includes(q) ||
          (p.tags || []).some((t: any) => String(t).includes(q))
        );
      });
      return { success: true, data: results };
    } catch (e) {
      return { success: false, error: (e as Error).message || '搜索商品失败' };
    }
  }

  /** 获取多个商品 */
  static async getProductsByIds(productIds: string[]): Promise<ProductServiceResponse<Product[]>> {
    try {
      await this.getAllProducts();
      const products = productIds
        .map(id => _cachedAllProducts.find(p => p.id === id))
        .filter((p): p is Product => !!p);
      return { success: true, data: products };
    } catch (e) {
      return { success: false, error: (e as Error).message || '获取商品失败' };
    }
  }

  /** 检查库存 */
  static async checkProductStock(
    productId: string,
    quantity: number
  ): Promise<ProductServiceResponse<{ available: boolean; currentStock: number; requestedQuantity: number }>> {
    try {
      const res = await this.getProductById(productId);
      if (!res.success || !res.data) {
        return { success: false, error: res.error || '商品不存在' };
      }
      const available = quantity <= res.data.stock;
      return {
        success: true,
        data: { available, currentStock: res.data.stock, requestedQuantity: quantity },
      };
    } catch (e) {
      return { success: false, error: (e as Error).message || '检查库存失败' };
    }
  }

  /** 更新库存（POST） */
  static async updateProductStock(
    productId: string,
    quantity: number
  ): Promise<ProductServiceResponse<boolean>> {
    try {
      await requestPost(`${API_BASE_URL}/api/products/${productId}`, { stock: quantity });
      return { success: true, data: true };
    } catch (e) {
      return { success: false, error: (e as Error).message || '更新库存失败' };
    }
  }
}

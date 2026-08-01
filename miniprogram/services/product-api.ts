/**
 * 商品服务
 * 数据来源：后端 API
 */

// ==================== 类型定义 ====================

export interface ProductItem {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  discountedPrice?: number;
  categoryId: string;
  description?: string;
  stock: number;
  tags?: string[];
  specs?: any[];
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
}

// ==================== 服务实现 ====================

const API_BASE_URL = 'http://43.153.148.187:3000';

export class ProductApi {
  /** 获取全部分类（按 sortOrder 排序） */
  static async getCategories(): Promise<CategoryItem[]> {
    return this._apiCategories();
  }

  /** 获取所有商品（按分类 ID 分组） */
  static async getProductsByCategory(): Promise<Map<string, ProductItem[]>> {
    return this._apiProductsByCategory();
  }

  /** 获取全部商品列表 */
  static async getAllProducts(): Promise<ProductItem[]> {
    return this._apiProducts();
  }

  // ---- API 接口 ----

  private static async _apiProducts(): Promise<ProductItem[]> {
    try {
      const res = await wx.request({ url: `${API_BASE_URL}/api/products`, method: 'GET' });
      const list = res && res.data && res.data.data;
      return (Array.isArray(list) ? list : []).map(p => ({
        id: p.id,
        name: p.name,
        image: p.image,
        originalPrice: p.originalPrice,
        discountedPrice: p.discountedPrice,
        categoryId: p.categoryId,
        description: p.description,
        stock: p.stock,
        tags: p.tags,
      }));
    } catch (e) {
      console.warn('[ProductApi] _apiProducts 请求失败，使用空列表:', e);
      return [];
    }
  }

  private static async _apiCategories(): Promise<CategoryItem[]> {
    try {
      const res = await wx.request({ url: `${API_BASE_URL}/api/categories`, method: 'GET' });
      const list = res && res.data && res.data.data;
      return (Array.isArray(list) ? list : []).map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        sortOrder: c.sortOrder,
      }));
    } catch (e) {
      console.warn('[ProductApi] _apiCategories 请求失败，使用空列表:', e);
      return [];
    }
  }

  private static async _apiProductsByCategory(): Promise<Map<string, ProductItem[]>> {
    const products = await this._apiProducts();
    const map = new Map<string, ProductItem[]>();
    for (const p of products) {
      if (!map.has(p.categoryId)) map.set(p.categoryId, []);
      map.get(p.categoryId)!.push(p);
    }
    return map;
  }
}
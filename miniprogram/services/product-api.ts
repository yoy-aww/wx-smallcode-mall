/**
 * 商品服务
 * 数据来源：后端 API
 *
 * 注意：微信小程序 wx.request 的 Promise 返回值在基础库版本差异下不稳定，
 * 白名单拦截时可能返回 {errMsg, data:undefined} 而非标准的 {data:{...}}。
 * 因此使用 callback 模式手动包裹为 Promise，确保成功/失败路径清晰分离。
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

/**
 * 请求封装：使用 wx.request callback 模式包裹为 Promise
 * - success: resolve({ data, statusCode })
 * - fail / 非 2xx: reject(error)
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
      fail: (err) => {
        reject(err);
      },
    });
  });
}

export class ProductApi {

  // ============ 公共方法 ============

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

  // ============ 私有 API 方法 ============

  private static async _apiProducts(): Promise<ProductItem[]> {
    try {
      const { data } = await request(`${API_BASE_URL}/api/products`);
      const list = Array.isArray(data?.data) ? data.data : [];
      return list.map((p: any) => ({
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
      console.warn('[ProductApi] _apiProducts 请求失败，返回空列表:', (e as Error).message);
      return [];
    }
  }

  private static async _apiCategories(): Promise<CategoryItem[]> {
    try {
      const { data } = await request(`${API_BASE_URL}/api/categories`);
      const list = Array.isArray(data?.data) ? data.data : [];
      return list.map((c: any) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        sortOrder: c.sortOrder,
      }));
    } catch (e) {
      console.warn('[ProductApi] _apiCategories 请求失败，返回空列表:', (e as Error).message);
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

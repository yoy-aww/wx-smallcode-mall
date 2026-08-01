/**
 * Category service — 从后端 API 获取分类
 */

/**
 * 请求封装：callback 模式包裹为 Promise
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

interface CategoryServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const API_BASE_URL = 'http://43.153.148.187:3000';

export class CategoryService {

  static async loadCategories(): Promise<CategoryServiceResponse<Category[]>> {
    try {
      const { data } = await request(`${API_BASE_URL}/api/categories`);
      const list = Array.isArray(data?.data) ? data.data : [];
      const sorted = [...list].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      return { success: true, data: sorted };
    } catch (e) {
      console.error('[CategoryService] loadCategories 失败:', (e as Error).message);
      return { success: false, error: (e as Error).message || '加载分类失败' };
    }
  }

  static async getCategoryById(categoryId: string): Promise<CategoryServiceResponse<Category>> {
    try {
      const categories = await this.loadCategories();
      if (!categories.success || !categories.data) {
        return { success: false, error: '获取分类失败' };
      }
      const cat = categories.data.find(c => c.id === categoryId);
      if (!cat) {
        return { success: false, error: '分类不存在' };
      }
      return { success: true, data: cat };
    } catch (e) {
      console.error('[CategoryService] getCategoryById 失败:', (e as Error).message);
      return { success: false, error: '获取分类信息失败' };
    }
  }

  static async refreshCategories(): Promise<CategoryServiceResponse<Category[]>> {
    return this.loadCategories();
  }

  static async getDefaultCategory(): Promise<Category | null> {
    const res = await this.loadCategories();
    if (!res.success || !res.data || res.data.length === 0) {
      return null;
    }
    return res.data[0];
  }
}

/**
 * Banner 轮播/广告服务
 * 数据来源：后端 API
 */

// ==================== 类型定义 ====================

export interface Banner {
  id: string;
  /** 图片 URL（CDN 全路径） */
  image: string;
  /** 点击跳转链接 */
  link?: string;
  /** 标题 */
  title?: string;
  /** 副标题 */
  subtitle?: string;
  /** 排序权重 */
  sortOrder: number;
  /** 是否启用 */
  enabled: boolean;
  /** 音频介绍（可选） */
  audioUrl?: string;
}

// ==================== 服务实现 ====================

const API_BASE_URL = 'http://43.153.148.187:3000';

/** 请求封装：callback 模式包裹为 Promise，与 product-api 保持一致 */
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

export class BannerService {
  /**
   * 获取所有启用的 Banner
   */
  static async getBanners(): Promise<Banner[]> {
    try {
      const { data } = await request(`${API_BASE_URL}/api/banners`);
      const list = Array.isArray(data?.data) ? data.data : [];
      return list.map((b: any) => ({
        id: b.id,
        image: b.image,
        link: b.link,
        title: b.title,
        subtitle: b.subtitle,
        sortOrder: b.sortOrder,
        enabled: b.enabled,
        audioUrl: b.audioUrl,
      }));
    } catch (e) {
      console.error('[BannerService] API 请求失败:', (e as Error).message);
      return [];
    }
  }
}

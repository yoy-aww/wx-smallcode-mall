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

export class BannerService {
  /**
   * 获取所有启用的 Banner
   */
  static async getBanners(): Promise<Banner[]> {
    try {
      const res = await wx.request({
        url: `${API_BASE_URL}/api/banners`,
        method: 'GET',
      });
      const list = res && res.data && res.data.data;
      return (Array.isArray(list) ? list : []).map(b => ({
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
      console.warn('[BannerService] API 不可用，使用 mock:', e);
      return this._getMockBanners();
    }
  }

  private static _getMockBanners(): Banner[] {
    return [
      {
        id: 'banner_main',
        title: '道地溯源',
        subtitle: '枸益补枸',
        image: 'https://tiyycecb8.hn-bkt.clouddn.com/images/imgs/tcm_herbs_banner_3.jpg',
        link: '',
        sortOrder: 1,
        enabled: true,
        audioUrl: '/audio/intro.wav',
      },
    ];
  }
}
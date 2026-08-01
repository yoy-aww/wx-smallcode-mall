/**
 * Banner 轮播/广告服务
 * =============================================
 * 变动频率：高（每周/每月换活动）
 * 数据来源：上线后走接口，开发阶段用 mock
 *
 * 分层说明：
 *  ┌─ 静态图片（image-mapping.ts）──────────────┐
 *  │  Logo / 图标 / 装饰 / 纹理                 │
 *  │  → 几乎不变，硬编码                         │
 *  └────────────────────────────────────────────┘
 *  ┌─ 动态 Banner（本服务）──────────────────────┐
 *  │  首页轮播 / 活动弹窗 / 促销大图            │
 *  │  → 频繁变动，走接口，上线后改数据库即可     │
 *  └────────────────────────────────────────────┘
 *  ┌─ 产品图（product API）──────────────────────┐
 *  │  产品主图 / 详情图                         │
 *  │  → 随产品增删改，natural 绑定 product API  │
 *  └────────────────────────────────────────────┘
 */

import { BANNER_IMAGES, CATEGORY_IMAGES } from '../images/image-mapping';

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

// ==================== 环境开关 ====================

/**
 * 开发模式：false = 走后端 API；true = 本地 mock
 */
const IS_DEV_MODE = false;

const API_BASE_URL = 'http://43.153.148.187:3000';

// ==================== Mock 数据 ====================

const MOCK_BANNERS: Banner[] = [
  {
    id: 'banner_main',
    title: '道地溯源',
    subtitle: '枸益补枸',
    image: BANNER_IMAGES.main,
    audioUrl: '/audio/intro.wav',
    sortOrder: 1,
    enabled: true,
  },
  {
    id: 'banner_activity',
    title: '限时特惠',
    subtitle: '养生套装低至 5 折',
    image: CATEGORY_IMAGES.welfare,
    sortOrder: 2,
    enabled: true,
    link: '/pages/category/category?type=activity',
  },
  {
    id: 'banner_tea',
    title: '新茶上市',
    subtitle: '春日限定，清香怡人',
    image: CATEGORY_IMAGES.tea,
    sortOrder: 3,
    enabled: true,
    link: '/pages/category/category?type=tea',
  },
];

// ==================== 服务实现 ====================

export class BannerService {
  /**
   * 获取所有启用的 Banner
   * 开发模式返回 mock，上线后调接口
   */
  static async getBanners(): Promise<Banner[]> {
    if (IS_DEV_MODE) {
      return this.getMockBanners();
    }
    return this.getApiBanners();
  }

  /**
   * 获取启用的 Banner（按 sortOrder 排序）
   */
  private static async getMockBanners(): Promise<Banner[]> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_BANNERS
      .filter(b => b.enabled)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * 从接口获取 Banner
   * 上线后替换为真实 API 调用
   */
  private static async getApiBanners(): Promise<Banner[]> {
    try {
      const res = await wx.request({
        url: `${API_BASE_URL}/api/banners`,
        method: 'GET',
      });
      return (res.data.data || []).map(b => ({
        id: b.id,
        image: b.image,
        link: b.link,
        title: b.title,
        subtitle: b.subtitle,
        sortOrder: b.sortOrder,
        enabled: b.enabled,
        audioUrl: b.audioUrl,
      }));
    } catch (error) {
      console.error('[BannerService] Failed to fetch banners:', error);
      return this.getMockBanners();
    }
  }
}
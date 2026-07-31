/**
 * 图片资源映射文件
 * =============================================
 * 分层架构：按变动频率区分图片来源
 *
 *  ┌─ 静态图片（硬编码常量） ──────────────────────┐
 *  │  Logo / 图标 / 装饰 / 纹理 / 分类背景         │
 *  │  → 几乎不变，直接编译进代码                   │
 *  └──────────────────────────────────────────────┘
 *
 *  ┌─ 动态图片（接口返回） ────────────────────────┐
 *  │  Banner / 活动图  → banner-service.ts        │
 *  │  产品图            → 随 product API 返回       │
 *  │  → 频繁变动，走接口，无需发版                  │
 *  └──────────────────────────────────────────────┘
 *
 * 注意：微信小程序包大小限制（2MB），图片需托管到 CDN。
 * 当前 CDN: 七牛云 Kodo
 * 上传: images/imgs/ 目录到七牛云 Bucket 根目录
 */

// ==================== CDN 基础路径 ====================

export const IMAGE_BASE_PATH = 'http://tiyycecb8.hn-bkt.clouddn.com/images/imgs/';

/**
 * 运行时拼接完整 URL
 * 所有图片都通过此函数获取，换域名只需改 IMAGE_BASE_PATH
 */
export function getImageUrl(filename: string): string {
  return `${IMAGE_BASE_PATH}${filename}`;
}

// ==================== 第一层：静态图片（硬编码常量） ====================
// 这些图片几乎不变，直接编译进代码，无需走接口

// 品牌相关图片
export const BRAND_IMAGES = {
  logo: getImageUrl('seal_logo_7.jpg'),
  logoAlt1: getImageUrl('seal_logo_5.jpg'),
  logoAlt2: getImageUrl('seal_logo_8.jpg'),
  background: getImageUrl('warm_background_5.jpg'),
  backgroundAlt1: getImageUrl('warm_background_1.jpg'),
  backgroundAlt2: getImageUrl('warm_background_7.jpg'),
};

// 功能图标
export const ICON_IMAGES = {
  member: getImageUrl('ecommerce_icons_9.png'),
  checkin: getImageUrl('ecommerce_icons_2.jpg'),
  general: getImageUrl('ecommerce_icons_3.jpg'),
};

// 分类背景图片（这些是每个分类的固定背景图，偶尔才改）
export const CATEGORY_IMAGES = {
  welfare: getImageUrl('gift_box_5.jpg'),
  welfareAlt1: getImageUrl('gift_box_0.jpg'),
  welfareAlt2: getImageUrl('gift_box_8.jpg'),
  quality: getImageUrl('product_jars_7.jpg'),
  qualityAlt1: getImageUrl('product_jars_3.jpg'),
  qualityAlt2: getImageUrl('product_jars_4.jpg'),
  qualityAlt3: getImageUrl('product_jars_8.jpg'),
  tea: getImageUrl('tea_background_5.jpg'),
  teaAlt1: getImageUrl('tea_background_7.jpg'),
  teaAlt2: getImageUrl('tea_background_9.jpg'),
  activity: getImageUrl('gift_box_0.jpg'),
  activityAlt1: getImageUrl('gift_box_8.jpg'),
};

// 装饰元素图片
export const DECORATION_IMAGES = {
  herbs: [
    getImageUrl('herb_ingredients_0.jpg'),
    getImageUrl('herb_ingredients_3.jpg'),
    getImageUrl('herb_ingredients_5.jpeg'),
  ],
  powder: [
    getImageUrl('powder_elements_3.png'),
    getImageUrl('powder_elements_6.jpg'),
    getImageUrl('powder_elements_8.jpg'),
  ],
  collage: [
    getImageUrl('medicine_collage_2.jpg'),
    getImageUrl('medicine_collage_7.jpg'),
    getImageUrl('medicine_collage_9.jpg'),
  ],
  plants: [
    getImageUrl('green_plants_1.jpg'),
    getImageUrl('green_plants_3.jpg'),
    getImageUrl('green_plants_6.jpg'),
    getImageUrl('green_plants_9.jpg'),
  ],
  teaDecoration: [
    getImageUrl('tea_decoration_3.jpg'),
    getImageUrl('tea_decoration_7.jpg'),
    getImageUrl('tea_decoration_8.jpg'),
  ],
};

// 背景纹理图片
export const TEXTURE_IMAGES = {
  wood: [
    getImageUrl('wood_texture_2.jpg'),
    getImageUrl('wood_texture_4.jpg'),
    getImageUrl('wood_texture_6.jpg'),
  ],
  paper: [
    getImageUrl('paper_texture_2.jpg'),
    getImageUrl('paper_texture_5.jpg'),
    getImageUrl('paper_texture_7.jpg'),
  ],
  border: [
    getImageUrl('traditional_border_0.jpg'),
    getImageUrl('traditional_border_1.jpg'),
    getImageUrl('traditional_border_7.jpg'),
  ],
};

// ==================== 第二层：Banner 主横幅图片（静态版本） ====================
// 这些图在开发阶段使用，上线后由 banner-service.ts 从接口获取
// 保留此常量作为开发回退，避免接口不可用时页面空白
export const BANNER_IMAGES = {
  main: getImageUrl('tcm_herbs_banner_3.jpg'),
  alt1: getImageUrl('tcm_herbs_banner_4.jpg'),
  alt2: getImageUrl('tcm_herbs_banner_1.jpg'),
};

// ==================== 分享图片 ====================

export const SHARE_IMAGES = {
  default: getImageUrl('tcm_herbs_banner_4.jpg'),
  alt1: getImageUrl('tcm_herbs_banner_3.jpg'),
  alt2: getImageUrl('product_jars_7.jpg'),
};

// ==================== 推荐使用组合（素材指南） ====================

export const RECOMMENDED_COMBINATIONS = {
  mainBanner: {
    background: BANNER_IMAGES.main,
    overlay: 'rgba(0, 0, 0, 0.3)',
  },
  productDisplay: {
    foreground: CATEGORY_IMAGES.quality,
    background: TEXTURE_IMAGES.wood[2],
  },
  promotion: {
    background: CATEGORY_IMAGES.welfare,
    theme: 'orange',
  },
  teaSection: {
    decoration: DECORATION_IMAGES.teaDecoration[2],
    background: CATEGORY_IMAGES.tea,
  },
  pageBackground: {
    primary: BRAND_IMAGES.background,
    texture: TEXTURE_IMAGES.paper[0],
  },
};

// ==================== 图片质量评分 ====================

export const IMAGE_QUALITY_SCORES: Record<string, number> = {
  [CATEGORY_IMAGES.welfare]: 0.95,
  [CATEGORY_IMAGES.quality]: 0.92,
  [BANNER_IMAGES.main]: 0.92,
  [CATEGORY_IMAGES.welfareAlt1]: 0.94,
  [CATEGORY_IMAGES.activityAlt1]: 0.94,
  [CATEGORY_IMAGES.qualityAlt1]: 0.91,
  [BANNER_IMAGES.alt1]: 0.87,
  [CATEGORY_IMAGES.qualityAlt2]: 0.87,
  [BANNER_IMAGES.alt2]: 0.86,
};

// ==================== 默认图片配置 ====================

export const DEFAULT_IMAGES = {
  brandLogo: BRAND_IMAGES.logo,
  brandBackground: BRAND_IMAGES.background,
  mainBanner: BANNER_IMAGES.main,
  memberIcon: ICON_IMAGES.member,
  checkinIcon: ICON_IMAGES.checkin,
  welfareCategory: CATEGORY_IMAGES.welfare,
  qualityCategory: CATEGORY_IMAGES.quality,
  teaCategory: CATEGORY_IMAGES.tea,
  activityCategory: CATEGORY_IMAGES.activity,
  shareImage: SHARE_IMAGES.default,
};
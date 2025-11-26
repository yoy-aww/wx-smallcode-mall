/**
 * 图片资源映射文件
 * 根据图片素材使用指南整理的图片路径映射
 */

// 图片基础路径
const IMAGE_BASE_PATH = '/images/imgs/';

// 品牌相关图片
export const BRAND_IMAGES = {
  // Logo相关 - 使用传统印章风格
  logo: `${IMAGE_BASE_PATH}seal_logo_7.jpg`,
  logoAlt1: `${IMAGE_BASE_PATH}seal_logo_5.jpg`,
  logoAlt2: `${IMAGE_BASE_PATH}seal_logo_8.jpg`,

  // 品牌背景 - 暖色调背景
  background: `${IMAGE_BASE_PATH}warm_background_5.jpg`,
  backgroundAlt1: `${IMAGE_BASE_PATH}warm_background_1.jpg`,
  backgroundAlt2: `${IMAGE_BASE_PATH}warm_background_7.jpg`,
};

// 主横幅图片
export const BANNER_IMAGES = {
  // 主横幅背景 - 高质量中药材展示
  main: `${IMAGE_BASE_PATH}tcm_herbs_banner_3.jpg`,
  alt1: `${IMAGE_BASE_PATH}tcm_herbs_banner_4.jpg`, // 传统中药材配木质研钵
  alt2: `${IMAGE_BASE_PATH}tcm_herbs_banner_1.jpg`, // 木碗盛装中药材
};

// 功能图标
export const ICON_IMAGES = {
  // 电商功能图标
  member: `${IMAGE_BASE_PATH}ecommerce_icons_9.png`,
  checkin: `${IMAGE_BASE_PATH}ecommerce_icons_2.jpg`,
  general: `${IMAGE_BASE_PATH}ecommerce_icons_3.jpg`,
};

// 分类背景图片
export const CATEGORY_IMAGES = {
  // 惠民专区 - 促销礼品素材
  welfare: `${IMAGE_BASE_PATH}gift_box_5.jpg`, // 新年主题礼品盒，橙色元素突出
  welfareAlt1: `${IMAGE_BASE_PATH}gift_box_0.jpg`, // 中式新年礼品盒设计
  welfareAlt2: `${IMAGE_BASE_PATH}gift_box_8.jpg`, // 节庆主题包装

  // 品质自营 - 产品展示图片
  quality: `${IMAGE_BASE_PATH}product_jars_7.jpg`, // 精美罐装产品展示
  qualityAlt1: `${IMAGE_BASE_PATH}product_jars_3.jpg`, // 中药材瓶装包装
  qualityAlt2: `${IMAGE_BASE_PATH}product_jars_4.jpg`, // 传统药材罐装展示
  qualityAlt3: `${IMAGE_BASE_PATH}product_jars_8.jpg`,

  // 茶饮专区 - 茶饮专区素材
  tea: `${IMAGE_BASE_PATH}tea_background_5.jpg`, // 茶叶背景
  teaAlt1: `${IMAGE_BASE_PATH}tea_background_7.jpg`,
  teaAlt2: `${IMAGE_BASE_PATH}tea_background_9.jpg`,

  // 活动专区 - 促销礼品素材
  activity: `${IMAGE_BASE_PATH}gift_box_0.jpg`, // 中式新年礼品盒设计
  activityAlt1: `${IMAGE_BASE_PATH}gift_box_8.jpg`, // 节庆主题包装
};

// 装饰元素图片
export const DECORATION_IMAGES = {
  // 中药材装饰元素
  herbs: [
    `${IMAGE_BASE_PATH}herb_ingredients_0.jpg`,
    `${IMAGE_BASE_PATH}herb_ingredients_3.jpg`,
    `${IMAGE_BASE_PATH}herb_ingredients_5.jpeg`,
  ],

  // 粉末状药材装饰
  powder: [
    `${IMAGE_BASE_PATH}powder_elements_3.png`,
    `${IMAGE_BASE_PATH}powder_elements_6.jpg`,
    `${IMAGE_BASE_PATH}powder_elements_8.jpg`,
  ],

  // 中药材拼贴装饰
  collage: [
    `${IMAGE_BASE_PATH}medicine_collage_2.jpg`,
    `${IMAGE_BASE_PATH}medicine_collage_7.jpg`,
    `${IMAGE_BASE_PATH}medicine_collage_9.jpg`,
  ],

  // 绿色植物装饰
  plants: [
    `${IMAGE_BASE_PATH}green_plants_1.jpg`,
    `${IMAGE_BASE_PATH}green_plants_3.jpg`,
    `${IMAGE_BASE_PATH}green_plants_6.jpg`,
    `${IMAGE_BASE_PATH}green_plants_9.png`,
  ],

  // 茶文化装饰元素
  teaDecoration: [
    `${IMAGE_BASE_PATH}tea_decoration_3.jpg`,
    `${IMAGE_BASE_PATH}tea_decoration_7.png`,
    `${IMAGE_BASE_PATH}tea_decoration_8.png`,
  ],
};

// 背景纹理图片
export const TEXTURE_IMAGES = {
  // 木质纹理背景
  wood: [
    `${IMAGE_BASE_PATH}wood_texture_2.jpg`,
    `${IMAGE_BASE_PATH}wood_texture_4.jpg`,
    `${IMAGE_BASE_PATH}wood_texture_6.jpg`,
  ],

  // 牛皮纸纹理背景
  paper: [
    `${IMAGE_BASE_PATH}paper_texture_2.jpg`,
    `${IMAGE_BASE_PATH}paper_texture_5.jpg`,
    `${IMAGE_BASE_PATH}paper_texture_7.jpg`,
  ],

  // 传统边框装饰
  border: [
    `${IMAGE_BASE_PATH}traditional_border_0.jpg`,
    `${IMAGE_BASE_PATH}traditional_border_1.jpg`,
    `${IMAGE_BASE_PATH}traditional_border_7.jpg`,
  ],
};

// 分享图片
export const SHARE_IMAGES = {
  default: `${IMAGE_BASE_PATH}tcm_herbs_banner_4.jpg`, // 传统中药材配木质研钵
  alt1: `${IMAGE_BASE_PATH}tcm_herbs_banner_3.jpg`, // 高质量中药材展示
  alt2: `${IMAGE_BASE_PATH}product_jars_7.jpg`, // 精美罐装产品展示
};

// 推荐使用组合（根据素材指南）
export const RECOMMENDED_COMBINATIONS = {
  // 首页主横幅
  mainBanner: {
    background: BANNER_IMAGES.main,
    overlay: 'rgba(0, 0, 0, 0.3)', // 文字叠加透明度
  },

  // 产品展示区
  productDisplay: {
    foreground: CATEGORY_IMAGES.quality,
    background: TEXTURE_IMAGES.wood[2], // wood_texture_6.jpg
  },

  // 促销专区
  promotion: {
    background: CATEGORY_IMAGES.welfare,
    theme: 'orange', // 橙色主题配色
  },

  // 茶饮专区
  teaSection: {
    decoration: DECORATION_IMAGES.teaDecoration[2], // tea_decoration_8.png
    background: CATEGORY_IMAGES.tea,
  },

  // 整体背景
  pageBackground: {
    primary: BRAND_IMAGES.background, // warm_background_5.jpg
    texture: TEXTURE_IMAGES.paper[0], // paper_texture_2.jpg
  },
};

// 图片质量评分（根据素材指南）
export const IMAGE_QUALITY_SCORES = {
  [CATEGORY_IMAGES.welfare]: 0.95, // gift_box_5.jpg
  [CATEGORY_IMAGES.quality]: 0.92, // product_jars_7.jpg
  [BANNER_IMAGES.main]: 0.92, // tcm_herbs_banner_3.jpg
  [CATEGORY_IMAGES.welfareAlt1]: 0.94, // gift_box_0.jpg
  [CATEGORY_IMAGES.activityAlt1]: 0.94, // gift_box_8.jpg
  [CATEGORY_IMAGES.qualityAlt1]: 0.91, // product_jars_3.jpg
  [BANNER_IMAGES.alt1]: 0.87, // tcm_herbs_banner_4.jpg
  [CATEGORY_IMAGES.qualityAlt2]: 0.87, // product_jars_4.jpg
  [BANNER_IMAGES.alt2]: 0.86, // tcm_herbs_banner_1.jpg
};

// 导出默认图片配置
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

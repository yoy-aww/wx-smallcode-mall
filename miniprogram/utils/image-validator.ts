/**
 * 图片路径验证工具
 * 用于验证图片路径是否存在，按图片类型分层验证
 *
 * 分层说明：
 *  - 静态图片（硬编码常量）：可离线验证，编译时就知道是否存在
 *  - 产品图片                   ：随 API 返回，运行时验证
 *  - Banner / 活动图           ：随 API 返回，运行时验证
 */

import { getImageUrl } from '../images/image-mapping';

// ==================== 静态图片映射 ====================
// 这些是 images/imgs/ 目录中实际存在的文件
// 新增图片时只需在此添加文件名

const EXISTING_IMAGE_FILES = [
  '01_smartphone.png',
  '02_laptop.jpeg',
  '03_camera.jpg',
  '04_coffee.jpg',
  '05_skincare.jpg',
  '06_watch.jpg',
  '07_shoes.jpg',
  '08_tshirt.jpeg',
  '09_handbag.jpg',
  '10_backpack.jpg',
  '11_thermos.jpg',
  '12_water_bottle.jpg',
  '13_earbuds.jpg',
  '14_jeans.jpeg',
  '15_lamp.jpg',
  'ecommerce_icons_2.jpg',
  'ecommerce_icons_3.jpg',
  'ecommerce_icons_9.png',
  'gift_box_0.jpg',
  'gift_box_5.jpg',
  'gift_box_8.jpg',
  'green_plants_1.jpg',
  'green_plants_3.jpg',
  'green_plants_6.jpg',
  'green_plants_9.jpg',
  'herb_ingredients_0.jpg',
  'herb_ingredients_3.jpg',
  'herb_ingredients_5.jpeg',
  'medicine_collage_2.jpg',
  'medicine_collage_7.jpg',
  'medicine_collage_9.jpg',
  'paper_texture_2.jpg',
  'paper_texture_5.jpg',
  'paper_texture_7.jpg',
  'powder_elements_3.png',
  'powder_elements_6.jpg',
  'powder_elements_8.jpg',
  'product_jars_3.jpg',
  'product_jars_4.jpg',
  'product_jars_7.jpg',
  'product_jars_8.jpg',
  'seal_logo_5.jpg',
  'seal_logo_7.jpg',
  'seal_logo_8.jpg',
  'tcm_herbs_banner_1.jpg',
  'tcm_herbs_banner_3.jpg',
  'tcm_herbs_banner_4.jpg',
  'tea_background_5.jpg',
  'tea_background_7.jpg',
  'tea_background_9.jpg',
  'tea_decoration_3.jpg',
  'tea_decoration_7.jpg',
  'tea_decoration_8.jpg',
  'traditional_border_0.jpg',
  'traditional_border_1.jpg',
  'traditional_border_7.jpg',
  'warm_background_1.jpg',
  'warm_background_5.jpg',
  'warm_background_7.jpg',
  'wood_texture_2.jpg',
  'wood_texture_4.jpg',
  'wood_texture_6.jpg',
];

// 缓存完整 URL → 布尔值，避免重复解析
const existingImageSet = new Set(
  EXISTING_IMAGE_FILES.map(f => getImageUrl(f))
);

/**
 * 验证图片路径是否存在（静态图片）
 * 只验证本地已知的静态图片，动态图片（API 返回的）不做验证
 */
export function validateImagePath(imagePath: string): boolean {
  return existingImageSet.has(imagePath);
}

/**
 * 获取所有可用的静态图片路径
 */
export function getAvailableImages(): string[] {
  return [...existingImageSet];
}

/**
 * 根据分类获取推荐的静态图片
 */
export function getRecommendedImagesForCategory(category: string): string[] {
  const allImages = getAvailableImages();

  switch (category) {
    case 'welfare':
    case 'herbs':
      return allImages.filter(path =>
        path.includes('herb_ingredients') ||
        path.includes('medicine_collage') ||
        path.includes('product_jars')
      );

    case 'tea':
      return allImages.filter(path =>
        path.includes('tea_decoration') ||
        path.includes('tea_background') ||
        path.includes('green_plants')
      );

    case 'activity':
      return allImages.filter(path =>
        path.includes('gift_box') ||
        path.includes('medicine_collage')
      );

    case 'health':
    case 'supplements':
      return allImages.filter(path =>
        path.includes('product_jars') ||
        path.includes('powder_elements') ||
        path.includes('warm_background') ||
        path.includes('green_plants')
      );

    default:
      return allImages;
  }
}

/**
 * 获取默认占位符图片
 */
export function getDefaultPlaceholderImage(): string {
  return getImageUrl('warm_background_5.jpg');
}

/**
 * 验证产品数据中的所有图片路径
 * @param products 产品数组
 */
export function validateProductImages(products: any[]): {
  valid: boolean;
  invalidPaths: string[];
  validPaths: string[];
} {
  const invalidPaths: string[] = [];
  const validPaths: string[] = [];

  products.forEach(product => {
    if (product.image) {
      if (validateImagePath(product.image)) {
        validPaths.push(product.image);
      } else {
        invalidPaths.push(product.image);
      }
    }
  });

  return {
    valid: invalidPaths.length === 0,
    invalidPaths,
    validPaths,
  };
}

/**
 * 修复无效的图片路径
 * @param products 产品数组
 */
export function fixInvalidImagePaths(products: any[]): any[] {
  return products.map(product => {
    if (product.image && !validateImagePath(product.image)) {
      const recommendedImages = getRecommendedImagesForCategory(product.categoryId);
      const fallbackImage = recommendedImages.length > 0
        ? recommendedImages[0]
        : getDefaultPlaceholderImage();

      console.warn(`Invalid image path for product ${product.id}: ${product.image}, using fallback: ${fallbackImage}`);

      return {
        ...product,
        image: fallbackImage,
      };
    }
    return product;
  });
}
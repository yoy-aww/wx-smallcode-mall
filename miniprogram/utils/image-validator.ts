/**
 * 图片路径验证工具
 * 用于验证产品图片路径是否存在
 */

import { IMAGE_BASE_PATH } from '../images/image-mapping';

/**
 * 实际存在的图片文件列表
 * 基于 mall/miniprogram/images/imgs/ 目录的实际文件
 */
const EXISTING_IMAGES = [
  `${IMAGE_BASE_PATH}01_smartphone.png`,
  `${IMAGE_BASE_PATH}02_laptop.jpeg`,
  `${IMAGE_BASE_PATH}03_camera.jpg`,
  `${IMAGE_BASE_PATH}04_coffee.jpg`,
  `${IMAGE_BASE_PATH}05_skincare.jpg`,
  `${IMAGE_BASE_PATH}06_watch.jpg`,
  `${IMAGE_BASE_PATH}07_shoes.jpg`,
  `${IMAGE_BASE_PATH}08_tshirt.jpeg`,
  `${IMAGE_BASE_PATH}09_handbag.jpg`,
  `${IMAGE_BASE_PATH}10_backpack.jpg`,
  `${IMAGE_BASE_PATH}11_thermos.jpg`,
  `${IMAGE_BASE_PATH}12_water_bottle.jpg`,
  `${IMAGE_BASE_PATH}13_earbuds.jpg`,
  `${IMAGE_BASE_PATH}14_jeans.jpeg`,
  `${IMAGE_BASE_PATH}15_lamp.jpg`,
  `${IMAGE_BASE_PATH}ecommerce_icons_2.jpg`,
  `${IMAGE_BASE_PATH}ecommerce_icons_3.jpg`,
  `${IMAGE_BASE_PATH}ecommerce_icons_9.png`,
  `${IMAGE_BASE_PATH}gift_box_0.jpg`,
  `${IMAGE_BASE_PATH}gift_box_5.jpg`,
  `${IMAGE_BASE_PATH}gift_box_8.jpg`,
  `${IMAGE_BASE_PATH}green_plants_1.jpg`,
  `${IMAGE_BASE_PATH}green_plants_3.jpg`,
  `${IMAGE_BASE_PATH}green_plants_6.jpg`,
  `${IMAGE_BASE_PATH}green_plants_9.jpg`,
  `${IMAGE_BASE_PATH}herb_ingredients_0.jpg`,
  `${IMAGE_BASE_PATH}herb_ingredients_3.jpg`,
  `${IMAGE_BASE_PATH}herb_ingredients_5.jpeg`,
  `${IMAGE_BASE_PATH}medicine_collage_2.jpg`,
  `${IMAGE_BASE_PATH}medicine_collage_7.jpg`,
  `${IMAGE_BASE_PATH}medicine_collage_9.jpg`,
  `${IMAGE_BASE_PATH}paper_texture_2.jpg`,
  `${IMAGE_BASE_PATH}paper_texture_5.jpg`,
  `${IMAGE_BASE_PATH}paper_texture_7.jpg`,
  `${IMAGE_BASE_PATH}powder_elements_3.png`,
  `${IMAGE_BASE_PATH}powder_elements_6.jpg`,
  `${IMAGE_BASE_PATH}powder_elements_8.jpg`,
  `${IMAGE_BASE_PATH}product_jars_3.jpg`,
  `${IMAGE_BASE_PATH}product_jars_4.jpg`,
  `${IMAGE_BASE_PATH}product_jars_7.jpg`,
  `${IMAGE_BASE_PATH}product_jars_8.jpg`,
  `${IMAGE_BASE_PATH}seal_logo_5.jpg`,
  `${IMAGE_BASE_PATH}seal_logo_7.jpg`,
  `${IMAGE_BASE_PATH}seal_logo_8.jpg`,
  `${IMAGE_BASE_PATH}tcm_herbs_banner_1.jpg`,
  `${IMAGE_BASE_PATH}tcm_herbs_banner_3.jpg`,
  `${IMAGE_BASE_PATH}tcm_herbs_banner_4.jpg`,
  `${IMAGE_BASE_PATH}tea_background_5.jpg`,
  `${IMAGE_BASE_PATH}tea_background_7.jpg`,
  `${IMAGE_BASE_PATH}tea_background_9.jpg`,
  `${IMAGE_BASE_PATH}tea_decoration_3.jpg`,
  `${IMAGE_BASE_PATH}tea_decoration_7.jpg`,
  `${IMAGE_BASE_PATH}tea_decoration_8.jpg`,
  `${IMAGE_BASE_PATH}traditional_border_0.jpg`,
  `${IMAGE_BASE_PATH}traditional_border_1.jpg`,
  `${IMAGE_BASE_PATH}traditional_border_7.jpg`,
  `${IMAGE_BASE_PATH}warm_background_1.jpg`,
  `${IMAGE_BASE_PATH}warm_background_5.jpg`,
  `${IMAGE_BASE_PATH}warm_background_7.jpg`,
  `${IMAGE_BASE_PATH}wood_texture_2.jpg`,
  `${IMAGE_BASE_PATH}wood_texture_4.jpg`,
  `${IMAGE_BASE_PATH}wood_texture_6.jpg`
];

/**
 * 验证图片路径是否存在
 * @param imagePath 图片路径
 * @returns 是否存在
 */
export function validateImagePath(imagePath: string): boolean {
  return EXISTING_IMAGES.includes(imagePath);
}

/**
 * 获取所有可用的图片路径
 * @returns 可用图片路径数组
 */
export function getAvailableImages(): string[] {
  return [...EXISTING_IMAGES];
}

/**
 * 根据分类获取推荐的图片
 * @param category 产品分类
 * @returns 推荐的图片路径数组
 */
export function getRecommendedImagesForCategory(category: string): string[] {
  switch (category) {
    case 'welfare':
    case 'herbs':
      return EXISTING_IMAGES.filter(path => 
        path.includes('herb_ingredients') || 
        path.includes('medicine_collage') ||
        path.includes('product_jars')
      );
    
    case 'tea':
      return EXISTING_IMAGES.filter(path => 
        path.includes('tea_decoration') || 
        path.includes('tea_background') ||
        path.includes('green_plants')
      );
    
    case 'activity':
      return EXISTING_IMAGES.filter(path => 
        path.includes('gift_box') || 
        path.includes('medicine_collage')
      );
    
    case 'health':
    case 'supplements':
      return EXISTING_IMAGES.filter(path => 
        path.includes('product_jars') || 
        path.includes('powder_elements') ||
        path.includes('warm_background') ||
        path.includes('green_plants')
      );
    
    default:
      return EXISTING_IMAGES;
  }
}

/**
 * 获取默认占位符图片
 * @returns 默认图片路径
 */
export function getDefaultPlaceholderImage(): string {
  return `${IMAGE_BASE_PATH}warm_background_5.jpg`;
}

/**
 * 验证产品数据中的所有图片路径
 * @param products 产品数组
 * @returns 验证结果
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
    validPaths
  };
}

/**
 * 修复无效的图片路径
 * @param products 产品数组
 * @returns 修复后的产品数组
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
        image: fallbackImage
      };
    }
    return product;
  });
}
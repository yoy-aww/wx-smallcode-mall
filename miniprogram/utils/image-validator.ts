/**
 * 图片路径验证工具
 * 用于验证产品图片路径是否存在
 */

/**
 * 实际存在的图片文件列表
 * 基于 mall/miniprogram/images/imgs/ 目录的实际文件
 */
const EXISTING_IMAGES = [
  '/images/imgs/01_smartphone.png',
  '/images/imgs/02_laptop.jpeg',
  '/images/imgs/03_camera.jpg',
  '/images/imgs/04_coffee.jpg',
  '/images/imgs/05_skincare.jpg',
  '/images/imgs/06_watch.jpg',
  '/images/imgs/07_shoes.jpg',
  '/images/imgs/08_tshirt.jpeg',
  '/images/imgs/09_handbag.jpg',
  '/images/imgs/10_backpack.jpg',
  '/images/imgs/11_thermos.jpg',
  '/images/imgs/12_water_bottle.jpg',
  '/images/imgs/13_earbuds.jpg',
  '/images/imgs/14_jeans.jpeg',
  '/images/imgs/15_lamp.jpg',
  '/images/imgs/ecommerce_icons_2.jpg',
  '/images/imgs/ecommerce_icons_3.jpg',
  '/images/imgs/ecommerce_icons_9.png',
  '/images/imgs/gift_box_0.jpg',
  '/images/imgs/gift_box_5.jpg',
  '/images/imgs/gift_box_8.jpg',
  '/images/imgs/green_plants_1.jpg',
  '/images/imgs/green_plants_3.jpg',
  '/images/imgs/green_plants_6.jpg',
  '/images/imgs/green_plants_9.png',
  '/images/imgs/herb_ingredients_0.jpg',
  '/images/imgs/herb_ingredients_3.jpg',
  '/images/imgs/herb_ingredients_5.jpeg',
  '/images/imgs/medicine_collage_2.jpg',
  '/images/imgs/medicine_collage_7.jpg',
  '/images/imgs/medicine_collage_9.jpg',
  '/images/imgs/paper_texture_2.jpg',
  '/images/imgs/paper_texture_5.jpg',
  '/images/imgs/paper_texture_7.jpg',
  '/images/imgs/powder_elements_3.png',
  '/images/imgs/powder_elements_6.jpg',
  '/images/imgs/powder_elements_8.jpg',
  '/images/imgs/product_jars_3.jpg',
  '/images/imgs/product_jars_4.jpg',
  '/images/imgs/product_jars_7.jpg',
  '/images/imgs/product_jars_8.jpg',
  '/images/imgs/seal_logo_5.jpg',
  '/images/imgs/seal_logo_7.jpg',
  '/images/imgs/seal_logo_8.jpg',
  '/images/imgs/tcm_herbs_banner_1.jpg',
  '/images/imgs/tcm_herbs_banner_3.jpg',
  '/images/imgs/tcm_herbs_banner_4.jpg',
  '/images/imgs/tea_background_5.jpg',
  '/images/imgs/tea_background_7.jpg',
  '/images/imgs/tea_background_9.jpg',
  '/images/imgs/tea_decoration_3.jpg',
  '/images/imgs/tea_decoration_7.png',
  '/images/imgs/tea_decoration_8.png',
  '/images/imgs/traditional_border_0.jpg',
  '/images/imgs/traditional_border_1.jpg',
  '/images/imgs/traditional_border_7.jpg',
  '/images/imgs/warm_background_1.jpg',
  '/images/imgs/warm_background_5.jpg',
  '/images/imgs/warm_background_7.jpg',
  '/images/imgs/wood_texture_2.jpg',
  '/images/imgs/wood_texture_4.jpg',
  '/images/imgs/wood_texture_6.jpg'
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
  return '/images/imgs/warm_background_5.jpg';
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
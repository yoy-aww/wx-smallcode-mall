/**
 * 测试产品图片路径的有效性
 */

import { validateProductImages } from './image-validator';

// 模拟产品数据用于测试
const TEST_PRODUCTS = [
  { id: 'welfare-001', image: '/images/imgs/herb_ingredients_0.jpg', categoryId: 'welfare' },
  { id: 'welfare-002', image: '/images/imgs/herb_ingredients_3.jpg', categoryId: 'welfare' },
  { id: 'welfare-003', image: '/images/imgs/herb_ingredients_5.jpeg', categoryId: 'welfare' },
  { id: 'welfare-004', image: '/images/imgs/tea_background_7.jpg', categoryId: 'welfare' },
  { id: 'welfare-005', image: '/images/imgs/tea_background_9.jpg', categoryId: 'welfare' },
  
  { id: 'tea-001', image: '/images/imgs/tea_decoration_3.jpg', categoryId: 'tea' },
  { id: 'tea-002', image: '/images/imgs/tea_decoration_7.png', categoryId: 'tea' },
  { id: 'tea-003', image: '/images/imgs/tea_background_5.jpg', categoryId: 'tea' },
  { id: 'tea-004', image: '/images/imgs/tea_decoration_8.png', categoryId: 'tea' },
  { id: 'tea-005', image: '/images/imgs/green_plants_1.jpg', categoryId: 'tea' },
  
  { id: 'activity-001', image: '/images/imgs/gift_box_8.jpg', categoryId: 'activity' },
  { id: 'activity-002', image: '/images/imgs/medicine_collage_2.jpg', categoryId: 'activity' },
  { id: 'activity-003', image: '/images/imgs/gift_box_0.jpg', categoryId: 'activity' },
  { id: 'activity-004', image: '/images/imgs/gift_box_5.jpg', categoryId: 'activity' },
  
  { id: 'herbs-001', image: '/images/imgs/product_jars_3.jpg', categoryId: 'herbs' },
  { id: 'herbs-002', image: '/images/imgs/product_jars_4.jpg', categoryId: 'herbs' },
  { id: 'herbs-003', image: '/images/imgs/product_jars_8.jpg', categoryId: 'herbs' },
  { id: 'herbs-004', image: '/images/imgs/medicine_collage_9.jpg', categoryId: 'herbs' },
  { id: 'herbs-005', image: '/images/imgs/warm_background_1.jpg', categoryId: 'herbs' },
  
  { id: 'health-001', image: '/images/imgs/product_jars_7.jpg', categoryId: 'health' },
  { id: 'health-002', image: '/images/imgs/medicine_collage_7.jpg', categoryId: 'health' },
  { id: 'health-003', image: '/images/imgs/warm_background_5.jpg', categoryId: 'health' },
  { id: 'health-004', image: '/images/imgs/warm_background_7.jpg', categoryId: 'health' },
  
  { id: 'supplements-001', image: '/images/imgs/powder_elements_3.png', categoryId: 'supplements' },
  { id: 'supplements-002', image: '/images/imgs/powder_elements_6.jpg', categoryId: 'supplements' },
  { id: 'supplements-003', image: '/images/imgs/green_plants_3.jpg', categoryId: 'supplements' },
  { id: 'supplements-004', image: '/images/imgs/green_plants_6.jpg', categoryId: 'supplements' }
];

/**
 * 运行图片路径验证测试
 */
export function runImageValidationTest(): void {
  console.log('🔍 开始验证产品图片路径...');
  
  const validation = validateProductImages(TEST_PRODUCTS);
  
  console.log(`✅ 有效图片路径: ${validation.validPaths.length}`);
  console.log(`❌ 无效图片路径: ${validation.invalidPaths.length}`);
  
  if (validation.invalidPaths.length > 0) {
    console.error('无效的图片路径:', validation.invalidPaths);
  }
  
  if (validation.valid) {
    console.log('🎉 所有产品图片路径验证通过！');
  } else {
    console.warn('⚠️ 发现无效的图片路径，需要修复');
  }
  
  // 按分类统计
  const categoryStats: Record<string, number> = {};
  TEST_PRODUCTS.forEach(product => {
    categoryStats[product.categoryId] = (categoryStats[product.categoryId] || 0) + 1;
  });
  
  console.log('📊 各分类产品数量统计:');
  Object.entries(categoryStats).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} 个产品`);
  });
}

// 如果直接运行此文件，执行测试
if (typeof wx === 'undefined') {
  // 非微信小程序环境下运行测试
  runImageValidationTest();
}
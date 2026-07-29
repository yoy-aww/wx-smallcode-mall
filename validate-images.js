/**
 * 验证产品图片路径的脚本
 */

// 实际存在的图片文件
const existingImages = [
  '/images/imgs/herb_ingredients_0.jpg',
  '/images/imgs/herb_ingredients_3.jpg',
  '/images/imgs/herb_ingredients_5.jpeg',
  '/images/imgs/tea_decoration_3.jpg',
  '/images/imgs/tea_decoration_7.jpg',
  '/images/imgs/tea_background_5.jpg',
  '/images/imgs/tea_decoration_8.jpg',
  '/images/imgs/green_plants_1.jpg',
  '/images/imgs/gift_box_8.jpg',
  '/images/imgs/medicine_collage_2.jpg',
  '/images/imgs/gift_box_0.jpg',
  '/images/imgs/gift_box_5.jpg',
  '/images/imgs/product_jars_3.jpg',
  '/images/imgs/product_jars_4.jpg',
  '/images/imgs/product_jars_8.jpg',
  '/images/imgs/medicine_collage_9.jpg',
  '/images/imgs/warm_background_1.jpg',
  '/images/imgs/product_jars_7.jpg',
  '/images/imgs/medicine_collage_7.jpg',
  '/images/imgs/warm_background_5.jpg',
  '/images/imgs/warm_background_7.jpg',
  '/images/imgs/powder_elements_3.png',
  '/images/imgs/powder_elements_6.jpg',
  '/images/imgs/green_plants_3.jpg',
  '/images/imgs/green_plants_6.jpg',
  '/images/imgs/tea_background_7.jpg',
  '/images/imgs/tea_background_9.jpg',
];

// 产品中使用的图片路径
const usedImages = [
  '/images/imgs/herb_ingredients_0.jpg', // welfare-001
  '/images/imgs/herb_ingredients_3.jpg', // welfare-002
  '/images/imgs/herb_ingredients_5.jpeg', // welfare-003
  '/images/imgs/tea_background_7.jpg', // welfare-004
  '/images/imgs/tea_background_9.jpg', // welfare-005
  '/images/imgs/tea_decoration_3.jpg', // tea-001
  '/images/imgs/tea_decoration_7.jpg', // tea-002
  '/images/imgs/tea_background_5.jpg', // tea-003
  '/images/imgs/tea_decoration_8.jpg', // tea-004
  '/images/imgs/green_plants_1.jpg', // tea-005
  '/images/imgs/gift_box_8.jpg', // activity-001
  '/images/imgs/medicine_collage_2.jpg', // activity-002
  '/images/imgs/gift_box_0.jpg', // activity-003
  '/images/imgs/gift_box_5.jpg', // activity-004
  '/images/imgs/product_jars_3.jpg', // herbs-001
  '/images/imgs/product_jars_4.jpg', // herbs-002
  '/images/imgs/product_jars_8.jpg', // herbs-003
  '/images/imgs/medicine_collage_9.jpg', // herbs-004
  '/images/imgs/warm_background_1.jpg', // herbs-005
  '/images/imgs/product_jars_7.jpg', // health-001
  '/images/imgs/medicine_collage_7.jpg', // health-002
  '/images/imgs/warm_background_5.jpg', // health-003
  '/images/imgs/warm_background_7.jpg', // health-004
  '/images/imgs/powder_elements_3.png', // supplements-001
  '/images/imgs/powder_elements_6.jpg', // supplements-002
  '/images/imgs/green_plants_3.jpg', // supplements-003
  '/images/imgs/green_plants_6.jpg', // supplements-004
];

console.log('🔍 验证产品图片路径...\n');

let allValid = true;
const invalidPaths = [];

usedImages.forEach((imagePath, index) => {
  if (existingImages.includes(imagePath)) {
    console.log(`✅ ${imagePath}`);
  } else {
    console.log(`❌ ${imagePath} - 文件不存在`);
    invalidPaths.push(imagePath);
    allValid = false;
  }
});

console.log(`\n📊 验证结果:`);
console.log(`总计: ${usedImages.length} 个图片`);
console.log(`有效: ${usedImages.length - invalidPaths.length} 个`);
console.log(`无效: ${invalidPaths.length} 个`);

if (allValid) {
  console.log('\n🎉 所有图片路径验证通过！');
} else {
  console.log('\n⚠️ 发现无效路径，需要修复:');
  invalidPaths.forEach(path => console.log(`  - ${path}`));
}

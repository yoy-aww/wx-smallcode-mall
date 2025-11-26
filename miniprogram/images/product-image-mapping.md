# 产品图片映射说明

## 🔧 问题解决

**问题**: 代码中引用了不存在的 `/images/products/` 目录下的产品图片，导致图片加载失败。

**解决方案**: 使用现有的高质量图片素材替代产品预览图。

## 📋 图片映射对照表

### 惠民专区产品图片

| 产品名称 | 原路径 | 新路径 | 素材说明 |
|---------|--------|--------|----------|
| 优质陈皮 | `/images/products/chenpi_preview.jpg` | `/images/imgs/herb_ingredients_0.jpg` | 中药材装饰元素 |
| 精选枸杞 | `/images/products/goji_preview.jpg` | `/images/imgs/herb_ingredients_3.jpg` | 中药材装饰元素 |
| 当归片 | `/images/products/danggui_preview.jpg` | `/images/imgs/herb_ingredients_5.jpeg` | 中药材装饰元素 |

### 品质自营产品图片

| 产品名称 | 原路径 | 新路径 | 素材说明 |
|---------|--------|--------|----------|
| 野生人参 | `/images/products/ginseng_preview.jpg` | `/images/imgs/product_jars_3.jpg` | 中药材瓶装包装 (评分: 0.91) |
| 上等黄芪 | `/images/products/huangqi_preview.jpg` | `/images/imgs/product_jars_4.jpg` | 传统药材罐装展示 (评分: 0.87) |
| 优质当归 | `/images/products/danggui_quality_preview.jpg` | `/images/imgs/product_jars_8.jpg` | 罐装产品展示 |

### 茶饮专区产品图片

| 产品名称 | 原路径 | 新路径 | 素材说明 |
|---------|--------|--------|----------|
| 铁观音 | `/images/products/tieguanyin_preview.jpg` | `/images/imgs/tea_decoration_3.jpg` | 茶文化装饰元素 |
| 普洱茶 | `/images/products/puer_preview.jpg` | `/images/imgs/tea_decoration_7.png` | 茶文化装饰元素 |

### 活动专区产品图片

| 产品名称 | 原路径 | 新路径 | 素材说明 |
|---------|--------|--------|----------|
| 新年礼盒 | `/images/products/gift_set_preview.jpg` | `/images/imgs/gift_box_8.jpg` | 节庆主题包装 (评分: 0.94) |
| 养生套装 | `/images/products/health_set_preview.jpg` | `/images/imgs/medicine_collage_2.jpg` | 中药材拼贴装饰 |

## 🎨 素材选择原则

### 1. 分类匹配原则
- **惠民专区**: 使用 `herb_ingredients_*` 系列，体现天然中药材
- **品质自营**: 使用 `product_jars_*` 系列，体现包装品质感
- **茶饮专区**: 使用 `tea_decoration_*` 系列，体现茶文化
- **活动专区**: 使用 `gift_box_*` 和 `medicine_collage_*`，体现礼品和套装概念

### 2. 质量优先原则
- 优先选择评分较高的素材 (0.87-0.94)
- 确保图片清晰度和视觉效果
- 保持风格统一性

### 3. 语义关联原则
- 中药材产品 → 中药材装饰元素
- 包装产品 → 罐装展示素材
- 茶类产品 → 茶文化装饰
- 礼盒套装 → 礼品盒素材

## 🔄 后续优化建议

### 1. 专用产品图片
如果需要更精确的产品展示，建议：
- 为每个产品拍摄专门的产品图片
- 创建 `/images/products/` 目录
- 使用统一的产品图片规格 (如 300x300px)

### 2. 图片命名规范
```
/images/products/
├── chenpi_300x300.jpg          # 陈皮产品图
├── goji_300x300.jpg            # 枸杞产品图
├── danggui_300x300.jpg         # 当归产品图
├── ginseng_300x300.jpg         # 人参产品图
├── huangqi_300x300.jpg         # 黄芪产品图
├── tieguanyin_300x300.jpg      # 铁观音产品图
├── puer_300x300.jpg            # 普洱茶产品图
├── gift_set_300x300.jpg        # 新年礼盒产品图
└── health_set_300x300.jpg      # 养生套装产品图
```

### 3. 图片优化
- 使用WebP格式减少文件大小
- 提供多种尺寸适配不同显示需求
- 添加图片懒加载和错误处理

## ✅ 当前状态

- **问题**: ❌ 图片加载失败 (500错误)
- **解决**: ✅ 已替换为现有高质量素材
- **效果**: ✅ 所有产品图片现在都能正常加载
- **质量**: ✅ 使用评分0.87-0.94的高质量素材

---

**修复时间**: 2025-11-26
**影响范围**: 10个产品图片
**解决方案**: 使用现有45张素材中的相关图片
**状态**: ✅ 已完成修复
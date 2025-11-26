# 图片使用示例

## 🖼️ 在页面中使用配置好的图片

### 1. 在WXML模板中使用

```html
<!-- 品牌Logo -->
<image 
  src="{{brandInfo.logo}}" 
  class="brand-logo"
  mode="aspectFit"
  lazy-load="{{true}}"
/>

<!-- 主横幅背景 -->
<view 
  class="main-banner" 
  style="background-image: url({{mainBanner.backgroundImage}})"
>
  <text class="banner-title">{{mainBanner.title}}</text>
  <text class="banner-subtitle">{{mainBanner.subtitle}}</text>
</view>

<!-- 快捷功能图标 -->
<view class="quick-actions">
  <block wx:for="{{quickActions}}" wx:key="id">
    <view class="action-item" data-id="{{item.id}}" bindtap="onQuickActionTap">
      <image src="{{item.icon}}" class="action-icon" mode="aspectFit"/>
      <text class="action-title">{{item.title}}</text>
    </view>
  </block>
</view>

<!-- 分类卡片 -->
<view class="category-grid">
  <block wx:for="{{categories}}" wx:key="id">
    <view 
      class="category-card" 
      style="background-image: url({{item.backgroundImage}})"
      data-id="{{item.id}}" 
      bindtap="onCategoryTap"
    >
      <text class="category-title">{{item.title}}</text>
      <text class="category-subtitle">{{item.subtitle}}</text>
      <view class="category-action">{{item.actionText}}</view>
    </view>
  </block>
</view>
```

### 2. 在SCSS样式中使用

```scss
/* 品牌Logo样式 */
.brand-logo {
  width: 200rpx;
  height: 80rpx;
  border-radius: 8rpx;
}

/* 主横幅样式 */
.main-banner {
  width: 100%;
  height: 300rpx;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  border-radius: 24rpx;
  overflow: hidden;
  
  /* 添加遮罩层提升文字可读性 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
  }
}

.banner-title, .banner-subtitle {
  position: relative;
  z-index: 2;
  color: #FFFFFF;
}

/* 快捷功能图标样式 */
.action-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
}

/* 分类卡片样式 */
.category-card {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  
  /* 渐变遮罩 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg, 
      rgba(0, 0, 0, 0.2) 0%, 
      rgba(0, 0, 0, 0.6) 100%
    );
  }
}

.category-title, .category-subtitle {
  position: relative;
  z-index: 2;
  color: #FFFFFF;
}
```

### 3. 图片错误处理

```typescript
// 在页面方法中添加图片错误处理
methods: {
  // 图片加载错误处理
  onImageError(e: any) {
    console.error('图片加载失败:', e.detail);
    
    // 可以设置默认图片
    const errorType = e.currentTarget.dataset.type;
    switch(errorType) {
      case 'logo':
        this.setData({
          'brandInfo.logo': '/images/imgs/seal_logo_5.jpg' // 备选Logo
        });
        break;
      case 'banner':
        this.setData({
          'mainBanner.backgroundImage': '/images/imgs/tcm_herbs_banner_4.jpg' // 备选横幅
        });
        break;
      default:
        // 使用通用占位图
        break;
    }
  }
}
```

### 4. 图片预加载优化

```typescript
// 页面加载时预加载关键图片
onLoad() {
  this.preloadImages();
},

preloadImages() {
  const criticalImages = [
    this.data.brandInfo.logo,
    this.data.mainBanner.backgroundImage,
    ...this.data.categories.map(cat => cat.backgroundImage)
  ];
  
  criticalImages.forEach(src => {
    wx.getImageInfo({
      src: src,
      success: () => {
        console.log('图片预加载成功:', src);
      },
      fail: (error) => {
        console.error('图片预加载失败:', src, error);
      }
    });
  });
}
```

### 5. 响应式图片处理

```scss
/* 响应式图片适配 */
@media (max-width: 640rpx) {
  .brand-logo {
    width: 160rpx;
    height: 64rpx;
  }
  
  .main-banner {
    height: 240rpx;
  }
  
  .action-icon {
    width: 40rpx;
    height: 40rpx;
  }
}

@media (max-width: 480rpx) {
  .main-banner {
    height: 200rpx;
  }
  
  .category-card {
    /* 小屏幕下调整卡片尺寸 */
    min-height: 120rpx;
  }
}
```

### 6. 图片懒加载实现

```html
<!-- 使用微信小程序的懒加载功能 -->
<image 
  src="{{item.backgroundImage}}" 
  class="category-bg"
  mode="aspectFill"
  lazy-load="{{true}}"
  show-menu-by-longpress="{{false}}"
  binderror="onImageError"
  data-type="category"
/>
```

## 🎨 视觉效果增强

### 1. 图片滤镜效果

```scss
/* 为不同分类添加特色滤镜 */
.category-welfare .category-bg {
  filter: hue-rotate(10deg) saturate(1.2); /* 增强橙色调 */
}

.category-quality .category-bg {
  filter: contrast(1.1) brightness(0.9); /* 增强品质感 */
}

.category-tea .category-bg {
  filter: hue-rotate(-10deg) saturate(1.1); /* 增强绿色调 */
}
```

### 2. 图片动画效果

```scss
/* 图片加载动画 */
.image-loading {
  animation: imageLoad 0.5s ease-in-out;
}

@keyframes imageLoad {
  from {
    opacity: 0;
    transform: scale(1.05);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 悬停效果 */
.category-card:active {
  transform: scale(0.98);
  transition: transform 0.2s ease;
}
```

---

**使用提示**: 
- 所有图片路径都已在 `index.ts` 中配置完成
- 图片质量评分在 0.76-0.94 之间，均为高质量素材
- 建议启用懒加载和错误处理提升用户体验
- 可根据实际需求调整图片尺寸和滤镜效果
# Cart Item Component (购物车商品项组件)

购物车商品项组件，用于在购物车页面展示单个商品的信息和操作。

## 功能特性

- ✅ 商品信息展示（图片、名称、规格、价格、库存状态）
- ✅ 商品选择状态切换功能
- ✅ 集成数量选择器组件
- ✅ 删除确认和库存状态显示
- ✅ 促销标签展示功能
- ✅ 支持编辑模式和正常模式
- ✅ 图片加载失败处理和重试
- ✅ 触觉反馈和动画效果
- ✅ 响应式设计和深色模式支持

## 属性 (Properties)

| 属性名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|------|
| item | CartItemWithProduct | null | 是 | 购物车商品项数据 |
| selected | Boolean | false | 否 | 是否选中 |
| editMode | Boolean | false | 否 | 是否编辑模式 |
| disabled | Boolean | false | 否 | 是否禁用 |

## 事件 (Events)

| 事件名 | 参数 | 说明 |
|--------|------|------|
| select | { productId, selected } | 选择状态变化时触发 |
| quantitychange | { productId, quantity, previousQuantity } | 数量变化时触发 |
| delete | { productId, item } | 删除商品时触发 |
| producttap | { productId, product } | 点击商品时触发 |
| longpress | { productId, item } | 长按商品时触发 |

## 数据结构

### CartItemWithProduct

```typescript
interface CartItemWithProduct extends CartItem {
  product: Product;
}

interface CartItem {
  productId: string;
  quantity: number;
  selectedAt: Date;
}

interface Product {
  id: string;
  name: string;
  image: string;
  originalPrice: number;
  discountedPrice?: number;
  categoryId: string;
  description?: string;
  stock: number;
  tags?: string[];
}
```

## 使用示例

### 基本用法

```xml
<cart-item
  item="{{cartItem}}"
  selected="{{false}}"
  editMode="{{false}}"
  bindselect="onItemSelect"
  bindquantitychange="onQuantityChange"
  binddelete="onItemDelete"
  bindproducttap="onProductTap"
/>
```

### 编辑模式

```xml
<cart-item
  item="{{cartItem}}"
  selected="{{true}}"
  editMode="{{true}}"
  bindselect="onItemSelect"
  binddelete="onItemDelete"
/>
```

### 禁用状态

```xml
<cart-item
  item="{{cartItem}}"
  disabled="{{true}}"
/>
```

## 事件处理示例

```typescript
Page({
  data: {
    cartItem: {
      productId: 'product-001',
      quantity: 2,
      selectedAt: new Date(),
      product: {
        id: 'product-001',
        name: '黄芪党参茶',
        image: '/images/product.jpg',
        originalPrice: 89.00,
        discountedPrice: 59.00,
        categoryId: 'welfare',
        description: '精选优质黄芪党参',
        stock: 25,
        tags: ['热销', '补气']
      }
    }
  },

  onItemSelect(event) {
    const { productId, selected } = event.detail;
    console.log('商品选择状态变化:', productId, selected);
  },

  onQuantityChange(event) {
    const { productId, quantity } = event.detail;
    console.log('数量变化:', productId, quantity);
  },

  onItemDelete(event) {
    const { productId } = event.detail;
    console.log('删除商品:', productId);
  },

  onProductTap(event) {
    const { productId, product } = event.detail;
    console.log('点击商品:', product.name);
    // 跳转到商品详情页
    wx.navigateTo({
      url: `/pages/product/detail?id=${productId}`
    });
  }
});
```

## 样式定制

组件支持通过 CSS 变量进行样式定制：

```scss
.cart-item {
  --primary-color: #007aff;
  --danger-color: #ff4757;
  --success-color: #2ed573;
  --warning-color: #ffa502;
  --text-color: #333333;
  --secondary-text-color: #666666;
  --border-color: #f0f0f0;
  --background-color: #ffffff;
}
```

## 状态说明

### 库存状态

- `normal`: 库存充足（> 5件）
- `low`: 库存紧张（1-5件）
- `out`: 缺货（0件）

### 促销标签

- 折扣标签：显示折扣比例
- 库存紧张：库存 ≤ 5件时显示
- 7天无理由退货：有库存时显示
- 商品标签：显示商品自带的标签

## 注意事项

1. 组件依赖 `quantity-selector` 组件，请确保已正确引入
2. 图片路径建议使用绝对路径或网络地址
3. 编辑模式下会隐藏数量选择器，显示删除按钮
4. 库存为0时会显示缺货覆盖层并禁用操作
5. 组件会自动处理图片加载失败的情况

## 兼容性

- 微信小程序基础库 2.0.0+
- 支持 Skyline 渲染引擎
- 支持深色模式
- 支持无障碍访问

## 更新日志

### v1.0.0
- 初始版本
- 实现基本的商品展示和操作功能
- 支持选择状态切换和数量调整
- 集成促销标签和库存状态显示
- 支持编辑模式和删除确认
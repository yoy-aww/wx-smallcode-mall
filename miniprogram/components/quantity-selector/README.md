# 数量选择器组件 (QuantitySelector)

一个功能完整的数量选择器组件，支持数量增减、手动输入、库存限制、防抖处理和动画效果。

## 功能特性

- ✅ 数量增减按钮功能
- ✅ 手动输入数量验证
- ✅ 库存限制和最小数量控制
- ✅ 防抖处理和动画效果
- ✅ 触觉反馈支持
- ✅ 多种尺寸规格
- ✅ 无障碍访问支持
- ✅ 完整的单元测试覆盖

## 使用方法

### 基本用法

```wxml
<quantity-selector
  quantity="{{quantity}}"
  max-quantity="{{stock}}"
  min-quantity="{{1}}"
  bind:change="onQuantityChange"
/>
```

### 完整配置

```wxml
<quantity-selector
  quantity="{{item.quantity}}"
  max-quantity="{{item.product.stock}}"
  min-quantity="{{1}}"
  disabled="{{item.product.stock <= 0}}"
  show-input="{{true}}"
  size="medium"
  bind:change="onQuantityChange"
/>
```

## 属性 (Properties)

| 属性名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|------|
| quantity | Number | 1 | 否 | 当前数量 |
| maxQuantity | Number | 999 | 否 | 最大数量（库存限制） |
| minQuantity | Number | 1 | 否 | 最小数量 |
| disabled | Boolean | false | 否 | 是否禁用 |
| showInput | Boolean | true | 否 | 是否显示输入框 |
| size | String | 'medium' | 否 | 尺寸大小：small/medium/large |

## 事件 (Events)

| 事件名 | 说明 | 参数 |
|--------|------|------|
| change | 数量变化时触发 | `{quantity: number, previousQuantity: number}` |

## 方法 (Methods)

组件提供以下外部调用方法：

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|-------|
| getCurrentQuantity | 获取当前数量 | - | number |
| setQuantity | 设置数量 | quantity: number | - |
| resetToMinimum | 重置到最小值 | - | - |
| canDecrease | 检查是否可以减少 | - | boolean |
| canIncrease | 检查是否可以增加 | - | boolean |
| getComponentState | 获取组件状态 | - | ComponentState |

### 方法调用示例

```typescript
// 在页面中获取组件实例
const quantitySelector = this.selectComponent('#quantity-selector');

// 获取当前数量
const currentQuantity = quantitySelector.getCurrentQuantity();

// 设置数量
quantitySelector.setQuantity(5);

// 重置到最小值
quantitySelector.resetToMinimum();

// 检查状态
const canIncrease = quantitySelector.canIncrease();
const canDecrease = quantitySelector.canDecrease();

// 获取完整状态
const state = quantitySelector.getComponentState();
```

## 样式定制

组件支持通过 CSS 变量进行样式定制：

```scss
.quantity-selector {
  // 自定义主色调
  --primary-color: #8B4513;
  
  // 自定义边框颜色
  --border-color: #E8E8E8;
  
  // 自定义背景色
  --background-color: #FFFFFF;
  
  // 自定义文字颜色
  --text-color: #333333;
}
```

## 尺寸规格

组件提供三种尺寸规格：

- **small**: 高度 56rpx，适用于紧凑布局
- **medium**: 高度 64rpx，默认尺寸
- **large**: 高度 80rpx，适用于重要操作

## 使用场景

### 购物车商品数量调整

```wxml
<view class="cart-item">
  <image src="{{item.product.image}}" class="product-image" />
  <view class="product-info">
    <text class="product-name">{{item.product.name}}</text>
    <text class="product-price">¥{{item.product.price}}</text>
  </view>
  <quantity-selector
    quantity="{{item.quantity}}"
    max-quantity="{{item.product.stock}}"
    min-quantity="{{1}}"
    size="medium"
    bind:change="onQuantityChange"
    data-product-id="{{item.productId}}"
  />
</view>
```

### 商品详情页数量选择

```wxml
<view class="product-quantity">
  <text class="quantity-label">购买数量</text>
  <quantity-selector
    quantity="{{selectedQuantity}}"
    max-quantity="{{product.stock}}"
    min-quantity="{{1}}"
    disabled="{{product.stock <= 0}}"
    size="large"
    bind:change="onQuantitySelect"
  />
  <text class="stock-info">库存{{product.stock}}件</text>
</view>
```

### 只读数量显示

```wxml
<quantity-selector
  quantity="{{orderItem.quantity}}"
  disabled="{{true}}"
  show-input="{{false}}"
  size="small"
/>
```

## 事件处理

```typescript
// 页面中的事件处理方法
onQuantityChange(event: any) {
  const { quantity, previousQuantity } = event.detail;
  const productId = event.currentTarget.dataset.productId;
  
  console.log(`商品 ${productId} 数量从 ${previousQuantity} 变更为 ${quantity}`);
  
  // 更新数据
  this.updateCartItemQuantity(productId, quantity);
  
  // 重新计算总价
  this.calculateTotalPrice();
}

// 更新购物车商品数量
async updateCartItemQuantity(productId: string, quantity: number) {
  try {
    const { CartService } = await import('../../services/cart');
    const result = await CartService.updateCartItemQuantity(productId, quantity);
    
    if (result.success) {
      // 更新成功，刷新页面数据
      this.loadCartData();
    } else {
      // 更新失败，显示错误信息
      wx.showToast({
        title: result.error || '更新失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('更新数量失败:', error);
    wx.showToast({
      title: '更新失败，请重试',
      icon: 'none'
    });
  }
}
```

## 无障碍支持

组件支持无障碍访问：

- 键盘导航支持
- 屏幕阅读器支持
- 高对比度模式支持
- 减少动画模式支持

## 性能优化

- 防抖处理输入验证，避免频繁触发事件
- 动画状态管理，避免重复动画
- 内存泄漏防护，组件销毁时清理定时器
- 触觉反馈异常处理

## 测试

运行单元测试：

```bash
# 安装测试依赖
npm install --save-dev jest ts-jest @types/jest jsdom

# 运行测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

测试覆盖范围：
- ✅ 组件初始化
- ✅ 数量验证逻辑
- ✅ 增减操作
- ✅ 输入框处理
- ✅ 防抖机制
- ✅ 边界条件
- ✅ 错误处理
- ✅ 状态管理

## 注意事项

1. **库存检查**: 组件只进行前端验证，实际库存检查需要在服务端进行
2. **数据同步**: 数量变化后需要及时同步到后端服务
3. **错误处理**: 建议在父组件中处理网络错误和业务错误
4. **性能考虑**: 大量商品列表中使用时，注意防抖设置和事件处理优化

## 更新日志

### v1.0.0
- ✅ 实现基础数量选择功能
- ✅ 添加库存限制和验证
- ✅ 实现防抖处理
- ✅ 添加动画效果和触觉反馈
- ✅ 完善单元测试覆盖
- ✅ 支持多种尺寸和样式定制
- ✅ 添加无障碍访问支持
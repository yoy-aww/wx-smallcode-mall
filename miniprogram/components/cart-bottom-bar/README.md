# CartBottomBar 购物车底部操作栏组件

购物车底部操作栏组件，提供全选控制、价格合计显示、结算按钮状态控制、批量删除功能和优惠详情入口。

## 功能特性

- ✅ 全选控制功能
- ✅ 价格合计显示和实时更新
- ✅ 结算按钮状态控制
- ✅ 批量删除功能（编辑模式）
- ✅ 优惠详情入口
- ✅ 响应式设计和深色模式支持
- ✅ 动画效果和用户反馈

## 属性 Properties

| 属性名 | 类型 | 默认值 | 必填 | 说明 |
|--------|------|--------|------|------|
| selectAll | Boolean | false | 否 | 是否全选 |
| selectedCount | Number | 0 | 否 | 选中商品数量 |
| totalPrice | Number | 0 | 否 | 选中商品总价 |
| discountAmount | Number | 0 | 否 | 优惠金额 |
| finalPrice | Number | 0 | 否 | 最终价格 |
| editMode | Boolean | false | 否 | 是否编辑模式 |

## 事件 Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| selectall | 全选状态改变 | `{selectAll: boolean}` |
| checkout | 点击结算按钮 | `{selectedCount, totalPrice, discountAmount, finalPrice}` |
| batchdelete | 批量删除商品 | `{selectedCount}` |
| discountdetail | 查看优惠详情 | `{discountAmount, totalPrice, finalPrice}` |

## 方法 Methods

### updatePriceInfo(priceInfo)
更新价格信息
```typescript
this.selectComponent('#cartBottomBar').updatePriceInfo({
  totalPrice: 100,
  discountAmount: 10,
  finalPrice: 90,
  selectedCount: 2
});
```

### setSelectAllState(selectAll)
设置全选状态
```typescript
this.selectComponent('#cartBottomBar').setSelectAllState(true);
```

### setEditMode(editMode)
设置编辑模式
```typescript
this.selectComponent('#cartBottomBar').setEditMode(true);
```

### getCurrentState()
获取当前状态
```typescript
const state = this.selectComponent('#cartBottomBar').getCurrentState();
```

### resetState()
重置组件状态
```typescript
this.selectComponent('#cartBottomBar').resetState();
```

## 使用示例

### 基本用法

```xml
<!-- 在页面中使用 -->
<cart-bottom-bar
  id="cartBottomBar"
  selectAll="{{selectAll}}"
  selectedCount="{{selectedCount}}"
  totalPrice="{{summary.totalPrice}}"
  discountAmount="{{summary.discountAmount}}"
  finalPrice="{{summary.finalPrice}}"
  editMode="{{editMode}}"
  bind:selectall="onSelectAll"
  bind:checkout="onCheckout"
  bind:batchdelete="onBatchDelete"
  bind:discountdetail="onDiscountDetail"
/>
```

### 页面配置

```json
{
  "usingComponents": {
    "cart-bottom-bar": "/components/cart-bottom-bar/index"
  }
}
```

### 事件处理

```typescript
// 页面事件处理方法
onSelectAll(event: any) {
  const { selectAll } = event.detail;
  console.log('Select all changed:', selectAll);
  
  // 更新全选状态
  this.setData({ selectAll });
  
  // 更新商品选择状态
  if (selectAll) {
    this.selectAllItems();
  } else {
    this.clearAllSelections();
  }
},

onCheckout(event: any) {
  const { selectedCount, finalPrice } = event.detail;
  console.log('Checkout:', { selectedCount, finalPrice });
  
  // 跳转到结算页面
  wx.navigateTo({
    url: '/pages/checkout/index'
  });
},

onBatchDelete(event: any) {
  const { selectedCount } = event.detail;
  console.log('Batch delete:', selectedCount);
  
  // 执行批量删除
  this.batchDeleteSelectedItems();
},

onDiscountDetail(event: any) {
  const { discountAmount } = event.detail;
  console.log('Discount detail:', discountAmount);
  
  // 显示优惠详情
  this.showDiscountDetail();
}
```

## 样式定制

组件支持通过CSS变量进行样式定制：

```scss
.cart-bottom-bar {
  --primary-color: #ff6b35;
  --success-color: #07c160;
  --danger-color: #ff4757;
  --text-color: #333;
  --border-color: #f0f0f0;
}
```

## 响应式支持

- 支持不同屏幕尺寸自适应
- 支持深色模式
- 支持安全区域适配（刘海屏、底部指示器）

## 无障碍支持

- 支持语音朗读
- 支持键盘导航
- 提供适当的ARIA标签

## 注意事项

1. 组件固定在页面底部，需要为页面内容预留底部空间
2. 价格计算精度保持2位小数
3. 编辑模式下显示删除按钮，正常模式下显示结算按钮
4. 优惠详情入口仅在有优惠时显示
5. 所有操作都有相应的用户反馈和确认机制

## 兼容性

- 微信小程序基础库 2.0.0+
- 支持 Skyline 渲染引擎
- 支持 Glass-easel 组件框架
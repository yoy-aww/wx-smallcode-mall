// components/cart-item/demo.ts

Page({
  data: {
    // 正常商品项
    normalItem: {
      productId: 'demo-001',
      quantity: 2,
      selectedAt: new Date(),
      product: {
        id: 'demo-001',
        name: '黄芪党参茶',
        image: '/images/imgs/herb_ingredients_0.jpg',
        originalPrice: 89.00,
        discountedPrice: 59.00,
        categoryId: 'welfare',
        description: '精选优质黄芪党参，补气养血，增强免疫力',
        stock: 25,
        tags: ['热销', '补气']
      }
    } as CartItemWithProduct,
    
    // 选中的商品项
    selectedItem: {
      productId: 'demo-002',
      quantity: 1,
      selectedAt: new Date(),
      product: {
        id: 'demo-002',
        name: '枸杞菊花茶',
        image: '/images/imgs/herb_ingredients_3.jpg',
        originalPrice: 68.00,
        discountedPrice: 45.00,
        categoryId: 'welfare',
        description: '清肝明目，滋阴补肾，办公室必备',
        stock: 18,
        tags: ['明目', '养肝', '7天无理由退货']
      }
    } as CartItemWithProduct,
    
    // 编辑模式商品项
    editItem: {
      productId: 'demo-003',
      quantity: 3,
      selectedAt: new Date(),
      product: {
        id: 'demo-003',
        name: '红枣桂圆茶',
        image: '/images/imgs/herb_ingredients_5.jpeg',
        originalPrice: 78.00,
        discountedPrice: 52.00,
        categoryId: 'welfare',
        description: '补血安神，美容养颜，女性首选',
        stock: 32,
        tags: ['补血', '美容']
      }
    } as CartItemWithProduct,
    
    // 库存不足商品项
    outOfStockItem: {
      productId: 'demo-004',
      quantity: 1,
      selectedAt: new Date(),
      product: {
        id: 'demo-004',
        name: '陈皮普洱茶',
        image: '/images/imgs/tea_decoration_3.jpg',
        originalPrice: 128.00,
        discountedPrice: 98.00,
        categoryId: 'tea',
        description: '十年陈皮配优质普洱，理气健脾，消食化痰',
        stock: 0,
        tags: ['爆款', '消食']
      }
    } as CartItemWithProduct,
    
    // 禁用商品项
    disabledItem: {
      productId: 'demo-005',
      quantity: 2,
      selectedAt: new Date(),
      product: {
        id: 'demo-005',
        name: '玫瑰花茶',
        image: '/images/imgs/tea_decoration_7.png',
        originalPrice: 88.00,
        discountedPrice: 66.00,
        categoryId: 'tea',
        description: '精选平阴玫瑰，疏肝解郁，美容养颜',
        stock: 28,
        tags: ['美容', '解郁']
      }
    } as CartItemWithProduct
  },

  /**
   * 页面加载
   */
  onLoad() {
    console.log('Cart item demo page loaded');
  },

  /**
   * 商品选择事件处理
   */
  onItemSelect(event: WechatMiniprogram.CustomEvent) {
    const { productId, selected } = event.detail;
    console.log('Item select:', productId, selected);
    
    wx.showToast({
      title: `${selected ? '选中' : '取消选中'}: ${productId}`,
      icon: 'none',
      duration: 1500
    });
  },

  /**
   * 数量变化事件处理
   */
  onQuantityChange(event: WechatMiniprogram.CustomEvent) {
    const { productId, quantity, previousQuantity } = event.detail;
    console.log('Quantity change:', productId, quantity, previousQuantity);
    
    wx.showToast({
      title: `数量变更: ${previousQuantity} → ${quantity}`,
      icon: 'none',
      duration: 1500
    });
  },

  /**
   * 删除事件处理
   */
  onItemDelete(event: WechatMiniprogram.CustomEvent) {
    const { productId, item } = event.detail;
    console.log('Item delete:', productId, item);
    
    wx.showToast({
      title: `删除商品: ${item.product.name}`,
      icon: 'success',
      duration: 1500
    });
  },

  /**
   * 商品点击事件处理
   */
  onProductTap(event: WechatMiniprogram.CustomEvent) {
    const { productId, product } = event.detail;
    console.log('Product tap:', productId, product);
    
    wx.showToast({
      title: `查看商品: ${product.name}`,
      icon: 'none',
      duration: 1500
    });
  }
});
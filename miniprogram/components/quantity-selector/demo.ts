// demo.ts - 数量选择器组件演示页面逻辑

Page({
  data: {
    basicQuantity: 1,
    smallQuantity: 2,
    mediumQuantity: 3,
    largeQuantity: 4,
    stockQuantity: 3,
    disabledQuantity: 5,
    readonlyQuantity: 8
  },

  onLoad() {
    console.log('QuantitySelector demo page loaded');
  },

  // 基础数量变化
  onBasicQuantityChange(event: any) {
    const { quantity } = event.detail;
    console.log('Basic quantity changed:', quantity);
    
    this.setData({
      basicQuantity: quantity
    });
  },

  // 小尺寸数量变化
  onSmallQuantityChange(event: any) {
    const { quantity } = event.detail;
    console.log('Small quantity changed:', quantity);
    
    this.setData({
      smallQuantity: quantity
    });
  },

  // 中等尺寸数量变化
  onMediumQuantityChange(event: any) {
    const { quantity } = event.detail;
    console.log('Medium quantity changed:', quantity);
    
    this.setData({
      mediumQuantity: quantity
    });
  },

  // 大尺寸数量变化
  onLargeQuantityChange(event: any) {
    const { quantity } = event.detail;
    console.log('Large quantity changed:', quantity);
    
    this.setData({
      largeQuantity: quantity
    });
  },

  // 库存限制数量变化
  onStockQuantityChange(event: any) {
    const { quantity } = event.detail;
    console.log('Stock quantity changed:', quantity);
    
    this.setData({
      stockQuantity: quantity
    });
  },

  // 重置所有数量
  resetAllQuantities() {
    console.log('Resetting all quantities');
    
    this.setData({
      basicQuantity: 1,
      smallQuantity: 1,
      mediumQuantity: 1,
      largeQuantity: 1,
      stockQuantity: 1
    });

    wx.showToast({
      title: '已重置所有数量',
      icon: 'success',
      duration: 1500
    });
  },

  // 测试组件方法
  testMethods() {
    console.log('Testing component methods');
    
    const basicSelector = this.selectComponent('#basic-selector');
    
    if (basicSelector) {
      // 测试获取当前数量
      const currentQuantity = basicSelector.getCurrentQuantity();
      console.log('Current quantity:', currentQuantity);
      
      // 测试设置数量
      basicSelector.setQuantity(7);
      
      // 测试状态检查
      const canIncrease = basicSelector.canIncrease();
      const canDecrease = basicSelector.canDecrease();
      console.log('Can increase:', canIncrease, 'Can decrease:', canDecrease);
      
      // 测试获取组件状态
      const state = basicSelector.getComponentState();
      console.log('Component state:', state);
      
      wx.showModal({
        title: '组件方法测试',
        content: `当前数量: ${currentQuantity}\n可增加: ${canIncrease}\n可减少: ${canDecrease}`,
        showCancel: false
      });
    } else {
      wx.showToast({
        title: '获取组件实例失败',
        icon: 'none'
      });
    }
  }
});
/**
 * 购物车底部操作栏组件演示页面
 */

Page({
  /**
   * 页面数据
   */
  data: {
    // 组件属性
    selectAll: false,
    selectedCount: 2,
    totalPrice: 158.00,
    discountAmount: 20.00,
    finalPrice: 138.00,
    editMode: false,
    
    // 事件日志
    eventLogs: [] as Array<{
      time: string;
      event: string;
      data: string;
    }>
  },

  /**
   * 页面加载
   */
  onLoad() {
    console.log('CartBottomBar demo page loaded');
    this.addEventLog('页面加载', '演示页面初始化完成');
  },

  /**
   * 全选状态改变
   */
  onSelectAllChange(event: any) {
    const selectAll = event.detail.value;
    this.setData({ selectAll });
    this.addEventLog('全选状态改变', `selectAll: ${selectAll}`);
  },

  /**
   * 编辑模式改变
   */
  onEditModeChange(event: any) {
    const editMode = event.detail.value;
    this.setData({ editMode });
    this.addEventLog('编辑模式改变', `editMode: ${editMode}`);
  },

  /**
   * 选中数量改变
   */
  onSelectedCountChange(event: any) {
    const selectedCount = event.detail.value;
    this.setData({ 
      selectedCount,
      selectAll: selectedCount > 0 && selectedCount === 10 // 假设总共10个商品
    });
    this.updateFinalPrice();
    this.addEventLog('选中数量改变', `selectedCount: ${selectedCount}`);
  },

  /**
   * 商品总价改变
   */
  onTotalPriceChange(event: any) {
    const totalPrice = event.detail.value;
    this.setData({ totalPrice });
    this.updateFinalPrice();
    this.addEventLog('商品总价改变', `totalPrice: ${totalPrice}`);
  },

  /**
   * 优惠金额改变
   */
  onDiscountAmountChange(event: any) {
    const discountAmount = event.detail.value;
    this.setData({ discountAmount });
    this.updateFinalPrice();
    this.addEventLog('优惠金额改变', `discountAmount: ${discountAmount}`);
  },

  /**
   * 更新最终价格
   */
  updateFinalPrice() {
    const { totalPrice, discountAmount } = this.data;
    const finalPrice = Math.max(0, totalPrice - discountAmount);
    this.setData({ finalPrice });
  },

  /**
   * 组件事件：全选
   */
  onSelectAll(event: any) {
    const { selectAll } = event.detail;
    this.setData({ selectAll });
    this.addEventLog('组件事件：全选', JSON.stringify(event.detail));
  },

  /**
   * 组件事件：结算
   */
  onCheckout(event: any) {
    this.addEventLog('组件事件：结算', JSON.stringify(event.detail));
    
    wx.showModal({
      title: '结算确认',
      content: `确认结算 ${event.detail.selectedCount} 件商品，总计 ¥${event.detail.finalPrice}？`,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '跳转到结算页面',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 组件事件：批量删除
   */
  onBatchDelete(event: any) {
    this.addEventLog('组件事件：批量删除', JSON.stringify(event.detail));
    
    // 模拟删除操作
    setTimeout(() => {
      this.setData({
        selectedCount: 0,
        selectAll: false,
        finalPrice: 0
      });
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
      
      this.addEventLog('删除操作完成', '已删除选中商品');
    }, 1000);
  },

  /**
   * 组件事件：优惠详情
   */
  onDiscountDetail(event: any) {
    this.addEventLog('组件事件：优惠详情', JSON.stringify(event.detail));
    
    wx.showModal({
      title: '优惠详情',
      content: `优惠金额：¥${event.detail.discountAmount}\n原价：¥${event.detail.totalPrice}\n现价：¥${event.detail.finalPrice}`,
      showCancel: false
    });
  },

  /**
   * 重置演示
   */
  onResetDemo() {
    this.setData({
      selectAll: false,
      selectedCount: 2,
      totalPrice: 158.00,
      discountAmount: 20.00,
      finalPrice: 138.00,
      editMode: false
    });
    
    this.addEventLog('重置演示', '恢复初始状态');
  },

  /**
   * 随机数据
   */
  onRandomData() {
    const selectedCount = Math.floor(Math.random() * 10) + 1;
    const totalPrice = Math.floor(Math.random() * 500) + 50;
    const discountAmount = Math.floor(Math.random() * 50);
    const finalPrice = Math.max(0, totalPrice - discountAmount);
    const editMode = Math.random() > 0.5;
    const selectAll = selectedCount === 10;

    this.setData({
      selectAll,
      selectedCount,
      totalPrice,
      discountAmount,
      finalPrice,
      editMode
    });
    
    this.addEventLog('随机数据', `生成随机测试数据`);
  },

  /**
   * 清空日志
   */
  onClearLog() {
    this.setData({ eventLogs: [] });
  },

  /**
   * 添加事件日志
   */
  addEventLog(event: string, data: string) {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    const eventLogs = [...this.data.eventLogs];
    eventLogs.unshift({ time, event, data });
    
    // 保持最多20条日志
    if (eventLogs.length > 20) {
      eventLogs.splice(20);
    }
    
    this.setData({ eventLogs });
  }
});
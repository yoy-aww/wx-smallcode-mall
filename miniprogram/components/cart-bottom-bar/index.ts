/**
 * 购物车底部操作栏组件
 * 实现全选控制、价格合计显示、结算按钮状态控制、批量删除功能和优惠详情入口
 */

Component({
  /**
   * 组件属性定义
   */
  properties: {
    // 是否全选
    selectAll: {
      type: Boolean,
      value: false
    },
    // 选中商品数量
    selectedCount: {
      type: Number,
      value: 0
    },
    // 选中商品总价
    totalPrice: {
      type: Number,
      value: 0
    },
    // 优惠金额
    discountAmount: {
      type: Number,
      value: 0
    },
    // 最终价格
    finalPrice: {
      type: Number,
      value: 0
    },
    // 是否编辑模式
    editMode: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件数据
   */
  data: {
    // 价格更新动画状态
    priceUpdating: false
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      console.log('CartBottomBar component attached');
    },

    detached() {
      console.log('CartBottomBar component detached');
    }
  },

  /**
   * 属性监听器
   */
  observers: {
    'finalPrice': function(newPrice: number, oldPrice?: number) {
      // 价格变化时添加动画效果
      if (oldPrice !== undefined && newPrice !== oldPrice) {
        this.setData({ priceUpdating: true });
        
        setTimeout(() => {
          this.setData({ priceUpdating: false });
        }, 300);
      }
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 全选按钮点击事件
     */
    onSelectAllTap() {
      console.log('Select all tapped, current state:', this.data.selectAll);
      
      // 触发全选事件
      this.triggerEvent('selectall', {
        selectAll: !this.data.selectAll
      });
    },

    /**
     * 结算按钮点击事件
     */
    onCheckoutTap() {
      const { selectedCount, finalPrice } = this.data;
      
      console.log('Checkout tapped:', { selectedCount, finalPrice });
      
      if (selectedCount === 0) {
        wx.showToast({
          title: '请选择要结算的商品',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      // 触发结算事件
      this.triggerEvent('checkout', {
        selectedCount,
        totalPrice: this.data.totalPrice,
        discountAmount: this.data.discountAmount,
        finalPrice
      });
    },

    /**
     * 批量删除按钮点击事件
     */
    onBatchDeleteTap() {
      const { selectedCount } = this.data;
      
      console.log('Batch delete tapped:', { selectedCount });
      
      if (selectedCount === 0) {
        wx.showToast({
          title: '请选择要删除的商品',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      // 显示确认删除对话框
      wx.showModal({
        title: '确认删除',
        content: `确定要删除选中的${selectedCount}件商品吗？`,
        confirmText: '删除',
        confirmColor: '#ff4757',
        success: (res) => {
          if (res.confirm) {
            // 触发批量删除事件
            this.triggerEvent('batchdelete', {
              selectedCount
            });
          }
        }
      });
    },

    /**
     * 优惠详情点击事件
     */
    onDiscountDetailTap() {
      console.log('Discount detail tapped');
      
      // 触发优惠详情事件
      this.triggerEvent('discountdetail', {
        discountAmount: this.data.discountAmount,
        totalPrice: this.data.totalPrice,
        finalPrice: this.data.finalPrice
      });
    },

    /**
     * 格式化价格显示
     */
    formatPrice(price: number): string {
      return price.toFixed(2);
    },

    /**
     * 更新价格信息（外部调用）
     */
    updatePriceInfo(priceInfo: {
      totalPrice: number;
      discountAmount: number;
      finalPrice: number;
      selectedCount: number;
    }) {
      console.log('Updating price info:', priceInfo);
      
      this.setData({
        totalPrice: priceInfo.totalPrice,
        discountAmount: priceInfo.discountAmount,
        finalPrice: priceInfo.finalPrice,
        selectedCount: priceInfo.selectedCount,
        priceUpdating: true
      });

      // 移除更新动画状态
      setTimeout(() => {
        this.setData({ priceUpdating: false });
      }, 300);
    },

    /**
     * 设置全选状态（外部调用）
     */
    setSelectAllState(selectAll: boolean) {
      console.log('Setting select all state:', selectAll);
      this.setData({ selectAll });
    },

    /**
     * 设置编辑模式（外部调用）
     */
    setEditMode(editMode: boolean) {
      console.log('Setting edit mode:', editMode);
      this.setData({ editMode });
    },

    /**
     * 获取当前状态（外部调用）
     */
    getCurrentState() {
      return {
        selectAll: this.data.selectAll,
        selectedCount: this.data.selectedCount,
        totalPrice: this.data.totalPrice,
        discountAmount: this.data.discountAmount,
        finalPrice: this.data.finalPrice,
        editMode: this.data.editMode
      };
    },

    /**
     * 重置组件状态（外部调用）
     */
    resetState() {
      console.log('Resetting cart bottom bar state');
      
      this.setData({
        selectAll: false,
        selectedCount: 0,
        totalPrice: 0,
        discountAmount: 0,
        finalPrice: 0,
        editMode: false,
        priceUpdating: false
      });
    },

    /**
     * 显示操作反馈
     */
    showOperationFeedback(message: string, type: 'success' | 'error' | 'info' = 'success') {
      const iconMap: { [key: string]: 'success' | 'error' | 'none' } = {
        success: 'success',
        error: 'error',
        info: 'none'
      };

      wx.showToast({
        title: message,
        icon: iconMap[type],
        duration: 2000
      });
    },

    /**
     * 检查结算条件
     */
    checkCheckoutConditions(): boolean {
      const { selectedCount, finalPrice } = this.data;
      
      if (selectedCount === 0) {
        this.showOperationFeedback('请选择要结算的商品', 'info');
        return false;
      }

      if (finalPrice <= 0) {
        this.showOperationFeedback('结算金额异常，请重试', 'error');
        return false;
      }

      return true;
    },

    /**
     * 检查删除条件
     */
    checkDeleteConditions(): boolean {
      const { selectedCount } = this.data;
      
      if (selectedCount === 0) {
        this.showOperationFeedback('请选择要删除的商品', 'info');
        return false;
      }

      return true;
    }
  }
});

/**
 * 组件类型定义
 */
export interface CartBottomBarComponent {
  updatePriceInfo(priceInfo: {
    totalPrice: number;
    discountAmount: number;
    finalPrice: number;
    selectedCount: number;
  }): void;
  setSelectAllState(selectAll: boolean): void;
  setEditMode(editMode: boolean): void;
  getCurrentState(): {
    selectAll: boolean;
    selectedCount: number;
    totalPrice: number;
    discountAmount: number;
    finalPrice: number;
    editMode: boolean;
  };
  resetState(): void;
  showOperationFeedback(message: string, type?: 'success' | 'error' | 'info'): void;
  checkCheckoutConditions(): boolean;
  checkDeleteConditions(): boolean;
}
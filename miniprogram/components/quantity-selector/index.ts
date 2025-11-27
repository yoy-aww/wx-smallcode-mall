// components/quantity-selector/index.ts

Component({
  /**
   * 组件属性定义
   */
  properties: {
    // 当前数量
    quantity: {
      type: Number,
      value: 1,
      observer: 'onQuantityChange'
    },
    // 最大数量（库存限制）
    maxQuantity: {
      type: Number,
      value: 999
    },
    // 最小数量
    minQuantity: {
      type: Number,
      value: 1
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      value: false
    },
    // 是否显示输入框
    showInput: {
      type: Boolean,
      value: true
    },
    // 尺寸大小 small | medium | large
    size: {
      type: String,
      value: 'medium'
    }
  },

  /**
   * 组件数据
   */
  data: {
    // 内部数量值
    internalQuantity: 1,
    // 输入框值
    inputValue: '1',
    // 是否正在输入
    isInputting: false,
    // 防抖定时器
    debounceTimer: null as number | null,
    // 动画状态
    animating: false
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    /**
     * 组件创建时
     */
    created() {
      console.log('QuantitySelector component created');
    },

    /**
     * 组件挂载到页面时
     */
    attached() {
      console.log('QuantitySelector component attached');
      this.initializeQuantity();
    },

    /**
     * 组件从页面移除时
     */
    detached() {
      console.log('QuantitySelector component detached');
      this.clearDebounceTimer();
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 初始化数量值
     */
    initializeQuantity() {
      const { quantity, minQuantity, maxQuantity } = this.properties;
      const validQuantity = this.validateQuantity(quantity);
      
      this.setData({
        internalQuantity: validQuantity,
        inputValue: validQuantity.toString()
      });

      console.log('Quantity selector initialized:', validQuantity);
    },

    /**
     * 数量属性变化观察者
     */
    onQuantityChange(newQuantity: number) {
      console.log('Quantity property changed:', newQuantity);
      
      if (!this.data.isInputting) {
        const validQuantity = this.validateQuantity(newQuantity);
        this.setData({
          internalQuantity: validQuantity,
          inputValue: validQuantity.toString()
        });
      }
    },

    /**
     * 验证数量值
     */
    validateQuantity(quantity: number): number {
      const { minQuantity, maxQuantity } = this.properties;
      
      if (isNaN(quantity) || quantity < minQuantity) {
        return minQuantity;
      }
      
      if (quantity > maxQuantity) {
        return maxQuantity;
      }
      
      return Math.floor(quantity);
    },

    /**
     * 减少数量
     */
    onDecrease() {
      const { disabled, minQuantity } = this.properties;
      const { internalQuantity } = this.data;

      if (disabled) {
        console.log('Quantity selector is disabled');
        return;
      }

      if (internalQuantity <= minQuantity) {
        console.log('Already at minimum quantity');
        this.showMinimumReachedFeedback();
        return;
      }

      const newQuantity = internalQuantity - 1;
      this.updateQuantity(newQuantity);
      this.addHapticFeedback('light');
      this.showButtonAnimation('decrease');

      console.log('Quantity decreased to:', newQuantity);
    },

    /**
     * 增加数量
     */
    onIncrease() {
      const { disabled, maxQuantity } = this.properties;
      const { internalQuantity } = this.data;

      if (disabled) {
        console.log('Quantity selector is disabled');
        return;
      }

      if (internalQuantity >= maxQuantity) {
        console.log('Already at maximum quantity');
        this.showMaximumReachedFeedback();
        return;
      }

      const newQuantity = internalQuantity + 1;
      this.updateQuantity(newQuantity);
      this.addHapticFeedback('light');
      this.showButtonAnimation('increase');

      console.log('Quantity increased to:', newQuantity);
    },

    /**
     * 输入框获得焦点
     */
    onInputFocus() {
      const { disabled } = this.properties;
      
      if (disabled) {
        return;
      }

      console.log('Input focused');
      this.setData({
        isInputting: true
      });
    },

    /**
     * 输入框失去焦点
     */
    onInputBlur() {
      console.log('Input blurred');
      this.setData({
        isInputting: false
      });
      
      this.validateAndUpdateFromInput();
    },

    /**
     * 输入框值变化
     */
    onInputChange(event: WechatMiniprogram.Input) {
      const value = event.detail.value;
      console.log('Input value changed:', value);
      
      this.setData({
        inputValue: value
      });

      // 防抖处理输入验证
      this.debounceValidateInput();
    },

    /**
     * 输入确认（回车）
     */
    onInputConfirm() {
      console.log('Input confirmed');
      this.validateAndUpdateFromInput();
      
      // 失去焦点
      this.setData({
        isInputting: false
      });
    },

    /**
     * 防抖验证输入
     */
    debounceValidateInput() {
      this.clearDebounceTimer();
      
      const timer = setTimeout(() => {
        this.validateAndUpdateFromInput();
      }, 500);
      
      this.setData({
        debounceTimer: timer
      });
    },

    /**
     * 从输入框验证并更新数量
     */
    validateAndUpdateFromInput() {
      const { inputValue } = this.data;
      const inputQuantity = parseInt(inputValue, 10);
      
      if (isNaN(inputQuantity) || inputQuantity <= 0) {
        // 输入无效，恢复到当前数量
        this.setData({
          inputValue: this.data.internalQuantity.toString()
        });
        this.showInvalidInputFeedback();
        return;
      }

      const validQuantity = this.validateQuantity(inputQuantity);
      
      if (validQuantity !== inputQuantity) {
        // 数量被调整，显示反馈
        if (inputQuantity > this.properties.maxQuantity) {
          this.showMaximumReachedFeedback();
        } else if (inputQuantity < this.properties.minQuantity) {
          this.showMinimumReachedFeedback();
        }
      }

      this.updateQuantity(validQuantity);
      console.log('Quantity updated from input:', validQuantity);
    },

    /**
     * 更新数量值
     */
    updateQuantity(newQuantity: number) {
      const { internalQuantity } = this.data;
      
      if (newQuantity === internalQuantity) {
        return;
      }

      this.setData({
        internalQuantity: newQuantity,
        inputValue: newQuantity.toString()
      });

      // 触发变化事件
      this.triggerEvent('change', {
        quantity: newQuantity,
        previousQuantity: internalQuantity
      }, {
        bubbles: true,
        composed: true
      });

      console.log('Quantity updated:', newQuantity);
    },

    /**
     * 显示按钮动画
     */
    showButtonAnimation(type: 'increase' | 'decrease') {
      if (this.data.animating) {
        return;
      }

      this.setData({
        animating: true
      });

      // 创建动画
      const animation = wx.createAnimation({
        duration: 150,
        timingFunction: 'ease-out'
      });

      // 按钮缩放动画
      animation.scale(0.9).step();
      animation.scale(1).step();

      // 应用动画
      const animationData = animation.export();
      const animationKey = type === 'increase' ? 'increaseAnimation' : 'decreaseAnimation';
      
      this.setData({
        [animationKey]: animationData
      });

      // 重置动画状态
      setTimeout(() => {
        this.setData({
          animating: false,
          [animationKey]: null
        });
      }, 300);
    },

    /**
     * 显示数量变化动画
     */
    showQuantityChangeAnimation() {
      const animation = wx.createAnimation({
        duration: 200,
        timingFunction: 'ease-out'
      });

      // 数字跳动动画
      animation.scale(1.1).step();
      animation.scale(1).step();

      this.setData({
        quantityAnimation: animation.export()
      });

      setTimeout(() => {
        this.setData({
          quantityAnimation: null
        });
      }, 400);
    },

    /**
     * 添加触觉反馈
     */
    addHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
      try {
        wx.vibrateShort({
          type: type
        });
      } catch (error) {
        console.warn('Haptic feedback not supported:', error);
      }
    },

    /**
     * 显示最小值反馈
     */
    showMinimumReachedFeedback() {
      const { minQuantity } = this.properties;
      
      wx.showToast({
        title: `最少购买${minQuantity}件`,
        icon: 'none',
        duration: 1500
      });

      this.addHapticFeedback('medium');
    },

    /**
     * 显示最大值反馈
     */
    showMaximumReachedFeedback() {
      const { maxQuantity } = this.properties;
      
      wx.showToast({
        title: `最多购买${maxQuantity}件`,
        icon: 'none',
        duration: 1500
      });

      this.addHapticFeedback('medium');
    },

    /**
     * 显示无效输入反馈
     */
    showInvalidInputFeedback() {
      wx.showToast({
        title: '请输入有效数量',
        icon: 'none',
        duration: 1500
      });

      this.addHapticFeedback('medium');
    },

    /**
     * 清除防抖定时器
     */
    clearDebounceTimer() {
      const { debounceTimer } = this.data;
      
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        this.setData({
          debounceTimer: null
        });
      }
    },

    /**
     * 获取当前数量
     */
    getCurrentQuantity(): number {
      return this.data.internalQuantity;
    },

    /**
     * 设置数量（外部调用）
     */
    setQuantity(quantity: number) {
      const validQuantity = this.validateQuantity(quantity);
      this.updateQuantity(validQuantity);
    },

    /**
     * 重置到最小值
     */
    resetToMinimum() {
      const { minQuantity } = this.properties;
      this.updateQuantity(minQuantity);
    },

    /**
     * 检查是否可以减少
     */
    canDecrease(): boolean {
      const { disabled, minQuantity } = this.properties;
      const { internalQuantity } = this.data;
      
      return !disabled && internalQuantity > minQuantity;
    },

    /**
     * 检查是否可以增加
     */
    canIncrease(): boolean {
      const { disabled, maxQuantity } = this.properties;
      const { internalQuantity } = this.data;
      
      return !disabled && internalQuantity < maxQuantity;
    },

    /**
     * 获取组件状态
     */
    getComponentState() {
      const { internalQuantity, isInputting } = this.data;
      const { disabled, minQuantity, maxQuantity } = this.properties;
      
      return {
        quantity: internalQuantity,
        disabled,
        minQuantity,
        maxQuantity,
        isInputting,
        canDecrease: this.canDecrease(),
        canIncrease: this.canIncrease()
      };
    }
  }
});
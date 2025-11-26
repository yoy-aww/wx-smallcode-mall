// components/cart-toast/index.ts

Component({
  /**
   * 组件属性定义
   */
  properties: {
    // 是否显示
    visible: {
      type: Boolean,
      value: false,
      observer: 'onVisibleChange'
    },
    // 显示消息
    message: {
      type: String,
      value: '已添加到购物车'
    },
    // 显示持续时间（毫秒）
    duration: {
      type: Number,
      value: 2000
    }
  },

  /**
   * 组件数据
   */
  data: {
    // 内部显示状态
    internalVisible: false
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    /**
     * 组件创建时
     */
    created() {
      console.log('CartToast component created');
    },

    /**
     * 组件挂载到页面时
     */
    attached() {
      console.log('CartToast component attached');
    },

    /**
     * 组件从页面移除时
     */
    detached() {
      console.log('CartToast component detached');
      this.clearAutoHideTimer();
    }
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 显示状态变化观察者
     */
    onVisibleChange(newVisible: boolean) {
      console.log('CartToast visibility changed:', newVisible);
      
      if (newVisible) {
        this.show();
      } else {
        this.hide();
      }
    },

    /**
     * 显示提示
     */
    show() {
      console.log('Showing cart toast');
      
      this.setData({
        internalVisible: true
      });

      // 添加触觉反馈
      wx.vibrateShort({
        type: 'light'
      });

      // 设置自动隐藏
      this.setAutoHideTimer();

      // 触发显示事件
      this.triggerEvent('show', {}, {
        bubbles: true,
        composed: true
      });
    },

    /**
     * 隐藏提示
     */
    hide() {
      console.log('Hiding cart toast');
      
      this.setData({
        internalVisible: false
      });

      this.clearAutoHideTimer();

      // 触发隐藏事件
      this.triggerEvent('hide', {}, {
        bubbles: true,
        composed: true
      });
    },

    /**
     * 设置自动隐藏定时器
     */
    setAutoHideTimer() {
      this.clearAutoHideTimer();
      
      const duration = this.properties.duration;
      
      if (duration > 0) {
        (this as any).autoHideTimer = setTimeout(() => {
          this.hide();
        }, duration);
      }
    },

    /**
     * 清除自动隐藏定时器
     */
    clearAutoHideTimer() {
      if ((this as any).autoHideTimer) {
        clearTimeout((this as any).autoHideTimer);
        (this as any).autoHideTimer = null;
      }
    },

    /**
     * 手动触发显示
     */
    showToast(message?: string) {
      if (message) {
        this.setData({
          message: message
        });
      }
      
      this.show();
    },

    /**
     * 手动触发隐藏
     */
    hideToast() {
      this.hide();
    }
  },


});

/**
 * CartToast 组件属性接口
 */
interface CartToastProperties {
  /** 是否显示 */
  visible: boolean;
  /** 显示消息 */
  message: string;
  /** 显示持续时间 */
  duration: number;
}

/**
 * CartToast 组件数据接口
 */
interface CartToastData {
  /** 内部显示状态 */
  internalVisible: boolean;
}

/**
 * CartToast 组件方法接口
 */
interface CartToastMethods {
  /** 显示状态变化观察者 */
  onVisibleChange: (newVisible: boolean, oldVisible: boolean) => void;
  /** 显示提示 */
  show: () => void;
  /** 隐藏提示 */
  hide: () => void;
  /** 设置自动隐藏定时器 */
  setAutoHideTimer: () => void;
  /** 清除自动隐藏定时器 */
  clearAutoHideTimer: () => void;
  /** 手动触发显示 */
  showToast: (message?: string) => void;
  /** 手动触发隐藏 */
  hideToast: () => void;
}
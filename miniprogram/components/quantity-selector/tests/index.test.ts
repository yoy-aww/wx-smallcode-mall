// components/quantity-selector/tests/index.test.ts

/**
 * 数量选择器组件单元测试
 * 测试组件的核心功能：数量调整、输入验证、库存限制、防抖处理等
 */

describe('QuantitySelector Component', () => {
  let component: any;
  let mockTriggerEvent: jest.Mock;
  let mockSetData: jest.Mock;
  let mockWx: any;

  beforeEach(() => {
    // Mock 微信小程序 API
    mockWx = {
      vibrateShort: jest.fn(),
      showToast: jest.fn(),
      createAnimation: jest.fn(() => ({
        scale: jest.fn().mockReturnThis(),
        step: jest.fn().mockReturnThis(),
        export: jest.fn(() => ({}))
      }))
    };
    global.wx = mockWx;

    // Mock 组件方法
    mockTriggerEvent = jest.fn();
    mockSetData = jest.fn();

    // 创建组件实例模拟
    component = {
      properties: {
        quantity: 1,
        maxQuantity: 10,
        minQuantity: 1,
        disabled: false,
        showInput: true,
        size: 'medium'
      },
      data: {
        internalQuantity: 1,
        inputValue: '1',
        isInputting: false,
        debounceTimer: null,
        animating: false
      },
      setData: mockSetData,
      triggerEvent: mockTriggerEvent
    };

    // 绑定组件方法
    const componentMethods = require('../index.ts');
    Object.assign(component, componentMethods.methods);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('初始化', () => {
    test('应该正确初始化组件数据', () => {
      component.initializeQuantity();

      expect(mockSetData).toHaveBeenCalledWith({
        internalQuantity: 1,
        inputValue: '1'
      });
    });

    test('应该验证并调整初始数量', () => {
      component.properties.quantity = 15; // 超过最大值
      component.properties.maxQuantity = 10;

      component.initializeQuantity();

      expect(mockSetData).toHaveBeenCalledWith({
        internalQuantity: 10,
        inputValue: '10'
      });
    });

    test('应该处理小于最小值的初始数量', () => {
      component.properties.quantity = 0;
      component.properties.minQuantity = 1;

      component.initializeQuantity();

      expect(mockSetData).toHaveBeenCalledWith({
        internalQuantity: 1,
        inputValue: '1'
      });
    });
  });

  describe('数量验证', () => {
    test('应该正确验证有效数量', () => {
      const result = component.validateQuantity(5);
      expect(result).toBe(5);
    });

    test('应该将小于最小值的数量调整为最小值', () => {
      component.properties.minQuantity = 2;
      const result = component.validateQuantity(1);
      expect(result).toBe(2);
    });

    test('应该将大于最大值的数量调整为最大值', () => {
      component.properties.maxQuantity = 10;
      const result = component.validateQuantity(15);
      expect(result).toBe(10);
    });

    test('应该处理 NaN 值', () => {
      component.properties.minQuantity = 1;
      const result = component.validateQuantity(NaN);
      expect(result).toBe(1);
    });

    test('应该将小数向下取整', () => {
      const result = component.validateQuantity(3.7);
      expect(result).toBe(3);
    });
  });

  describe('数量增减操作', () => {
    beforeEach(() => {
      component.data.internalQuantity = 5;
      component.properties.minQuantity = 1;
      component.properties.maxQuantity = 10;
    });

    test('应该正确增加数量', () => {
      component.onIncrease();

      expect(mockSetData).toHaveBeenCalledWith({
        internalQuantity: 6,
        inputValue: '6'
      });

      expect(mockTriggerEvent).toHaveBeenCalledWith('change', {
        quantity: 6,
        previousQuantity: 5
      }, expect.any(Object));

      expect(mockWx.vibrateShort).toHaveBeenCalledWith({ type: 'light' });
    });

    test('应该正确减少数量', () => {
      component.onDecrease();

      expect(mockSetData).toHaveBeenCalledWith({
        internalQuantity: 4,
        inputValue: '4'
      });

      expect(mockTriggerEvent).toHaveBeenCalledWith('change', {
        quantity: 4,
        previousQuantity: 5
      }, expect.any(Object));

      expect(mockWx.vibrateShort).toHaveBeenCalledWith({ type: 'light' });
    });

    test('应该阻止超过最大值的增加操作', () => {
      component.data.internalQuantity = 10;
      component.onIncrease();

      expect(mockSetData).not.toHaveBeenCalled();
      expect(mockTriggerEvent).not.toHaveBeenCalled();
      expect(mockWx.showToast).toHaveBeenCalledWith({
        title: '最多购买10件',
        icon: 'none',
        duration: 1500
      });
    });

    test('应该阻止低于最小值的减少操作', () => {
      component.data.internalQuantity = 1;
      component.onDecrease();

      expect(mockSetData).not.toHaveBeenCalled();
      expect(mockTriggerEvent).not.toHaveBeenCalled();
      expect(mockWx.showToast).toHaveBeenCalledWith({
        title: '最少购买1件',
        icon: 'none',
        duration: 1500
      });
    });

    test('应该在禁用状态下阻止操作', () => {
      component.properties.disabled = true;
      component.onIncrease();
      component.onDecrease();

      expect(mockSetData).not.toHaveBeenCalled();
      expect(mockTriggerEvent).not.toHaveBeenCalled();
    });
  });

  describe('输入框处理', () => {
    test('应该正确处理输入框焦点事件', () => {
      component.onInputFocus();

      expect(mockSetData).toHaveBeenCalledWith({
        isInputting: true
      });
    });

    test('应该正确处理输入框失焦事件', () => {
      component.data.inputValue = '8';
      component.onInputBlur();

      expect(mockSetData).toHaveBeenCalledWith({
        isInputting: false
      });
    });

    test('应该正确处理输入值变化', () => {
      const mockEvent = {
        detail: { value: '7' }
      };

      component.onInputChange(mockEvent);

      expect(mockSetData).toHaveBeenCalledWith({
        inputValue: '7'
      });
    });

    test('应该正确处理输入确认', () => {
      component.data.inputValue = '6';
      component.onInputConfirm();

      expect(mockSetData).toHaveBeenCalledWith({
        isInputting: false
      });
    });
  });

  describe('输入验证', () => {
    test('应该正确验证有效输入', () => {
      component.data.inputValue = '7';
      component.validateAndUpdateFromInput();

      expect(mockSetData).toHaveBeenCalledWith({
        internalQuantity: 7,
        inputValue: '7'
      });

      expect(mockTriggerEvent).toHaveBeenCalledWith('change', {
        quantity: 7,
        previousQuantity: 1
      }, expect.any(Object));
    });

    test('应该处理无效输入', () => {
      component.data.inputValue = 'abc';
      component.data.internalQuantity = 5;
      component.validateAndUpdateFromInput();

      expect(mockSetData).toHaveBeenCalledWith({
        inputValue: '5'
      });

      expect(mockWx.showToast).toHaveBeenCalledWith({
        title: '请输入有效数量',
        icon: 'none',
        duration: 1500
      });
    });

    test('应该处理超出范围的输入', () => {
      component.properties.maxQuantity = 10;
      component.data.inputValue = '15';
      component.validateAndUpdateFromInput();

      expect(mockSetData).toHaveBeenCalledWith({
        internalQuantity: 10,
        inputValue: '10'
      });

      expect(mockWx.showToast).toHaveBeenCalledWith({
        title: '最多购买10件',
        icon: 'none',
        duration: 1500
      });
    });

    test('应该处理负数输入', () => {
      component.data.inputValue = '-5';
      component.data.internalQuantity = 3;
      component.validateAndUpdateFromInput();

      expect(mockSetData).toHaveBeenCalledWith({
        inputValue: '3'
      });

      expect(mockWx.showToast).toHaveBeenCalledWith({
        title: '请输入有效数量',
        icon: 'none',
        duration: 1500
      });
    });
  });

  describe('防抖处理', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('应该正确实现防抖验证', () => {
      const validateSpy = jest.spyOn(component, 'validateAndUpdateFromInput');
      
      component.debounceValidateInput();
      component.debounceValidateInput();
      component.debounceValidateInput();

      expect(validateSpy).not.toHaveBeenCalled();

      jest.advanceTimersByTime(500);

      expect(validateSpy).toHaveBeenCalledTimes(1);
    });

    test('应该正确清除防抖定时器', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      
      component.data.debounceTimer = 123;
      component.clearDebounceTimer();

      expect(clearTimeoutSpy).toHaveBeenCalledWith(123);
      expect(mockSetData).toHaveBeenCalledWith({
        debounceTimer: null
      });
    });
  });

  describe('状态检查方法', () => {
    beforeEach(() => {
      component.data.internalQuantity = 5;
      component.properties.minQuantity = 1;
      component.properties.maxQuantity = 10;
      component.properties.disabled = false;
    });

    test('canDecrease 应该正确判断是否可以减少', () => {
      expect(component.canDecrease()).toBe(true);

      component.data.internalQuantity = 1;
      expect(component.canDecrease()).toBe(false);

      component.properties.disabled = true;
      expect(component.canDecrease()).toBe(false);
    });

    test('canIncrease 应该正确判断是否可以增加', () => {
      expect(component.canIncrease()).toBe(true);

      component.data.internalQuantity = 10;
      expect(component.canIncrease()).toBe(false);

      component.properties.disabled = true;
      expect(component.canIncrease()).toBe(false);
    });

    test('getCurrentQuantity 应该返回当前数量', () => {
      expect(component.getCurrentQuantity()).toBe(5);
    });

    test('getComponentState 应该返回完整状态', () => {
      const state = component.getComponentState();

      expect(state).toEqual({
        quantity: 5,
        disabled: false,
        minQuantity: 1,
        maxQuantity: 10,
        isInputting: false,
        canDecrease: true,
        canIncrease: true
      });
    });
  });

  describe('外部方法', () => {
    test('setQuantity 应该正确设置数量', () => {
      component.setQuantity(8);

      expect(mockSetData).toHaveBeenCalledWith({
        internalQuantity: 8,
        inputValue: '8'
      });

      expect(mockTriggerEvent).toHaveBeenCalledWith('change', {
        quantity: 8,
        previousQuantity: 1
      }, expect.any(Object));
    });

    test('resetToMinimum 应该重置到最小值', () => {
      component.properties.minQuantity = 2;
      component.resetToMinimum();

      expect(mockSetData).toHaveBeenCalledWith({
        internalQuantity: 2,
        inputValue: '2'
      });
    });
  });

  describe('动画效果', () => {
    test('应该正确显示按钮动画', () => {
      component.showButtonAnimation('increase');

      expect(mockWx.createAnimation).toHaveBeenCalledWith({
        duration: 150,
        timingFunction: 'ease-out'
      });

      expect(mockSetData).toHaveBeenCalledWith({
        animating: true
      });
    });

    test('应该正确显示数量变化动画', () => {
      component.showQuantityChangeAnimation();

      expect(mockWx.createAnimation).toHaveBeenCalledWith({
        duration: 200,
        timingFunction: 'ease-out'
      });
    });
  });

  describe('属性观察者', () => {
    test('应该响应数量属性变化', () => {
      component.data.isInputting = false;
      component.onQuantityChange(8);

      expect(mockSetData).toHaveBeenCalledWith({
        internalQuantity: 8,
        inputValue: '8'
      });
    });

    test('应该在输入状态下忽略属性变化', () => {
      component.data.isInputting = true;
      component.onQuantityChange(8);

      expect(mockSetData).not.toHaveBeenCalled();
    });
  });

  describe('错误处理', () => {
    test('应该处理触觉反馈失败', () => {
      mockWx.vibrateShort.mockImplementation(() => {
        throw new Error('Vibration not supported');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      component.addHapticFeedback('light');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Haptic feedback not supported:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});
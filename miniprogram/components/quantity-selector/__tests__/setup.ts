// __tests__/setup.ts - Test setup file

// Mock WeChat miniprogram global objects
declare global {
  var wx: any;
  var Component: any;
  var getApp: any;
  var getCurrentPages: any;
}

// Mock WeChat API
global.wx = {
  vibrateShort: jest.fn(),
  showToast: jest.fn(),
  showModal: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  createAnimation: jest.fn(() => ({
    scale: jest.fn().mockReturnThis(),
    step: jest.fn().mockReturnThis(),
    export: jest.fn(() => ({}))
  })),
  getStorageSync: jest.fn(),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
};

// Mock Component constructor
global.Component = jest.fn((options) => {
  return {
    ...options,
    setData: jest.fn(),
    triggerEvent: jest.fn(),
    createSelectorQuery: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      boundingClientRect: jest.fn().mockReturnThis(),
      exec: jest.fn()
    }))
  };
});

// Mock getApp
global.getApp = jest.fn(() => ({
  globalData: {}
}));

// Mock getCurrentPages
global.getCurrentPages = jest.fn(() => []);

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  
  // Optionally suppress console output during tests
  // Uncomment these lines if you want to reduce test output noise
  // console.log = jest.fn();
  // console.warn = jest.fn();
  // console.error = jest.fn();
});

afterEach(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});
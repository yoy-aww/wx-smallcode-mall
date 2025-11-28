/**
 * Test setup for service tests
 */

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific log levels during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock setTimeout and clearTimeout for testing retry mechanisms
global.setTimeout = jest.fn((callback, delay) => {
  // Execute immediately in tests
  callback();
  return 1;
}) as any;

global.clearTimeout = jest.fn();

// Setup test environment
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset setTimeout mock
  (global.setTimeout as jest.Mock).mockImplementation((callback, delay) => {
    callback();
    return 1;
  });
});
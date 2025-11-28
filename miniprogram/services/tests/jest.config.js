/**
 * Jest configuration for service tests
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    '../*.ts',
    '!../**/*.d.ts',
    '!../**/*.test.ts',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/../$1',
  },
  testTimeout: 10000,
  verbose: true
};
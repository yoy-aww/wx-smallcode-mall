// jest.config.js for quantity-selector component

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: ['**/tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  collectCoverageFrom: [
    'index.ts',
    '!**/tests/**',
    '!**/node_modules/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: {
        target: 'es2020',
        module: 'commonjs',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
    },
  },
};
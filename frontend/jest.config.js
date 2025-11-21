// Jest configuration for Next.js app covering frontend (jsdom)
// and backend tests (use `@jest-environment node` in server test files).
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to the Next.js app to load next.config.* and .env
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Simpler patterns for Windows compatibility
  testMatch: [
    '<rootDir>/**/*.test.[jt]s?(x)',
    '<rootDir>/**/*.spec.[jt]s?(x)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/backend/(.*)$': '<rootDir>/../backend/$1',
    '^@backend/(.*)$': '<rootDir>/../backend/$1',
    // Style imports: mock with identity-obj-proxy
    '^.+\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  // Transform ESM packages from node_modules used in UI
  transformIgnorePatterns: [
    'node_modules/(?!(lucide-react|@radix-ui/.*|mongodb|bson)/)',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/app/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  // Give some leeway to spin up mongodb-memory-server on Windows
  testTimeout: 30000,
};

module.exports = createJestConfig(customJestConfig);


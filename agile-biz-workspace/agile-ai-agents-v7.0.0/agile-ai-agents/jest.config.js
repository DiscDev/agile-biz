/**
 * Jest Configuration for AgileAiAgents
 * Configured according to Testing Agent requirements
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test match patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/project-dashboard/node_modules/',
    '/machine-data/node_modules/'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/test-utils/setup.js'],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'machine-data/**/*.js',
    'project-dashboard/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**'
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70
    }
  },
  
  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@agents/(.*)$': '<rootDir>/ai-agents/$1',
    '^@machine-data/(.*)$': '<rootDir>/machine-data/$1',
    '^@test-utils/(.*)$': '<rootDir>/tests/test-utils/$1'
  },
  
  // Transform files
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Timers
  testTimeout: 30000, // 30 seconds for integration tests
  
  // Verbose output
  verbose: true,
  
  // Fail on console errors (Testing Agent requirement)
  setupFiles: ['<rootDir>/tests/test-utils/console-error-fail.js'],
  
  // Test reporter
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ],
  
  // Global variables
  globals: {
    'TEST_MODE': true,
    'DASHBOARD_PORT': 3001
  }
};
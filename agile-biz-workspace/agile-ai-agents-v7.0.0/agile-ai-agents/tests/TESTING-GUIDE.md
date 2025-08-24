# Testing Guide for AgileAiAgents

## Overview
This guide explains how to run tests for the AgileAiAgents system. Our tests follow the Testing Agent's critical requirements for real browser testing, console error detection, and authentication validation.

## Quick Start

### Install Test Dependencies
```bash
# Install Jest for unit/integration tests
npm install --save-dev jest @babel/core @babel/preset-env babel-jest

# Install Cypress for E2E tests
npm install --save-dev cypress

# Optional: Install test reporter
npm install --save-dev jest-junit
```

### Run Tests
```bash
# Run all unit tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:e2e          # E2E browser tests

# Run all tests
npm run test:all

# Run tests in watch mode (great for development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Structure

### 1. Unit Tests (`tests/unit/`)
- Test individual functions and modules
- Fast execution, no external dependencies
- Examples: folder validation, JSON loading

### 2. Integration Tests (`tests/integration/`)
- Test component interactions
- May use file system or mock APIs
- Examples: agent coordination, document creation

### 3. E2E Tests (`tests/e2e/`)
- Test complete user workflows in real browsers
- Follow Testing Agent's browser testing protocol
- Examples: dashboard interactions, authentication flows

## Critical Testing Requirements

Per the Testing Agent's protocol, all tests MUST:

### 1. Console Error Detection ✅
All tests automatically fail if `console.error` is called. This ensures no JavaScript errors go unnoticed.

### 2. Authentication Testing First ✅
E2E tests ALWAYS start with unauthenticated state testing before any authenticated tests.

### 3. Real Browser Testing ✅
E2E tests use Cypress to test in actual browser environments, not just unit tests.

### 4. Dependency Validation ✅
Tests verify all dependencies load correctly before testing functionality.

## Writing New Tests

### Unit Test Example
```javascript
describe('MyModule', () => {
  it('should handle valid input', () => {
    const result = myFunction('valid input');
    expect(result).toBe('expected output');
  });

  it('should handle errors gracefully', () => {
    expect(() => myFunction(null)).toThrow('Invalid input');
  });
});
```

### Integration Test Example
```javascript
describe('Agent Integration', () => {
  it('should coordinate agents correctly', async () => {
    // Create test environment
    await testHelpers.createTestFileStructure('./test-project');
    
    // Test agent interaction
    const result = await coordinateAgents(['prd_agent', 'coder_agent']);
    expect(result.success).toBe(true);
    
    // Clean up
    await testHelpers.cleanupTestFiles('./test-project');
  });
});
```

### E2E Test Example
```javascript
describe('Dashboard E2E', () => {
  // ALWAYS test unauthenticated state first
  describe('Unauthenticated State', () => {
    it('should redirect to login', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
    });
  });
  
  describe('Authenticated Features', () => {
    beforeEach(() => {
      cy.loginWithToken();
    });
    
    it('should load without console errors', () => {
      cy.visit('/dashboard');
      cy.get('@consoleError').should('not.have.been.called');
    });
  });
});
```

## Test Utilities

### `test-utils/setup.js`
- Global test configuration
- Console error tracking
- Helper functions

### `test-utils/mock-data.js`
- Consistent test data
- Mock agent responses
- Sample documents and sprints

## Continuous Integration

Tests are designed to run in CI/CD:

```yaml
# Example GitHub Actions workflow
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
    - run: npm ci
    - run: npm run test:all
    - uses: actions/upload-artifact@v2
      with:
        name: test-results
        path: |
          coverage/
          test-results/
          cypress/videos/
          cypress/screenshots/
```

## Debugging Tests

### Console Errors
If a test fails due to console errors:
1. Check the test output for the exact error message
2. Fix the underlying issue causing the console error
3. If the error is expected, use `allowConsoleError()`:

```javascript
it('should handle expected error', () => {
  allowConsoleError(() => {
    // Code that produces expected console error
  });
});
```

### Cypress Tests
1. Run in interactive mode: `npm run test:e2e:open`
2. Use Chrome DevTools to debug
3. Check videos/screenshots in `cypress/` folder

### Coverage Reports
After running `npm run test:coverage`, open `coverage/lcov-report/index.html` in a browser.

## Best Practices

1. **Always clean up**: Remove test files/data after tests
2. **Use mock data**: Don't depend on external services
3. **Test error cases**: Include negative test cases
4. **Monitor performance**: Tests should run quickly
5. **Keep tests focused**: One concept per test
6. **Use descriptive names**: Test names should explain what they test

## Troubleshooting

### "Cannot find module" errors
Run `npm install` to ensure all dependencies are installed.

### Cypress not starting
1. Ensure dashboard is running: `npm run dashboard`
2. Check port 3001 is available
3. Try running Cypress directly: `npx cypress open`

### Tests timing out
1. Increase timeout in jest.config.js
2. Check for async operations not being awaited
3. Ensure mock data is returning quickly

### Console error failures
This is by design! Fix the code causing console errors, don't disable the check.

## Summary

The test suite ensures AgileAiAgents maintains high quality through:
- ✅ Automated testing at all levels
- ✅ Real browser validation
- ✅ Console error prevention
- ✅ Authentication security
- ✅ Comprehensive coverage

Following these patterns ensures reliable, maintainable tests that catch issues early.


## Enhancement: Comprehensive Testing Enhancement

Enhance testing guide with new patterns

### Patterns Applied

- Unit testing patterns (70% confidence)
- End-to-end testing (70% confidence)
- Coverage improvement (70% confidence)

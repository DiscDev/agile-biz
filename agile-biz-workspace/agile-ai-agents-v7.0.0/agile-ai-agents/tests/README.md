# AgileAiAgents Test Suite

## Overview
This directory contains example tests demonstrating the testing approach for AgileAiAgents components. Tests follow the patterns established by the Testing Agent.

## Test Structure

```
tests/
├── README.md                    # This file
├── unit/                       # Unit tests for individual functions
│   ├── folder-validator.test.js
│   └── json-loader.test.js
├── integration/                # Integration tests
│   ├── agent-coordination.test.js
│   └── document-creation.test.js
├── e2e/                       # End-to-end tests
│   ├── dashboard.test.js
│   └── sprint-workflow.test.js
└── test-utils/                # Shared test utilities
    ├── setup.js
    └── mock-data.js
```

## Testing Philosophy

Following the Testing Agent's guidelines, our tests prioritize:

1. **Real Environment Testing**: Tests run against actual systems, not just mocks
2. **Console Error Detection**: All tests monitor for JavaScript errors
3. **Dependency Validation**: Verify all dependencies load correctly
4. **Authentication First**: Always test unauthenticated states first
5. **Visual Validation**: Check UI renders correctly, not just functionality

## Running Tests

```bash
# Install test dependencies (if not already installed)
npm install --save-dev jest @testing-library/jest-dom cypress

# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests (starts dashboard first)
npm run test:e2e

# Run all tests
npm run test:all

# Run tests in watch mode
npm run test:watch
```

## Test Patterns

### 1. Unit Tests
Test individual functions in isolation:
- Input validation
- Error handling
- Return values
- Edge cases

### 2. Integration Tests
Test component interactions:
- Agent coordination
- File system operations
- API communications
- State persistence

### 3. E2E Tests
Test complete user workflows:
- Dashboard interactions
- Sprint creation and management
- Document generation
- Learning contributions

## Writing New Tests

1. Follow existing patterns in example files
2. Always clean up test data after tests
3. Use descriptive test names
4. Include both positive and negative test cases
5. Monitor console for errors during browser tests

## Critical Testing Requirements

Per the Testing Agent's protocol:

1. **Authentication Testing**: ALWAYS start with unauthenticated state
2. **Browser Testing**: Use real browser instances, not just unit tests
3. **Dependency Verification**: Check all dependencies load before testing
4. **Build Validation**: Ensure project builds without errors
5. **Console Monitoring**: Catch all JavaScript errors during tests

## Test Data

Test data is stored in `test-utils/mock-data.js` and includes:
- Sample agent responses
- Mock file structures
- Test project configurations
- Example sprint data

## Continuous Integration

Tests are designed to run in CI/CD pipelines:
- All tests must pass before merging
- Console errors fail the build
- Coverage reports generated automatically
- Performance benchmarks tracked
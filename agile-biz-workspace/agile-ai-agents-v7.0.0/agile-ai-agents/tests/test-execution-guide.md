# AgileAiAgents Test Execution Guide

## Overview

This guide provides step-by-step instructions for executing tests at each phase of the workflow improvement plan. Tests must pass before proceeding to the next phase.

## Pre-requisites

1. **Jest installed**: Verify with `npm test`
2. **Test environment ready**: Check `jest.config.js` exists
3. **Test utilities available**: Located in `tests/test-utils/`

## Phase 1: Critical Foundation Testing

### Setup
```bash
# Copy template to actual test file
cp tests/test-templates/phase-1-test-template.js tests/unit/phase-1-critical-foundation.test.js
```

### Implementation Checklist
- [ ] Implement workflow error integration tests
- [ ] Implement pre-flight checker tests
- [ ] Implement approval timeout tests
- [ ] Implement research level documentation tests
- [ ] Verify hook compatibility

### Execution
```bash
# Run existing tests first
npm run test:unit tests/unit/workflow-state-handler.test.js

# Run Phase 1 specific tests
npm run test:unit tests/unit/phase-1-critical-foundation.test.js

# Run all unit tests
npm run test:unit

# Check coverage
npm run test:coverage
```

### Issue Resolution
1. Document failures in `test-results/phase-1-issues.md`
2. Fix each issue
3. Re-run tests
4. Verify all pass before Phase 2

## Phase 2: State Protection & Recovery Testing

### Setup
```bash
cp tests/test-templates/phase-2-test-template.js tests/unit/phase-2-state-protection.test.js
```

### Implementation Checklist
- [ ] State corruption prevention tests
- [ ] Stuck state detection tests
- [ ] Checkpoint automation tests
- [ ] Recovery mechanism tests
- [ ] Performance impact tests

### Execution
```bash
# Phase 2 specific tests
npm run test:unit tests/unit/phase-2-state-protection.test.js

# Integration tests for state management
npm run test:integration tests/integration/state-recovery.test.js

# Performance tests
npm run test:unit tests/performance/checkpoint-performance.test.js
```

## Phase 3: Agent Coordination & Visibility Testing

### Setup
```bash
cp tests/test-templates/phase-3-test-template.js tests/integration/phase-3-agent-coordination.test.js
```

### Implementation Checklist
- [ ] Agent availability tests
- [ ] Parallel execution safety tests
- [ ] Progress tracking tests
- [ ] Dashboard integration tests
- [ ] Load tests

### Execution
```bash
# Start dashboard for tests
npm run dashboard &
DASHBOARD_PID=$!

# Run Phase 3 tests
npm run test:integration tests/integration/phase-3-agent-coordination.test.js

# Run end-to-end tests
npm run test:e2e

# Stop dashboard
kill $DASHBOARD_PID
```

## Phase 4: Document Creation Reliability Testing

### Setup
```bash
cp tests/test-templates/phase-4-test-template.js tests/integration/phase-4-document-reliability.test.js
```

### Implementation Checklist
- [ ] Validation error handling tests
- [ ] Retry system tests
- [ ] Progress tracking tests
- [ ] Stress tests
- [ ] User feedback tests

### Execution
```bash
# Unit tests for document handling
npm run test:unit tests/unit/document-*.test.js

# Integration tests
npm run test:integration tests/integration/phase-4-document-reliability.test.js

# Stress tests (may take longer)
npm run test:integration tests/stress/document-creation-load.test.js
```

## Phase 5: Production Readiness Testing

### Setup
```bash
cp tests/test-templates/phase-5-test-template.js tests/integration/phase-5-production-readiness.test.js
```

### Implementation Checklist
- [ ] Production safeguards tests
- [ ] Cost estimation accuracy tests
- [ ] Analytics tests
- [ ] Monitoring tests
- [ ] Full integration tests
- [ ] Security validation tests

### Execution
```bash
# Security tests
npm run test:security

# Phase 5 specific tests
npm run test:integration tests/integration/phase-5-production-readiness.test.js

# Full test suite
npm run test:all

# Final validation
npm run test:coverage
```

## Common Test Commands

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests
npm run test:security      # Security tests
npm run test:e2e          # End-to-end tests

# Run with coverage
npm run test:coverage

# Run in watch mode (during development)
npm run test:watch

# Run specific test file
npm test -- tests/unit/specific-test.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should handle errors"
```

## Test Results Documentation

### Directory Structure
```
test-results/
├── phase-1-issues.md
├── phase-2-issues.md
├── phase-3-issues.md
├── phase-4-issues.md
├── phase-5-issues.md
└── final-test-report.md
```

### Issue Template
```markdown
# Phase X Test Issues

## Issue 1: [Brief Description]
- **Test**: `describe > it` path
- **Error**: Actual error message
- **Expected**: What should happen
- **Root Cause**: Analysis
- **Fix**: What was done
- **Status**: Fixed/Pending

## Issue 2: ...
```

## Best Practices

1. **Run existing tests first**: Always verify existing functionality
2. **Fix immediately**: Don't accumulate test debt
3. **Document everything**: Future reference is valuable
4. **Test in isolation**: Use mocks to isolate components
5. **Clean up**: Ensure tests don't leave artifacts

## Troubleshooting

### Common Issues

1. **Port conflicts**: Dashboard already running
   ```bash
   lsof -i :3001
   kill -9 <PID>
   ```

2. **File permissions**: Test files not writable
   ```bash
   chmod -R 755 tests/
   ```

3. **Timeout errors**: Increase Jest timeout
   ```javascript
   jest.setTimeout(60000); // 60 seconds
   ```

4. **Memory issues**: Run tests in smaller batches
   ```bash
   npm test -- --maxWorkers=2
   ```

## Success Criteria

Before moving to next phase:
- [ ] All new tests passing
- [ ] All existing tests still passing
- [ ] Coverage maintained at 70%+
- [ ] Issues documented and resolved
- [ ] No console errors in tests

## Final Validation

After all phases complete:
```bash
# Full regression test
npm run test:all

# Performance baseline
npm run test:coverage -- --verbose

# Generate final report
echo "# Final Test Report" > test-results/final-test-report.md
echo "Generated: $(date)" >> test-results/final-test-report.md
npm test -- --json >> test-results/final-test-report.json
```

---

Remember: **No phase is complete until all tests pass!**
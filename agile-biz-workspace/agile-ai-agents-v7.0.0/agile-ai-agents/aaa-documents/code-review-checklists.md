# Code Review Checklists

## Overview
Comprehensive checklists for code reviewers to ensure defensive programming patterns, authentication testing, and deployment readiness. Use these during pull request reviews.

## Master Code Review Checklist

### 🛡️ Defensive Programming Checklist

#### Object & Property Access
- [ ] **Optional Chaining Used**
  ```javascript
  // ❌ user.profile.settings
  // ✅ user?.profile?.settings
  ```
- [ ] **Fallback Values Provided**
  ```javascript
  // ❌ const name = user.name;
  // ✅ const name = user?.name || 'Guest';
  ```
- [ ] **Nested Access Protected**
  ```javascript
  // ❌ config.api.endpoints.auth
  // ✅ config?.api?.endpoints?.auth || '/auth'
  ```

#### Array Operations
- [ ] **Array Type Validation**
  ```javascript
  // ❌ items.map(item => item.name)
  // ✅ Array.isArray(items) ? items.map(item => item?.name) : []
  ```
- [ ] **Length Checks Safe**
  ```javascript
  // ❌ if (items.length > 0)
  // ✅ if (items?.length > 0)
  ```
- [ ] **Array Methods Guarded**
  ```javascript
  // ❌ users.filter(u => u.active)
  // ✅ users?.filter(u => u?.active) || []
  ```

#### API Response Handling
- [ ] **Response Structure Validated**
  ```javascript
  // ❌ setData(response.data)
  // ✅ if (response?.data) { setData(response.data) }
  ```
- [ ] **Error Handling Present**
  ```javascript
  // ✅ try/catch blocks around API calls
  // ✅ .catch() handlers on promises
  ```
- [ ] **Type Guards Used**
  ```javascript
  // ✅ if (typeof response.data === 'object')
  // ✅ if (Array.isArray(response.data.items))
  ```

### 🔐 Authentication & Security Checklist

#### Authentication Testing
- [ ] **Unauthenticated State Tested First**
  - Test starts with cleared storage
  - Protected routes tested without auth
  - Error messages verified
  
- [ ] **Token Management Secure**
  - Tokens stored securely
  - Token expiration handled
  - Logout clears all auth state
  
- [ ] **Authorization Checks Present**
  - Role-based access implemented
  - Permission checks on sensitive operations
  - Backend validation matches frontend

#### Security Best Practices
- [ ] **No Sensitive Data in Code**
  - No hardcoded credentials
  - No API keys in source
  - Environment variables used
  
- [ ] **Input Validation**
  - User input sanitized
  - SQL injection prevented
  - XSS protection implemented
  
- [ ] **Error Messages Safe**
  - No stack traces exposed
  - Generic error messages for auth failures
  - No internal details leaked

### 🚀 Deployment Readiness Checklist

#### Dependencies
- [ ] **All Dependencies Listed**
  ```json
  // package.json includes all imports
  // No phantom dependencies
  ```
- [ ] **Lock File Updated**
  - package-lock.json committed
  - No conflicts in lock file
  
- [ ] **Security Scan Passed**
  ```bash
  npm audit
  # No high/critical vulnerabilities
  ```

#### Build Process
- [ ] **Development Build Works**
  ```bash
  npm run dev
  # No errors or warnings
  ```
- [ ] **Production Build Works**
  ```bash
  npm run build
  # Successful completion
  ```
- [ ] **Bundle Size Acceptable**
  - Main bundle < 500KB
  - Code splitting implemented
  - Lazy loading used

#### Environment & Configuration
- [ ] **Environment Variables Documented**
  ```bash
  # .env.example updated
  # README includes env setup
  ```
- [ ] **Port Configuration Dynamic**
  ```javascript
  const PORT = process.env.PORT || 3000;
  ```
- [ ] **Config Validation Present**
  - Required env vars checked
  - Startup fails gracefully if missing

### ⚛️ React-Specific Checklist

#### Component Safety
- [ ] **Props Validated**
  ```javascript
  // PropTypes or TypeScript interfaces
  // Default props provided
  ```
- [ ] **Error Boundaries Used**
  ```javascript
  // Critical components wrapped
  // Fallback UI implemented
  ```
- [ ] **Event Handlers Safe**
  ```javascript
  // ✅ onClick={() => handleClick?.()}
  // ✅ if (typeof onChange === 'function')
  ```

#### State Management
- [ ] **State Updates Safe**
  ```javascript
  // ❌ setState(response.data)
  // ✅ setState(prev => ({ ...prev, ...response?.data }))
  ```
- [ ] **Side Effects Cleaned Up**
  - useEffect cleanup functions
  - Event listeners removed
  - Timers cleared

#### Performance
- [ ] **Unnecessary Renders Prevented**
  - React.memo used appropriately
  - useMemo/useCallback for expensive operations
  - Key props stable
  
- [ ] **Large Lists Optimized**
  - Virtualization for long lists
  - Pagination implemented
  - Loading states present

### 📊 API & Integration Checklist

#### API Contract
- [ ] **Request Format Documented**
  ```typescript
  interface LoginRequest {
    email: string;
    password: string;
  }
  ```
- [ ] **Response Format Validated**
  ```typescript
  interface LoginResponse {
    token: string;
    user: UserObject;
  }
  ```
- [ ] **Error Responses Consistent**
  ```json
  {
    "error": {
      "code": "AUTH_FAILED",
      "message": "Invalid credentials"
    }
  }
  ```

#### Integration Points
- [ ] **Frontend-Backend Sync**
  - API endpoints match
  - CORS configured correctly
  - Proxy settings work
  
- [ ] **External Services**
  - Third-party APIs documented
  - Fallbacks for service failures
  - Rate limiting handled

### 🧪 Testing Checklist

#### Unit Tests
- [ ] **Critical Paths Tested**
  - Happy path scenarios
  - Error scenarios
  - Edge cases
  
- [ ] **Coverage Adequate**
  - \>80% code coverage
  - Critical functions 100%
  - Error paths tested

#### Integration Tests
- [ ] **API Integration Tested**
  - Real API calls tested
  - Mock responses accurate
  - Error scenarios covered
  
- [ ] **Component Integration**
  - User flows tested
  - State management tested
  - Navigation tested

#### E2E Tests
- [ ] **Critical User Journeys**
  - Login/logout flow
  - Main feature flows
  - Error recovery

### 📝 Documentation Checklist

#### Code Documentation
- [ ] **Functions Documented**
  ```javascript
  /**
   * Validates user input and returns sanitized data
   * @param {Object} input - Raw user input
   * @returns {Object} Sanitized data
   * @throws {ValidationError} If input invalid
   */
  ```
- [ ] **Complex Logic Explained**
  - Inline comments for tricky parts
  - Algorithm choices explained
  - Performance considerations noted

#### API Documentation
- [ ] **Endpoints Documented**
  - Method, path, parameters
  - Request/response examples
  - Error codes listed
  
- [ ] **Authentication Documented**
  - How to obtain tokens
  - Where to send tokens
  - Token refresh process

### 🔄 DevOps Integration Checklist

#### CI/CD Ready
- [ ] **Build Scripts Work**
  ```json
  "scripts": {
    "build": "...",
    "test": "...",
    "lint": "..."
  }
  ```
- [ ] **Tests Pass in CI**
  - All tests green
  - No flaky tests
  - Coverage meets threshold

#### Monitoring Ready
- [ ] **Health Endpoint**
  ```javascript
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });
  ```
- [ ] **Logging Implemented**
  - Errors logged appropriately
  - No sensitive data in logs
  - Log levels used correctly

#### Deployment Ready
- [ ] **Rollback Plan**
  - Previous version tagged
  - Database migrations reversible
  - Feature flags for risky changes
  
- [ ] **Performance Baseline**
  - Load tests run
  - Memory usage checked
  - Response times acceptable

## Quick Reference Card

### 🚨 Red Flags - Block PR If Found
1. Direct nested property access without `?.`
2. Array methods without type checks
3. API responses used without validation
4. No error handling on async operations
5. Authentication not tested from logged-out state
6. Missing dependencies in package.json
7. Production build failing
8. No tests for new features

### ✅ Green Flags - Good to Merge
1. All object access uses optional chaining
2. Fallback values everywhere
3. Comprehensive error handling
4. Tests start with unauthenticated state
5. Build passes in all environments
6. Dependencies locked and secure
7. Documentation updated
8. DevOps validation passed

## PR Review Template

```markdown
## Code Review Checklist

### Defensive Programming
- [ ] Optional chaining used throughout
- [ ] Array operations type-checked
- [ ] API responses validated
- [ ] Error boundaries present

### Security
- [ ] Authentication tested properly
- [ ] No sensitive data exposed
- [ ] Input validation present

### Deployment
- [ ] Dependencies correct
- [ ] Builds successfully
- [ ] Environment vars documented

### Testing
- [ ] Unit tests present and passing
- [ ] Integration tests cover API calls
- [ ] Coverage meets standards

### Documentation
- [ ] Code comments adequate
- [ ] API changes documented
- [ ] README updated if needed

### Overall
- [ ] Follows team standards
- [ ] No console.logs left
- [ ] Performance acceptable
- [ ] Ready for production

**Approval Decision**: ⬜ Approved / ⬜ Changes Requested
```

---

**Created**: 2025-07-01  
**Version**: 1.0.0  
**Purpose**: Ensure consistent code quality through systematic reviews
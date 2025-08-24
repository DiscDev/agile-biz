---
allowed-tools: [Task]
argument-hint: Specify the area or recent changes to test for regressions
---

# Regression Test

Execute comprehensive regression testing to ensure recent changes haven't introduced new issues or broken existing functionality, with systematic validation across all affected systems.

## Usage

```
/regression-test [scope or recent changes to test]
```

**Examples:**
- `/regression-test user authentication system after security fix`
- `/regression-test entire application after database optimization`
- `/regression-test payment processing after API integration updates`
- `/regression-test frontend components after React hooks migration`

## What This Does

1. **Change Impact Analysis**: Identify all systems potentially affected by recent changes
2. **Test Suite Execution**: Run comprehensive automated and manual test suites
3. **Performance Validation**: Ensure system performance hasn't degraded
4. **Integration Testing**: Verify all system integrations continue to work properly
5. **User Experience Validation**: Confirm user workflows remain intact

## Regression Testing Categories

### Functional Regression Testing
- **Core Features**: Essential application functionality and user workflows
- **Edge Cases**: Boundary conditions and error handling scenarios
- **Data Integrity**: Database operations and data consistency validation
- **Business Logic**: Complex calculations and rule processing

### Integration Regression Testing
- **API Endpoints**: External and internal API communication
- **Third-party Services**: Payment processors, email services, analytics
- **Database Connections**: Connection pooling, query performance, transactions
- **Microservices Communication**: Service-to-service communication patterns

### Performance Regression Testing
- **Response Times**: API endpoint and page load performance
- **Resource Usage**: Memory consumption, CPU utilization, database connections
- **Throughput**: System capacity under normal and peak loads
- **Scalability**: Auto-scaling behavior and resource allocation

### User Interface Regression Testing
- **Cross-browser Compatibility**: Functionality across different browsers
- **Mobile Responsiveness**: Mobile device and tablet compatibility
- **Accessibility**: Screen reader compatibility and keyboard navigation
- **Visual Consistency**: Layout, styling, and component behavior

### Security Regression Testing
- **Authentication**: Login processes and session management
- **Authorization**: Permission checks and role-based access
- **Data Protection**: Encryption, sanitization, and privacy controls
- **Vulnerability Scanning**: Known security issues and new attack vectors

## Regression Testing Process

1. **Scope Analysis**
   - Identify changed components and their dependencies
   - Map potential impact areas across the system
   - Prioritize testing areas based on risk and usage
   - Define testing scope and exit criteria

2. **Test Planning**
   - Select appropriate test suites for the scope
   - Plan automated and manual testing activities
   - Prepare test data and environments
   - Schedule testing phases and resource allocation

3. **Test Execution**
   - Run automated regression test suites
   - Execute manual testing for critical workflows
   - Perform exploratory testing in high-risk areas
   - Document findings and track test coverage

4. **Results Analysis**
   - Analyze test results and identify failures
   - Categorize issues as regressions vs. existing problems
   - Assess impact and priority of discovered issues
   - Determine go/no-go decision for deployment

## Example Regression Test Implementations

### User Authentication System Regression Test

**Input**: `/regression-test user authentication system after JWT security improvements`

```markdown
## Regression Test Plan: User Authentication System

### Test Scope and Context
- **Change**: JWT security improvements including token rotation and enhanced validation
- **Risk Areas**: Login/logout flows, session management, API authentication
- **Test Environment**: Staging environment with production-like data
- **Timeline**: 4-hour comprehensive testing window

### Pre-Test Setup

**Environment Preparation**:
```bash
# Reset test database to known state
npm run db:reset:test
npm run db:seed:test

# Start application services
docker-compose up -d --build

# Verify all services are healthy
npm run health-check

# Clear Redis cache
redis-cli flushall

# Reset rate limiting counters
npm run reset-rate-limits
```

**Test Data Setup**:
```javascript
// Setup test users with different roles and states
const testUsers = [
  { email: 'admin@test.com', role: 'admin', status: 'active' },
  { email: 'user@test.com', role: 'user', status: 'active' },
  { email: 'locked@test.com', role: 'user', status: 'locked' },
  { email: 'inactive@test.com', role: 'user', status: 'inactive' },
  { email: 'expired@test.com', role: 'user', status: 'active', 
    lastLogin: '2023-01-01' } // Old user for session expiry tests
];

await seedTestUsers(testUsers);
```

### Automated Test Execution

**Authentication Flow Tests**:
```javascript
// jest.config.js - Regression test suite configuration
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/regression/**/*.test.{js,ts}'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/regression.setup.js'],
  testTimeout: 30000, // Longer timeout for integration tests
  collectCoverage: true,
  coverageDirectory: 'coverage/regression',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

// tests/regression/auth.regression.test.js
describe('Authentication Regression Tests', () => {
  let testServer;
  let testUsers;

  beforeAll(async () => {
    testServer = await startTestServer();
    testUsers = await setupTestUsers();
  });

  afterAll(async () => {
    await cleanupTestData();
    await testServer.close();
  });

  describe('Login Functionality', () => {
    it('should authenticate valid users successfully', async () => {
      for (const user of testUsers.filter(u => u.status === 'active')) {
        const response = await request(testServer)
          .post('/api/auth/login')
          .send({
            email: user.email,
            password: 'test123'
          })
          .expect(200);

        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('refreshToken');
        expect(response.body.user.email).toBe(user.email);
        expect(response.body.user.role).toBe(user.role);

        // Verify token is valid JWT
        const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
        expect(decoded.userId).toBe(user.id);
        expect(decoded.role).toBe(user.role);
      }
    });

    it('should reject invalid credentials', async () => {
      const response = await request(testServer)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(response.body).not.toHaveProperty('token');
    });

    it('should handle locked accounts correctly', async () => {
      const lockedUser = testUsers.find(u => u.status === 'locked');
      
      const response = await request(testServer)
        .post('/api/auth/login')
        .send({
          email: lockedUser.email,
          password: 'test123'
        })
        .expect(403);

      expect(response.body.error.code).toBe('ACCOUNT_LOCKED');
    });

    it('should enforce rate limiting', async () => {
      const user = testUsers.find(u => u.status === 'active');
      
      // Make multiple failed login attempts
      const promises = Array(6).fill(0).map(() => 
        request(testServer)
          .post('/api/auth/login')
          .send({
            email: user.email,
            password: 'wrongpassword'
          })
      );

      const responses = await Promise.all(promises);
      
      // First 5 should be 401 (invalid credentials)
      responses.slice(0, 5).forEach(response => {
        expect(response.status).toBe(401);
      });

      // 6th should be 429 (rate limited)
      expect(responses[5].status).toBe(429);
      expect(responses[5].body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('Token Management', () => {
    it('should refresh tokens correctly', async () => {
      // Get initial tokens
      const loginResponse = await request(testServer)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'test123'
        });

      const { token, refreshToken } = loginResponse.body;

      // Wait a moment to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Refresh token
      const refreshResponse = await request(testServer)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body).toHaveProperty('token');
      expect(refreshResponse.body.token).not.toBe(token);

      // Verify new token works
      const profileResponse = await request(testServer)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${refreshResponse.body.token}`)
        .expect(200);

      expect(profileResponse.body.user.email).toBe('user@test.com');
    });

    it('should invalidate old refresh tokens', async () => {
      const loginResponse = await request(testServer)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'test123'
        });

      const { refreshToken } = loginResponse.body;

      // Use refresh token
      await request(testServer)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      // Try to use same refresh token again
      const response = await request(testServer)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });

    it('should handle expired tokens gracefully', async () => {
      // Create expired token manually
      const expiredToken = jwt.sign(
        { userId: 'user-123', role: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Already expired
      );

      const response = await request(testServer)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.error.code).toBe('TOKEN_EXPIRED');
    });
  });

  describe('Protected Routes', () => {
    let userToken, adminToken;

    beforeEach(async () => {
      // Get tokens for different user types
      const userLogin = await request(testServer)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'test123'
        });
      userToken = userLogin.body.token;

      const adminLogin = await request(testServer)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'test123'
        });
      adminToken = adminLogin.body.token;
    });

    it('should protect user routes correctly', async () => {
      // Should work with valid token
      await request(testServer)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Should fail without token
      await request(testServer)
        .get('/api/users/me')
        .expect(401);

      // Should fail with invalid token
      await request(testServer)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should enforce role-based access control', async () => {
      // Admin route should work for admin
      await request(testServer)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Admin route should fail for regular user
      const response = await request(testServer)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.error.code).toBe('INSUFFICIENT_PRIVILEGES');
    });
  });

  describe('Session Management', () => {
    it('should track active sessions', async () => {
      const user = testUsers.find(u => u.email === 'user@test.com');
      
      // Login multiple times to create multiple sessions
      const session1 = await request(testServer)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'test123'
        });

      const session2 = await request(testServer)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'test123'
        });

      // Get active sessions
      const sessionsResponse = await request(testServer)
        .get('/api/auth/sessions')
        .set('Authorization', `Bearer ${session1.body.token}`)
        .expect(200);

      expect(sessionsResponse.body.sessions).toHaveLength(2);
      expect(sessionsResponse.body.sessions.every(s => s.userId === user.id)).toBe(true);
    });

    it('should logout and invalidate sessions', async () => {
      const loginResponse = await request(testServer)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'test123'
        });

      const { token } = loginResponse.body;

      // Verify token works
      await request(testServer)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Logout
      await request(testServer)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Token should no longer work
      await request(testServer)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });
  });
});
```

**API Integration Tests**:
```javascript
// tests/regression/api.integration.test.js
describe('API Integration Regression Tests', () => {
  describe('Authentication Headers', () => {
    it('should accept Bearer token in Authorization header', async () => {
      const token = await getValidToken();
      
      const response = await request(testServer)
        .get('/api/protected-endpoint')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should handle malformed Authorization headers', async () => {
      const testCases = [
        'Invalid-Format token123',
        'Bearer',  // Missing token
        'Bearer token123 extra',  // Extra content
        '',  // Empty header
      ];

      for (const authHeader of testCases) {
        const response = await request(testServer)
          .get('/api/protected-endpoint')
          .set('Authorization', authHeader)
          .expect(401);

        expect(response.body.error.code).toBe('INVALID_AUTHORIZATION_HEADER');
      }
    });
  });

  describe('Cross-Origin Requests', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(testServer)
        .options('/api/auth/login')
        .set('Origin', 'https://app.example.com')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type,Authorization')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('https://app.example.com');
      expect(response.headers['access-control-allow-methods']).toContain('POST');
      expect(response.headers['access-control-allow-headers']).toContain('Authorization');
    });
  });
});
```

### Manual Testing Checklist

**Critical User Workflows**:
```markdown
## Manual Testing Checklist

### User Registration and Login
- [ ] **New User Registration**
  - [ ] Register with valid email and password
  - [ ] Verify email confirmation process
  - [ ] Login with new credentials
  - [ ] Profile creation and setup

- [ ] **Existing User Login**  
  - [ ] Login with correct credentials
  - [ ] Login attempt with wrong password
  - [ ] Login with non-existent email
  - [ ] Account lockout after failed attempts

- [ ] **Password Management**
  - [ ] Forgot password flow
  - [ ] Password reset email delivery
  - [ ] Reset password with valid token
  - [ ] Reset password with expired token

### Session Management
- [ ] **Session Persistence**
  - [ ] Session persists across browser tabs
  - [ ] Session survives page refresh
  - [ ] Session expires after inactivity
  - [ ] Remember me functionality

- [ ] **Multi-device Sessions**
  - [ ] Login from second device
  - [ ] Concurrent sessions work properly
  - [ ] Logout from one device affects only that device
  - [ ] Logout from all devices functionality

### Role-Based Access
- [ ] **User Permissions**
  - [ ] Regular users access appropriate content
  - [ ] Regular users blocked from admin areas
  - [ ] Users can edit own profile
  - [ ] Users cannot edit other profiles

- [ ] **Admin Permissions**
  - [ ] Admin users access admin panel
  - [ ] Admin users manage other users
  - [ ] Admin users view system reports
  - [ ] Admin permissions work correctly

### Error Handling
- [ ] **Network Errors**
  - [ ] Login fails gracefully with network error
  - [ ] Retry mechanism works correctly
  - [ ] Offline behavior is acceptable
  - [ ] Connection recovery works

- [ ] **Server Errors**
  - [ ] 500 errors show appropriate message
  - [ ] Authentication errors are clear
  - [ ] Rate limiting messages are informative
  - [ ] Service unavailable handling
```

### Performance Regression Tests

**Load Testing**:
```javascript
// tests/performance/auth.load.test.js
const { check, sleep } = require('k6');
const http = require('k6/http');

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stable load
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate under 1%
  },
};

export default function() {
  // Test login performance
  const loginResponse = http.post('http://localhost:3000/api/auth/login', {
    email: 'load-test@example.com',
    password: 'test123',
  }, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 200ms': (r) => r.timings.duration < 200,
    'login response has token': (r) => JSON.parse(r.body).token !== undefined,
  });

  if (loginResponse.status === 200) {
    const token = JSON.parse(loginResponse.body).token;

    // Test protected endpoint performance
    const profileResponse = http.get('http://localhost:3000/api/auth/me', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    check(profileResponse, {
      'profile status is 200': (r) => r.status === 200,
      'profile response time < 100ms': (r) => r.timings.duration < 100,
    });
  }

  sleep(1); // 1 second between iterations
}

// Performance baseline comparison
export function handleSummary(data) {
  const baseline = {
    login_p95: 300, // ms
    profile_p95: 150, // ms
    error_rate: 0.005 // 0.5%
  };

  const results = {
    login_p95: data.metrics.http_req_duration.values['p(95)'],
    profile_p95: data.metrics.http_req_duration.values['p(95)'],
    error_rate: data.metrics.http_req_failed.values.rate
  };

  // Check for regressions
  const regressions = [];
  if (results.login_p95 > baseline.login_p95 * 1.2) {
    regressions.push(`Login P95 regression: ${results.login_p95}ms vs baseline ${baseline.login_p95}ms`);
  }
  
  if (results.error_rate > baseline.error_rate * 2) {
    regressions.push(`Error rate regression: ${results.error_rate} vs baseline ${baseline.error_rate}`);
  }

  return {
    'performance-report.json': JSON.stringify({
      results,
      baseline,
      regressions,
      passed: regressions.length === 0
    }),
  };
}
```

### Database Regression Tests

**Data Integrity Validation**:
```sql
-- Database regression test queries
-- tests/regression/database.sql

-- Test 1: Verify user data integrity
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN email IS NULL OR email = '' THEN 1 END) as missing_emails,
  COUNT(CASE WHEN password_hash IS NULL OR password_hash = '' THEN 1 END) as missing_passwords,
  COUNT(CASE WHEN created_at > NOW() THEN 1 END) as future_dates,
  COUNT(CASE WHEN email NOT LIKE '%@%' THEN 1 END) as invalid_emails
FROM users;

-- Test 2: Verify session data consistency  
SELECT 
  COUNT(*) as total_sessions,
  COUNT(CASE WHEN expires_at < NOW() THEN 1 END) as expired_sessions,
  COUNT(CASE WHEN user_id NOT IN (SELECT id FROM users) THEN 1 END) as orphaned_sessions
FROM user_sessions;

-- Test 3: Verify authentication audit trail
SELECT 
  event_type,
  success,
  COUNT(*) as count,
  MIN(created_at) as first_event,
  MAX(created_at) as last_event
FROM auth_audit 
WHERE created_at >= NOW() - INTERVAL '1 day'
GROUP BY event_type, success
ORDER BY event_type, success;

-- Test 4: Check for duplicate or conflicting data
SELECT 
  email,
  COUNT(*) as duplicate_count
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1;
```

### Security Regression Tests

**Security Validation**:
```javascript
// tests/regression/security.test.js
describe('Security Regression Tests', () => {
  describe('Input Validation', () => {
    it('should prevent SQL injection attempts', async () => {
      const maliciousInputs = [
        "admin'; DROP TABLE users; --",
        "' OR '1'='1",
        "admin' UNION SELECT * FROM users --",
      ];

      for (const input of maliciousInputs) {
        const response = await request(testServer)
          .post('/api/auth/login')
          .send({
            email: input,
            password: 'test123'
          });

        // Should not succeed and should not cause errors
        expect([400, 401]).toContain(response.status);
        expect(response.body.error.code).not.toBe('DATABASE_ERROR');
      }
    });

    it('should prevent XSS attempts in user data', async () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img src=x onerror=alert("xss")>',
      ];

      const token = await getValidToken();

      for (const payload of xssPayloads) {
        const response = await request(testServer)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: payload,
            bio: payload
          });

        // Should either reject or sanitize the input
        if (response.status === 200) {
          expect(response.body.user.name).not.toContain('<script>');
          expect(response.body.user.bio).not.toContain('<script>');
        }
      }
    });
  });

  describe('Authentication Security', () => {
    it('should use secure JWT signing', async () => {
      const response = await request(testServer)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'test123'
        });

      const token = response.body.token;
      
      // Verify token structure and security
      const decoded = jwt.decode(token, { complete: true });
      expect(decoded.header.alg).toBe('HS256'); // or RS256 for asymmetric
      expect(decoded.payload.exp).toBeDefined();
      expect(decoded.payload.iat).toBeDefined();
      
      // Verify token expiry is reasonable (not too long)
      const expiry = decoded.payload.exp * 1000;
      const now = Date.now();
      const tokenLifetime = expiry - now;
      expect(tokenLifetime).toBeLessThan(24 * 60 * 60 * 1000); // Max 24 hours
    });

    it('should not expose sensitive data in responses', async () => {
      const response = await request(testServer)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'test123'
        });

      // Should not return password or sensitive data
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('passwordHash');
      expect(response.body.user).not.toHaveProperty('resetToken');
    });
  });
});
```

### Test Results Analysis and Reporting

**Test Results Dashboard**:
```javascript
// scripts/generateRegressionReport.js
const fs = require('fs');
const path = require('path');

class RegressionReportGenerator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      },
      categories: {},
      regressions: [],
      performance: {},
      coverage: {}
    };
  }

  async generateReport() {
    // Collect test results from different sources
    await this.collectJestResults();
    await this.collectK6Results();
    await this.collectManualTestResults();
    await this.collectSecurityScanResults();

    // Generate HTML report
    const htmlReport = this.generateHTMLReport();
    fs.writeFileSync('reports/regression-test-report.html', htmlReport);

    // Generate JSON summary for CI/CD
    const jsonReport = JSON.stringify(this.results, null, 2);
    fs.writeFileSync('reports/regression-test-results.json', jsonReport);

    // Generate executive summary
    const summary = this.generateExecutiveSummary();
    fs.writeFileSync('reports/regression-test-summary.md', summary);

    return this.results;
  }

  async collectJestResults() {
    try {
      const jestResults = JSON.parse(
        fs.readFileSync('coverage/regression/jest-results.json', 'utf8')
      );

      this.results.summary.total += jestResults.numTotalTests;
      this.results.summary.passed += jestResults.numPassedTests;
      this.results.summary.failed += jestResults.numFailedTests;

      this.results.categories.unit = {
        total: jestResults.numTotalTests,
        passed: jestResults.numPassedTests,
        failed: jestResults.numFailedTests,
        duration: jestResults.testResults.reduce((sum, r) => sum + r.perfStats.slow, 0)
      };

      this.results.coverage = jestResults.coverageMap;
    } catch (error) {
      console.warn('Failed to collect Jest results:', error.message);
    }
  }

  generateExecutiveSummary() {
    const passRate = (this.results.summary.passed / this.results.summary.total * 100).toFixed(1);
    const hasRegressions = this.results.regressions.length > 0;

    return `
# Regression Test Summary

**Test Date:** ${new Date(this.results.timestamp).toLocaleString()}
**Overall Pass Rate:** ${passRate}%
**Total Tests:** ${this.results.summary.total}
**Regressions Found:** ${this.results.regressions.length}

## Test Results by Category

${Object.entries(this.results.categories).map(([category, results]) => `
- **${category.toUpperCase()}**: ${results.passed}/${results.total} passed (${(results.passed/results.total*100).toFixed(1)}%)
`).join('')}

## Regression Analysis

${hasRegressions ? `
⚠️ **${this.results.regressions.length} regression(s) detected:**

${this.results.regressions.map(r => `- ${r.description} (${r.severity})`).join('\n')}
` : '✅ **No regressions detected** - All tests passing within acceptable parameters'}

## Performance Impact

${Object.entries(this.results.performance).map(([metric, data]) => `
- **${metric}**: ${data.current}ms (baseline: ${data.baseline}ms, change: ${data.change > 0 ? '+' : ''}${data.change}%)
`).join('')}

## Recommendations

${hasRegressions ? `
1. **Immediate Action Required**: Address critical regressions before deployment
2. Review failed test cases and determine root cause
3. Update test baselines if acceptable performance changes
` : `
1. **Ready for Deployment**: All regression tests passing
2. Monitor production metrics after deployment
3. Update test suite based on any new scenarios discovered
`}

## Detailed Results

See full HTML report at: \`reports/regression-test-report.html\`
`;
  }
}

// Usage
const generator = new RegressionReportGenerator();
generator.generateReport()
  .then(results => {
    console.log('Regression test report generated');
    console.log(`Pass rate: ${(results.summary.passed/results.summary.total*100).toFixed(1)}%`);
    
    if (results.regressions.length > 0) {
      console.error(`⚠️ ${results.regressions.length} regressions found`);
      process.exit(1);
    } else {
      console.log('✅ No regressions detected');
      process.exit(0);
    }
  })
  .catch(error => {
    console.error('Failed to generate regression report:', error);
    process.exit(1);
  });
```

This comprehensive regression test implementation covers functional, performance, security, and integration testing with detailed reporting and analysis capabilities.
```

## Regression Testing Quality Standards

### Test Coverage Requirements
- **Functional Coverage**: All core user workflows and business logic tested
- **Integration Coverage**: All external API and service dependencies validated
- **Performance Coverage**: Response times and resource usage within acceptable ranges
- **Security Coverage**: Authentication, authorization, and data protection verified

### Test Execution Standards
- **Automated Tests**: Comprehensive automated test suites for repeatable validation
- **Manual Testing**: Critical user workflows manually verified by different team members
- **Environment Parity**: Testing performed in production-like environments
- **Data Integrity**: Test data represents realistic usage patterns and edge cases

### Results Analysis Criteria
- **Regression Classification**: Clear distinction between new issues and existing problems
- **Impact Assessment**: Business impact evaluation for any identified regressions
- **Baseline Comparison**: Performance metrics compared against established baselines
- **Go/No-Go Decision**: Clear criteria for deployment readiness based on test results

## Follow-up Actions

After regression testing:
- `/impact-analysis` - Assess business impact of any regressions found
- `/fix-bug` - Address critical regressions that block deployment
- `/task-complete` - Mark testing complete with comprehensive results
- `/capture-learnings` - Document insights about testing effectiveness and process improvements
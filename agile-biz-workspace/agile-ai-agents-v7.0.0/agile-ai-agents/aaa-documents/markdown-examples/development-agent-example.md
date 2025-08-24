# API Authentication Implementation Guide

Example document demonstrating proper GitHub markdown formatting for Development Agents (Coder, Testing, DevOps, Security, DBA, UI/UX).

## Table of Contents

* [Overview](#overview)
* [Quick Start](#quick-start)
* [Configuration](#configuration)
* [Implementation](#implementation)
* [Testing](#testing)
* [Troubleshooting](#troubleshooting)

## Overview

This guide demonstrates how Development Agents should format technical documentation using GitHub markdown best practices.

## Quick Start

### Installation

```bash
npm install @agileai/auth-service
```

### Basic Setup

```javascript
const AuthService = require('@agileai/auth-service');

const auth = new AuthService({
  secret: process.env.JWT_SECRET,
  expiration: '24h'
});
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|:---------|:--------:|:--------|:------------|
| JWT_SECRET | Yes | - | Secret key for token signing |
| TOKEN_EXPIRATION | No | 24h | Token expiration time |
| REFRESH_ENABLED | No | true | Enable refresh tokens |

### Advanced Configuration

<details>
<summary>Complete Configuration Options</summary>

```javascript
const config = {
  // Core settings
  secret: process.env.JWT_SECRET,
  expiration: '24h',
  
  // Security settings
  algorithm: 'HS256',
  issuer: 'agileai-system',
  audience: 'agileai-users',
  
  // Refresh token settings
  refreshToken: {
    enabled: true,
    expiration: '7d',
    rotateOnRefresh: true
  },
  
  // Rate limiting
  rateLimit: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDuration: 30 * 60 * 1000 // 30 minutes
  }
};
```

</details>

## Implementation

### Step-by-Step Implementation

* [ ] Install dependencies
* [ ] Configure environment variables
* [ ] Initialize auth service
* [ ] Implement login endpoint
* [ ] Implement logout endpoint
* [ ] Add middleware protection
* [x] Create user registration
* [x] Set up password hashing

### Login Endpoint

```javascript
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password required'
      });
    }
    
    // Authenticate user
    const user = await User.findByEmail(email);
    if (!user || !await user.validatePassword(password)) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = auth.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});
```

### Middleware Protection

```javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      error: 'No token provided'
    });
  }
  
  try {
    const decoded = auth.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid token'
    });
  }
};

// Usage
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'Access granted',
    user: req.user
  });
});
```

## Testing

### Test Configuration

```javascript
// test/auth.test.js
const request = require('supertest');
const app = require('../app');
const AuthService = require('../src/auth-service');

describe('Authentication', () => {
  let authService;
  
  beforeEach(() => {
    authService = new AuthService({
      secret: 'test-secret',
      expiration: '1h'
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should authenticate valid user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
        
      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });
    
    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
        
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });
});
```

### Test Results Matrix

| Test Case | Status | Coverage | Performance |
|:----------|:------:|:--------:|:-----------:|
| Valid login | ✅ Pass | 100% | <50ms |
| Invalid credentials | ✅ Pass | 100% | <25ms |
| Missing token | ✅ Pass | 100% | <10ms |
| Expired token | ✅ Pass | 100% | <15ms |
| Rate limiting | ✅ Pass | 100% | <30ms |

### Performance Benchmarks

```bash
# Load testing with Artillery
artillery quick --count 100 --num 10 http://localhost:3000/api/auth/login
```

**Results:**
* Average response time: 45ms
* 95th percentile: 120ms
* Error rate: 0%
* Throughput: 2,200 requests/sec

## Troubleshooting

### Common Issues

#### Error: "JWT malformed"

**Symptoms:**
* Authentication fails with malformed JWT error
* Valid tokens rejected by middleware

**Causes:**
* Token corruption during transmission
* Incorrect secret key configuration
* Token format issues

**Solutions:**

1. **Verify token format:**
   ```bash
   echo $TOKEN | base64 -d
   ```

2. **Check secret configuration:**
   ```javascript
   console.log('Secret length:', process.env.JWT_SECRET?.length);
   console.log('Secret defined:', !!process.env.JWT_SECRET);
   ```

3. **Test token generation:**
   ```javascript
   const testToken = auth.generateToken({ userId: 1, email: 'test@example.com' });
   console.log('Generated token:', testToken);
   
   const decoded = auth.verifyToken(testToken);
   console.log('Decoded token:', decoded);
   ```

#### Error: "Token expired"

**Symptoms:**
* Previously working tokens suddenly fail
* Users logged out unexpectedly

**Solutions:**

<details>
<summary>Token Refresh Implementation</summary>

```javascript
app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    const decoded = auth.verifyRefreshToken(refreshToken);
    const newToken = auth.generateToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    });
    
    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

</details>

### Debug Mode

Enable debug logging for troubleshooting:

```javascript
const auth = new AuthService({
  secret: process.env.JWT_SECRET,
  debug: true // Enable debug mode
});

// Or use environment variable
DEBUG=auth:* npm start
```

### Health Check

```javascript
app.get('/api/auth/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      auth: auth.isHealthy(),
      database: db.isConnected(),
      redis: cache.isConnected()
    }
  };
  
  const allHealthy = Object.values(health.services).every(status => status);
  
  res.status(allHealthy ? 200 : 503).json(health);
});
```

---

**Note**: This is an example document demonstrating proper GitHub markdown formatting for Development Agents. Actual implementation details may vary based on specific requirements and technology stack.
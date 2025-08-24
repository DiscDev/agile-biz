---
allowed-tools: [Task]
argument-hint: Describe the bug, error message, or debugging scenario
---

# Debug

Get comprehensive debugging assistance from specialized AI agents to identify, analyze, and resolve technical issues.

## Usage

```
/debug [error description or debugging scenario]
```

**Examples:**
- `/debug React component not rendering correctly`
- `/debug SQL query returning wrong results`
- `/debug API endpoint returns 500 error`
- `/debug Memory leak in Node.js application`
- `/debug Authentication failing intermittently`

## What This Does

1. **Error Analysis**: Analyzes error messages, stack traces, and symptoms
2. **Root Cause Investigation**: Traces issues to their underlying causes  
3. **Multi-Agent Debugging**: Routes to appropriate specialists for domain expertise
4. **Solution Generation**: Provides specific fixes and implementation steps
5. **Prevention Strategies**: Suggests measures to prevent similar issues

## Debugging Categories

### Runtime Errors
- **JavaScript Errors**: TypeError, ReferenceError, SyntaxError analysis
- **HTTP Errors**: 400, 401, 403, 404, 500 status code debugging
- **Database Errors**: Connection issues, query failures, constraint violations
- **Network Issues**: CORS, timeout, connectivity problems

### Performance Issues
- **Slow Queries**: Database performance bottlenecks
- **Memory Leaks**: Unmanaged memory usage and cleanup
- **High CPU Usage**: Inefficient algorithms and processing
- **Bundle Size**: Large JavaScript bundles and optimization

### Logic Bugs  
- **Incorrect Results**: Wrong calculations, data transformations
- **State Management**: React/Vue state inconsistencies
- **Race Conditions**: Async operation timing issues
- **Data Flow**: Information not propagating correctly

### Integration Problems
- **API Integration**: Third-party service connection issues
- **Authentication**: Login, token validation, session management
- **File Upload**: Storage, processing, validation problems
- **Email/SMS**: Notification delivery failures

## Debugging Process

1. **Issue Identification**
   - Parse error description and symptoms
   - Identify affected systems and components
   - Determine urgency and impact level

2. **Agent Routing**
   - **Coder Agent**: General debugging and code analysis
   - **Backend Agent**: Server-side and database issues
   - **Frontend Agent**: UI, React, and client-side problems
   - **Security Agent**: Authentication and security-related bugs
   - **Performance Agent**: Optimization and efficiency issues

3. **Analysis Phase**
   - Error message interpretation
   - Stack trace analysis
   - Code flow examination
   - Environment and configuration review

4. **Solution Development**
   - Root cause identification
   - Step-by-step fix implementation
   - Testing and validation approach
   - Prevention recommendations

## Output Format

**Problem Summary**
- Issue classification and severity
- Affected components and systems  
- Impact assessment and urgency

**Root Cause Analysis**
- Detailed explanation of the underlying issue
- Contributing factors and conditions
- Code sections or configurations involved

**Solution Steps**
- Immediate fix implementation
- Code changes with examples
- Configuration adjustments
- Testing procedures

**Prevention Measures**
- Best practices to avoid recurrence
- Monitoring and alerting setup
- Code quality improvements
- Documentation updates

## Example Debug Sessions

### React Component Not Rendering

**Issue**: `/debug React component shows blank screen after state update`

```markdown
## Debug Analysis: React Component Rendering Issue

### Problem Classification
- **Type**: Frontend rendering bug
- **Severity**: High (user-facing)
- **Component**: UserProfile component
- **Trigger**: State update after API call

### Root Cause Analysis

The component is likely encountering one of these common issues:

1. **State Update Causing Re-render Loop**
   ```javascript
   // ❌ Problematic pattern
   const UserProfile = () => {
     const [user, setUser] = useState(null);
     
     // This creates infinite loop
     useEffect(() => {
       fetchUser().then(data => {
         setUser(data);
         // Missing dependency array causes re-run
       });
     });
   ```

2. **Conditional Rendering Issue**
   ```javascript
   // ❌ Blank screen when user is loading
   return user.name ? <div>{user.name}</div> : null;
   ```

3. **Error Boundary Not Catching Errors**
   - Component throwing error during render
   - No error boundary to display fallback UI

### Debugging Steps

1. **Add Console Logging**
   ```javascript
   const UserProfile = () => {
     const [user, setUser] = useState(null);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);
     
     console.log('UserProfile render:', { user, loading, error });
     
     useEffect(() => {
       console.log('useEffect triggered');
       fetchUser()
         .then(data => {
           console.log('User data received:', data);
           setUser(data);
           setLoading(false);
         })
         .catch(err => {
           console.error('Fetch error:', err);
           setError(err.message);
           setLoading(false);
         });
     }, []); // Added dependency array
   ```

2. **Add Loading and Error States**
   ```javascript
   if (loading) return <div>Loading user profile...</div>;
   if (error) return <div>Error: {error}</div>;
   if (!user) return <div>No user data available</div>;
   ```

3. **Check React Developer Tools**
   - Inspect component state and props
   - Look for error messages in console
   - Check component tree for unexpected behavior

### Fixed Implementation
```javascript
import React, { useState, useEffect } from 'react';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Prevent state update if unmounted
    
    const loadUser = async () => {
      try {
        setLoading(true);
        const userData = await fetchUser();
        
        if (isMounted) {
          // Validate data structure
          if (userData && typeof userData === 'object') {
            setUser(userData);
          } else {
            throw new Error('Invalid user data format');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load user');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // Defensive rendering
  if (loading) {
    return (
      <div className="user-profile loading">
        <div>Loading user profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile error">
        <div>Error loading profile: {error}</div>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-profile empty">
        <div>No user data available</div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <h2>{user.name || 'Unknown User'}</h2>
      <p>Email: {user.email || 'No email provided'}</p>
      <p>Role: {user.role || 'User'}</p>
    </div>
  );
};

export default UserProfile;
```

### Prevention Measures
1. Always use dependency arrays in useEffect
2. Implement proper loading and error states
3. Add cleanup functions for async operations
4. Use defensive programming patterns
5. Add Error Boundaries at app level
```

### API Endpoint 500 Error Debugging

**Issue**: `/debug API returns 500 error intermittently`

```markdown
## Debug Analysis: API 500 Error

### Problem Classification
- **Type**: Backend server error
- **Severity**: Critical (service disruption)
- **Frequency**: Intermittent (~20% of requests)
- **Endpoint**: POST /api/users

### Error Investigation

1. **Check Server Logs**
   ```bash
   # Look for error patterns
   tail -f /var/log/api.log | grep "500\|ERROR\|Exception"
   
   # Check specific timeframes
   grep "2024-01-15 14:" /var/log/api.log | grep "500"
   ```

2. **Analyze Stack Trace**
   ```
   TypeError: Cannot read property 'id' of undefined
   at UserController.createUser (/src/controllers/user.js:45)
   at Layer.handle (/node_modules/express/lib/router/layer.js:95)
   ```

### Root Cause Analysis

The error occurs when `req.user` is undefined, indicating:

1. **Authentication Middleware Issue**
   ```javascript
   // ❌ Problem: middleware not handling edge cases
   const authMiddleware = (req, res, next) => {
     const token = req.headers.authorization;
     const decoded = jwt.verify(token, process.env.JWT_SECRET);
     req.user = decoded; // Fails if token is malformed
     next();
   };
   ```

2. **Race Condition in Database**
   - Concurrent requests causing database lock
   - Transaction not properly handled

### Fixed Implementation

```javascript
// ✅ Robust authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Missing or invalid authorization header' 
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "
    
    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided' 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Validate decoded token structure
      if (!decoded || !decoded.userId) {
        return res.status(401).json({ 
          error: 'Invalid token payload' 
        });
      }

      // Verify user exists in database
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ 
          error: 'User not found' 
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Token expired' 
        });
      }
      
      return res.status(401).json({ 
        error: 'Invalid token' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed' 
    });
  }
};

// ✅ Improved controller with defensive programming
const createUser = async (req, res) => {
  try {
    // Validate request body
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({
        error: 'Name and email are required'
      });
    }

    // Validate authenticated user (defensive check)
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    // Database transaction for data consistency
    const result = await db.transaction(async (transaction) => {
      // Check for existing user
      const existingUser = await User.findOne({
        where: { email },
        transaction
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const newUser = await User.create({
        name,
        email,
        createdBy: req.user.id,
        createdAt: new Date()
      }, { transaction });

      return newUser;
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: result.id,
        name: result.name,
        email: result.email
      }
    });

  } catch (error) {
    console.error('Create user error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      requestBody: req.body,
      timestamp: new Date().toISOString()
    });

    // Handle known errors
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: error.message
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Failed to create user'
    });
  }
};
```

### Monitoring and Prevention

1. **Add Request Logging**
   ```javascript
   app.use((req, res, next) => {
     console.log(`${new Date().toISOString()} ${req.method} ${req.path}`, {
       headers: req.headers,
       body: req.body,
       ip: req.ip
     });
     next();
   });
   ```

2. **Implement Health Checks**
   ```javascript
   app.get('/health', async (req, res) => {
     try {
       await db.authenticate();
       res.json({ status: 'healthy', timestamp: Date.now() });
     } catch (error) {
       res.status(500).json({ status: 'unhealthy', error: error.message });
     }
   });
   ```

3. **Add Rate Limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const createUserLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5, // Limit each IP to 5 requests per windowMs
     message: 'Too many user creation attempts'
   });
   
   app.post('/api/users', createUserLimiter, authMiddleware, createUser);
   ```
```

## Advanced Debugging Techniques

### Performance Debugging
```javascript
// Add performance monitoring
const performanceMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) { // Log slow requests
      console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
};
```

### Memory Leak Debugging
```javascript
// Monitor memory usage
setInterval(() => {
  const used = process.memoryUsage();
  for (let key in used) {
    console.log(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
}, 30000);
```

### Database Query Debugging
```javascript
// Log all database queries
const sequelize = new Sequelize({
  // ... config
  logging: (sql, timing) => {
    if (timing > 100) { // Log slow queries
      console.warn(`Slow query (${timing}ms): ${sql}`);
    }
  }
});
```

## Follow-up Actions

After debugging:
- `/test` - Add tests to prevent regression
- `/implement` - Apply permanent fixes
- `/review-code` - Review related code for similar issues
- `/refactor` - Improve code structure to prevent future bugs
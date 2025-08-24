---
title: "Performance Configuration - Developer Agent Context"
type: "agent-context"
agent: "developer"
keywords: ["performance", "optimize", "port", "environment", "config", "speed", "memory", "database"]
token_count: 1698
---

# Performance Configuration - Developer Agent Context

## When to Load This Context
- **Keywords**: performance, optimize, port, environment, config, speed, memory, database
- **Patterns**: "optimize this", "performance issue", "slow query", "configure ports", "environment setup"

## Application Setup with Dynamic Port Management

### Port Discovery Implementation
**CRITICAL FOR MULTI-PROJECT**: ALWAYS implement dynamic port discovery for all application servers to prevent port conflicts.

```javascript
// Node.js/Express Port Discovery
const net = require('net');

function findAvailablePort(startPort = 3000, endPort = 3020) {
  return new Promise((resolve, reject) => {
    let port = startPort;
    
    function tryPort() {
      const server = net.createServer();
      
      server.listen(port, () => {
        server.once('close', () => resolve(port));
        server.close();
      });
      
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          port++;
          if (port <= endPort) {
            tryPort();
          } else {
            reject(new Error(`No available ports between ${startPort}-${endPort}`));
          }
        } else {
          reject(err);
        }
      });
    }
    
    tryPort();
  });
}

// Usage in Express app
async function startServer() {
  try {
    const PORT = process.env.PORT || await findAvailablePort(3000, 3020);
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}
```

### Port Configuration Examples by Framework

#### Node.js/Express
```javascript
const PORT = process.env.BACKEND_PORT || process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### Vite/React
```javascript
// vite.config.js
export default {
  server: {
    port: parseInt(process.env.FRONTEND_PORT) || 5173,
    strictPort: false, // Try next available if port is taken
  }
}
```

#### Python/Flask
```python
import os
port = int(os.environ.get('BACKEND_PORT', 3000))
app.run(host='0.0.0.0', port=port)
```

#### Next.js
```javascript
// next.config.js
module.exports = {
  env: {
    CUSTOM_PORT: process.env.FRONTEND_PORT || '3000',
  },
  server: {
    port: process.env.FRONTEND_PORT || 3000,
  }
}
```

### Environment Variable Management
```bash
# .env.development
NODE_ENV=development
FRONTEND_PORT=5173
BACKEND_PORT=3000
DATABASE_PORT=5432
REDIS_PORT=6379
WEBSOCKET_PORT=8080
```

### Proxy Configuration for Development
```javascript
// Vite proxy configuration
export default {
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.BACKEND_PORT || 3000}`,
        changeOrigin: true
      }
    }
  }
}
```

## Performance Standards

### Response Time Targets
```yaml
performance_targets:
  response_time:
    api_endpoints: "< 200ms"
    database_queries: "< 100ms"
    page_load: "< 2 seconds"
    
  scalability:
    concurrent_users: "1000+"
    requests_per_second: "500+"
    database_connections: "100+"
    
  monitoring:
    error_rate: "< 1%"
    uptime: "> 99.9%"
    resource_usage: "< 80% CPU/Memory"
```

## Database Performance Optimization

### Query Optimization Patterns
```javascript
// ❌ BAD: N+1 Query Problem
const users = await User.find();
for (const user of users) {
  const orders = await Order.find({ userId: user.id });
  user.orders = orders;
}

// ✅ GOOD: Use aggregation or populate
const users = await User.aggregate([
  {
    $lookup: {
      from: 'orders',
      localField: '_id',
      foreignField: 'userId',
      as: 'orders'
    }
  }
]);

// ✅ BETTER: Use projection to limit fields
const users = await User.find()
  .select('name email createdAt')
  .populate({
    path: 'orders',
    select: 'orderNumber totalAmount status',
    options: { limit: 10, sort: { createdAt: -1 } }
  });

// ✅ BEST: Use indexes and compound queries
// Ensure indexes exist:
// db.users.createIndex({ email: 1 })
// db.orders.createIndex({ userId: 1, createdAt: -1 })

const userWithRecentOrders = await User.findOne({ email })
  .lean() // For read-only operations
  .populate({
    path: 'orders',
    match: { createdAt: { $gte: lastMonth } },
    select: '-__v',
    options: { sort: { createdAt: -1 } }
  });
```

### Database Indexing Strategies
```sql
-- PostgreSQL Performance Indexes
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_created_at ON users(created_at);
CREATE INDEX CONCURRENTLY idx_orders_user_id_created_at ON orders(user_id, created_at);
CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status) WHERE status != 'completed';

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users u 
JOIN orders o ON u.id = o.user_id 
WHERE u.email = 'user@example.com' 
ORDER BY o.created_at DESC LIMIT 10;
```

## Frontend Performance Optimization

### React Performance Patterns
```javascript
// Memoization
const expensiveCalculation = useMemo(() => {
  return data?.items?.reduce((sum, item) => sum + (item.value || 0), 0) || 0;
}, [data?.items]);

// Debouncing
const debouncedSearch = useCallback(
  debounce((query) => {
    if (query?.length >= 2) {
      searchAPI(query);
    }
  }, 300),
  []
);

// Lazy loading
const LazyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}

// Virtual scrolling for large lists
import { VariableSizeList as List } from 'react-window';

function VirtualizedList({ items }) {
  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={() => 50}
      itemData={items}
    >
      {({ index, style, data }) => (
        <div style={style}>
          {data[index].name}
        </div>
      )}
    </List>
  );
}
```

### Bundle Optimization
```javascript
// Webpack bundle analysis
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js

// Code splitting by routes
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));

// Tree shaking - import only what you need
import { debounce } from 'lodash-es'; // ✅ Good
import _ from 'lodash'; // ❌ Imports entire library
```

## Caching Strategies

### Redis Caching
```javascript
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Cache with TTL
async function getCachedData(key, fetchFunction, ttlSeconds = 300) {
  try {
    // Try to get from cache first
    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // If not in cache, fetch and store
    const data = await fetchFunction();
    await client.setex(key, ttlSeconds, JSON.stringify(data));
    return data;
    
  } catch (error) {
    console.error('Cache error:', error);
    // Fallback to direct fetch if cache fails
    return await fetchFunction();
  }
}

// Usage
const userData = await getCachedData(
  `user:${userId}`,
  () => User.findById(userId),
  600 // 10 minutes
);
```

### HTTP Caching Headers
```javascript
// Express.js caching middleware
function cacheControl(seconds) {
  return (req, res, next) => {
    res.set('Cache-Control', `public, max-age=${seconds}`);
    next();
  };
}

// Static assets - 1 year
app.use('/static', cacheControl(31536000), express.static('public'));

// API responses - 5 minutes
app.get('/api/products', cacheControl(300), getProducts);

// Dynamic content - no cache
app.get('/api/user/profile', (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  // ... handle request
});
```

## Memory Management

### JavaScript Memory Optimization
```javascript
// Avoid memory leaks
class DataProcessor {
  constructor() {
    this.eventHandlers = new Map();
    this.timers = new Set();
  }
  
  addEventHandler(element, event, handler) {
    element.addEventListener(event, handler);
    this.eventHandlers.set(element, { event, handler });
  }
  
  startTimer(callback, interval) {
    const timer = setInterval(callback, interval);
    this.timers.add(timer);
    return timer;
  }
  
  cleanup() {
    // Clean up event listeners
    for (const [element, { event, handler }] of this.eventHandlers) {
      element.removeEventListener(event, handler);
    }
    this.eventHandlers.clear();
    
    // Clear timers
    for (const timer of this.timers) {
      clearInterval(timer);
    }
    this.timers.clear();
  }
}
```

### Database Connection Pooling
```javascript
// PostgreSQL connection pool
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of connections
  min: 5,  // Minimum number of connections
  acquireTimeoutMillis: 30000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200,
});

// MongoDB connection optimization
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL, {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
});
```

## Monitoring and Profiling

### Performance Monitoring
```javascript
// Custom performance monitoring
class PerformanceMonitor {
  static startTimer(name) {
    console.time(name);
    return performance.now();
  }
  
  static endTimer(name, startTime) {
    const duration = performance.now() - startTime;
    console.timeEnd(name);
    
    // Log slow operations
    if (duration > 100) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }
  
  static async measureAsync(name, asyncFunction) {
    const start = this.startTimer(name);
    try {
      const result = await asyncFunction();
      this.endTimer(name, start);
      return result;
    } catch (error) {
      this.endTimer(name, start);
      throw error;
    }
  }
}

// Usage
const result = await PerformanceMonitor.measureAsync(
  'user-fetch',
  () => User.findById(userId)
);
```

### Resource Monitoring
```javascript
// Memory usage monitoring
function logMemoryUsage() {
  const used = process.memoryUsage();
  console.log('Memory Usage:');
  for (let key in used) {
    console.log(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
}

// Monitor every 30 seconds
setInterval(logMemoryUsage, 30000);

// CPU usage monitoring (requires pidusage package)
const pidusage = require('pidusage');

setInterval(() => {
  pidusage(process.pid, (err, stats) => {
    if (!err) {
      console.log(`CPU: ${stats.cpu.toFixed(2)}%, Memory: ${(stats.memory / 1024 / 1024).toFixed(2)} MB`);
    }
  });
}, 30000);
```
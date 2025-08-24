---
allowed-tools: [Task]
argument-hint: Specify the system, application, or component to profile for performance analysis
---

# Profile

Conduct comprehensive performance profiling to identify bottlenecks, resource usage patterns, and optimization opportunities across applications, databases, and infrastructure.

## Usage

```
/profile [system or component to analyze]
```

**Examples:**
- `/profile React application rendering performance and memory usage`
- `/profile Node.js API endpoints under load testing scenarios`
- `/profile PostgreSQL database queries and connection patterns`
- `/profile Full-stack application performance during peak traffic`

## What This Does

1. **Performance Measurement**: Collect detailed metrics on CPU, memory, network, and disk usage
2. **Bottleneck Identification**: Pinpoint specific areas causing performance degradation
3. **Resource Analysis**: Analyze resource consumption patterns and efficiency
4. **Optimization Recommendations**: Provide specific improvements based on profiling data
5. **Baseline Establishment**: Create performance baselines for ongoing monitoring

## Profiling Categories

### Application Performance Profiling
- **CPU Profiling**: Function call analysis, execution time breakdown, hot spots identification
- **Memory Profiling**: Heap analysis, garbage collection patterns, memory leak detection
- **Execution Flow**: Call stack analysis, async operation tracking, event loop monitoring
- **Bundle Analysis**: JavaScript bundle size, loading patterns, code splitting effectiveness

### Database Performance Profiling
- **Query Performance**: Execution time analysis, query plan optimization, index usage
- **Connection Profiling**: Pool utilization, connection lifecycle, blocking operations
- **Resource Usage**: CPU, memory, and disk I/O patterns for database operations
- **Transaction Analysis**: Lock contention, deadlock detection, transaction duration

### Network and Infrastructure Profiling
- **Network Latency**: Request/response timing, bandwidth utilization, connection overhead
- **Server Resource Usage**: CPU, memory, disk, and network utilization patterns
- **Load Balancing**: Traffic distribution, server health, response time variations
- **CDN Performance**: Cache hit rates, geographic distribution, asset delivery timing

### Frontend Performance Profiling
- **Browser Performance**: Rendering timeline, paint events, layout thrashing
- **Resource Loading**: Asset loading patterns, critical path analysis, caching effectiveness
- **User Interaction**: Event handling performance, scroll performance, animation frame rates
- **Core Web Vitals**: Largest Contentful Paint, First Input Delay, Cumulative Layout Shift

## Profiling Process Framework

1. **Profiling Strategy Planning**
   - Define profiling objectives and success criteria
   - Select appropriate profiling tools and methodologies
   - Plan test scenarios and data collection approach
   - Establish baseline measurements and comparison metrics

2. **Data Collection**
   - Set up profiling tools and monitoring instrumentation
   - Execute profiling scenarios under various load conditions
   - Collect comprehensive performance data and metrics
   - Document environmental conditions and configurations

3. **Analysis and Interpretation**
   - Analyze profiling data to identify patterns and bottlenecks
   - Correlate performance issues with specific code or configuration
   - Prioritize optimization opportunities by impact and effort
   - Validate findings through targeted testing

4. **Optimization Planning**
   - Develop specific improvement recommendations
   - Estimate performance gains from proposed optimizations
   - Plan implementation approach and testing strategy
   - Establish monitoring for ongoing performance tracking

## Example Profiling Implementations

### React Application Performance Profiling

**Input**: `/profile React e-commerce application for rendering performance and memory optimization`

```markdown
## Performance Profile: React E-commerce Application

### Profiling Scope and Objectives
- **Application**: E-commerce product catalog with 10,000+ items
- **Key Scenarios**: Product listing, search, cart operations, checkout flow
- **Performance Goals**: <2s page load, <16ms render times, <100MB memory usage
- **Tools**: React DevTools Profiler, Chrome DevTools, webpack-bundle-analyzer

### Profiling Environment Setup

**Development Environment Configuration**:
```javascript
// webpack.config.js - Profiling build configuration
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  
  // Enable profiling for React DevTools
  resolve: {
    alias: {
      'react-dom$': 'react-dom/profiling',
      'scheduler/tracing': 'scheduler/tracing-profiling',
    }
  },
  
  plugins: [
    // Bundle analysis plugin
    new BundleAnalyzerPlugin({
      analyzerMode: 'server',
      openAnalyzer: true,
      generateStatsFile: true,
      statsFilename: 'bundle-stats.json'
    })
  ],
  
  optimization: {
    // Preserve module names for easier profiling
    moduleIds: 'named',
    chunkIds: 'named'
  }
};

// Performance monitoring setup
const performanceObserver = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach((entry) => {
    if (entry.entryType === 'measure') {
      console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`);
    }
  });
});

performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
```

**Component Performance Instrumentation**:
```javascript
// utils/profiling.js - Custom profiling utilities
export class ComponentProfiler {
  static profiles = new Map();
  
  static startProfile(componentName, phase) {
    const key = `${componentName}-${phase}`;
    performance.mark(`${key}-start`);
    
    if (!this.profiles.has(componentName)) {
      this.profiles.set(componentName, {
        renders: 0,
        totalTime: 0,
        phases: new Map()
      });
    }
  }
  
  static endProfile(componentName, phase) {
    const key = `${componentName}-${phase}`;
    performance.mark(`${key}-end`);
    performance.measure(key, `${key}-start`, `${key}-end`);
    
    const measure = performance.getEntriesByName(key, 'measure')[0];
    if (measure) {
      const profile = this.profiles.get(componentName);
      profile.renders++;
      profile.totalTime += measure.duration;
      
      if (!profile.phases.has(phase)) {
        profile.phases.set(phase, { count: 0, totalTime: 0 });
      }
      
      const phaseProfile = profile.phases.get(phase);
      phaseProfile.count++;
      phaseProfile.totalTime += measure.duration;
    }
  }
  
  static getProfileSummary() {
    const summary = {};
    this.profiles.forEach((profile, componentName) => {
      summary[componentName] = {
        averageRenderTime: profile.totalTime / profile.renders,
        totalRenders: profile.renders,
        phases: Object.fromEntries(
          Array.from(profile.phases.entries()).map(([phase, data]) => [
            phase,
            {
              averageTime: data.totalTime / data.count,
              count: data.count
            }
          ])
        )
      };
    });
    return summary;
  }
}

// HOC for automatic component profiling
export const withProfiling = (WrappedComponent, componentName) => {
  return React.memo((props) => {
    ComponentProfiler.startProfile(componentName, 'render');
    
    useEffect(() => {
      ComponentProfiler.endProfile(componentName, 'render');
    });
    
    return <WrappedComponent {...props} />;
  });
};
```

### CPU and Memory Profiling Results

**React Component Performance Analysis**:
```javascript
// Profiling results from React DevTools and custom instrumentation

const profilingResults = {
  // Component render performance
  componentPerformance: {
    ProductList: {
      averageRenderTime: 45.2, // ms
      renders: 127,
      issues: [
        'Re-rendering entire list on price filter change',
        'No virtualization for 1000+ items',
        'Expensive sort operations on every render'
      ]
    },
    ProductCard: {
      averageRenderTime: 8.7, // ms
      renders: 3847,
      issues: [
        'Image loading blocking render',
        'Inline style calculations on every render',
        'No memoization of price formatting'
      ]
    },
    SearchFilter: {
      averageRenderTime: 23.1, // ms
      renders: 89,
      issues: [
        'Debounced search triggering unnecessary re-renders',
        'Filter state causing cascade re-renders'
      ]
    }
  },
  
  // Memory usage patterns
  memoryProfile: {
    initialLoad: {
      heapSize: '42MB',
      components: 3200,
      eventListeners: 145
    },
    afterNavigation: {
      heapSize: '67MB', // 60% increase
      components: 4800,
      eventListeners: 203,
      leaks: [
        'Event listeners not cleaned up in ProductCard',
        'Closure references in search filters',
        'Unreleased image references'
      ]
    },
    afterGC: {
      heapSize: '51MB', // 16MB freed
      reclaimedObjects: 1247,
      persistentMemory: '35MB'
    }
  },
  
  // Bundle analysis
  bundleAnalysis: {
    totalSize: '2.4MB',
    gzippedSize: '847KB',
    largestChunks: [
      { name: 'vendor', size: '1.2MB', description: 'Third-party libraries' },
      { name: 'main', size: '890KB', description: 'Application code' },
      { name: 'components', size: '310KB', description: 'React components' }
    ],
    unusedCode: {
      lodashFunctions: '245KB', // Only using 3 functions
      momentJS: '180KB', // Could use date-fns instead
      iconLibrary: '120KB' // Loading all icons, using 20%
    }
  }
};
```

**Performance Bottleneck Analysis**:
```javascript
// Chrome DevTools Performance Timeline Analysis
const performanceBottlenecks = {
  // Main thread blocking operations
  longTasks: [
    {
      task: 'Product list rendering',
      duration: '156ms',
      impact: 'Blocks user interaction',
      solution: 'Implement virtual scrolling'
    },
    {
      task: 'Price calculation loop',
      duration: '89ms',
      impact: 'Delays filter updates',
      solution: 'Memoize calculations, use Web Workers'
    },
    {
      task: 'Image processing',
      duration: '67ms',
      impact: 'Blocks initial render',
      solution: 'Lazy load images, use WebP format'
    }
  ],
  
  // Memory allocation patterns
  memoryHotspots: [
    {
      source: 'ProductCard component creation',
      allocations: '15MB per product list render',
      frequency: 'Every filter change',
      optimization: 'Implement object pooling and memoization'
    },
    {
      source: 'Search result processing',
      allocations: '8MB per search query',
      frequency: 'Every keystroke (debounced)',
      optimization: 'Use incremental search and result caching'
    }
  ],
  
  // Network performance
  networkBottlenecks: [
    {
      resource: 'Product images',
      totalSize: '4.2MB for 50 products',
      loadTime: '2.3s on 3G',
      optimization: 'Progressive loading, responsive images'
    },
    {
      resource: 'API responses',
      averageSize: '180KB',
      loadTime: '890ms',
      optimization: 'Response compression, request batching'
    }
  ]
};
```

### Database Performance Profiling

**PostgreSQL Query Performance Analysis**:
```sql
-- Enable query performance tracking
ALTER SYSTEM SET track_activities = on;
ALTER SYSTEM SET track_counts = on;
ALTER SYSTEM SET track_io_timing = on;
ALTER SYSTEM SET log_min_duration_statement = 100; -- Log queries > 100ms
SELECT pg_reload_conf();

-- Analyze slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time,
  stddev_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
WHERE mean_time > 100 -- Focus on queries averaging > 100ms
ORDER BY total_time DESC
LIMIT 20;

-- Connection and lock analysis  
SELECT 
  datname,
  usename,
  application_name,
  client_addr,
  state,
  query_start,
  state_change,
  waiting,
  query
FROM pg_stat_activity 
WHERE state != 'idle'
ORDER BY query_start;

-- Index usage analysis
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

**Database Profiling Results**:
```javascript
const databaseProfile = {
  // Query performance analysis
  slowQueries: [
    {
      query: 'SELECT p.*, AVG(r.rating) FROM products p LEFT JOIN reviews r ON p.id = r.product_id GROUP BY p.id',
      frequency: 847, // calls per hour
      averageTime: '1,247ms',
      totalTime: '17.6 minutes/hour',
      issues: [
        'Missing composite index on reviews(product_id, rating)',
        'Full table scan on products table',
        'Inefficient GROUP BY operation'
      ],
      optimizedVersion: `
        -- Add index first
        CREATE INDEX CONCURRENTLY idx_reviews_product_rating ON reviews(product_id, rating);
        
        -- Optimized query
        SELECT p.*, 
               COALESCE(rs.avg_rating, 0) as avg_rating
        FROM products p
        LEFT JOIN (
          SELECT product_id, AVG(rating) as avg_rating
          FROM reviews
          WHERE rating IS NOT NULL
          GROUP BY product_id
        ) rs ON p.id = rs.product_id
        WHERE p.is_active = true;
      `
    }
  ],
  
  // Connection pool analysis
  connectionProfile: {
    poolSize: 20,
    averageActive: 17.3, // 86% utilization
    peakActive: 20, // 100% utilization during peak
    averageWaitTime: '2.3s',
    timeouts: 23, // per hour
    recommendations: [
      'Increase pool size to 30 connections',
      'Implement connection pooling at application level',
      'Add read replicas for read-heavy queries'
    ]
  },
  
  // Resource utilization
  resourceUsage: {
    cpu: {
      average: '67%',
      peak: '94%',
      bottlenecks: ['Complex aggregation queries', 'Full text search operations']
    },
    memory: {
      bufferHitRatio: '89.2%', // Good, >95% is ideal
      cacheSize: '512MB',
      workMem: '64MB',
      recommendation: 'Increase shared_buffers to 1GB'
    },
    disk: {
      readIOPS: 340,
      writeIOPS: 89,
      averageLatency: '12ms',
      bottlenecks: ['Log file writes', 'Index updates during bulk operations']
    }
  }
};
```

### Frontend Performance Profiling

**Core Web Vitals Analysis**:
```javascript
// Web Vitals measurement and analysis
const webVitalsProfile = {
  // Largest Contentful Paint (LCP)
  lcp: {
    current: '3.2s',
    target: '<2.5s',
    issues: [
      'Large product images loading synchronously',
      'Render-blocking CSS in head',
      'Server response time 890ms'
    ],
    optimizations: [
      'Implement image lazy loading and WebP format',
      'Critical CSS inlining and async CSS loading',
      'Server-side rendering for above-the-fold content'
    ]
  },
  
  // First Input Delay (FID)
  fid: {
    current: '89ms',
    target: '<100ms',
    status: 'GOOD',
    notes: 'Within acceptable range but could be improved'
  },
  
  // Cumulative Layout Shift (CLS)
  cls: {
    current: '0.18',
    target: '<0.1',
    issues: [
      'Image loading causing layout shift',
      'Dynamic content insertion in product cards',
      'Font loading causing FOIT (Flash of Invisible Text)'
    ],
    optimizations: [
      'Reserve space for images with aspect-ratio CSS',
      'Preload critical fonts with font-display: swap',
      'Use skeleton screens for loading states'
    ]
  },
  
  // Custom metrics
  customMetrics: {
    timeToInteractive: '4.1s',
    firstPaint: '1.8s',
    firstContentfulPaint: '2.1s',
    speedIndex: '3.4s',
    totalBlockingTime: '234ms'
  }
};

// Performance monitoring implementation
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = [];
    this.setupObservers();
  }
  
  setupObservers() {
    // Core Web Vitals observer
    const webVitalsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric(entry.name, entry.value, entry);
      }
    });
    webVitalsObserver.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    
    // Long task observer
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Tasks longer than 50ms
          this.recordLongTask(entry);
        }
      }
    });
    longTaskObserver.observe({ entryTypes: ['longtask'] });
    
    // Resource timing observer
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.analyzeResourceTiming(entry);
      }
    });
    resourceObserver.observe({ entryTypes: ['resource'] });
  }
  
  recordMetric(name, value, entry) {
    const metric = {
      name,
      value,
      timestamp: Date.now(),
      entry
    };
    
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name).push(metric);
    
    // Send to analytics
    this.sendToAnalytics(metric);
  }
  
  recordLongTask(entry) {
    console.warn('Long task detected:', {
      duration: entry.duration,
      startTime: entry.startTime,
      name: entry.name,
      attribution: entry.attribution
    });
    
    // Track long tasks for optimization
    this.recordMetric('long-task', entry.duration, entry);
  }
  
  analyzeResourceTiming(entry) {
    const timing = {
      name: entry.name,
      duration: entry.duration,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize
    };
    
    // Identify slow resources
    if (entry.duration > 1000) {
      console.warn('Slow resource:', timing);
    }
    
    // Identify large resources
    if (entry.transferSize > 500000) { // > 500KB
      console.warn('Large resource:', timing);
    }
  }
  
  sendToAnalytics(metric) {
    // Send performance data to analytics service
    if (window.gtag) {
      gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: Math.round(metric.value),
        page_path: window.location.pathname
      });
    }
  }
  
  getPerformanceReport() {
    const report = {};
    this.metrics.forEach((values, name) => {
      const sortedValues = values.map(v => v.value).sort((a, b) => a - b);
      report[name] = {
        count: values.length,
        average: values.reduce((sum, v) => sum + v.value, 0) / values.length,
        median: sortedValues[Math.floor(sortedValues.length / 2)],
        p95: sortedValues[Math.floor(sortedValues.length * 0.95)],
        min: sortedValues[0],
        max: sortedValues[sortedValues.length - 1]
      };
    });
    return report;
  }
}

// Initialize performance monitoring
const performanceMonitor = new PerformanceMonitor();

// Export performance report function
window.getPerformanceReport = () => performanceMonitor.getPerformanceReport();
```

### API Performance Profiling

**Node.js API Endpoint Analysis**:
```javascript
// API performance profiling middleware
const express = require('express');
const app = express();

class APIProfiler {
  constructor() {
    this.metrics = new Map();
    this.activeRequests = new Map();
  }
  
  profileRequest(req, res, next) {
    const startTime = process.hrtime.bigint();
    const requestId = req.headers['x-request-id'] || Math.random().toString(36);
    
    // Track active request
    this.activeRequests.set(requestId, {
      method: req.method,
      path: req.path,
      startTime,
      memoryStart: process.memoryUsage()
    });
    
    // Override res.end to capture response metrics
    const originalEnd = res.end;
    res.end = (...args) => {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // Convert to ms
      const memoryEnd = process.memoryUsage();
      
      const requestData = this.activeRequests.get(requestId);
      if (requestData) {
        const metric = {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          memoryDelta: {
            heapUsed: memoryEnd.heapUsed - requestData.memoryStart.heapUsed,
            heapTotal: memoryEnd.heapTotal - requestData.memoryStart.heapTotal,
            external: memoryEnd.external - requestData.memoryStart.external
          },
          timestamp: Date.now()
        };
        
        this.recordAPIMetric(metric);
        this.activeRequests.delete(requestId);
      }
      
      originalEnd.apply(res, args);
    };
    
    next();
  }
  
  recordAPIMetric(metric) {
    const key = `${metric.method} ${metric.path}`;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        requests: [],
        totalRequests: 0,
        errorCount: 0,
        totalDuration: 0
      });
    }
    
    const endpointMetrics = this.metrics.get(key);
    endpointMetrics.requests.push(metric);
    endpointMetrics.totalRequests++;
    endpointMetrics.totalDuration += metric.duration;
    
    if (metric.statusCode >= 400) {
      endpointMetrics.errorCount++;
    }
    
    // Keep only last 1000 requests per endpoint
    if (endpointMetrics.requests.length > 1000) {
      endpointMetrics.requests.shift();
    }
    
    // Alert on slow requests
    if (metric.duration > 1000) {
      console.warn('Slow API request:', metric);
    }
    
    // Alert on memory growth
    if (metric.memoryDelta.heapUsed > 50000000) { // > 50MB
      console.warn('High memory usage request:', metric);
    }
  }
  
  getEndpointProfile(endpoint) {
    const metrics = this.metrics.get(endpoint);
    if (!metrics) return null;
    
    const durations = metrics.requests.map(r => r.duration).sort((a, b) => a - b);
    const memoryDeltas = metrics.requests.map(r => r.memoryDelta.heapUsed);
    
    return {
      totalRequests: metrics.totalRequests,
      errorRate: (metrics.errorCount / metrics.totalRequests * 100).toFixed(2) + '%',
      averageResponseTime: (metrics.totalDuration / metrics.totalRequests).toFixed(2) + 'ms',
      medianResponseTime: durations[Math.floor(durations.length / 2)]?.toFixed(2) + 'ms',
      p95ResponseTime: durations[Math.floor(durations.length * 0.95)]?.toFixed(2) + 'ms',
      maxResponseTime: Math.max(...durations).toFixed(2) + 'ms',
      averageMemoryDelta: (memoryDeltas.reduce((a, b) => a + b, 0) / memoryDeltas.length / 1024 / 1024).toFixed(2) + 'MB'
    };
  }
  
  getAllProfiles() {
    const profiles = {};
    this.metrics.forEach((_, endpoint) => {
      profiles[endpoint] = this.getEndpointProfile(endpoint);
    });
    return profiles;
  }
}

const apiProfiler = new APIProfiler();
app.use(apiProfiler.profileRequest.bind(apiProfiler));

// Profile endpoint
app.get('/api/profile/performance', (req, res) => {
  const profiles = apiProfiler.getAllProfiles();
  res.json({
    profiles,
    systemMemory: process.memoryUsage(),
    uptime: process.uptime(),
    activeRequests: apiProfiler.activeRequests.size
  });
});
```

### Optimization Recommendations

**Priority-Based Optimization Plan**:
```javascript
const optimizationPlan = {
  // High Impact, Low Effort (Quick Wins)
  quickWins: [
    {
      issue: 'Unused JavaScript bundle code (245KB)',
      solution: 'Tree-shake lodash imports, replace moment with date-fns',
      effort: '4 hours',
      impact: '25% bundle size reduction',
      implementation: `
        // Replace lodash full import
        // Before: import _ from 'lodash';
        import debounce from 'lodash/debounce';
        import throttle from 'lodash/throttle';
        
        // Replace moment with date-fns
        // Before: import moment from 'moment';
        import { format, parseISO } from 'date-fns';
      `
    },
    {
      issue: 'Images loading synchronously (2.3s delay)',
      solution: 'Implement lazy loading with Intersection Observer',
      effort: '6 hours',
      impact: '40% faster initial load',
      implementation: `
        const LazyImage = ({ src, alt, ...props }) => {
          const [imageSrc, setImageSrc] = useState(null);
          const imgRef = useRef();
          
          useEffect(() => {
            const observer = new IntersectionObserver(([entry]) => {
              if (entry.isIntersecting) {
                setImageSrc(src);
                observer.disconnect();
              }
            });
            
            if (imgRef.current) {
              observer.observe(imgRef.current);
            }
            
            return () => observer.disconnect();
          }, [src]);
          
          return <img ref={imgRef} src={imageSrc} alt={alt} {...props} />;
        };
      `
    }
  ],
  
  // High Impact, Medium Effort
  mediumTermOptimizations: [
    {
      issue: 'Product list re-rendering entire list (156ms blocking)',
      solution: 'Implement React virtualization with react-window',
      effort: '16 hours',
      impact: '80% reduction in render time',
      implementation: `
        import { FixedSizeList as List } from 'react-window';
        
        const VirtualizedProductList = ({ products, itemHeight = 200 }) => {
          const Row = ({ index, style }) => (
            <div style={style}>
              <ProductCard product={products[index]} />
            </div>
          );
          
          return (
            <List
              height={600}
              itemCount={products.length}
              itemSize={itemHeight}
              width="100%"
            >
              {Row}
            </List>
          );
        };
      `
    },
    {
      issue: 'Database query performance (1.2s average)',
      solution: 'Add composite indexes and query optimization',
      effort: '12 hours',
      impact: '70% query time reduction',
      implementation: `
        -- Add optimized indexes
        CREATE INDEX CONCURRENTLY idx_products_category_rating 
        ON products(category_id, (
          SELECT AVG(rating) FROM reviews WHERE product_id = products.id
        )) WHERE is_active = true;
        
        -- Optimize query with materialized view
        CREATE MATERIALIZED VIEW product_ratings AS
        SELECT product_id, AVG(rating) as avg_rating, COUNT(*) as review_count
        FROM reviews
        GROUP BY product_id;
        
        CREATE UNIQUE INDEX ON product_ratings(product_id);
      `
    }
  ],
  
  // High Impact, High Effort (Strategic)
  strategicOptimizations: [
    {
      issue: 'Memory leaks in React components',
      solution: 'Comprehensive memory management audit and fixes',
      effort: '32 hours',
      impact: '60% memory usage reduction',
      implementation: 'Component lifecycle audit, event listener cleanup, closure optimization'
    },
    {
      issue: 'API response time variability',
      solution: 'Implement caching layer with Redis and CDN',
      effort: '40 hours',  
      impact: '50% API response time improvement',
      implementation: 'Multi-tier caching strategy with intelligent invalidation'
    }
  ]
};
```

### Monitoring and Continuous Profiling

**Production Performance Monitoring**:
```javascript
// Continuous performance monitoring setup
class ProductionProfiler {
  constructor() {
    this.samplingRate = 0.1; // Sample 10% of requests
    this.alertThresholds = {
      responseTime: 1000, // ms
      memoryUsage: 500, // MB
      errorRate: 0.05 // 5%
    };
  }
  
  shouldSample() {
    return Math.random() < this.samplingRate;
  }
  
  startPerformanceTrace(operationName) {
    if (!this.shouldSample()) return null;
    
    return {
      name: operationName,
      startTime: performance.now(),
      startMemory: performance.memory ? performance.memory.usedJSHeapSize : 0
    };
  }
  
  endPerformanceTrace(trace) {
    if (!trace) return;
    
    const endTime = performance.now();
    const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
    
    const result = {
      operation: trace.name,
      duration: endTime - trace.startTime,
      memoryDelta: endMemory - trace.startMemory,
      timestamp: Date.now()
    };
    
    this.recordTrace(result);
    return result;
  }
  
  recordTrace(trace) {
    // Send to monitoring service
    if (window.gtag) {
      gtag('event', 'performance_trace', {
        operation: trace.operation,
        duration: Math.round(trace.duration),
        memory_delta: Math.round(trace.memoryDelta / 1024), // KB
      });
    }
    
    // Check for performance issues
    if (trace.duration > this.alertThresholds.responseTime) {
      this.sendAlert('slow_operation', trace);
    }
    
    if (trace.memoryDelta > this.alertThresholds.memoryUsage * 1024 * 1024) {
      this.sendAlert('high_memory_usage', trace);
    }
  }
  
  sendAlert(type, data) {
    // Send alert to monitoring service
    console.warn(`Performance alert: ${type}`, data);
    
    // Could integrate with services like DataDog, New Relic, etc.
    fetch('/api/monitoring/alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data })
    }).catch(err => console.error('Failed to send alert:', err));
  }
}

const productionProfiler = new ProductionProfiler();

// Usage in React components
const usePerformanceTrace = (operationName) => {
  const [trace, setTrace] = useState(null);
  
  const startTrace = useCallback(() => {
    const newTrace = productionProfiler.startPerformanceTrace(operationName);
    setTrace(newTrace);
    return newTrace;
  }, [operationName]);
  
  const endTrace = useCallback(() => {
    if (trace) {
      const result = productionProfiler.endPerformanceTrace(trace);
      setTrace(null);
      return result;
    }
  }, [trace]);
  
  return { startTrace, endTrace };
};

// Example usage
const ProductList = ({ products }) => {
  const { startTrace, endTrace } = usePerformanceTrace('product_list_render');
  
  useEffect(() => {
    const trace = startTrace();
    return () => endTrace();
  }, [products, startTrace, endTrace]);
  
  // Component implementation...
};
```

This comprehensive profiling approach provides detailed insights into application performance with specific optimization recommendations and ongoing monitoring capabilities.
```

## Profiling Quality Standards

### Data Collection Completeness
- **Multi-layer Analysis**: Application, database, network, and infrastructure profiling
- **Realistic Load Conditions**: Testing under actual usage patterns and traffic volumes
- **Comprehensive Metrics**: CPU, memory, I/O, network, and user experience measurements
- **Historical Baseline**: Comparison with previous performance measurements

### Analysis Depth and Accuracy
- **Bottleneck Identification**: Specific pinpointing of performance constraints and root causes
- **Impact Quantification**: Measurable performance impacts with concrete metrics
- **Correlation Analysis**: Understanding relationships between different performance factors
- **Statistical Significance**: Sufficient data collection for reliable conclusions

### Optimization Recommendations
- **Prioritized Solutions**: Recommendations ranked by impact vs effort for maximum ROI
- **Implementation Guidance**: Specific code examples and configuration changes
- **Performance Projections**: Expected improvements with confidence levels
- **Risk Assessment**: Potential side effects and mitigation strategies for optimizations

## Follow-up Actions

After performance profiling:
- `/optimize` - Implement specific optimizations identified in profiling analysis
- `/health-check` - Validate system health after performance improvements
- `/best-practice` - Establish performance monitoring and optimization practices
- `/capture-learnings` - Document profiling insights and optimization strategies
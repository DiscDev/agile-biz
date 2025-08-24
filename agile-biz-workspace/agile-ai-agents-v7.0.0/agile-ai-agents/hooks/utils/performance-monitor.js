/**
 * Hook Performance Monitor
 * Tracks and reports on hook execution performance
 */

const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor() {
    this.metricsPath = path.join(__dirname, '../metrics/performance.json');
    this.loadMetrics();
  }

  loadMetrics() {
    if (fs.existsSync(this.metricsPath)) {
      this.metrics = JSON.parse(fs.readFileSync(this.metricsPath, 'utf8'));
    } else {
      this.metrics = {
        hooks: {},
        summary: {
          totalExecutions: 0,
          totalTime: 0,
          avgTime: 0
        }
      };
    }
  }

  saveMetrics() {
    const dir = path.dirname(this.metricsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.metricsPath, JSON.stringify(this.metrics, null, 2));
  }

  startTiming(hookName) {
    return {
      hookName,
      startTime: Date.now(),
      startMemory: process.memoryUsage()
    };
  }

  endTiming(timing, success = true) {
    const endTime = Date.now();
    const duration = endTime - timing.startTime;
    const endMemory = process.memoryUsage();
    
    // Update hook metrics
    if (!this.metrics.hooks[timing.hookName]) {
      this.metrics.hooks[timing.hookName] = {
        executions: 0,
        successes: 0,
        failures: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: Infinity,
        maxTime: 0,
        memoryDelta: []
      };
    }
    
    const hookMetrics = this.metrics.hooks[timing.hookName];
    hookMetrics.executions++;
    if (success) {
      hookMetrics.successes++;
    } else {
      hookMetrics.failures++;
    }
    
    hookMetrics.totalTime += duration;
    hookMetrics.avgTime = Math.round(hookMetrics.totalTime / hookMetrics.executions);
    hookMetrics.minTime = Math.min(hookMetrics.minTime, duration);
    hookMetrics.maxTime = Math.max(hookMetrics.maxTime, duration);
    
    // Track memory usage
    const memoryDelta = endMemory.heapUsed - timing.startMemory.heapUsed;
    hookMetrics.memoryDelta.push(memoryDelta);
    if (hookMetrics.memoryDelta.length > 100) {
      hookMetrics.memoryDelta.shift(); // Keep last 100
    }
    
    // Update summary
    this.metrics.summary.totalExecutions++;
    this.metrics.summary.totalTime += duration;
    this.metrics.summary.avgTime = Math.round(
      this.metrics.summary.totalTime / this.metrics.summary.totalExecutions
    );
    
    // Check for performance issues
    this.checkPerformance(timing.hookName, duration);
    
    // Save periodically (every 10 executions)
    if (this.metrics.summary.totalExecutions % 10 === 0) {
      this.saveMetrics();
    }
    
    return {
      duration,
      memoryDelta,
      performance: this.getPerformanceRating(duration)
    };
  }

  checkPerformance(hookName, duration) {
    // Alert thresholds
    const thresholds = {
      warning: 1000,  // 1 second
      critical: 5000  // 5 seconds
    };
    
    if (duration > thresholds.critical) {
      this.logAlert('critical', hookName, duration);
    } else if (duration > thresholds.warning) {
      this.logAlert('warning', hookName, duration);
    }
  }

  logAlert(level, hookName, duration) {
    const alertPath = path.join(__dirname, '../metrics/performance-alerts.log');
    const alert = {
      timestamp: new Date().toISOString(),
      level,
      hookName,
      duration,
      message: `Hook ${hookName} took ${duration}ms (${level} threshold exceeded)`
    };
    
    const logEntry = JSON.stringify(alert) + '\n';
    fs.appendFileSync(alertPath, logEntry);
    
    // Also log to console for immediate visibility
    console.warn(`[Performance ${level.toUpperCase()}] ${alert.message}`);
  }

  getPerformanceRating(duration) {
    if (duration < 100) return 'excellent';
    if (duration < 500) return 'good';
    if (duration < 1000) return 'fair';
    if (duration < 5000) return 'poor';
    return 'critical';
  }

  generateReport() {
    const report = {
      generated: new Date().toISOString(),
      summary: this.metrics.summary,
      topSlowest: [],
      topFastest: [],
      mostExecuted: [],
      failureRate: {},
      recommendations: []
    };
    
    // Sort hooks by various metrics
    const hookArray = Object.entries(this.metrics.hooks);
    
    // Top 5 slowest
    report.topSlowest = hookArray
      .sort((a, b) => b[1].avgTime - a[1].avgTime)
      .slice(0, 5)
      .map(([name, metrics]) => ({
        name,
        avgTime: metrics.avgTime,
        maxTime: metrics.maxTime
      }));
    
    // Top 5 fastest
    report.topFastest = hookArray
      .sort((a, b) => a[1].avgTime - b[1].avgTime)
      .slice(0, 5)
      .map(([name, metrics]) => ({
        name,
        avgTime: metrics.avgTime,
        minTime: metrics.minTime
      }));
    
    // Most executed
    report.mostExecuted = hookArray
      .sort((a, b) => b[1].executions - a[1].executions)
      .slice(0, 5)
      .map(([name, metrics]) => ({
        name,
        executions: metrics.executions,
        totalTime: metrics.totalTime
      }));
    
    // Failure rates
    hookArray.forEach(([name, metrics]) => {
      if (metrics.failures > 0) {
        report.failureRate[name] = {
          rate: ((metrics.failures / metrics.executions) * 100).toFixed(2) + '%',
          failures: metrics.failures,
          total: metrics.executions
        };
      }
    });
    
    // Generate recommendations
    report.topSlowest.forEach(hook => {
      if (hook.avgTime > 5000) {
        report.recommendations.push(
          `CRITICAL: Hook '${hook.name}' averages ${hook.avgTime}ms - consider disabling or optimizing`
        );
      } else if (hook.avgTime > 1000) {
        report.recommendations.push(
          `WARNING: Hook '${hook.name}' averages ${hook.avgTime}ms - monitor for degradation`
        );
      }
    });
    
    // Check failure rates
    Object.entries(report.failureRate).forEach(([name, data]) => {
      const rate = parseFloat(data.rate);
      if (rate > 20) {
        report.recommendations.push(
          `Hook '${name}' has ${data.rate} failure rate - investigate root cause`
        );
      }
    });
    
    return report;
  }

  reset() {
    this.metrics = {
      hooks: {},
      summary: {
        totalExecutions: 0,
        totalTime: 0,
        avgTime: 0
      }
    };
    this.saveMetrics();
  }
}

// Singleton instance
module.exports = new PerformanceMonitor();
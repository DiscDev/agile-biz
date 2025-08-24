#!/usr/bin/env node

/**
 * Dashboard Event Notifier Hook Handler
 * Sends real-time events to the AgileAiAgents dashboard
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

class DashboardEventNotifier {
  constructor() {
    this.context = this.parseContext();
    this.projectRoot = path.join(__dirname, '../../..');
    this.config = this.loadConfig();
    this.eventQueue = [];
    this.retryQueue = [];
  }

  parseContext() {
    return {
      eventType: process.env.EVENT_TYPE || process.argv[2] || 'hook-execution',
      eventData: process.env.EVENT_DATA ? JSON.parse(process.env.EVENT_DATA) : {},
      hookName: process.env.HOOK_NAME || 'unknown',
      activeAgent: process.env.ACTIVE_AGENT || 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  loadConfig() {
    const defaultConfig = {
      dashboard: {
        host: 'localhost',
        port: 3001,
        protocol: 'http',
        endpoints: {
          events: '/api/events',
          hooks: '/api/hooks',
          metrics: '/api/metrics',
          state: '/api/state'
        }
      },
      batching: {
        enabled: true,
        maxSize: 10,
        flushInterval: 5000 // 5 seconds
      },
      retry: {
        maxAttempts: 3,
        backoffMultiplier: 2,
        initialDelay: 1000
      }
    };

    // Load custom config if exists
    const configPath = path.join(this.projectRoot, '.env');
    if (fs.existsSync(configPath)) {
      const envContent = fs.readFileSync(configPath, 'utf8');
      const dashboardPort = envContent.match(/DASHBOARD_PORT=(\d+)/);
      if (dashboardPort) {
        defaultConfig.dashboard.port = parseInt(dashboardPort[1]);
      }
    }

    return defaultConfig;
  }

  async execute() {
    try {
      const { eventType, eventData, hookName } = this.context;
      
      // Create event payload
      const event = this.createEvent(eventType, eventData, hookName);
      
      // Check if dashboard is running
      const isRunning = await this.isDashboardRunning();
      if (!isRunning) {
        return {
          status: 'skipped',
          reason: 'Dashboard not running',
          event
        };
      }

      // Send or queue event
      let result;
      if (this.config.batching.enabled && this.shouldBatch(eventType)) {
        result = await this.queueEvent(event);
      } else {
        result = await this.sendEvent(event);
      }

      return {
        status: result.success ? 'success' : 'error',
        sent: result.sent,
        queued: result.queued,
        response: result.response
      };

    } catch (error) {
      console.error('Dashboard notification failed:', error);
      throw error;
    }
  }

  createEvent(eventType, eventData, hookName) {
    const event = {
      id: this.generateEventId(),
      type: eventType,
      hook: hookName,
      agent: this.context.activeAgent,
      timestamp: this.context.timestamp,
      data: eventData,
      metadata: {
        processId: process.pid,
        sessionId: this.getSessionId(),
        projectId: this.getProjectId()
      }
    };

    // Add type-specific data
    switch (eventType) {
      case 'hook-execution':
        event.data.duration = eventData.duration || 0;
        event.data.status = eventData.status || 'unknown';
        event.category = 'system';
        break;

      case 'file-change':
        event.data.path = eventData.filePath;
        event.data.operation = eventData.operation || 'update';
        event.category = 'file';
        break;

      case 'sprint-update':
        event.data.sprintId = eventData.sprintId;
        event.data.phase = eventData.phase;
        event.category = 'sprint';
        break;

      case 'state-change':
        event.data.fromState = eventData.fromState;
        event.data.toState = eventData.toState;
        event.category = 'state';
        break;

      case 'agent-activation':
        event.data.previousAgent = eventData.previousAgent;
        event.data.newAgent = eventData.newAgent;
        event.category = 'agent';
        break;

      case 'error':
        event.data.error = eventData.error;
        event.data.stack = eventData.stack;
        event.category = 'error';
        event.priority = 'high';
        break;

      default:
        event.category = 'general';
    }

    return event;
  }

  async isDashboardRunning() {
    return new Promise((resolve) => {
      const options = {
        hostname: this.config.dashboard.host,
        port: this.config.dashboard.port,
        path: '/',
        method: 'GET',
        timeout: 2000
      };

      const protocol = this.config.dashboard.protocol === 'https' ? https : http;
      
      const req = protocol.request(options, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 300);
      });

      req.on('error', () => {
        resolve(false);
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.end();
    });
  }

  async sendEvent(event) {
    return new Promise((resolve) => {
      const data = JSON.stringify(event);
      
      const options = {
        hostname: this.config.dashboard.host,
        port: this.config.dashboard.port,
        path: this.config.dashboard.endpoints.events,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const protocol = this.config.dashboard.protocol === 'https' ? https : http;
      
      const req = protocol.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          const success = res.statusCode >= 200 && res.statusCode < 300;
          resolve({
            success,
            sent: true,
            queued: false,
            response: {
              statusCode: res.statusCode,
              data: responseData
            }
          });
        });
      });

      req.on('error', (error) => {
        // Add to retry queue
        this.retryQueue.push({ event, attempts: 0 });
        resolve({
          success: false,
          sent: false,
          queued: true,
          response: { error: error.message }
        });
      });

      req.write(data);
      req.end();
    });
  }

  async queueEvent(event) {
    this.eventQueue.push(event);
    
    // Set up batch flush if not already scheduled
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.flushEventQueue();
      }, this.config.batching.flushInterval);
    }

    // Flush immediately if queue is full
    if (this.eventQueue.length >= this.config.batching.maxSize) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
      return await this.flushEventQueue();
    }

    return {
      success: true,
      sent: false,
      queued: true,
      response: { queueSize: this.eventQueue.length }
    };
  }

  async flushEventQueue() {
    if (this.eventQueue.length === 0) {
      return { success: true, sent: 0 };
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    const batch = {
      batchId: this.generateEventId(),
      timestamp: new Date().toISOString(),
      events
    };

    const result = await this.sendBatch(batch);
    
    // Re-queue failed events
    if (!result.success && events.length > 0) {
      this.retryQueue.push({
        event: batch,
        attempts: 0,
        isBatch: true
      });
    }

    return {
      success: result.success,
      sent: events.length,
      response: result.response
    };
  }

  async sendBatch(batch) {
    return new Promise((resolve) => {
      const data = JSON.stringify(batch);
      
      const options = {
        hostname: this.config.dashboard.host,
        port: this.config.dashboard.port,
        path: `${this.config.dashboard.endpoints.events}/batch`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const protocol = this.config.dashboard.protocol === 'https' ? https : http;
      
      const req = protocol.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          const success = res.statusCode >= 200 && res.statusCode < 300;
          resolve({
            success,
            response: {
              statusCode: res.statusCode,
              data: responseData
            }
          });
        });
      });

      req.on('error', (error) => {
        resolve({
          success: false,
          response: { error: error.message }
        });
      });

      req.write(data);
      req.end();
    });
  }

  shouldBatch(eventType) {
    // Critical events should not be batched
    const noBatchTypes = [
      'error',
      'sprint-complete',
      'deployment-success',
      'critical-blocker'
    ];

    return !noBatchTypes.includes(eventType);
  }

  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getSessionId() {
    const sessionPath = path.join(this.projectRoot, 'project-state/current-session.json');
    if (fs.existsSync(sessionPath)) {
      try {
        const session = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
        return session.id;
      } catch (error) {
        // Ignore errors
      }
    }
    return null;
  }

  getProjectId() {
    const statePath = path.join(this.projectRoot, 'project-state/current-state.json');
    if (fs.existsSync(statePath)) {
      try {
        const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        return state.project_id;
      } catch (error) {
        // Ignore errors
      }
    }
    return null;
  }

  // Retry failed events
  async processRetryQueue() {
    if (this.retryQueue.length === 0) return;

    const toRetry = [...this.retryQueue];
    this.retryQueue = [];

    for (const item of toRetry) {
      const delay = this.config.retry.initialDelay * 
                   Math.pow(this.config.retry.backoffMultiplier, item.attempts);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      let result;
      if (item.isBatch) {
        result = await this.sendBatch(item.event);
      } else {
        result = await this.sendEvent(item.event);
      }

      if (!result.success && item.attempts < this.config.retry.maxAttempts) {
        item.attempts++;
        this.retryQueue.push(item);
      }
    }
  }
}

// Global notifier instance for batching
let globalNotifier = null;

function getNotifier() {
  if (!globalNotifier) {
    globalNotifier = new DashboardEventNotifier();
    
    // Set up periodic retry processing
    setInterval(() => {
      globalNotifier.processRetryQueue();
    }, 30000); // Every 30 seconds
  }
  return globalNotifier;
}

if (require.main === module) {
  const notifier = getNotifier();
  notifier.execute()
    .then(result => {
      console.log(JSON.stringify(result));
      // Don't exit immediately to allow batching
      setTimeout(() => process.exit(0), 100);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { DashboardEventNotifier, getNotifier };
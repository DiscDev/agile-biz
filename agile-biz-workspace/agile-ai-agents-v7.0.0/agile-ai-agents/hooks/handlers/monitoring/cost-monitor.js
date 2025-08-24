#!/usr/bin/env node

/**
 * Cost Monitor Hook Handler
 * Monitors token usage and alerts when thresholds are exceeded
 */

const fs = require('fs');
const path = require('path');
const { getNotifier } = require('../dashboard/dashboard-event-notifier');

class CostMonitor {
  constructor() {
    this.context = this.parseContext();
    this.projectRoot = path.join(__dirname, '../../..');
    this.costPath = path.join(this.projectRoot, 'project-state/cost-tracking.json');
    this.config = this.loadConfig();
    this.pricing = this.loadPricing();
  }

  parseContext() {
    return {
      tokens: parseInt(process.env.TOKEN_COUNT || process.argv[2] || '0'),
      model: process.env.MODEL_NAME || 'claude-3-sonnet',
      operation: process.env.OPERATION_TYPE || 'general',
      activeAgent: process.env.ACTIVE_AGENT || 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  loadConfig() {
    return {
      thresholds: {
        warning: 10000,    // 10k tokens
        critical: 50000,   // 50k tokens
        daily: 500000      // 500k tokens per day
      },
      alerts: {
        enabled: true,
        dashboardNotification: true,
        consoleWarning: true,
        logToFile: true
      },
      tracking: {
        granularity: 'hourly', // hourly, daily, per-operation
        retentionDays: 30
      }
    };
  }

  loadPricing() {
    // Token pricing per million tokens
    return {
      'claude-3-opus': {
        input: 15.00,
        output: 75.00
      },
      'claude-3-sonnet': {
        input: 3.00,
        output: 15.00
      },
      'claude-3-haiku': {
        input: 0.25,
        output: 1.25
      },
      'claude-2.1': {
        input: 8.00,
        output: 24.00
      }
    };
  }

  async execute() {
    try {
      const { tokens, model, operation } = this.context;
      
      if (tokens === 0) {
        return { status: 'skipped', reason: 'No tokens to track' };
      }

      // Load or initialize cost tracking
      const costData = this.loadCostData();
      
      // Calculate cost
      const cost = this.calculateCost(tokens, model, operation);
      
      // Update tracking
      this.updateTracking(costData, tokens, cost, operation);
      
      // Check thresholds
      const alerts = this.checkThresholds(costData, tokens);
      
      // Send alerts if needed
      if (alerts.length > 0) {
        await this.sendAlerts(alerts, costData);
      }

      // Save updated data
      this.saveCostData(costData);

      // Generate summary
      const summary = this.generateSummary(costData);

      return {
        status: 'success',
        tokens,
        cost,
        alerts,
        summary
      };

    } catch (error) {
      console.error('Cost monitoring failed:', error);
      throw error;
    }
  }

  loadCostData() {
    if (fs.existsSync(this.costPath)) {
      return JSON.parse(fs.readFileSync(this.costPath, 'utf8'));
    }

    // Initialize new tracking
    return {
      version: '1.0.0',
      created_at: this.context.timestamp,
      last_updated: this.context.timestamp,
      totals: {
        tokens: 0,
        cost: 0,
        operations: 0
      },
      daily: {},
      hourly: {},
      by_agent: {},
      by_operation: {},
      alerts_sent: []
    };
  }

  calculateCost(tokens, model, operation) {
    const pricing = this.pricing[model] || this.pricing['claude-3-sonnet'];
    
    // Estimate input/output ratio based on operation
    const ratios = {
      'code-generation': { input: 0.3, output: 0.7 },
      'analysis': { input: 0.7, output: 0.3 },
      'documentation': { input: 0.4, output: 0.6 },
      'general': { input: 0.5, output: 0.5 }
    };
    
    const ratio = ratios[operation] || ratios.general;
    
    const inputTokens = Math.floor(tokens * ratio.input);
    const outputTokens = Math.floor(tokens * ratio.output);
    
    const inputCost = (inputTokens / 1000000) * pricing.input;
    const outputCost = (outputTokens / 1000000) * pricing.output;
    
    return {
      total: inputCost + outputCost,
      input: inputCost,
      output: outputCost,
      breakdown: {
        inputTokens,
        outputTokens,
        inputRate: pricing.input,
        outputRate: pricing.output
      }
    };
  }

  updateTracking(costData, tokens, cost, operation) {
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];
    const hourKey = `${dateKey}T${now.getHours().toString().padStart(2, '0')}`;
    
    // Update totals
    costData.totals.tokens += tokens;
    costData.totals.cost += cost.total;
    costData.totals.operations++;
    
    // Update daily tracking
    if (!costData.daily[dateKey]) {
      costData.daily[dateKey] = {
        tokens: 0,
        cost: 0,
        operations: 0,
        by_hour: {}
      };
    }
    costData.daily[dateKey].tokens += tokens;
    costData.daily[dateKey].cost += cost.total;
    costData.daily[dateKey].operations++;
    
    // Update hourly tracking
    if (!costData.hourly[hourKey]) {
      costData.hourly[hourKey] = {
        tokens: 0,
        cost: 0,
        operations: 0
      };
    }
    costData.hourly[hourKey].tokens += tokens;
    costData.hourly[hourKey].cost += cost.total;
    costData.hourly[hourKey].operations++;
    
    // Update by agent
    const agent = this.context.activeAgent;
    if (!costData.by_agent[agent]) {
      costData.by_agent[agent] = {
        tokens: 0,
        cost: 0,
        operations: 0
      };
    }
    costData.by_agent[agent].tokens += tokens;
    costData.by_agent[agent].cost += cost.total;
    costData.by_agent[agent].operations++;
    
    // Update by operation
    if (!costData.by_operation[operation]) {
      costData.by_operation[operation] = {
        tokens: 0,
        cost: 0,
        count: 0
      };
    }
    costData.by_operation[operation].tokens += tokens;
    costData.by_operation[operation].cost += cost.total;
    costData.by_operation[operation].count++;
    
    costData.last_updated = this.context.timestamp;
  }

  checkThresholds(costData, currentTokens) {
    const alerts = [];
    const dateKey = new Date().toISOString().split('T')[0];
    const dailyData = costData.daily[dateKey] || { tokens: 0 };
    
    // Check operation threshold
    if (currentTokens >= this.config.thresholds.critical) {
      alerts.push({
        type: 'critical',
        message: `Critical token usage: ${currentTokens.toLocaleString()} tokens in single operation`,
        threshold: this.config.thresholds.critical,
        value: currentTokens
      });
    } else if (currentTokens >= this.config.thresholds.warning) {
      alerts.push({
        type: 'warning',
        message: `High token usage: ${currentTokens.toLocaleString()} tokens in single operation`,
        threshold: this.config.thresholds.warning,
        value: currentTokens
      });
    }
    
    // Check daily threshold
    if (dailyData.tokens >= this.config.thresholds.daily) {
      alerts.push({
        type: 'critical',
        message: `Daily token limit exceeded: ${dailyData.tokens.toLocaleString()} tokens today`,
        threshold: this.config.thresholds.daily,
        value: dailyData.tokens
      });
    } else if (dailyData.tokens >= this.config.thresholds.daily * 0.8) {
      alerts.push({
        type: 'warning',
        message: `Approaching daily token limit: ${dailyData.tokens.toLocaleString()} tokens (80% of limit)`,
        threshold: this.config.thresholds.daily,
        value: dailyData.tokens
      });
    }
    
    // Check cost thresholds
    const dailyCost = dailyData.cost || 0;
    if (dailyCost >= 10) {
      alerts.push({
        type: 'warning',
        message: `High daily cost: $${dailyCost.toFixed(2)}`,
        costAlert: true,
        value: dailyCost
      });
    }
    
    return alerts;
  }

  async sendAlerts(alerts, costData) {
    for (const alert of alerts) {
      // Console warning
      if (this.config.alerts.consoleWarning) {
        const icon = alert.type === 'critical' ? '🚨' : '⚠️';
        console.warn(`${icon} [Cost Monitor] ${alert.message}`);
      }
      
      // Log to file
      if (this.config.alerts.logToFile) {
        this.logAlert(alert);
      }
      
      // Dashboard notification
      if (this.config.alerts.dashboardNotification) {
        await this.notifyDashboard(alert, costData);
      }
      
      // Track sent alerts to avoid duplicates
      const alertKey = `${alert.type}-${alert.message.substring(0, 50)}`;
      if (!costData.alerts_sent.includes(alertKey)) {
        costData.alerts_sent.push(alertKey);
        
        // Keep only recent alerts
        if (costData.alerts_sent.length > 100) {
          costData.alerts_sent = costData.alerts_sent.slice(-50);
        }
      }
    }
  }

  logAlert(alert) {
    const logPath = path.join(this.projectRoot, 'logs/cost-alerts.log');
    const logEntry = {
      timestamp: this.context.timestamp,
      type: alert.type,
      message: alert.message,
      value: alert.value,
      agent: this.context.activeAgent
    };
    
    const logDir = path.dirname(logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
  }

  async notifyDashboard(alert, costData) {
    try {
      const notifier = getNotifier();
      const eventData = {
        alert,
        currentUsage: {
          daily: costData.daily[new Date().toISOString().split('T')[0]] || {},
          total: costData.totals
        },
        topAgents: this.getTopAgents(costData),
        timestamp: this.context.timestamp
      };
      
      await notifier.execute({
        eventType: 'cost-alert',
        eventData,
        hookName: 'cost-monitor'
      });
    } catch (error) {
      console.error('Failed to notify dashboard:', error);
    }
  }

  generateSummary(costData) {
    const dateKey = new Date().toISOString().split('T')[0];
    const dailyData = costData.daily[dateKey] || { tokens: 0, cost: 0 };
    
    return {
      current_operation: {
        tokens: this.context.tokens,
        cost: this.calculateCost(this.context.tokens, this.context.model, this.context.operation).total,
        agent: this.context.activeAgent
      },
      daily: {
        tokens: dailyData.tokens,
        cost: dailyData.cost,
        operations: dailyData.operations || 0,
        remaining: Math.max(0, this.config.thresholds.daily - dailyData.tokens)
      },
      totals: {
        tokens: costData.totals.tokens,
        cost: costData.totals.cost,
        operations: costData.totals.operations,
        average_per_operation: costData.totals.operations > 0 ? 
          Math.round(costData.totals.tokens / costData.totals.operations) : 0
      },
      top_consumers: this.getTopAgents(costData).slice(0, 3)
    };
  }

  getTopAgents(costData) {
    return Object.entries(costData.by_agent)
      .map(([agent, data]) => ({
        agent,
        tokens: data.tokens,
        cost: data.cost,
        percentage: (data.tokens / costData.totals.tokens * 100).toFixed(1)
      }))
      .sort((a, b) => b.tokens - a.tokens);
  }

  saveCostData(costData) {
    // Clean up old data based on retention
    this.cleanupOldData(costData);
    
    // Ensure state directory exists
    const stateDir = path.dirname(this.costPath);
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }
    
    fs.writeFileSync(this.costPath, JSON.stringify(costData, null, 2));
  }

  cleanupOldData(costData) {
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - this.config.tracking.retentionDays);
    const retentionKey = retentionDate.toISOString().split('T')[0];
    
    // Clean daily data
    Object.keys(costData.daily).forEach(dateKey => {
      if (dateKey < retentionKey) {
        delete costData.daily[dateKey];
      }
    });
    
    // Clean hourly data
    Object.keys(costData.hourly).forEach(hourKey => {
      if (hourKey.split('T')[0] < retentionKey) {
        delete costData.hourly[hourKey];
      }
    });
  }
}

if (require.main === module) {
  const monitor = new CostMonitor();
  monitor.execute()
    .then(result => {
      console.log(JSON.stringify(result));
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = CostMonitor;
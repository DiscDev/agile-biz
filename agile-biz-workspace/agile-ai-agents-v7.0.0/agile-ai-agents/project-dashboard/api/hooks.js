const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Paths to hook system files
const HOOK_CONFIG_PATH = path.join(__dirname, '../../hooks/config/hook-config.json');
const HOOK_REGISTRY_PATH = path.join(__dirname, '../../hooks/registry/hook-registry.json');
const PERFORMANCE_PATH = path.join(__dirname, '../../hooks/metrics/performance.json');
const HOOK_MANAGER_PATH = path.join(__dirname, '../../hooks/hook-manager.js');
const AGENT_DEFAULTS_PATH = path.join(__dirname, '../../hooks/config/agent-hooks/agent-defaults.json');

// Get hook configuration
router.get('/config', (req, res) => {
  try {
    const config = JSON.parse(fs.readFileSync(HOOK_CONFIG_PATH, 'utf8'));
    res.json(config);
  } catch (error) {
    console.error('Failed to load hook configuration:', error);
    res.status(500).json({ error: 'Failed to load configuration' });
  }
});

// Update hook configuration
router.put('/config', (req, res) => {
  try {
    const currentConfig = JSON.parse(fs.readFileSync(HOOK_CONFIG_PATH, 'utf8'));
    const updatedConfig = { ...currentConfig, ...req.body };
    
    // Validate configuration
    if (!validateConfig(updatedConfig)) {
      return res.status(400).json({ error: 'Invalid configuration' });
    }
    
    // Save configuration
    fs.writeFileSync(HOOK_CONFIG_PATH, JSON.stringify(updatedConfig, null, 2));
    
    // Reload hook manager if available
    reloadHookManager();
    
    res.json(updatedConfig);
  } catch (error) {
    console.error('Failed to update hook configuration:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// Get hook registry
router.get('/registry', (req, res) => {
  try {
    const registry = JSON.parse(fs.readFileSync(HOOK_REGISTRY_PATH, 'utf8'));
    res.json(registry);
  } catch (error) {
    console.error('Failed to load hook registry:', error);
    res.status(500).json({ error: 'Failed to load registry' });
  }
});

// Get agent hook defaults
router.get('/agent-defaults', (req, res) => {
  try {
    if (!fs.existsSync(AGENT_DEFAULTS_PATH)) {
      return res.json({
        profiles: {
          minimal: { enabledByDefault: [] },
          standard: { enabledByDefault: [] },
          advanced: { enabledByDefault: [] },
          custom: { enabledByDefault: [] }
        },
        hooks: {}
      });
    }
    
    const defaults = JSON.parse(fs.readFileSync(AGENT_DEFAULTS_PATH, 'utf8'));
    res.json(defaults);
  } catch (error) {
    console.error('Failed to load agent defaults:', error);
    res.status(500).json({ error: 'Failed to load agent defaults' });
  }
});

// Get performance metrics
router.get('/performance', (req, res) => {
  try {
    if (!fs.existsSync(PERFORMANCE_PATH)) {
      return res.json({
        summary: { totalExecutions: 0, avgTime: 0 },
        hooks: {},
        topSlowest: [],
        topFastest: []
      });
    }
    
    const performance = JSON.parse(fs.readFileSync(PERFORMANCE_PATH, 'utf8'));
    
    // Generate performance report
    const report = generatePerformanceReport(performance);
    res.json(report);
  } catch (error) {
    console.error('Failed to load performance metrics:', error);
    res.status(500).json({ error: 'Failed to load performance metrics' });
  }
});

// Reset performance metrics
router.post('/performance/reset', (req, res) => {
  try {
    const emptyMetrics = {
      hooks: {},
      summary: {
        totalExecutions: 0,
        totalTime: 0,
        avgTime: 0
      }
    };
    
    fs.writeFileSync(PERFORMANCE_PATH, JSON.stringify(emptyMetrics, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to reset performance metrics:', error);
    res.status(500).json({ error: 'Failed to reset metrics' });
  }
});

// Test a specific hook
router.post('/test/:hookName', async (req, res) => {
  try {
    const { hookName } = req.params;
    const testData = req.body;
    
    // Import and execute hook manager
    const HookManager = require(HOOK_MANAGER_PATH);
    const result = await HookManager.executeHook(hookName, testData);
    
    res.json(result);
  } catch (error) {
    console.error('Failed to test hook:', error);
    res.status(500).json({ error: 'Failed to test hook', details: error.message });
  }
});

// Enable/disable specific hook
router.patch('/hooks/:hookName', (req, res) => {
  try {
    const { hookName } = req.params;
    const { enabled } = req.body;
    
    const config = JSON.parse(fs.readFileSync(HOOK_CONFIG_PATH, 'utf8'));
    
    if (!config.hooks) {
      config.hooks = {};
    }
    
    if (!config.hooks[hookName]) {
      config.hooks[hookName] = {};
    }
    
    config.hooks[hookName].enabled = enabled;
    
    fs.writeFileSync(HOOK_CONFIG_PATH, JSON.stringify(config, null, 2));
    reloadHookManager();
    
    res.json({ success: true, hookName, enabled });
  } catch (error) {
    console.error('Failed to update hook status:', error);
    res.status(500).json({ error: 'Failed to update hook status' });
  }
});

// Get hook execution history
router.get('/history', (req, res) => {
  try {
    const { limit = 100, hookName } = req.query;
    const logPath = path.join(__dirname, '../../logs/hooks.log');
    
    if (!fs.existsSync(logPath)) {
      return res.json({ history: [] });
    }
    
    const logs = fs.readFileSync(logPath, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(log => log !== null);
    
    let filtered = logs;
    if (hookName) {
      filtered = logs.filter(log => log.data?.hookName === hookName);
    }
    
    const history = filtered
      .slice(-limit)
      .reverse();
    
    res.json({ history });
  } catch (error) {
    console.error('Failed to load hook history:', error);
    res.status(500).json({ error: 'Failed to load history' });
  }
});

// Real-time hook events (SSE)
router.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send initial connection message
  res.write('data: {"type": "connected"}\n\n');
  
  // Set up event listener for hook events
  const HookManager = require(HOOK_MANAGER_PATH);
  
  const eventHandler = (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };
  
  HookManager.on('hook:start', eventHandler);
  HookManager.on('hook:complete', eventHandler);
  HookManager.on('hook:failure', eventHandler);
  
  // Clean up on client disconnect
  req.on('close', () => {
    HookManager.off('hook:start', eventHandler);
    HookManager.off('hook:complete', eventHandler);
    HookManager.off('hook:failure', eventHandler);
  });
});

// Get Claude settings
router.get('/claude-settings', (req, res) => {
  try {
    const ClaudeHookBridge = require('../../hooks/claude-hook-bridge');
    const bridge = new ClaudeHookBridge();
    const settings = bridge.loadSettings();
    const status = bridge.getStatus();
    
    res.json({
      settings,
      status
    });
  } catch (error) {
    console.error('Failed to load Claude settings:', error);
    res.status(500).json({ error: 'Failed to load Claude settings' });
  }
});

// Update Claude settings
router.put('/claude-settings', (req, res) => {
  try {
    const ClaudeHookBridge = require('../../hooks/claude-hook-bridge');
    const bridge = new ClaudeHookBridge();
    
    // Handle specific updates
    if (req.body.enabled !== undefined) {
      bridge.setHooksEnabled(req.body.enabled);
    }
    
    if (req.body.syncEnabled !== undefined) {
      bridge.setSyncEnabled(req.body.syncEnabled);
    }
    
    if (req.body.profile) {
      bridge.setProfile(req.body.profile);
    }
    
    // Return updated status
    const status = bridge.getStatus();
    res.json({ success: true, status });
  } catch (error) {
    console.error('Failed to update Claude settings:', error);
    res.status(500).json({ error: 'Failed to update Claude settings' });
  }
});

// Helper functions

function validateConfig(config) {
  // Basic validation
  if (typeof config.enabled !== 'boolean') return false;
  if (!['minimal', 'standard', 'advanced', 'custom'].includes(config.profile)) return false;
  if (!config.performance || typeof config.performance.timeout !== 'number') return false;
  
  return true;
}

function reloadHookManager() {
  try {
    // Clear require cache
    delete require.cache[require.resolve(HOOK_MANAGER_PATH)];
    
    // Reload hook manager
    const HookManager = require(HOOK_MANAGER_PATH);
    console.log('Hook manager reloaded with new configuration');
  } catch (error) {
    console.error('Failed to reload hook manager:', error);
  }
}

function generatePerformanceReport(metrics) {
  const report = {
    summary: metrics.summary || {
      totalExecutions: 0,
      totalTime: 0,
      avgTime: 0
    },
    hooks: metrics.hooks || {},
    topSlowest: [],
    topFastest: [],
    mostExecuted: [],
    failureRate: {}
  };
  
  // Sort hooks by various metrics
  const hookArray = Object.entries(report.hooks);
  
  // Top 5 slowest
  report.topSlowest = hookArray
    .filter(([_, data]) => data.avgTime > 0)
    .sort((a, b) => b[1].avgTime - a[1].avgTime)
    .slice(0, 5)
    .map(([name, data]) => ({
      name,
      avgTime: data.avgTime,
      maxTime: data.maxTime
    }));
  
  // Top 5 fastest
  report.topFastest = hookArray
    .filter(([_, data]) => data.avgTime > 0)
    .sort((a, b) => a[1].avgTime - b[1].avgTime)
    .slice(0, 5)
    .map(([name, data]) => ({
      name,
      avgTime: data.avgTime,
      minTime: data.minTime
    }));
  
  // Most executed
  report.mostExecuted = hookArray
    .sort((a, b) => b[1].executions - a[1].executions)
    .slice(0, 5)
    .map(([name, data]) => ({
      name,
      executions: data.executions,
      totalTime: data.totalTime
    }));
  
  // Failure rates
  hookArray.forEach(([name, data]) => {
    if (data.failures > 0) {
      report.failureRate[name] = {
        rate: ((data.failures / data.executions) * 100).toFixed(2) + '%',
        failures: data.failures,
        total: data.executions
      };
    }
  });
  
  return report;
}

module.exports = router;
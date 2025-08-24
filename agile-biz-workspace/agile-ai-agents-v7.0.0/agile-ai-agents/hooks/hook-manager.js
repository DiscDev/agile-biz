#!/usr/bin/env node

/**
 * AgileAiAgents Hook Manager
 * Central orchestrator for all Claude Code hooks
 * Manages execution, monitoring, and failure handling
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const EventEmitter = require('events');

class HookManager extends EventEmitter {
  constructor() {
    super();
    this.hooks = {};
    this.performance = {};
    this.failureQueue = [];
    this.config = this.loadConfig();
    this.activeAgent = null;
    this.workflowState = null;
    
    // Auto-initialize hooks from registry
    this.initializeHooks();
  }

  /**
   * Load hook configuration
   */
  loadConfig() {
    const configPath = path.join(__dirname, 'config', 'hook-config.json');
    const defaultConfig = {
      enabled: true,
      profile: 'standard',
      performance: {
        timeout: 5000,
        warningThreshold: 1000,
        maxRetries: 3
      },
      logging: {
        level: 'info',
        file: 'hooks.log'
      }
    };

    let config = defaultConfig;
    if (fs.existsSync(configPath)) {
      config = { ...defaultConfig, ...JSON.parse(fs.readFileSync(configPath, 'utf8')) };
    }
    
    // Check Claude settings for master control
    try {
      const ClaudeHookBridge = require('./claude-hook-bridge');
      const bridge = new ClaudeHookBridge();
      const settings = bridge.loadSettings();
      
      // Claude settings override AgileAiAgents settings
      if (settings?.hookSettings?.enabled === false) {
        config.enabled = false;
        this.log('info', 'Hooks disabled by Claude settings');
      }
    } catch (error) {
      // If bridge not available, continue with normal config
      this.log('debug', 'Claude hook bridge not available', { error: error.message });
    }
    
    return config;
  }

  /**
   * Initialize hooks from registry
   */
  initializeHooks() {
    try {
      const registryPath = path.join(__dirname, 'registry', 'hook-registry.json');
      if (fs.existsSync(registryPath)) {
        const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
        
        // Register all hooks
        for (const [name, config] of Object.entries(registry.hooks)) {
          this.registerHook(name, config);
        }
        
        this.log('debug', `Auto-initialized ${Object.keys(registry.hooks).length} hooks from registry`);
      }
    } catch (error) {
      this.log('error', 'Failed to auto-initialize hooks', { error: error.message });
    }
  }

  /**
   * Register a hook
   */
  registerHook(name, config) {
    this.hooks[name] = {
      ...config,
      executions: 0,
      failures: 0,
      totalTime: 0
    };
  }

  /**
   * Execute a hook with full error handling and monitoring
   */
  async executeHook(hookName, context = {}) {
    if (!this.config.enabled) {
      return { status: 'disabled' };
    }

    const hook = this.hooks[hookName];
    if (!hook) {
      this.log('error', `Unknown hook: ${hookName}`);
      return { status: 'error', error: 'Unknown hook' };
    }

    const startTime = Date.now();
    const executionId = `${hookName}-${startTime}`;

    try {
      // Check if hook should run based on conditions
      if (!this.shouldExecuteHook(hook, context)) {
        return { status: 'skipped', reason: 'Conditions not met' };
      }

      // Log execution start
      this.log('debug', `Executing hook: ${hookName}`, context);
      this.emit('hook:start', { hookName, context, executionId });

      // Execute with timeout
      const result = await this.executeWithTimeout(
        hook,
        context,
        this.config.performance.timeout
      );

      // Update metrics
      const duration = Date.now() - startTime;
      this.updateMetrics(hookName, duration, true);

      // Check performance
      if (duration > this.config.performance.warningThreshold) {
        this.log('warn', `Slow hook execution: ${hookName} took ${duration}ms`);
      }

      this.emit('hook:complete', { hookName, context, executionId, duration, result });
      return { status: 'success', result, duration };

    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateMetrics(hookName, duration, false);
      
      // Handle failure based on hook priority
      return await this.handleFailure(hookName, error, context);
    }
  }

  /**
   * Check if hook should execute based on conditions
   */
  shouldExecuteHook(hook, context) {
    if (hook.conditions) {
      // Check agent condition
      if (hook.conditions.if_agent && 
          !hook.conditions.if_agent.includes(context.activeAgent)) {
        return false;
      }

      // Check file pattern
      if (hook.conditions.if_file_matches && context.filePath) {
        const pattern = new RegExp(hook.conditions.if_file_matches);
        if (!pattern.test(context.filePath)) {
          return false;
        }
      }

      // Check workflow phase
      if (hook.conditions.if_sprint_phase && 
          hook.conditions.if_sprint_phase !== context.sprintPhase) {
        return false;
      }
    }

    return true;
  }

  /**
   * Execute hook with timeout protection
   */
  async executeWithTimeout(hook, context, timeout) {
    return new Promise((resolve, reject) => {
      let completed = false;
      
      // Set timeout
      const timer = setTimeout(() => {
        if (!completed) {
          completed = true;
          reject(new Error(`Hook timeout after ${timeout}ms`));
        }
      }, timeout);

      // Execute hook
      this.runHookCommand(hook, context)
        .then(result => {
          if (!completed) {
            completed = true;
            clearTimeout(timer);
            resolve(result);
          }
        })
        .catch(error => {
          if (!completed) {
            completed = true;
            clearTimeout(timer);
            reject(error);
          }
        });
    });
  }

  /**
   * Run the actual hook command
   */
  async runHookCommand(hook, context) {
    return new Promise((resolve, reject) => {
      const env = {
        ...process.env,
        HOOK_CONTEXT: JSON.stringify(context),
        ACTIVE_AGENT: context.activeAgent || '',
        FILE_PATH: context.filePath || '',
        WORKFLOW_STATE: JSON.stringify(this.workflowState || {}),
        AGILE_AI_AGENTS_PATH: path.join(__dirname, '..')
      };

      // Handle handler-based hooks
      let command, args;
      if (hook.handler) {
        // Execute the handler script directly
        command = 'node';
        args = [path.join(__dirname, hook.handler)];
      } else if (hook.command) {
        // Legacy command-based hooks
        command = hook.command.split(' ')[0];
        args = hook.command.split(' ').slice(1);
      } else {
        reject(new Error('Hook has no handler or command defined'));
        return;
      }

      const child = spawn(command, args, { env });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr, code });
        } else {
          reject(new Error(`Hook failed with code ${code}: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Handle hook failure based on priority
   */
  async handleFailure(hookName, error, context) {
    const hook = this.hooks[hookName];
    
    this.log('error', `Hook failed: ${hookName}`, { error: error.message });
    this.emit('hook:failure', { hookName, error, context });

    // Check if this is a critical hook
    if (hook.priority === 'critical') {
      // Retry critical hooks
      if (hook.retries < this.config.performance.maxRetries) {
        hook.retries = (hook.retries || 0) + 1;
        this.log('info', `Retrying critical hook: ${hookName} (attempt ${hook.retries})`);
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, hook.retries) * 1000)
        );
        
        return this.executeHook(hookName, context);
      } else {
        // Queue for later retry
        this.queueFailedHook(hookName, context);
      }
    }

    return { status: 'failed', error: error.message };
  }

  /**
   * Queue failed hook for later retry
   */
  queueFailedHook(hookName, context) {
    this.failureQueue.push({
      hookName,
      context,
      timestamp: Date.now(),
      retries: 0
    });

    this.log('info', `Queued failed hook: ${hookName}`);
  }

  /**
   * Process queued failed hooks
   */
  async processFailureQueue() {
    const queue = [...this.failureQueue];
    this.failureQueue = [];

    for (const item of queue) {
      if (item.retries < this.config.performance.maxRetries) {
        item.retries++;
        const result = await this.executeHook(item.hookName, item.context);
        
        if (result.status === 'failed') {
          this.failureQueue.push(item);
        }
      } else {
        this.log('error', `Giving up on hook after max retries: ${item.hookName}`);
      }
    }
  }

  /**
   * Update hook performance metrics
   */
  updateMetrics(hookName, duration, success) {
    const hook = this.hooks[hookName];
    hook.executions++;
    hook.totalTime += duration;
    
    if (!success) {
      hook.failures++;
    }

    // Update average execution time
    hook.avgTime = Math.round(hook.totalTime / hook.executions);
    
    // Auto-disable slow hooks
    if (hook.avgTime > this.config.performance.timeout * 0.8 && 
        hook.executions > 5) {
      this.log('warn', `Disabling slow hook: ${hookName} (avg ${hook.avgTime}ms)`);
      hook.disabled = true;
    }
  }

  /**
   * Get hook performance report
   */
  getPerformanceReport() {
    const report = {
      summary: {
        totalHooks: Object.keys(this.hooks).length,
        totalExecutions: 0,
        totalFailures: 0,
        avgExecutionTime: 0
      },
      hooks: {}
    };

    for (const [name, hook] of Object.entries(this.hooks)) {
      report.summary.totalExecutions += hook.executions;
      report.summary.totalFailures += hook.failures;
      
      report.hooks[name] = {
        executions: hook.executions,
        failures: hook.failures,
        avgTime: hook.avgTime || 0,
        successRate: hook.executions > 0 
          ? ((hook.executions - hook.failures) / hook.executions * 100).toFixed(2) + '%'
          : 'N/A'
      };
    }

    if (report.summary.totalExecutions > 0) {
      const totalTime = Object.values(this.hooks)
        .reduce((sum, hook) => sum + hook.totalTime, 0);
      report.summary.avgExecutionTime = 
        Math.round(totalTime / report.summary.totalExecutions);
    }

    return report;
  }

  /**
   * Set active agent context
   */
  setActiveAgent(agentName) {
    this.activeAgent = agentName;
    this.emit('context:agent', { agent: agentName });
  }

  /**
   * Update workflow state
   */
  updateWorkflowState(state) {
    this.workflowState = state;
    this.emit('context:workflow', { state });
  }

  /**
   * Logging utility
   */
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    // Console output based on level
    if (this.config.logging.level === 'debug' || 
        ['error', 'warn'].includes(level)) {
      console.log(`[Hook Manager] ${level.toUpperCase()}: ${message}`, data);
    }

    // File logging
    if (this.config.logging.file) {
      const logPath = path.join(__dirname, '..', 'logs', this.config.logging.file);
      fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
    }

    this.emit('log', logEntry);
  }

  /**
   * Enable/disable hooks globally
   */
  setEnabled(enabled) {
    this.config.enabled = enabled;
    this.log('info', `Hooks ${enabled ? 'enabled' : 'disabled'} globally`);
  }

  /**
   * Set hook profile
   */
  setProfile(profileName) {
    this.config.profile = profileName;
    this.log('info', `Hook profile set to: ${profileName}`);
    this.loadProfileHooks(profileName);
  }

  /**
   * Load hooks for a specific profile
   */
  loadProfileHooks(profileName) {
    const profilePath = path.join(__dirname, 'config', `profile-${profileName}.json`);
    if (fs.existsSync(profilePath)) {
      const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
      
      // Clear existing hooks
      this.hooks = {};
      
      // Load profile hooks
      for (const [name, config] of Object.entries(profile.hooks)) {
        this.registerHook(name, config);
      }
    }
  }
}

// Create singleton instance
const hookManager = new HookManager();

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'init':
      console.log('[Hook Manager] Initializing hook system...');
      
      // Load all hooks from registry
      const registryPath = path.join(__dirname, 'registry', 'hook-registry.json');
      if (fs.existsSync(registryPath)) {
        const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
        
        // Register all hooks
        for (const [name, config] of Object.entries(registry.hooks)) {
          hookManager.registerHook(name, config);
          console.log(`[Hook Manager] Registered hook: ${name}`);
        }
        
        console.log(`[Hook Manager] Initialized ${Object.keys(registry.hooks).length} hooks`);
      } else {
        console.error('[Hook Manager] ERROR: Registry not found');
        process.exit(1);
      }
      break;
      
    case 'execute':
      const hookName = process.argv[3];
      const contextData = process.argv[4] ? JSON.parse(process.argv[4]) : {};
      
      hookManager.executeHook(hookName, contextData)
        .then(result => {
          console.log(`[Hook Manager] Hook ${hookName} executed:`, result);
        })
        .catch(error => {
          console.error(`[Hook Manager] Hook ${hookName} failed:`, error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Hook Manager CLI');
      console.log('================');
      console.log('Usage:');
      console.log('  node hook-manager.js init              - Initialize hook system');
      console.log('  node hook-manager.js execute <hook> [data] - Execute specific hook');
  }
}

// Export singleton instance
module.exports = hookManager;
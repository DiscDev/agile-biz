/**
 * Routing Messages for Multi-LLM Support
 * Provides clear, informative messages for all routing scenarios
 * Ensures users understand what's happening during model routing
 */

class RoutingMessages {
  constructor() {
    this.messageHistory = [];
    this.verbosity = 'normal'; // quiet, normal, verbose, debug
  }

  /**
   * Set verbosity level
   */
  setVerbosity(level) {
    this.verbosity = level;
  }

  /**
   * Get message for service detection
   */
  getDetectionMessage(services, strategy) {
    const messages = {
      zen_enabled: {
        emoji: '🚀',
        title: 'Full Multi-Model Optimization Available',
        description: 'All services configured for maximum performance',
        details: [
          '✅ Zen MCP installed and configured',
          '✅ Multiple external models available',
          '✅ Parallel execution enabled',
          '📊 Expected: 75% faster, 70% cheaper'
        ],
        color: 'green'
      },
      hybrid: {
        emoji: '⚡',
        title: 'Partial Optimization Available',
        description: 'Some external services configured',
        details: [
          '✅ Claude API available',
          `✅ ${this.countAvailableServices(services)} external services configured`,
          '📊 Expected: 40-50% faster, 30-40% cheaper',
          '💡 Add Zen MCP for full optimization'
        ],
        color: 'yellow'
      },
      claude_native: {
        emoji: '🔷',
        title: 'Claude-Only Mode Active',
        description: 'Running with Claude models only (fully functional)',
        details: [
          '✅ Claude API configured and ready',
          '⚪ No external services configured',
          '📊 Standard performance and costs',
          '💡 Configure external services for optimization'
        ],
        color: 'blue'
      }
    };

    return this.formatMessage(messages[strategy] || messages.claude_native);
  }

  /**
   * Get message for routing start
   */
  getRoutingStartMessage(task, level, strategy) {
    const speedBoost = {
      zen_enabled: '75% faster',
      hybrid: '40% faster',
      claude_native: 'standard speed'
    };

    const message = {
      emoji: '🔄',
      title: `Starting ${task}`,
      description: `Research level: ${level} | Strategy: ${strategy}`,
      details: [
        `📊 Performance mode: ${speedBoost[strategy]}`,
        `🎯 Document target: ${this.getDocumentCount(level)}`,
        `⏱️ Estimated time: ${this.getTimeEstimate(level, strategy)}`
      ]
    };

    return this.formatMessage(message);
  }

  /**
   * Get message for model attempt
   */
  getModelAttemptMessage(model, via, attemptNumber) {
    if (this.verbosity === 'quiet') return null;

    const viaDescriptions = {
      zen: 'via Zen MCP',
      direct: 'via direct API',
      claude: 'via Claude API'
    };

    const message = {
      emoji: attemptNumber === 1 ? '🎯' : '🔄',
      title: attemptNumber === 1 ? `Trying ${model}` : `Fallback to ${model}`,
      description: viaDescriptions[via] || via,
      compact: true
    };

    return this.formatMessage(message);
  }

  /**
   * Get message for fallback event
   */
  getFallbackMessage(fromModel, toModel, reason) {
    const reasons = {
      unavailable: 'Service temporarily unavailable',
      rate_limit: 'Rate limit reached',
      timeout: 'Request timeout',
      error: 'Unexpected error',
      quality: 'Quality check failed'
    };

    const message = {
      emoji: '↩️',
      title: 'Switching Models',
      description: `${fromModel} → ${toModel}`,
      details: [
        `Reason: ${reasons[reason] || reason}`,
        'Continuing with fallback model...'
      ],
      color: 'yellow'
    };

    if (this.verbosity === 'quiet') {
      return `↩️ ${fromModel} → ${toModel}`;
    }

    return this.formatMessage(message);
  }

  /**
   * Get message for success
   */
  getSuccessMessage(model, via, metrics) {
    const message = {
      emoji: '✅',
      title: `Completed with ${model}`,
      description: via === 'claude' ? 'Claude-native execution' : `Optimized via ${via}`,
      details: []
    };

    if (metrics && this.verbosity !== 'quiet') {
      message.details.push(
        `⏱️ Time: ${metrics.time}`,
        `💰 Cost: $${metrics.cost}`,
        `📊 Tokens: ${metrics.tokens}`
      );

      if (metrics.savedVsClaude) {
        message.details.push(
          `💵 Saved: $${metrics.savedVsClaude} vs Claude-only`
        );
      }
    }

    return this.formatMessage(message);
  }

  /**
   * Get message for complete failure
   */
  getFailureMessage(task, lastError) {
    const message = {
      emoji: '❌',
      title: `Failed to complete ${task}`,
      description: 'All models in fallback chain exhausted',
      details: [
        `Last error: ${lastError}`,
        '🔧 Troubleshooting:',
        '  1. Check API keys in .env file',
        '  2. Verify network connectivity',
        '  3. Check service status pages',
        '  4. Review error logs'
      ],
      color: 'red'
    };

    return this.formatMessage(message);
  }

  /**
   * Get message for degraded performance
   */
  getDegradedMessage(reason, impact) {
    const message = {
      emoji: '⚠️',
      title: 'Performance Degraded',
      description: reason,
      details: [
        `Impact: ${impact}`,
        'System continuing with reduced performance',
        'Quality maintained through validation'
      ],
      color: 'yellow'
    };

    return this.formatMessage(message);
  }

  /**
   * Get message for optimization suggestion
   */
  getOptimizationMessage(current, potential, howTo) {
    if (this.verbosity === 'quiet') return null;

    const message = {
      emoji: '💡',
      title: 'Performance Optimization Available',
      description: `Current: ${current} → Potential: ${potential}`,
      details: [
        'How to enable:',
        ...howTo.map(step => `  ${step}`)
      ],
      color: 'cyan'
    };

    return this.formatMessage(message);
  }

  /**
   * Get message for cost alert
   */
  getCostAlertMessage(current, limit, action) {
    const severity = current / limit;
    
    const message = {
      emoji: severity > 0.9 ? '🚨' : '⚠️',
      title: severity > 0.9 ? 'Cost Limit Warning' : 'Cost Alert',
      description: `Session cost: $${current.toFixed(2)} / $${limit.toFixed(2)}`,
      details: [
        `Usage: ${(severity * 100).toFixed(0)}% of limit`,
        `Action: ${action}`
      ],
      color: severity > 0.9 ? 'red' : 'yellow'
    };

    return this.formatMessage(message);
  }

  /**
   * Get recovery message
   */
  getRecoveryMessage(service, action) {
    const message = {
      emoji: '🔧',
      title: 'Automatic Recovery',
      description: `${service} connection restored`,
      details: [
        `Action: ${action}`,
        'Performance returning to optimal levels'
      ],
      color: 'green'
    };

    return this.formatMessage(message);
  }

  /**
   * Format message based on verbosity
   */
  formatMessage(message) {
    if (!message) return null;

    // Store in history
    this.messageHistory.push({
      timestamp: new Date().toISOString(),
      ...message
    });

    // Format based on verbosity
    switch (this.verbosity) {
      case 'quiet':
        return message.compact ? 
          `${message.emoji} ${message.title}` : null;
      
      case 'normal':
        return this.formatNormal(message);
      
      case 'verbose':
        return this.formatVerbose(message);
      
      case 'debug':
        return this.formatDebug(message);
      
      default:
        return this.formatNormal(message);
    }
  }

  /**
   * Format normal message
   */
  formatNormal(message) {
    let output = `${message.emoji} ${message.title}`;
    
    if (message.description) {
      output += `\n   ${message.description}`;
    }
    
    if (message.details && message.details.length > 0) {
      // Show first 2 details in normal mode
      message.details.slice(0, 2).forEach(detail => {
        output += `\n   ${detail}`;
      });
    }
    
    return output;
  }

  /**
   * Format verbose message
   */
  formatVerbose(message) {
    let output = `${message.emoji} ${message.title}`;
    
    if (message.description) {
      output += `\n   ${message.description}`;
    }
    
    if (message.details && message.details.length > 0) {
      message.details.forEach(detail => {
        output += `\n   ${detail}`;
      });
    }
    
    return output;
  }

  /**
   * Format debug message
   */
  formatDebug(message) {
    const timestamp = new Date().toISOString();
    let output = `[${timestamp}] ${message.emoji} ${message.title}`;
    
    if (message.description) {
      output += `\n   ${message.description}`;
    }
    
    if (message.details && message.details.length > 0) {
      output += '\n   Details:';
      message.details.forEach(detail => {
        output += `\n     - ${detail}`;
      });
    }
    
    if (message.color) {
      output += `\n   [Color: ${message.color}]`;
    }
    
    return output;
  }

  /**
   * Helper: Count available services
   */
  countAvailableServices(services) {
    return Object.values(services).filter(v => v).length - 1; // Exclude Claude
  }

  /**
   * Helper: Get document count for level
   */
  getDocumentCount(level) {
    const counts = {
      minimal: '5 documents',
      medium: '48 documents',
      thorough: '194 documents'
    };
    return counts[level] || 'Unknown';
  }

  /**
   * Helper: Get time estimate
   */
  getTimeEstimate(level, strategy) {
    const baseTime = {
      minimal: '1-2 hours',
      medium: '3-5 hours',
      thorough: '6-10 hours'
    };
    
    const enhanced = {
      minimal: '15-30 minutes',
      medium: '45-75 minutes',
      thorough: '1.5-2.5 hours'
    };
    
    if (strategy === 'zen_enabled') {
      return `${enhanced[level]} (vs ${baseTime[level]})`;
    } else if (strategy === 'hybrid') {
      return `~${this.halfTime(baseTime[level])} (vs ${baseTime[level]})`;
    }
    
    return baseTime[level];
  }

  /**
   * Helper: Calculate half time
   */
  halfTime(timeRange) {
    const match = timeRange.match(/(\d+)-(\d+) hours/);
    if (match) {
      const min = parseInt(match[1]) / 2;
      const max = parseInt(match[2]) / 2;
      return `${min}-${max} hours`;
    }
    return timeRange;
  }

  /**
   * Get message history
   */
  getHistory(limit = 10) {
    return this.messageHistory.slice(-limit);
  }

  /**
   * Clear message history
   */
  clearHistory() {
    this.messageHistory = [];
  }
}

// Export for use in other modules
module.exports = RoutingMessages;

// Test messages if called directly
if (require.main === module) {
  const messages = new RoutingMessages();
  
  console.log('🧪 Testing Routing Messages\n');
  console.log('='.repeat(60) + '\n');
  
  // Test different verbosity levels
  ['quiet', 'normal', 'verbose', 'debug'].forEach(level => {
    console.log(`\nVerbosity: ${level.toUpperCase()}`);
    console.log('-'.repeat(40));
    
    messages.setVerbosity(level);
    
    // Test detection message
    const detection = messages.getDetectionMessage(
      { claude: true, zenMCP: false },
      'claude_native'
    );
    if (detection) console.log(detection);
    
    // Test routing start
    const start = messages.getRoutingStartMessage(
      'Market Analysis',
      'minimal',
      'claude_native'
    );
    if (start) console.log(start);
    
    // Test fallback
    const fallback = messages.getFallbackMessage(
      'gemini-1.5-pro',
      'claude-3-haiku',
      'unavailable'
    );
    if (fallback) console.log(fallback);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Message testing complete\n');
}
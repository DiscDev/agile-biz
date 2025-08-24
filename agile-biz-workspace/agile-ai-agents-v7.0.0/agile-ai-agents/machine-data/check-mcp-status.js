#!/usr/bin/env node

/**
 * Check MCP (Model Context Protocol) Server Status
 * Used by agents to verify which MCP services are available for research verification
 */

const fs = require('fs');
const path = require('path');

class MCPStatusChecker {
  constructor() {
    this.configPath = path.join(__dirname, '..', 'CLAUDE.md');
    this.envPath = path.join(__dirname, '..', '.env');
    this.mcpServers = {
      perplexity: {
        name: 'Perplexity',
        description: 'Web searches with citations',
        envKey: 'PERPLEXITY_API_KEY',
        configKey: 'perplexity'
      },
      firecrawl: {
        name: 'Firecrawl',
        description: 'Website data extraction',
        envKey: 'FIRECRAWL_API_KEY',
        configKey: 'firecrawl'
      },
      github: {
        name: 'GitHub',
        description: 'Code/repo verification',
        envKey: 'GITHUB_TOKEN',
        configKey: 'github'
      },
      websearch: {
        name: 'WebSearch',
        description: 'General web searches',
        envKey: 'WEBSEARCH_API_KEY',
        configKey: 'websearch'
      }
    };
  }

  /**
   * Check if environment variables exist for MCP servers
   */
  checkEnvVariables() {
    const results = {};
    
    // Check if .env file exists
    if (!fs.existsSync(this.envPath)) {
      console.warn('⚠️  Warning: .env file not found');
      return results;
    }

    // Read .env file
    const envContent = fs.readFileSync(this.envPath, 'utf8');
    
    Object.entries(this.mcpServers).forEach(([key, server]) => {
      const regex = new RegExp(`^${server.envKey}=(.+)$`, 'm');
      const match = envContent.match(regex);
      
      results[key] = {
        ...server,
        configured: !!match && match[1].trim().length > 0
      };
    });

    return results;
  }

  /**
   * Read research verification config from CLAUDE.md
   */
  getVerificationConfig() {
    try {
      const claudeContent = fs.readFileSync(this.configPath, 'utf8');
      const configMatch = claudeContent.match(/research_verification:\s*\n([\s\S]*?)(?=\n\w|\n##|\Z)/);
      
      if (configMatch) {
        const configSection = configMatch[1];
        const levelMatch = configSection.match(/level:\s*"([^"]+)"/);
        const enabledMatch = configSection.match(/enabled:\s*(true|false)/);
        
        return {
          enabled: enabledMatch ? enabledMatch[1] === 'true' : true,
          level: levelMatch ? levelMatch[1] : 'balanced'
        };
      }
    } catch (error) {
      console.error('Error reading CLAUDE.md:', error.message);
    }
    
    return { enabled: true, level: 'balanced' };
  }

  /**
   * Display MCP status report
   */
  displayStatus() {
    console.log('\n🔍 Research Verification Status');
    console.log('━'.repeat(50));
    
    const config = this.getVerificationConfig();
    console.log(`\nConfiguration: ${config.level} verification`);
    console.log(`Status: ${config.enabled ? 'Enabled' : 'Disabled'}\n`);
    
    const envStatus = this.checkEnvVariables();
    const configured = [];
    const notConfigured = [];
    
    Object.entries(envStatus).forEach(([key, status]) => {
      if (status.configured) {
        configured.push(status);
      } else {
        notConfigured.push(status);
      }
    });
    
    if (configured.length > 0) {
      console.log('✅ MCP Servers Available:');
      configured.forEach(server => {
        console.log(`   • ${server.name} (${server.description})`);
      });
    }
    
    if (notConfigured.length > 0) {
      console.log('\n⚠️  MCP Servers Not Configured:');
      notConfigured.forEach(server => {
        console.log(`   • ${server.name} (${server.description})`);
        console.log(`     Set ${server.envKey} in .env file`);
      });
    }
    
    // Show impact assessment
    this.showImpact(configured.length, notConfigured.length);
  }

  /**
   * Show impact of MCP availability on research accuracy
   */
  showImpact(configuredCount, notConfiguredCount) {
    const totalServers = configuredCount + notConfiguredCount;
    const percentage = totalServers > 0 ? Math.round((configuredCount / totalServers) * 100) : 0;
    
    console.log('\n📊 Research Accuracy Impact:');
    console.log(`   MCP Coverage: ${percentage}%`);
    
    if (percentage === 100) {
      console.log('   ✅ Maximum verification capability');
      console.log('   • Real-time data for all research');
      console.log('   • Minimal hallucination risk');
    } else if (percentage >= 50) {
      console.log('   ⚠️  Partial verification capability');
      console.log('   • Some claims will use cached/LLM data');
      console.log('   • Moderate hallucination risk');
    } else {
      console.log('   ❌ Limited verification capability');
      console.log('   • Most claims will be unverified');
      console.log('   • Higher hallucination risk');
    }
    
    console.log('\nRecommendation:');
    if (notConfiguredCount > 0) {
      console.log('Configure additional MCP servers in .env for better accuracy');
      console.log('See: agile-ai-agents/aaa-mcps/ for setup guides');
    } else {
      console.log('All MCP servers configured - optimal setup! 🎉');
    }
  }

  /**
   * Get status as JSON for programmatic use
   */
  getStatusJSON() {
    const config = this.getVerificationConfig();
    const envStatus = this.checkEnvVariables();
    
    const status = {
      verification: config,
      mcpServers: envStatus,
      summary: {
        configured: Object.values(envStatus).filter(s => s.configured).length,
        total: Object.keys(envStatus).length
      }
    };
    
    return status;
  }
}

// Run if called directly
if (require.main === module) {
  const checker = new MCPStatusChecker();
  
  // Check for JSON output flag
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(checker.getStatusJSON(), null, 2));
  } else {
    checker.displayStatus();
  }
}

module.exports = MCPStatusChecker;
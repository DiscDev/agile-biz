#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const net = require('net');
const os = require('os');

const execAsync = promisify(exec);

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Diagnostic categories
const categories = {
  ENVIRONMENT: 'Environment',
  DEPENDENCIES: 'Dependencies',
  FILESYSTEM: 'File System',
  CONFIGURATION: 'Configuration',
  PORTS: 'Network Ports',
  CREDENTIALS: 'API Credentials',
  PERFORMANCE: 'Performance'
};

class Diagnostics {
  constructor() {
    this.results = [];
    this.errors = [];
    this.warnings = [];
    this.projectRoot = path.join(__dirname, '..');
    this.dashboardPath = __dirname;
  }

  // Helper methods for output
  log(message, color = '') {
    console.log(color + message + colors.reset);
  }

  success(message) {
    this.log(`✅ ${message}`, colors.green);
  }

  error(message) {
    this.log(`❌ ${message}`, colors.red);
    this.errors.push(message);
  }

  warning(message) {
    this.log(`⚠️  ${message}`, colors.yellow);
    this.warnings.push(message);
  }

  info(message) {
    this.log(`ℹ️  ${message}`, colors.blue);
  }

  header(title) {
    console.log('\n' + colors.bright + colors.cyan + `=== ${title} ===` + colors.reset + '\n');
  }

  // Check Node.js version
  async checkNodeVersion() {
    this.header('Node.js Environment');
    
    try {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
      
      this.info(`Node.js version: ${nodeVersion}`);
      
      if (majorVersion >= 16) {
        this.success('Node.js version meets requirements (16+)');
      } else {
        this.error(`Node.js version ${nodeVersion} is below minimum requirement (16+)`);
      }

      // Check npm version
      const { stdout: npmVersion } = await execAsync('npm -v');
      this.info(`npm version: ${npmVersion.trim()}`);
      
      // Check system info
      this.info(`Platform: ${process.platform}`);
      this.info(`Architecture: ${process.arch}`);
      this.info(`CPU cores: ${os.cpus().length}`);
      this.info(`Total memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`);
      
    } catch (error) {
      this.error(`Failed to check Node.js environment: ${error.message}`);
    }
  }

  // Check dependencies
  async checkDependencies() {
    this.header('Dependencies Check');
    
    try {
      const packageJsonPath = path.join(this.dashboardPath, 'package.json');
      
      if (!await fs.pathExists(packageJsonPath)) {
        this.error('package.json not found in dashboard directory');
        return;
      }

      const packageJson = await fs.readJSON(packageJsonPath);
      const dependencies = packageJson.dependencies || {};
      const nodeModulesPath = path.join(this.dashboardPath, 'node_modules');

      // Check if node_modules exists
      if (!await fs.pathExists(nodeModulesPath)) {
        this.error('node_modules directory not found - run "npm install"');
        return;
      }

      // Check critical dependencies
      const criticalDeps = [
        'express',
        'socket.io',
        'chokidar',
        'marked',
        'fs-extra',
        'helmet',
        'compression',
        'cors'
      ];

      let missingDeps = [];
      for (const dep of criticalDeps) {
        if (dependencies[dep]) {
          const depPath = path.join(nodeModulesPath, dep);
          if (await fs.pathExists(depPath)) {
            this.success(`${dep} v${dependencies[dep]} installed`);
          } else {
            missingDeps.push(dep);
            this.error(`${dep} is missing from node_modules`);
          }
        }
      }

      if (missingDeps.length > 0) {
        this.warning(`Run "npm install" to install missing dependencies`);
      }

      // Check for security dependencies if using secure server
      if (dependencies['express-rate-limit'] && dependencies['express-basic-auth']) {
        this.success('Security dependencies are configured');
      } else {
        this.info('Security dependencies not found (optional for basic setup)');
      }

      // Check for outdated packages
      try {
        const { stdout } = await execAsync('npm outdated --json', { cwd: this.dashboardPath });
        if (stdout.trim()) {
          const outdated = JSON.parse(stdout);
          const outdatedCount = Object.keys(outdated).length;
          if (outdatedCount > 0) {
            this.warning(`${outdatedCount} packages are outdated. Run "npm update" to update.`);
          }
        } else {
          this.success('All packages are up to date');
        }
      } catch (error) {
        // npm outdated returns non-zero exit code when packages are outdated
        if (error.stdout) {
          try {
            const outdated = JSON.parse(error.stdout);
            const outdatedCount = Object.keys(outdated).length;
            this.warning(`${outdatedCount} packages are outdated. Run "npm update" to update.`);
          } catch (parseError) {
            // Ignore parse errors
          }
        }
      }

    } catch (error) {
      this.error(`Failed to check dependencies: ${error.message}`);
    }
  }

  // Check folder structure
  async checkFolderStructure() {
    this.header('Folder Structure Check');
    
    const requiredFolders = [
      'project-documents',
      'project-documents/orchestration',
      'project-documents/orchestration/sprint-planning',
      'project-documents/orchestration/sprint-reviews',
      'project-documents/orchestration/sprint-retrospectives',
      'project-documents/orchestration/stakeholder-escalation',
      'ai-agents',
      'ai-agent-coordination',
      'aaa-mcps',
      'project-dashboard',
      'project-dashboard/public'
    ];

    let missingFolders = [];
    
    for (const folder of requiredFolders) {
      const folderPath = path.join(this.projectRoot, folder);
      if (await fs.pathExists(folderPath)) {
        // Check permissions
        try {
          await fs.access(folderPath, fs.constants.R_OK | fs.constants.W_OK);
          this.success(`${folder} - exists and writable`);
        } catch (error) {
          this.warning(`${folder} - exists but not fully accessible`);
        }
      } else {
        missingFolders.push(folder);
        this.error(`${folder} - missing`);
      }
    }

    if (missingFolders.length > 0) {
      this.warning('Some folders are missing. The dashboard will create them on startup.');
    }

    // Check for critical files
    const criticalFiles = [
      '.env_example',
      'auto-project-orchestrator.md',
      'project-dashboard/server.js',
      'project-dashboard/package.json'
    ];

    for (const file of criticalFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (await fs.pathExists(filePath)) {
        this.success(`${file} - found`);
      } else {
        this.error(`${file} - missing`);
      }
    }
  }

  // Check port availability
  async checkPorts() {
    this.header('Port Availability Check');
    
    const checkPort = (port) => {
      return new Promise((resolve) => {
        const server = net.createServer();
        
        server.once('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            resolve(false);
          } else {
            resolve(false);
          }
        });
        
        server.once('listening', () => {
          server.close();
          resolve(true);
        });
        
        server.listen(port);
      });
    };

    // Read configured port from .env
    let configuredPort = 3001;
    const envPath = path.join(this.projectRoot, '.env');
    
    if (await fs.pathExists(envPath)) {
      try {
        const envContent = await fs.readFile(envPath, 'utf8');
        const portMatch = envContent.match(/DASHBOARD_PORT=(\d+)/);
        if (portMatch) {
          configuredPort = parseInt(portMatch[1]);
        }
      } catch (error) {
        this.warning('Could not read .env file');
      }
    }

    // Check configured port
    const isPortAvailable = await checkPort(configuredPort);
    if (isPortAvailable) {
      this.success(`Port ${configuredPort} is available`);
    } else {
      this.error(`Port ${configuredPort} is already in use`);
      
      // Check alternative ports
      this.info('Checking alternative ports...');
      for (let port = 3001; port <= 3010; port++) {
        if (await checkPort(port)) {
          this.info(`Alternative port ${port} is available`);
          break;
        }
      }
    }

    // Check common development ports
    const commonPorts = {
      3000: 'Backend API',
      5173: 'Frontend (Vite)',
      8080: 'Alternative web server',
      5432: 'PostgreSQL',
      6379: 'Redis'
    };

    this.info('\nChecking common development ports:');
    for (const [port, service] of Object.entries(commonPorts)) {
      const available = await checkPort(port);
      if (available) {
        this.info(`Port ${port} (${service}) - available`);
      } else {
        this.info(`Port ${port} (${service}) - in use`);
      }
    }
  }

  // Check environment configuration
  async checkConfiguration() {
    this.header('Configuration Check');
    
    const envPath = path.join(this.projectRoot, '.env');
    const envExamplePath = path.join(this.projectRoot, '.env_example');
    
    // Check if .env exists
    if (!await fs.pathExists(envPath)) {
      this.error('.env file not found');
      
      if (await fs.pathExists(envExamplePath)) {
        this.info('.env_example found - copy it to .env and configure');
      }
      return;
    }

    this.success('.env file found');

    // Read and validate configuration
    try {
      const envContent = await fs.readFile(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      // Check for critical configurations
      const criticalConfigs = {
        'DASHBOARD_PORT': 'Dashboard port',
        'AGILE_AI_AGENTS_VERSION': 'System version'
      };

      const optionalConfigs = {
        'OPENAI_API_KEY': 'OpenAI API',
        'ANTHROPIC_API_KEY': 'Anthropic API',
        'GITHUB_TOKEN': 'GitHub integration',
        'DASHBOARD_AUTH_ENABLED': 'Dashboard authentication'
      };

      // Check critical configs
      for (const [key, description] of Object.entries(criticalConfigs)) {
        const found = lines.some(line => line.startsWith(`${key}=`) && !line.includes('your_') && !line.includes('_here'));
        if (found) {
          this.success(`${description} configured`);
        } else {
          this.error(`${description} not configured`);
        }
      }

      // Check optional configs
      let configuredAPIs = 0;
      for (const [key, description] of Object.entries(optionalConfigs)) {
        const found = lines.some(line => line.startsWith(`${key}=`) && !line.includes('your_') && !line.includes('_here') && !line.includes('skip'));
        if (found) {
          this.success(`${description} configured`);
          if (key.includes('API_KEY')) configuredAPIs++;
        } else {
          this.info(`${description} not configured (optional)`);
        }
      }

      if (configuredAPIs === 0) {
        this.warning('No API keys configured - some agent features may be limited');
      }

      // Check MCP configurations
      const mcpConfigs = [
        'ZEN_MCP_ENABLED',
        'GITHUB_MCP_ENABLED',
        'FIGMA_MCP_ENABLED',
        'SUPABASE_MCP_ENABLED'
      ];

      let enabledMCPs = 0;
      for (const mcp of mcpConfigs) {
        if (lines.some(line => line.startsWith(`${mcp}=true`))) {
          enabledMCPs++;
        }
      }

      if (enabledMCPs > 0) {
        this.info(`${enabledMCPs} MCP servers enabled`);
      } else {
        this.info('No MCP servers enabled (optional)');
      }

    } catch (error) {
      this.error(`Failed to read configuration: ${error.message}`);
    }
  }

  // Performance checks
  async checkPerformance() {
    this.header('Performance Check');
    
    // Check available memory
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedPercent = Math.round(((totalMem - freeMem) / totalMem) * 100);
    
    this.info(`Memory: ${Math.round(freeMem / 1024 / 1024 / 1024)}GB free of ${Math.round(totalMem / 1024 / 1024 / 1024)}GB (${usedPercent}% used)`);
    
    if (usedPercent > 90) {
      this.warning('System memory usage is high');
    } else {
      this.success('Adequate memory available');
    }

    // Check CPU load
    const loadAvg = os.loadavg();
    const cpuCount = os.cpus().length;
    
    this.info(`CPU Load Average: ${loadAvg[0].toFixed(2)} (1min), ${loadAvg[1].toFixed(2)} (5min), ${loadAvg[2].toFixed(2)} (15min)`);
    this.info(`CPU Cores: ${cpuCount}`);
    
    if (loadAvg[0] > cpuCount * 2) {
      this.warning('CPU load is high');
    } else {
      this.success('CPU load is normal');
    }

    // Check disk space
    try {
      let diskInfo;
      if (process.platform === 'win32') {
        const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption');
        this.info('Disk space check completed (see system tools for details)');
      } else {
        const { stdout } = await execAsync(`df -h ${this.projectRoot}`);
        const lines = stdout.split('\n');
        if (lines[1]) {
          const parts = lines[1].split(/\s+/);
          const usePercent = parseInt(parts[4]);
          this.info(`Disk usage: ${parts[4]} used`);
          
          if (usePercent > 90) {
            this.warning('Disk space is low');
          } else {
            this.success('Adequate disk space available');
          }
        }
      }
    } catch (error) {
      this.info('Could not check disk space');
    }
  }

  // Generate diagnostic report
  async generateReport() {
    this.header('Diagnostic Report Summary');
    
    const reportPath = path.join(this.projectRoot, 'diagnostic-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      platform: process.platform,
      nodeVersion: process.version,
      errors: this.errors,
      warnings: this.warnings,
      summary: {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        status: this.errors.length === 0 ? 'PASS' : 'FAIL'
      }
    };

    await fs.writeJSON(reportPath, report, { spaces: 2 });
    
    console.log('\n' + colors.bright + '📊 Summary:' + colors.reset);
    console.log(`Total Errors: ${colors.red}${this.errors.length}${colors.reset}`);
    console.log(`Total Warnings: ${colors.yellow}${this.warnings.length}${colors.reset}`);
    
    if (this.errors.length === 0) {
      console.log('\n' + colors.green + colors.bright + '✅ All diagnostics passed!' + colors.reset);
    } else {
      console.log('\n' + colors.red + colors.bright + '❌ Some issues need attention' + colors.reset);
      console.log('\nRecommended actions:');
      
      if (this.errors.some(e => e.includes('node_modules'))) {
        console.log('1. Run: npm install');
      }
      if (this.errors.some(e => e.includes('.env'))) {
        console.log('2. Copy .env_example to .env and configure');
      }
      if (this.errors.some(e => e.includes('Port'))) {
        console.log('3. Change DASHBOARD_PORT in .env or stop conflicting service');
      }
    }
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  // Run all diagnostics
  async runAll() {
    console.log(colors.bright + colors.magenta + '\n🔍 AgileAiAgents Diagnostic Tool\n' + colors.reset);
    console.log('Running comprehensive system diagnostics...\n');
    
    await this.checkNodeVersion();
    await this.checkDependencies();
    await this.checkFolderStructure();
    await this.checkPorts();
    await this.checkConfiguration();
    await this.checkPerformance();
    await this.generateReport();
  }
}

// Run diagnostics if called directly
if (require.main === module) {
  const diagnostics = new Diagnostics();
  diagnostics.runAll().catch(error => {
    console.error(colors.red + `\n❌ Diagnostic tool error: ${error.message}` + colors.reset);
    process.exit(1);
  });
}

module.exports = Diagnostics;
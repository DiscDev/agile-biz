const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class HealthMonitor {
  constructor(io, projectDocsPath) {
    this.io = io;
    this.projectDocsPath = projectDocsPath;
    this.healthStatus = {
      status: 'initializing',
      lastCheck: null,
      checks: {},
      metrics: {},
      alerts: []
    };
  }

  async performHealthCheck() {
    const startTime = Date.now();
    const checks = {};
    const metrics = {};
    const alerts = [];

    try {
      // 1. File System Check
      checks.fileSystem = await this.checkFileSystem();
      
      // 2. WebSocket Connection Check
      checks.webSocket = this.checkWebSocket();
      
      // 3. Memory Usage Check
      const memoryStatus = await this.checkMemoryUsage();
      checks.memory = memoryStatus.healthy;
      metrics.memory = memoryStatus.metrics;
      if (!memoryStatus.healthy) {
        alerts.push(memoryStatus.alert);
      }
      
      // 4. Disk Space Check
      const diskStatus = await this.checkDiskSpace();
      checks.diskSpace = diskStatus.healthy;
      metrics.diskSpace = diskStatus.metrics;
      if (!diskStatus.healthy) {
        alerts.push(diskStatus.alert);
      }
      
      // 5. CPU Usage Check
      const cpuStatus = await this.checkCPUUsage();
      checks.cpu = cpuStatus.healthy;
      metrics.cpu = cpuStatus.metrics;
      if (!cpuStatus.healthy) {
        alerts.push(cpuStatus.alert);
      }
      
      // 6. Folder Permissions Check
      checks.folderPermissions = await this.checkFolderPermissions();
      
      // 7. Process Health Check
      checks.process = this.checkProcessHealth();
      
      // 8. Dependencies Check
      checks.dependencies = await this.checkDependencies();
      
      // 9. Port Availability Check
      checks.port = await this.checkPortAvailability();
      
      // 10. File Watcher Status
      checks.fileWatcher = global.fileWatcherActive || false;
      
      // Calculate overall health
      const allChecks = Object.values(checks);
      const healthyChecks = allChecks.filter(check => check === true).length;
      const totalChecks = allChecks.length;
      const healthPercentage = Math.round((healthyChecks / totalChecks) * 100);
      
      // Determine overall status
      let overallStatus = 'healthy';
      if (healthPercentage < 50) {
        overallStatus = 'critical';
      } else if (healthPercentage < 80) {
        overallStatus = 'degraded';
      }
      
      // Add performance metrics
      metrics.responseTime = Date.now() - startTime;
      metrics.uptime = process.uptime();
      metrics.healthScore = healthPercentage;
      
      this.healthStatus = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        lastCheck: new Date().toISOString(),
        checks,
        metrics,
        alerts,
        summary: {
          healthyChecks,
          totalChecks,
          healthPercentage
        }
      };
      
      // Emit health update to connected clients
      if (this.io) {
        this.io.emit('health-update', this.healthStatus);
      }
      
      return this.healthStatus;
      
    } catch (error) {
      console.error('Health check error:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        checks,
        metrics,
        alerts: [...alerts, {
          level: 'critical',
          message: 'Health check system error',
          details: error.message
        }]
      };
    }
  }

  async checkFileSystem() {
    try {
      // Check read access
      await fs.access(this.projectDocsPath, fs.constants.R_OK);
      
      // Check write access
      const testFile = path.join(this.projectDocsPath, '.health-check-test');
      await fs.writeFile(testFile, 'test');
      await fs.unlink(testFile);
      
      return true;
    } catch (error) {
      return false;
    }
  }

  checkWebSocket() {
    return this.io && this.io.engine && this.io.engine.clientsCount >= 0;
  }

  async checkMemoryUsage() {
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMemPercent = ((totalMem - freeMem) / totalMem) * 100;
    const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    const metrics = {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsedPercent: Math.round(heapUsedPercent),
      rss: Math.round(memUsage.rss / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      systemUsedPercent: Math.round(usedMemPercent),
      systemFree: Math.round(freeMem / 1024 / 1024 / 1024 * 10) / 10 // GB with 1 decimal
    };
    
    let healthy = true;
    let alert = null;
    
    if (heapUsedPercent > 90) {
      healthy = false;
      alert = {
        level: 'critical',
        message: 'High heap memory usage',
        details: `Heap usage at ${Math.round(heapUsedPercent)}%`
      };
    } else if (heapUsedPercent > 75) {
      alert = {
        level: 'warning',
        message: 'Elevated heap memory usage',
        details: `Heap usage at ${Math.round(heapUsedPercent)}%`
      };
    }
    
    if (usedMemPercent > 90) {
      healthy = false;
      alert = {
        level: 'critical',
        message: 'High system memory usage',
        details: `System memory usage at ${Math.round(usedMemPercent)}%`
      };
    }
    
    return { healthy, metrics, alert };
  }

  async checkDiskSpace() {
    try {
      let command;
      if (process.platform === 'win32') {
        command = `wmic logicaldisk where "DeviceID='${path.parse(this.projectDocsPath).root.replace('\\', '')}'" get FreeSpace,Size /format:csv`;
      } else {
        command = `df -k "${this.projectDocsPath}" | tail -1`;
      }
      
      const { stdout } = await execAsync(command);
      let freeSpace, totalSpace, usedPercent;
      
      if (process.platform === 'win32') {
        const lines = stdout.trim().split('\n');
        const data = lines[lines.length - 1].split(',');
        freeSpace = parseInt(data[1]) / 1024 / 1024 / 1024; // GB
        totalSpace = parseInt(data[2]) / 1024 / 1024 / 1024; // GB
        usedPercent = ((totalSpace - freeSpace) / totalSpace) * 100;
      } else {
        const parts = stdout.trim().split(/\s+/);
        totalSpace = parseInt(parts[1]) / 1024 / 1024; // GB
        const available = parseInt(parts[3]) / 1024 / 1024; // GB
        freeSpace = available;
        usedPercent = parseInt(parts[4]);
      }
      
      const metrics = {
        freeSpace: Math.round(freeSpace * 10) / 10, // GB with 1 decimal
        totalSpace: Math.round(totalSpace * 10) / 10,
        usedPercent: Math.round(usedPercent),
        availableGB: Math.round(freeSpace * 10) / 10
      };
      
      let healthy = true;
      let alert = null;
      
      if (freeSpace < 0.5) { // Less than 500MB
        healthy = false;
        alert = {
          level: 'critical',
          message: 'Critically low disk space',
          details: `Only ${Math.round(freeSpace * 1024)}MB free`
        };
      } else if (freeSpace < 2) { // Less than 2GB
        alert = {
          level: 'warning',
          message: 'Low disk space',
          details: `Only ${Math.round(freeSpace * 10) / 10}GB free`
        };
      }
      
      return { healthy, metrics, alert };
      
    } catch (error) {
      return {
        healthy: false,
        metrics: { error: error.message },
        alert: {
          level: 'error',
          message: 'Failed to check disk space',
          details: error.message
        }
      };
    }
  }

  async checkCPUUsage() {
    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    
    // Calculate CPU usage percentage (simplified)
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
    
    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - ~~(100 * idle / total);
    
    const metrics = {
      cores: cpus.length,
      usage: usage,
      loadAverage: {
        '1min': Math.round(loadAvg[0] * 100) / 100,
        '5min': Math.round(loadAvg[1] * 100) / 100,
        '15min': Math.round(loadAvg[2] * 100) / 100
      }
    };
    
    let healthy = true;
    let alert = null;
    
    // Check if load average is too high (more than 2x number of cores)
    if (loadAvg[0] > cpus.length * 2) {
      healthy = false;
      alert = {
        level: 'critical',
        message: 'High CPU load',
        details: `Load average ${loadAvg[0]} exceeds 2x CPU cores (${cpus.length})`
      };
    } else if (loadAvg[0] > cpus.length * 1.5) {
      alert = {
        level: 'warning',
        message: 'Elevated CPU load',
        details: `Load average ${loadAvg[0]} is high for ${cpus.length} cores`
      };
    }
    
    return { healthy, metrics, alert };
  }

  async checkFolderPermissions() {
    const foldersToCheck = [
      this.projectDocsPath,
      path.join(this.projectDocsPath, '00-orchestration'),
      path.join(this.projectDocsPath, '22-implementation')
    ];
    
    for (const folder of foldersToCheck) {
      try {
        await fs.access(folder, fs.constants.R_OK | fs.constants.W_OK);
      } catch (error) {
        return false;
      }
    }
    
    return true;
  }

  checkProcessHealth() {
    // Check if the process is responsive
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    // Basic checks
    if (memUsage.heapUsed > memUsage.heapTotal * 0.95) return false;
    if (uptime < 1) return false; // Just started
    
    return true;
  }

  async checkDependencies() {
    try {
      const packagePath = path.join(__dirname, 'package.json');
      const package = await fs.readJSON(packagePath);
      const requiredDeps = Object.keys(package.dependencies || {});
      
      // Check if node_modules exists
      const nodeModulesPath = path.join(__dirname, 'node_modules');
      await fs.access(nodeModulesPath, fs.constants.R_OK);
      
      // Check a few critical dependencies
      const criticalDeps = ['express', 'socket.io', 'chokidar', 'marked'];
      for (const dep of criticalDeps) {
        if (requiredDeps.includes(dep)) {
          const depPath = path.join(nodeModulesPath, dep);
          await fs.access(depPath, fs.constants.R_OK);
        }
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  async checkPortAvailability() {
    // This is a simple check - in production you might want to actually test binding
    const port = process.env.DASHBOARD_PORT || 3001;
    return port >= 1024 && port <= 65535;
  }

  // Start periodic health checks
  startPeriodicChecks(intervalMs = 60000) { // Default: 1 minute
    this.stopPeriodicChecks(); // Clear any existing interval
    
    // Initial check
    this.performHealthCheck();
    
    // Set up periodic checks
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, intervalMs);
    
    console.log(`🏥 Health monitoring started (checking every ${intervalMs / 1000}s)`);
  }

  stopPeriodicChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  getStatus() {
    return this.healthStatus;
  }
}

module.exports = HealthMonitor;
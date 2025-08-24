const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');
const zlib = require('zlib');

/**
 * Log Viewer API for AgileAiAgents
 * Provides API endpoints for viewing and searching logs
 */

class LogViewer {
  constructor(logDir) {
    this.logDir = logDir || path.join(__dirname, '..', 'logs');
  }

  /**
   * Get list of available log files
   */
  async getLogFiles() {
    const logTypes = ['app', 'error', 'access', 'agent', 'security'];
    const files = {};

    for (const type of logTypes) {
      const dirPath = path.join(this.logDir, type);
      files[type] = [];

      try {
        if (await fs.pathExists(dirPath)) {
          const dirFiles = await fs.readdir(dirPath);
          
          for (const file of dirFiles) {
            if (file.endsWith('.log') || file.endsWith('.gz')) {
              const filePath = path.join(dirPath, file);
              const stats = await fs.stat(filePath);
              
              files[type].push({
                name: file,
                size: stats.size,
                modified: stats.mtime,
                compressed: file.endsWith('.gz')
              });
            }
          }
          
          // Sort by modified date (newest first)
          files[type].sort((a, b) => b.modified - a.modified);
        }
      } catch (error) {
        console.error(`Error reading ${type} logs:`, error);
      }
    }

    return files;
  }

  /**
   * Read log file content
   */
  async readLogFile(type, filename, options = {}) {
    const { tail = 100, search = null, level = null } = options;
    const filePath = path.join(this.logDir, type, filename);

    // Security check
    if (!filePath.startsWith(this.logDir)) {
      throw new Error('Invalid file path');
    }

    if (!await fs.pathExists(filePath)) {
      throw new Error('Log file not found');
    }

    const lines = [];
    let stream;

    // Handle compressed files
    if (filename.endsWith('.gz')) {
      stream = fs.createReadStream(filePath).pipe(zlib.createGunzip());
    } else {
      stream = fs.createReadStream(filePath);
    }

    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      try {
        // Try to parse as JSON log
        const parsed = this.parseLogLine(line);
        
        // Apply filters
        if (level && parsed.level && parsed.level !== level) continue;
        if (search && !line.toLowerCase().includes(search.toLowerCase())) continue;
        
        lines.push(parsed);
        
        // Keep only last N lines for tail
        if (lines.length > tail) {
          lines.shift();
        }
      } catch (error) {
        // If not JSON, include raw line
        if (!search || line.toLowerCase().includes(search.toLowerCase())) {
          lines.push({ raw: line });
        }
      }
    }

    return lines;
  }

  /**
   * Parse log line
   */
  parseLogLine(line) {
    // Try to parse structured log format
    const match = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}) \[(\w+)\]: (.+)$/);
    
    if (match) {
      const [, timestamp, level, rest] = match;
      let message = rest;
      let metadata = {};
      
      // Try to extract JSON metadata
      const jsonMatch = rest.match(/^(.+?) ({.+})$/);
      if (jsonMatch) {
        try {
          message = jsonMatch[1];
          metadata = JSON.parse(jsonMatch[2]);
        } catch (e) {
          // Keep original message if JSON parse fails
        }
      }
      
      return {
        timestamp,
        level: level.toLowerCase(),
        message,
        metadata,
        raw: line
      };
    }
    
    // Try pure JSON format
    try {
      const parsed = JSON.parse(line);
      return {
        timestamp: parsed.timestamp,
        level: parsed.level,
        message: parsed.message,
        metadata: parsed,
        raw: line
      };
    } catch (error) {
      return { raw: line };
    }
  }

  /**
   * Search across all logs
   */
  async searchLogs(query, options = {}) {
    const { limit = 100, type = null, startDate = null, endDate = null } = options;
    const results = [];
    const logTypes = type ? [type] : ['app', 'error', 'access', 'agent', 'security'];

    for (const logType of logTypes) {
      const dirPath = path.join(this.logDir, logType);
      
      try {
        if (await fs.pathExists(dirPath)) {
          const files = await fs.readdir(dirPath);
          
          for (const file of files) {
            if (file.endsWith('.log')) {
              // Check date range if specified
              if (startDate || endDate) {
                const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
                if (dateMatch) {
                  const fileDate = new Date(dateMatch[1]);
                  if (startDate && fileDate < new Date(startDate)) continue;
                  if (endDate && fileDate > new Date(endDate)) continue;
                }
              }
              
              const logs = await this.readLogFile(logType, file, { 
                tail: 1000, 
                search: query 
              });
              
              logs.forEach(log => {
                if (results.length < limit) {
                  results.push({
                    ...log,
                    file: file,
                    type: logType
                  });
                }
              });
              
              if (results.length >= limit) break;
            }
          }
        }
      } catch (error) {
        console.error(`Error searching ${logType} logs:`, error);
      }
      
      if (results.length >= limit) break;
    }

    // Sort by timestamp (newest first)
    results.sort((a, b) => {
      const timeA = new Date(a.timestamp || 0);
      const timeB = new Date(b.timestamp || 0);
      return timeB - timeA;
    });

    return results.slice(0, limit);
  }

  /**
   * Get log statistics by time period
   */
  async getLogStats(type, period = '24h') {
    const stats = {
      total: 0,
      byLevel: {},
      byHour: {},
      topErrors: []
    };

    const now = new Date();
    const periodMs = this.parsePeriod(period);
    const startTime = new Date(now - periodMs);

    const dirPath = path.join(this.logDir, type);
    
    try {
      if (await fs.pathExists(dirPath)) {
        const files = await fs.readdir(dirPath);
        const errorCounts = new Map();
        
        for (const file of files) {
          if (file.endsWith('.log')) {
            const logs = await this.readLogFile(type, file, { tail: 10000 });
            
            logs.forEach(log => {
              if (log.timestamp) {
                const logTime = new Date(log.timestamp);
                
                if (logTime >= startTime) {
                  stats.total++;
                  
                  // Count by level
                  const level = log.level || 'unknown';
                  stats.byLevel[level] = (stats.byLevel[level] || 0) + 1;
                  
                  // Count by hour
                  const hour = logTime.getHours();
                  stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
                  
                  // Track top errors
                  if (level === 'error' && log.message) {
                    const key = log.metadata?.code || log.message.substring(0, 50);
                    errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
                  }
                }
              }
            });
          }
        }
        
        // Get top 10 errors
        stats.topErrors = Array.from(errorCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([error, count]) => ({ error, count }));
      }
    } catch (error) {
      console.error(`Error getting stats for ${type} logs:`, error);
    }

    return stats;
  }

  /**
   * Stream logs in real-time
   */
  createLogStream(type, filename) {
    const filePath = path.join(this.logDir, type, filename);
    
    // Security check
    if (!filePath.startsWith(this.logDir)) {
      throw new Error('Invalid file path');
    }

    // Create a tail stream
    const stream = fs.createReadStream(filePath, {
      encoding: 'utf8',
      start: 0
    });

    // Watch for changes
    const watcher = fs.watch(filePath, (eventType) => {
      if (eventType === 'change') {
        // File has been modified, read new content
        // This would need to be implemented with proper tail logic
      }
    });

    return { stream, watcher };
  }

  /**
   * Express router for log viewer endpoints
   */
  createRouter() {
    const express = require('express');
    const router = express.Router();

    // Middleware to check if user can view logs
    router.use((req, res, next) => {
      // In production, you might want to restrict this to admins
      if (process.env.NODE_ENV === 'production' && !req.user?.isAdmin) {
        return res.status(403).json({ error: 'Access denied' });
      }
      next();
    });

    // Get available log files
    router.get('/files', async (req, res) => {
      try {
        const files = await this.getLogFiles();
        res.json(files);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Read specific log file
    router.get('/read/:type/:filename', async (req, res) => {
      try {
        const { type, filename } = req.params;
        const { tail, search, level } = req.query;
        
        const logs = await this.readLogFile(type, filename, {
          tail: parseInt(tail) || 100,
          search,
          level
        });
        
        res.json(logs);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Search logs
    router.get('/search', async (req, res) => {
      try {
        const { q, limit, type, startDate, endDate } = req.query;
        
        if (!q) {
          return res.status(400).json({ error: 'Query parameter required' });
        }
        
        const results = await this.searchLogs(q, {
          limit: parseInt(limit) || 100,
          type,
          startDate,
          endDate
        });
        
        res.json(results);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get log statistics
    router.get('/stats/:type', async (req, res) => {
      try {
        const { type } = req.params;
        const { period } = req.query;
        
        const stats = await this.getLogStats(type, period || '24h');
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Stream logs (SSE)
    router.get('/stream/:type/:filename', (req, res) => {
      try {
        const { type, filename } = req.params;
        
        // Set SSE headers
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        });
        
        // Send initial data
        res.write('data: {"connected": true}\n\n');
        
        // TODO: Implement proper log tailing
        
        // Handle client disconnect
        req.on('close', () => {
          // Clean up watcher
        });
        
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    return router;
  }

  parsePeriod(period) {
    const units = {
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      w: 7 * 24 * 60 * 60 * 1000
    };
    
    const match = period.match(/^(\d+)([hdw])$/);
    if (match) {
      const [, num, unit] = match;
      return parseInt(num) * units[unit];
    }
    
    return 24 * 60 * 60 * 1000; // Default 24 hours
  }
}

module.exports = LogViewer;
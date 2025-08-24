/**
 * AgileAiAgents Error Code System
 * Standardized error codes for consistent error handling and debugging
 */

const ErrorCategories = {
  SYSTEM: 'SYS',
  AUTH: 'AUTH',
  CONFIG: 'CFG',
  FILESYSTEM: 'FS',
  NETWORK: 'NET',
  DASHBOARD: 'DASH',
  AGENT: 'AGT',
  API: 'API',
  MCP: 'MCP',
  VALIDATION: 'VAL'
};

const ErrorCodes = {
  // System Errors (SYS-XXXX)
  SYS_001: {
    code: 'SYS-001',
    message: 'System initialization failed',
    description: 'The dashboard system failed to initialize properly',
    solution: 'Check system logs and run diagnostics (npm run diagnose)',
    severity: 'critical'
  },
  SYS_002: {
    code: 'SYS-002',
    message: 'Node.js version incompatible',
    description: 'Node.js version is below the minimum requirement (16.0.0)',
    solution: 'Update Node.js to version 16 or higher from https://nodejs.org/',
    severity: 'critical'
  },
  SYS_003: {
    code: 'SYS-003',
    message: 'Out of memory',
    description: 'System has insufficient memory to complete operation',
    solution: 'Free up system memory or increase Node.js heap size with --max-old-space-size',
    severity: 'critical'
  },
  SYS_004: {
    code: 'SYS-004',
    message: 'Process terminated unexpectedly',
    description: 'Dashboard process was terminated without proper shutdown',
    solution: 'Check for system crashes, restart the dashboard',
    severity: 'error'
  },

  // Authentication Errors (AUTH-XXXX)
  AUTH_001: {
    code: 'AUTH-001',
    message: 'Authentication required',
    description: 'Dashboard requires authentication but no credentials provided',
    solution: 'Provide username and password, or disable auth in .env',
    severity: 'error'
  },
  AUTH_002: {
    code: 'AUTH-002',
    message: 'Invalid credentials',
    description: 'Username or password is incorrect',
    solution: 'Check DASHBOARD_USERNAME and DASHBOARD_PASSWORD in .env',
    severity: 'error'
  },
  AUTH_003: {
    code: 'AUTH-003',
    message: 'Authentication configuration error',
    description: 'Authentication is enabled but not properly configured',
    solution: 'Set DASHBOARD_USERNAME and DASHBOARD_PASSWORD in .env',
    severity: 'error'
  },

  // Configuration Errors (CFG-XXXX)
  CFG_001: {
    code: 'CFG-001',
    message: 'Missing .env file',
    description: 'Environment configuration file not found',
    solution: 'Copy .env_example to .env and configure: cp .env_example .env',
    severity: 'critical'
  },
  CFG_002: {
    code: 'CFG-002',
    message: 'Invalid port configuration',
    description: 'DASHBOARD_PORT is not a valid port number',
    solution: 'Set DASHBOARD_PORT to a number between 1024 and 65535',
    severity: 'error'
  },
  CFG_003: {
    code: 'CFG-003',
    message: 'Missing required configuration',
    description: 'Required environment variable is not set',
    solution: 'Check .env file for missing required variables',
    severity: 'error'
  },
  CFG_004: {
    code: 'CFG-004',
    message: 'Invalid API credentials',
    description: 'API key or credential format is invalid',
    solution: 'Verify API credentials are correct and properly formatted',
    severity: 'warning'
  },

  // File System Errors (FS-XXXX)
  FS_001: {
    code: 'FS-001',
    message: 'Directory not found',
    description: 'Required directory does not exist',
    solution: 'Run setup to create directory structure or check path',
    severity: 'error'
  },
  FS_002: {
    code: 'FS-002',
    message: 'Permission denied',
    description: 'Insufficient permissions to access file or directory',
    solution: 'Check file permissions: chmod 755 for directories, chmod 644 for files',
    severity: 'error'
  },
  FS_003: {
    code: 'FS-003',
    message: 'Disk space full',
    description: 'Not enough disk space to complete operation',
    solution: 'Free up disk space, need at least 500MB available',
    severity: 'critical'
  },
  FS_004: {
    code: 'FS-004',
    message: 'File watcher limit exceeded',
    description: 'System file watcher limit has been reached',
    solution: 'Increase system file watcher limit or reduce watched directories',
    severity: 'warning'
  },

  // Network Errors (NET-XXXX)
  NET_001: {
    code: 'NET-001',
    message: 'Port already in use',
    description: 'The configured port is already being used by another process',
    solution: 'Change DASHBOARD_PORT in .env or stop the conflicting process',
    severity: 'error'
  },
  NET_002: {
    code: 'NET-002',
    message: 'Connection refused',
    description: 'Unable to connect to service',
    solution: 'Verify the service is running and accessible',
    severity: 'error'
  },
  NET_003: {
    code: 'NET-003',
    message: 'Request timeout',
    description: 'Network request exceeded timeout limit',
    solution: 'Check network connectivity and service availability',
    severity: 'warning'
  },
  NET_004: {
    code: 'NET-004',
    message: 'Rate limit exceeded',
    description: 'Too many requests in a short period',
    solution: 'Wait before retrying, rate limit resets every 15 minutes',
    severity: 'warning'
  },

  // Dashboard Errors (DASH-XXXX)
  DASH_001: {
    code: 'DASH-001',
    message: 'Dashboard initialization failed',
    description: 'Failed to start dashboard server',
    solution: 'Check logs for specific errors, run npm install',
    severity: 'critical'
  },
  DASH_002: {
    code: 'DASH-002',
    message: 'WebSocket connection failed',
    description: 'Real-time connection could not be established',
    solution: 'Check firewall settings, ensure WebSocket support',
    severity: 'error'
  },
  DASH_003: {
    code: 'DASH-003',
    message: 'Missing dependencies',
    description: 'Required npm packages are not installed',
    solution: 'Run: cd project-dashboard && npm install',
    severity: 'critical'
  },
  DASH_004: {
    code: 'DASH-004',
    message: 'Health check failed',
    description: 'Dashboard health check reported issues',
    solution: 'Check /api/health endpoint for details',
    severity: 'warning'
  },

  // Agent Errors (AGT-XXXX)
  AGT_001: {
    code: 'AGT-001',
    message: 'Agent file not found',
    description: 'Referenced agent configuration file does not exist',
    solution: 'Verify agent files exist in ai-agents directory',
    severity: 'error'
  },
  AGT_002: {
    code: 'AGT-002',
    message: 'Agent workflow error',
    description: 'Error in agent coordination workflow',
    solution: 'Check agent coordination patterns in documentation',
    severity: 'error'
  },
  AGT_003: {
    code: 'AGT-003',
    message: 'Agent output directory missing',
    description: 'Agent cannot write to output directory',
    solution: 'Ensure project-documents directories exist with write permissions',
    severity: 'error'
  },

  // API Errors (API-XXXX)
  API_001: {
    code: 'API-001',
    message: 'Invalid API request',
    description: 'API request format or parameters are invalid',
    solution: 'Check API documentation for correct request format',
    severity: 'error'
  },
  API_002: {
    code: 'API-002',
    message: 'API key missing',
    description: 'Required API key not configured',
    solution: 'Add API key to .env file',
    severity: 'error'
  },
  API_003: {
    code: 'API-003',
    message: 'API quota exceeded',
    description: 'API usage limit has been reached',
    solution: 'Wait for quota reset or upgrade API plan',
    severity: 'warning'
  },
  API_004: {
    code: 'API-004',
    message: 'External API unavailable',
    description: 'Third-party API service is not responding',
    solution: 'Check API service status, retry later',
    severity: 'warning'
  },

  // MCP Errors (MCP-XXXX)
  MCP_001: {
    code: 'MCP-001',
    message: 'MCP server not configured',
    description: 'MCP server is enabled but not properly configured',
    solution: 'Configure MCP credentials in .env file',
    severity: 'warning'
  },
  MCP_002: {
    code: 'MCP-002',
    message: 'MCP connection failed',
    description: 'Unable to connect to MCP server',
    solution: 'Verify MCP server URL and credentials',
    severity: 'error'
  },
  MCP_003: {
    code: 'MCP-003',
    message: 'MCP feature not available',
    description: 'Requested MCP feature is not available or disabled',
    solution: 'Enable MCP in .env and ensure proper configuration',
    severity: 'info'
  },

  // Validation Errors (VAL-XXXX)
  VAL_001: {
    code: 'VAL-001',
    message: 'Invalid input',
    description: 'Input validation failed',
    solution: 'Check input format and requirements',
    severity: 'error'
  },
  VAL_002: {
    code: 'VAL-002',
    message: 'Path traversal attempt',
    description: 'Security validation blocked path traversal',
    solution: 'Use valid paths within project scope',
    severity: 'error'
  },
  VAL_003: {
    code: 'VAL-003',
    message: 'Invalid file type',
    description: 'File type not allowed or supported',
    solution: 'Use supported file types (.md, .json)',
    severity: 'error'
  }
};

// Helper class for error handling
class AgileError extends Error {
  constructor(errorCode, additionalInfo = {}) {
    const error = ErrorCodes[errorCode] || {
      code: 'UNKNOWN',
      message: 'Unknown error',
      description: 'An unknown error occurred',
      solution: 'Check logs for more information',
      severity: 'error'
    };

    super(error.message);
    this.name = 'AgileError';
    this.code = error.code;
    this.description = error.description;
    this.solution = error.solution;
    this.severity = error.severity;
    this.timestamp = new Date().toISOString();
    this.additionalInfo = additionalInfo;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      description: this.description,
      solution: this.solution,
      severity: this.severity,
      timestamp: this.timestamp,
      additionalInfo: this.additionalInfo,
      stack: this.stack
    };
  }

  toString() {
    return `[${this.code}] ${this.message}\n${this.description}\nSolution: ${this.solution}`;
  }
}

// Error severity levels
const ErrorSeverity = {
  CRITICAL: 'critical',  // System cannot function
  ERROR: 'error',        // Operation failed
  WARNING: 'warning',    // Operation completed with issues
  INFO: 'info'          // Informational
};

// Recovery suggestions based on error patterns
const RecoveryPatterns = {
  systemErrors: [
    'Check system requirements',
    'Run diagnostic tool: npm run diagnose',
    'Review system logs',
    'Restart the dashboard'
  ],
  configErrors: [
    'Review .env configuration',
    'Copy .env_example if missing',
    'Verify all required fields',
    'Remove placeholder values'
  ],
  networkErrors: [
    'Check port availability',
    'Verify firewall settings',
    'Test network connectivity',
    'Try alternative ports'
  ],
  permissionErrors: [
    'Check file/directory permissions',
    'Run with appropriate user privileges',
    'Verify ownership of files',
    'Use chmod/chown to fix permissions'
  ]
};

// Export error utilities
module.exports = {
  ErrorCodes,
  ErrorCategories,
  ErrorSeverity,
  AgileError,
  RecoveryPatterns,
  
  // Helper function to get error by code
  getError: (code) => {
    return ErrorCodes[code] || null;
  },
  
  // Helper function to get all errors by category
  getErrorsByCategory: (category) => {
    return Object.entries(ErrorCodes)
      .filter(([key, error]) => error.code.startsWith(category))
      .map(([key, error]) => error);
  },
  
  // Helper function to format error for logging
  formatError: (error) => {
    if (error instanceof AgileError) {
      return error.toJSON();
    }
    return {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
  }
};
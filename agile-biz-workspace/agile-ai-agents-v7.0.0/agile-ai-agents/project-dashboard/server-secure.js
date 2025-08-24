const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs-extra');
const chokidar = require('chokidar');
const { marked } = require('marked');
const hljs = require('highlight.js');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const basicAuth = require('express-basic-auth');
const { body, validationResult } = require('express-validator');
const HealthMonitor = require('./health-monitor');
const { AgileError, ErrorCodes } = require('./error-codes');
const { initializeErrorHandler, asyncHandler, createError } = require('./error-handler');
const { initializeLogger, logError, logAgentActivity, logSecurityEvent } = require('./logger');
const LogViewer = require('./log-viewer');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.DASHBOARD_PORT || process.env.PORT || 3001;
const PROJECT_DOCS_PATH = path.join(__dirname, '..', 'project-documents');
const MCP_PATH = path.join(__dirname, '..', 'aaa-mcps');
const AGENTS_PATH = path.join(__dirname, '..', 'ai-agents');
const SYSTEM_DOCS_PATH = path.join(__dirname, '..');

// Initialize health monitor
let healthMonitor;

// Initialize logger
const logger = initializeLogger({
  logDir: path.join(__dirname, '..', 'logs'),
  appName: 'AgileAiAgents-Dashboard'
});

// Initialize error handler
const errorHandler = initializeErrorHandler({
  logPath: path.join(__dirname, '..', 'logs')
});

// Initialize log viewer
const logViewer = new LogViewer(path.join(__dirname, '..', 'logs'));

// Make io globally available for error handler
global.io = io;

// Enhanced Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.API_RATE_LIMIT || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// Stricter rate limiting for sensitive endpoints
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
});

// Basic Authentication (optional)
if (process.env.DASHBOARD_AUTH_ENABLED === 'true') {
  const users = {};
  users[process.env.DASHBOARD_USERNAME || 'admin'] = process.env.DASHBOARD_PASSWORD || 'changeme';
  
  app.use(basicAuth({
    users: users,
    challenge: true,
    realm: 'AgileAiAgents Dashboard',
    authorizer: (username, password, cb) => {
      const userMatches = users[username] && users[username] === password;
      if (userMatches) {
        logger.info('Authentication successful', { username });
        logSecurityEvent('Authentication success', 'info', { username });
      } else {
        logger.warn('Authentication failed', { username });
        logSecurityEvent('Authentication failure', 'warn', { username });
      }
      return cb(null, userMatches);
    },
    unauthorizedResponse: (req) => {
      logSecurityEvent('Unauthorized access attempt', 'warn', { 
        ip: req.ip, 
        url: req.url 
      });
      return 'Authentication required for AgileAiAgents Dashboard';
    }
  }));
}

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS 
      ? process.env.CORS_ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3001', 'http://localhost:3000', 'http://127.0.0.1:3001'];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Add logger middleware
app.use(logger.expressMiddleware());

// Input validation middleware
const validatePath = [
  body('path').trim().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Configure marked for markdown rendering
marked.use({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {}
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true
});

// Security headers for API responses
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Initialize project-documents folder structure (category-based v3.0.0)
async function initializeProjectStructure() {
  const folders = [
    // Orchestration category
    'orchestration',
    'orchestration/sprints',
    'orchestration/sprint-planning',
    'orchestration/sprint-reviews',
    'orchestration/sprint-retrospectives',
    'orchestration/sprint-testing',
    'orchestration/stakeholder-escalation',
    
    // Business Strategy category
    'business-strategy',
    'business-strategy/existing-project',
    'business-strategy/research',
    'business-strategy/marketing',
    'business-strategy/finance',
    'business-strategy/market-validation',
    'business-strategy/customer-success',
    'business-strategy/monetization',
    'business-strategy/analysis',
    'business-strategy/investment',
    
    // Implementation category
    'implementation',
    'implementation/requirements',
    'implementation/security',
    'implementation/llm-analysis',
    'implementation/api-analysis',
    'implementation/mcp-analysis',
    'implementation/project-planning',
    'implementation/environment',
    'implementation/design',
    'implementation/implementation',
    'implementation/testing',
    'implementation/documentation',
    
    // Operations category
    'operations',
    'operations/deployment',
    'operations/launch',
    'operations/analytics',
    'operations/monitoring',
    'operations/optimization',
    'operations/seo',
    'operations/crm-marketing',
    'operations/media-buying',
    'operations/social-media'
  ];

  for (const folder of folders) {
    const folderPath = path.join(PROJECT_DOCS_PATH, folder);
    await fs.ensureDir(folderPath);
  }

  // Create initial dashboard status file
  const dashboardStatusPath = path.join(PROJECT_DOCS_PATH, '00-orchestration', 'dashboard-status.md');
  if (!await fs.pathExists(dashboardStatusPath)) {
    await fs.writeFile(dashboardStatusPath, `# Project Dashboard Status

## Dashboard Information
- **URL**: http://localhost:${PORT}
- **Status**: Active and monitoring
- **Started**: ${new Date().toISOString()}
- **Security**: ${process.env.DASHBOARD_AUTH_ENABLED === 'true' ? 'Enabled' : 'Disabled'}

## Features Active
- ✅ Real-time document monitoring
- ✅ Agent activity tracking
- ✅ Sprint progress visualization
- ✅ Stakeholder decision alerts
- ✅ Live document updates
- ✅ Rate limiting protection
- ✅ Security headers enabled
${process.env.DASHBOARD_AUTH_ENABLED === 'true' ? '- ✅ Authentication required' : '- ⚠️  Authentication disabled'}

## Monitoring
- **Project Documents**: ${PROJECT_DOCS_PATH}
- **WebSocket**: Connected
- **File Watcher**: Active

---
*Dashboard automatically created and ready for AI agent coordination*
`);
  }

  console.log(`✅ Project structure initialized at: ${PROJECT_DOCS_PATH}`);
  logger.info('Project structure initialized', { path: PROJECT_DOCS_PATH, folders: folders.length });
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    if (!healthMonitor) {
      return res.status(503).json({
        status: 'initializing',
        message: 'Health monitor not yet initialized'
      });
    }
    
    const healthStatus = await healthMonitor.performHealthCheck();
    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
    });
  }
});

// Simple health check endpoint (for load balancers)
app.get('/api/health/ping', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Detailed health metrics endpoint
app.get('/api/health/metrics', strictLimiter, async (req, res) => {
  try {
    if (!healthMonitor) {
      return res.status(503).json({
        status: 'initializing',
        message: 'Health monitor not yet initialized'
      });
    }
    
    const status = healthMonitor.getStatus();
    res.json({
      ...status,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        ppid: process.ppid,
        cwd: process.cwd()
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve health metrics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
    });
  }
});

// File watcher for real-time updates
let watcher;
function setupFileWatcher() {
  if (watcher) {
    watcher.close();
  }

  watcher = chokidar.watch(PROJECT_DOCS_PATH, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: false
  });
  
  // Set global flag for health monitor
  global.fileWatcherActive = true;

  watcher
    .on('add', (filePath) => {
      const relativePath = path.relative(PROJECT_DOCS_PATH, filePath);
      console.log(`📄 File added: ${relativePath}`);
      logger.debug('File added', { path: relativePath });
      
      // Log agent activity if it's in a known agent folder
      const folderMatch = relativePath.match(/^(\d+)-([^\/]+)\//);
      if (folderMatch) {
        logAgentActivity('Unknown', 'Document created', { 
          folder: folderMatch[2], 
          file: relativePath 
        });
      }
      
      io.emit('file-added', {
        path: relativePath,
        fullPath: filePath,
        timestamp: new Date().toISOString()
      });
      broadcastFileContent(filePath, 'added');
    })
    .on('change', async (filePath) => {
      const relativePath = path.relative(PROJECT_DOCS_PATH, filePath);
      console.log(`📝 File changed: ${relativePath}`);
      logger.debug('File changed', { path: relativePath });
      
      // Check if it's the progress file
      if (relativePath === path.join('00-orchestration', 'project-progress.json')) {
        await loadProjectProgress();
        io.emit('progress-update', projectProgress);
        console.log('📊 Progress updated:', projectProgress);
        logger.info('Project progress updated', projectProgress);
      }
      
      io.emit('file-changed', {
        path: relativePath,
        fullPath: filePath,
        timestamp: new Date().toISOString()
      });
      broadcastFileContent(filePath, 'changed');
    })
    .on('unlink', (filePath) => {
      const relativePath = path.relative(PROJECT_DOCS_PATH, filePath);
      console.log(`🗑️ File removed: ${relativePath}`);
      logger.warn('File removed', { path: relativePath });
      io.emit('file-removed', {
        path: relativePath,
        timestamp: new Date().toISOString()
      });
    });

  console.log(`👀 File watcher active on: ${PROJECT_DOCS_PATH}`);
}

// Broadcast file content updates
async function broadcastFileContent(filePath, action) {
  try {
    if (path.extname(filePath) === '.md') {
      const content = await fs.readFile(filePath, 'utf8');
      const htmlContent = marked(content);
      const relativePath = path.relative(PROJECT_DOCS_PATH, filePath);
      
      io.emit('document-update', {
        path: relativePath,
        content: content,
        html: htmlContent,
        action: action,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
  }
}

// Secure file path validation
function isPathSafe(filePath, basePath) {
  const resolvedPath = path.resolve(basePath, filePath);
  return resolvedPath.startsWith(basePath);
}

// API Routes with validation
app.get('/api/documents', asyncHandler(async (req, res) => {
  const documents = await getDocumentTree(PROJECT_DOCS_PATH);
  res.json(documents);
}));

app.get('/api/document', asyncHandler(async (req, res) => {
  const filePath = req.query.path;
  
  if (!filePath || typeof filePath !== 'string') {
    throw new AgileError('VAL_001', { field: 'path', reason: 'Path parameter required' });
  }

  const fullPath = path.join(PROJECT_DOCS_PATH, filePath);
  
  // Security check
  if (!isPathSafe(filePath, PROJECT_DOCS_PATH)) {
    throw new AgileError('VAL_002', { attemptedPath: filePath });
  }
  
  if (!await fs.pathExists(fullPath)) {
    throw new AgileError('FS_001', { path: filePath });
  }

  const content = await fs.readFile(fullPath, 'utf8');
  const stats = await fs.stat(fullPath);
  
  res.json({
    path: filePath,
    content: content,
    html: marked(content),
    modified: stats.mtime,
    size: stats.size
  });
}));

// Get version information
app.get('/api/version', async (req, res) => {
  try {
    const versionPath = path.join(__dirname, '..', 'version.json');
    if (await fs.pathExists(versionPath)) {
      const versionData = await fs.readJSON(versionPath);
      res.json(versionData);
    } else {
      res.json({
        version: '4.2.0',
        releaseDate: new Date().toISOString(),
        releaseName: 'Development Build',
        description: 'AgileAiAgents development version'
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to load version information' });
  }
});

// API endpoints for MCP documents
app.get('/api/mcp-document', async (req, res) => {
  try {
    const filePath = req.query.path;
    
    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({ error: 'Invalid path parameter' });
    }

    const fullPath = path.join(MCP_PATH, filePath);
    
    // Security check
    if (!isPathSafe(filePath, MCP_PATH)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!await fs.pathExists(fullPath)) {
      return res.status(404).json({ error: 'MCP document not found' });
    }

    const content = await fs.readFile(fullPath, 'utf8');
    const stats = await fs.stat(fullPath);
    
    res.json({
      path: filePath,
      content: content,
      html: marked(content),
      modified: stats.mtime,
      size: stats.size
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoints for agent documents
app.get('/api/agent-document', async (req, res) => {
  try {
    const filePath = req.query.path;
    
    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({ error: 'Invalid path parameter' });
    }

    const fullPath = path.join(AGENTS_PATH, filePath);
    
    // Security check
    if (!isPathSafe(filePath, AGENTS_PATH)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!await fs.pathExists(fullPath)) {
      return res.status(404).json({ error: 'Agent document not found' });
    }

    const content = await fs.readFile(fullPath, 'utf8');
    const stats = await fs.stat(fullPath);
    
    res.json({
      path: filePath,
      content: content,
      html: marked(content),
      modified: stats.mtime,
      size: stats.size
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoints for system documents
app.get('/api/system-document', async (req, res) => {
  try {
    const filePath = req.query.path;
    
    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({ error: 'Invalid path parameter' });
    }

    const fullPath = path.join(SYSTEM_DOCS_PATH, filePath);
    
    // Security check
    if (!isPathSafe(filePath, SYSTEM_DOCS_PATH)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!await fs.pathExists(fullPath)) {
      return res.status(404).json({ error: 'System document not found' });
    }

    const content = await fs.readFile(fullPath, 'utf8');
    const stats = await fs.stat(fullPath);
    
    res.json({
      path: filePath,
      content: content,
      html: marked(content),
      modified: stats.mtime,
      size: stats.size
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/status', async (req, res) => {
  try {
    // Load version information
    const versionPath = path.join(__dirname, '..', 'version.json');
    let version = '4.2.0';
    let versionInfo = {};
    
    if (await fs.pathExists(versionPath)) {
      const versionData = await fs.readJSON(versionPath);
      version = versionData.version;
      versionInfo = versionData;
    }

    res.json({
      status: 'active',
      version: version,
      versionInfo: versionInfo,
      port: PORT,
      projectPath: PROJECT_DOCS_PATH,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      security: {
        authEnabled: process.env.DASHBOARD_AUTH_ENABLED === 'true',
        rateLimiting: true,
        helmet: true,
        cors: true
      }
    });
  } catch (error) {
    res.json({
      status: 'active',
      version: '4.2.0',
      port: PORT,
      projectPath: PROJECT_DOCS_PATH,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  }
});

// Get document tree structure
async function getDocumentTree(dirPath, basePath = '') {
  const tree = {};
  
  try {
    const items = await fs.readdir(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const relativePath = path.join(basePath, item);
      const stats = await fs.stat(itemPath);
      
      if (stats.isDirectory()) {
        tree[item] = {
          type: 'directory',
          path: relativePath,
          children: await getDocumentTree(itemPath, relativePath)
        };
      } else if (path.extname(item) === '.md') {
        tree[item] = {
          type: 'file',
          path: relativePath,
          modified: stats.mtime,
          size: stats.size
        };
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
  }
  
  return tree;
}

// Progress tracking
let projectProgress = {
  percentage: 0,
  phase: 'Initializing',
  sprint: '-',
  tasksCompleted: 0,
  tasksTotal: 0,
  lastUpdated: new Date().toISOString()
};

// Load progress from file if exists
async function loadProjectProgress() {
  const progressPath = path.join(PROJECT_DOCS_PATH, '00-orchestration', 'project-progress.json');
  try {
    if (await fs.pathExists(progressPath)) {
      projectProgress = await fs.readJSON(progressPath);
      console.log('📊 Loaded project progress:', projectProgress);
    }
  } catch (error) {
    console.error('Failed to load project progress:', error);
  }
}

// Watch for progress updates
async function watchProgressFile() {
  const progressPath = path.join(PROJECT_DOCS_PATH, '00-orchestration', 'project-progress.json');
  
  if (watcher) {
    watcher.add(progressPath);
  }
  
  // Initial load
  await loadProjectProgress();
}

// Socket.IO connection handling with authentication
io.use((socket, next) => {
  if (process.env.DASHBOARD_AUTH_ENABLED === 'true') {
    const auth = socket.handshake.auth;
    // Add socket authentication logic here if needed
  }
  next();
});

io.on('connection', (socket) => {
  console.log('🔌 Dashboard client connected');
  
  socket.emit('dashboard-connected', {
    message: 'Connected to AI Agent Project Dashboard',
    timestamp: new Date().toISOString(),
    projectPath: PROJECT_DOCS_PATH
  });

  // Send initial progress
  socket.emit('progress-update', projectProgress);

  socket.on('disconnect', () => {
    console.log('🔌 Dashboard client disconnected');
  });

  socket.on('request-document-tree', async () => {
    try {
      const tree = await getDocumentTree(PROJECT_DOCS_PATH);
      socket.emit('document-tree', tree);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('request-progress', () => {
    socket.emit('progress-update', projectProgress);
  });

  socket.on('request-mcp-tree', async () => {
    try {
      const mcpFiles = await getMCPFiles();
      socket.emit('mcp-tree', mcpFiles);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('request-agents', async () => {
    try {
      const agents = await getAgentsList();
      socket.emit('agents-list', agents);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('request-system-docs', async () => {
    try {
      const systemDocs = await getSystemDocs();
      socket.emit('system-docs', systemDocs);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
});

// Get MCP files
async function getMCPFiles() {
  const mcpFiles = {};
  try {
    if (await fs.pathExists(MCP_PATH)) {
      const files = await fs.readdir(MCP_PATH);
      for (const file of files) {
        if (file.endsWith('.md') && file !== 'readme.md') {
          const name = file.replace(/-/g, ' ').replace('.md', '').toUpperCase();
          mcpFiles[file] = {
            name: name,
            path: file,
            type: 'mcp'
          };
        }
      }
    }
  } catch (error) {
    console.error('Error reading MCP files:', error.message);
  }
  return mcpFiles;
}

// Get agents list
async function getAgentsList() {
  const agents = [];
  const agentEmojis = {
    'prd_agent': '📋',
    'project_manager_agent': '📊',
    'coder_agent': '💻',
    'testing_agent': '🧪',
    'ui_ux_agent': '🎨',
    'devops_agent': '🚀',
    'security_agent': '🔒',
    'dba_agent': '🗄️',
    'data_engineer_agent': '🏗️',
    'research_agent': '🔍',
    'finance_agent': '💰',
    'analysis_agent': '📈',
    'marketing_agent': '📣',
    'business_documents_agent': '📑',
    'seo_agent': '🔎',
    'ppc_media_buyer_agent': '💸',
    'social_media_agent': '📱',
    'email_marketing_agent': '✉️',
    'revenue_optimization_agent': '💹',
    'customer_lifecycle_agent': '🔄',
    'analytics_growth_intelligence_agent': '📊',
    'api_agent': '🔌',
    'llm_agent': '🤖',
    'mcp_agent': '🔧',
    'ml_agent': '🧠',
    'documentation_agent': '📚',
    'document_manager_agent': '📄',
    'logger_agent': '📝',
    'optimization_agent': '⚡',
    'project_dashboard_agent': '📺',
    'project_analyzer_agent': '🔬',
    'vc_report_agent': '💼',
    'market_validation_agent': '🎯'
  };

  try {
    if (await fs.pathExists(AGENTS_PATH)) {
      const files = await fs.readdir(AGENTS_PATH);
      for (const file of files) {
        if (file.endsWith('_agent.md')) {
          const content = await fs.readFile(path.join(AGENTS_PATH, file), 'utf8');
          const nameMatch = content.match(/^#\s+(.+?)(?:\s+-|$)/m);
          const descMatch = content.match(/##\s+Overview\s*\n+(.+?)(?:\n|$)/m);
          
          const agentKey = file.replace('.md', '');
          const name = nameMatch ? nameMatch[1].trim() : file.replace(/_/g, ' ').replace('.md', '');
          const description = descMatch ? descMatch[1].trim() : 'Specialized AI agent';
          
          // Extract capabilities
          const capabilities = [];
          const capMatch = content.match(/##\s+Core\s+Responsibilities\s*\n+([\s\S]+?)(?=\n##|$)/m);
          if (capMatch) {
            const capLines = capMatch[1].match(/[-*]\s+\*\*(.+?)\*\*/g);
            if (capLines) {
              capabilities.push(...capLines.slice(0, 5).map(line => 
                line.replace(/[-*]\s+\*\*/, '').replace(/\*\*.*/, '').trim()
              ));
            }
          }

          agents.push({
            name: name,
            path: file,
            description: description,
            emoji: agentEmojis[agentKey] || '🤖',
            capabilities: capabilities
          });
        }
      }
    }
  } catch (error) {
    console.error('Error reading agents:', error.message);
  }

  return agents.sort((a, b) => a.name.localeCompare(b.name));
}

// Get system documentation files
async function getSystemDocs() {
  const systemDocs = [];
  const docFiles = [
    'readme.md',
    'claude.md',
    'aaa-documents/auto-project-orchestrator.md',
    'aaa-documents/setup-guide.md',
    'aaa-documents/usage-guide.md',
    'aaa-documents/versioning.md',
    'aaa-documents/changelog.md',
    'aaa-documents/production-ready-tasks.md'
  ];

  try {
    for (const file of docFiles) {
      const filePath = path.join(SYSTEM_DOCS_PATH, file);
      if (await fs.pathExists(filePath)) {
        const displayName = file
          .replace(/-/g, ' ')
          .replace('.md', '')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
          
        systemDocs.push({
          name: displayName,
          path: file,
          type: 'system'
        });
      }
    }
  } catch (error) {
    console.error('Error reading system docs:', error.message);
  }

  return systemDocs;
}

// API endpoint for error statistics
app.get('/api/errors/stats', strictLimiter, (req, res) => {
  const stats = errorHandler.getErrorStats();
  res.json(stats || { message: 'No error statistics available' });
});

// API endpoint for recent errors (development only)
app.get('/api/errors/recent', strictLimiter, (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    throw new AgileError('AUTH_001', { reason: 'Development only endpoint' });
  }
  const count = parseInt(req.query.count) || 10;
  const errors = errorHandler.getRecentErrors(count);
  res.json(errors);
});

// Mount log viewer routes
app.use('/api/logs', logViewer.createRouter());

// Error handling middleware - must be last
app.use(errorHandler.expressErrorHandler());

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
async function startServer() {
  try {
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    if (majorVersion < 16) {
      throw new AgileError('SYS_002', { currentVersion: nodeVersion, requiredVersion: '16.0.0' });
    }

    // Check if .env exists
    const envPath = path.join(__dirname, '..', '.env');
    if (!await fs.pathExists(envPath)) {
      throw new AgileError('CFG_001');
    }

    // Validate port
    const port = parseInt(PORT);
    if (isNaN(port) || port < 1024 || port > 65535) {
      throw new AgileError('CFG_002', { port: PORT });
    }

    await initializeProjectStructure();
    setupFileWatcher();
    await watchProgressFile();
    
    // Initialize health monitor
    healthMonitor = new HealthMonitor(io, PROJECT_DOCS_PATH);
    
    server.listen(PORT, () => {
      console.log('🚀 AI Agent Project Dashboard Started!');
      console.log(`📊 Dashboard URL: http://localhost:${PORT}`);
      console.log(`📁 Monitoring: ${PROJECT_DOCS_PATH}`);
      console.log(`⚡ Real-time updates: Active`);
      console.log(`🔒 Security: ${process.env.DASHBOARD_AUTH_ENABLED === 'true' ? 'Authentication Enabled' : 'Authentication Disabled'}`);
      console.log('');
      console.log('🎯 Features:');
      console.log('   ✅ Live document monitoring');
      console.log('   ✅ Agent activity tracking');
      console.log('   ✅ Real-time progress updates');
      console.log('   ✅ Stakeholder decision alerts');
      console.log('   ✅ Rate limiting protection');
      console.log('   ✅ Security headers');
      console.log('   ✅ Health monitoring system');
      console.log('   ✅ Comprehensive logging system');
      if (process.env.DASHBOARD_AUTH_ENABLED === 'true') {
        console.log('   ✅ Basic authentication');
      }
      console.log('');
      console.log(`📖 Open http://localhost:${PORT} to view dashboard`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📋 Log viewer: http://localhost:${PORT}/logs.html`);
      
      // Log startup
      logger.info('Dashboard started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV,
        authEnabled: process.env.DASHBOARD_AUTH_ENABLED === 'true',
        projectPath: PROJECT_DOCS_PATH,
        nodeVersion: process.version,
        platform: process.platform
      });
      
      // Start periodic health checks
      healthMonitor.startPeriodicChecks(60000); // Check every minute
      
      // Schedule log cleanup (daily at 2 AM)
      setInterval(() => {
        const now = new Date();
        if (now.getHours() === 2 && now.getMinutes() === 0) {
          logger.info('Running scheduled log cleanup');
          logger.cleanupOldLogs(30); // Keep 30 days of logs
        }
      }, 60000); // Check every minute
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ ${new AgileError('NET_001', { port: PORT }).toString()}`);
      } else if (error.code === 'EACCES') {
        console.error(`❌ ${new AgileError('FS_002', { port: PORT }).toString()}`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    if (error instanceof AgileError) {
      console.error(`❌ ${error.toString()}`);
    } else {
      console.error('❌ Failed to start dashboard:', error.message);
    }
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down dashboard...');
  if (healthMonitor) {
    healthMonitor.stopPeriodicChecks();
  }
  if (watcher) {
    watcher.close();
    global.fileWatcherActive = false;
  }
  server.close(() => {
    console.log('✅ Dashboard stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  if (healthMonitor) {
    healthMonitor.stopPeriodicChecks();
  }
  if (watcher) {
    watcher.close();
    global.fileWatcherActive = false;
  }
  server.close(() => {
    console.log('✅ Dashboard stopped');
    process.exit(0);
  });
});

startServer();
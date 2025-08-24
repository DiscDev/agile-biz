const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs-extra');
const chokidar = require('chokidar');
const { marked } = require('marked');
const { gfmHeadingId } = require('marked-gfm-heading-id');
const hljs = require('highlight.js');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const VelocityProfileSelector = require('../machine-data/profile-selector');

const app = express();
const profileSelector = new VelocityProfileSelector();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.DASHBOARD_PORT || process.env.PORT || 3001;
const PROJECT_DOCS_PATH = path.join(__dirname, '..', 'project-documents');
const PROJECT_CONFIG_PATH = path.join(__dirname, '..', 'project-config.json');
const MCP_PATH = path.join(__dirname, '..', 'aaa-mcps');
const AGENTS_PATH = path.join(__dirname, '..', 'ai-agents');
const SYSTEM_DOCS_PATH = path.join(__dirname, '..', 'aaa-documents');

// Load project configuration
let projectConfig = {
  projectName: "My AgileAI Project",
  projectDescription: "",
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString()
};

async function loadProjectConfig() {
  try {
    if (await fs.pathExists(PROJECT_CONFIG_PATH)) {
      projectConfig = await fs.readJSON(PROJECT_CONFIG_PATH);
      console.log(`📋 Loaded project: ${projectConfig.projectName}`);
    } else {
      // Create default config if it doesn't exist
      await fs.writeJSON(PROJECT_CONFIG_PATH, projectConfig, { spaces: 2 });
      console.log('📋 Created default project configuration');
    }
  } catch (error) {
    console.error('Failed to load project config:', error);
  }
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// API routes
const hooksAPI = require('./api/hooks');
const projectStateAPI = require('./api/project-state');
const contextVerificationAPI = require('./api/context-verification');
app.use('/api/hooks', hooksAPI);
app.use('/api/project-state', projectStateAPI);
app.use('/api/context-verification', contextVerificationAPI);

// Configure marked for markdown rendering
marked.use(gfmHeadingId());
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

// Initialize project-documents folder structure
async function initializeProjectStructure() {
  // Category-based folders only (v3.0.0)
  const folders = [
    // Orchestration category
    'orchestration',
    'orchestration/sprints',
    'orchestration/product-backlog',
    'orchestration/product-backlog/backlog-items',
    
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
    'operations/social-media',
    
    // Additional folders
    'analysis-reports',
    'planning'
  ];

  for (const folder of folders) {
    const folderPath = path.join(PROJECT_DOCS_PATH, folder);
    await fs.ensureDir(folderPath);
  }

  // Create initial dashboard status file
  const dashboardStatusPath = path.join(PROJECT_DOCS_PATH, 'orchestration', 'dashboard-status.md');
  if (!await fs.pathExists(dashboardStatusPath)) {
    await fs.writeFile(dashboardStatusPath, `# Project Dashboard Status

## Dashboard Information
- **URL**: http://localhost:${PORT}
- **Status**: Active and monitoring
- **Started**: ${new Date().toISOString()}

## Features Active
- ✅ Real-time document monitoring
- ✅ Agent activity tracking
- ✅ Sprint progress visualization
- ✅ Stakeholder decision alerts
- ✅ Live document updates

## Monitoring
- **Project Documents**: ${PROJECT_DOCS_PATH}
- **WebSocket**: Connected
- **File Watcher**: Active

---
*Dashboard automatically created and ready for AI agent coordination*
`);
  }

  console.log(`✅ Project structure initialized at: ${PROJECT_DOCS_PATH}`);
}

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

  watcher
    .on('add', (filePath) => {
      const relativePath = path.relative(PROJECT_DOCS_PATH, filePath);
      console.log(`📄 File added: ${relativePath}`);
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
      
      // Check if it's the progress file
      if (relativePath === path.join('orchestration', 'persistent.json')) {
        await loadProjectProgress();
        io.emit('progress-update', projectProgress);
        console.log('📊 Progress updated:', projectProgress);
      }
      
      // Check if it's a backlog file
      if (relativePath.includes(path.join('orchestration', 'product-backlog'))) {
        await loadBacklogMetrics();
        io.emit('backlog-update', backlogMetrics);
        console.log('📋 Backlog metrics updated:', backlogMetrics);
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

// API Routes
app.get('/api/documents', async (req, res) => {
  try {
    const documents = await getDocumentTree(PROJECT_DOCS_PATH);
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/document', async (req, res) => {
  try {
    const filePath = req.query.path;
    const fullPath = path.join(PROJECT_DOCS_PATH, filePath);
    
    if (!await fs.pathExists(fullPath)) {
      return res.status(404).json({ error: 'Document not found' });
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
    const fullPath = path.join(MCP_PATH, filePath);
    
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
    const fullPath = path.join(AGENTS_PATH, filePath);
    
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
    const fullPath = path.join(SYSTEM_DOCS_PATH, filePath);
    
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

// API endpoints for guide documents (CLAUDE.md and README.md)
app.get('/api/guide-document', async (req, res) => {
  try {
    const filePath = req.query.path;
    // Guide files are in the parent directory
    const fullPath = path.join(__dirname, '..', filePath);
    
    // Security check - only allow specific files
    const allowedFiles = [
      'CLAUDE.md', 
      'CLAUDE-core.md',
      'CLAUDE-config.md',
      'CLAUDE-agents.md',
      'CLAUDE-reference.md',
      'README.md'
    ];
    if (!allowedFiles.includes(filePath)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (!await fs.pathExists(fullPath)) {
      return res.status(404).json({ error: 'Guide document not found' });
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

// Project configuration endpoints
app.get('/api/project-config', async (req, res) => {
  res.json(projectConfig);
});

app.post('/api/project-config', async (req, res) => {
  try {
    const { projectName, projectDescription } = req.body;
    if (projectName) {
      projectConfig.projectName = projectName;
      projectConfig.projectDescription = projectDescription || projectConfig.projectDescription;
      projectConfig.lastUpdated = new Date().toISOString();
      
      await fs.writeJSON(PROJECT_CONFIG_PATH, projectConfig, { spaces: 2 });
      console.log(`📋 Project config updated: ${projectConfig.projectName}`);
      
      // Notify all connected clients
      io.emit('project-config-update', projectConfig);
      
      res.json({ success: true, config: projectConfig });
    } else {
      res.status(400).json({ error: 'Project name is required' });
    }
  } catch (error) {
    console.error('Failed to update project config:', error);
    res.status(500).json({ error: 'Failed to update project configuration' });
  }
});

// Workflow status endpoint
app.get('/api/workflow/status', async (req, res) => {
  try {
    const statePath = path.join(__dirname, '..', 'project-state', 'runtime.json');
    let workflowState = null;
    
    if (await fs.pathExists(statePath)) {
      const state = await fs.readJSON(statePath);
      workflowState = state.workflow_state || null;
    }
    
    res.json({
      status: 'success',
      workflow: workflowState,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      status: 'success',
      workflow: null,
      timestamp: new Date().toISOString()
    });
  }
});

// API endpoint for velocity profiles
app.get('/api/velocity-profiles', async (req, res) => {
  try {
    const profiles = await profileSelector.getAvailableProfiles();
    res.json({
      status: 'success',
      profiles: profiles
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to load velocity profiles' 
    });
  }
});

// API endpoint to apply velocity profile
app.post('/api/apply-velocity-profile', async (req, res) => {
  try {
    const { profileId } = req.body;
    const velocityPath = path.join(PROJECT_DOCS_PATH, 'orchestration', 'product-backlog', 'persistent.json');
    
    const result = await profileSelector.applyProfile(velocityPath, profileId);
    
    if (result.success) {
      // Reload backlog metrics to reflect changes
      await loadBacklogMetrics();
      io.emit('backlog-update', backlogMetrics);
      
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
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
      timestamp: new Date().toISOString()
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

// Backlog metrics tracking
let backlogMetrics = {
  totalItems: 0,
  totalPoints: 0,
  readyPoints: 0,
  averageVelocity: 0,
  sprintsRemaining: 0,
  velocityProfile: null,
  isUsingCommunityDefaults: false,
  velocityConfidence: 0,
  lastUpdated: new Date().toISOString()
};

// Load progress from file if exists
async function loadProjectProgress() {
  const progressPath = path.join(PROJECT_DOCS_PATH, 'orchestration', 'persistent.json');
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
  const progressPath = path.join(PROJECT_DOCS_PATH, 'orchestration', 'persistent.json');
  
  if (watcher) {
    watcher.add(progressPath);
  }
  
  // Initial load
  await loadProjectProgress();
}

// Load backlog metrics from files
async function loadBacklogMetrics() {
  const backlogStatePath = path.join(PROJECT_DOCS_PATH, 'orchestration', 'product-backlog', 'persistent.json');
  const velocityPath = path.join(PROJECT_DOCS_PATH, 'orchestration', 'product-backlog', 'persistent.json');
  
  try {
    // Load backlog state with defaults if missing
    if (await fs.pathExists(backlogStatePath)) {
      const backlogState = await fs.readJSON(backlogStatePath);
      backlogMetrics.totalItems = backlogState.statistics?.total_items || 0;
      backlogMetrics.totalPoints = backlogState.statistics?.total_points || 0;
      backlogMetrics.readyPoints = backlogState.metrics?.ready_points || 0;
    } else {
      console.log('📋 No persistent.json found, using defaults (0)');
      backlogMetrics.totalItems = 0;
      backlogMetrics.totalPoints = 0;
      backlogMetrics.readyPoints = 0;
    }
    
    // Load velocity metrics with defaults if missing
    if (await fs.pathExists(velocityPath)) {
      const velocityData = await fs.readJSON(velocityPath);
      backlogMetrics.averageVelocity = velocityData.metrics?.average_velocity || 0;
      backlogMetrics.sprintsRemaining = calculateSprintsRemaining();
      
      // Load velocity profile information
      backlogMetrics.velocityProfile = velocityData.meta?.velocity_profile || null;
      backlogMetrics.isUsingCommunityDefaults = velocityData.metrics?.is_community_default || false;
      backlogMetrics.velocityConfidence = velocityData.metrics?.confidence_level || 0;
    } else {
      console.log('📊 No persistent.json found, using defaults (0)');
      backlogMetrics.averageVelocity = 0;
      backlogMetrics.sprintsRemaining = 0;
      backlogMetrics.velocityProfile = null;
      backlogMetrics.isUsingCommunityDefaults = false;
      backlogMetrics.velocityConfidence = 0;
    }
    
    backlogMetrics.lastUpdated = new Date().toISOString();
    console.log('📋 Loaded backlog metrics:', backlogMetrics);
  } catch (error) {
    console.error('❌ Error loading backlog metrics:', error);
    // Set safe defaults on error
    backlogMetrics.totalItems = 0;
    backlogMetrics.totalPoints = 0;
    backlogMetrics.readyPoints = 0;
    backlogMetrics.averageVelocity = 0;
    backlogMetrics.sprintsRemaining = 0;
  }
}

// Calculate sprints remaining with zero velocity handling
function calculateSprintsRemaining() {
  if (backlogMetrics.averageVelocity > 0 && backlogMetrics.totalPoints > 0) {
    return Math.ceil(backlogMetrics.totalPoints / backlogMetrics.averageVelocity);
  }
  return 0;
}

// Watch for backlog updates
async function watchBacklogFiles() {
  const backlogPath = path.join(PROJECT_DOCS_PATH, 'orchestration', 'product-backlog');
  
  if (watcher) {
    watcher.add(backlogPath);
  }
  
  // Initial load
  await loadBacklogMetrics();
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Dashboard client connected');
  
  socket.emit('dashboard-connected', {
    message: 'Connected to AI Agent Project Dashboard',
    timestamp: new Date().toISOString(),
    projectPath: PROJECT_DOCS_PATH,
    projectConfig: projectConfig
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

  socket.on('request-backlog', () => {
    socket.emit('backlog-update', backlogMetrics);
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
    'research_agent': '🔍',
    'finance_agent': '💰',
    'analysis_agent': '📈',
    'marketing_agent': '📣',
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
    'documentation_agent': '📚',
    'logger_agent': '📝',
    'optimization_agent': '⚡',
    'project_dashboard_agent': '📺',
    'project_analyzer_agent': '🔬'
  };

  try {
    if (await fs.pathExists(AGENTS_PATH)) {
      const files = await fs.readdir(AGENTS_PATH);
      for (const file of files) {
        if (file.endsWith('_agent.md')) {
          const content = await fs.readFile(path.join(AGENTS_PATH, file), 'utf8');
          const nameMatch = content.match(/^#\s+(.+?)(?:\s+-|$)/m);
          // Match either Overview or Purpose sections
          const descMatch = content.match(/##\s*.*?(?:Overview|Purpose)\s*\n+([\s\S]*?)(?=\n##|\n\*?This agent follows|$)/m);
          
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
  
  try {
    // Read all files from aaa-documents directory
    const files = await fs.readdir(SYSTEM_DOCS_PATH);
    
    // Process markdown files
    for (const file of files) {
      if (file.endsWith('.md') && !file.toLowerCase().includes('readme')) {
        const filePath = path.join(SYSTEM_DOCS_PATH, file);
        const stats = await fs.stat(filePath);
        
        // Only include files, not directories
        if (stats.isFile()) {
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
    }
    
    // Also check subdirectories
    const subdirs = ['archive', 'markdown-examples', 'workflow-templates'];
    for (const subdir of subdirs) {
      const subdirPath = path.join(SYSTEM_DOCS_PATH, subdir);
      if (await fs.pathExists(subdirPath)) {
        const subdirFiles = await fs.readdir(subdirPath);
        for (const file of subdirFiles) {
          if (file.endsWith('.md')) {
            const displayName = `${subdir}/${file}`
              .replace(/-/g, ' ')
              .replace('.md', '')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
              
            systemDocs.push({
              name: displayName,
              path: `${subdir}/${file}`,
              type: 'system'
            });
          }
        }
      }
    }
    
    // Sort alphabetically
    systemDocs.sort((a, b) => a.name.localeCompare(b.name));
    
  } catch (error) {
    console.error('Error reading system docs:', error.message);
  }

  return systemDocs;
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Dashboard error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
async function startServer() {
  try {
    await loadProjectConfig();
    await initializeProjectStructure();
    setupFileWatcher();
    await watchProgressFile();
    await watchBacklogFiles();
    
    server.listen(PORT, () => {
      console.log('🚀 AI Agent Project Dashboard Started!');
      console.log(`📊 Dashboard URL: http://localhost:${PORT}`);
      console.log(`📁 Monitoring: ${PROJECT_DOCS_PATH}`);
      console.log(`⚡ Real-time updates: Active`);
      console.log('');
      console.log('🎯 Features:');
      console.log('   ✅ Live document monitoring');
      console.log('   ✅ Agent activity tracking');
      console.log('   ✅ Real-time progress updates');
      console.log('   ✅ Stakeholder decision alerts');
      console.log('');
      console.log(`📖 Open http://localhost:${PORT} to view dashboard`);
    });
  } catch (error) {
    console.error('❌ Failed to start dashboard:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down dashboard...');
  if (watcher) {
    watcher.close();
  }
  server.close(() => {
    console.log('✅ Dashboard stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  if (watcher) {
    watcher.close();
  }
  server.close(() => {
    console.log('✅ Dashboard stopped');
    process.exit(0);
  });
});

startServer();
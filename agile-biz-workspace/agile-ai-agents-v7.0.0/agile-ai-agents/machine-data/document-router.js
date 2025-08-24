#!/usr/bin/env node

/**
 * Document Router Service
 * 
 * Central routing service that implements a 4-tier routing strategy to ensure
 * all documents are created in their proper locations within the project structure.
 * 
 * Tiers:
 * 1. Known Document Routing - Uses document-creation-rules.json
 * 2. Pattern-Based Routing - Matches filename patterns
 * 3. AI-Powered Analysis - Analyzes content to determine category
 * 4. Dynamic Folder Creation - Creates new semantic folders when needed
 */

const fs = require('fs').promises;
const path = require('path');

class DocumentRouter {
  constructor(projectRoot = null) {
    this.projectRoot = projectRoot || path.join(__dirname, '..');
    this.projectDocsPath = path.join(this.projectRoot, 'project-documents');
    
    // Load configuration files
    this.loadConfigurations();
    
    // Initialize managers
    this.initializeManagers();
    
    // Track routing decisions for learning
    this.routingHistory = [];
  }

  /**
   * Load all configuration files
   */
  async loadConfigurations() {
    try {
      // Load routing rules
      const rulesPath = path.join(__dirname, 'document-routing-rules.json');
      if (await this.fileExists(rulesPath)) {
        const rulesContent = await fs.readFile(rulesPath, 'utf8');
        this.routingRules = JSON.parse(rulesContent);
      } else {
        this.routingRules = this.getDefaultRoutingRules();
      }

      // Load document creation rules
      const creationRulesPath = path.join(__dirname, 'document-creation-rules.json');
      if (await this.fileExists(creationRulesPath)) {
        const creationContent = await fs.readFile(creationRulesPath, 'utf8');
        this.creationRules = JSON.parse(creationContent);
      } else {
        this.creationRules = { rules: {} };
      }

      // Load folder structure categories
      const categoriesPath = path.join(__dirname, 'project-folder-structure-categories.json');
      if (await this.fileExists(categoriesPath)) {
        const categoriesContent = await fs.readFile(categoriesPath, 'utf8');
        this.folderCategories = JSON.parse(categoriesContent);
      } else {
        this.folderCategories = {};
      }

    } catch (error) {
      console.error('Error loading configurations:', error);
      // Use defaults if loading fails
      this.routingRules = this.getDefaultRoutingRules();
      this.creationRules = { rules: {} };
      this.folderCategories = {};
    }
  }

  /**
   * Initialize manager instances
   */
  async initializeManagers() {
    // Lazy load managers to avoid circular dependencies
    this.lifecycleManager = null;
    this.folderCreationManager = null;
  }

  /**
   * Get lifecycle manager (lazy loading)
   */
  getLifecycleManager() {
    if (!this.lifecycleManager) {
      const DocumentLifecycleManager = require('./document-lifecycle-manager');
      this.lifecycleManager = new DocumentLifecycleManager(this.projectRoot);
    }
    return this.lifecycleManager;
  }

  /**
   * Get folder creation manager (lazy loading)
   */
  getFolderCreationManager() {
    if (!this.folderCreationManager) {
      const FolderCreationManager = require('./folder-creation-manager');
      this.folderCreationManager = new FolderCreationManager(this.projectRoot);
    }
    return this.folderCreationManager;
  }

  /**
   * Main routing method - determines the correct path for a document
   */
  async route(document) {
    const startTime = Date.now();
    const routingLog = {
      timestamp: new Date().toISOString(),
      document: document.fileName,
      agent: document.agent || 'unknown',
      tiers_evaluated: []
    };

    try {
      // Check if document already exists
      const lifecycleManager = this.getLifecycleManager();
      const existing = await lifecycleManager.checkExisting(document);
      if (existing && existing.path) {
        routingLog.result = 'existing';
        routingLog.path = existing.path;
        routingLog.duration_ms = Date.now() - startTime;
        this.logRouting(routingLog);
        return existing.path;
      }

      // Tier 1: Known Document Routing
      routingLog.tiers_evaluated.push('tier1_known');
      const knownPath = await this.checkKnownDocuments(document);
      if (knownPath) {
        routingLog.result = 'tier1';
        routingLog.path = knownPath;
        routingLog.duration_ms = Date.now() - startTime;
        this.logRouting(routingLog);
        return knownPath;
      }

      // Tier 2: Pattern-Based Routing
      routingLog.tiers_evaluated.push('tier2_pattern');
      const patternPath = await this.checkPatterns(document);
      if (patternPath) {
        routingLog.result = 'tier2';
        routingLog.path = patternPath;
        routingLog.duration_ms = Date.now() - startTime;
        this.logRouting(routingLog);
        return patternPath;
      }

      // Tier 3: AI-Powered Analysis
      routingLog.tiers_evaluated.push('tier3_ai');
      const aiPath = await this.analyzeAndRoute(document);
      if (aiPath && await this.folderExists(aiPath)) {
        routingLog.result = 'tier3';
        routingLog.path = aiPath;
        routingLog.duration_ms = Date.now() - startTime;
        this.logRouting(routingLog);
        return aiPath;
      }

      // Tier 4: Dynamic Folder Creation
      routingLog.tiers_evaluated.push('tier4_dynamic');
      const folderCreationManager = this.getFolderCreationManager();
      const dynamicPath = await folderCreationManager.createFolderStructure(document, aiPath);
      
      routingLog.result = 'tier4';
      routingLog.path = dynamicPath;
      routingLog.duration_ms = Date.now() - startTime;
      this.logRouting(routingLog);
      
      return dynamicPath;

    } catch (error) {
      routingLog.error = error.message;
      routingLog.duration_ms = Date.now() - startTime;
      this.logRouting(routingLog);
      throw error;
    }
  }

  /**
   * Tier 1: Check known documents from creation rules
   */
  async checkKnownDocuments(document) {
    // Check if this document has a specific rule
    if (this.creationRules.rules && this.creationRules.rules[document.fileName]) {
      const rule = this.creationRules.rules[document.fileName];
      const sprint = this.getCurrentSprint();
      let path = rule.path;
      
      // Add sprint context if applicable
      if (this.isSprintAwarePath(path)) {
        path = this.addSprintContext(path, sprint);
      }
      
      return path;
    }

    // Check category-based rules
    if (document.category && this.creationRules.categories) {
      const categoryRules = this.creationRules.categories[document.category];
      if (categoryRules && categoryRules[document.fileName]) {
        const sprint = this.getCurrentSprint();
        let path = categoryRules[document.fileName].path;
        
        if (this.isSprintAwarePath(path)) {
          path = this.addSprintContext(path, sprint);
        }
        
        return path;
      }
    }

    return null;
  }

  /**
   * Tier 2: Pattern-based routing
   */
  async checkPatterns(document) {
    const fileName = document.fileName;
    const patterns = this.routingRules.patterns || {};

    for (const [category, patternList] of Object.entries(patterns)) {
      for (const pattern of patternList) {
        // Convert glob pattern to regex
        const regex = this.globToRegex(pattern);
        if (regex.test(fileName)) {
          const sprint = this.getCurrentSprint();
          let basePath = `project-documents/${category}`;
          
          // Determine subcategory based on pattern specifics
          const subcategory = this.determineSubcategory(fileName, category);
          if (subcategory) {
            basePath = `${basePath}/${subcategory}`;
          }
          
          // Add sprint context for certain categories
          if (this.isSprintAwarePath(basePath)) {
            basePath = this.addSprintContext(basePath, sprint);
          }
          
          return path.join(basePath, fileName);
        }
      }
    }

    // Check learned patterns
    if (this.routingRules.learned_patterns) {
      for (const [folderName, info] of Object.entries(this.routingRules.learned_patterns)) {
        if (info.patterns && info.patterns.some(p => fileName.includes(p))) {
          info.usage_count = (info.usage_count || 0) + 1;
          await this.saveRoutingRules();
          return info.path;
        }
      }
    }

    return null;
  }

  /**
   * Tier 3: AI-powered content analysis
   */
  async analyzeAndRoute(document) {
    // Analyze document content and metadata
    const analysis = await this.analyzeDocumentContent(document);
    
    // Determine category based on analysis
    const category = this.determineCategory(analysis);
    const subcategory = this.determineSubcategoryFromAnalysis(analysis, category);
    
    // Build path
    let suggestedPath = path.join('project-documents', category);
    if (subcategory) {
      suggestedPath = path.join(suggestedPath, subcategory);
    }
    
    // Add sprint context if needed
    const sprint = this.getCurrentSprint();
    if (this.isSprintAwarePath(suggestedPath)) {
      suggestedPath = this.addSprintContext(suggestedPath, sprint);
    }
    
    suggestedPath = path.join(suggestedPath, document.fileName);
    
    return suggestedPath;
  }

  /**
   * Analyze document content for routing
   */
  async analyzeDocumentContent(document) {
    const analysis = {
      keywords: [],
      category_signals: {},
      purpose: '',
      tags: []
    };

    // Extract keywords from filename
    const fileNameParts = document.fileName.replace('.md', '').split(/[-_]/);
    analysis.keywords = fileNameParts.filter(part => part.length > 2);

    // Analyze content if provided
    if (document.content) {
      const content = document.content.toLowerCase();
      
      // Category signal detection
      const categoryKeywords = {
        'business-strategy': ['market', 'business', 'strategy', 'revenue', 'customer', 'competitive', 'analysis', 'financial'],
        'implementation': ['technical', 'api', 'database', 'architecture', 'code', 'development', 'design', 'security'],
        'operations': ['deployment', 'monitoring', 'dashboard', 'analytics', 'optimization', 'seo', 'launch'],
        'orchestration': ['sprint', 'coordination', 'planning', 'backlog', 'retrospective', 'agile']
      };

      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        analysis.category_signals[category] = keywords.filter(kw => content.includes(kw)).length;
      }

      // Extract purpose from headers
      const purposeMatch = content.match(/^##?\s+(?:purpose|overview|objective|goal)[:.]?\s*(.+)$/mi);
      if (purposeMatch) {
        analysis.purpose = purposeMatch[1].trim();
      }

      // Extract tags from content
      const tagMatch = content.match(/tags?:\s*\[([^\]]+)\]/i);
      if (tagMatch) {
        analysis.tags = tagMatch[1].split(',').map(tag => tag.trim());
      }
    }

    // Use agent type as additional signal
    if (document.agent) {
      const agentCategoryMap = {
        'research_agent': 'business-strategy',
        'marketing_agent': 'business-strategy',
        'finance_agent': 'business-strategy',
        'coder_agent': 'implementation',
        'testing_agent': 'implementation',
        'security_agent': 'implementation',
        'devops_agent': 'operations',
        'analytics_agent': 'operations',
        'scrum_master_agent': 'orchestration'
      };
      
      const suggestedCategory = agentCategoryMap[document.agent];
      if (suggestedCategory) {
        analysis.category_signals[suggestedCategory] = 
          (analysis.category_signals[suggestedCategory] || 0) + 3;
      }
    }

    return analysis;
  }

  /**
   * Determine category from analysis
   */
  determineCategory(analysis) {
    // Find category with highest signal count
    let maxSignals = 0;
    let selectedCategory = 'implementation'; // default
    
    for (const [category, signals] of Object.entries(analysis.category_signals)) {
      if (signals > maxSignals) {
        maxSignals = signals;
        selectedCategory = category;
      }
    }
    
    return selectedCategory;
  }

  /**
   * Determine subcategory from analysis
   */
  determineSubcategoryFromAnalysis(analysis, category) {
    const subcategoryMap = {
      'business-strategy': {
        keywords: {
          'research': ['market', 'competitive', 'industry', 'trends'],
          'marketing': ['campaign', 'brand', 'content', 'social'],
          'finance': ['cost', 'revenue', 'budget', 'roi'],
          'customer-success': ['retention', 'churn', 'onboarding', 'support']
        }
      },
      'implementation': {
        keywords: {
          'requirements': ['prd', 'stories', 'criteria', 'features'],
          'security': ['threat', 'compliance', 'vulnerability', 'audit'],
          'design': ['ui', 'ux', 'wireframe', 'mockup'],
          'testing': ['test', 'quality', 'coverage', 'validation']
        }
      },
      'operations': {
        keywords: {
          'deployment': ['deploy', 'release', 'rollout', 'production'],
          'analytics': ['metrics', 'kpi', 'dashboard', 'reporting'],
          'monitoring': ['alert', 'logging', 'observability', 'health']
        }
      }
    };

    const categorySubcategories = subcategoryMap[category];
    if (!categorySubcategories) return null;

    // Score each subcategory
    let maxScore = 0;
    let selectedSubcategory = null;

    for (const [subcategory, keywordList] of Object.entries(categorySubcategories.keywords)) {
      const score = keywordList.filter(kw => 
        analysis.keywords.some(keyword => keyword.includes(kw))
      ).length;
      
      if (score > maxScore) {
        maxScore = score;
        selectedSubcategory = subcategory;
      }
    }

    return selectedSubcategory;
  }

  /**
   * Determine subcategory from filename pattern
   */
  determineSubcategory(fileName, category) {
    // Remove extension
    const baseName = fileName.replace(/\.[^.]+$/, '');
    
    // Category-specific subcategory determination
    if (category === 'business-strategy') {
      if (baseName.includes('market') || baseName.includes('competitive')) return 'research';
      if (baseName.includes('marketing') || baseName.includes('brand')) return 'marketing';
      if (baseName.includes('finance') || baseName.includes('cost')) return 'finance';
      if (baseName.includes('customer') || baseName.includes('retention')) return 'customer-success';
    } else if (category === 'implementation') {
      if (baseName.includes('requirement') || baseName.includes('prd')) return 'requirements';
      if (baseName.includes('security') || baseName.includes('threat')) return 'security';
      if (baseName.includes('design') || baseName.includes('ui')) return 'design';
      if (baseName.includes('test') || baseName.includes('quality')) return 'testing';
    } else if (category === 'operations') {
      if (baseName.includes('deploy') || baseName.includes('release')) return 'deployment';
      if (baseName.includes('analytics') || baseName.includes('metrics')) return 'analytics';
      if (baseName.includes('monitor') || baseName.includes('observ')) return 'monitoring';
    }
    
    return null;
  }

  /**
   * Get current sprint from state files
   */
  getCurrentSprint() {
    try {
      // Try workflow state first
      const workflowStatePath = path.join(this.projectRoot, 'project-state', 'workflow-state.json');
      if (require('fs').existsSync(workflowStatePath)) {
        const workflowState = JSON.parse(require('fs').readFileSync(workflowStatePath, 'utf8'));
        if (workflowState.current_sprint) {
          return workflowState.current_sprint;
        }
      }

      // Try current state
      const currentStatePath = path.join(this.projectRoot, 'project-state', 'current-state.json');
      if (require('fs').existsSync(currentStatePath)) {
        const currentState = JSON.parse(require('fs').readFileSync(currentStatePath, 'utf8'));
        if (currentState.sprint) {
          return currentState.sprint;
        }
      }
    } catch (error) {
      console.error('Error reading sprint state:', error);
    }

    // Default sprint
    return 'sprint-001';
  }

  /**
   * Check if path should be sprint-aware
   */
  isSprintAwarePath(path) {
    const sprintAwarePaths = this.routingRules.sprint_aware_paths || [
      'orchestration/sprints/',
      'implementation/features/',
      'business-strategy/research/'
    ];
    
    return sprintAwarePaths.some(p => path.includes(p));
  }

  /**
   * Add sprint context to path
   */
  addSprintContext(basePath, sprint) {
    // For orchestration/sprints, add sprint folder
    if (basePath.includes('orchestration/sprints')) {
      return path.join(basePath, sprint);
    }
    
    // For other paths, add sprint as subfolder
    return path.join(basePath, sprint);
  }

  /**
   * Check if folder exists
   */
  async folderExists(folderPath) {
    try {
      // Extract directory from full path if it includes filename
      const dirPath = folderPath.endsWith('.md') ? path.dirname(folderPath) : folderPath;
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath) {
    try {
      await fs.stat(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Convert glob pattern to regex
   */
  globToRegex(pattern) {
    const escaped = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${escaped}$`);
  }

  /**
   * Log routing decision
   */
  logRouting(routingLog) {
    this.routingHistory.push(routingLog);
    
    // Keep only last 100 entries in memory
    if (this.routingHistory.length > 100) {
      this.routingHistory.shift();
    }
    
    // Log to console in verbose mode
    if (process.env.VERBOSE === 'true' || process.env.DEBUG === 'true') {
      console.log('[Document Router]', JSON.stringify(routingLog, null, 2));
    }
  }

  /**
   * Save updated routing rules
   */
  async saveRoutingRules() {
    try {
      const rulesPath = path.join(__dirname, 'document-routing-rules.json');
      await fs.writeFile(rulesPath, JSON.stringify(this.routingRules, null, 2));
    } catch (error) {
      console.error('Error saving routing rules:', error);
    }
  }

  /**
   * Get default routing rules
   */
  getDefaultRoutingRules() {
    return {
      version: "1.0.0",
      patterns: {
        "business-strategy": [
          "*-analysis.md",
          "*-research.md",
          "*-strategy.md",
          "market-*.md",
          "competitive-*.md"
        ],
        "implementation": [
          "*-implementation.md",
          "*-architecture.md",
          "*-design.md",
          "api-*.md",
          "database-*.md"
        ],
        "operations": [
          "*-dashboard.md",
          "*-monitoring.md",
          "*-deployment.md",
          "ci-cd-*.md"
        ],
        "orchestration": [
          "sprint-*.md",
          "*-coordination.md",
          "*-planning.md",
          "backlog-*.md"
        ]
      },
      freshness_thresholds: {
        "market-analysis": 30,
        "competitive-analysis": 60,
        "technical-documentation": 90,
        "financial-projections": 30,
        "user-research": 45,
        "security-audit": 90,
        "api-documentation": 120,
        "deployment-guide": 60
      },
      sprint_aware_paths: [
        "orchestration/sprints/",
        "implementation/features/",
        "business-strategy/research/"
      ],
      learned_patterns: {},
      folder_creation: {
        enabled: true,
        all_agents_can_create: true,
        semantic_naming: true,
        kebab_case: true,
        no_depth_limit: true,
        auto_consolidation_threshold: 5
      }
    };
  }

  /**
   * Get routing statistics
   */
  getStatistics() {
    const stats = {
      total_routed: this.routingHistory.length,
      by_tier: {
        existing: 0,
        tier1: 0,
        tier2: 0,
        tier3: 0,
        tier4: 0
      },
      average_duration_ms: 0,
      errors: 0
    };

    let totalDuration = 0;
    for (const entry of this.routingHistory) {
      if (entry.result) {
        stats.by_tier[entry.result] = (stats.by_tier[entry.result] || 0) + 1;
      }
      if (entry.error) {
        stats.errors++;
      }
      if (entry.duration_ms) {
        totalDuration += entry.duration_ms;
      }
    }

    if (this.routingHistory.length > 0) {
      stats.average_duration_ms = Math.round(totalDuration / this.routingHistory.length);
    }

    return stats;
  }
}

// Export for use by other modules
module.exports = DocumentRouter;

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const router = new DocumentRouter();
  
  (async () => {
    try {
      switch (command) {
        case 'route':
          if (args.length < 2) {
            console.error('Usage: route <filename> [agent] [category]');
            process.exit(1);
          }
          
          const document = {
            fileName: args[1],
            agent: args[2] || 'unknown',
            category: args[3],
            content: '' // Would read from file in real usage
          };
          
          const path = await router.route(document);
          console.log('Routed to:', path);
          break;
          
        case 'stats':
          const stats = router.getStatistics();
          console.log('Routing Statistics:', JSON.stringify(stats, null, 2));
          break;
          
        case 'test':
          // Test routing for common documents
          const testDocs = [
            { fileName: 'market-analysis.md', agent: 'research_agent' },
            { fileName: 'api-design.md', agent: 'api_agent' },
            { fileName: 'sprint-001-planning.md', agent: 'scrum_master_agent' },
            { fileName: 'deployment-guide.md', agent: 'devops_agent' }
          ];
          
          console.log('Testing document routing:\n');
          for (const doc of testDocs) {
            const path = await router.route(doc);
            console.log(`${doc.fileName} → ${path}`);
          }
          break;
          
        default:
          console.log('Usage: node document-router.js <command>');
          console.log('Commands:');
          console.log('  route <filename> [agent] [category] - Route a document');
          console.log('  stats                               - Show routing statistics');
          console.log('  test                                - Test common routing scenarios');
          break;
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}
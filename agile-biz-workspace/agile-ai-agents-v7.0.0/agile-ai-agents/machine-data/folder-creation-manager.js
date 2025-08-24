#!/usr/bin/env node

/**
 * Folder Creation Manager
 * 
 * Implements Tier 4 of the Document Router - Dynamic Folder Creation
 * Creates semantic folder structures when no existing folder matches
 * Tracks folder creation patterns and suggests consolidation
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

class FolderCreationManager {
  constructor(projectRoot = null) {
    this.projectRoot = projectRoot || path.join(__dirname, '..');
    this.projectDocsPath = path.join(this.projectRoot, 'project-documents');
    this.trackerPath = path.join(__dirname, 'folder-consolidation-tracker.json');
    this.routingRulesPath = path.join(__dirname, 'document-routing-rules.json');
    
    // Load configurations
    this.loadConfigurations();
    
    // Consolidation settings
    this.consolidationThreshold = 5; // Suggest consolidation after 5 similar folders
    this.similarityThreshold = 0.8; // 80% similarity for folder matching
  }

  /**
   * Load configurations
   */
  async loadConfigurations() {
    try {
      // Load consolidation tracker
      if (fsSync.existsSync(this.trackerPath)) {
        const trackerContent = await fs.readFile(this.trackerPath, 'utf8');
        this.consolidationTracker = JSON.parse(trackerContent);
      } else {
        this.consolidationTracker = this.getDefaultTracker();
      }

      // Load routing rules
      if (fsSync.existsSync(this.routingRulesPath)) {
        const rulesContent = await fs.readFile(this.routingRulesPath, 'utf8');
        this.routingRules = JSON.parse(rulesContent);
      } else {
        this.routingRules = { learned_patterns: {} };
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
      this.consolidationTracker = this.getDefaultTracker();
      this.routingRules = { learned_patterns: {} };
    }
  }

  /**
   * Create folder structure dynamically (Tier 4)
   */
  async createFolderStructure(document, suggestedPath) {
    const creationLog = {
      timestamp: new Date().toISOString(),
      document: document.fileName,
      agent: document.agent || 'unknown',
      suggestedPath: suggestedPath
    };

    try {
      // Analyze document for semantic understanding
      const analysis = await this.analyzeDocument(document);
      
      // 1. Determine parent category
      const parentCategory = this.determineParentCategory(analysis, document);
      creationLog.parentCategory = parentCategory;
      
      // 2. Generate semantic folder name
      const folderName = this.generateSemanticFolderName(document, analysis);
      creationLog.generatedFolderName = folderName;
      
      // 3. Check for similar existing folders
      const similar = await this.findSimilarFolders(folderName, parentCategory);
      creationLog.similarFoldersFound = similar.length;
      
      if (similar.length > 0) {
        // Select best match from similar folders
        const bestMatch = this.selectBestMatch(similar, analysis);
        
        if (bestMatch.similarity > this.similarityThreshold) {
          // Use existing folder instead of creating new one
          await this.logConsolidationSuggestion(folderName, bestMatch.path);
          creationLog.action = 'used_existing';
          creationLog.selectedPath = bestMatch.path;
          
          const fullPath = path.join(bestMatch.path, document.fileName);
          console.log(`📁 Using existing folder: ${bestMatch.path} (${Math.round(bestMatch.similarity * 100)}% match)`);
          
          return fullPath;
        }
      }
      
      // 4. Create new folder structure
      const folderPath = path.join('project-documents', parentCategory, folderName);
      const sprintPath = this.addSprintContext(folderPath, document.sprint);
      const fullFolderPath = path.join(this.projectRoot, sprintPath);
      
      // Create folder with metadata
      await this.createFolderWithMetadata(fullFolderPath, {
        created_by: document.agent,
        created_for: document.fileName,
        purpose: analysis.purpose,
        semantic_tags: analysis.tags,
        auto_created: true,
        created_at: new Date().toISOString(),
        parent_category: parentCategory,
        folder_name: folderName
      });
      
      creationLog.action = 'created_new';
      creationLog.createdPath = sprintPath;
      
      // 5. Update routing rules for learning
      await this.updateRoutingRules(folderName, sprintPath, analysis.patterns);
      
      // 6. Track for consolidation
      await this.trackFolderCreation(sprintPath, document, analysis);
      
      // 7. Check if consolidation is needed
      await this.checkConsolidationNeeded(parentCategory);
      
      const fullPath = path.join(sprintPath, document.fileName);
      console.log(`✨ Created new folder: ${sprintPath}`);
      
      // Save creation log
      this.consolidationTracker.creation_log = this.consolidationTracker.creation_log || [];
      this.consolidationTracker.creation_log.push(creationLog);
      await this.saveConsolidationTracker();
      
      return fullPath;
      
    } catch (error) {
      creationLog.error = error.message;
      console.error('Error creating folder structure:', error);
      
      // Fallback to suggested path
      return suggestedPath || path.join('project-documents', 'uncategorized', document.fileName);
    }
  }

  /**
   * Analyze document for semantic understanding
   */
  async analyzeDocument(document) {
    const analysis = {
      keywords: [],
      patterns: [],
      purpose: '',
      tags: [],
      domain_signals: {},
      technical_signals: {}
    };

    // Extract from filename
    const fileNameBase = document.fileName.replace(/\.[^.]+$/, '');
    const parts = fileNameBase.split(/[-_]/);
    analysis.keywords = parts.filter(p => p.length > 2);
    
    // Identify patterns in filename
    if (fileNameBase.includes('analysis')) analysis.patterns.push('analysis');
    if (fileNameBase.includes('strategy')) analysis.patterns.push('strategy');
    if (fileNameBase.includes('implementation')) analysis.patterns.push('implementation');
    if (fileNameBase.includes('design')) analysis.patterns.push('design');
    if (fileNameBase.includes('test')) analysis.patterns.push('testing');
    if (fileNameBase.includes('api')) analysis.patterns.push('api');
    if (fileNameBase.includes('dashboard')) analysis.patterns.push('dashboard');
    
    // Analyze content if available
    if (document.content) {
      const content = document.content.toLowerCase();
      
      // Domain detection
      const domains = {
        'blockchain': ['blockchain', 'crypto', 'smart contract', 'web3', 'defi'],
        'ai-ml': ['machine learning', 'artificial intelligence', 'neural', 'model', 'training'],
        'cloud': ['aws', 'azure', 'gcp', 'kubernetes', 'docker', 'serverless'],
        'mobile': ['ios', 'android', 'react native', 'flutter', 'mobile app'],
        'web': ['react', 'vue', 'angular', 'frontend', 'backend', 'fullstack'],
        'data': ['database', 'analytics', 'etl', 'data pipeline', 'warehouse'],
        'security': ['authentication', 'encryption', 'vulnerability', 'penetration', 'compliance'],
        'payment': ['stripe', 'payment', 'billing', 'subscription', 'checkout']
      };
      
      for (const [domain, keywords] of Object.entries(domains)) {
        const matches = keywords.filter(kw => content.includes(kw)).length;
        if (matches > 0) {
          analysis.domain_signals[domain] = matches;
        }
      }
      
      // Technical level detection
      analysis.technical_signals = {
        high_level: (content.match(/strategy|planning|roadmap|vision/g) || []).length,
        mid_level: (content.match(/architecture|design|integration|workflow/g) || []).length,
        low_level: (content.match(/implementation|code|function|class|method/g) || []).length
      };
      
      // Extract purpose if mentioned
      const purposeMatch = content.match(/(?:purpose|goal|objective)[:.\s]+([^.\n]+)/i);
      if (purposeMatch) {
        analysis.purpose = purposeMatch[1].trim();
      }
    }
    
    // Client-specific detection
    if (document.client || fileNameBase.match(/^[a-z]+-corp|^[a-z]+-inc|^[a-z]+-ltd/)) {
      const clientMatch = fileNameBase.match(/^([a-z]+)-(?:corp|inc|ltd)/);
      if (clientMatch) {
        analysis.client = clientMatch[1];
      } else if (document.client) {
        analysis.client = document.client.toLowerCase().replace(/\s+/g, '-');
      }
    }
    
    return analysis;
  }

  /**
   * Determine parent category
   */
  determineParentCategory(analysis, document) {
    // Priority order for category determination
    
    // 1. Check for orchestration signals
    if (document.agent === 'scrum_master_agent' || 
        analysis.keywords.some(k => ['sprint', 'backlog', 'retrospective'].includes(k))) {
      return 'orchestration';
    }
    
    // 2. Check technical signals for implementation
    if (analysis.technical_signals && analysis.technical_signals.low_level > 2) {
      return 'implementation';
    }
    
    // 3. Check for operations signals
    if (analysis.patterns.includes('dashboard') || 
        analysis.keywords.some(k => ['deployment', 'monitoring', 'analytics'].includes(k))) {
      return 'operations';
    }
    
    // 4. Default to business-strategy for high-level documents
    if (analysis.technical_signals && analysis.technical_signals.high_level > 2) {
      return 'business-strategy';
    }
    
    // 5. Agent-based fallback
    const agentCategoryMap = {
      'research_agent': 'business-strategy',
      'marketing_agent': 'business-strategy',
      'finance_agent': 'business-strategy',
      'coder_agent': 'implementation',
      'testing_agent': 'implementation',
      'ui_ux_agent': 'implementation',
      'devops_agent': 'operations',
      'analytics_agent': 'operations'
    };
    
    if (document.agent && agentCategoryMap[document.agent]) {
      return agentCategoryMap[document.agent];
    }
    
    // Default
    return 'implementation';
  }

  /**
   * Generate semantic folder name
   */
  generateSemanticFolderName(document, analysis) {
    let folderName = '';
    
    // Client-specific folder
    if (analysis.client) {
      folderName = `${analysis.client}-requirements`;
      return this.toKebabCase(folderName);
    }
    
    // Domain-specific folder
    const topDomain = this.getTopDomain(analysis.domain_signals);
    if (topDomain) {
      // Combine domain with primary pattern
      const primaryPattern = analysis.patterns[0] || 'docs';
      folderName = `${topDomain}-${primaryPattern}`;
      return this.toKebabCase(folderName);
    }
    
    // Pattern-based folder
    if (analysis.patterns.length > 0) {
      // Use most specific pattern
      const patterns = analysis.patterns;
      if (patterns.includes('api')) {
        const apiType = analysis.keywords.find(k => ['rest', 'graphql', 'grpc'].includes(k));
        folderName = apiType ? `${apiType}-api` : 'api-integration';
      } else if (patterns.includes('testing')) {
        const testType = analysis.keywords.find(k => ['unit', 'integration', 'e2e'].includes(k));
        folderName = testType ? `${testType}-testing` : 'testing-suite';
      } else {
        // Combine top 2-3 keywords
        const relevantKeywords = analysis.keywords
          .filter(k => k.length > 3 && !['document', 'file', 'page'].includes(k))
          .slice(0, 3);
        folderName = relevantKeywords.join('-');
      }
    }
    
    // Fallback to keywords
    if (!folderName && analysis.keywords.length > 0) {
      folderName = analysis.keywords.slice(0, 3).join('-');
    }
    
    // Final fallback
    if (!folderName) {
      const timestamp = new Date().toISOString().split('T')[0];
      folderName = `auto-${timestamp}`;
    }
    
    return this.toKebabCase(folderName);
  }

  /**
   * Get top domain from signals
   */
  getTopDomain(domainSignals) {
    if (!domainSignals || Object.keys(domainSignals).length === 0) {
      return null;
    }
    
    let maxSignals = 0;
    let topDomain = null;
    
    for (const [domain, signals] of Object.entries(domainSignals)) {
      if (signals > maxSignals) {
        maxSignals = signals;
        topDomain = domain;
      }
    }
    
    return topDomain;
  }

  /**
   * Convert to kebab-case
   */
  toKebabCase(str) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-');
  }

  /**
   * Find similar existing folders
   */
  async findSimilarFolders(folderName, parentCategory) {
    const similar = [];
    
    try {
      const categoryPath = path.join(this.projectDocsPath, parentCategory);
      
      if (fsSync.existsSync(categoryPath)) {
        const entries = await fs.readdir(categoryPath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const similarity = this.calculateSimilarity(folderName, entry.name);
            
            if (similarity > 0.5) { // 50% minimum similarity to consider
              similar.push({
                name: entry.name,
                path: path.join('project-documents', parentCategory, entry.name),
                similarity: similarity
              });
            }
          }
        }
      }
      
      // Also check tracked folders
      for (const tracked of this.consolidationTracker.created_folders) {
        if (tracked.parent_category === parentCategory) {
          const folderBaseName = path.basename(tracked.path);
          const similarity = this.calculateSimilarity(folderName, folderBaseName);
          
          if (similarity > 0.5 && !similar.some(s => s.name === folderBaseName)) {
            similar.push({
              name: folderBaseName,
              path: tracked.path,
              similarity: similarity,
              metadata: tracked.metadata
            });
          }
        }
      }
    } catch (error) {
      console.error('Error finding similar folders:', error);
    }
    
    return similar.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Calculate similarity between two folder names
   */
  calculateSimilarity(name1, name2) {
    // Normalize names
    const norm1 = name1.toLowerCase().replace(/[-_]/g, '');
    const norm2 = name2.toLowerCase().replace(/[-_]/g, '');
    
    // Exact match
    if (norm1 === norm2) return 1.0;
    
    // Check if one contains the other
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
      const longer = norm1.length > norm2.length ? norm1 : norm2;
      const shorter = norm1.length > norm2.length ? norm2 : norm1;
      return shorter.length / longer.length;
    }
    
    // Levenshtein distance
    const distance = this.levenshteinDistance(norm1, norm2);
    const maxLength = Math.max(norm1.length, norm2.length);
    const similarity = 1 - (distance / maxLength);
    
    return Math.max(0, similarity);
  }

  /**
   * Calculate Levenshtein distance
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Select best match from similar folders
   */
  selectBestMatch(similar, analysis) {
    if (similar.length === 0) return null;
    
    // Score each match based on multiple factors
    const scored = similar.map(folder => {
      let score = folder.similarity;
      
      // Boost score if metadata matches
      if (folder.metadata) {
        if (folder.metadata.semantic_tags) {
          const tagMatches = folder.metadata.semantic_tags.filter(tag =>
            analysis.tags.includes(tag) || analysis.keywords.includes(tag)
          ).length;
          score += tagMatches * 0.1;
        }
      }
      
      // Boost score if recently used
      const recentUsage = this.getRecentUsage(folder.path);
      if (recentUsage > 0) {
        score += Math.min(0.2, recentUsage * 0.05);
      }
      
      return {
        ...folder,
        finalScore: Math.min(1.0, score)
      };
    });
    
    // Return highest scoring match
    scored.sort((a, b) => b.finalScore - a.finalScore);
    return {
      ...scored[0],
      similarity: scored[0].finalScore
    };
  }

  /**
   * Get recent usage count for a folder
   */
  getRecentUsage(folderPath) {
    const recentDays = 7;
    const cutoff = new Date(Date.now() - recentDays * 24 * 60 * 60 * 1000);
    
    return this.consolidationTracker.created_folders.filter(f =>
      f.path === folderPath && new Date(f.created_at) > cutoff
    ).length;
  }

  /**
   * Create folder with metadata
   */
  async createFolderWithMetadata(folderPath, metadata) {
    try {
      // Create folder
      await fs.mkdir(folderPath, { recursive: true });
      
      // Save metadata
      const metadataPath = path.join(folderPath, '.folder-metadata.json');
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      
      console.log(`📁 Created folder: ${path.relative(this.projectRoot, folderPath)}`);
      
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  /**
   * Add sprint context to path
   */
  addSprintContext(folderPath, sprint) {
    if (!sprint) {
      sprint = this.getCurrentSprint();
    }
    
    // For orchestration/sprints, special handling
    if (folderPath.includes('orchestration') && !folderPath.includes('sprints')) {
      return folderPath; // Don't add sprint to non-sprint orchestration folders
    }
    
    // For paths that should be sprint-aware
    const sprintAwarePaths = [
      'orchestration/sprints',
      'implementation/features',
      'business-strategy/research'
    ];
    
    const shouldAddSprint = sprintAwarePaths.some(p => folderPath.includes(p));
    
    if (shouldAddSprint) {
      return path.join(folderPath, sprint);
    }
    
    return folderPath;
  }

  /**
   * Get current sprint
   */
  getCurrentSprint() {
    try {
      const workflowStatePath = path.join(this.projectRoot, 'project-state', 'workflow-state.json');
      if (fsSync.existsSync(workflowStatePath)) {
        const workflowState = JSON.parse(fsSync.readFileSync(workflowStatePath, 'utf8'));
        if (workflowState.current_sprint) {
          return workflowState.current_sprint;
        }
      }
    } catch (error) {
      // Silent fail
    }
    return 'sprint-001';
  }

  /**
   * Update routing rules with learned patterns
   */
  async updateRoutingRules(folderName, folderPath, patterns) {
    if (!this.routingRules.learned_patterns) {
      this.routingRules.learned_patterns = {};
    }
    
    this.routingRules.learned_patterns[folderName] = {
      path: folderPath,
      patterns: patterns,
      created: new Date().toISOString(),
      usage_count: 1
    };
    
    try {
      await fs.writeFile(
        this.routingRulesPath,
        JSON.stringify(this.routingRules, null, 2)
      );
    } catch (error) {
      console.error('Error updating routing rules:', error);
    }
  }

  /**
   * Track folder creation
   */
  async trackFolderCreation(folderPath, document, analysis) {
    const tracking = {
      path: folderPath,
      created_at: new Date().toISOString(),
      created_by: document.agent || 'unknown',
      created_for: document.fileName,
      parent_category: this.determineParentCategory(analysis, document),
      semantic_name: path.basename(folderPath),
      metadata: {
        purpose: analysis.purpose,
        semantic_tags: analysis.tags,
        patterns: analysis.patterns,
        domain_signals: analysis.domain_signals
      }
    };
    
    this.consolidationTracker.created_folders.push(tracking);
    this.consolidationTracker.metrics.total_folders_created++;
    
    await this.saveConsolidationTracker();
  }

  /**
   * Check if consolidation is needed
   */
  async checkConsolidationNeeded(category) {
    const folders = await this.getFoldersByCategory(category);
    const groups = this.groupSimilarFolders(folders);
    
    for (const group of groups) {
      if (group.folders.length >= this.consolidationThreshold) {
        await this.suggestConsolidation(group);
      }
    }
  }

  /**
   * Get folders by category
   */
  async getFoldersByCategory(category) {
    const folders = [];
    const categoryPath = path.join(this.projectDocsPath, category);
    
    try {
      if (fsSync.existsSync(categoryPath)) {
        const entries = await fs.readdir(categoryPath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (entry.isDirectory()) {
            folders.push({
              name: entry.name,
              path: path.join(category, entry.name),
              fullPath: path.join(categoryPath, entry.name)
            });
          }
        }
      }
    } catch (error) {
      console.error('Error getting folders:', error);
    }
    
    return folders;
  }

  /**
   * Group similar folders
   */
  groupSimilarFolders(folders) {
    const groups = [];
    const processed = new Set();
    
    for (const folder of folders) {
      if (processed.has(folder.name)) continue;
      
      const group = {
        commonName: folder.name,
        folders: [folder]
      };
      
      processed.add(folder.name);
      
      // Find similar folders
      for (const other of folders) {
        if (processed.has(other.name)) continue;
        
        const similarity = this.calculateSimilarity(folder.name, other.name);
        if (similarity > this.similarityThreshold) {
          group.folders.push(other);
          processed.add(other.name);
        }
      }
      
      if (group.folders.length > 1) {
        groups.push(group);
      }
    }
    
    return groups;
  }

  /**
   * Suggest consolidation
   */
  async suggestConsolidation(group) {
    const suggestion = {
      timestamp: new Date().toISOString(),
      folders: group.folders.map(f => f.path),
      suggested_name: this.determineBestConsolidationName(group),
      reason: `${group.folders.length} similar folders detected`,
      action: 'Consider consolidating these folders',
      potential_savings: {
        folders_reduced: group.folders.length - 1,
        complexity_reduction: 'high'
      }
    };
    
    this.consolidationTracker.suggestions.push(suggestion);
    this.consolidationTracker.metrics.consolidations_suggested++;
    
    await this.saveConsolidationTracker();
    
    console.log(`📁 Consolidation suggested: ${group.folders.length} similar folders`);
    console.log(`   Folders: ${group.folders.map(f => f.name).join(', ')}`);
    console.log(`   Suggested name: ${suggestion.suggested_name}`);
  }

  /**
   * Determine best consolidation name
   */
  determineBestConsolidationName(group) {
    // Find the most common base name
    const nameParts = {};
    
    for (const folder of group.folders) {
      const parts = folder.name.split('-');
      for (const part of parts) {
        nameParts[part] = (nameParts[part] || 0) + 1;
      }
    }
    
    // Sort by frequency
    const sortedParts = Object.entries(nameParts)
      .sort((a, b) => b[1] - a[1])
      .filter(([part, count]) => count >= group.folders.length / 2)
      .map(([part]) => part);
    
    return sortedParts.slice(0, 3).join('-') || group.commonName;
  }

  /**
   * Log consolidation suggestion
   */
  async logConsolidationSuggestion(proposedName, existingPath) {
    const log = {
      timestamp: new Date().toISOString(),
      proposed: proposedName,
      selected: existingPath,
      reason: 'High similarity to existing folder'
    };
    
    this.consolidationTracker.consolidation_history.push(log);
    await this.saveConsolidationTracker();
  }

  /**
   * Save consolidation tracker
   */
  async saveConsolidationTracker() {
    try {
      await fs.writeFile(
        this.trackerPath,
        JSON.stringify(this.consolidationTracker, null, 2)
      );
    } catch (error) {
      console.error('Error saving consolidation tracker:', error);
    }
  }

  /**
   * Get default tracker
   */
  getDefaultTracker() {
    return {
      version: '1.0.0',
      created_folders: [],
      suggestions: [],
      consolidation_history: [],
      creation_log: [],
      metrics: {
        total_folders_created: 0,
        consolidations_suggested: 0,
        consolidations_applied: 0
      }
    };
  }

  /**
   * Review consolidation suggestions
   */
  async reviewConsolidations() {
    const suggestions = this.consolidationTracker.suggestions.filter(s =>
      !s.reviewed && !s.applied
    );
    
    if (suggestions.length === 0) {
      console.log('✅ No pending consolidation suggestions');
      return;
    }
    
    console.log(`📁 ${suggestions.length} Consolidation Suggestions:\n`);
    
    for (const [index, suggestion] of suggestions.entries()) {
      console.log(`${index + 1}. Consolidate ${suggestion.folders.length} folders:`);
      console.log(`   Folders: ${suggestion.folders.join(', ')}`);
      console.log(`   Suggested: ${suggestion.suggested_name}`);
      console.log(`   Reason: ${suggestion.reason}`);
      console.log(`   Potential: Save ${suggestion.potential_savings.folders_reduced} folders\n`);
    }
    
    return suggestions;
  }

  /**
   * Apply consolidation
   */
  async applyConsolidation(suggestionIndex) {
    const suggestion = this.consolidationTracker.suggestions[suggestionIndex];
    if (!suggestion) {
      throw new Error('Invalid suggestion index');
    }
    
    console.log(`🔄 Applying consolidation for ${suggestion.folders.length} folders...`);
    
    // Mark as applied
    suggestion.applied = true;
    suggestion.applied_at = new Date().toISOString();
    this.consolidationTracker.metrics.consolidations_applied++;
    
    await this.saveConsolidationTracker();
    
    console.log('✅ Consolidation marked as applied. Manual folder reorganization required.');
    
    return suggestion;
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      ...this.consolidationTracker.metrics,
      pending_suggestions: this.consolidationTracker.suggestions.filter(s =>
        !s.reviewed && !s.applied
      ).length,
      total_suggestions: this.consolidationTracker.suggestions.length,
      recent_creations: this.consolidationTracker.created_folders.filter(f => {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return new Date(f.created_at) > dayAgo;
      }).length
    };
  }
}

// Export for use by other modules
module.exports = FolderCreationManager;

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const manager = new FolderCreationManager();
  
  (async () => {
    try {
      switch (command) {
        case 'consolidate':
          await manager.reviewConsolidations();
          break;
          
        case 'apply':
          if (args.length < 2) {
            console.error('Usage: apply <suggestion-index>');
            process.exit(1);
          }
          const result = await manager.applyConsolidation(parseInt(args[1]) - 1);
          console.log('Applied:', result);
          break;
          
        case 'stats':
          const stats = manager.getStatistics();
          console.log('📊 Folder Creation Statistics:', JSON.stringify(stats, null, 2));
          break;
          
        case 'test':
          // Test folder creation
          const testDoc = {
            fileName: 'blockchain-integration-analysis.md',
            agent: 'research_agent',
            content: 'Analysis of blockchain integration options...'
          };
          
          const analysis = await manager.analyzeDocument(testDoc);
          console.log('Analysis:', JSON.stringify(analysis, null, 2));
          
          const folderName = manager.generateSemanticFolderName(testDoc, analysis);
          console.log('Generated folder name:', folderName);
          break;
          
        default:
          console.log('Usage: node folder-creation-manager.js <command>');
          console.log('Commands:');
          console.log('  consolidate       - Review consolidation suggestions');
          console.log('  apply <index>     - Apply a consolidation');
          console.log('  stats            - Show statistics');
          console.log('  test             - Test folder name generation');
          break;
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}
/**
 * Document Manager Agent - Example Implementation
 * This shows how the Document Manager Agent would work
 */

const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const { marked } = require('marked');

class DocumentManagerAgent {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.metrics = {
      filesProcessed: 0,
      bytesReduced: 0,
      errors: 0,
      startTime: Date.now()
    };
  }

  /**
   * Initialize file watchers for all source folders
   */
  async initialize() {
    console.log('📄 Document Manager Agent initializing...');
    
    // Ensure machine-data structure exists
    await this.createFolderStructure();
    
    // Watch source folders
    const watchPaths = [
      'ai-agents',
      'aaa-documents', 
      'project-documents'
    ];
    
    watchPaths.forEach(folder => {
      if (fs.existsSync(folder)) {
        this.watchFolder(folder);
      }
    });
    
    // Start processing queue
    this.startQueueProcessor();
    
    console.log('✅ Document Manager Agent initialized - JSON optimization active');
  }

  /**
   * Create machine-data folder structure
   */
  async createFolderStructure() {
    const folders = [
      'machine-data/ai-agents-json',
      'machine-data/aaa-documents-json',
      'machine-data/project-documents-json',
      'machine-data/schemas'
    ];
    
    for (const folder of folders) {
      await fs.ensureDir(folder);
    }
  }

  /**
   * Watch a folder for .md file changes
   */
  watchFolder(folderPath) {
    const watcher = chokidar.watch(`${folderPath}/**/*.md`, {
      persistent: true,
      ignoreInitial: false
    });
    
    watcher
      .on('add', filepath => this.queueFile(filepath, 'add'))
      .on('change', filepath => this.queueFile(filepath, 'change'));
    
    console.log(`👀 Watching ${folderPath} for markdown files`);
  }

  /**
   * Add file to processing queue with priority
   */
  queueFile(filepath, action) {
    // Determine priority based on file type
    let priority = 3; // default medium
    
    if (filepath.includes('ai-agents/')) {
      priority = 1; // critical - blocks other agents
    } else if (filepath.includes('requirements') || filepath.includes('prd')) {
      priority = 2; // high
    } else if (filepath.includes('log') || filepath.includes('retrospective')) {
      priority = 4; // low
    }
    
    // Add to queue
    this.queue.push({ filepath, action, priority });
    this.queue.sort((a, b) => a.priority - b.priority);
    
    console.log(`📥 Queued: ${path.basename(filepath)} (priority: ${priority})`);
  }

  /**
   * Process files from queue
   */
  async startQueueProcessor() {
    setInterval(async () => {
      if (!this.processing && this.queue.length > 0) {
        this.processing = true;
        const item = this.queue.shift();
        
        try {
          await this.processFile(item.filepath);
          this.metrics.filesProcessed++;
        } catch (error) {
          console.error(`❌ Error processing ${item.filepath}:`, error.message);
          this.metrics.errors++;
        }
        
        this.processing = false;
      }
    }, 100);
  }

  /**
   * Convert markdown file to optimized JSON
   */
  async processFile(filepath) {
    console.log(`🔄 Processing: ${filepath}`);
    
    // Read markdown
    const content = await fs.readFile(filepath, 'utf8');
    const originalSize = Buffer.byteLength(content, 'utf8');
    
    // Extract structured data based on file type
    let jsonData;
    
    if (filepath.includes('ai-agents/')) {
      jsonData = this.extractAgentData(content, filepath);
    } else if (filepath.includes('aaa-documents/')) {
      jsonData = this.extractDocumentationData(content, filepath);
    } else {
      jsonData = this.extractProjectData(content, filepath);
    }
    
    // Determine output path
    const outputPath = this.getJsonPath(filepath);
    
    // Write JSON
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeJSON(outputPath, jsonData, { spaces: 2 });
    
    // Track metrics
    const jsonSize = Buffer.byteLength(JSON.stringify(jsonData), 'utf8');
    const reduction = Math.round((1 - jsonSize / originalSize) * 100);
    this.metrics.bytesReduced += originalSize - jsonSize;
    
    console.log(`✅ Generated: ${path.basename(outputPath)} (${reduction}% reduction)`);
  }

  /**
   * Extract data from agent specification
   */
  extractAgentData(content, filepath) {
    const lines = content.split('\n');
    const agentName = path.basename(filepath, '.md');
    
    return {
      meta: {
        agent: agentName,
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        source_file: filepath
      },
      summary: this.extractSection(lines, 'Overview', 200),
      key_findings: {
        capabilities: this.extractListItems(lines, 'Core Responsibilities'),
        workflows: this.extractListItems(lines, 'Workflows')
      },
      agent_data: {
        tools: this.extractListItems(lines, 'Tools & Capabilities'),
        context_needs: this.extractListItems(lines, 'Context Requirements')
      }
    };
  }

  /**
   * Extract data from project documentation
   */
  extractProjectData(content, filepath) {
    const lines = content.split('\n');
    const filename = path.basename(filepath, '.md');
    
    // Try to detect agent from content or path
    let agent = 'unknown';
    const pathParts = filepath.split('/');
    if (pathParts.includes('01-research')) agent = 'research_agent';
    else if (pathParts.includes('05-requirements')) agent = 'prd_agent';
    
    return {
      meta: {
        agent: agent,
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        source_file: filepath
      },
      summary: this.extractSection(lines, 'Summary', 200) || 
                this.extractSection(lines, 'Executive Summary', 200) ||
                this.getFirstParagraph(lines),
      key_findings: this.extractKeyPoints(lines),
      detailed_data: {
        url: filepath
      }
    };
  }

  /**
   * Extract system documentation data
   */
  extractDocumentationData(content, filepath) {
    const lines = content.split('\n');
    
    return {
      meta: {
        agent: 'system',
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        source_file: filepath
      },
      summary: this.extractSection(lines, 'Overview', 200) || 
                this.getFirstParagraph(lines),
      key_findings: {
        sections: this.extractHeaders(lines),
        key_points: this.extractKeyPoints(lines)
      }
    };
  }

  /**
   * Helper: Extract section content
   */
  extractSection(lines, sectionName, maxLength = null) {
    let inSection = false;
    let content = [];
    
    for (const line of lines) {
      if (line.match(new RegExp(`^#+\\s+${sectionName}`, 'i'))) {
        inSection = true;
        continue;
      }
      
      if (inSection && line.match(/^#+\s+/)) {
        break;
      }
      
      if (inSection && line.trim()) {
        content.push(line.trim());
        if (maxLength && content.join(' ').length > maxLength) {
          break;
        }
      }
    }
    
    return content.join(' ').substring(0, maxLength);
  }

  /**
   * Helper: Extract list items from a section
   */
  extractListItems(lines, sectionName) {
    const items = [];
    let inSection = false;
    
    for (const line of lines) {
      if (line.match(new RegExp(`^#+\\s+${sectionName}`, 'i'))) {
        inSection = true;
        continue;
      }
      
      if (inSection && line.match(/^#+\s+/)) {
        break;
      }
      
      if (inSection && line.match(/^[-*]\s+/)) {
        items.push(line.replace(/^[-*]\s+/, '').trim());
      }
    }
    
    return items;
  }

  /**
   * Helper: Extract headers
   */
  extractHeaders(lines) {
    return lines
      .filter(line => line.match(/^#+\s+/))
      .map(line => line.replace(/^#+\s+/, '').trim());
  }

  /**
   * Helper: Extract key points
   */
  extractKeyPoints(lines) {
    const points = {};
    let currentKey = null;
    
    for (const line of lines) {
      if (line.match(/^\*\*(.+?)\*\*:/)) {
        const match = line.match(/^\*\*(.+?)\*\*:\s*(.+)/);
        if (match) {
          currentKey = match[1].toLowerCase().replace(/\s+/g, '_');
          points[currentKey] = match[2];
        }
      }
    }
    
    return points;
  }

  /**
   * Helper: Get first paragraph
   */
  getFirstParagraph(lines) {
    const para = [];
    let started = false;
    
    for (const line of lines) {
      if (!line.match(/^#/) && line.trim()) {
        started = true;
        para.push(line.trim());
        if (para.join(' ').length > 200) break;
      } else if (started && !line.trim()) {
        break;
      }
    }
    
    return para.join(' ').substring(0, 200);
  }

  /**
   * Get JSON output path for a markdown file
   */
  getJsonPath(mdPath) {
    return mdPath
      .replace('ai-agents/', 'machine-data/ai-agents-json/')
      .replace('aaa-documents/', 'machine-data/aaa-documents-json/')
      .replace('project-documents/', 'machine-data/project-documents-json/')
      .replace('.md', '.json');
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    const runtime = Math.round((Date.now() - this.metrics.startTime) / 1000);
    const mbReduced = (this.metrics.bytesReduced / 1024 / 1024).toFixed(2);
    
    return {
      ...this.metrics,
      runtime: `${runtime}s`,
      mbReduced: `${mbReduced}MB`,
      avgReduction: this.metrics.filesProcessed > 0 
        ? Math.round(this.metrics.bytesReduced / this.metrics.filesProcessed / 1024) + 'KB'
        : '0KB'
    };
  }
}

// Example usage
if (require.main === module) {
  const agent = new DocumentManagerAgent();
  agent.initialize();
  
  // Show metrics every 30 seconds
  setInterval(() => {
    console.log('📊 Metrics:', agent.getMetrics());
  }, 30000);
}

module.exports = DocumentManagerAgent;
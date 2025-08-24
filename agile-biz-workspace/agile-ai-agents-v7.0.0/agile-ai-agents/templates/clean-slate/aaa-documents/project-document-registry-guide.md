# Project Document Registry Guide

## Overview

The Project Document Registry is a centralized index system that tracks all documents created during AgileAiAgents workflows. It enables agents to efficiently discover and load documents with 80-90% token savings through JSON conversion tracking and smart context loading.

## Purpose and Benefits

### Primary Goals
1. **Efficient Document Discovery**: Agents can quickly find relevant documents without full directory scans
2. **Token Optimization**: Track both MD and JSON versions, enabling 80-90% context reduction
3. **Real-time Updates**: Automatically track document creation, updates, and deletions
4. **Summary-based Filtering**: 25-word summaries allow relevance checking before loading
5. **Dependency Tracking**: Understand document relationships for comprehensive loading

### Key Benefits
- **Performance**: Reduce agent response time by 60-75% through targeted loading
- **Accuracy**: Ensure agents always work with the latest document versions
- **Transparency**: Track which agent created each document and when
- **Scalability**: Handle thousands of documents without performance degradation
- **Reliability**: Queue-based system prevents update conflicts

## System Architecture

### Core Components

```
agile-ai-agents/
├── machine-data/
│   ├── project-document-registry.json      # Central registry file
│   ├── project-document-registry-manager.js # Registry management logic
│   └── registry-queue/                     # Update queue directory
│       ├── pending-updates.jsonl           # Queue file for updates
│       └── .lock                          # Lock file for concurrency
└── hooks/
    └── handlers/
        └── registry/
            └── document-registry-tracker.js # Hook handler for tracking
```

### Data Flow

1. **Document Creation**: Agent creates MD file → Hook detects → Queue update → Registry updated
2. **JSON Conversion**: MD converted to JSON → Hook detects → Queue conversion → Registry updated
3. **Document Deletion**: File deleted → Hook detects → Queue deletion → Registry cleaned
4. **Agent Query**: Agent loads registry → Searches/filters → Loads only needed documents

## Registry Structure

### JSON Format

```json
{
  "version": 2,
  "last_updated": "2025-08-11T23:05:20.241Z",
  "document_count": 142,
  "documents": {
    "orchestration": {
      "project_log": {
        "md": "project-documents/orchestration/project-log.md",
        "json": "machine-data/project-documents-json/orchestration/project-log.json",
        "tokens": {
          "md": 1234,
          "json": 456
        },
        "summary": "Tracks all project activities and decisions made during development",
        "deps": ["stakeholder-decisions.md", "sprint-planning.md"],
        "agent": "Scrum Master",
        "created": "2025-08-11T10:00:00Z",
        "modified": "2025-08-11T23:00:00Z"
      }
    },
    "business-strategy": {},
    "implementation": {},
    "operations": {}
  }
}
```

### Field Descriptions

- **version**: Increments with each update for change tracking
- **last_updated**: ISO timestamp of last registry modification
- **document_count**: Total number of tracked documents
- **documents**: Nested structure by category
  - **[category]**: One of 9 main categories
    - **[document-key]**: Unique identifier for document
      - **md**: Path to markdown file
      - **json**: Path to JSON file (null if not converted)
      - **tokens**: Token counts for context management
      - **summary**: 25-word description for quick relevance check
      - **deps**: Array of document dependencies
      - **agent**: Name of creating agent
      - **created**: Creation timestamp
      - **modified**: Last modification timestamp

## Usage Patterns

### For Agents

#### Loading the Registry
```javascript
const fs = require('fs');
const registryPath = 'machine-data/project-document-registry.json';
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
```

#### Finding Documents by Category
```javascript
// Get all orchestration documents
const orchestrationDocs = registry.documents.orchestration;

// Get all business strategy documents
const strategyDocs = registry.documents['business-strategy'];
```

#### Searching by Keywords
```javascript
// Find all sprint-related documents
const sprintDocs = [];
for (const [category, docs] of Object.entries(registry.documents)) {
  for (const [name, doc] of Object.entries(docs)) {
    if (name.includes('sprint') || doc.summary.includes('sprint')) {
      sprintDocs.push({ category, name, ...doc });
    }
  }
}
```

#### Loading with Token Optimization
```javascript
// Load JSON version if available for 80-90% token savings
function loadDocument(doc) {
  if (doc.json) {
    // Prefer JSON version
    return JSON.parse(fs.readFileSync(doc.json, 'utf8'));
  } else {
    // Fallback to markdown
    return fs.readFileSync(doc.md, 'utf8');
  }
}
```

#### Checking Dependencies
```javascript
// Load a document and its dependencies
function loadWithDependencies(doc) {
  const loaded = [loadDocument(doc)];
  
  if (doc.deps && doc.deps.length > 0) {
    for (const depName of doc.deps) {
      // Find dependency in registry
      const dep = findDocumentByName(depName);
      if (dep) {
        loaded.push(loadDocument(dep));
      }
    }
  }
  
  return loaded;
}
```

### For Users

#### Available Commands

1. **View Statistics**: `/registry-stats`
   - Shows document counts, token usage, JSON coverage
   - Displays category breakdowns
   - Reports token savings percentage

2. **Display Full Registry**: `/registry-display`
   - Shows all documents in readable format
   - Includes summaries and token counts
   - Indicates JSON conversion status (✅ or ⏳)

3. **Search Documents**: `/registry-find "search-term"`
   - Searches names and summaries
   - Returns matching documents with details
   - Shows match location (name or summary)

#### Command Examples

```bash
# Check registry health
/registry-stats

# Find all security-related documents
/registry-find "security"

# View complete registry
/registry-display
```

## Hook Integration

### Automatic Tracking

The registry is automatically updated through hooks that monitor file system events:

1. **File Creation Hook**: Triggered when `.md` files created in `project-documents/`
2. **JSON Conversion Hook**: Triggered when MD files converted to JSON
3. **File Deletion Hook**: Triggered when documents removed
4. **Update Hook**: Triggered when existing documents modified

### Hook Configuration

Located in `hooks/registry/hook-registry.json`:

```json
{
  "document-registry": {
    "name": "Document Registry Update",
    "triggers": ["file-create", "file-delete", "file-change", "file-rename"],
    "handler": "handlers/registry/document-registry-tracker.js",
    "conditions": {
      "if_file_matches": "/project-documents/.*\\.(md|json)$"
    }
  }
}
```

## Queue System

### Purpose

The queue system prevents conflicts when multiple agents create documents simultaneously:

1. **Append-only Queue**: Updates appended to `pending-updates.jsonl`
2. **Lock Mechanism**: Prevents concurrent registry updates
3. **Batch Processing**: Multiple updates processed together
4. **Automatic Retry**: Failed updates retried with exponential backoff

### Queue Format

Each line in `pending-updates.jsonl`:

```json
{"action":"create","path":"project-documents/research/market-analysis.md","agent":"Research Agent","summary":"Market analysis for target demographics","timestamp":"2025-08-11T23:00:00Z"}
{"action":"convert","md_path":"project-documents/research/market-analysis.md","json_path":"machine-data/project-documents-json/research/market-analysis.json","timestamp":"2025-08-11T23:01:00Z"}
```

## Maintenance

### Manual Operations

#### Initialize Registry
```bash
node machine-data/project-document-registry-manager.js init
```

#### Process Queue Manually
```bash
node machine-data/project-document-registry-manager.js process
```

#### Add Document Manually
```bash
node machine-data/project-document-registry-manager.js queue '{"action":"create","path":"path/to/doc.md"}'
```

### Troubleshooting

#### Registry Not Updating
1. Check queue file: `cat machine-data/registry-queue/pending-updates.jsonl`
2. Check for lock file: `ls -la machine-data/registry-queue/.lock`
3. Process queue manually: `node machine-data/project-document-registry-manager.js process`

#### Incorrect Token Counts
1. Token calculation: 1 token ≈ 4 characters (rough estimate)
2. Recalculate by deleting registry and reinitializing
3. Check file encoding (must be UTF-8)

#### Missing Summaries
1. Summaries extracted from first H1 heading or overview section
2. Fallback to filename-based summary
3. Can be manually updated in registry JSON

## Best Practices

### For Agents

1. **Always Check Registry First**: Before searching directories
2. **Prefer JSON Versions**: Use `doc.json` when available
3. **Use Summaries**: Check relevance before loading full documents
4. **Track Dependencies**: Load related documents together
5. **Monitor Token Usage**: Stay within context limits

### For System Maintenance

1. **Regular Backups**: Registry is critical infrastructure
2. **Monitor Queue Size**: Large queues indicate processing issues
3. **Version Tracking**: Use version field for change detection
4. **Clean Orphaned Entries**: Remove entries for deleted documents

## Integration Examples

### Example 1: Research Agent Finding Market Documents

```javascript
class ResearchAgent {
  async findMarketDocuments() {
    const registry = this.loadRegistry();
    const marketDocs = [];
    
    // Search in business-strategy category
    for (const [name, doc] of Object.entries(registry.documents['business-strategy'])) {
      if (name.includes('market') || doc.summary.includes('market')) {
        marketDocs.push(doc);
      }
    }
    
    // Sort by creation date (newest first)
    marketDocs.sort((a, b) => new Date(b.created) - new Date(a.created));
    
    return marketDocs;
  }
}
```

### Example 2: Scrum Master Loading Sprint Documents

```javascript
class ScrumMasterAgent {
  async loadCurrentSprint(sprintId) {
    const registry = this.loadRegistry();
    const sprintDocs = [];
    
    // Find all documents for this sprint
    for (const [category, docs] of Object.entries(registry.documents)) {
      for (const [name, doc] of Object.entries(docs)) {
        if (doc.md.includes(sprintId)) {
          // Load JSON version for efficiency
          const content = doc.json 
            ? JSON.parse(fs.readFileSync(doc.json))
            : fs.readFileSync(doc.md, 'utf8');
          
          sprintDocs.push({
            category,
            name,
            content,
            tokens: doc.json ? doc.tokens.json : doc.tokens.md
          });
        }
      }
    }
    
    return sprintDocs;
  }
}
```

### Example 3: Token-Aware Document Loading

```javascript
class SmartLoader {
  async loadWithinTokenLimit(limit = 10000) {
    const registry = this.loadRegistry();
    const loaded = [];
    let totalTokens = 0;
    
    // Sort by importance (orchestration first)
    const priorityOrder = ['orchestration', 'business-strategy', 'implementation'];
    
    for (const category of priorityOrder) {
      for (const [name, doc] of Object.entries(registry.documents[category] || {})) {
        const tokens = doc.json ? doc.tokens.json : doc.tokens.md;
        
        if (totalTokens + tokens <= limit) {
          loaded.push({
            name,
            path: doc.json || doc.md,
            tokens
          });
          totalTokens += tokens;
        }
      }
    }
    
    return { documents: loaded, totalTokens };
  }
}
```

## Performance Metrics

### Expected Performance

- **Registry Load Time**: < 50ms for 1000 documents
- **Search Time**: < 10ms for keyword search
- **Update Processing**: < 100ms per document
- **Queue Processing**: < 500ms for 10 updates
- **Token Calculation**: ~1ms per KB of content

### Optimization Tips

1. **Cache Registry**: Load once per agent session
2. **Batch Updates**: Process multiple changes together
3. **Index Summaries**: Consider full-text search for large registries
4. **Prune Old Entries**: Archive completed sprint documents
5. **Monitor Growth**: Alert when registry > 10MB

## Future Enhancements

### Planned Features

1. **Full-text Search**: ElasticSearch integration for content search
2. **Version History**: Track document versions over time
3. **Agent Analytics**: Track document usage by agents
4. **Smart Caching**: Predictive document preloading
5. **Compression**: Reduce registry size for large projects

### Community Contributions

The Document Registry system is designed to evolve based on community feedback:

1. **Performance Improvements**: Optimize for specific use cases
2. **Search Enhancements**: Add fuzzy matching, relevance scoring
3. **Integration Patterns**: Share successful agent integrations
4. **Monitoring Tools**: Dashboard widgets for registry health

## Conclusion

The Project Document Registry is a critical component of the AgileAiAgents system, enabling efficient document management and token optimization. By maintaining a real-time index of all project documents, it ensures agents can quickly find and load exactly what they need, reducing response times and improving accuracy.

For questions or contributions, see the community learnings system or submit improvements through the standard contribution workflow.

---

**Version**: 1.0.0  
**Last Updated**: 2025-08-11  
**Status**: Active  
**Next Review**: 2025-09-01
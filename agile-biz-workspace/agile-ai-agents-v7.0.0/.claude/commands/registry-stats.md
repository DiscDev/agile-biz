# registry-stats

Display comprehensive statistics about the document registry including document counts, token usage, JSON coverage, and savings metrics.

## Usage
```
/registry-stats
```

## Description
Shows a detailed breakdown of the project document registry, including:
- Total documents tracked
- Documents per category
- Token counts for MD vs JSON versions
- JSON conversion coverage percentage
- Token savings achieved through JSON optimization
- Registry version information

## Implementation
```javascript
const fs = require('fs');
const path = require('path');

// Load registry
const registryPath = path.join(process.cwd(), 'machine-data', 'project-document-registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

// Calculate statistics
const stats = {
  version: registry.version,
  last_updated: registry.last_updated,
  total_documents: registry.document_count,
  categories: {},
  total_tokens: { md: 0, json: 0 },
  json_coverage: 0,
  token_savings: 0
};

let docsWithJson = 0;

// Process each category
for (const [category, docs] of Object.entries(registry.documents)) {
  const docCount = Object.keys(docs).length;
  stats.categories[category] = {
    count: docCount,
    tokens: { md: 0, json: 0 }
  };
  
  for (const doc of Object.values(docs)) {
    stats.categories[category].tokens.md += doc.tokens.md || 0;
    stats.categories[category].tokens.json += doc.tokens.json || 0;
    stats.total_tokens.md += doc.tokens.md || 0;
    stats.total_tokens.json += doc.tokens.json || 0;
    
    if (doc.json) docsWithJson++;
  }
}

// Calculate coverage and savings
if (registry.document_count > 0) {
  stats.json_coverage = Math.round((docsWithJson / registry.document_count) * 100);
}

if (stats.total_tokens.md > 0 && stats.total_tokens.json > 0) {
  stats.token_savings = Math.round((1 - stats.total_tokens.json / stats.total_tokens.md) * 100);
}

// Display results
console.log('📊 Document Registry Statistics');
console.log('===============================');
console.log(`Version: ${stats.version}`);
console.log(`Last Updated: ${stats.last_updated}`);
console.log(`Total Documents: ${stats.total_documents}`);
console.log('');
console.log('📁 Category Breakdown:');
for (const [category, data] of Object.entries(stats.categories)) {
  if (data.count > 0) {
    console.log(`- ${category}: ${data.count} docs (${data.tokens.md.toLocaleString()} tokens)`);
  }
}
console.log('');
console.log(`💾 JSON Coverage: ${stats.json_coverage}%`);
console.log(`🎯 Token Savings: ${stats.token_savings}%`);
console.log('');
console.log('Total Tokens:');
console.log(`- Markdown: ${stats.total_tokens.md.toLocaleString()} tokens`);
console.log(`- JSON: ${stats.total_tokens.json.toLocaleString()} tokens`);
```

## Example Output
```
📊 Document Registry Statistics
===============================
Version: 2
Last Updated: 2025-08-11 23:05:20
Total Documents: 142

📁 Category Breakdown:
- orchestration: 23 docs (45,230 tokens)
- business-strategy: 31 docs (78,450 tokens)
- implementation: 48 docs (112,340 tokens)
- operations: 40 docs (89,200 tokens)

💾 JSON Coverage: 87%
🎯 Token Savings: 72%

Total Tokens:
- Markdown: 325,220 tokens
- JSON: 91,062 tokens
```

## Related Commands
- `/registry-display` - View full registry contents
- `/registry-find` - Search for specific documents
- `/list-documents` - Show project documents (legacy)
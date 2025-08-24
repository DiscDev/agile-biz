# registry-display

Display the complete document registry in a readable format, showing all tracked documents with their metadata, token counts, and conversion status.

## Usage
```
/registry-display
```

## Description
Presents the full contents of the project document registry organized by category. Each document entry shows:
- Document name and path
- Summary (up to 25 words)
- Token counts for MD and JSON versions
- JSON conversion status (✅ converted or ⏳ pending)
- Creating agent
- Dependencies if any

## Implementation
```javascript
const fs = require('fs');
const path = require('path');

// Load registry
const registryPath = path.join(process.cwd(), 'machine-data', 'project-document-registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

// Display header
console.log(`📚 Document Registry v${registry.version}`);
console.log('='.repeat(60));
console.log(`Last Updated: ${registry.last_updated}`);
console.log(`Total Documents: ${registry.document_count}`);

// Calculate coverage
let docsWithJson = 0;
let totalMdTokens = 0;
let totalJsonTokens = 0;

for (const docs of Object.values(registry.documents)) {
  for (const doc of Object.values(docs)) {
    if (doc.json) docsWithJson++;
    totalMdTokens += doc.tokens.md || 0;
    totalJsonTokens += doc.tokens.json || 0;
  }
}

const jsonCoverage = registry.document_count > 0 
  ? Math.round((docsWithJson / registry.document_count) * 100)
  : 0;

const tokenSavings = totalMdTokens > 0 && totalJsonTokens > 0
  ? Math.round((1 - totalJsonTokens / totalMdTokens) * 100)
  : 0;

console.log(`JSON Coverage: ${jsonCoverage}%`);
console.log(`Token Savings: ${tokenSavings}%`);
console.log('');

// Display documents by category
for (const [category, docs] of Object.entries(registry.documents)) {
  const docCount = Object.keys(docs).length;
  if (docCount === 0) continue;
  
  console.log(`\n📁 ${category} (${docCount} documents)`);
  console.log('-'.repeat(50));
  
  for (const [name, doc] of Object.entries(docs)) {
    const jsonIndicator = doc.json ? '✅' : '⏳';
    const tokenInfo = doc.json 
      ? `MD: ${doc.tokens.md}, JSON: ${doc.tokens.json}`
      : `MD: ${doc.tokens.md}`;
    
    console.log(`  ${jsonIndicator} ${name}`);
    console.log(`     Summary: ${doc.summary}`);
    console.log(`     Tokens: ${tokenInfo}`);
    console.log(`     Agent: ${doc.agent}`);
    
    if (doc.deps && doc.deps.length > 0) {
      console.log(`     Dependencies: ${doc.deps.join(', ')}`);
    }
  }
}
```

## Example Output
```
📚 Document Registry v2
============================================================
Last Updated: 2025-08-11T23:05:20.241Z
Total Documents: 142
JSON Coverage: 87%
Token Savings: 72%

📁 orchestration (5 documents)
--------------------------------------------------
  ✅ project_log
     Summary: Tracks all project activities and decisions made during development
     Tokens: MD: 1234, JSON: 456
     Agent: Scrum Master
  
  ⏳ sprint_planning
     Summary: Current sprint planning and story breakdown for authentication feature
     Tokens: MD: 2345
     Agent: Project Manager
     Dependencies: project-log.md, backlog.md

📁 business-strategy (3 documents)
--------------------------------------------------
  ✅ market_analysis
     Summary: Comprehensive market analysis for target demographics and competitive landscape
     Tokens: MD: 3456, JSON: 987
     Agent: Research
  
  ✅ competitive_analysis
     Summary: Analysis of direct and indirect competitors with feature comparison matrix
     Tokens: MD: 2890, JSON: 812
     Agent: Market Validation
```

## Related Commands
- `/registry-stats` - View summary statistics
- `/registry-find` - Search for specific documents
- `/list-documents` - Show project documents (legacy)
# registry-find

Search the document registry for documents matching a search term. Searches in document names, summaries, and categories.

## Usage
```
/registry-find "search-term"
```

## Parameters
- `search-term` (required) - Text to search for in registry. Searches document names, summaries, and category names.

## Description
Performs a case-insensitive search across the document registry to find documents matching the search term. Returns detailed information about matching documents including their location, summary, token counts, and which field matched the search.

## Implementation
```javascript
const fs = require('fs');
const path = require('path');

// Get search term from command
const searchTerm = process.argv[2] || '';

if (!searchTerm) {
  console.error('❌ Error: Please provide a search term');
  console.log('Usage: /registry-find "search-term"');
  process.exit(1);
}

// Load registry
const registryPath = path.join(process.cwd(), 'machine-data', 'project-document-registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

// Search for documents
const searchLower = searchTerm.toLowerCase();
const results = [];

for (const [category, docs] of Object.entries(registry.documents)) {
  for (const [docName, doc] of Object.entries(docs)) {
    const matches = [];
    
    // Check category name
    if (category.toLowerCase().includes(searchLower)) {
      matches.push('category');
    }
    
    // Check document name
    if (docName.toLowerCase().includes(searchLower)) {
      matches.push('name');
    }
    
    // Check summary
    if (doc.summary && doc.summary.toLowerCase().includes(searchLower)) {
      matches.push('summary');
    }
    
    // Check agent
    if (doc.agent && doc.agent.toLowerCase().includes(searchLower)) {
      matches.push('agent');
    }
    
    // If any matches found, add to results
    if (matches.length > 0) {
      results.push({
        category,
        name: docName,
        doc,
        matches: matches.join(', ')
      });
    }
  }
}

// Display results
console.log(`🔍 Search Results for "${searchTerm}"`);
console.log('='.repeat(50));

if (results.length === 0) {
  console.log('No documents found matching your search term.');
} else {
  console.log(`Found ${results.length} document(s):\n`);
  
  results.forEach((result, index) => {
    const { category, name, doc, matches } = result;
    const tokenInfo = doc.json
      ? `MD: ${doc.tokens.md}, JSON: ${doc.tokens.json}`
      : `MD: ${doc.tokens.md}`;
    
    console.log(`${index + 1}. ${category}/${name}`);
    console.log(`   Path: ${doc.md}`);
    console.log(`   Summary: ${doc.summary}`);
    console.log(`   Tokens: ${tokenInfo}`);
    console.log(`   Agent: ${doc.agent}`);
    console.log(`   Match: ${matches}`);
    
    if (doc.json) {
      console.log(`   JSON: ✅ Available`);
    }
    
    if (doc.deps && doc.deps.length > 0) {
      console.log(`   Dependencies: ${doc.deps.join(', ')}`);
    }
    
    console.log('');
  });
}

// Suggest related searches
if (results.length > 0 && results.length < 10) {
  const categories = [...new Set(results.map(r => r.category))];
  console.log('💡 Related searches:');
  categories.forEach(cat => {
    console.log(`  /registry-find "${cat}"`);
  });
}
```

## Examples

### Search for security documents
```
/registry-find "security"
```

Output:
```
🔍 Search Results for "security"
==================================================
Found 3 document(s):

1. implementation/security_architecture
   Path: project-documents/implementation/security/security-architecture.md
   Summary: Security architecture and threat modeling for application infrastructure
   Tokens: MD: 3456, JSON: 987
   Agent: Security
   Match: category, name
   JSON: ✅ Available

2. implementation/compliance_framework
   Path: project-documents/implementation/security/compliance-framework.md
   Summary: GDPR and SOC2 compliance requirements and implementation guidelines
   Tokens: MD: 2134, JSON: 634
   Agent: Security
   Match: category, name
   JSON: ✅ Available
```

### Search for sprint-related documents
```
/registry-find "sprint"
```

### Search by agent name
```
/registry-find "scrum master"
```

## Error Handling
- If no search term provided, displays usage instructions
- If registry file not found, displays error message
- If no matches found, suggests alternative search terms

## Related Commands
- `/registry-display` - View full registry
- `/registry-stats` - View registry statistics
- `/list-documents` - Show project documents (legacy)
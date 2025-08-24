# JSON-First Reference Approach

## Overview
The AgileAiAgents system now uses a JSON-first approach for all reference documentation paths. This ensures agents always attempt to load the optimized JSON version first, with automatic fallback to markdown files when JSON is not available.

## What Changed

### Before (MD References)
```json
"reference_documentation": {
  "deployment_guide": {
    "path": "agile-ai-agents/aaa-documents/deployment.md",
    "tokens": 1000
  }
}
```

### After (JSON References)
```json
"reference_documentation": {
  "deployment_guide": {
    "path": "agile-ai-agents/machine-data/aaa-documents-json/deployment.json",
    "tokens": 1000
  }
}
```

## How It Works

### 1. JSON Loading Attempt
When an agent requests a document, the system first attempts to load the JSON version from the specified path.

### 2. Automatic Fallback
If the JSON file doesn't exist, the `json-query-utility.js` automatically:
- Converts the JSON path to the corresponding MD path
- Loads the markdown file
- Returns it with a `markdown_fallback` indicator

### 3. Path Conversion Examples
- `machine-data/aaa-documents-json/guide.json` → `aaa-documents/guide.md`
- `machine-data/ai-agents-json/coder_agent.json` → `ai-agents/coder_agent.md`
- `machine-data/project-documents-json/path/file.json` → `project-documents/path/file.md`

## Benefits

1. **JSON-First Strategy**: Aligns with our 80-90% token reduction goal
2. **Transparent Fallback**: No code changes needed in agents
3. **Future-Proof**: As more documents get JSON versions, they're automatically used
4. **Single Reference**: One path handles both JSON and MD

## Implementation Details

### Updated Files

1. **generate-agent-json.js**
   - Converts MD paths to JSON paths in reference_documentation
   - Handles all three document types (agents, aaa-documents, project-documents)

2. **json-query-utility.js**
   - Enhanced path normalization
   - Automatic JSON-to-MD path conversion
   - Seamless fallback with logging

### Path Patterns
```javascript
// JSON path patterns
"agile-ai-agents/machine-data/ai-agents-json/*.json"
"agile-ai-agents/machine-data/aaa-documents-json/*.json"
"agile-ai-agents/machine-data/project-documents-json/**/*.json"

// Automatic fallback to MD
"agile-ai-agents/ai-agents/*.md"
"agile-ai-agents/aaa-documents/*.md"
"agile-ai-agents/project-documents/**/*.md"
```

## Usage for Agents

No changes required! Agents continue to use the same code:

```javascript
// Load reference documentation
const deployment = await loader.loadJSON(ref.deployment_guide.path);

// System automatically:
// 1. Tries JSON first (fast, optimized)
// 2. Falls back to MD if needed (complete content)
```

## Exceptions

Some paths remain as markdown because they don't have JSON equivalents yet:
- Files in `ai-agent-coordination/`
- External configuration files
- Binary or non-document files

These will continue to work as markdown references until JSON versions are created.

## Testing

Run the test script to verify fallback behavior:
```bash
node machine-data/scripts/test-json-fallback.js
```

## Summary

The JSON-first reference approach ensures optimal performance while maintaining compatibility. Agents get the best available format automatically - optimized JSON when available, complete markdown as fallback.
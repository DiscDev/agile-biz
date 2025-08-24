# Machine Data Directory

This directory contains system-generated data and automated conversion outputs. Files here are maintained by the AgileAiAgents system and should not be manually edited.

## Contents

### Document Registry System
- **project-document-registry.json** - Central index of all project documents
- **project-document-registry-manager.js** - Registry management logic
- **registry-queue/** - Queue directory for concurrent update handling

### JSON Conversions (Auto-Generated)
These directories will be created automatically when documents are converted:
- **project-documents-json/** - JSON versions of project documents
- **ai-agents-json/** - JSON versions of agent specifications
- **aaa-documents-json/** - JSON versions of system documentation

## Document Registry

The Document Registry tracks all documents created during workflows and enables:
- 80-90% token reduction through JSON tracking
- Efficient document discovery for agents
- Real-time tracking of document creation, updates, and deletions
- Automatic summary extraction (up to 25 words)
- Token counting for both MD and JSON versions

### Registry Commands
- `/registry-stats` - Display registry statistics
- `/registry-display` - Show full registry contents
- `/registry-find "term"` - Search documents

### Registry Structure
```json
{
  "version": 1,
  "last_updated": "timestamp",
  "document_count": 0,
  "documents": {
    "category": {
      "document_name": {
        "md": "path/to/file.md",
        "json": "path/to/file.json",
        "tokens": { "md": 1234, "json": 456 },
        "summary": "25-word summary",
        "agent": "Creating Agent",
        "deps": ["dependency.md"],
        "created": "timestamp",
        "modified": "timestamp"
      }
    }
  }
}
```

## Important Notes

1. **Do Not Edit Manually**: All files in this directory are system-generated
2. **Registry Updates**: Happen automatically through hooks
3. **JSON Files**: Created automatically when MD files are saved
4. **Token Counting**: Based on rough estimate (1 token ≈ 4 characters)
5. **Queue System**: Prevents conflicts during concurrent updates

## Maintenance

The registry is self-maintaining through hooks but can be managed with:
```bash
# Check registry statistics
node machine-data/project-document-registry-manager.js stats

# Display full registry
node machine-data/project-document-registry-manager.js display

# Process pending queue
node machine-data/project-document-registry-manager.js process
```
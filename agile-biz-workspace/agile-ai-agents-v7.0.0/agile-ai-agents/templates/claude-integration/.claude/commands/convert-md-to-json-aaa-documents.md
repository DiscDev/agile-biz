---
allowed-tools: [Task]
argument-hint: Optional: specific document or category to convert (style-guide, templates, workflows)
---

# Convert MD to JSON - AAA Documents

Convert AgileAiAgents documentation files from markdown to JSON format for 80-90% token reduction and faster context loading. Transform system documentation, style guides, templates, and workflow documents into structured JSON while preserving all critical information.

## Usage

```
/convert-md-to-json-aaa-documents [optional: document category or specific file]
```

**Examples:**
- `/convert-md-to-json-aaa-documents` - Convert all AAA documentation
- `/convert-md-to-json-aaa-documents style-guide` - Convert style guides only
- `/convert-md-to-json-aaa-documents templates` - Convert template documentation
- `/convert-md-to-json-aaa-documents workflow` - Convert workflow documentation

## What This Does

1. **Document Discovery**: Scans `aaa-documents/` for markdown files requiring conversion
2. **Content Analysis**: Extracts structure, key information, and relationships
3. **JSON Conversion**: Transforms to structured JSON with preserved semantics
4. **Token Optimization**: Achieves 80-90% token reduction while maintaining completeness
5. **Quality Validation**: Ensures no information loss during conversion

## Token Savings Benefits

### Before Conversion (Markdown)
- **Average MD Token Count**: 10,000-15,000 tokens per document
- **Context Loading**: Full text required for understanding
- **Memory Usage**: High - complete document in context
- **Processing Time**: Slow - must parse entire document

### After Conversion (JSON)
- **Average JSON Token Count**: 1,000-2,000 tokens per document
- **Context Loading**: Structured summary with drill-down capability
- **Memory Usage**: Low - only summary loaded initially
- **Processing Time**: Fast - structured data parsing

**Result**: 80-90% token reduction with preserved functionality

## Document Categories

### System Documentation
- **Agent Guides**: Individual agent documentation and capabilities
- **Workflow Documentation**: Process flows and coordination patterns
- **Architecture Docs**: System design and component relationships
- **Best Practices**: Development standards and guidelines

### Style Guides & Standards
- **Markdown Style Guide**: GitHub formatting standards
- **Code Style Guides**: Language-specific formatting rules
- **Documentation Standards**: Technical writing guidelines
- **Template Specifications**: Document structure requirements

### Template Documentation
- **Project Templates**: Scaffolding and structure templates
- **Agent Templates**: Agent configuration and behavior patterns
- **Integration Templates**: Third-party service integration guides
- **Workflow Templates**: Process and sprint templates

### Process Documentation
- **Coordination Patterns**: Inter-agent communication protocols
- **Quality Standards**: Testing and validation requirements
- **Security Guidelines**: Security implementation standards
- **Performance Standards**: Optimization and monitoring guides

## Conversion Process

This command uses the Task tool to engage document_manager_agent for:

1. **Content Discovery & Analysis**
   ```json
   {
     "task": "discover_and_analyze_documents",
     "target_directory": "aaa-documents/",
     "file_types": ["*.md"],
     "analysis_focus": [
       "document_structure",
       "content_hierarchy", 
       "key_information_extraction",
       "relationship_mapping"
     ]
   }
   ```

2. **Structured Content Extraction**
   ```json
   {
     "task": "extract_structured_content",
     "extraction_strategy": {
       "preserve_semantics": true,
       "maintain_relationships": true,
       "optimize_tokens": true,
       "include_metadata": true
     }
   }
   ```

3. **JSON Schema Generation**
   ```json
   {
     "task": "generate_json_schema",
     "schema_requirements": {
       "progressive_loading": true,
       "context_optimization": true,
       "search_capabilities": true,
       "cross_references": true
     }
   }
   ```

4. **Quality Validation**
   ```json
   {
     "task": "validate_conversion_quality",
     "validation_criteria": [
       "information_completeness",
       "relationship_preservation", 
       "token_reduction_achieved",
       "semantic_accuracy"
     ]
   }
   ```

## Expected JSON Output Structure

### Document Index Structure
```json
{
  "meta": {
    "conversion_date": "2025-01-29T10:30:00Z",
    "source_directory": "aaa-documents/",
    "total_documents": 45,
    "token_reduction": "87%",
    "original_tokens": 485000,
    "optimized_tokens": 65000
  },
  "document_index": {
    "style_guides": {
      "github_markdown_style_guide": {
        "file": "github-markdown-style-guide.json",
        "summary": "GitHub formatting standards for technical documentation",
        "token_count": 1200,
        "original_tokens": 8500,
        "sections": ["basic_formatting", "advanced_features", "quality_validation"]
      }
    },
    "agent_documentation": {
      "coder_agent": {
        "file": "coder-agent.json", 
        "summary": "Software development agent capabilities and workflows",
        "token_count": 1850,
        "original_tokens": 12400,
        "sections": ["responsibilities", "workflows", "coordination_patterns"]
      }
    }
  }
}
```

### Individual Document Structure
```json
{
  "meta": {
    "title": "GitHub Markdown Style Guide",
    "source_file": "github-markdown-style-guide.md",
    "conversion_date": "2025-01-29T10:30:00Z",
    "token_reduction": "85%",
    "original_tokens": 8500,
    "optimized_tokens": 1275
  },
  "summary": "Comprehensive GitHub markdown formatting standards for technical documentation with multi-language code examples",
  "key_sections": {
    "basic_formatting": {
      "description": "Essential markdown formatting rules",
      "key_points": [
        "Use * for unordered lists only",
        "Start sections with ## (reserve # for title)",
        "Always specify language in code blocks"
      ]
    },
    "advanced_features": {
      "description": "Complex formatting patterns and examples",
      "key_points": [
        "Multi-language code documentation patterns",
        "Architecture diagram integration", 
        "API documentation tables"
      ]
    }
  },
  "quick_reference": {
    "lists": "Use * for unordered, 1. for ordered",
    "code_blocks": "Always specify language: ```javascript",
    "links": "Use descriptive text: [API Guide](url)"
  },
  "examples": {
    "code_documentation": "Reference to expanded examples section",
    "table_formatting": "Reference to table standards section"
  },
  "md_reference": {
    "full_document_path": "aaa-documents/github-markdown-style-guide.md",
    "section_references": {
      "complete_examples": "Lines 200-350",
      "validation_checklist": "Lines 400-450"
    }
  }
}
```

## Progressive Loading Strategy

1. **Minimal Context (100 tokens)**: Load document index only
2. **Standard Context (250 tokens)**: Load document summary and key sections
3. **Detailed Context (Full MD)**: Load complete original markdown when needed

## Implementation Steps

1. **Document Manager Agent Engagement**
   - Scan aaa-documents directory for markdown files
   - Analyze document structure and content hierarchy
   - Extract key information and relationships
   - Generate conversion priority matrix

2. **Content Transformation**
   - Convert markdown structure to JSON schema
   - Preserve all critical information in structured format
   - Create cross-reference links and relationships
   - Generate progressive loading metadata

3. **Quality Assurance**
   - Validate information completeness
   - Verify token reduction achievements
   - Test progressive loading functionality
   - Ensure search and reference capabilities

4. **Output Generation**
   - Create JSON files with optimized structure
   - Generate master index for navigation
   - Update references and cross-links
   - Document conversion statistics and benefits

## Success Metrics

**Conversion Quality**
- [ ] 80-90% token reduction achieved
- [ ] All critical information preserved
- [ ] Cross-references maintained
- [ ] Progressive loading functional

**Performance Improvement**
- [ ] Context loading time reduced by 70%+
- [ ] Memory usage optimized
- [ ] Search capabilities enhanced
- [ ] Navigation improved

**Functional Validation**
- [ ] All document relationships preserved
- [ ] Quick reference sections accurate
- [ ] Examples and code snippets intact
- [ ] Metadata complete and useful

## Output Summary

```
🔄 AAA Documents Conversion Complete
====================================

📊 Conversion Statistics:
  Documents Processed: [X] files
  Token Reduction: [X]% average
  Original Tokens: [XXX,XXX]
  Optimized Tokens: [XX,XXX]

📁 Generated Files:
  JSON Documents: [X] files created
  Master Index: aaa-documents-index.json
  Conversion Log: conversion-report.json

⚡ Performance Gains:
  Context Loading: [X]% faster
  Memory Usage: [X]% reduction
  Search Speed: [X]% improvement

✅ Quality Validation:
  Information Completeness: 100%
  Cross-Reference Integrity: 100%
  Progressive Loading: Functional
  Token Reduction Target: Achieved
```

## Follow-up Commands

After conversion completion:
- `/convert-md-to-json-ai-agents` - Convert agent documentation
- `/convert-md-to-json-project-documents` - Convert project documents
- `/convert-all-md-to-json` - Complete system-wide conversion
- `/list-documents` - View updated document structure
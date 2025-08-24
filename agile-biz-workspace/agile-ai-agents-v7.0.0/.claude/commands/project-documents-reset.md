---
allowed-tools: [Task]
argument-hint: Documentation area or reset scope to target
---

# Project Documents Reset

Reset project documentation to clean state, reorganize document structure, or restore documentation from templates and standards.

## Usage

```
/project-documents-reset [reset-scope]
```

**Examples:**
- `/project-documents-reset full` - Complete documentation reset
- `/project-documents-reset structure` - Reorganize document structure
- `/project-documents-reset templates` - Reset to documentation templates
- `/project-documents-reset outdated` - Clean up outdated documentation

## What This Does

1. **Documentation Audit**: Analyze current documentation state and quality
2. **Structure Reorganization**: Reorganize documents for better navigation
3. **Content Reset**: Reset specific documents to templates or clean state
4. **Quality Improvement**: Improve documentation consistency and standards
5. **Archive Management**: Archive outdated documents and maintain history

## Documentation State Analysis

### Current Documentation Assessment
```markdown
## Documentation Assessment

**Project**: [Project Name]
**Documentation Last Updated**: [Date]
**Reset Reason**: [Why documentation reset is needed]
**Reset Scope**: [Full/Partial/Selective]

### Current Documentation Structure
```
docs/
├── README.md                 # [Status: Current/Outdated/Missing]
├── api/
│   ├── endpoints.md         # [Status: Current/Outdated/Missing]
│   └── authentication.md   # [Status: Current/Outdated/Missing]
├── development/
│   ├── setup.md            # [Status: Current/Outdated/Missing]
│   ├── contributing.md     # [Status: Current/Outdated/Missing]
│   └── troubleshooting.md  # [Status: Current/Outdated/Missing]
├── architecture/
│   ├── overview.md         # [Status: Current/Outdated/Missing]
│   └── decisions/          # [Status: Current/Outdated/Missing]
├── user-guides/
│   ├── getting-started.md  # [Status: Current/Outdated/Missing]
│   └── features/           # [Status: Current/Outdated/Missing]
└── deployment/
    ├── production.md       # [Status: Current/Outdated/Missing]
    └── monitoring.md       # [Status: Current/Outdated/Missing]
```

### Documentation Quality Analysis
**Content Quality Issues**:
- **Outdated Information**: [List of documents with outdated content]
- **Missing Documentation**: [Critical gaps in documentation]
- **Inconsistent Format**: [Documents not following standards]
- **Broken Links**: [Internal/external links that don't work]
- **Poor Organization**: [Documents difficult to find or navigate]

**Documentation Metrics**:
| Category | Total Docs | Current | Outdated | Missing | Quality Score |
|----------|------------|---------|----------|---------|---------------|
| API Documentation | [Count] | [Count] | [Count] | [Count] | [Score]/10 |
| Development Guides | [Count] | [Count] | [Count] | [Count] | [Score]/10 |
| User Documentation | [Count] | [Count] | [Count] | [Count] | [Score]/10 |
| Architecture Docs | [Count] | [Count] | [Count] | [Count] | [Score]/10 |

### Stakeholder Documentation Needs
**Developer Documentation Needs**:
- Setup and development environment guides
- API documentation and code examples
- Architecture and design decisions
- Troubleshooting and debugging guides

**User Documentation Needs**:
- Getting started guides
- Feature documentation
- FAQ and common issues
- Video tutorials or walkthroughs

**Operations Documentation Needs**:
- Deployment procedures
- Monitoring and maintenance
- Backup and recovery procedures
- Security and compliance documentation
```

## Documentation Reset Strategy

### Reset Strategy Selection
```markdown
## Documentation Reset Approach

### Available Reset Strategies

1. **Complete Documentation Reset**
   - **Scope**: Remove all existing documentation and start fresh
   - **Benefits**: Clean slate, consistent standards, no legacy issues
   - **Risks**: Loss of valuable existing content, significant time investment
   - **Timeline**: [Estimated timeline]
   - **Resource Requirements**: [Team member hours needed]

2. **Structure Reorganization**
   - **Scope**: Reorganize existing content into better structure
   - **Benefits**: Improved navigation, preserved content, better organization
   - **Risks**: Broken internal links, temporary confusion
   - **Timeline**: [Estimated timeline]
   - **Resource Requirements**: [Team member hours needed]

3. **Selective Content Reset**
   - **Scope**: Reset only outdated or problematic documents
   - **Benefits**: Preserves good content, targets specific issues
   - **Risks**: Inconsistent documentation quality
   - **Timeline**: [Estimated timeline]
   - **Resource Requirements**: [Team member hours needed]

4. **Template-Based Standardization**
   - **Scope**: Apply consistent templates to all documentation
   - **Benefits**: Consistent format, improved quality, standardized approach
   - **Risks**: Content may not fit templates perfectly
   - **Timeline**: [Estimated timeline]
   - **Resource Requirements**: [Team member hours needed]

**Selected Strategy**: [Chosen approach]
**Rationale**: [Why this approach was selected]

### Documentation Standards and Templates
**Documentation Standards**:
- **Format**: Markdown with consistent heading structure
- **Style Guide**: [Specific style guidelines]
- **Template Usage**: Standardized templates for each document type
- **Review Process**: Required review before publication
- **Update Schedule**: Regular review and update cycle

**Template Categories**:
1. **API Documentation Template**
2. **Feature Documentation Template** 
3. **Setup Guide Template**
4. **Troubleshooting Guide Template**
5. **Architecture Decision Record Template**
```

## Documentation Backup and Archive

### Documentation Backup Strategy
```markdown
## Documentation Preservation

### Pre-Reset Documentation Backup
```bash
# Create timestamped backup of all documentation
tar -czf "docs-backup-$(date +%Y%m%d-%H%M%S).tar.gz" docs/

# Create git branch with current documentation state
git checkout -b docs-backup-$(date +%Y%m%d)
git add docs/
git commit -m "Documentation backup before reset $(date)"
git checkout main

# Export documentation with history
git log --oneline -- docs/ > docs-history-$(date +%Y%m%d).log
```

### Content Archival Process
**Archive Categories**:
- **Historical Documents**: Documentation with historical value
- **Deprecated Features**: Documentation for removed features
- **Draft Content**: Incomplete or draft documentation
- **Legacy Information**: Information that may be needed for reference

**Archive Structure**:
```
archive/
├── historical/
│   ├── 2023/
│   └── 2024/
├── deprecated-features/
├── drafts/
└── legacy/
```

### Content Evaluation for Preservation
**Preservation Criteria**:
1. **Historical Value**: Important decisions or context
2. **Reference Material**: May be needed for future troubleshooting
3. **Regulatory Requirements**: Required for compliance
4. **Knowledge Transfer**: Valuable institutional knowledge

**Disposal Criteria**:
1. **Completely Outdated**: No longer relevant to current system
2. **Duplicate Content**: Redundant information available elsewhere
3. **Poor Quality**: Low-quality content that adds no value
4. **Security Risk**: Contains outdated security information
```

## Documentation Structure Reset

### Standard Documentation Structure
```markdown
## Recommended Documentation Structure

### Project Root Documentation
```
/
├── README.md                    # Project overview and quick start
├── CONTRIBUTING.md              # How to contribute to the project
├── LICENSE.md                   # Project license information
├── CHANGELOG.md                 # Version history and changes
└── docs/                        # Detailed documentation
```

### Detailed Documentation Structure
```
docs/
├── README.md                    # Documentation index and navigation
├── getting-started/
│   ├── README.md               # Getting started overview
│   ├── installation.md        # Installation guide
│   ├── quick-start.md          # Quick start tutorial
│   └── first-steps.md          # Next steps after setup
├── development/
│   ├── README.md               # Development overview
│   ├── environment-setup.md   # Development environment
│   ├── coding-standards.md    # Code style and standards
│   ├── testing.md             # Testing guidelines
│   ├── debugging.md           # Debugging guide
│   └── troubleshooting.md     # Common issues and solutions
├── api/
│   ├── README.md               # API overview
│   ├── authentication.md      # Authentication methods
│   ├── endpoints/              # Individual endpoint documentation
│   ├── examples/               # API usage examples
│   └── changelog.md           # API version changes
├── user-guide/
│   ├── README.md               # User guide overview
│   ├── features/               # Individual feature guides
│   ├── tutorials/              # Step-by-step tutorials
│   ├── faq.md                  # Frequently asked questions
│   └── glossary.md            # Terms and definitions
├── architecture/
│   ├── README.md               # Architecture overview
│   ├── system-design.md       # High-level system design
│   ├── database-schema.md     # Database structure
│   ├── security.md            # Security architecture
│   └── decisions/              # Architecture Decision Records
├── deployment/
│   ├── README.md               # Deployment overview
│   ├── environments.md        # Environment configurations
│   ├── production.md          # Production deployment
│   ├── monitoring.md          # Monitoring and logging
│   └── backup-recovery.md     # Backup and disaster recovery
└── reference/
    ├── glossary.md            # Project-specific terms
    ├── resources.md           # External resources and links
    └── style-guide.md         # Documentation style guide
```

### Navigation and Discoverability
**Documentation Navigation**:
```markdown
# Documentation Index

## Quick Links
- [Getting Started](getting-started/README.md) - New to the project? Start here
- [API Reference](api/README.md) - Complete API documentation
- [User Guide](user-guide/README.md) - How to use the application

## For Developers
- [Development Setup](development/environment-setup.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Architecture Overview](architecture/README.md)

## For Operations
- [Deployment Guide](deployment/README.md)
- [Monitoring Setup](deployment/monitoring.md)
- [Troubleshooting](development/troubleshooting.md)
```
```

## Content Reset and Template Application

### Document Template Implementation
```markdown
## Documentation Templates

### API Endpoint Template
```markdown
# [Endpoint Name] API

## Overview
Brief description of what this endpoint does.

## Endpoint Details
- **URL**: `[METHOD] /api/endpoint`
- **Authentication**: [Required/Optional]
- **Rate Limiting**: [Limits if applicable]

## Request Format

### Headers
```
Content-Type: application/json
Authorization: Bearer [token]
```

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `param1` | string | Yes | Description of parameter |
| `param2` | integer | No | Description of parameter |

### Request Body
```json
{
  "field1": "string",
  "field2": 123
}
```

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": "string",
    "created_at": "timestamp"
  }
}
```

### Error Responses
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Authentication required
- **404 Not Found**: Resource not found

## Examples

### cURL Example
```bash
curl -X GET \
  https://api.example.com/endpoint \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json"
```

### JavaScript Example
```javascript
const response = await fetch('/api/endpoint', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```
```

### Feature Documentation Template
```markdown
# [Feature Name]

## Overview
Brief description of the feature and its purpose.

## User Stories
- As a [user type], I want to [action] so that [benefit]
- As a [user type], I want to [action] so that [benefit]

## Getting Started

### Prerequisites
- [List any prerequisites]
- [Required permissions or access]

### Basic Usage
1. [Step 1 description]
2. [Step 2 description]
3. [Step 3 description]

## Detailed Guide

### [Sub-feature 1]
Description and steps for using sub-feature 1.

### [Sub-feature 2]
Description and steps for using sub-feature 2.

## Advanced Usage

### Configuration Options
| Option | Default | Description |
|--------|---------|-------------|
| option1 | value | Description |
| option2 | value | Description |

### Integration with Other Features
Description of how this feature works with other parts of the system.

## Troubleshooting

### Common Issues
1. **Issue**: Description of common problem
   - **Solution**: How to resolve the issue

2. **Issue**: Another common problem
   - **Solution**: Resolution steps

### FAQ
**Q: Frequently asked question?**
A: Answer to the question.

## Related Documentation
- [Related Feature](link-to-related-feature.md)
- [API Reference](../api/related-endpoint.md)
```
```

### Content Migration Process
```markdown
## Content Migration and Reset Process

### Migration Steps
1. **Content Audit**
   - Review existing documentation for value
   - Categorize content (keep, archive, discard)
   - Identify content that needs updating

2. **Template Application**
   - Apply appropriate templates to existing content
   - Ensure consistent formatting and structure
   - Update navigation and cross-references

3. **Content Enhancement**
   - Fill in missing sections
   - Update outdated information
   - Add examples and code samples
   - Improve clarity and readability

4. **Quality Assurance**
   - Review all migrated content
   - Test all links and code examples
   - Ensure consistent style and tone
   - Validate technical accuracy

### Automated Migration Tools
```bash
# Script to apply consistent headers and formatting
#!/bin/bash
for file in docs/**/*.md; do
  # Add front matter if missing
  if ! head -1 "$file" | grep -q "^---"; then
    cat > temp_file << EOF
---
title: $(basename "$file" .md | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
description: [Add description]
---

EOF
    cat "$file" >> temp_file
    mv temp_file "$file"
  fi
  
  # Fix common formatting issues
  sed -i '' 's/^## \([^#]\)/## \1/' "$file"  # Ensure proper heading spacing
  sed -i '' 's/^###\([^#]\)/### \1/' "$file"  # Fix heading formatting
done
```
```

## Quality Assurance and Validation

### Documentation Quality Checklist
```markdown
## Documentation Quality Standards

### Content Quality Checklist
**For Each Document**:
- [ ] **Clear Purpose**: Document purpose is obvious from title and introduction
- [ ] **Current Information**: All information is up-to-date and accurate
- [ ] **Complete Coverage**: All necessary topics are covered
- [ ] **Logical Structure**: Information is organized logically
- [ ] **Consistent Style**: Follows project documentation standards

**For Technical Documentation**:
- [ ] **Code Examples**: All code examples are tested and working
- [ ] **API Documentation**: All endpoints, parameters, and responses documented
- [ ] **Screenshots**: All screenshots are current and relevant
- [ ] **Links**: All internal and external links work correctly
- [ ] **Prerequisites**: All prerequisites and dependencies listed

### Documentation Review Process
**Review Stages**:
1. **Technical Review**: Subject matter expert reviews technical accuracy
2. **Editorial Review**: Review for clarity, grammar, and style
3. **User Testing**: Test documentation with actual users
4. **Final Approval**: Final sign-off from documentation owner

**Review Criteria**:
- **Accuracy**: Information is technically correct
- **Completeness**: All necessary information is included
- **Clarity**: Content is easy to understand
- **Consistency**: Follows established style and format
- **Usability**: Users can successfully follow the documentation

### Quality Metrics
**Documentation Quality Metrics**:
- **Coverage**: Percentage of features with complete documentation
- **Freshness**: Average age of documentation
- **User Satisfaction**: User feedback scores on documentation
- **Usage**: Page views and engagement metrics
- **Issue Rate**: Number of documentation-related support tickets
```

### Link and Reference Validation
```markdown
## Link Validation and Reference Checking

### Automated Link Checking
```bash
# Check internal links
#!/bin/bash
find docs -name "*.md" -exec grep -l "\[.*\](.*\.md)" {} \; | \
while read file; do
  echo "Checking links in $file"
  grep -o "\[.*\](.*\.md)" "$file" | \
  sed 's/.*](\(.*\))/\1/' | \
  while read link; do
    if [[ "$link" == /* ]]; then
      # Absolute path from project root
      if [[ ! -f ".$link" ]]; then
        echo "BROKEN: $file -> $link"
      fi
    else
      # Relative path from current file
      dir=$(dirname "$file")
      if [[ ! -f "$dir/$link" ]]; then
        echo "BROKEN: $file -> $link"
      fi
    fi
  done
done
```

### Reference Consistency Check
```bash
# Check for consistent naming and references
grep -r "TODO\|FIXME\|TBD" docs/  # Find incomplete sections
grep -r "http://" docs/  # Find insecure links
grep -r "\[.*\](\s*\)" docs/  # Find empty links
```

### Content Validation Tools
**Validation Tools Setup**:
- **Markdown Linter**: Vale or markdownlint for style consistency
- **Link Checker**: markdown-link-check for broken links
- **Spell Check**: aspell or similar for spelling errors
- **Grammar Check**: LanguageTool for grammar and style
```

## Documentation Maintenance and Updates

### Ongoing Documentation Maintenance
```markdown
## Documentation Maintenance Strategy

### Regular Update Schedule
**Weekly Reviews**:
- Check for broken links
- Review recent code changes for documentation impact
- Update any time-sensitive information

**Monthly Reviews**:
- Review documentation analytics and user feedback
- Update screenshots and examples as needed
- Archive outdated documentation

**Quarterly Reviews**:
- Comprehensive review of all documentation
- Major reorganization if needed
- Update documentation standards and templates
- User feedback collection and analysis

### Documentation Ownership
**Documentation Owners**:
- **API Documentation**: Backend development team
- **User Guides**: Product management and UX team
- **Development Guides**: Development team leads
- **Architecture Documentation**: Technical architects
- **Deployment Documentation**: DevOps team

**Review Responsibilities**:
- Each document has a designated owner
- Owners responsible for accuracy and updates
- Cross-functional reviews for user-facing documentation
- Technical reviews for all API and development documentation

### Documentation Feedback Loop
**Feedback Collection Methods**:
- Documentation feedback forms
- User surveys and interviews
- Support ticket analysis
- Developer team feedback
- Analytics and usage data

**Feedback Integration Process**:
1. Collect feedback from various sources
2. Categorize feedback by type and priority
3. Create documentation improvement tickets
4. Assign tickets to appropriate owners
5. Track completion and measure impact
```

### Automated Documentation Updates
```markdown
## Automation and Integration

### CI/CD Integration for Documentation
```yaml
# GitHub Actions for documentation validation
name: Documentation Quality Check

on: [pull_request]

jobs:
  docs-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Check for broken links
        run: |
          npm install -g markdown-link-check
          find docs -name "*.md" -exec markdown-link-check {} \;
      
      - name: Lint markdown files
        run: |
          npm install -g markdownlint-cli
          markdownlint docs/**/*.md
      
      - name: Spell check
        run: |
          npm install -g cspell
          cspell "docs/**/*.md"
```

### Documentation Generation from Code
```bash
# Generate API documentation from code comments
npm install -g @apidevtools/swagger-jsdoc swagger-ui-dist

# Generate architecture diagrams from code
npm install -g dependency-cruiser
dependency-cruise --output-type dot src | dot -T svg > docs/architecture/dependencies.svg
```

### Version Control Integration
```bash
# Documentation versioning strategy
git tag -a docs-v1.0 -m "Documentation version 1.0"
git push origin docs-v1.0

# Create documentation release branch
git checkout -b docs-release-1.0
git push -u origin docs-release-1.0
```
```

## Post-Reset Documentation Strategy

### Documentation Launch and Communication
```markdown
## Documentation Launch Plan

### Launch Communication
**Team Communication**:
- Announcement of documentation reset completion
- Overview of new structure and how to navigate
- Training sessions on new documentation standards
- Q&A sessions for team questions

**User Communication**:
- Blog post or announcement about improved documentation
- Email newsletter highlighting key improvements
- In-app notifications about new help resources
- Social media posts about documentation updates

### Success Metrics and Monitoring
**Documentation Success Metrics**:
- **Usage Metrics**: Page views, time spent, bounce rate
- **User Satisfaction**: Feedback scores, survey responses
- **Support Impact**: Reduction in documentation-related tickets
- **Developer Productivity**: Time to find information, onboarding speed
- **Content Quality**: Freshness score, accuracy metrics

**Monitoring Dashboard**:
- Real-time analytics on documentation usage
- User feedback aggregation and analysis
- Documentation health metrics (broken links, outdated content)
- Team productivity metrics related to documentation

### Continuous Improvement Process
**Improvement Workflow**:
1. **Data Collection**: Gather usage and feedback data
2. **Analysis**: Identify patterns and improvement opportunities
3. **Prioritization**: Rank improvements by impact and effort
4. **Implementation**: Execute improvements in planned iterations
5. **Measurement**: Track the impact of improvements
6. **Iteration**: Repeat the cycle for continuous enhancement

**Quarterly Documentation Review**:
- Comprehensive analytics review
- User feedback analysis and action planning
- Documentation standards update
- Team training on documentation best practices
- Strategic planning for next quarter's improvements
```

## Follow-up Actions

After project documents reset:
- `/generate-documentation` - Create specific documentation pieces
- `/verify-context` - Validate project context documentation
- `/add-agile-context` - Ensure agile methodology documentation
- Train team on new documentation standards
- Set up automated documentation quality checks
- Establish ongoing documentation maintenance schedule
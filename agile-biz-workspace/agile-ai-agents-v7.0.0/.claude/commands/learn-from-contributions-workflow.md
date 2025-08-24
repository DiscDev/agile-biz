---
allowed-tools: [Task]
argument-hint: Type of contribution learning to analyze
---

# Learn From Contributions Workflow

Analyze community contributions and update agent knowledge based on learned patterns and successful implementations.

## Usage

```
/learn-from-contributions-workflow [contribution-type]
```

**Examples:**
- `/learn-from-contributions-workflow bug-fixes`
- `/learn-from-contributions-workflow feature-implementations`
- `/learn-from-contributions-workflow best-practices`
- `/learn-from-contributions-workflow workflow-improvements`

## What This Does

1. **Contribution Analysis**: Reviews successful community contributions for patterns
2. **Knowledge Extraction**: Identifies reusable patterns and best practices
3. **Agent Updates**: Updates agent prompts and workflows with learned insights
4. **Documentation Updates**: Updates system documentation with new patterns
5. **Workflow Enhancement**: Improves existing workflows based on contributions

## Learning Categories

### Bug Fix Patterns
- **Common Bug Types**: Frequently encountered issues and solutions
- **Debugging Techniques**: Effective problem identification methods
- **Fix Implementations**: Successful resolution patterns
- **Prevention Strategies**: Proactive measures from contributions

### Feature Implementation Patterns
- **Architecture Decisions**: Successful structural choices
- **Code Organization**: Effective file and module structures
- **Integration Approaches**: Successful third-party integrations
- **Testing Strategies**: Comprehensive testing approaches

### Best Practice Evolution
- **Code Quality**: Improved coding standards from contributions
- **Security Enhancements**: Security improvements from community
- **Performance Optimizations**: Speed and efficiency improvements
- **Accessibility Improvements**: Better user experience patterns

### Workflow Optimizations
- **Process Improvements**: More efficient development workflows
- **Tool Integration**: Better tool usage and integration patterns
- **Communication Patterns**: Improved collaboration approaches
- **Documentation Standards**: Enhanced documentation practices

## Learning Process

1. **Contribution Collection**
   - Scan recent successful contributions
   - Identify high-impact implementations
   - Categorize by contribution type
   - Assess community feedback and adoption

2. **Pattern Recognition**
   - Extract common successful approaches
   - Identify anti-patterns to avoid
   - Document decision rationales
   - Map to existing agent capabilities

3. **Knowledge Integration**
   - Update agent prompts with new patterns
   - Enhance workflow documentation
   - Create new best practice guidelines
   - Update example implementations

4. **Validation and Testing**
   - Test learned patterns in controlled scenarios
   - Validate against existing successful projects
   - Gather feedback from implementation attempts
   - Refine based on real-world results

## Output Format

**Learning Summary**
- Number of contributions analyzed
- Key patterns identified
- Impact assessment on system improvement

**Pattern Documentation**
```markdown
## Pattern: [Pattern Name]

### Context
- When to apply this pattern
- Prerequisites and requirements
- Expected outcomes

### Implementation
```code
[Example implementation]
```

### Benefits
- Specific improvements achieved
- Metrics and measurements
- User/developer experience improvements

### Integration Points
- Which agents benefit from this pattern
- How to incorporate into existing workflows
- Compatibility considerations
```

**Agent Updates Applied**
- List of agents updated with new patterns
- Specific prompt enhancements made
- New capabilities or improvements added
- Workflow modifications implemented

**Recommendations**
- Additional learning opportunities identified
- Suggested focus areas for future contributions
- Knowledge gaps that need community input
- System improvements to prioritize

## Follow-up Actions

After learning integration:
- `/review-learnings` - Review all integrated learnings
- `/show-contribution-status` - Check contribution processing status
- `/test` - Validate learned patterns work correctly
- `/update-state` - Save learning progress to system state
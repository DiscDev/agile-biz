---
allowed-tools: [Task]
argument-hint: Learning category or time period to review
---

# Review Learnings

Comprehensive review of accumulated learnings from community contributions and system improvements.

## Usage

```
/review-learnings [category or timeframe]
```

**Examples:**
- `/review-learnings recent` - Last 30 days of learnings
- `/review-learnings bug-patterns` - Bug fix learning patterns
- `/review-learnings security` - Security-related learnings
- `/review-learnings all` - Complete learning review

## What This Does

1. **Learning Inventory**: Lists all accumulated learnings by category
2. **Impact Assessment**: Measures effectiveness of applied learnings
3. **Knowledge Gaps**: Identifies areas needing more learning
4. **Integration Status**: Shows which learnings are actively used
5. **Performance Metrics**: Quantifies improvement from learnings

## Review Categories

### Recent Learnings (Last 30 Days)
- **New Patterns Discovered**: Recently identified successful patterns
- **Quick Wins Applied**: Fast improvements implemented
- **Major Insights**: Significant understanding improvements
- **Community Trends**: Emerging patterns from contributions

### Learning by Domain
- **Frontend Patterns**: UI/UX and client-side learnings
- **Backend Patterns**: Server-side and API learnings  
- **Database Patterns**: Data modeling and query learnings
- **DevOps Patterns**: Infrastructure and deployment learnings
- **Security Patterns**: Security and privacy learnings
- **Testing Patterns**: Quality assurance learnings

### Learning Effectiveness
- **High Impact**: Learnings with measurable improvements
- **Medium Impact**: Moderate improvements observed
- **Low Impact**: Limited or unclear improvements
- **Not Yet Applied**: Learnings waiting for implementation

### Knowledge Evolution
- **Deprecated Patterns**: Outdated approaches replaced
- **Emerging Practices**: New industry standards adopted
- **Refined Techniques**: Improved versions of existing patterns
- **Cross-Domain Insights**: Learnings applied across multiple areas

## Review Process

1. **Learning Collection**
   - Gather all documented learnings
   - Categorize by domain and impact
   - Sort by recency and relevance
   - Include community feedback data

2. **Effectiveness Analysis**
   - Measure before/after metrics where available
   - Assess adoption rates across projects
   - Identify most/least successful learnings
   - Document success factors and barriers

3. **Gap Analysis**
   - Compare against industry best practices
   - Identify underrepresented learning areas
   - Highlight community contribution gaps
   - Map to common project challenges

4. **Consolidation and Refinement**
   - Merge related learning patterns
   - Refine successful pattern documentation
   - Archive outdated or ineffective learnings
   - Create learning roadmaps for priority areas

## Output Format

### Executive Summary
```markdown
## Learning Review Summary

**Time Period**: [Date Range]
**Total Learnings Reviewed**: [Number]
**Categories Covered**: [List]
**Overall Impact Score**: [1-10 Rating]

### Key Highlights
- Most impactful learning: [Pattern Name]
- Fastest adopted pattern: [Pattern Name]  
- Highest community interest: [Pattern Name]
- Biggest knowledge gap identified: [Area]
```

### Detailed Learning Inventory
```markdown
## Learning Category: [Category Name]

### Pattern: [Pattern Name]
- **Source**: Community contribution / Internal research
- **Date Added**: [Date]
- **Impact Level**: High / Medium / Low
- **Adoption Status**: Widely Used / Selectively Used / Not Yet Applied
- **Success Metrics**: [Quantifiable improvements]
- **Implementation Examples**: [Number] projects using this pattern

**Pattern Description**:
[Brief description of the learning pattern]

**Key Benefits**:
- [Benefit 1 with metrics if available]
- [Benefit 2 with metrics if available]

**Usage Guidelines**:
- When to apply: [Conditions]
- How to implement: [Steps]
- Common pitfalls: [Warnings]

**Community Feedback**:
- Positive responses: [Number/Percentage]
- Reported issues: [Any problems noted]
- Suggested improvements: [Community suggestions]
```

### Impact Analysis
```markdown
## Learning Impact Metrics

### Quantitative Results
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Bug Resolution Time | [Time] | [Time] | [%] |
| Feature Development Speed | [Time] | [Time] | [%] |
| Code Quality Score | [Score] | [Score] | [%] |
| Community Satisfaction | [Score] | [Score] | [%] |

### Qualitative Improvements
- **Developer Experience**: [Improvements noted]
- **Code Maintainability**: [Improvements noted]
- **System Reliability**: [Improvements noted]
- **Community Engagement**: [Improvements noted]
```

### Knowledge Gaps Identified
```markdown
## Priority Learning Areas

### Critical Gaps (Immediate Attention Needed)
1. **[Gap Area]**: [Description and impact]
2. **[Gap Area]**: [Description and impact]

### Important Gaps (Address Soon)
1. **[Gap Area]**: [Description and rationale]
2. **[Gap Area]**: [Description and rationale]

### Future Opportunities
1. **[Opportunity Area]**: [Potential benefits]
2. **[Opportunity Area]**: [Potential benefits]
```

### Recommendations
```markdown
## Action Recommendations

### Immediate Actions
- [ ] Apply high-impact pattern [X] to [specific area]
- [ ] Deprecate outdated pattern [Y] in favor of [Z]
- [ ] Create documentation for successful pattern [A]

### Medium-term Goals
- [ ] Establish learning feedback loop for [area]
- [ ] Create community contribution guidelines for [domain]
- [ ] Develop automated pattern recognition for [category]

### Long-term Strategic Goals  
- [ ] Build comprehensive pattern library
- [ ] Establish learning effectiveness measurement system
- [ ] Create community-driven learning contribution platform
```

## Integration with Other Commands

- **Input to**: `/learn-from-contributions-workflow` - Informs what to focus learning on
- **Feeds**: `/show-contribution-status` - Shows which learnings came from contributions
- **Updates**: System knowledge base and agent prompts
- **Triggers**: `/update-state` to save review findings

## Follow-up Actions

After learning review:
- `/learn-from-contributions-workflow [priority-area]` - Focus learning on gaps
- `/show-contribution-status` - Check contribution processing pipeline
- `/update-state` - Save review findings and action items
- `/implement` - Apply high-priority learning recommendations
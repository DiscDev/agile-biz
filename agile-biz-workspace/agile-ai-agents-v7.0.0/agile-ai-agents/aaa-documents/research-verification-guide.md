# Research Verification Guide

## Overview
This guide explains the research verification system in AgileAiAgents, designed to minimize LLM hallucinations by requiring source verification and utilizing MCP (Model Context Protocol) servers for real-time data validation.

## Purpose
LLMs can generate plausible-sounding but incorrect information (hallucinations). This system:
- Requires sources for factual claims
- Uses MCP servers for real-time verification
- Provides confidence scoring
- Implements graceful degradation when services are unavailable

## Verification Levels

### 1. Fast (Minimal Verification)
- **Speed**: 30-60 seconds per document
- **Token Usage**: ~2,000 tokens
- **MCP Calls**: 0-1 per document
- **Use Cases**: Internal docs, brainstorming, UI mockups
- **Characteristics**:
  - Basic source attribution
  - Flags obvious uncertainties
  - Relies primarily on LLM knowledge

### 2. Balanced (Recommended Default)
- **Speed**: 2-3 minutes per document
- **Token Usage**: ~5,000 tokens
- **MCP Calls**: 3-5 per document
- **Use Cases**: Standard research, project planning, requirements
- **Characteristics**:
  - MCP searches for key claims
  - Verifies statistics and quotes
  - Cross-references important facts
  - Clear confidence indicators

### 3. Thorough (High Verification)
- **Speed**: 5-10 minutes per document
- **Token Usage**: ~10,000 tokens
- **MCP Calls**: 10-15 per document
- **Use Cases**: Market research, technical specs, analysis
- **Characteristics**:
  - All claims verified via MCP
  - Multiple source cross-reference
  - Detailed source citations
  - Comprehensive fact-checking

### 4. Paranoid (Maximum Verification)
- **Speed**: 15+ minutes per document
- **Token Usage**: ~15,000+ tokens
- **MCP Calls**: 20+ per document
- **Use Cases**: Financial projections, security assessments, compliance
- **Characteristics**:
  - Everything must have sources
  - No unsourced claims allowed
  - Human review checkpoint
  - Complete audit trail

## Override Precedence

The system uses strict precedence (highest to lowest priority):

1. **Document Type Override** - Most specific, always wins
2. **Agent Override** - Agent-specific default
3. **Global Default** - System-wide fallback

### Example:
- Global default: `balanced`
- Finance Agent override: `thorough`
- Financial projections document override: `paranoid`
- **Result**: Finance Agent creating financial projections uses `paranoid`

## MCP Integration

### Supported MCP Servers
- **Perplexity**: Web searches with citations
- **Firecrawl**: Direct website data extraction
- **GitHub**: Code and repository verification
- **WebSearch**: General web searches (if available)

### Benefits of MCP Usage
- Real citations instead of hallucinated sources
- Current data instead of training cutoff data
- Verifiable URLs and timestamps
- Cross-reference capability

## Research Document Structure

### Verified Research Template
```markdown
# [Document Title]

## Research Metadata
- **Verification Level**: [fast/balanced/thorough/paranoid]
- **MCP Services Used**: [List of services]
- **Cache Status**: [Fresh/Cached/Mixed]
- **Overall Confidence**: [High/Medium/Low]

## Verified Information
<!-- Information retrieved from MCP services -->
### Market Size
- **Claim**: The global SaaS market is valued at $197 billion
- **Source**: [Statista Report 2024](https://www.statista.com/...)
- **Retrieved**: 2025-01-10 14:30 PST
- **Confidence**: High
- **Verification Method**: Perplexity MCP search

## Analyzed Insights
<!-- LLM analysis based on verified data -->
### Growth Trends
- **Analysis**: Based on verified data, the market shows 15% YoY growth
- **Confidence**: Medium
- **Based on**: Sources cited above

## Unverified Claims
<!-- Information that couldn't be verified -->
### Future Projections
- **Claim**: Market expected to reach $500B by 2030
- **Status**: Unverified
- **Reason**: No authoritative source found
- **Confidence**: Low
```

## Verification Requirements by Content Type

### Always Require Sources
- Statistics and numerical data
- Financial figures
- Market sizes and shares
- Technical specifications
- Legal/compliance statements
- Direct quotes
- Historical facts

### Analysis Allowed Without Sources
- Trend interpretation
- Strategic recommendations
- Creative suggestions
- Opinion-based content
- Hypothetical scenarios
- General observations

## Graceful Degradation

When MCP services are unavailable:

1. **Notify User**: Clear indication of degraded service
2. **Use Cache**: Leverage recently verified data
3. **Flag Content**: Mark unverified claims clearly
4. **Reduce Confidence**: Apply automatic confidence penalty
5. **Provide Options**: Let user decide how to proceed

### Degradation Notification Example
```
⚠️  MCP Service Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Research verification operating in degraded mode:
- Perplexity: ❌ Unavailable
- Firecrawl: ✅ Available
- Cache: ✅ Active (24 hours)

Impact: -20% verification accuracy
All unverified claims will be clearly marked.

Continue? (Y/n): _
```

## Best Practices

### For Agents
1. Always declare verification level at document start
2. Separate verified facts from analysis
3. Include metadata for all sources
4. Flag uncertainty explicitly
5. Provide confidence scores

### For Users
1. Configure appropriate MCP servers for better accuracy
2. Use higher verification for critical documents
3. Review unverified claims carefully
4. Consider time/accuracy trade-offs
5. Cache valuable research data

## Configuration in CLAUDE.md

See the `research_verification` section in CLAUDE.md for:
- Setting global defaults
- Configuring agent overrides
- Defining document type rules
- Managing MCP preferences
- Controlling cache behavior

## Troubleshooting

### Common Issues

1. **All claims marked unverified**
   - Check MCP configuration
   - Verify API keys in .env
   - Test MCP connectivity

2. **Verification taking too long**
   - Consider using lower verification level
   - Check cache configuration
   - Reduce MCP timeout settings

3. **Inconsistent results**
   - Clear cache if outdated
   - Check for MCP rate limits
   - Verify precedence rules

## Summary

The research verification system helps ensure document accuracy by:
- ✅ Enforcing source requirements
- ✅ Leveraging real-time data via MCP
- ✅ Providing transparent confidence levels
- ✅ Gracefully handling service failures
- ✅ Allowing flexible configuration

This dramatically reduces hallucination risks while maintaining reasonable performance.
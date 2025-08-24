# Context Optimization Priority Template

## For Agent Specifications

Add this section before "## Clear Boundaries" in each agent .md file:

```markdown
## Context Optimization Priorities

### JSON Data Requirements
The [Agent Name] reads structured JSON data to minimize context usage:

#### From [Source Agent 1]
**Critical Data** (Always Load):
- `key_field_1` - Description
- `key_field_2` - Description
- `key_field_3` - Description

**Optional Data** (Load if Context Allows):
- `optional_field_1` - Description
- `optional_field_2` - Description

#### From [Source Agent 2]
**Critical Data**:
- `key_field_1` - Description
- `key_field_2` - Description

**Optional Data**:
- `optional_field_1` - Description
- `optional_field_2` - Description

### JSON Output Structure
The [Agent Name] generates structured JSON for other agents:
```json
{
  "meta": {
    "agent": "[agent_name]",
    "timestamp": "ISO-8601",
    "version": "1.0.0"
  },
  "summary": "Brief summary of output",
  "key_findings": {
    "main_output_1": "value",
    "main_output_2": ["array", "values"],
    "main_output_3": {
      "nested": "object"
    }
  },
  "decisions": {
    "decision_1": "value",
    "decision_2": "value"
  },
  "next_agent_needs": {
    "agent_1": ["data_1", "data_2"],
    "agent_2": ["data_3", "data_4"]
  }
}
```

### Streaming Events (if applicable)
The [Agent Name] streams critical events in JSON Lines format:
```jsonl
{"event":"event_type","timestamp":"ISO-8601","data":"value"}
{"event":"milestone","timestamp":"ISO-8601","type":"completion","metrics":{}}
```
```

## Common Context Priority Patterns

### Business & Strategy Agents
Typically need:
- Market data (market_size, competitors, trends)
- Financial data (budget, roi, costs)
- Strategic decisions (recommendations, priorities)

### Technical Agents
Typically need:
- Technical specifications (tech_stack, architecture, apis)
- Code status (modules_completed, test_results)
- Security requirements (vulnerabilities, compliance)

### Marketing & Growth Agents
Typically need:
- Target audience (personas, demographics)
- Brand data (positioning, messaging)
- Performance metrics (conversion, engagement)

### Support Agents
Typically need:
- Status updates (progress, issues)
- Quality metrics (coverage, performance)
- Documentation needs (api_docs, guides)

## Guidelines for Defining Priorities

1. **Critical Data**: 3-5 most essential fields that agent MUST have
2. **Optional Data**: Nice-to-have fields that enhance functionality
3. **Keep It Focused**: Only request data the agent actually uses
4. **Use Consistent Keys**: Match field names across agents
5. **Structure for Queries**: Design JSON for easy path-based access
# Model Status

View current multi-LLM configuration, connectivity status, and usage statistics.

## Usage
```
/model-status
```

## What It Shows

This command displays comprehensive information about your multi-LLM setup:
- Active providers and their status
- Current routing configuration
- Usage statistics and costs
- Performance metrics
- Error logs and issues

## Output Sections

### 1. Provider Status
Shows which LLM providers are configured and their connectivity:
```
📊 LLM Provider Status
━━━━━━━━━━━━━━━━━━━━━
✅ Claude     [Connected]  claude-3-haiku (primary for: code)
✅ Gemini     [Connected]  gemini-1.5-flash (primary for: analysis, general)
✅ Perplexity [Connected]  sonar (primary for: research)
⚠️ OpenAI     [No API Key] Not configured
```

### 2. Routing Configuration
Displays how tasks are routed to different models:
```
🔄 Intelligent Routing
━━━━━━━━━━━━━━━━━━━━━
Research:     Perplexity → Gemini → Claude
Code Gen:     Claude → Gemini
Analysis:     Gemini → Claude
General:      Gemini → Claude
Parallel:     Max 5 concurrent requests
```

### 3. Usage Statistics
Shows current session and project usage:
```
💰 Usage & Costs
━━━━━━━━━━━━━━━━━━━━━
Session:      $1.23 / $5.00 (24.6%)
Project:      $12.45 / $50.00 (24.9%)
Tokens Used:  145,234 (input) / 89,123 (output)
API Calls:    Claude: 45, Gemini: 123, Perplexity: 18
Savings:      $35.67 (74% vs Claude-only)
```

### 4. Performance Metrics
Displays speed and reliability metrics:
```
⚡ Performance
━━━━━━━━━━━━━━━━━━━━━
Avg Response: 1.2s (vs 3.8s sequential)
Parallel Ops: 89 successful, 2 fallbacks
Cache Hits:   234/567 (41.3%)
Error Rate:   0.3%
```

### 5. Recent Activity
Shows last few model interactions:
```
📝 Recent Activity
━━━━━━━━━━━━━━━━━━━━━
[10:23:15] Research Agent → Perplexity (market analysis) ✅ 1.3s
[10:23:45] Coder Agent → Claude (authentication.js) ✅ 0.8s
[10:24:02] Analysis Agent → Gemini (performance review) ✅ 1.1s
[10:24:15] Research Agent → Perplexity (competitor scan) ⚠️ 3.2s → Gemini fallback
```

## Command Options

### Check Specific Provider
```
/model-status --provider=gemini
```
Shows detailed information for a specific provider.

### Test Connectivity
```
/model-status --test
```
Runs connectivity tests for all configured providers.

### Show Errors
```
/model-status --errors
```
Displays recent errors and fallback events.

### Export Stats
```
/model-status --export
```
Saves detailed statistics to `machine-data/llm-stats.json`.

## Example Output

```
You: /model-status

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              Multi-LLM System Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Providers (3/4 active)
  ✅ Claude     v3-haiku    [12ms ping]  $0.43 used
  ✅ Gemini     1.5-flash   [8ms ping]   $0.67 used  
  ✅ Perplexity sonar       [15ms ping]  $0.13 used
  ⚠️ OpenAI     not configured

🔄 Routing: Intelligent (with fallback)
  • 78% requests using primary model
  • 19% using fallback (cost optimized)
  • 3% using Claude (final fallback)

💰 Cost Savings: $2.87 this session (71% reduction)
  
⚡ Performance: 3.2x faster than sequential
  • 145 parallel operations
  • 1.3s average response time
  • 99.7% success rate

🎯 Optimization Suggestions:
  • Enable OpenAI for additional redundancy
  • Consider upgrading to Perplexity Pro for deeper research
  • Cache hit rate could be improved (currently 41%)

Use /configure-models to adjust settings
```

## Status Indicators

- ✅ **Connected** - Provider is working normally
- ⚠️ **Degraded** - Provider responding slowly or with errors
- ❌ **Offline** - Provider not responding
- 🔄 **Fallback Active** - Using backup provider
- 💤 **Idle** - No recent requests to this provider

## Troubleshooting

### Provider Shows Offline
1. Check API key in .env file
2. Run `/model-status --test` to diagnose
3. Verify network connectivity
4. Check provider's status page

### High Error Rate
1. Review error logs with `/model-status --errors`
2. Check rate limits for each provider
3. Consider adjusting timeout values
4. Enable more aggressive caching

### Poor Performance
1. Check parallel execution limits
2. Review routing configuration
3. Consider provider latency in your region
4. Optimize task distribution

## Integration with Dashboard

The model status is also available in the real-time dashboard:
```
http://localhost:3001
# Click on "🤖 Models" tab
```

The dashboard provides:
- Real-time provider status
- Live cost tracking
- Performance graphs
- Error monitoring
- Usage trends

## Related Commands

- `/configure-models` - Set up or modify LLM configuration
- `/research-boost` - Enable enhanced research mode
- `/cost` - Detailed cost breakdown

## Notes

- Status updates every 30 seconds
- Historical data retained for 7 days
- Costs are estimates based on token usage
- Actual bills may vary slightly from estimates
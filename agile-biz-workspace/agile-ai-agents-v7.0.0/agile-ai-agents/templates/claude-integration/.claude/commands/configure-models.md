# Configure Models

Configure multi-LLM support for AgileAiAgents to enable 60-80% cost reduction and 3-5x faster research.

## Usage
```
/configure-models
```

## What It Does

This command launches an interactive setup wizard that:
1. Detects available API keys in your environment
2. Tests connectivity to each LLM provider
3. Configures intelligent model routing
4. Sets up fallback chains
5. Establishes cost limits and monitoring

## Supported Providers

- **Claude** (Required) - Always available as fallback
  - Haiku, Sonnet, Opus models
- **Gemini** - 40% cost savings
  - 1.5 Flash, 1.5 Pro models  
- **OpenAI** - Alternative for specific tasks
  - GPT-3.5, GPT-4 models
- **Perplexity** - Deep research with citations
  - Sonar, Sonar Pro models

## Configuration Process

1. **Environment Check**
   - Scans for API keys in .env file
   - Validates key format
   - Tests basic connectivity

2. **Model Selection**
   - Choose primary models for each task type
   - Set up fallback chains
   - Configure cost thresholds

3. **Performance Tuning**
   - Set parallel execution limits
   - Configure timeout values
   - Enable/disable caching

4. **Save Configuration**
   - Updates machine-data/llm-config.json
   - Creates backup of previous config
   - Applies settings immediately

## Example Flow

```
You: /configure-models
AI: 🔍 Checking for available LLM providers...

Found API keys for:
✅ Claude (ANTHROPIC_API_KEY)
✅ Gemini (GOOGLE_AI_API_KEY)
⚠️ OpenAI (no key found)
✅ Perplexity (PERPLEXITY_API_KEY)

Would you like to:
1. Use all available providers (recommended)
2. Select specific providers
3. Add missing API keys
4. View current configuration

You: 1
AI: Testing connectivity...
✅ Claude: Connected (claude-3-haiku)
✅ Gemini: Connected (gemini-1.5-flash)
✅ Perplexity: Connected (sonar)

Configuring intelligent routing...
- Research tasks → Perplexity (primary), Gemini (fallback)
- Code generation → Claude (primary), Gemini (fallback)
- Analysis → Gemini (primary), Claude (fallback)
- General tasks → Gemini (primary), Claude (fallback)

Cost limits set:
- Per session: $5.00
- Per project: $50.00
- Alert threshold: 80%

Configuration saved! You're now using multi-LLM support.
Estimated savings: 60-75% on typical projects
```

## Configuration File

Settings are saved to `machine-data/llm-config.json`:
```json
{
  "providers": {
    "claude": {
      "enabled": true,
      "models": ["claude-3-haiku", "claude-3-sonnet"],
      "primary_for": ["code_generation"],
      "api_key_env": "ANTHROPIC_API_KEY"
    },
    "gemini": {
      "enabled": true,
      "models": ["gemini-1.5-flash", "gemini-1.5-pro"],
      "primary_for": ["analysis", "general"],
      "api_key_env": "GOOGLE_AI_API_KEY"
    },
    "perplexity": {
      "enabled": true,
      "models": ["sonar", "sonar-pro"],
      "primary_for": ["research"],
      "api_key_env": "PERPLEXITY_API_KEY"
    }
  },
  "routing": {
    "strategy": "intelligent",
    "fallback_enabled": true,
    "parallel_limit": 5
  },
  "costs": {
    "session_limit": 5.00,
    "project_limit": 50.00,
    "alert_threshold": 0.8
  }
}
```

## Manual Configuration

If you prefer to configure manually:

1. **Add API keys to .env file**:
```bash
ANTHROPIC_API_KEY=your-claude-key
GOOGLE_AI_API_KEY=your-gemini-key
PERPLEXITY_API_KEY=your-perplexity-key
OPENAI_API_KEY=your-openai-key
```

2. **Run the setup script**:
```bash
./scripts/setup-multi-llm.sh
```

## Benefits

- **60-80% cost reduction** on typical projects
- **3-5x faster research** with parallel execution
- **100% reliability** with Claude fallback
- **Citation support** via Perplexity
- **Automatic failover** between providers

## Related Commands

- `/model-status` - View current model configuration
- `/research-boost` - Enable enhanced research mode
- `/cost` - Check current usage and costs

## Notes

- Claude is always required as the primary fallback
- API keys are never stored in the config file
- Configuration changes take effect immediately
- Previous configs are backed up automatically
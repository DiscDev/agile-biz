# Perplexity MCP Server Setup Guide

## Overview

The Perplexity MCP (Model Context Protocol) server enables the Research, Marketing, SEO, and Analysis agents to perform real-time web searches with AI-powered analysis. This integration provides access to Perplexity's Sonar models, offering current information, deep research capabilities, and structured reasoning for enhanced agent intelligence and up-to-date knowledge.

## What This Enables

With Perplexity MCP configured, agents can:
- 🔍 **Real-time Web Search** - Access current information beyond training data cutoffs
- 📚 **Deep Research** - Conduct comprehensive research with academic-quality analysis
- 🧠 **AI-Powered Reasoning** - Solve complex problems with step-by-step logical analysis
- 📰 **Current Events** - Stay updated with latest news and trending topics
- 🎯 **Targeted Search** - Search specific domains and academic sources
- 📊 **Research Citations** - Get properly cited sources for all information
- 🔄 **Live Knowledge** - Bridge the gap between static training data and current information
- 🌐 **Multi-Modal Research** - Search with both text and image inputs
- 📈 **Market Intelligence** - Access real-time market data and business insights
- 🏛️ **Academic Research** - Conduct literature reviews and scholarly research

## Prerequisites

1. **Perplexity Account**: Sign up at https://perplexity.ai
2. **Perplexity API Key**: Get your API key from the developer dashboard
3. **Claude Desktop**: MCP servers work with Claude Desktop app
4. **Docker**: For containerized deployment (recommended)
5. **Node.js**: Alternative installation method

## Step 1: Set Up Perplexity API Access

1. **Sign up for Perplexity** at https://perplexity.ai
2. **Navigate to API section**:
   - Go to your account dashboard
   - Find the API or Developer section
   - Generate a new API key
3. **Choose your plan**:
   - Free tier: Limited requests for testing
   - Pro: $20/month with higher limits
   - Enterprise: Custom pricing for teams
4. **Copy your API key**:
   - Store securely - this key provides access to your account
   - Never share or commit to version control

## Step 2: Install Perplexity MCP Server

### Option A: Docker Deployment (Recommended)

```bash
# Clone the repository
git clone https://github.com/ppl-ai/modelcontextprotocol.git
cd modelcontextprotocol

# Build the Docker image
docker build -t mcp/perplexity-ask:latest -f Dockerfile .

# Test the installation
docker run -i --rm -e PERPLEXITY_API_KEY=your_api_key mcp/perplexity-ask
```

### Option B: NPX Deployment

```bash
# Run directly with NPX (easiest for testing)
npx -y server-perplexity-ask
```

### Option C: Local Development Setup

```bash
# Clone the repository
git clone https://github.com/ppl-ai/modelcontextprotocol.git
cd modelcontextprotocol

# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

## Step 3: Configure Claude Desktop

Add Perplexity MCP to your Claude Desktop configuration:

### Docker Configuration (Recommended)
```json
{
  "mcpServers": {
    "perplexity-ask": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "PERPLEXITY_API_KEY",
        "mcp/perplexity-ask"
      ],
      "env": {
        "PERPLEXITY_API_KEY": "your-perplexity-api-key"
      }
    }
  }
}
```

### NPX Configuration
```json
{
  "mcpServers": {
    "perplexity-ask": {
      "command": "npx",
      "args": ["-y", "server-perplexity-ask"],
      "env": {
        "PERPLEXITY_API_KEY": "your-perplexity-api-key"
      }
    }
  }
}
```

### Local Development Configuration
```json
{
  "mcpServers": {
    "perplexity-ask": {
      "command": "node",
      "args": ["path/to/modelcontextprotocol/build/index.js"],
      "env": {
        "PERPLEXITY_API_KEY": "your-perplexity-api-key"
      }
    }
  }
}
```

## Step 4: Update AgileAiAgents .env File

Add Perplexity configuration to the `.env` file:

```bash
# Perplexity MCP (Research, Marketing, SEO, Analysis Agents)
PERPLEXITY_MCP_ENABLED=true
PERPLEXITY_API_KEY=your_perplexity_api_key
# Optional: Default settings
PERPLEXITY_DEFAULT_MODEL=sonar-pro
PERPLEXITY_SEARCH_MODE=web  # web or academic
PERPLEXITY_REASONING_EFFORT=medium  # low, medium, high
PERPLEXITY_MAX_TOKENS=4000
PERPLEXITY_TEMPERATURE=0.7
```

## Available MCP Tools

### Real-time Search Tools

#### **perplexity_ask**
General web search with current information
```
Model: sonar-pro
Best for: Current events, quick answers, general information
Parameters:
- query: Search question or topic
- search_mode: web (default) or academic
- max_tokens: Response length limit
- temperature: Response creativity (0.0-1.0)
Example: "What are the latest developments in AI regulation?"
```

#### **perplexity_research**
Deep research with comprehensive analysis
```
Model: sonar-deep-research
Best for: Academic research, detailed analysis, literature reviews
Parameters:
- query: Research question
- reasoning_effort: low, medium, high
- search_mode: web or academic
- domain_filter: Limit to specific domains
- citation_style: APA, MLA, Chicago, etc.
Example: "Comprehensive analysis of renewable energy market trends 2024"
```

#### **perplexity_reason**
Complex problem-solving with structured analysis
```
Model: sonar-reasoning-pro
Best for: Step-by-step reasoning, problem solving, analysis
Parameters:
- problem: Problem statement or question
- reasoning_depth: shallow, medium, deep
- format: structured, narrative, bullets
- include_sources: true/false
Example: "Analyze the pros and cons of different cloud architectures"
```

### Advanced Search Features

#### **Domain-Specific Search**
Target specific websites or domains
```
Parameters:
- domains: Array of domains to search
- exclude_domains: Domains to avoid
Example: Search only academic papers, news sites, or technical blogs
```

#### **Time-Filtered Search**
Search within specific time ranges
```
Parameters:
- time_range: past_hour, past_day, past_week, past_month, past_year
- date_from: Start date (YYYY-MM-DD)
- date_to: End date (YYYY-MM-DD)
Example: Find news from the last 24 hours
```

#### **Multi-Modal Search**
Search with images and text
```
Parameters:
- query: Text description
- image_url: URL of image to analyze
- image_context: Description of what to analyze
Example: Analyze competitor product images
```

## Agent Workflows with Perplexity MCP

### For Research Agent - Real-time Intelligence

1. **Current Market Research**
   ```
   - Use perplexity_ask for latest market trends
   - Use perplexity_research for comprehensive industry analysis
   - Search academic papers for research foundations
   - Track competitor news and announcements
   ```

2. **Competitive Intelligence**
   ```
   - Monitor competitor product launches
   - Track industry thought leadership
   - Research emerging technologies
   - Analyze market sentiment and opinions
   ```

3. **Regulatory & Compliance Updates**
   ```
   - Track regulatory changes in real-time
   - Research compliance requirements
   - Monitor policy developments
   - Analyze legal precedents
   ```

### For Marketing Agent - Campaign Intelligence

1. **Trend Analysis**
   ```
   - Identify emerging marketing trends
   - Research viral campaign strategies
   - Track influencer and thought leader content
   - Monitor social media trends
   ```

2. **Competitive Campaign Monitoring**
   ```
   - Track competitor marketing activities
   - Analyze successful campaign strategies
   - Research audience engagement patterns
   - Monitor brand mentions and sentiment
   ```

3. **Content Strategy Development**
   ```
   - Research trending topics in industry
   - Find content gap opportunities
   - Analyze successful content formats
   - Track seasonal marketing patterns
   ```

### For SEO Agent - Search Intelligence

1. **SERP Analysis**
   ```
   - Research current search result patterns
   - Analyze featured snippet opportunities
   - Track algorithm changes and impacts
   - Monitor competitor SEO strategies
   ```

2. **Content Optimization**
   ```
   - Research semantic search patterns
   - Find related keyword opportunities
   - Analyze top-performing content
   - Track search intent evolution
   ```

3. **Technical SEO Intelligence**
   ```
   - Research SEO best practices updates
   - Monitor Google algorithm changes
   - Track Core Web Vitals trends
   - Analyze mobile search patterns
   ```

### For Analysis Agent - Data Intelligence

1. **Market Data Collection**
   ```
   - Gather real-time market statistics
   - Research industry benchmarks
   - Track economic indicators
   - Monitor technology adoption rates
   ```

2. **Competitive Analysis**
   ```
   - Research competitor financial performance
   - Track market share changes
   - Analyze pricing strategy trends
   - Monitor product feature evolution
   ```

## Example Agent Prompts

### Real-time Market Research
```
Acting as the Research Agent, use Perplexity MCP to:
1. Research the latest trends in [industry] for 2024
2. Find recent competitor announcements and product launches
3. Analyze regulatory changes affecting our market
4. Identify emerging technologies that could disrupt our space
5. Compile findings into comprehensive market intelligence report
```

### Competitive Campaign Analysis
```
Acting as the Marketing Agent, conduct research on:
1. Successful marketing campaigns in our industry from the last 6 months
2. Emerging social media trends and platform changes
3. Influencer marketing strategies that are currently working
4. Content formats that are driving highest engagement
5. Create campaign strategy recommendations based on findings
```

### SEO Opportunity Research
```
Acting as the SEO Agent, research:
1. Recent Google algorithm updates and their impact on our industry
2. Featured snippet opportunities for our target keywords
3. Emerging search intent patterns in our market
4. Competitor content strategies that are ranking well
5. Technical SEO best practices for current search landscape
```

### Real-time Data Analysis
```
Acting as the Analysis Agent, gather:
1. Current market size and growth projections for our industry
2. Recent funding and investment trends in our space
3. Customer behavior changes post-2023
4. Technology adoption rates and patterns
5. Competitive landscape shifts and new entrants
```

## Best Practices

### Query Optimization
1. **Be Specific**: Use detailed, specific queries for better results
2. **Context Setting**: Provide context for better understanding
3. **Time Sensitivity**: Specify time ranges when needed
4. **Source Quality**: Use academic mode for research-grade sources
5. **Citation Requirements**: Request proper citations for all claims

### Cost Management
1. **Efficient Queries**: Combine related questions into single requests
2. **Token Limits**: Set appropriate max_tokens for your needs
3. **Rate Limiting**: Implement delays between requests
4. **Caching**: Cache results for repeated queries
5. **Monitoring**: Track API usage and costs

### Quality Assurance
1. **Source Verification**: Always verify critical information
2. **Cross-referencing**: Use multiple sources for important claims
3. **Recency Checks**: Verify information currency
4. **Bias Awareness**: Consider source bias and perspective
5. **Fact Checking**: Implement fact-checking workflows

## Troubleshooting

### "Invalid API key" Error
- Verify API key is correct and hasn't expired
- Check environment variable is properly set
- Ensure no extra spaces or characters in key
- Try regenerating key in Perplexity dashboard

### "Rate limit exceeded" Error
- Check your plan's rate limits
- Implement request throttling
- Consider upgrading your plan
- Use batch processing for multiple queries

### "No results found" Error
- Refine your query to be more specific
- Try different search terms or approaches
- Check if topic is too recent or obscure
- Use academic mode for scholarly topics

### "Docker connection failed" Error
- Ensure Docker is running
- Check Docker image was built correctly
- Verify environment variables are passed
- Test Docker container manually

## Integration with AgileAiAgents

Once configured, agents will automatically:

### Research Agent
1. **Conduct real-time research** on market trends and developments
2. **Monitor competitors** and industry changes continuously
3. **Gather current data** beyond training cutoffs
4. **Verify and update** existing research with latest information
5. **Track regulatory changes** and compliance requirements

### Marketing Agent
1. **Research trending topics** for content creation
2. **Monitor competitor campaigns** and strategies
3. **Track influencer activities** and successful tactics
4. **Analyze current events** for marketing opportunities
5. **Stay updated** on platform changes and algorithm updates

### SEO Agent
1. **Research current SEO trends** and algorithm changes
2. **Analyze SERP changes** and ranking factors
3. **Monitor competitor SEO** strategies and performance
4. **Track search intent** evolution and patterns
5. **Identify optimization opportunities** in real-time

### Analysis Agent
1. **Collect real-time market data** for analysis
2. **Track KPIs and benchmarks** from current sources
3. **Monitor competitive metrics** and changes
4. **Gather economic indicators** and trends
5. **Validate assumptions** with current data

Results are saved to:
```
agile-ai-agents/project-documents/
├── 01-research/
│   ├── real-time-market-intelligence/
│   ├── competitor-monitoring/
│   └── current-trends-analysis/
├── 02-marketing/
│   ├── trending-topics-research/
│   ├── campaign-intelligence/
│   └── platform-updates/
├── 12-seo/
│   ├── serp-analysis/
│   ├── algorithm-updates/
│   └── ranking-opportunities/
└── 04-analysis/
    ├── real-time-data/
    ├── market-metrics/
    └── competitive-intelligence/
```

## Pricing & Usage Guidelines

### API Costs
- **Free Tier**: Limited requests for testing
- **Pro Plan**: $20/month with higher limits
- **Enterprise**: Custom pricing for teams
- Monitor usage to avoid unexpected charges

### Token Usage
- **Simple queries**: 100-500 tokens
- **Research queries**: 1000-4000 tokens
- **Deep analysis**: 4000-8000 tokens
- Set appropriate max_tokens limits

### Rate Limits
- Varies by plan tier
- Implement request throttling
- Use batch processing when possible
- Monitor and respect limits

## Security Considerations

- **API Key Security**: Never expose API key in public code
- **Environment Variables**: Use secure environment variable management
- **Access Control**: Limit who can trigger searches
- **Data Privacy**: Be mindful of sensitive search topics
- **Audit Logging**: Log search queries for compliance
- **Rate Limiting**: Implement client-side rate limiting

## Advanced Features

### Custom Search Configurations
```javascript
// Academic research configuration
{
  "search_mode": "academic",
  "reasoning_effort": "high",
  "citation_style": "APA",
  "peer_reviewed_only": true
}

// Business intelligence configuration
{
  "search_mode": "web",
  "domains": ["bloomberg.com", "reuters.com", "wsj.com"],
  "time_range": "past_week",
  "include_financial_data": true
}

// Technical research configuration
{
  "search_mode": "web",
  "domains": ["arxiv.org", "github.com", "stackoverflow.com"],
  "reasoning_effort": "medium",
  "include_code_examples": true
}
```

### Multi-Step Research Workflows
```javascript
// Research pipeline example
async function conductMarketResearch(topic) {
  // Step 1: Get overview
  const overview = await perplexity_ask({
    query: `Current state of ${topic} market 2024`,
    search_mode: "web"
  });
  
  // Step 2: Deep analysis
  const analysis = await perplexity_research({
    query: `Comprehensive analysis of ${topic} trends and forecasts`,
    reasoning_effort: "high"
  });
  
  // Step 3: Competitive landscape
  const competition = await perplexity_reason({
    problem: `Who are the key players in ${topic} and what are their strategies?`,
    reasoning_depth: "deep"
  });
  
  return { overview, analysis, competition };
}
```

## Additional Resources

- **Perplexity API Documentation**: https://docs.perplexity.ai/
- **MCP GitHub Repository**: https://github.com/ppl-ai/modelcontextprotocol/
- **Model Context Protocol Spec**: https://modelcontextprotocol.io/
- **Perplexity Developer Dashboard**: https://perplexity.ai/settings/api
- **Community Support**: https://discord.gg/perplexity

This integration empowers AgileAiAgents with real-time intelligence and current knowledge beyond training data limitations!
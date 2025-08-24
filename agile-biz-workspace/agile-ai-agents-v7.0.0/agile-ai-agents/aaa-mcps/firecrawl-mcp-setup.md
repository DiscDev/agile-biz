# Firecrawl MCP Server Setup Guide

## Overview

The Firecrawl MCP (Model Context Protocol) server enables the Research, Marketing, SEO, and Analysis agents to perform advanced web scraping, crawling, and content extraction with JavaScript rendering support. This integration allows agents to gather competitive intelligence, monitor market trends, analyze competitor websites, and extract structured data for research and analysis.

## What This Enables

With Firecrawl MCP configured, agents can:
- 🕷️ **Web Scraping** - Extract content from any webpage with JavaScript rendering
- 🔍 **Site Crawling** - Discover and analyze entire websites systematically
- 📊 **Data Extraction** - Extract structured data using AI-powered analysis
- 🌐 **Batch Processing** - Scrape multiple URLs simultaneously
- 🔎 **Web Search** - Search and retrieve content from search results
- 📈 **Market Research** - Analyze competitor websites and industry trends
- 🤖 **AI Research** - Conduct deep research on topics using web data
- 📱 **Mobile Testing** - Scrape sites as they appear on mobile devices
- 🌍 **Geo-targeted** - Scrape content from specific countries/languages
- 📸 **Visual Capture** - Take screenshots during scraping

## Prerequisites

1. **Firecrawl Account**: Sign up at https://firecrawl.dev
2. **API Key**: Get your API key from the Firecrawl dashboard
3. **Claude Desktop**: MCP servers work with Claude Desktop app
4. **Node.js**: Version 18+ for MCP server installation
5. **Credits**: Firecrawl uses credit-based pricing (check your plan)

## Step 1: Set Up Firecrawl Account

1. **Sign up for Firecrawl** at https://firecrawl.dev
2. **Choose a plan**:
   - Free tier: Limited credits for testing
   - Starter: $19/month for small projects
   - Growth: $99/month for larger needs
   - Scale: Custom pricing for enterprise
3. **Get your API key**:
   - Navigate to Dashboard → API Keys
   - Copy your API key (keep it secure!)
4. **Note your credit balance**:
   - Different operations consume different credit amounts
   - Monitor usage to avoid interruptions

## Step 2: Install Firecrawl MCP Server

### Option A: Using NPX (Recommended)
```bash
# No installation needed, will run directly
npx @krieg2065/firecrawl-mcp-server
```

### Option B: Global Installation
```bash
npm install -g @krieg2065/firecrawl-mcp-server
```

### Option C: Local Installation
```bash
# In your project directory
npm install @krieg2065/firecrawl-mcp-server
```

### Option D: From Source
```bash
# Clone the repository
git clone https://github.com/Krieg2065/firecrawl-mcp-server.git
cd firecrawl-mcp-server
npm install
npm run build
```

## Step 3: Configure Claude Desktop

Add Firecrawl MCP to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["@krieg2065/firecrawl-mcp-server"],
      "env": {
        "FIRECRAWL_API_KEY": "your-firecrawl-api-key"
      }
    }
  }
}
```

For self-hosted Firecrawl instances:
```json
{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["@krieg2065/firecrawl-mcp-server"],
      "env": {
        "FIRECRAWL_API_KEY": "your-firecrawl-api-key",
        "FIRECRAWL_API_URL": "https://your-firecrawl-instance.com"
      }
    }
  }
}
```

## Step 4: Update AgileAiAgents .env File

Add Firecrawl configuration to the `.env` file:

```bash
# Firecrawl MCP (Research, Marketing, SEO, Analysis Agents)
FIRECRAWL_MCP_ENABLED=true
FIRECRAWL_API_KEY=your_firecrawl_api_key
# Optional: For self-hosted instances
FIRECRAWL_API_URL=https://api.firecrawl.dev
# Optional: Default settings
FIRECRAWL_DEFAULT_FORMAT=markdown
FIRECRAWL_DEFAULT_TIMEOUT=30000
FIRECRAWL_MOBILE_MODE=false
```

## Available MCP Tools

### Core Scraping Tools

#### **firecrawl_scrape**
Extract content from a single webpage
```
Parameters:
- url: Target webpage URL
- formats: markdown, html, screenshot, links, etc.
- mobile: Scrape as mobile device (true/false)
- actions: Click buttons, scroll, wait for elements
- waitFor: Wait for specific CSS selector
- timeout: Maximum wait time
- extractorOptions: AI extraction settings
Example: Scrape competitor pricing page with screenshots
```

#### **firecrawl_map**
Discover all URLs from a website
```
Parameters:
- url: Starting URL
- search: Filter URLs by pattern
- limit: Maximum URLs to return
- includeSubdomains: Include subdomain URLs
- ignoreSitemap: Skip sitemap.xml
Example: Map all product pages on competitor site
```

#### **firecrawl_crawl**
Crawl multiple pages asynchronously
```
Parameters:
- url: Starting URL
- limit: Maximum pages to crawl
- maxDepth: How deep to crawl
- includePaths: URL patterns to include
- excludePaths: URL patterns to exclude
- webhook: Notification URL
Example: Crawl entire documentation site
```

#### **firecrawl_batch_scrape**
Scrape multiple URLs in parallel
```
Parameters:
- urls: Array of URLs to scrape
- formats: Output formats
- extractorOptions: Extraction settings
Example: Scrape 100 product pages simultaneously
```

### Advanced Research Tools

#### **firecrawl_search**
Search the web and retrieve content
```
Parameters:
- query: Search query
- limit: Number of results
- lang: Language filter
- country: Country filter
- scrapeContent: Retrieve full page content
- timeRange: Filter by time (day, week, month, year)
Example: Find recent articles about AI trends
```

#### **firecrawl_extract**
Extract structured data using AI
```
Parameters:
- urls: Target URLs
- prompt: What to extract
- schema: Expected data structure
- mode: llm-extraction or llm-extraction-cloud
Example: Extract pricing data from competitor pages
```

#### **firecrawl_deep_research**
Conduct comprehensive research on a topic
```
Parameters:
- query: Research question
- maxTime: Time limit (seconds)
- includedDomains: Domains to focus on
- excludedDomains: Domains to avoid
Example: Research market trends in specific industry
```

### Utility Tools

#### **firecrawl_generate_llmstxt**
Generate LLM interaction guidelines
```
Parameters:
- url: Website URL
- pageLimit: Pages to analyze
Example: Create AI guidelines for website interaction
```

#### **firecrawl_check_crawl_status**
Check status of crawl job
```
Parameters:
- id: Crawl job ID
Example: Monitor progress of large crawl
```

#### **firecrawl_cancel_crawl**
Cancel ongoing crawl job
```
Parameters:
- id: Crawl job ID
Example: Stop crawl that's taking too long
```

## Agent Workflows with Firecrawl MCP

### For Research Agent - Market Intelligence

1. **Competitor Analysis**
   ```
   - Use firecrawl_map to discover all competitor pages
   - Use firecrawl_crawl to systematically analyze site
   - Use firecrawl_extract to pull pricing, features, messaging
   - Use firecrawl_scrape with screenshots for visual analysis
   ```

2. **Industry Research**
   ```
   - Use firecrawl_search to find industry reports
   - Use firecrawl_deep_research for comprehensive analysis
   - Use firecrawl_batch_scrape for multiple sources
   - Compile findings into market research document
   ```

3. **Trend Monitoring**
   ```
   - Set up regular crawls of key industry sites
   - Extract mentions of emerging technologies
   - Track competitor product launches
   - Monitor pricing changes over time
   ```

### For Marketing Agent - Content Strategy

1. **Content Gap Analysis**
   ```
   - Crawl competitor blogs and content hubs
   - Extract topics, keywords, and content types
   - Identify gaps in competitor coverage
   - Generate content strategy recommendations
   ```

2. **Campaign Research**
   ```
   - Scrape competitor landing pages
   - Extract messaging, CTAs, and offers
   - Analyze design patterns with screenshots
   - Compile best practices document
   ```

### For SEO Agent - Search Optimization

1. **SERP Analysis**
   ```
   - Use firecrawl_search to analyze search results
   - Extract ranking factors from top pages
   - Analyze competitor SEO strategies
   - Generate optimization recommendations
   ```

2. **Technical SEO Audit**
   ```
   - Crawl website to find all pages
   - Extract meta tags, headers, schema markup
   - Identify technical issues and opportunities
   - Create SEO improvement roadmap
   ```

### For Analysis Agent - Data Collection

1. **Market Data Collection**
   ```
   - Batch scrape industry data sources
   - Extract structured data for analysis
   - Monitor changes over time
   - Build datasets for insights
   ```

2. **Competitive Intelligence**
   ```
   - Regular crawls of competitor sites
   - Extract product updates and changes
   - Monitor pricing and promotions
   - Generate competitive reports
   ```

## Example Agent Prompts

### Competitor Website Analysis
```
Acting as the Research Agent, use Firecrawl MCP to:
1. Map all pages on competitor website example.com
2. Crawl their product pages to extract features and pricing
3. Take screenshots of key pages for visual analysis
4. Extract customer testimonials and case studies
5. Generate comprehensive competitor analysis report
```

### Market Research Project
```
Acting as the Research Agent, conduct deep research on:
1. "AI automation trends in healthcare 2024"
2. Search for recent articles and reports
3. Extract key statistics and insights
4. Identify leading companies and solutions
5. Compile findings with sources
```

### SEO Content Audit
```
Acting as the SEO Agent, analyze our blog content:
1. Crawl all blog posts on our site
2. Extract meta descriptions, titles, and headers
3. Identify missing SEO elements
4. Compare with top-ranking competitor content
5. Create optimization checklist
```

## Best Practices

### Scraping Ethics
1. **Respect robots.txt**: Check site permissions
2. **Rate limiting**: Don't overwhelm servers
3. **User agent**: Identify your scraper properly
4. **Terms of service**: Comply with website ToS
5. **Data usage**: Use scraped data responsibly

### Performance Optimization
1. **Batch operations**: Use batch_scrape for multiple URLs
2. **Selective formats**: Only request needed formats
3. **Timeout settings**: Set appropriate timeouts
4. **Credit management**: Monitor credit usage
5. **Caching**: Cache results when appropriate

### Data Quality
1. **Validation**: Verify scraped data accuracy
2. **Error handling**: Handle failed scrapes gracefully
3. **Duplicate detection**: Remove duplicate content
4. **Format consistency**: Standardize extracted data
5. **Source tracking**: Document data sources

## Troubleshooting

### "Invalid API key" Error
- Verify API key is correct in configuration
- Check key hasn't expired or been revoked
- Ensure no extra spaces in key
- Try regenerating key in Firecrawl dashboard

### "Insufficient credits" Error
- Check credit balance in dashboard
- Upgrade plan if needed
- Optimize operations to use fewer credits
- Use more efficient scraping methods

### "Timeout" Error
- Increase timeout parameter
- Check if site has anti-scraping measures
- Try mobile mode if desktop fails
- Use actions to handle dynamic content

### "No content extracted" Error
- Verify URL is accessible
- Check if content is JavaScript-rendered
- Use waitFor parameter for dynamic content
- Try different extraction formats

## Integration with AgileAiAgents

Once configured, agents will automatically:

### Research Agent
1. **Conduct market research** using web data
2. **Analyze competitors** systematically
3. **Monitor industry trends** and changes
4. **Gather user feedback** from review sites
5. **Track technology adoption** across markets

### Marketing Agent
1. **Research marketing campaigns** and strategies
2. **Analyze competitor messaging** and positioning
3. **Gather content ideas** from industry leaders
4. **Monitor social proof** and testimonials
5. **Track campaign performance** indicators

### SEO Agent
1. **Analyze SERP competition** for keywords
2. **Audit technical SEO** factors
3. **Research content gaps** and opportunities
4. **Monitor backlink profiles** of competitors
5. **Track ranking changes** over time

### Analysis Agent
1. **Collect market data** for analysis
2. **Build competitive datasets** for insights
3. **Monitor pricing trends** across industry
4. **Track feature adoption** by competitors
5. **Analyze customer sentiment** from reviews

Results are saved to:
```
agile-ai-agents/project-documents/
├── 01-research/
│   ├── competitor-analysis/
│   ├── market-research/
│   └── web-scraping-data/
├── 04-analysis/
│   ├── competitive-intelligence/
│   ├── market-trends/
│   └── data-extraction-results/
└── 12-seo/
    ├── serp-analysis/
    ├── competitor-seo/
    └── content-audit/
```

## Credit Usage Guide

Typical credit consumption:
- **Simple scrape**: 1 credit
- **JavaScript rendering**: 2-5 credits
- **Screenshot**: 2 credits
- **Crawl**: 1 credit per page
- **Search**: 1 credit per query
- **Deep research**: 10-50 credits
- **Batch operations**: Sum of individual operations

## Security Considerations

- **API key security**: Never expose API key in public code
- **Data privacy**: Handle scraped data according to privacy laws
- **Rate limiting**: Implement delays between requests
- **Error logs**: Don't log sensitive scraped data
- **Access control**: Limit who can trigger scraping operations
- **Compliance**: Ensure GDPR/CCPA compliance for scraped data

## Advanced Features

### Custom Actions
```javascript
// Example: Click button and wait for content
{
  "actions": [
    {
      "type": "click",
      "selector": "#load-more-button"
    },
    {
      "type": "wait",
      "milliseconds": 2000
    },
    {
      "type": "scroll",
      "direction": "down",
      "amount": 500
    }
  ]
}
```

### AI Extraction Schema
```javascript
// Example: Extract product information
{
  "extractorOptions": {
    "mode": "llm-extraction",
    "extractionPrompt": "Extract product name, price, features, and reviews",
    "extractionSchema": {
      "type": "object",
      "properties": {
        "productName": {"type": "string"},
        "price": {"type": "number"},
        "features": {"type": "array", "items": {"type": "string"}},
        "reviewCount": {"type": "number"},
        "averageRating": {"type": "number"}
      }
    }
  }
}
```

### Webhook Integration
```javascript
// Example: Get notified when crawl completes
{
  "webhook": "https://your-app.com/webhooks/crawl-complete",
  "webhookHeaders": {
    "Authorization": "Bearer your-token"
  }
}
```

## Additional Resources

- **Firecrawl Documentation**: https://docs.firecrawl.dev
- **API Reference**: https://docs.firecrawl.dev/api-reference
- **GitHub Repository**: https://github.com/Krieg2065/firecrawl-mcp-server
- **Firecrawl Dashboard**: https://app.firecrawl.dev
- **Community Support**: https://discord.gg/firecrawl

This integration empowers AgileAiAgents to gather comprehensive web intelligence for informed decision-making!
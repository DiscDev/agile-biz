# MCP (Model Context Protocol) Setup Guides

This directory contains setup guides for various MCP servers that enhance the capabilities of AgileAiAgents' specialized agents.

## What are MCP Servers?

MCP (Model Context Protocol) servers are external integrations that give Claude desktop direct access to tools and services. When configured, agents can perform actions directly in these services rather than just providing instructions.

## Available MCP Setup Guides

### 🎨 Figma MCP
**File**: `figma-mcp-setup.md`  
**For**: UI/UX Agent  
**Capabilities**: Create designs, components, and frames directly in Figma  
**Benefits**: Professional UI/UX designs created in your actual Figma workspace

### 🐙 GitHub MCP
**File**: `github-mcp-setup.md`  
**For**: Coder Agent & DevOps Agent  
**Capabilities**: Manage repos, branches, commits, PRs, issues, and GitHub Actions  
**Benefits**: Complete Git workflow automation and CI/CD management

### 🎭 Playwright MCP
**File**: `playwright-mcp-setup.md`  
**For**: Testing Agent  
**Capabilities**: Real browser automation, UI testing, screenshots, and cross-browser validation  
**Benefits**: Comprehensive browser testing with Chrome, Firefox, Safari, and Edge

### 🌐 BrowserStack MCP
**File**: `browserstack-mcp-setup.md`  
**For**: Testing Agent  
**Capabilities**: Cloud testing on 3000+ real browsers/devices, parallel testing, mobile device testing  
**Benefits**: Enterprise-grade cross-browser testing without maintaining device farms

### 🚀 More Coming Soon
Additional MCP integrations are being developed for:
- **Slack MCP** - For Project Manager agent communications
- **Database MCP** - For direct database interactions
- **AWS MCP** - For DevOps agent infrastructure management
- **Linear MCP** - For Project Manager agent task tracking

## How to Use MCP Servers

1. **Choose an MCP** based on your project needs
2. **Follow the setup guide** in the corresponding file
3. **Configure credentials** in your .env file
4. **Restart Claude Desktop** after configuration
5. **Agents will automatically** use MCP when available

## Important Notes

- MCP servers only work with **Claude Desktop** (not web version)
- Each MCP requires specific **credentials** (API keys, tokens)
- Configuration is done in Claude Desktop's **settings**
- Agents will fall back to instructions if MCP is not available

## Security Considerations

- Never commit credentials to version control
- Use .env files for sensitive information
- Rotate API tokens periodically
- Only enable MCPs you actively use

## Troubleshooting

If an MCP isn't working:
1. Verify you're using Claude Desktop
2. Check credentials are correct
3. Restart Claude Desktop
4. Review the specific setup guide
5. Check MCP server logs

## Contributing

To add a new MCP setup guide:
1. Create a new markdown file: `[service]-mcp-setup.md`
2. Follow the format of existing guides
3. Include all necessary steps and troubleshooting
4. Update this README with the new MCP
5. Update relevant agent files to mention the MCP
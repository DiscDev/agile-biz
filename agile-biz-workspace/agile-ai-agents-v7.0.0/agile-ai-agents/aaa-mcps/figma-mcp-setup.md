# Figma MCP Server Setup Guide

## Overview

The Figma MCP (Model Context Protocol) server enables the UI/UX Agent to directly interact with Figma for creating, reading, and managing design files. This integration allows the agent to generate professional UI designs, create design systems, and maintain design consistency throughout your project.

## What This Enables

With Figma MCP configured, the UI/UX Agent can:
- 🎨 **Create design files** directly in Figma
- 📐 **Generate components** and design systems
- 🖼️ **Create frames** for different screen sizes
- 🎯 **Add auto-layouts** for responsive designs
- 🏷️ **Manage design tokens** and styles
- 📱 **Design for multiple devices** simultaneously
- 🔄 **Update existing designs** based on feedback
- 📊 **Export design assets** for development

## Prerequisites

1. **Figma Account**: You need a Figma account (free tier works)
2. **Figma Access Token**: Required for API authentication
3. **Team ID** (optional): For team-specific operations
4. **Claude Desktop**: MCP servers work with Claude Desktop app

## Step 1: Get Your Figma Access Token

1. **Log in to Figma** at https://www.figma.com
2. **Go to Settings**:
   - Click your profile icon (top-left)
   - Select "Settings"
3. **Generate Personal Access Token**:
   - Scroll to "Personal access tokens"
   - Click "Generate new token"
   - Give it a descriptive name (e.g., "AgileAiAgents UI/UX")
   - Copy the token immediately (you won't see it again!)

## Step 2: Get Your Figma Team ID (Optional)

If you want the UI/UX Agent to work within a specific team:

1. **Navigate to your team** in Figma
2. **Look at the URL**: `https://www.figma.com/files/team/TEAM_ID/team-name`
3. **Copy the TEAM_ID** portion

## Step 3: Install Figma MCP Server

### Option A: Using NPX (Recommended)
```bash
# No installation needed, will run directly
npx @sonnylazuardi/cursor-talk-to-figma-mcp
```

### Option B: Global Installation
```bash
npm install -g @sonnylazuardi/cursor-talk-to-figma-mcp
```

## Step 4: Configure Claude Desktop

1. **Open Claude Desktop settings**
2. **Navigate to MCP Servers section**
3. **Add Figma MCP configuration**:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["@sonnylazuardi/cursor-talk-to-figma-mcp"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-figma-access-token-here",
        "FIGMA_TEAM_ID": "your-team-id-here"
      }
    }
  }
}
```

## Step 5: Update AgileAiAgents .env File

Add your Figma credentials to the `.env` file:

```bash
# Figma MCP (UI/UX Agent)
FIGMA_MCP_ENABLED=true
FIGMA_ACCESS_TOKEN=your-figma-access-token-here
FIGMA_TEAM_ID=your-team-id-here  # Optional
```

## Available MCP Tools for UI/UX Agent

Once configured, the UI/UX Agent can use these Figma tools:

### 1. **figma_create_file**
Create new Figma design files
```
Example: Create a new file for the task management app design
```

### 2. **figma_read_file**
Read and analyze existing Figma files
```
Example: Read the current design system file
```

### 3. **figma_create_frame**
Create frames for different screen sizes
```
Example: Create mobile (375x812) and desktop (1440x900) frames
```

### 4. **figma_create_component**
Create reusable design components
```
Example: Create button component with hover and active states
```

### 5. **figma_add_text**
Add text layers with styling
```
Example: Add heading with brand typography
```

### 6. **figma_add_rectangle**
Create shapes and containers
```
Example: Create card container with rounded corners
```

### 7. **figma_apply_auto_layout**
Make designs responsive with auto-layout
```
Example: Apply auto-layout to navigation bar
```

### 8. **figma_update_node**
Update existing design elements
```
Example: Update button color to match brand
```

### 9. **figma_search_files**
Search through Figma files
```
Example: Find all files with "dashboard" in the name
```

## UI/UX Agent Workflow with Figma MCP

When the UI/UX Agent uses Figma MCP, the typical workflow is:

1. **Create Design File**
   ```
   The agent creates a new Figma file for your project
   ```

2. **Set Up Design System**
   ```
   - Creates color styles
   - Sets up typography scales
   - Defines spacing system
   - Creates base components
   ```

3. **Design Screens**
   ```
   - Creates frames for each screen
   - Applies auto-layout for responsiveness
   - Uses consistent components
   - Maintains design system
   ```

4. **Generate Variations**
   ```
   - Mobile responsive versions
   - Dark mode variants
   - Different states (empty, loading, error)
   ```

5. **Export for Development**
   ```
   - Provides Figma links
   - Documents design decisions
   - Creates style guide
   ```

## Example UI/UX Agent Prompts with Figma MCP

### Basic Design Creation
```
Acting as the UI/UX Agent, use the Figma MCP to create a design file for our task management app. 
Start with a desktop dashboard design including navigation, task list, and sidebar.
```

### Design System Setup
```
Acting as the UI/UX Agent, create a comprehensive design system in Figma including:
- Color palette (primary, secondary, neutral)
- Typography scale (headings, body, captions)
- Component library (buttons, inputs, cards)
- Spacing and grid system
```

### Responsive Design
```
Acting as the UI/UX Agent, create responsive versions of the dashboard for:
- Desktop (1440px)
- Tablet (768px)
- Mobile (375px)
Use Figma's auto-layout to ensure proper responsiveness.
```

## Troubleshooting

### "Authentication failed" Error
- Verify your Figma access token is correct
- Ensure token has necessary permissions
- Check if token hasn't expired

### "Cannot find team" Error
- Verify your Team ID is correct
- Ensure your account has access to the team
- Try without Team ID for personal files

### "MCP not available" Error
- Ensure Claude Desktop is being used (not web)
- Restart Claude Desktop after configuration
- Check MCP server logs for errors

## Best Practices

1. **Design System First**: Always start with a design system
2. **Component-Based**: Create reusable components
3. **Auto-Layout**: Use auto-layout for responsive designs
4. **Consistent Naming**: Use clear, consistent layer names
5. **Version Control**: Figma has built-in version history
6. **Collaboration**: Share Figma links in project documentation

## Security Notes

- **Never commit** your Figma access token to version control
- **Use .env file** to store credentials securely
- **Rotate tokens** periodically for security
- **Limit permissions** to what's necessary

## Additional Resources

- **MCP Server Documentation**: https://smithery.ai/server/@sonnylazuardi/cursor-talk-to-figma-mcp
- **Available Tools**: https://smithery.ai/server/@sonnylazuardi/cursor-talk-to-figma-mcp/tools
- **API Reference**: https://smithery.ai/server/@sonnylazuardi/cursor-talk-to-figma-mcp/api
- **Figma API Docs**: https://www.figma.com/developers/api

## Integration with AgileAiAgents

Once configured, the UI/UX Agent will automatically:
1. Create design files in your Figma workspace
2. Generate designs based on PRD requirements
3. Maintain design consistency across the project
4. Provide Figma links in design documentation
5. Update designs based on feedback during sprints

The agent will save Figma file links and design documentation to:
```
agile-ai-agents/project-documents/technical/
├── design-system.md
├── figma-links.md
├── component-library.md
└── design-decisions.md
```

This integration significantly enhances the UI/UX Agent's capabilities, enabling professional-grade design creation directly within your Figma workspace!
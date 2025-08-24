# AI Agent Project Dashboard

Real-time monitoring dashboard for AI agent coordination systems.

## 🚀 Quick Start

### Automatic Launch (Recommended)
```bash
# From your project root directory
node project-dashboard/start-dashboard.js
```

### Manual Launch
```bash
# Navigate to dashboard directory
cd project-dashboard

# Install dependencies (first time only)
npm install

# Start dashboard
npm start
```

## 📊 Dashboard Features

### Real-Time Monitoring
- **Live Document Updates**: Watch as AI agents create and modify documents
- **Agent Activity Feed**: Real-time stream of agent activities and progress
- **File System Monitoring**: Automatic detection of new files and changes
- **WebSocket Communication**: Instant updates without page refresh
- **Custom Favicon**: Distinctive robot/dashboard icon for easy tab identification

### Document Management
- **Interactive Document Tree**: Browse all project documents by category
- **Live Document Viewer**: View markdown documents with syntax highlighting
- **Search & Navigation**: Quick access to any document or report
- **Real-Time Content Updates**: Document content updates automatically

### Project Tracking
- **Sprint Progress**: Monitor current sprint status and deliverables
- **Agent Coordination**: Track agent handoffs and collaboration
- **Stakeholder Decision Points**: Alerts when user input is required
- **Progress Visualization**: Visual indicators of project completion

## 🔧 Technical Details

### System Requirements
- **Node.js 16+**: Required for running the dashboard server
- **Modern Browser**: Chrome, Firefox, Safari, or Edge
- **Port 3001**: Default dashboard port (configurable)

### Architecture
- **Backend**: Node.js with Express and Socket.IO
- **Frontend**: Vanilla JavaScript with real-time WebSocket updates
- **File Monitoring**: Chokidar for cross-platform file system watching
- **Markdown Rendering**: Marked.js with syntax highlighting

### File Structure
```
project-dashboard/
├── package.json                # Dependencies and scripts
├── server.js                   # Main dashboard server
├── start-dashboard.js          # Launcher script
├── public/
│   ├── index.html             # Dashboard interface
│   ├── styles.css             # Dashboard styling
│   ├── dashboard.js           # Frontend JavaScript
│   ├── favicon.svg            # Vector favicon (main)
│   ├── favicon.ico            # Legacy favicon
│   ├── android-chrome-192x192.png # Mobile icon
│   └── site.webmanifest       # PWA manifest
└── readme.md                  # This file
```

## 📁 Monitored Directories

The dashboard automatically monitors the `project-documents/` folder structure:

```
project-documents/
├── 00-orchestration/    # Agent coordination and logs
├── 01-research/         # Research reports and analysis
├── 02-marketing/        # Marketing strategy and content
├── 03-finance/          # Financial analysis and planning
├── 04-analysis/         # Strategic analysis and recommendations
├── 05-requirements/     # PRD and requirements documents
├── 06-llm-analysis/     # LLM research and selection
├── 07-api-analysis/     # API research and integration
├── 08-mcp-analysis/     # MCP server integration
├── 09-project-planning/ # Project planning and timelines
├── 10-environment/      # Environment setup
├── 11-design/           # UI/UX designs and specifications
├── 12-seo/              # SEO strategy and optimization
├── 13-implementation/   # Development and code
├── 14-testing/          # Testing plans and results
├── 15-deployment/       # Deployment and infrastructure
└── 16-launch/           # Launch and marketing campaigns
```

## 🎯 Usage

### Starting the Dashboard
1. **Copy the entire `project-dashboard/` folder** to your new project directory
2. **Run the launcher**: `node project-dashboard/start-dashboard.js`
3. **Open your browser**: Navigate to `http://localhost:3001`
4. **Start your AI agents**: The dashboard will automatically detect new documents

### Dashboard Interface
- **Left Sidebar**: Document tree and quick actions
- **Center Panel**: Live agent activity feed
- **Right Panel**: Document viewer with syntax highlighting
- **Header**: Connection status and project information

### Real-Time Features
- **Document Creation**: See new documents appear instantly
- **Content Updates**: Watch document content change in real-time
- **Agent Activities**: Monitor agent progress and coordination
- **Stakeholder Alerts**: Get notified when decisions are needed

## ⚙️ Configuration

### Port Configuration
Change the default port by setting the `PORT` environment variable:
```bash
PORT=3002 node project-dashboard/start-dashboard.js
```

### Project Path
The dashboard automatically detects the project root directory. If needed, you can specify a custom path:
```bash
PROJECT_ROOT=/path/to/your/project node project-dashboard/start-dashboard.js
```

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using port 3001
lsof -i :3001

# Use a different port
PORT=3002 node project-dashboard/start-dashboard.js
```

#### Dependencies Not Installing
```bash
# Clear npm cache and reinstall
cd project-dashboard
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### Dashboard Not Updating
```bash
# Check if file watching is working
# Look for console messages about file changes
# Ensure project-documents/ folder exists
```

### Performance Tips
- **Large Projects**: The dashboard handles thousands of files efficiently
- **Memory Usage**: Restart dashboard if memory usage becomes high
- **Browser Performance**: Refresh browser tab if updates slow down

## 🔧 Development

### Local Development
```bash
cd project-dashboard
npm install
npm run dev  # Uses nodemon for auto-restart
```

### Adding Features
- **Backend**: Modify `server.js` for new API endpoints
- **Frontend**: Update `public/dashboard.js` for new functionality
- **Styling**: Customize `public/styles.css` for appearance changes

## 📝 Logs

Dashboard logs are displayed in the terminal:
- **File Changes**: Real-time file system events
- **Client Connections**: WebSocket connection status
- **Errors**: Any issues with file monitoring or serving

## 🎨 Customization

### Styling
The dashboard uses a dark theme optimized for development work. You can customize:
- **Colors**: Modify CSS variables in `styles.css`
- **Layout**: Adjust flexbox layouts and responsive breakpoints
- **Icons**: Update emoji icons throughout the interface

### Functionality
- **Add New File Types**: Extend file monitoring beyond `.md` files
- **Custom Visualizations**: Add charts and graphs for project metrics
- **Integration**: Connect to external project management tools

---

**Ready to monitor your AI agent coordination in real-time!** 🎯

Start the dashboard and watch your AI agents work together seamlessly.
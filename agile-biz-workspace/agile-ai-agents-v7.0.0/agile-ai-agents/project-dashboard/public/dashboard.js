// AI Agent Project Dashboard JavaScript

class ProjectDashboard {
    constructor() {
        this.socket = null;
        this.autoScroll = true;
        this.currentDocument = null;
        this.documentTree = {};
        this.mcpTree = {};
        this.agents = [];
        this.systemDocs = [];
        this.activeTab = 'documents';
        this.projectProgress = {
            percentage: 0,
            phase: 'Initializing',
            sprint: '-',
            tasksCompleted: 0,
            tasksTotal: 0
        };
        
        this.backlogMetrics = {
            totalItems: 0,
            totalPoints: 0,
            readyPoints: 0,
            averageVelocity: 0,
            sprintsRemaining: 0
        };
        
        this.init();
    }

    init() {
        this.connectSocket();
        this.setupEventListeners();
        this.setupResizeHandle();
        this.updateTimestamp();
        this.loadVersion();
        
        // Setup mobile functions
        this.setupMobileEvents();
        
        // Initialize tab functionality
        setTimeout(() => this.initializeTabButtons(), 100);
        
        // Update timestamp every minute
        setInterval(() => this.updateTimestamp(), 60000);
        
        // Request progress update every 30 seconds
        setInterval(() => this.requestProgressUpdate(), 30000);
    }

    connectSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('🔌 Connected to dashboard');
            this.updateConnectionStatus(true);
            this.requestDocumentTree();
            this.requestProgressUpdate(); // This now requests both progress and backlog
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 Disconnected from dashboard');
            this.updateConnectionStatus(false);
        });

        this.socket.on('dashboard-connected', (data) => {
            console.log('📊 Dashboard initialized:', data);
            
            // Update project name if available
            if (data.projectConfig && data.projectConfig.projectName) {
                this.updateProjectName(data.projectConfig.projectName);
            }
            
            this.addActivity('🎯 Dashboard Connected', 'Connected to AI agent coordination system', 'startup');
            // Don't request all data immediately - let tabs handle their own loading
            // Force render of initial tab content
            this.loadInitialTabContent();
        });

        this.socket.on('file-added', (data) => {
            console.log('📄 File added:', data.path);
            this.addActivity(`📄 New Document`, `Created: ${data.path}`, 'new');
            this.requestDocumentTree();
        });

        this.socket.on('file-changed', (data) => {
            console.log('📝 File changed:', data.path);
            this.addActivity(`📝 Document Updated`, `Modified: ${data.path}`, 'new');
            
            // Refresh current document if it's the one that changed
            if (this.currentDocument === data.path) {
                this.loadDocument(data.path);
            }
        });

        this.socket.on('file-removed', (data) => {
            console.log('🗑️ File removed:', data.path);
            this.addActivity(`🗑️ Document Removed`, `Deleted: ${data.path}`, 'startup');
            this.requestDocumentTree();
        });

        this.socket.on('document-update', (data) => {
            console.log('📖 Document content updated:', data.path);
            
            // Update current document view if it matches
            if (this.currentDocument === data.path) {
                this.displayDocumentContent(data);
            }
        });

        this.socket.on('document-tree', (tree) => {
            console.log('🌳 Document tree updated');
            this.documentTree = tree;
            this.renderDocumentTree(tree);
        });

        this.socket.on('error', (error) => {
            console.error('❌ Socket error:', error);
            this.addActivity('❌ Error', error.message, 'startup');
        });

        // Project progress updates
        this.socket.on('progress-update', (progressData) => {
            console.log('📊 Progress update:', progressData);
            this.updateProjectProgress(progressData);
        });

        // Backlog metrics updates
        this.socket.on('backlog-update', (backlogData) => {
            console.log('📋 Backlog update:', backlogData);
            this.updateBacklogMetrics(backlogData);
        });

        // MCP tree updates
        this.socket.on('mcp-tree', (tree) => {
            console.log('🔧 MCP tree updated');
            this.mcpTree = tree;
            this.renderMCPTree(tree);
        });

        // Agent list updates
        this.socket.on('agents-list', (agents) => {
            console.log('🤖 Agents list updated:', agents);
            this.agents = agents;
            this.renderAgents(agents);
        });

        // System docs updates
        this.socket.on('system-docs', (docs) => {
            console.log('📚 System docs updated:', docs);
            this.systemDocs = docs;
            this.renderSystemDocs(docs);
        });
        
        // Project config updates
        this.socket.on('project-config-update', (config) => {
            console.log('📋 Project config updated:', config);
            if (config.projectName) {
                this.updateProjectName(config.projectName);
            }
        });
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connection-status');
        const dot = statusElement.querySelector('.status-dot');
        const text = statusElement.querySelector('.status-text');
        
        if (connected) {
            dot.classList.remove('disconnected');
            text.textContent = 'Connected';
        } else {
            dot.classList.add('disconnected');
            text.textContent = 'Disconnected';
        }
    }

    updateProjectName(projectName) {
        const projectNameElement = document.getElementById('project-name');
        if (projectNameElement) {
            projectNameElement.textContent = `🤖 ${projectName}`;
            document.title = `${projectName} - AgileAiAgents Dashboard`;
        }
        
        // Show edit button on hover
        const editBtn = document.getElementById('edit-project-name');
        if (editBtn) {
            editBtn.style.display = 'inline-block';
        }
    }
    
    setupEventListeners() {
        // Global functions for buttons
        window.refreshDocuments = () => this.requestDocumentTree();
        window.toggleAutoScroll = () => this.toggleAutoScroll();
        window.clearActivity = () => this.clearActivity();
        
        // Project name edit functionality
        const editBtn = document.getElementById('edit-project-name');
        const projectNameElement = document.getElementById('project-name');
        
        if (editBtn && projectNameElement) {
            editBtn.addEventListener('click', () => {
                const currentName = projectNameElement.textContent.replace('🤖 ', '');
                const newName = prompt('Enter new project name:', currentName);
                
                if (newName && newName !== currentName) {
                    this.updateProjectConfig(newName);
                }
            });
        }
        
        // Setup backlog collapse button
        const collapseBtn = document.getElementById('backlog-collapse-btn');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => this.toggleBacklogCollapse());
            
            // Load saved state
            const isCollapsed = localStorage.getItem('backlog-collapsed') === 'true';
            if (isCollapsed) {
                this.toggleBacklogCollapse();
            }
        }
        
        // Setup project progress section toggle
        const progressToggle = document.getElementById('progress-section-toggle');
        if (progressToggle) {
            progressToggle.addEventListener('click', () => this.toggleProgressSection());
            
            // Load saved state
            const isProgressCollapsed = localStorage.getItem('progress-section-collapsed') === 'true';
            if (isProgressCollapsed) {
                this.toggleProgressSection();
            }
        }
    }
    
    toggleBacklogCollapse() {
        const container = document.querySelector('.backlog-metrics-container');
        if (container) {
            container.classList.toggle('collapsed');
            const isCollapsed = container.classList.contains('collapsed');
            localStorage.setItem('backlog-collapsed', isCollapsed);
        }
    }
    
    toggleProgressSection() {
        const section = document.querySelector('.project-progress-section');
        if (section) {
            section.classList.toggle('collapsed');
            const isCollapsed = section.classList.contains('collapsed');
            localStorage.setItem('progress-section-collapsed', isCollapsed);
        }
    }

    setupResizeHandle() {
        const resizeHandle = document.querySelector('.resize-handle');
        const sidebarContainer = document.querySelector('.sidebar-container');
        
        if (!resizeHandle || !sidebarContainer) return;
        
        let isResizing = false;
        let startX = 0;
        let startWidth = 0;
        
        // Get saved width from localStorage
        const savedWidth = localStorage.getItem('sidebar-width');
        if (savedWidth) {
            sidebarContainer.style.width = savedWidth + 'px';
        }
        
        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = sidebarContainer.offsetWidth;
            
            resizeHandle.classList.add('dragging');
            document.body.classList.add('resizing');
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const diff = e.clientX - startX;
            const newWidth = startWidth + diff;
            
            // Respect min/max width constraints
            if (newWidth >= 250 && newWidth <= 600) {
                sidebarContainer.style.width = newWidth + 'px';
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                resizeHandle.classList.remove('dragging');
                document.body.classList.remove('resizing');
                
                // Save the width to localStorage
                localStorage.setItem('sidebar-width', sidebarContainer.offsetWidth);
            }
        });
    }

    initializeTabButtons() {
        // Set up tab button event listeners
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const tabName = button.getAttribute('data-tab');
                console.log(`🖱️ Tab button clicked: ${tabName}`);
                switchTab(tabName, event);
            });
        });
        
        // Set up quick action button event listeners
        const actionButtons = document.querySelectorAll('[data-action]');
        actionButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const action = button.getAttribute('data-action');
                console.log(`🖱️ Action button clicked: ${action}`);
                
                switch(action) {
                    case 'refresh':
                        // Refresh only the current tab's data
                        switch(this.activeTab) {
                            case 'documents':
                                this.requestDocumentTree();
                                break;
                            case 'mcp':
                                this.requestMCPTree();
                                break;
                            case 'agents':
                                this.requestAgents();
                                break;
                            case 'system':
                                this.requestSystemDocs();
                                break;
                            case 'guide':
                                // Guide tab has static content, no refresh needed
                                console.log('📘 Guide tab content is static');
                                break;
                        }
                        break;
                    case 'toggle-autoscroll':
                        this.toggleAutoScroll();
                        break;
                    case 'clear-activity':
                        this.clearActivity();
                        break;
                }
            });
        });
        
        // Set up event delegation for dynamically generated content
        document.addEventListener('click', (event) => {
            // Handle regular documents
            const docTarget = event.target.closest('[data-document-path]');
            if (docTarget) {
                const path = docTarget.getAttribute('data-document-path');
                const type = docTarget.getAttribute('data-document-type') || 'project';
                console.log(`🖱️ Document clicked: ${path} (${type})`);
                this.loadDocument(path, type);
            }
            
            // Handle guide documents
            const guideTarget = event.target.closest('[data-guide-path]');
            if (guideTarget) {
                const path = guideTarget.getAttribute('data-guide-path');
                console.log(`📘 Guide clicked: ${path}`);
                this.loadGuideDocument(path);
            }
        });
    }

    loadInitialTabContent() {
        // Ensure the documents tab shows some content immediately
        setTimeout(() => {
            if (this.activeTab === 'documents') {
                this.renderDocumentTree(this.documentTree);
            }
        }, 500);
        
        // Make sure all tab content areas have some initial state
        this.ensureTabContentLoaded();
    }

    ensureTabContentLoaded() {
        // Agents tab
        const agentList = document.getElementById('agent-list');
        if (agentList && agentList.innerHTML.includes('Loading agents...')) {
            if (this.agents.length === 0) {
                agentList.innerHTML = `
                    <div class="loading">
                        <span>📡 Requesting agents data...</span>
                        <div class="loading-spinner"></div>
                    </div>
                `;
            }
        }

        // System docs tab  
        const systemDocs = document.getElementById('system-docs');
        if (systemDocs && systemDocs.innerHTML.includes('Loading system docs...')) {
            if (this.systemDocs.length === 0) {
                systemDocs.innerHTML = `
                    <div class="loading">
                        <span>📡 Requesting system documentation...</span>
                        <div class="loading-spinner"></div>
                    </div>
                `;
            }
        }
    }

    requestDocumentTree() {
        if (this.socket && this.socket.connected) {
            this.socket.emit('request-document-tree');
        }
    }

    renderDocumentTree(tree, container = null, level = 0) {
        if (!container) {
            container = document.getElementById('document-tree');
            container.innerHTML = '';
        }

        const sortedEntries = Object.entries(tree).sort(([a], [b]) => {
            const aIsDir = tree[a].type === 'directory';
            const bIsDir = tree[b].type === 'directory';
            
            if (aIsDir && !bIsDir) return -1;
            if (!aIsDir && bIsDir) return 1;
            return a.localeCompare(b);
        });

        sortedEntries.forEach(([name, item]) => {
            const element = document.createElement('div');
            element.className = `tree-item ${item.type}`;
            element.style.paddingLeft = `${level * 1 + 0.5}rem`;
            
            if (item.type === 'directory') {
                element.innerHTML = `📁 ${name}`;
                element.addEventListener('click', () => {
                    const childContainer = element.nextElementSibling;
                    if (childContainer && childContainer.classList.contains('tree-children')) {
                        childContainer.style.display = childContainer.style.display === 'none' ? 'block' : 'none';
                    }
                });
                
                container.appendChild(element);
                
                // Add children container
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'tree-children';
                childrenContainer.style.display = 'block';
                container.appendChild(childrenContainer);
                
                if (item.children) {
                    this.renderDocumentTree(item.children, childrenContainer, level + 1);
                }
            } else if (item.type === 'file') {
                element.innerHTML = `📄 ${name}`;
                element.addEventListener('click', () => {
                    this.selectDocument(element, item.path);
                });
                container.appendChild(element);
            }
        });
    }

    selectDocument(element, path) {
        // Update selection
        document.querySelectorAll('.tree-item').forEach(item => {
            item.classList.remove('active');
        });
        element.classList.add('active');
        
        this.currentDocument = path;
        this.loadDocument(path);
    }

    async loadDocument(path) {
        try {
            const response = await fetch(`/api/document?path=${encodeURIComponent(path)}`);
            if (!response.ok) {
                throw new Error(`Failed to load document: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.displayDocumentContent(data);
        } catch (error) {
            console.error('Error loading document:', error);
            this.displayError(`Failed to load document: ${error.message}`);
        }
    }

    displayDocumentContent(data) {
        const viewer = document.getElementById('document-viewer');
        const modifiedDate = new Date(data.modified || Date.now()).toLocaleString();
        
        viewer.innerHTML = `
            <div class="document-header">
                <div class="document-title">📄 ${data.path}</div>
                <div class="document-meta">
                    Modified: ${modifiedDate} | Size: ${this.formatFileSize(data.size || 0)}
                </div>
            </div>
            <div class="document-content">
                ${data.html || data.content || 'No content available'}
            </div>
            <div class="back-to-top">
                <a href="#" class="back-to-top-link">↑ Back to Top</a>
            </div>
        `;
        
        // Add event listener for back to top
        const backToTopLink = viewer.querySelector('.back-to-top-link');
        if (backToTopLink) {
            backToTopLink.addEventListener('click', (e) => {
                e.preventDefault();
                viewer.scrollTop = 0;
            });
        }
        
        // Add event listeners for anchor links (table of contents, etc.)
        const anchorLinks = viewer.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                
                if (targetId) {
                    // Try to find the target element within the document content
                    const contentDiv = viewer.querySelector('.document-content');
                    if (!contentDiv) return;
                    
                    // First try exact ID match
                    let targetElement = contentDiv.querySelector(`#${CSS.escape(targetId)}`);
                    
                    // If not found, try without special character escaping (for simple IDs)
                    if (!targetElement) {
                        targetElement = contentDiv.querySelector(`#${targetId}`);
                    }
                    
                    // If still not found, try to find by heading text
                    if (!targetElement) {
                        const headingText = decodeURIComponent(targetId).replace(/-/g, ' ');
                        const headings = contentDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
                        
                        for (const heading of headings) {
                            if (heading.textContent.toLowerCase().trim() === headingText.toLowerCase() ||
                                heading.textContent.toLowerCase().includes(headingText.toLowerCase())) {
                                targetElement = heading;
                                break;
                            }
                        }
                    }
                    
                    if (targetElement) {
                        // Scroll the target element into view
                        const viewerRect = viewer.getBoundingClientRect();
                        const targetRect = targetElement.getBoundingClientRect();
                        const scrollPosition = targetRect.top - viewerRect.top + viewer.scrollTop - 20;
                        
                        viewer.scrollTo({
                            top: scrollPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    displayError(message) {
        const viewer = document.getElementById('document-viewer');
        viewer.innerHTML = `
            <div class="document-content">
                <div style="color: #f44336; text-align: center; padding: 2rem;">
                    <h3>❌ Error</h3>
                    <p>${message}</p>
                </div>
            </div>
        `;
    }

    addActivity(title, description, type = 'new') {
        const feed = document.getElementById('activity-feed');
        const timestamp = new Date().toLocaleTimeString();
        
        const activityItem = document.createElement('div');
        activityItem.className = `activity-item ${type}`;
        activityItem.innerHTML = `
            <div class="activity-time">${timestamp}</div>
            <div class="activity-content">
                <strong>${title}</strong>
                <p>${description}</p>
            </div>
        `;
        
        // Add to top of feed
        feed.insertBefore(activityItem, feed.firstChild);
        
        // Auto-scroll if enabled
        if (this.autoScroll) {
            activityItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        // Limit activity items to 50
        const items = feed.querySelectorAll('.activity-item');
        if (items.length > 50) {
            items[items.length - 1].remove();
        }
    }

    toggleAutoScroll() {
        this.autoScroll = !this.autoScroll;
        const button = event.target;
        button.textContent = this.autoScroll ? '📜 Auto-scroll' : '⏸️ Manual';
        
        this.addActivity(
            '⚙️ Setting Changed', 
            `Auto-scroll ${this.autoScroll ? 'enabled' : 'disabled'}`, 
            'startup'
        );
    }

    clearActivity() {
        const feed = document.getElementById('activity-feed');
        feed.innerHTML = `
            <div class="activity-item startup">
                <div class="activity-time">Just now</div>
                <div class="activity-content">
                    <strong>🧹 Activity Cleared</strong>
                    <p>Activity feed has been cleared</p>
                </div>
            </div>
        `;
    }

    updateTimestamp() {
        const timestampElement = document.getElementById('last-update');
        if (timestampElement) {
            timestampElement.textContent = new Date().toLocaleTimeString();
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async loadVersion() {
        try {
            const response = await fetch('/api/version');
            if (response.ok) {
                const versionData = await response.json();
                this.updateVersionDisplay(versionData);
            } else {
                console.warn('Failed to load version information');
            }
        } catch (error) {
            console.error('Error loading version:', error);
        }
    }

    updateVersionDisplay(versionData) {
        const headerVersion = document.getElementById('header-version');
        const footerVersion = document.getElementById('footer-version');
        
        const versionText = `v${versionData.version}`;
        const versionTitle = `${versionData.releaseName || 'Release'} - ${versionData.releaseDate || 'Unknown Date'}`;
        
        if (headerVersion) {
            headerVersion.textContent = versionText;
            headerVersion.title = versionTitle;
        }
        
        if (footerVersion) {
            footerVersion.textContent = versionText;
            footerVersion.title = versionTitle;
        }

        // Add version info to activity feed
        if (versionData.version) {
            this.addActivity(
                '🏷️ System Version', 
                `AgileAiAgents ${versionData.version} (${versionData.releaseName || 'Release'})`, 
                'startup'
            );
        }
    }

    updateProjectProgress(progressData) {
        // Update internal state
        this.projectProgress = {
            ...this.projectProgress,
            ...progressData
        };

        // Update UI elements
        const progressBar = document.getElementById('progress-bar');
        const progressPercentage = document.getElementById('progress-percentage');
        const currentPhase = document.getElementById('current-phase');
        const currentSprint = document.getElementById('current-sprint');
        const tasksCompleted = document.getElementById('tasks-completed');
        const tasksTotal = document.getElementById('tasks-total');

        // Ensure percentage is between 0 and 100
        const percentage = Math.max(0, Math.min(100, progressData.percentage || 0));
        
        // Update progress bar
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
            
            // Update progress bar color based on phase
            progressBar.className = 'progress-bar';
            if (progressData.phase) {
                const phaseClass = this.getPhaseClass(progressData.phase);
                if (phaseClass) {
                    progressBar.classList.add(phaseClass);
                }
            }
        }

        // Update text elements
        if (progressPercentage) progressPercentage.textContent = `${Math.round(percentage)}%`;
        if (currentPhase) currentPhase.textContent = progressData.phase || 'Unknown';
        if (currentSprint) currentSprint.textContent = progressData.sprint || '-';
        if (tasksCompleted) tasksCompleted.textContent = progressData.tasksCompleted || 0;
        if (tasksTotal) tasksTotal.textContent = progressData.tasksTotal || 0;

        // Add activity for significant progress updates
        if (progressData.milestone) {
            this.addActivity(
                '🎯 Milestone Reached',
                progressData.milestone,
                'new'
            );
        }
    }

    getPhaseClass(phase) {
        const phaseMap = {
            'planning': 'planning',
            'research': 'planning',
            'analysis': 'planning',
            'requirements': 'planning',
            'development': 'development',
            'implementation': 'development',
            'coding': 'development',
            'testing': 'testing',
            'qa': 'testing',
            'validation': 'testing',
            'deployment': 'deployment',
            'launch': 'deployment',
            'complete': 'complete',
            'done': 'complete'
        };

        const phaseLower = phase.toLowerCase();
        for (const [key, value] of Object.entries(phaseMap)) {
            if (phaseLower.includes(key)) {
                return value;
            }
        }
        return 'development'; // default
    }

    updateBacklogMetrics(backlogData) {
        // Update internal state
        this.backlogMetrics = {
            ...this.backlogMetrics,
            ...backlogData
        };

        // Update UI elements
        const totalItems = document.getElementById('backlog-total-items');
        const totalPoints = document.getElementById('backlog-total-points');
        const readyPoints = document.getElementById('backlog-ready-points');
        const avgVelocity = document.getElementById('backlog-avg-velocity');
        const sprintsRemaining = document.getElementById('backlog-sprints-remaining');

        // Update values
        if (totalItems) totalItems.textContent = backlogData.totalItems || 0;
        if (totalPoints) totalPoints.textContent = backlogData.totalPoints || 0;
        if (readyPoints) readyPoints.textContent = backlogData.readyPoints || 0;
        
        // Update velocity with community defaults indicator
        if (avgVelocity) {
            const velocity = Math.round(backlogData.averageVelocity || 0);
            if (backlogData.isUsingCommunityDefaults && velocity > 0) {
                avgVelocity.innerHTML = `${velocity} <span class="community-indicator" title="Using community defaults (${Math.round(backlogData.velocityConfidence * 100)}% confidence)">📊</span>`;
            } else {
                avgVelocity.textContent = velocity;
            }
        }
        
        if (sprintsRemaining) {
            const sprints = backlogData.sprintsRemaining || 0;
            sprintsRemaining.textContent = sprints === 0 ? '-' : sprints;
        }

        // Add activity for significant backlog changes
        if (backlogData.newItems) {
            this.addActivity(
                '📋 Backlog Updated',
                `${backlogData.newItems} new items added`,
                'new'
            );
        }
    }

    requestProgressUpdate() {
        if (this.socket && this.socket.connected) {
            this.socket.emit('request-progress');
            this.socket.emit('request-backlog');
        }
    }
    
    async updateProjectConfig(projectName, projectDescription = '') {
        try {
            const response = await fetch('/api/project-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ projectName, projectDescription })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Project config updated:', result.config);
                this.addActivity('⚙️ Settings Updated', `Project name changed to: ${projectName}`, 'startup');
            } else {
                console.error('Failed to update project config');
                alert('Failed to update project name. Please try again.');
            }
        } catch (error) {
            console.error('Error updating project config:', error);
            alert('Error updating project name. Please try again.');
        }
    }

    requestMCPTree() {
        if (this.socket && this.socket.connected) {
            this.socket.emit('request-mcp-tree');
        }
    }

    requestAgents() {
        console.log('🔍 Requesting agents, socket connected:', this.socket && this.socket.connected);
        if (this.socket && this.socket.connected) {
            this.socket.emit('request-agents');
        } else {
            console.error('❌ Cannot request agents - socket not connected');
        }
    }

    requestSystemDocs() {
        if (this.socket && this.socket.connected) {
            this.socket.emit('request-system-docs');
        }
    }

    renderMCPTree(tree) {
        const mcpTreeElement = document.getElementById('mcp-tree');
        if (!mcpTreeElement) return;

        let html = '';
        Object.entries(tree).forEach(([name, data]) => {
            html += `
                <div class="tree-item file" data-document-path="${data.path}" data-document-type="mcp">
                    <span>🔧 ${data.name}</span>
                </div>
            `;
        });

        mcpTreeElement.innerHTML = html || '<div class="loading">No MCP guides found</div>';
    }

    renderAgents(agents) {
        const agentListElement = document.getElementById('agent-list');
        if (!agentListElement) return;

        console.log('🤖 Rendering agents:', agents.length);
        console.log('🔍 First agent data:', agents[0]);
        console.log('📐 Agent layout debug - checking CSS classes');
        
        let html = '';
        agents.forEach(agent => {
            const capabilities = agent.capabilities || [];
            const agentName = agent.name || 'Unnamed Agent';
            const agentEmoji = agent.emoji || '🤖';
            const agentDescription = agent.description || 'No description available';
            
            html += `
                <div class="agent-item" data-document-path="${agent.path}" data-document-type="agent">
                    <div class="agent-title-row">
                        <span class="agent-emoji">${agentEmoji}</span>
                        <span class="agent-name">${agentName}</span>
                    </div>
                    <p class="agent-description">${agentDescription}</p>
                    <div class="agent-capabilities">
                        ${capabilities.slice(0, 3).map(cap => 
                            `<span class="capability-tag">${cap}</span>`
                        ).join('')}
                        ${capabilities.length > 3 ? 
                            `<span class="capability-tag">+${capabilities.length - 3} more</span>` : ''
                        }
                    </div>
                </div>
            `;
        });

        agentListElement.innerHTML = html || '<div class="loading">No agents found</div>';
    }

    renderSystemDocs(docs) {
        const systemDocsElement = document.getElementById('system-docs');
        if (!systemDocsElement) return;

        console.log('📚 Rendering system docs:', docs.length);
        
        let html = '';
        docs.forEach(doc => {
            html += `
                <div class="system-doc-item" data-document-path="${doc.path}" data-document-type="system">
                    <span class="doc-icon">📄</span>
                    <span class="doc-name">${doc.name}</span>
                </div>
            `;
        });

        systemDocsElement.innerHTML = html || '<div class="loading">No system docs found</div>';
    }

    loadDocument(path, type = 'project') {
        console.log(`📖 Loading ${type} document:`, path);
        this.currentDocument = path;
        
        let apiPath = '/api/document';
        if (type === 'mcp') {
            apiPath = '/api/mcp-document';
        } else if (type === 'agent') {
            apiPath = '/api/agent-document';
        } else if (type === 'system') {
            apiPath = '/api/system-document';
        }
        
        fetch(`${apiPath}?path=${encodeURIComponent(path)}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    this.displayError(data.error);
                } else {
                    this.displayDocumentContent(data);
                }
            })
            .catch(error => {
                console.error('Error loading document:', error);
                this.displayError('Failed to load document');
            });
    }
    
    loadGuideDocument(path) {
        console.log(`📘 Loading guide document:`, path);
        this.currentDocument = path;
        
        fetch(`/api/guide-document?path=${encodeURIComponent(path)}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    this.displayError(data.error);
                } else {
                    this.displayDocumentContent(data);
                }
            })
            .catch(error => {
                console.error('Error loading guide document:', error);
                this.displayError('Failed to load guide document');
            });
    }
    
    setupMobileEvents() {
        // Add close button functionality for mobile sidebar
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            // Remove any existing close buttons first
            const existingBtns = sidebar.querySelectorAll('.mobile-close-btn');
            existingBtns.forEach(btn => btn.remove());
            
            // Create close button
            const closeBtn = document.createElement('button');
            closeBtn.className = 'mobile-close-btn';
            closeBtn.innerHTML = '✕';
            closeBtn.style.cssText = `
                display: none;
                position: absolute;
                right: 1rem;
                top: 1rem;
                font-size: 1.5rem;
                cursor: pointer;
                z-index: 10;
                background: none;
                border: none;
                color: #64b5f6;
                padding: 0.5rem;
            `;
            sidebar.prepend(closeBtn);
            
            // Show close button on mobile
            if (window.innerWidth <= 768) {
                closeBtn.style.display = 'block';
            }
            
            closeBtn.addEventListener('click', () => window.closeMobileMenu());
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            const closeBtn = document.querySelector('.mobile-close-btn');
            if (closeBtn) {
                closeBtn.style.display = window.innerWidth <= 768 ? 'block' : 'none';
            }
            
            // Close menu if resizing to desktop
            if (window.innerWidth > 768) {
                window.closeMobileMenu();
            }
        });
    }
}

// Set up mobile menu functions immediately
window.toggleMobileMenu = function() {
    console.log('toggleMobileMenu called');
    const sidebar = document.querySelector('.sidebar-container');
    const overlay = document.getElementById('mobile-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
        console.log('Mobile menu toggled, open:', sidebar.classList.contains('mobile-open'));
    } else {
        console.error('Sidebar or overlay not found:', { sidebar, overlay });
    }
};

window.closeMobileMenu = function() {
    console.log('closeMobileMenu called');
    const sidebar = document.querySelector('.sidebar-container');
    const overlay = document.getElementById('mobile-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
        console.log('Mobile menu closed');
    }
};

// Initialize dashboard when DOM is loaded
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new ProjectDashboard();
    console.log('🚀 AI Agent Project Dashboard initialized');
    
    // Initialize project state display
    initializeProjectState();
    
    // Set up mobile menu event listeners
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const overlay = document.getElementById('mobile-overlay');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', window.toggleMobileMenu);
    }
    
    if (overlay) {
        overlay.addEventListener('click', window.closeMobileMenu);
    }
});

// Global functions for HTML onclick handlers
function refreshDocuments() {
    if (dashboard) {
        // Refresh only the current tab's data
        switch(dashboard.activeTab) {
            case 'documents':
                dashboard.requestDocumentTree();
                break;
            case 'mcp':
                dashboard.requestMCPTree();
                break;
            case 'agents':
                dashboard.requestAgents();
                break;
            case 'system':
                dashboard.requestSystemDocs();
                break;
            case 'guide':
                // Guide tab has static content
                console.log('📘 Guide tab content is static');
                break;
        }
    }
}

function toggleAutoScroll() {
    if (dashboard) {
        dashboard.autoScroll = !dashboard.autoScroll;
        dashboard.addActivity(
            '📜 Auto-scroll',
            dashboard.autoScroll ? 'Enabled' : 'Disabled',
            'startup'
        );
    }
}

function clearActivity() {
    const activityFeed = document.getElementById('activity-feed');
    if (activityFeed) {
        activityFeed.innerHTML = `
            <div class="activity-item startup">
                <div class="activity-time">Just now</div>
                <div class="activity-content">
                    <strong>🧹 Activity Cleared</strong>
                    <p>Activity feed has been cleared</p>
                </div>
            </div>
        `;
    }
}

function switchTab(tabName, event) {
    console.log(`🔄 Switching to tab: ${tabName}`);
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // If event is provided, use it, otherwise find the button by tab name
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // Find and activate the correct button
        const buttons = document.querySelectorAll('.tab-button');
        buttons.forEach(btn => {
            if (btn.textContent.toLowerCase().includes(tabName.toLowerCase())) {
                btn.classList.add('active');
            }
        });
    }

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const tabElement = document.getElementById(`${tabName}-tab`);
    if (tabElement) {
        tabElement.classList.add('active');
    } else {
        console.error(`❌ Tab element not found: ${tabName}-tab`);
    }

    // Store active tab and request data if needed
    if (dashboard) {
        dashboard.activeTab = tabName;
        
        // Request data for the active tab if not already loaded
        switch(tabName) {
            case 'mcp':
                if (Object.keys(dashboard.mcpTree).length === 0) {
                    console.log('📡 Requesting MCP data...');
                    dashboard.requestMCPTree();
                }
                break;
            case 'agents':
                console.log('📡 Requesting agents data...');
                dashboard.requestAgents();
                break;
            case 'system':
                if (dashboard.systemDocs.length === 0) {
                    console.log('📡 Requesting system docs data...');
                    dashboard.requestSystemDocs();
                }
                break;
            case 'guide':
                // Guide documents are static, no need to load
                break;
            case 'documents':
                // Documents are loaded by default
                break;
            case 'hooks':
                // Initialize hook actions
                initializeHookActions();
                break;
        }
    }
}


// Initialize hook actions
function initializeHookActions() {
    const hookActions = document.querySelectorAll('.hook-action');
    hookActions.forEach(button => {
        button.addEventListener('click', (e) => {
            const action = button.getAttribute('data-action');
            handleHookAction(action);
        });
    });
}

// Handle hook actions
function handleHookAction(action) {
    switch(action) {
        case 'configure':
            window.open('/hooks.html', '_blank');
            break;
        case 'performance':
            window.open('/hooks.html#performance', '_blank');
            break;
        case 'logs':
            window.open('/hooks.html#logs', '_blank');
            break;
        case 'test':
            alert('Hook testing functionality coming soon!');
            break;
    }
}

// Close mobile menu when clicking on a document or tab
document.addEventListener('click', (event) => {
    if (window.innerWidth <= 768) {
        if (event.target.closest('[data-document-path]') || 
            event.target.closest('.tab-button') ||
            event.target.closest('[data-guide-path]')) {
            window.closeMobileMenu();
        }
    }
});
// Project State Functions
async function initializeProjectState() {
    // Set up collapse/expand functionality
    const toggleBtn = document.getElementById('state-widget-toggle');
    const widget = document.getElementById('project-state-widget');
    
    if (toggleBtn && widget) {
        toggleBtn.addEventListener('click', () => {
            widget.classList.toggle('collapsed');
        });
    }
    
    // Fetch and display project state
    await fetchAndDisplayProjectState();
    
    // Refresh project state every 30 seconds
    setInterval(fetchAndDisplayProjectState, 30000);
}

async function fetchAndDisplayProjectState() {
    try {
        const response = await fetch('/api/project-state');
        if (!response.ok) throw new Error('Failed to fetch project state');
        
        const data = await response.json();
        
        // Update workflow information
        const workflowResponse = await fetch('/api/project-state/workflow');
        const workflows = await workflowResponse.json();
        
        updateWorkflowDisplay(workflows);
        updateProjectStateDisplay(data);
        
    } catch (error) {
        console.error('Error fetching project state:', error);
    }
}

function updateWorkflowDisplay(workflows) {
    const workflowEl = document.getElementById('current-workflow');
    const phaseEl = document.getElementById('workflow-phase');
    
    if (workflows.main) {
        workflowEl.textContent = formatWorkflowType(workflows.main.type);
        phaseEl.textContent = formatPhase(workflows.main.phase);
    } else if (workflows.learning) {
        workflowEl.textContent = 'Learning Workflow';
        phaseEl.textContent = formatPhase(workflows.learning.phase);
    } else {
        workflowEl.textContent = 'No active workflow';
        phaseEl.textContent = '--';
    }
}

function updateProjectStateDisplay(data) {
    // Update last updated time
    const lastUpdatedEl = document.getElementById('state-last-updated');
    if (data.lastUpdated) {
        const date = new Date(data.lastUpdated);
        lastUpdatedEl.textContent = formatRelativeTime(date);
    } else {
        lastUpdatedEl.textContent = 'Never';
    }
    
    // Update active tasks count
    if (data.currentState && data.currentState.active_tasks) {
        const tasksEl = document.getElementById('active-tasks-count');
        const count = data.currentState.active_tasks.length;
        tasksEl.textContent = `${count} ${count === 1 ? 'task' : 'tasks'}`;
    }
    
    // Update recent decisions
    if (data.currentState && data.currentState.recent_decisions) {
        updateDecisionsList(data.currentState.recent_decisions);
    }
}

function updateDecisionsList(decisions) {
    const listEl = document.getElementById('recent-decisions');
    
    if (!decisions || decisions.length === 0) {
        listEl.innerHTML = '<li class="empty-state">No decisions recorded</li>';
        return;
    }
    
    listEl.innerHTML = decisions.slice(0, 5).map(decision => {
        const date = new Date(decision.timestamp);
        return `
            <li>
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <strong>${decision.decision}</strong>
                    <small style="color: var(--text-secondary); flex-shrink: 0; margin-left: 1rem;">
                        ${formatRelativeTime(date)}
                    </small>
                </div>
                ${decision.rationale ? `<div style="margin-top: 0.25rem; color: var(--text-secondary); font-size: 0.875rem;">${decision.rationale}</div>` : ''}
            </li>
        `;
    }).join('');
}

function formatWorkflowType(type) {
    if (!type) return 'None';
    
    const typeMap = {
        'new-project': 'New Project Workflow',
        'existing-project': 'Existing Project Workflow',
        'learning': 'Learning Workflow'
    };
    
    return typeMap[type] || type;
}

function formatPhase(phase) {
    if (!phase) return '--';
    
    // Convert snake_case or kebab-case to Title Case
    return phase.split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function formatRelativeTime(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}
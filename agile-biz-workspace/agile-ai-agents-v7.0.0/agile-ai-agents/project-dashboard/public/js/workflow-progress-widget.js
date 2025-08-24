/**
 * Workflow Progress Widget for AgileAiAgents Dashboard
 * 
 * Displays real-time workflow progress for new and existing project workflows
 */

class WorkflowProgressWidget {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.updateInterval = null;
        this.currentWorkflow = null;
    }

    init() {
        this.createWidgetStructure();
        this.startUpdates();
    }

    createWidgetStructure() {
        this.container.innerHTML = `
            <div class="workflow-widget" id="workflow-widget">
                <div class="workflow-header">
                    <h3>
                        <span class="icon">🚀</span>
                        <span class="title">Workflow Progress</span>
                    </h3>
                    <button class="workflow-collapse-btn" id="workflow-collapse-btn" title="Toggle workflow progress">
                        <span class="collapse-icon">▼</span>
                    </button>
                    <div class="workflow-controls">
                        <button class="btn btn-sm" onclick="workflowWidget.saveState()">
                            💾 Save State
                        </button>
                        <button class="btn btn-sm" onclick="workflowWidget.showDetails()">
                            📊 Details
                        </button>
                    </div>
                </div>
                <div class="workflow-content">
                    <div id="workflow-body" class="workflow-body">
                        <div class="no-workflow">
                            <p>No active workflow</p>
                            <small>Use <code>/start-new-project-workflow</code> or <code>/start-existing-project-workflow</code> to begin</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listener for collapse button
        setTimeout(() => {
            const collapseBtn = document.getElementById('workflow-collapse-btn');
            if (collapseBtn) {
                collapseBtn.addEventListener('click', () => this.toggleCollapse());
            }
            
            // Load saved collapsed state
            const isCollapsed = localStorage.getItem('workflow-collapsed') === 'true';
            if (isCollapsed) {
                document.getElementById('workflow-widget').classList.add('collapsed');
            }
        }, 100);
    }

    startUpdates() {
        // Initial update
        this.updateWorkflowStatus();
        
        // Set up periodic updates
        this.updateInterval = setInterval(() => {
            this.updateWorkflowStatus();
        }, 5000); // Update every 5 seconds
    }

    async updateWorkflowStatus() {
        try {
            const response = await fetch('/api/workflow/status');
            const data = await response.json();
            
            if (data.active) {
                this.currentWorkflow = data;
                this.renderActiveWorkflow(data);
            } else {
                this.renderNoWorkflow();
            }
        } catch (error) {
            console.error('Failed to fetch workflow status:', error);
        }
    }

    renderActiveWorkflow(workflow) {
        const content = document.getElementById('workflow-body');
        
        const progressBar = this.createProgressBar(workflow.phase_progress);
        const phaseInfo = this.createPhaseInfo(workflow);
        const agentList = this.createAgentList(workflow.active_agents);
        const documentProgress = this.createDocumentProgress(workflow);
        const timeline = this.createPhaseTimeline(workflow);
        
        content.innerHTML = `
            <div class="workflow-active">
                <div class="workflow-title">
                    ${workflow.workflow_type === 'new-project' ? '🆕 New Project' : '📂 Existing Project'} Workflow
                </div>
                
                ${phaseInfo}
                ${progressBar}
                
                <div class="workflow-stats">
                    <div class="stat">
                        <span class="label">Overall:</span>
                        <span class="value">${workflow.overall_progress}%</span>
                    </div>
                    <div class="stat">
                        <span class="label">Phase:</span>
                        <span class="value">${workflow.phases_completed}/${workflow.phases_total}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Time:</span>
                        <span class="value">${this.formatDuration(workflow.started_at)}</span>
                    </div>
                </div>
                
                ${workflow.awaiting_approval ? this.createApprovalAlert(workflow.awaiting_approval) : ''}
                ${agentList}
                ${documentProgress}
                
                <div class="workflow-timeline-container">
                    <h4>Phase Timeline</h4>
                    ${timeline}
                </div>
            </div>
        `;
    }

    renderNoWorkflow() {
        const content = document.getElementById('workflow-body');
        content.innerHTML = `
            <div class="no-workflow">
                <p>No active workflow</p>
                <small>Use <code>/start-new-project-workflow</code> or <code>/start-existing-project-workflow</code> to begin</small>
            </div>
        `;
    }

    createProgressBar(percentage) {
        const filled = Math.round((percentage / 100) * 20);
        const empty = 20 - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        
        return `
            <div class="progress-container">
                <div class="progress-bar">
                    <span class="progress-fill" style="width: ${percentage}%"></span>
                </div>
                <div class="progress-text">${bar} ${percentage}%</div>
            </div>
        `;
    }

    createPhaseInfo(workflow) {
        return `
            <div class="phase-info">
                <h4>${workflow.current_phase}</h4>
                <small>Estimated time remaining: ${workflow.estimated_completion || 'Calculating...'}</small>
            </div>
        `;
    }

    createAgentList(agents) {
        if (!agents || agents.length === 0) return '';
        
        const agentItems = agents.map(agent => `
            <div class="agent-item">
                <span class="agent-icon">${agent.icon || '🤖'}</span>
                <span class="agent-name">${agent.name}</span>
                <span class="agent-status">${agent.status}</span>
            </div>
        `).join('');
        
        return `
            <div class="active-agents">
                <h4>Active Agents (${agents.length})</h4>
                <div class="agent-list">
                    ${agentItems}
                </div>
            </div>
        `;
    }

    createDocumentProgress(workflow) {
        if (!workflow.documents_total || workflow.documents_total === 0) return '';
        
        const percentage = Math.round((workflow.documents_created / workflow.documents_total) * 100);
        
        return `
            <div class="document-progress">
                <h4>Documents Progress</h4>
                <div class="doc-stats">
                    <span>${workflow.documents_created} of ${workflow.documents_total} created</span>
                    <span class="percentage">${percentage}%</span>
                </div>
                <div class="mini-progress">
                    <div class="mini-progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }

    createPhaseTimeline(workflow) {
        // This would create a visual timeline of phases
        // For now, returning a simple list
        return `
            <div class="phase-timeline">
                <div class="timeline-item completed">
                    <span class="timeline-icon">✅</span>
                    <span>Discovery</span>
                </div>
                <div class="timeline-item active">
                    <span class="timeline-icon">🔄</span>
                    <span>Research</span>
                </div>
                <div class="timeline-item pending">
                    <span class="timeline-icon">○</span>
                    <span>Analysis</span>
                </div>
                <!-- More phases would be dynamically generated -->
            </div>
        `;
    }

    createApprovalAlert(gateName) {
        return `
            <div class="approval-alert">
                <div class="alert-icon">🚦</div>
                <div class="alert-content">
                    <strong>Approval Required</strong>
                    <p>Workflow paused at: ${this.formatGateName(gateName)}</p>
                    <button class="btn btn-primary btn-sm" onclick="workflowWidget.openApprovalInterface('${gateName}')">
                        Review & Approve
                    </button>
                </div>
            </div>
        `;
    }

    formatGateName(gateName) {
        const names = {
            'post-research': 'Post-Research Review',
            'post-requirements': 'Post-Requirements Review',
            'pre-implementation': 'Pre-Implementation Review',
            'post-analysis': 'Post-Analysis Review'
        };
        
        return names[gateName] || gateName;
    }

    formatDuration(startTime) {
        const start = new Date(startTime);
        const now = new Date();
        const diff = now - start;
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    async saveState() {
        try {
            const response = await fetch('/api/workflow/save-state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await response.json();
            if (result.success) {
                this.showNotification('State saved successfully', 'success');
            } else {
                this.showNotification('Failed to save state', 'error');
            }
        } catch (error) {
            console.error('Failed to save state:', error);
            this.showNotification('Error saving state', 'error');
        }
    }

    showDetails() {
        // Open detailed workflow status in a modal
        window.open('/workflow-details', 'workflow-details', 'width=800,height=600');
    }

    openApprovalInterface(gateName) {
        // This would open the approval interface
        // For now, just log
        console.log('Opening approval interface for:', gateName);
    }

    showNotification(message, type) {
        // Simple notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    toggleCollapse() {
        const widget = document.getElementById('workflow-widget');
        if (widget) {
            widget.classList.toggle('collapsed');
            const isCollapsed = widget.classList.contains('collapsed');
            localStorage.setItem('workflow-collapsed', isCollapsed);
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// Initialize widget when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('workflow-progress-widget')) {
        window.workflowWidget = new WorkflowProgressWidget('workflow-progress-widget');
        window.workflowWidget.init();
    }
});
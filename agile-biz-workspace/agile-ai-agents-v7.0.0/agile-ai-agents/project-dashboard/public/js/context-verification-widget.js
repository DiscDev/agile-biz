/**
 * Context Verification Widget for AgileAiAgents Dashboard
 * 
 * Displays real-time context verification status and drift monitoring
 */

class ContextVerificationWidget {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.driftThresholds = {
            none: { max: 20, color: '#4CAF50', icon: '✅' },
            minor: { max: 40, color: '#FFC107', icon: '⚠️' },
            moderate: { max: 60, color: '#FF9800', icon: '🔍' },
            major: { max: 80, color: '#F44336', icon: '❌' },
            critical: { max: 100, color: '#B71C1C', icon: '🚨' }
        };
        this.lastUpdate = null;
        this.createWidgetStructure();
        this.startPolling();
    }

    createWidgetStructure() {
        this.container.innerHTML = `
            <div class="context-verification-widget" id="context-verification-widget">
                <div class="widget-header">
                    <h3>🎯 Context Verification</h3>
                    <div class="widget-controls">
                        <button class="btn btn-sm" onclick="contextWidget.checkDrift()">
                            🔍 Check Now
                        </button>
                        <button class="btn btn-sm" onclick="contextWidget.toggleDetails()">
                            <span id="details-toggle-icon">▼</span>
                        </button>
                    </div>
                </div>
                
                <div class="widget-body">
                    <div class="drift-overview">
                        <div class="drift-meter">
                            <div class="drift-level" id="drift-level">
                                <span class="drift-icon">✅</span>
                                <span class="drift-percentage">0%</span>
                            </div>
                            <div class="drift-bar">
                                <div class="drift-fill" id="drift-fill" style="width: 0%"></div>
                            </div>
                            <div class="drift-status" id="drift-status">No drift detected</div>
                        </div>
                        
                        <div class="monitoring-status">
                            <span class="status-label">Monitoring:</span>
                            <span class="status-value" id="monitoring-status">Inactive</span>
                        </div>
                    </div>
                    
                    <div class="widget-details" id="widget-details" style="display: none;">
                        <div class="recent-violations" id="recent-violations">
                            <h4>Recent Issues</h4>
                            <div class="violations-list" id="violations-list">
                                <p class="no-data">No violations detected</p>
                            </div>
                        </div>
                        
                        <div class="drift-breakdown" id="drift-breakdown">
                            <h4>Drift by Area</h4>
                            <div class="breakdown-list" id="breakdown-list">
                                <p class="no-data">No data available</p>
                            </div>
                        </div>
                        
                        <div class="recommendations" id="recommendations">
                            <h4>Recommendations</h4>
                            <div class="recommendations-list" id="recommendations-list">
                                <p class="no-data">No recommendations</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="widget-footer">
                    <small class="last-update" id="last-update">Never checked</small>
                    <a href="#" onclick="contextWidget.openVerificationDashboard()" class="dashboard-link">
                        Full Dashboard →
                    </a>
                </div>
            </div>
        `;
    }

    async init() {
        await this.loadContextStatus();
    }

    async loadContextStatus() {
        try {
            // Check if project truth exists
            const truthResponse = await fetch('/api/context-verification/truth');
            const truthData = await truthResponse.json();
            
            if (!truthData.exists) {
                this.showSetupPrompt();
                return;
            }

            // Get drift status
            const driftResponse = await fetch('/api/context-verification/drift-status');
            const driftData = await driftResponse.json();
            
            this.updateDriftDisplay(driftData);
            
            // Get recent violations if any
            if (driftData.drift > 0) {
                const violationsResponse = await fetch('/api/context-verification/violations');
                const violations = await violationsResponse.json();
                this.updateViolations(violations);
            }
        } catch (error) {
            console.error('Failed to load context status:', error);
            this.showError('Failed to load context verification status');
        }
    }

    updateDriftDisplay(data) {
        const driftLevel = data.drift || 0;
        const severity = this.getSeverity(driftLevel);
        const config = this.driftThresholds[severity];
        
        // Update drift meter
        document.getElementById('drift-level').innerHTML = `
            <span class="drift-icon">${config.icon}</span>
            <span class="drift-percentage">${driftLevel}%</span>
        `;
        
        const driftFill = document.getElementById('drift-fill');
        driftFill.style.width = `${driftLevel}%`;
        driftFill.style.backgroundColor = config.color;
        
        // Update status text
        const statusTexts = {
            none: 'Excellent alignment',
            minor: 'Minor drift detected',
            moderate: 'Moderate drift - review needed',
            major: 'Major drift - intervention required',
            critical: 'Critical drift - immediate action needed'
        };
        document.getElementById('drift-status').textContent = statusTexts[severity];
        
        // Update monitoring status
        const monitoringStatus = document.getElementById('monitoring-status');
        if (data.monitoring) {
            monitoringStatus.textContent = 'Active';
            monitoringStatus.className = 'status-value monitoring-active';
        } else {
            monitoringStatus.textContent = 'Inactive';
            monitoringStatus.className = 'status-value monitoring-inactive';
        }
        
        // Update last check time
        if (data.lastCheck) {
            const lastCheck = new Date(data.lastCheck);
            document.getElementById('last-update').textContent = 
                `Last check: ${this.formatTime(lastCheck)}`;
        }
        
        // Update breakdown if available
        if (data.breakdown) {
            this.updateBreakdown(data.breakdown);
        }
        
        // Update recommendations
        if (data.recommendations && data.recommendations.length > 0) {
            this.updateRecommendations(data.recommendations);
        }
    }

    updateViolations(violations) {
        const list = document.getElementById('violations-list');
        
        if (!violations || violations.length === 0) {
            list.innerHTML = '<p class="no-data">No violations detected</p>';
            return;
        }
        
        list.innerHTML = violations.slice(0, 5).map(violation => `
            <div class="violation-item ${violation.status}">
                <div class="violation-header">
                    <span class="violation-icon">${this.getViolationIcon(violation.status)}</span>
                    <span class="violation-title">${this.escapeHtml(violation.title)}</span>
                </div>
                <div class="violation-details">
                    <span class="confidence">Confidence: ${violation.confidence}%</span>
                    <span class="violation-message">${this.escapeHtml(violation.message)}</span>
                </div>
            </div>
        `).join('');
    }

    updateBreakdown(breakdown) {
        const list = document.getElementById('breakdown-list');
        
        if (!breakdown || Object.keys(breakdown).length === 0) {
            list.innerHTML = '<p class="no-data">No data available</p>';
            return;
        }
        
        list.innerHTML = Object.entries(breakdown).map(([area, drift]) => `
            <div class="breakdown-item">
                <span class="area-name">${this.formatAreaName(area)}</span>
                <div class="area-drift">
                    <div class="area-bar">
                        <div class="area-fill" style="width: ${drift}%; background-color: ${this.getDriftColor(drift)}"></div>
                    </div>
                    <span class="area-percentage">${drift}%</span>
                </div>
            </div>
        `).join('');
    }

    updateRecommendations(recommendations) {
        const list = document.getElementById('recommendations-list');
        
        if (!recommendations || recommendations.length === 0) {
            list.innerHTML = '<p class="no-data">No recommendations</p>';
            return;
        }
        
        list.innerHTML = recommendations.slice(0, 3).map(rec => `
            <div class="recommendation-item">
                <span class="rec-icon">${rec.icon || '💡'}</span>
                <span class="rec-text">${this.escapeHtml(rec.text || rec)}</span>
            </div>
        `).join('');
    }

    showSetupPrompt() {
        const widget = document.getElementById('context-verification-widget');
        widget.innerHTML = `
            <div class="setup-prompt">
                <h3>🎯 Context Verification</h3>
                <div class="setup-message">
                    <p>No project truth document found.</p>
                    <p>Create one to enable context drift monitoring.</p>
                    <button class="btn btn-primary" onclick="contextWidget.startSetup()">
                        Create Project Truth
                    </button>
                </div>
            </div>
        `;
    }

    startSetup() {
        // In a real implementation, this would trigger the setup workflow
        alert('Run: /verify-context --create-truth');
    }

    async checkDrift() {
        try {
            const response = await fetch('/api/context-verification/check-drift', {
                method: 'POST'
            });
            
            if (!response.ok) {
                throw new Error('Failed to trigger drift check');
            }
            
            // Show loading state
            const status = document.getElementById('drift-status');
            status.textContent = 'Checking for drift...';
            
            // Reload after a delay
            setTimeout(() => this.loadContextStatus(), 2000);
        } catch (error) {
            console.error('Failed to check drift:', error);
            this.showError('Failed to trigger drift check');
        }
    }

    toggleDetails() {
        const details = document.getElementById('widget-details');
        const icon = document.getElementById('details-toggle-icon');
        
        if (details.style.display === 'none') {
            details.style.display = 'block';
            icon.textContent = '▲';
        } else {
            details.style.display = 'none';
            icon.textContent = '▼';
        }
    }

    openVerificationDashboard() {
        // In a real implementation, this would open a full dashboard
        alert('Full context verification dashboard coming soon!');
    }

    getSeverity(drift) {
        if (drift <= 20) return 'none';
        if (drift <= 40) return 'minor';
        if (drift <= 60) return 'moderate';
        if (drift <= 80) return 'major';
        return 'critical';
    }

    getDriftColor(drift) {
        const severity = this.getSeverity(drift);
        return this.driftThresholds[severity].color;
    }

    getViolationIcon(status) {
        const icons = {
            blocked: '❌',
            review: '🔍',
            warning: '⚠️',
            allowed: '✅'
        };
        return icons[status] || '❓';
    }

    formatAreaName(area) {
        return area.replace(/-/g, ' ')
                   .split(' ')
                   .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                   .join(' ');
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        const status = document.getElementById('drift-status');
        if (status) {
            status.textContent = message;
            status.style.color = '#F44336';
        }
    }

    startPolling() {
        // Poll for updates every 30 seconds when monitoring is active
        setInterval(() => {
            const monitoringStatus = document.getElementById('monitoring-status');
            if (monitoringStatus && monitoringStatus.textContent === 'Active') {
                this.loadContextStatus();
            }
        }, 30000);
    }
}

// Initialize widget when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('context-verification-container')) {
        window.contextWidget = new ContextVerificationWidget('context-verification-container');
        window.contextWidget.init();
    }
});
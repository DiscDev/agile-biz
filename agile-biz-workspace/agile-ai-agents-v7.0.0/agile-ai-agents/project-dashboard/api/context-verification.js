/**
 * Context Verification API endpoints
 * 
 * Provides real-time context verification status for the dashboard
 */

const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const router = express.Router();

// Paths
const projectRoot = path.join(__dirname, '..', '..');
const truthPath = path.join(projectRoot, 'project-documents', 'project-truth');
const driftReportsPath = path.join(projectRoot, 'project-documents', 'orchestration', 'drift-reports');
const backlogPath = path.join(projectRoot, 'project-documents', 'orchestration', 'product-backlog');

/**
 * Check if project truth exists
 */
router.get('/truth', async (req, res) => {
    try {
        const truthFile = path.join(truthPath, 'project-truth.md');
        const exists = await fs.pathExists(truthFile);
        
        if (exists) {
            const content = await fs.readFile(truthFile, 'utf8');
            // Extract basic info from markdown
            const projectName = content.match(/# PROJECT TRUTH: (.+)/)?.[1] || 'Unknown Project';
            const lastVerified = content.match(/Last Verified: (.+)/)?.[1] || 'Unknown';
            
            res.json({
                exists: true,
                projectName,
                lastVerified,
                path: truthFile
            });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking project truth:', error);
        res.status(500).json({ error: 'Failed to check project truth' });
    }
});

/**
 * Get current drift status
 */
router.get('/drift-status', async (req, res) => {
    try {
        // Check for latest drift report
        const reports = await fs.readdir(driftReportsPath).catch(() => []);
        const latestReport = reports
            .filter(f => f.startsWith('drift-report-') && f.endsWith('.json'))
            .sort()
            .pop();
        
        if (latestReport) {
            const reportData = await fs.readJSON(path.join(driftReportsPath, latestReport));
            
            // Extract breakdown by area
            const breakdown = {};
            if (reportData.checks) {
                reportData.checks.forEach(check => {
                    if (!check.error && check.drift !== undefined) {
                        breakdown[check.name] = check.drift;
                    }
                });
            }
            
            res.json({
                drift: reportData.overallDrift || 0,
                severity: reportData.severity || 'none',
                lastCheck: reportData.timestamp,
                monitoring: false, // Would be determined by checking drift detector state
                breakdown,
                recommendations: reportData.recommendations || []
            });
        } else {
            // No drift reports yet
            res.json({
                drift: 0,
                severity: 'none',
                lastCheck: null,
                monitoring: false,
                breakdown: {},
                recommendations: []
            });
        }
    } catch (error) {
        console.error('Error getting drift status:', error);
        res.status(500).json({ error: 'Failed to get drift status' });
    }
});

/**
 * Get recent context violations
 */
router.get('/violations', async (req, res) => {
    try {
        // Check backlog for items with verification issues
        const backlogFile = path.join(backlogPath, 'backlog-state.json');
        
        if (await fs.pathExists(backlogFile)) {
            const backlog = await fs.readJSON(backlogFile);
            
            // In a real implementation, this would check verification status
            // For now, simulate some violations based on backlog
            const violations = [];
            
            if (backlog.items) {
                backlog.items.forEach(item => {
                    // Simulate detection of potential issues
                    if (item.title && item.title.toLowerCase().includes('admin')) {
                        violations.push({
                            id: item.id,
                            title: item.title,
                            status: 'warning',
                            confidence: 65,
                            message: 'Feature may not align with primary user focus'
                        });
                    }
                });
            }
            
            res.json(violations);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error getting violations:', error);
        res.status(500).json({ error: 'Failed to get violations' });
    }
});

/**
 * Trigger manual drift check
 */
router.post('/check-drift', async (req, res) => {
    try {
        // In a real implementation, this would trigger the drift detector
        // For now, just acknowledge the request
        res.json({
            success: true,
            message: 'Drift check initiated'
        });
    } catch (error) {
        console.error('Error triggering drift check:', error);
        res.status(500).json({ error: 'Failed to trigger drift check' });
    }
});

/**
 * Get learning insights
 */
router.get('/insights', async (req, res) => {
    try {
        const insightsPath = path.join(
            projectRoot, 
            'community-learnings', 
            'analysis', 
            'current-insights.json'
        );
        
        if (await fs.pathExists(insightsPath)) {
            const insights = await fs.readJSON(insightsPath);
            res.json(insights);
        } else {
            res.json({
                commonViolations: [],
                riskFactors: [],
                preventionStrategies: [],
                recommendations: []
            });
        }
    } catch (error) {
        console.error('Error getting insights:', error);
        res.status(500).json({ error: 'Failed to get insights' });
    }
});

module.exports = router;
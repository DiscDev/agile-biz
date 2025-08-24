/**
 * Context Verification Engine
 * 
 * Core engine for verifying project context alignment and detecting drift
 */

const fs = require('fs-extra');
const path = require('path');
const { calculateConfidenceScore } = require('./confidence-scorer');
const violationLearningSystem = require('./violation-learning-system');

class ContextVerificationEngine {
    constructor() {
        this.projectRoot = path.join(__dirname, '..', '..');
        this.truthPath = path.join(this.projectRoot, 'project-documents', 'project-truth');
        this.backlogPath = path.join(this.projectRoot, 'project-documents', 'orchestration', 'product-backlog');
        this.currentTruth = null;
        this.domainGlossary = new Map();
        this.notThisList = [];
    }

    /**
     * Initialize the verification engine
     */
    async initialize() {
        try {
            // Load project truth if it exists
            await this.loadProjectTruth();
            
            // Load domain glossary
            await this.loadDomainGlossary();
            
            // Load "not this" list
            await this.loadNotThisList();
            
            return { success: true, message: 'Verification engine initialized' };
        } catch (error) {
            return { 
                success: false, 
                message: 'Failed to initialize verification engine', 
                error: error.message 
            };
        }
    }

    /**
     * Load the project truth document
     */
    async loadProjectTruth() {
        const truthFile = path.join(this.truthPath, 'project-truth.md');
        
        if (await fs.pathExists(truthFile)) {
            const content = await fs.readFile(truthFile, 'utf8');
            this.currentTruth = this.parseProjectTruth(content);
        } else {
            this.currentTruth = null;
        }
    }

    /**
     * Parse project truth markdown into structured data
     */
    parseProjectTruth(content) {
        const truth = {
            version: '1.0',
            lastVerified: new Date().toISOString(),
            whatWereBuilding: '',
            industry: '',
            targetUsers: {
                primary: '',
                secondary: ''
            },
            notThis: [],
            competitors: [],
            domainTerms: []
        };

        // Parse sections using regex
        const sections = content.split(/^##\s+/m);
        
        sections.forEach(section => {
            if (section.includes('WHAT WE\'RE BUILDING')) {
                truth.whatWereBuilding = this.extractFirstLine(section);
            } else if (section.includes('INDUSTRY/DOMAIN')) {
                truth.industry = this.extractFirstLine(section);
            } else if (section.includes('TARGET USERS')) {
                const lines = section.split('\n').filter(l => l.trim());
                lines.forEach(line => {
                    if (line.includes('Primary:')) {
                        truth.targetUsers.primary = line.replace(/.*Primary:\s*/, '').trim();
                    } else if (line.includes('Secondary:')) {
                        truth.targetUsers.secondary = line.replace(/.*Secondary:\s*/, '').trim();
                    }
                });
            } else if (section.includes('NOT THIS')) {
                truth.notThis = this.extractBulletPoints(section, '❌');
            } else if (section.includes('COMPETITORS')) {
                truth.competitors = this.extractBulletPoints(section, '-');
            } else if (section.includes('DOMAIN TERMS')) {
                truth.domainTerms = this.extractDefinitions(section);
            }
        });

        return truth;
    }

    /**
     * Verify a single item against project truth
     */
    async verifyItem(item, type = 'general') {
        if (!this.currentTruth) {
            return {
                status: 'warning',
                confidence: 0,
                message: 'No project truth document found',
                recommendation: 'Create project truth document first'
            };
        }

        // Calculate confidence score
        const confidence = await calculateConfidenceScore(item, this.currentTruth, type);
        
        // Determine status based on confidence
        let status = 'allowed';
        let message = '';
        let recommendation = '';

        if (confidence.score >= 95) {
            status = 'blocked';
            message = `Context violation detected: ${confidence.reason}`;
            recommendation = 'This item does not align with project goals';
            
            // Learn from this violation
            await violationLearningSystem.learnFromViolation({
                item,
                confidence: confidence.score,
                reason: confidence.reason,
                details: confidence.details,
                projectTruth: this.currentTruth,
                type
            });
        } else if (confidence.score >= 80) {
            status = 'review';
            message = `Possible context drift: ${confidence.reason}`;
            recommendation = 'Review with Project Manager for alignment';
            
            // Learn from high-confidence issues
            await violationLearningSystem.learnFromViolation({
                item,
                confidence: confidence.score,
                reason: confidence.reason,
                details: confidence.details,
                projectTruth: this.currentTruth,
                type
            });
        } else if (confidence.score >= 60) {
            status = 'warning';
            message = `Minor concern: ${confidence.reason}`;
            recommendation = 'Consider clarifying alignment with project goals';
        } else {
            status = 'allowed';
            message = 'Item aligns with project context';
            recommendation = '';
        }

        return {
            status,
            confidence: confidence.score,
            message,
            recommendation,
            details: confidence.details
        };
    }

    /**
     * Verify all items in the backlog
     */
    async verifyBacklog() {
        const backlogFile = path.join(this.backlogPath, 'backlog-state.json');
        
        if (!await fs.pathExists(backlogFile)) {
            return {
                success: false,
                message: 'No backlog found'
            };
        }

        const backlog = await fs.readJSON(backlogFile);
        const results = {
            total: 0,
            aligned: 0,
            warnings: 0,
            reviews: 0,
            violations: 0,
            items: []
        };

        // Verify each backlog item
        for (const item of backlog.items || []) {
            const verification = await this.verifyItem({
                title: item.title,
                description: item.description,
                acceptanceCriteria: item.acceptanceCriteria
            }, 'backlog');

            results.total++;
            
            switch (verification.status) {
                case 'allowed':
                    results.aligned++;
                    break;
                case 'warning':
                    results.warnings++;
                    break;
                case 'review':
                    results.reviews++;
                    break;
                case 'blocked':
                    results.violations++;
                    break;
            }

            results.items.push({
                id: item.id,
                title: item.title,
                ...verification
            });
        }

        results.purityScore = Math.round((results.aligned / results.total) * 100);

        return {
            success: true,
            results
        };
    }

    /**
     * Verify sprint tasks
     */
    async verifySprintTasks(sprintName) {
        const sprintPath = path.join(
            this.projectRoot, 
            'project-documents', 
            'orchestration', 
            'sprints', 
            sprintName
        );
        
        const tasksFile = path.join(sprintPath, 'planning', 'selected-backlog-items.md');
        
        if (!await fs.pathExists(tasksFile)) {
            return {
                success: false,
                message: 'Sprint tasks not found'
            };
        }

        const content = await fs.readFile(tasksFile, 'utf8');
        const tasks = this.parseSprintTasks(content);
        
        const results = {
            sprintName,
            canProceed: true,
            tasks: []
        };

        for (const task of tasks) {
            const verification = await this.verifyItem(task, 'sprint-task');
            
            if (verification.status === 'blocked') {
                results.canProceed = false;
            }

            results.tasks.push({
                ...task,
                ...verification
            });
        }

        return {
            success: true,
            results
        };
    }

    /**
     * Create or update project truth
     */
    async createProjectTruth(data) {
        const truthFile = path.join(this.truthPath, 'project-truth.md');
        
        // Ensure directory exists
        await fs.ensureDir(this.truthPath);

        // Generate markdown content
        const content = this.generateProjectTruthMarkdown(data);
        
        // Save file
        await fs.writeFile(truthFile, content, 'utf8');
        
        // Reload truth
        await this.loadProjectTruth();

        return {
            success: true,
            message: 'Project truth created/updated',
            path: truthFile
        };
    }

    /**
     * Generate project truth markdown
     */
    generateProjectTruthMarkdown(data) {
        const timestamp = new Date().toISOString();
        
        return `# PROJECT TRUTH: ${data.projectName}
Generated: ${timestamp}
Last Verified: ${timestamp}

## WHAT WE'RE BUILDING
${data.whatWereBuilding}

## INDUSTRY/DOMAIN
${data.industry}

## TARGET USERS
- Primary: ${data.targetUsers.primary}
- Secondary: ${data.targetUsers.secondary || 'N/A'}

## NOT THIS
This project is NOT:
${data.notThis.map(item => `- ❌ ${item}`).join('\n')}

## COMPETITORS
${data.competitors.map(c => `- ${c.name} - ${c.description}`).join('\n')}

## DOMAIN TERMS
${data.domainTerms.map(t => `- **${t.term}**: ${t.definition}`).join('\n')}

## VERSION HISTORY
- v1.0 (${timestamp}): Initial creation

---
*This document is the single source of truth for project context. All features, stories, and tasks must align with this document.*
`;
    }

    // Helper methods
    extractFirstLine(section) {
        const lines = section.split('\n').filter(l => l.trim() && !l.startsWith('#'));
        return lines[0] ? lines[0].trim() : '';
    }

    extractBulletPoints(section, marker = '-') {
        const lines = section.split('\n').filter(l => l.trim().startsWith(marker));
        return lines.map(l => l.replace(new RegExp(`^\\s*${marker}\\s*`), '').trim());
    }

    extractDefinitions(section) {
        const lines = section.split('\n').filter(l => l.includes(':'));
        return lines.map(line => {
            const [term, definition] = line.split(':').map(s => s.trim());
            return { term: term.replace(/[-*]\s*/, '').replace(/\*\*/g, ''), definition };
        });
    }

    parseSprintTasks(content) {
        // Parse sprint tasks from markdown
        const tasks = [];
        const lines = content.split('\n');
        
        let currentTask = null;
        
        lines.forEach(line => {
            if (line.match(/^###\s+/)) {
                if (currentTask) tasks.push(currentTask);
                currentTask = {
                    title: line.replace(/^###\s+/, '').trim(),
                    description: ''
                };
            } else if (currentTask && line.trim()) {
                currentTask.description += line + '\n';
            }
        });
        
        if (currentTask) tasks.push(currentTask);
        
        return tasks;
    }

    /**
     * Load domain glossary
     */
    async loadDomainGlossary() {
        const glossaryFile = path.join(this.truthPath, 'domain-glossary.md');
        
        if (await fs.pathExists(glossaryFile)) {
            const content = await fs.readFile(glossaryFile, 'utf8');
            // Parse glossary into map
            const terms = this.extractDefinitions(content);
            terms.forEach(t => this.domainGlossary.set(t.term.toLowerCase(), t.definition));
        }
    }

    /**
     * Load "not this" list
     */
    async loadNotThisList() {
        const notThisFile = path.join(this.truthPath, 'not-this.md');
        
        if (await fs.pathExists(notThisFile)) {
            const content = await fs.readFile(notThisFile, 'utf8');
            this.notThisList = this.extractBulletPoints(content);
        }
    }

    /**
     * Get learning insights for current project
     */
    async getLearningInsights() {
        if (!this.currentTruth) {
            return {
                success: false,
                message: 'No project truth document found'
            };
        }

        const insights = await violationLearningSystem.getProjectInsights(this.currentTruth);
        
        return {
            success: true,
            insights
        };
    }

    /**
     * Apply learned prevention strategies
     */
    async applyLearnedPrevention() {
        const insights = await this.getLearningInsights();
        
        if (insights.success && insights.insights.preventionStrategies.length > 0) {
            // Return strategies that can be implemented
            return {
                success: true,
                strategies: insights.insights.preventionStrategies,
                recommendations: insights.insights.recommendations
            };
        }
        
        return {
            success: false,
            message: 'No prevention strategies available yet'
        };
    }
}

module.exports = new ContextVerificationEngine();
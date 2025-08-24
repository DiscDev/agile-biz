#!/usr/bin/env node

/**
 * Learn From Contributions Workflow Handler
 * 
 * Complete 7-phase workflow for analyzing community contributions
 * and implementing improvements to the AgileAiAgents system.
 * 
 * Commands:
 * - (no args): Run full workflow with stakeholder gates
 * - --check-only: Discovery phase only
 * - --validate: Validation phase with manual override
 * - --analyze: Analysis phase
 * - --plan: Planning phase
 * - --approve: Approval phase (stakeholder required)
 * - --implement: Implementation phase (partial success allowed)
 * - --archive: Archive phase (includes failures)
 * - --status: Show workflow status
 * - --resume: Resume interrupted workflow
 * - --rollback: Rollback last implementation
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Paths
const CONTRIBUTIONS_DIR = path.join(__dirname, '../../community-learnings/contributions');
const ARCHIVE_DIR = path.join(__dirname, '../../community-learnings/archive');
const PROJECT_DOCS_DIR = path.join(__dirname, '../../project-documents');
const ANALYSIS_REPORTS_DIR = path.join(PROJECT_DOCS_DIR, 'analysis-reports');
const WORKFLOW_STATE_DIR = path.join(__dirname, '../../project-state/learning-workflow');
const WORKFLOW_STATE_FILE = path.join(WORKFLOW_STATE_DIR, 'current-workflow-state.json');

// Command line arguments
const args = process.argv.slice(2);
const option = args[0];

// Color codes for output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

// Readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Prompt user for input
 */
function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

/**
 * Prompt user for confirmation
 */
async function confirmContinue(message) {
    const answer = await prompt(`\n${message} (yes/no): `);
    return answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y';
}

/**
 * Load workflow state
 */
function loadWorkflowState() {
    try {
        if (fs.existsSync(WORKFLOW_STATE_FILE)) {
            return JSON.parse(fs.readFileSync(WORKFLOW_STATE_FILE, 'utf-8'));
        }
    } catch (error) {
        console.error('Error loading workflow state:', error.message);
    }
    return null;
}

/**
 * Save workflow state
 */
function saveWorkflowState(state) {
    try {
        if (!fs.existsSync(WORKFLOW_STATE_DIR)) {
            fs.mkdirSync(WORKFLOW_STATE_DIR, { recursive: true });
        }
        fs.writeFileSync(WORKFLOW_STATE_FILE, JSON.stringify(state, null, 2));
    } catch (error) {
        console.error('Error saving workflow state:', error.message);
    }
}

/**
 * Initialize new workflow state
 */
function initializeWorkflowState() {
    return {
        workflow_id: `workflow-${new Date().toISOString().split('T')[0]}-${Date.now()}`,
        started_at: new Date().toISOString(),
        current_phase: 'discovery',
        phases_completed: [],
        contributions: [],
        validation_results: {
            scores: {},
            manual_overrides: {}
        },
        patterns: [],
        plans: [],
        approvals: {
            approved: [],
            rejected: [],
            deferred: [],
            stakeholder_notes: {}
        },
        implementation_results: {
            successful: [],
            failed: [],
            partial: []
        }
    };
}

/**
 * Get all contributions including folders and standalone .md files
 */
function getContributions() {
    try {
        if (!fs.existsSync(CONTRIBUTIONS_DIR)) {
            return [];
        }

        const entries = fs.readdirSync(CONTRIBUTIONS_DIR, { withFileTypes: true });
        const contributions = [];

        for (const entry of entries) {
            // Handle folders (excluding examples)
            if (entry.isDirectory() && entry.name !== 'examples') {
                const contributionPath = path.join(CONTRIBUTIONS_DIR, entry.name);
                
                // Check if it's a valid contribution (has learnings.md or project-summary.md)
                const hasLearnings = fs.existsSync(path.join(contributionPath, 'learnings.md'));
                const hasSummary = fs.existsSync(path.join(contributionPath, 'project-summary.md'));
                
                if (hasLearnings || hasSummary) {
                    contributions.push({
                        name: entry.name,
                        path: contributionPath,
                        type: 'folder',
                        hasLearnings,
                        hasSummary,
                        dateCreated: fs.statSync(contributionPath).birthtime
                    });
                }
            } 
            // Handle standalone .md files
            else if (entry.isFile() && entry.name.endsWith('.md')) {
                // Exclude system files
                const excludedFiles = ['.gitkeep', 'README.md'];
                if (!excludedFiles.includes(entry.name)) {
                    const filePath = path.join(CONTRIBUTIONS_DIR, entry.name);
                    contributions.push({
                        name: entry.name.replace('.md', ''), // Remove .md extension for consistency
                        path: filePath,
                        type: 'file',
                        hasLearnings: true, // Standalone files are treated as learnings
                        hasSummary: false,
                        dateCreated: fs.statSync(filePath).birthtime
                    });
                }
            }
        }

        // Sort by date (newest first)
        contributions.sort((a, b) => b.dateCreated - a.dateCreated);
        
        return contributions;
    } catch (error) {
        console.error('Error reading contributions:', error.message);
        return [];
    }
}

/**
 * Get previously analyzed contributions from archive
 */
function getAnalyzedContributions() {
    const analyzed = new Set();
    
    // Check all archive directories
    const archiveDirs = ['implemented', 'rejected', 'failed', 'partial'];
    
    for (const dir of archiveDirs) {
        const archivePath = path.join(ARCHIVE_DIR, dir);
        if (fs.existsSync(archivePath)) {
            const entries = fs.readdirSync(archivePath, { withFileTypes: true });
            entries.forEach(entry => {
                if (entry.isDirectory()) {
                    // Extract original contribution name from archive folder name
                    const match = entry.name.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
                    if (match) {
                        analyzed.add(match[1]);
                    }
                }
            });
        }
    }
    
    return analyzed;
}

/**
 * Phase 1: Discovery - Check for new contributions
 */
async function checkContributions(state = null) {
    const contributions = getContributions();
    const analyzed = getAnalyzedContributions();
    
    const newContributions = contributions.filter(c => !analyzed.has(c.name));
    const analyzedCount = contributions.filter(c => analyzed.has(c.name)).length;
    
    console.log('\n📊 Phase 1: Discovery');
    console.log('━'.repeat(50));
    console.log(`Total contributions found: ${contributions.length}`);
    console.log(`Previously analyzed: ${analyzedCount}`);
    console.log(`New contributions: ${newContributions.length}`);
    
    if (newContributions.length > 0) {
        console.log('\n🆕 New Contributions:');
        newContributions.forEach((contrib, index) => {
            console.log(`\n${index + 1}. ${contrib.name}`);
            console.log(`   Path: ${contrib.path}`);
            if (contrib.type === 'folder') {
                console.log(`   Type: Folder`);
                console.log(`   Files: ${contrib.hasLearnings ? '✓ learnings.md' : ''} ${contrib.hasSummary ? '✓ project-summary.md' : ''}`);
            } else {
                console.log(`   Type: Standalone file`);
            }
            console.log(`   Created: ${contrib.dateCreated.toLocaleDateString()}`);
        });
    } else {
        console.log('\n✅ All contributions have been analyzed');
    }
    
    // Update state if provided
    if (state) {
        state.contributions = newContributions;
        if (!state.phases_completed.includes('discovery')) {
            state.phases_completed.push('discovery');
        }
        state.current_phase = 'validation';
        saveWorkflowState(state);
    } else if (option === '--check-only') {
        // For standalone check-only, save basic state
        const basicState = initializeWorkflowState();
        basicState.contributions = newContributions;
        basicState.phases_completed = ['discovery'];
        basicState.current_phase = 'validation';
        saveWorkflowState(basicState);
    }
    
    return newContributions;
}

/**
 * Calculate validation score for a contribution
 */
function calculateValidationScore(contribution) {
    // Simplified scoring - in real implementation would be more sophisticated
    let score = 0;
    
    // Base score for existing
    score += 3;
    
    // Additional points for structure
    if (contribution.type === 'folder' && contribution.hasLearnings && contribution.hasSummary) {
        score += 3;
    } else if (contribution.type === 'file') {
        score += 2;
    }
    
    // Random factor for demo (would be based on content analysis)
    score += Math.random() * 4;
    
    return Math.min(10, Math.round(score * 10) / 10);
}

/**
 * Phase 2: Validation with manual override
 */
async function validateContributions(state = null) {
    const workflowState = state || loadWorkflowState();
    if (!workflowState || workflowState.contributions.length === 0) {
        console.log('\n⚠️  No contributions to validate. Run discovery phase first.');
        return [];
    }
    
    console.log('\n🔍 Phase 2: Validation');
    console.log('━'.repeat(50));
    console.log('Validating contribution quality and relevance...\n');
    
    const validatedContributions = [];
    
    for (const contribution of workflowState.contributions) {
        const score = calculateValidationScore(contribution);
        console.log(`\n📄 ${contribution.name}`);
        console.log(`   Validation Score: ${score}/10`);
        
        let status = 'passed';
        
        if (score < 6.0) {
            console.log(`   ${YELLOW}⚠️  Below threshold (6.0)${RESET}`);
            
            const override = await confirmContinue('   Override rejection and include anyway?');
            
            if (override) {
                console.log(`   ${GREEN}✅ Manual override - included${RESET}`);
                status = 'override';
            } else {
                console.log(`   ${RED}❌ Rejected${RESET}`);
                status = 'rejected';
            }
        } else {
            console.log(`   ${GREEN}✅ Passed validation${RESET}`);
        }
        
        contribution.validation = { score, status };
        if (status !== 'rejected') {
            validatedContributions.push(contribution);
        }
        
        // Update state
        workflowState.validation_results.scores[contribution.name] = score;
        if (status === 'override') {
            workflowState.validation_results.manual_overrides[contribution.name] = true;
        }
    }
    
    // Summary
    console.log('\n📊 Validation Summary:');
    console.log(`   Total: ${workflowState.contributions.length}`);
    console.log(`   Passed: ${validatedContributions.filter(c => c.validation.status === 'passed').length}`);
    console.log(`   Overridden: ${validatedContributions.filter(c => c.validation.status === 'override').length}`);
    console.log(`   Rejected: ${workflowState.contributions.length - validatedContributions.length}`);
    
    // Update workflow state
    workflowState.contributions = validatedContributions;
    if (!workflowState.phases_completed.includes('validation')) {
        workflowState.phases_completed.push('validation');
    }
    workflowState.current_phase = 'analysis';
    saveWorkflowState(workflowState);
    
    return validatedContributions;
}

/**
 * Show workflow status
 */
function showStatus() {
    const state = loadWorkflowState();
    const contributions = getContributions();
    const analyzed = getAnalyzedContributions();
    
    console.log('\n📊 Learning Analysis Workflow Status');
    console.log('━'.repeat(50));
    
    // Overall stats
    console.log('\n📈 Statistics:');
    console.log(`Total contributions: ${contributions.length}`);
    console.log(`Analyzed: ${analyzed.size}`);
    console.log(`Pending analysis: ${contributions.length - analyzed.size}`);
    
    // Current workflow status
    if (state) {
        console.log('\n🔄 Active Workflow:');
        console.log(`ID: ${state.workflow_id}`);
        console.log(`Started: ${new Date(state.started_at).toLocaleString()}`);
        console.log(`Current Phase: ${state.current_phase}`);
        console.log(`Phases Completed: ${state.phases_completed.join(', ') || 'none'}`);
        
        if (state.contributions.length > 0) {
            console.log(`Contributions in workflow: ${state.contributions.length}`);
        }
        
        if (state.approvals.approved.length > 0) {
            console.log(`Approved plans: ${state.approvals.approved.length}`);
        }
    } else {
        console.log('\n💤 No active workflow');
        console.log('Start with: /learn-from-contributions-workflow');
    }
    
    // Archive stats
    const implementedCount = fs.existsSync(path.join(ARCHIVE_DIR, 'implemented')) 
        ? fs.readdirSync(path.join(ARCHIVE_DIR, 'implemented')).length 
        : 0;
    const rejectedCount = fs.existsSync(path.join(ARCHIVE_DIR, 'rejected'))
        ? fs.readdirSync(path.join(ARCHIVE_DIR, 'rejected')).length
        : 0;
    const failedCount = fs.existsSync(path.join(ARCHIVE_DIR, 'failed'))
        ? fs.readdirSync(path.join(ARCHIVE_DIR, 'failed')).length
        : 0;
    const partialCount = fs.existsSync(path.join(ARCHIVE_DIR, 'partial'))
        ? fs.readdirSync(path.join(ARCHIVE_DIR, 'partial')).length
        : 0;
        
    console.log(`\n📁 Archive Status:`);
    console.log(`Implemented patterns: ${implementedCount}`);
    console.log(`Rejected patterns: ${rejectedCount}`);
    console.log(`Failed implementations: ${failedCount}`);
    console.log(`Partial implementations: ${partialCount}`);
    
    // Readiness
    const readiness = calculateReadiness(contributions.length - analyzed.size);
    console.log(`\n🎯 Readiness: ${readiness.emoji} ${readiness.status}`);
    console.log(`${readiness.message}`);
}

/**
 * Calculate readiness for contribution analysis
 */
function calculateReadiness(pendingCount) {
    if (pendingCount === 0) {
        return {
            emoji: '✅',
            status: 'Up to date',
            message: 'All contributions have been analyzed'
        };
    } else if (pendingCount <= 2) {
        return {
            emoji: '🟡',
            status: 'Ready',
            message: `${pendingCount} new contribution${pendingCount > 1 ? 's' : ''} ready for analysis`
        };
    } else {
        return {
            emoji: '🔴',
            status: 'Action needed',
            message: `${pendingCount} contributions pending analysis`
        };
    }
}

/**
 * Run full workflow with stakeholder gates
 */
async function runFullWorkflow() {
    console.log('\n🚀 Learn From Contributions Workflow');
    console.log('━'.repeat(50));
    console.log('This workflow will guide you through 7 phases to analyze');
    console.log('contributions and implement improvements to AgileAiAgents.\n');
    
    // Initialize or load state
    let state = loadWorkflowState();
    if (state && state.phases_completed.length > 0) {
        console.log('📌 Found existing workflow in progress.');
        const resume = await confirmContinue('Resume from where you left off?');
        if (!resume) {
            state = initializeWorkflowState();
        }
    } else {
        state = initializeWorkflowState();
    }
    
    try {
        // Phase 1: Discovery
        if (!state.phases_completed.includes('discovery')) {
            const contributions = await checkContributions(state);
            if (contributions.length === 0) {
                console.log('\n✅ No new contributions to process.');
                return;
            }
            
            if (!await confirmContinue('Proceed to validation phase?')) {
                console.log('\nWorkflow paused. Resume with: /learn-from-contributions-workflow --resume');
                return;
            }
        }
        
        // Phase 2: Validation
        if (!state.phases_completed.includes('validation')) {
            await validateContributions(state);
            
            if (state.contributions.length === 0) {
                console.log('\n⚠️  No contributions passed validation.');
                return;
            }
            
            if (!await confirmContinue('Proceed to analysis phase?')) {
                console.log('\nWorkflow paused. Resume with: /learn-from-contributions-workflow --resume');
                return;
            }
        }
        
        // Phase 3: Analysis
        if (!state.phases_completed.includes('analysis')) {
            await analyzeContributions(state);
            
            if (!state.analysis_results || state.analysis_results.patterns.length === 0) {
                console.log('\n⚠️  No patterns found to implement.');
                return;
            }
            
            if (!await confirmContinue('Proceed to planning phase?')) {
                console.log('\nWorkflow paused. Resume with: /learn-from-contributions-workflow --resume');
                return;
            }
        }
        
        // Phase 4: Planning
        if (!state.phases_completed.includes('planning')) {
            await planImplementation(state);
            
            if (!state.plans || state.plans.length === 0) {
                console.log('\n⚠️  No implementation plans generated.');
                return;
            }
            
            console.log('\n📋 Plans are ready for your review.');
            if (!await confirmContinue('Proceed to approval phase?')) {
                console.log('\nWorkflow paused. Resume with: /learn-from-contributions-workflow --resume');
                return;
            }
        }
        
        // Phase 5: Approval
        if (!state.phases_completed.includes('approval')) {
            await approveImplementation(state);
            
            if (!state.approvals || state.approvals.approved.length === 0) {
                console.log('\n⚠️  No plans approved for implementation.');
                return;
            }
            
            if (!await confirmContinue('Proceed to implementation phase?')) {
                console.log('\nWorkflow paused. Resume with: /learn-from-contributions-workflow --resume');
                return;
            }
        }
        
        // Phase 6: Implementation
        if (!state.phases_completed.includes('implementation')) {
            await implementChanges(state);
            
            if (!await confirmContinue('Proceed to archive phase?')) {
                console.log('\nWorkflow paused. Resume with: /learn-from-contributions-workflow --resume');
                return;
            }
        }
        
        // Phase 7: Archive
        if (!state.phases_completed.includes('archive')) {
            await archiveResults(state);
        }
        
        // Workflow complete
        console.log('\n✅ Workflow complete!');
        console.log('All contributions have been analyzed and processed.');
        
    } catch (error) {
        console.log(`\n${RED}❌ Workflow error: ${error.message}${RESET}`);
        console.log('State saved. Resume with: /learn-from-contributions-workflow --resume');
    } finally {
        rl.close();
    }
}

/**
 * Show help information
 */
function showHelp() {
    console.log('\n📚 Learn From Contributions Workflow - Help');
    console.log('━'.repeat(50));
    console.log('\nUsage: learn-from-contributions-workflow [option]');
    console.log('\nOptions:');
    console.log('  (no args)       Run full workflow with stakeholder gates');
    console.log('  --check-only    Discovery phase only');
    console.log('  --validate      Validation phase with manual override');
    console.log('  --analyze       Analysis phase (existing basic implementation)');
    console.log('  --plan          Planning phase (not yet implemented)');
    console.log('  --approve       Approval phase (not yet implemented)');
    console.log('  --implement     Implementation phase (not yet implemented)');
    console.log('  --archive       Archive phase (not yet implemented)');
    console.log('  --status        Show workflow status');
    console.log('  --resume        Resume interrupted workflow (not yet implemented)');
    console.log('  --rollback      Rollback last implementation (not yet implemented)');
    console.log('  --help, -h      Show this help message');
    console.log('\nWorkflow Phases:');
    console.log('  1. Discovery    - Find new contributions');
    console.log('  2. Validation   - Check quality (with manual override)');
    console.log('  3. Analysis     - Extract patterns and insights');
    console.log('  4. Planning     - Create implementation plans');
    console.log('  5. Approval     - Stakeholder review (required)');
    console.log('  6. Implementation - Apply changes (partial success allowed)');
    console.log('  7. Archive      - Document results (including failures)');
}

// Import workflow modules
const analyzer = require('./learning-analyzer');
const planner = require('./learning-planner');
const approver = require('./learning-approver');
const implementer = require('./learning-implementer');
const archiver = require('./learning-archiver');

/**
 * Phase 3: Analysis - Extract patterns and insights
 */
async function analyzeContributions(state = null) {
    const workflowState = state || loadWorkflowState();
    if (!workflowState || !workflowState.contributions || workflowState.contributions.length === 0) {
        console.log('\n⚠️  No validated contributions to analyze. Run validation phase first.');
        return null;
    }
    
    console.log('\n🔍 Phase 3: Analysis');
    console.log('━'.repeat(50));
    console.log('Extracting patterns and insights from contributions...\n');
    
    // Perform analysis
    const analysisResults = analyzer.analyzeContributions(workflowState.contributions, workflowState);
    
    // Display summary
    console.log(`📊 Analysis Summary:`);
    console.log(`   Patterns Identified: ${analysisResults.patterns.length}`);
    console.log(`   Cross-Contribution Patterns: ${analysisResults.cross_patterns.length}`);
    console.log(`   High-Confidence Patterns: ${analysisResults.patterns.filter(p => p.confidence >= 85).length}`);
    console.log(`   Key Insights: ${analysisResults.insights.length}`);
    console.log(`   Recommendations: ${analysisResults.recommendations.length}`);
    
    // Show top patterns
    console.log('\n🔝 Top Patterns:');
    const topPatterns = analysisResults.patterns
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);
    
    topPatterns.forEach((pattern, index) => {
        console.log(`   ${index + 1}. ${pattern.name} (${pattern.type})`);
        console.log(`      Confidence: ${pattern.confidence}%`);
        console.log(`      Occurrences: ${pattern.occurrences}`);
    });
    
    // Generate and save report
    const report = analyzer.generateAnalysisReport(analysisResults);
    const timestamp = new Date().toISOString().split('T')[0];
    const reportPath = path.join(ANALYSIS_REPORTS_DIR, `workflow-analysis-${timestamp}.md`);
    
    if (!fs.existsSync(ANALYSIS_REPORTS_DIR)) {
        fs.mkdirSync(ANALYSIS_REPORTS_DIR, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, report);
    console.log(`\n📝 Analysis report saved to: ${reportPath}`);
    
    // Update workflow state
    workflowState.analysis_results = analysisResults;
    if (!workflowState.phases_completed.includes('analysis')) {
        workflowState.phases_completed.push('analysis');
    }
    workflowState.current_phase = 'planning';
    saveWorkflowState(workflowState);
    
    return analysisResults;
}

/**
 * Phase 4: Planning - Generate implementation plans
 */
async function planImplementation(state = null) {
    const workflowState = state || loadWorkflowState();
    if (!workflowState || !workflowState.analysis_results) {
        console.log('\n⚠️  No analysis results found. Run analysis phase first.');
        return null;
    }
    
    console.log('\n📋 Phase 4: Planning');
    console.log('━'.repeat(50));
    console.log('Generating implementation plans from patterns...\n');
    
    // Generate plans
    const plans = planner.generateImplementationPlans(
        workflowState.analysis_results.patterns,
        workflowState
    );
    
    // Display plan summary
    console.log(`📊 Planning Summary:`);
    console.log(`   Total Plans Generated: ${plans.length}`);
    console.log(`   High Priority: ${plans.filter(p => p.risk === 'low' && p.confidence > 85).length}`);
    console.log(`   Medium Priority: ${plans.filter(p => p.risk === 'medium' || (p.confidence > 70 && p.confidence <= 85)).length}`);
    console.log(`   Low Priority: ${plans.filter(p => p.risk === 'high' || p.confidence <= 70).length}`);
    
    // Show plans overview
    console.log('\n📑 Implementation Plans:');
    plans.forEach((plan, index) => {
        console.log(`\n${index + 1}. ${plan.title}`);
        console.log(`   Type: ${plan.type}`);
        console.log(`   Confidence: ${plan.confidence}%`);
        console.log(`   Risk: ${plan.risk}`);
        console.log(`   Impact: +${plan.impact.overall}% overall improvement`);
        console.log(`   Effort: ${plan.estimated_effort.estimated_hours} hours`);
        console.log(`   Affects: ${plan.affected_agents.slice(0, 3).join(', ')}${plan.affected_agents.length > 3 ? '...' : ''}`);
    });
    
    // Generate and save planning report
    let planningReport = `# Implementation Planning Report\n\n`;
    planningReport += `Date: ${new Date().toISOString()}\n`;
    planningReport += `Plans Generated: ${plans.length}\n\n`;
    
    plans.forEach((plan, index) => {
        planningReport += planner.formatPlanForDisplay(plan);
        planningReport += '\n\n';
    });
    
    const timestamp = new Date().toISOString().split('T')[0];
    const planReportPath = path.join(PROJECT_DOCS_DIR, 'planning', `implementation-plans-${timestamp}.md`);
    
    const planningDir = path.join(PROJECT_DOCS_DIR, 'planning');
    if (!fs.existsSync(planningDir)) {
        fs.mkdirSync(planningDir, { recursive: true });
    }
    
    fs.writeFileSync(planReportPath, planningReport);
    console.log(`\n📝 Planning report saved to: ${planReportPath}`);
    
    // Update workflow state
    workflowState.plans = plans;
    if (!workflowState.phases_completed.includes('planning')) {
        workflowState.phases_completed.push('planning');
    }
    workflowState.current_phase = 'approval';
    saveWorkflowState(workflowState);
    
    return plans;
}

/**
 * Phase 5: Approval - Stakeholder review and approval
 */
async function approveImplementation(state = null) {
    const workflowState = state || loadWorkflowState();
    if (!workflowState || !workflowState.plans || workflowState.plans.length === 0) {
        console.log('\n⚠️  No plans found to approve. Run planning phase first.');
        return null;
    }
    
    // Run approval interface
    const approvalResults = await approver.approveImplementationPlans(
        workflowState.plans,
        workflowState
    );
    
    // Update workflow state
    workflowState.approvals = approvalResults;
    if (!workflowState.phases_completed.includes('approval')) {
        workflowState.phases_completed.push('approval');
    }
    workflowState.current_phase = 'implementation';
    saveWorkflowState(workflowState);
    
    return approvalResults;
}

/**
 * Phase 6: Implementation - Execute approved changes
 */
async function implementChanges(state = null) {
    const workflowState = state || loadWorkflowState();
    if (!workflowState || !workflowState.approvals || workflowState.approvals.approved.length === 0) {
        console.log('\n⚠️  No approved plans to implement.');
        return null;
    }
    
    // Execute implementation
    const implementationResults = await implementer.executeImplementation(
        workflowState.approvals.approved,
        workflowState
    );
    
    // Update workflow state
    workflowState.implementation_results = implementationResults;
    if (!workflowState.phases_completed.includes('implementation')) {
        workflowState.phases_completed.push('implementation');
    }
    workflowState.current_phase = 'archive';
    saveWorkflowState(workflowState);
    
    return implementationResults;
}

/**
 * Phase 7: Archive - Document results including failures
 */
async function archiveResults(state = null) {
    const workflowState = state || loadWorkflowState();
    if (!workflowState || !workflowState.phases_completed.includes('implementation')) {
        console.log('\n⚠️  No implementation results to archive. Complete implementation phase first.');
        return null;
    }
    
    // Archive all results
    const archiveResults = await archiver.archiveWorkflowResults(workflowState);
    
    // Update workflow state
    workflowState.archive_results = archiveResults;
    if (!workflowState.phases_completed.includes('archive')) {
        workflowState.phases_completed.push('archive');
    }
    workflowState.current_phase = 'completed';
    workflowState.completed_at = new Date().toISOString();
    saveWorkflowState(workflowState);
    
    // Show final summary
    showWorkflowCompleteSummary(workflowState);
    
    return archiveResults;
}

/**
 * Resume interrupted workflow
 */
async function resumeWorkflow() {
    const state = loadWorkflowState();
    if (!state) {
        console.log('\n⚠️  No workflow state found to resume.');
        return;
    }
    
    console.log('\n📌 Resuming workflow...');
    console.log(`Current phase: ${state.current_phase}`);
    console.log(`Completed phases: ${state.phases_completed.join(', ')}`);
    
    // Continue from current phase
    switch (state.current_phase) {
        case 'validation':
            await validateContributions(state);
            break;
        case 'analysis':
            await analyzeContributions(state);
            break;
        case 'planning':
            await planImplementation(state);
            break;
        case 'approval':
            await approveImplementation(state);
            break;
        case 'implementation':
            await implementChanges(state);
            break;
        case 'archive':
            await archiveResults(state);
            break;
        case 'completed':
            console.log('\n✅ Workflow is already complete.');
            showWorkflowCompleteSummary(state);
            break;
        default:
            console.log('\n❓ Unknown workflow state. Starting from beginning.');
            await runFullWorkflow();
    }
}

/**
 * Show workflow completion summary
 */
function showWorkflowCompleteSummary(state) {
    console.log('\n🎉 Workflow Complete!');
    console.log('━'.repeat(50));
    
    console.log('\n📊 Overall Results:');
    console.log(`Started: ${new Date(state.started_at).toLocaleString()}`);
    console.log(`Completed: ${new Date(state.completed_at).toLocaleString()}`);
    console.log(`Total Duration: ${calculateDuration(state.started_at, state.completed_at)}`);
    
    console.log('\n📈 Implementation Summary:');
    if (state.implementation_results) {
        console.log(`✅ Successful: ${state.implementation_results.successful.length}`);
        console.log(`⚠️  Partial: ${state.implementation_results.partial.length}`);
        console.log(`❌ Failed: ${state.implementation_results.failed.length}`);
    }
    
    console.log('\n📦 Archive Summary:');
    if (state.archive_results) {
        console.log(`Patterns archived: ${state.archive_results.implemented.length + state.archive_results.partial.length + state.archive_results.failed.length}`);
        console.log(`Rejected plans: ${state.archive_results.rejected.length}`);
    }
    
    console.log('\n🔍 Next Steps:');
    console.log('1. Monitor implemented changes for 7 days');
    console.log('2. Validate actual impact vs predicted');
    console.log('3. Update success metrics in archive');
    console.log('4. Share learnings with community');
}

/**
 * Calculate duration between timestamps
 */
function calculateDuration(start, end) {
    const duration = new Date(end) - new Date(start);
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

// Main execution
async function main() {
    console.log('🎯 Learn From Contributions Workflow Handler');
    
    switch (option) {
        case '--check-only':
            await checkContributions();
            break;
            
        case '--validate':
            await validateContributions();
            rl.close();
            break;
            
        case '--analyze':
            await analyzeContributions();
            break;
            
        case '--plan':
            await planImplementation();
            break;
            
        case '--approve':
            await approveImplementation();
            rl.close();
            break;
            
        case '--implement':
            await implementChanges();
            rl.close();
            break;
            
        case '--archive':
            await archiveResults();
            rl.close();
            break;
            
        case '--status':
            showStatus();
            break;
            
        case '--resume':
            await resumeWorkflow();
            rl.close();
            break;
            
        case '--rollback':
            console.log('\n🚧 Rollback functionality not yet implemented');
            break;
            
        case '--help':
        case '-h':
            showHelp();
            break;
            
        default:
            if (option) {
                console.log(`\n❌ Unknown option: ${option}`);
                console.log('Run with --help to see available options');
            } else {
                await runFullWorkflow();
            }
    }
}

// Run the handler
main();
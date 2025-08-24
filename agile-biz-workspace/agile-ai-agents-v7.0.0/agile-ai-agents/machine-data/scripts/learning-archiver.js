/**
 * Learning Archiver Module
 * 
 * Archives implementation results including failures for future learning
 */

const fs = require('fs');
const path = require('path');

// Archive paths
const ARCHIVE_DIR = path.join(__dirname, '../../community-learnings/archive');
const ARCHIVE_DIRS = {
    implemented: path.join(ARCHIVE_DIR, 'implemented'),
    rejected: path.join(ARCHIVE_DIR, 'rejected'),
    failed: path.join(ARCHIVE_DIR, 'failed'),
    partial: path.join(ARCHIVE_DIR, 'partial'),
    superseded: path.join(ARCHIVE_DIR, 'superseded')
};

// Index files
const SEARCH_INDEX_FILE = path.join(ARCHIVE_DIR, 'search-index.json');
const PATTERN_EVOLUTION_FILE = path.join(ARCHIVE_DIR, 'pattern-evolution.json');

/**
 * Archive workflow results
 * @param {Object} workflowState - Complete workflow state
 * @returns {Object} Archive results
 */
async function archiveWorkflowResults(workflowState) {
    console.log('\n📦 Phase 7: Archive');
    console.log('━'.repeat(50));
    console.log('Archiving workflow results and decisions...\n');
    
    // Ensure archive directories exist
    ensureArchiveStructure();
    
    const archiveResults = {
        implemented: [],
        rejected: [],
        failed: [],
        partial: [],
        timestamp: new Date().toISOString()
    };
    
    // Archive approved and implemented plans
    if (workflowState.implementation_results) {
        // Successful implementations
        for (const result of workflowState.implementation_results.successful) {
            const archived = await archiveImplementedPattern(result, workflowState);
            archiveResults.implemented.push(archived);
            console.log(`✅ Archived successful: ${result.plan.title}`);
        }
        
        // Partial implementations
        for (const result of workflowState.implementation_results.partial) {
            const archived = await archivePartialImplementation(result, workflowState);
            archiveResults.partial.push(archived);
            console.log(`⚠️  Archived partial: ${result.plan.title}`);
        }
        
        // Failed implementations
        for (const result of workflowState.implementation_results.failed) {
            const archived = await archiveFailedImplementation(result, workflowState);
            archiveResults.failed.push(archived);
            console.log(`❌ Archived failed: ${result.plan.title}`);
        }
    }
    
    // Archive rejected plans
    if (workflowState.approvals && workflowState.approvals.rejected) {
        for (const plan of workflowState.approvals.rejected) {
            const archived = await archiveRejectedPlan(plan, workflowState);
            archiveResults.rejected.push(archived);
            console.log(`🚫 Archived rejected: ${plan.title}`);
        }
    }
    
    // Update search index
    await updateSearchIndex(archiveResults);
    
    // Update pattern evolution tracking
    await updatePatternEvolution(workflowState);
    
    // Generate archive summary
    const summary = generateArchiveSummary(archiveResults, workflowState);
    const summaryPath = path.join(ARCHIVE_DIR, `archive-summary-${new Date().toISOString().split('T')[0]}.md`);
    fs.writeFileSync(summaryPath, summary);
    
    console.log(`\n📝 Archive summary saved to: ${summaryPath}`);
    
    return archiveResults;
}

/**
 * Archive successful implementation
 */
async function archiveImplementedPattern(result, workflowState) {
    const timestamp = new Date().toISOString().split('T')[0];
    const archiveName = `${timestamp}-${slugify(result.plan.title)}`;
    const archivePath = path.join(ARCHIVE_DIRS.implemented, archiveName);
    
    // Create archive directory
    fs.mkdirSync(archivePath, { recursive: true });
    
    // Copy original contributions
    const contributionsDir = path.join(archivePath, 'original-contributions');
    fs.mkdirSync(contributionsDir, { recursive: true });
    
    // Copy source contribution files
    for (const pattern of result.plan.patterns) {
        // Handle both pattern.source (string) and pattern.sources (array)
        const sources = pattern.sources || (pattern.source ? [pattern.source] : []);
        for (const source of sources) {
            const sourcePath = findContributionPath(source);
            if (sourcePath) {
                const destPath = path.join(contributionsDir, path.basename(sourcePath));
                if (!fs.existsSync(destPath)) {
                    copyRecursive(sourcePath, destPath);
                }
            }
        }
    }
    
    // Save analysis report
    const analysisPath = path.join(archivePath, 'analysis-report.md');
    fs.writeFileSync(analysisPath, generateAnalysisReport(result.plan, workflowState));
    
    // Save implementation plan
    const planPath = path.join(archivePath, 'implementation-plan.md');
    fs.writeFileSync(planPath, generatePlanReport(result.plan));
    
    // Save stakeholder approval
    const approvalPath = path.join(archivePath, 'stakeholder-approval.json');
    fs.writeFileSync(approvalPath, JSON.stringify({
        approval: result.plan.approval,
        notes: workflowState.approvals.stakeholder_notes[result.plan.id] || null
    }, null, 2));
    
    // Save changes made
    const changesPath = path.join(archivePath, 'changes-made.json');
    fs.writeFileSync(changesPath, JSON.stringify(result.changes, null, 2));
    
    // Save validation metrics (placeholder for now)
    const metricsPath = path.join(archivePath, 'validation-metrics.json');
    fs.writeFileSync(metricsPath, JSON.stringify({
        predicted: result.plan.success_metrics,
        actual: result.metrics_baseline || {},
        validation_date: null,
        status: 'pending_validation'
    }, null, 2));
    
    // Save metadata
    const metadata = {
        pattern_id: archiveName,
        title: result.plan.title,
        type: result.plan.type,
        validation_score: calculateValidationScore(result),
        impact_magnitude: result.plan.impact.overall,
        historical_confidence: calculateHistoricalConfidence(result.plan),
        similar_patterns: findSimilarPatterns(result.plan),
        success_metrics: result.plan.success_metrics,
        implementation_date: result.end_time,
        last_validated: null,
        search_tags: generateSearchTags(result.plan)
    };
    
    const metadataPath = path.join(archivePath, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    return metadata;
}

/**
 * Archive partial implementation
 */
async function archivePartialImplementation(result, workflowState) {
    const timestamp = new Date().toISOString().split('T')[0];
    const archiveName = `${timestamp}-${slugify(result.plan.title)}`;
    const archivePath = path.join(ARCHIVE_DIRS.partial, archiveName);
    
    // Create archive directory
    fs.mkdirSync(archivePath, { recursive: true });
    
    // Save successful changes
    const successfulPath = path.join(archivePath, 'successful-changes.json');
    fs.writeFileSync(successfulPath, JSON.stringify(
        result.changes.filter(c => c.status === 'success'),
        null, 2
    ));
    
    // Save failed changes
    const failedPath = path.join(archivePath, 'failed-changes.json');
    fs.writeFileSync(failedPath, JSON.stringify(
        result.changes.filter(c => c.status === 'failed'),
        null, 2
    ));
    
    // Save implementation report
    const reportPath = path.join(archivePath, 'implementation-report.md');
    const report = generatePartialImplementationReport(result);
    fs.writeFileSync(reportPath, report);
    
    // Save metadata
    const metadata = {
        pattern_id: archiveName,
        title: result.plan.title,
        type: result.plan.type,
        success_rate: result.changes.filter(c => c.status === 'success').length / result.changes.length,
        failed_steps: result.changes.filter(c => c.status === 'failed').map(c => c.step.description),
        implementation_date: result.end_time,
        search_tags: generateSearchTags(result.plan).concat(['partial'])
    };
    
    const metadataPath = path.join(archivePath, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    return metadata;
}

/**
 * Archive failed implementation
 */
async function archiveFailedImplementation(result, workflowState) {
    const timestamp = new Date().toISOString().split('T')[0];
    const archiveName = `${timestamp}-${slugify(result.plan.title)}`;
    const archivePath = path.join(ARCHIVE_DIRS.failed, archiveName);
    
    // Create archive directory
    fs.mkdirSync(archivePath, { recursive: true });
    
    // Save implementation attempt
    const attemptPath = path.join(archivePath, 'implementation-attempt.json');
    fs.writeFileSync(attemptPath, JSON.stringify(result, null, 2));
    
    // Save error log
    const errorLogPath = path.join(archivePath, 'error-log.md');
    const errorLog = generateErrorLog(result);
    fs.writeFileSync(errorLogPath, errorLog);
    
    // Save rollback record
    const rollbackPath = path.join(archivePath, 'rollback-record.json');
    fs.writeFileSync(rollbackPath, JSON.stringify({
        rollbacks_performed: result.changes.filter(c => c.rolled_back).length,
        rollback_details: result.changes.filter(c => c.rolled_back)
    }, null, 2));
    
    // Save lessons learned
    const lessonsPath = path.join(archivePath, 'lessons-learned.md');
    const lessons = generateLessonsLearned(result);
    fs.writeFileSync(lessonsPath, lessons);
    
    // Save metadata
    const metadata = {
        pattern_id: archiveName,
        title: result.plan.title,
        type: result.plan.type,
        failure_reason: categorizeFailureReason(result),
        errors: result.changes.filter(c => c.error).map(c => c.error),
        implementation_date: result.end_time,
        prevention_suggestions: generatePreventionSuggestions(result),
        search_tags: generateSearchTags(result.plan).concat(['failed'])
    };
    
    const metadataPath = path.join(archivePath, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    return metadata;
}

/**
 * Archive rejected plan
 */
async function archiveRejectedPlan(plan, workflowState) {
    const timestamp = new Date().toISOString().split('T')[0];
    const archiveName = `${timestamp}-${slugify(plan.title)}`;
    const archivePath = path.join(ARCHIVE_DIRS.rejected, archiveName);
    
    // Create archive directory
    fs.mkdirSync(archivePath, { recursive: true });
    
    // Save the original plan
    const planPath = path.join(archivePath, 'rejected-plan.json');
    fs.writeFileSync(planPath, JSON.stringify(plan, null, 2));
    
    // Save rejection analysis
    const analysisPath = path.join(archivePath, 'rejection-analysis.md');
    const analysis = generateRejectionAnalysis(plan);
    fs.writeFileSync(analysisPath, analysis);
    
    // Save validation score
    const validationPath = path.join(archivePath, 'validation-score.json');
    fs.writeFileSync(validationPath, JSON.stringify({
        confidence_score: plan.confidence,
        risk_level: plan.risk,
        impact_potential: plan.impact.overall,
        rejection_reason: plan.approval.reason
    }, null, 2));
    
    // Save metadata
    const metadata = {
        pattern_id: archiveName,
        title: plan.title,
        type: plan.type,
        rejection_date: plan.approval.timestamp,
        rejection_reason: plan.approval.reason,
        confidence_score: plan.confidence,
        search_tags: generateSearchTags(plan).concat(['rejected'])
    };
    
    const metadataPath = path.join(archivePath, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    return metadata;
}

/**
 * Update search index
 */
async function updateSearchIndex(archiveResults) {
    let searchIndex = {};
    
    // Load existing index
    if (fs.existsSync(SEARCH_INDEX_FILE)) {
        searchIndex = JSON.parse(fs.readFileSync(SEARCH_INDEX_FILE, 'utf-8'));
    }
    
    // Add new entries
    const timestamp = new Date().toISOString();
    
    Object.entries(archiveResults).forEach(([status, items]) => {
        // Skip non-array properties like 'timestamp'
        if (Array.isArray(items)) {
            items.forEach(item => {
                const key = item.pattern_id;
                searchIndex[key] = {
                    ...item,
                    status,
                    indexed_at: timestamp
                };
            });
        }
    });
    
    // Save updated index
    fs.writeFileSync(SEARCH_INDEX_FILE, JSON.stringify(searchIndex, null, 2));
}

/**
 * Update pattern evolution tracking
 */
async function updatePatternEvolution(workflowState) {
    let evolution = {};
    
    // Load existing evolution data
    if (fs.existsSync(PATTERN_EVOLUTION_FILE)) {
        evolution = JSON.parse(fs.readFileSync(PATTERN_EVOLUTION_FILE, 'utf-8'));
    }
    
    // Track pattern evolution
    if (workflowState.analysis_results) {
        workflowState.analysis_results.patterns.forEach(pattern => {
            const key = slugify(pattern.name);
            
            if (!evolution[key]) {
                evolution[key] = {
                    name: pattern.name,
                    type: pattern.type,
                    first_seen: new Date().toISOString(),
                    occurrences: [],
                    implementations: [],
                    confidence_trend: []
                };
            }
            
            evolution[key].occurrences.push({
                date: new Date().toISOString(),
                sources: pattern.sources,
                confidence: pattern.confidence
            });
            
            // Track implementation if it happened
            const implemented = workflowState.implementation_results?.successful?.find(r => 
                r.plan.patterns.some(p => p.name === pattern.name)
            );
            
            if (implemented) {
                evolution[key].implementations.push({
                    date: new Date().toISOString(),
                    success: true,
                    impact: implemented.plan.impact.overall
                });
            }
            
            evolution[key].confidence_trend.push({
                date: new Date().toISOString(),
                confidence: pattern.confidence
            });
        });
    }
    
    // Save updated evolution data
    fs.writeFileSync(PATTERN_EVOLUTION_FILE, JSON.stringify(evolution, null, 2));
}

/**
 * Generate archive summary
 */
function generateArchiveSummary(archiveResults, workflowState) {
    let summary = `# Archive Summary\n\n`;
    summary += `Date: ${archiveResults.timestamp}\n`;
    summary += `Workflow ID: ${workflowState.workflow_id}\n\n`;
    
    summary += `## Results Archived\n\n`;
    summary += `- ✅ Implemented: ${archiveResults.implemented.length}\n`;
    summary += `- ⚠️  Partial: ${archiveResults.partial.length}\n`;
    summary += `- ❌ Failed: ${archiveResults.failed.length}\n`;
    summary += `- 🚫 Rejected: ${archiveResults.rejected.length}\n\n`;
    
    // Implemented patterns
    if (archiveResults.implemented.length > 0) {
        summary += `## Implemented Patterns\n\n`;
        archiveResults.implemented.forEach(item => {
            summary += `### ${item.title}\n`;
            summary += `- Type: ${item.type}\n`;
            summary += `- Impact: +${item.impact_magnitude}%\n`;
            summary += `- Confidence: ${item.historical_confidence}\n`;
            summary += `- Tags: ${item.search_tags.join(', ')}\n\n`;
        });
    }
    
    // Failed implementations
    if (archiveResults.failed.length > 0) {
        summary += `## Failed Implementations\n\n`;
        archiveResults.failed.forEach(item => {
            summary += `### ${item.title}\n`;
            summary += `- Failure Reason: ${item.failure_reason}\n`;
            summary += `- Prevention Suggestions:\n`;
            item.prevention_suggestions.forEach(suggestion => {
                summary += `  - ${suggestion}\n`;
            });
            summary += '\n';
        });
    }
    
    // Pattern evolution insights
    summary += `## Pattern Evolution Insights\n\n`;
    summary += `Total unique patterns tracked: ${Object.keys(loadPatternEvolution()).length}\n\n`;
    
    return summary;
}

// Helper functions

function ensureArchiveStructure() {
    Object.values(ARCHIVE_DIRS).forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

function slugify(text) {
    return text.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function findContributionPath(sourceName) {
    const contributionsDir = path.join(__dirname, '../../community-learnings/contributions');
    const possiblePaths = [
        path.join(contributionsDir, sourceName),
        path.join(contributionsDir, `${sourceName}.md`)
    ];
    
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            return p;
        }
    }
    return null;
}

function copyRecursive(src, dest) {
    if (fs.statSync(src).isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(file => {
            copyRecursive(path.join(src, file), path.join(dest, file));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

function calculateValidationScore(result) {
    // Calculate based on success rate and impact
    const successRate = result.changes.filter(c => c.status === 'success').length / result.changes.length;
    const impactScore = result.plan.impact.overall / 100;
    return Math.round((successRate * 0.7 + impactScore * 0.3) * 10) / 10;
}

function calculateHistoricalConfidence(plan) {
    // Would check against historical data
    if (plan.confidence >= 90) return 'VERY HIGH';
    if (plan.confidence >= 80) return 'HIGH';
    if (plan.confidence >= 70) return 'MODERATE';
    return 'LOW';
}

function findSimilarPatterns(plan) {
    // Would search historical archive
    return [];
}

function generateSearchTags(plan) {
    const tags = [plan.type];
    
    // Add pattern-based tags
    plan.patterns.forEach(p => {
        if (p.name.toLowerCase().includes('error')) tags.push('error-handling');
        if (p.name.toLowerCase().includes('performance')) tags.push('performance');
        if (p.name.toLowerCase().includes('test')) tags.push('testing');
    });
    
    // Add impact-based tags
    if (plan.impact.overall >= 50) tags.push('high-impact');
    if (plan.risk === 'low') tags.push('low-risk');
    
    return [...new Set(tags)];
}

function generateAnalysisReport(plan, workflowState) {
    let report = `# Pattern Analysis Report\n\n`;
    report += `## ${plan.title}\n\n`;
    
    report += `### Patterns Analyzed\n\n`;
    plan.patterns.forEach(pattern => {
        report += `**${pattern.name}**\n`;
        report += `- Type: ${pattern.type}\n`;
        report += `- Confidence: ${pattern.confidence}%\n`;
        report += `- Sources: ${pattern.sources.join(', ')}\n\n`;
    });
    
    return report;
}

function generatePlanReport(plan) {
    let report = `# Implementation Plan\n\n`;
    report += `## ${plan.title}\n\n`;
    
    report += `### Overview\n`;
    report += `- Type: ${plan.type}\n`;
    report += `- Confidence: ${plan.confidence}%\n`;
    report += `- Risk: ${plan.risk}\n`;
    report += `- Expected Impact: +${plan.impact.overall}%\n\n`;
    
    report += `### Implementation Steps\n\n`;
    plan.implementation_steps.forEach(step => {
        report += `${step.order}. ${step.description}\n`;
        report += `   - File: ${step.file}\n`;
        report += `   - Action: ${step.action}\n\n`;
    });
    
    return report;
}

function generatePartialImplementationReport(result) {
    const successful = result.changes.filter(c => c.status === 'success').length;
    const failed = result.changes.filter(c => c.status === 'failed').length;
    
    let report = `# Partial Implementation Report\n\n`;
    report += `## ${result.plan.title}\n\n`;
    report += `Success Rate: ${successful}/${result.changes.length} steps (${Math.round(successful/result.changes.length*100)}%)\n\n`;
    
    report += `### Successful Changes\n\n`;
    result.changes.filter(c => c.status === 'success').forEach(change => {
        report += `- ${change.step.description}\n`;
    });
    
    report += `\n### Failed Changes\n\n`;
    result.changes.filter(c => c.status === 'failed').forEach(change => {
        report += `- ${change.step.description}\n`;
        report += `  Error: ${change.error}\n`;
    });
    
    return report;
}

function generateErrorLog(result) {
    let log = `# Error Log\n\n`;
    log += `Plan: ${result.plan.title}\n`;
    log += `Date: ${result.end_time}\n\n`;
    
    log += `## Errors Encountered\n\n`;
    result.changes.forEach((change, idx) => {
        if (change.error) {
            log += `### Step ${idx + 1}: ${change.step.description}\n`;
            log += `Error: ${change.error}\n`;
            log += `Timestamp: ${change.timestamp}\n\n`;
        }
    });
    
    return log;
}

function generateLessonsLearned(result) {
    let lessons = `# Lessons Learned\n\n`;
    lessons += `## Implementation: ${result.plan.title}\n\n`;
    
    lessons += `### What Went Wrong\n\n`;
    const errors = result.changes.filter(c => c.error);
    const errorTypes = categorizeErrors(errors);
    
    Object.entries(errorTypes).forEach(([type, errors]) => {
        lessons += `**${type}**\n`;
        errors.forEach(e => lessons += `- ${e}\n`);
        lessons += '\n';
    });
    
    lessons += `### Prevention Strategies\n\n`;
    generatePreventionSuggestions(result).forEach(suggestion => {
        lessons += `- ${suggestion}\n`;
    });
    
    return lessons;
}

function categorizeFailureReason(result) {
    const errors = result.changes.filter(c => c.error).map(c => c.error);
    
    if (errors.some(e => e.includes('permission') || e.includes('access'))) {
        return 'Permission/Access Issues';
    }
    if (errors.some(e => e.includes('not found') || e.includes('does not exist'))) {
        return 'Missing Files/Resources';
    }
    if (errors.some(e => e.includes('syntax') || e.includes('parse'))) {
        return 'Syntax/Format Errors';
    }
    if (errors.some(e => e.includes('test') || e.includes('fail'))) {
        return 'Test Failures';
    }
    
    return 'Unknown/Multiple Issues';
}

function categorizeErrors(errors) {
    const categories = {
        'File System': [],
        'Syntax': [],
        'Logic': [],
        'Environment': [],
        'Other': []
    };
    
    errors.forEach(e => {
        if (e.error.includes('ENOENT') || e.error.includes('file')) {
            categories['File System'].push(e.error);
        } else if (e.error.includes('syntax') || e.error.includes('parse')) {
            categories['Syntax'].push(e.error);
        } else if (e.error.includes('undefined') || e.error.includes('null')) {
            categories['Logic'].push(e.error);
        } else if (e.error.includes('permission') || e.error.includes('env')) {
            categories['Environment'].push(e.error);
        } else {
            categories['Other'].push(e.error);
        }
    });
    
    // Remove empty categories
    Object.keys(categories).forEach(key => {
        if (categories[key].length === 0) delete categories[key];
    });
    
    return categories;
}

function generatePreventionSuggestions(result) {
    const suggestions = [];
    const failureReason = categorizeFailureReason(result);
    
    switch (failureReason) {
        case 'Permission/Access Issues':
            suggestions.push('Verify file permissions before implementation');
            suggestions.push('Run with appropriate access rights');
            suggestions.push('Check directory write permissions');
            break;
            
        case 'Missing Files/Resources':
            suggestions.push('Validate all file paths exist before starting');
            suggestions.push('Create missing directories in advance');
            suggestions.push('Include file existence checks in implementation');
            break;
            
        case 'Syntax/Format Errors':
            suggestions.push('Validate code syntax before applying changes');
            suggestions.push('Use linting tools to check format');
            suggestions.push('Test changes in isolated environment first');
            break;
            
        case 'Test Failures':
            suggestions.push('Run tests before implementation');
            suggestions.push('Implement changes incrementally with test validation');
            suggestions.push('Ensure test environment matches production');
            break;
            
        default:
            suggestions.push('Perform pre-flight checks before implementation');
            suggestions.push('Implement robust error handling');
            suggestions.push('Create comprehensive backups');
    }
    
    return suggestions;
}

function generateRejectionAnalysis(plan) {
    let analysis = `# Rejection Analysis\n\n`;
    analysis += `## Plan: ${plan.title}\n\n`;
    
    analysis += `### Rejection Details\n`;
    analysis += `- Date: ${plan.approval.timestamp}\n`;
    analysis += `- Reason: ${plan.approval.reason}\n\n`;
    
    analysis += `### Plan Characteristics\n`;
    analysis += `- Confidence Score: ${plan.confidence}%\n`;
    analysis += `- Risk Level: ${plan.risk}\n`;
    analysis += `- Expected Impact: +${plan.impact.overall}%\n`;
    analysis += `- Implementation Effort: ${plan.estimated_effort.estimated_hours} hours\n\n`;
    
    analysis += `### Patterns Involved\n`;
    plan.patterns.forEach(pattern => {
        analysis += `- ${pattern.name} (${pattern.confidence}% confidence)\n`;
    });
    
    return analysis;
}

function loadPatternEvolution() {
    if (fs.existsSync(PATTERN_EVOLUTION_FILE)) {
        return JSON.parse(fs.readFileSync(PATTERN_EVOLUTION_FILE, 'utf-8'));
    }
    return {};
}

module.exports = {
    archiveWorkflowResults,
    updateSearchIndex,
    updatePatternEvolution
};
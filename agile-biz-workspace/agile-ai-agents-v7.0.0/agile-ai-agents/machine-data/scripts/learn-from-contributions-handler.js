#!/usr/bin/env node

/**
 * Learn From Contributions Handler
 * 
 * This script handles the /learn-from-contributions command with various options:
 * - --check-only: Check for new contributions without analysis
 * - --analyze: Perform full analysis of contributions
 * - --status: Show contribution learning status
 * - (no args): Interactive mode
 */

const fs = require('fs');
const path = require('path');

// Paths
const CONTRIBUTIONS_DIR = path.join(__dirname, '../../community-learnings/contributions');
const ARCHIVE_DIR = path.join(__dirname, '../../community-learnings/archive');
const PROJECT_DOCS_DIR = path.join(__dirname, '../../project-documents');
const ANALYSIS_REPORTS_DIR = path.join(PROJECT_DOCS_DIR, 'analysis-reports');

// Command line arguments
const args = process.argv.slice(2);
const option = args[0];

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
    
    // Check implemented archive
    const implementedDir = path.join(ARCHIVE_DIR, 'implemented');
    if (fs.existsSync(implementedDir)) {
        const entries = fs.readdirSync(implementedDir, { withFileTypes: true });
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
    
    // Check rejected archive
    const rejectedDir = path.join(ARCHIVE_DIR, 'rejected');
    if (fs.existsSync(rejectedDir)) {
        const entries = fs.readdirSync(rejectedDir, { withFileTypes: true });
        entries.forEach(entry => {
            if (entry.isDirectory()) {
                const match = entry.name.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
                if (match) {
                    analyzed.add(match[1]);
                }
            }
        });
    }
    
    return analyzed;
}

/**
 * Check for new contributions
 */
function checkContributions() {
    const contributions = getContributions();
    const analyzed = getAnalyzedContributions();
    
    const newContributions = contributions.filter(c => !analyzed.has(c.name));
    const analyzedCount = contributions.filter(c => analyzed.has(c.name)).length;
    
    console.log('\n📊 Contribution Status');
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
        
        console.log('\n💡 Run with --analyze to perform full analysis of new contributions');
    } else {
        console.log('\n✅ All contributions have been analyzed');
    }
    
    return newContributions;
}

/**
 * Perform analysis on contributions
 */
async function analyzeContributions() {
    const newContributions = checkContributions();
    
    if (newContributions.length === 0) {
        console.log('\nNo new contributions to analyze.');
        return;
    }
    
    console.log('\n🔍 Starting Analysis...');
    console.log('━'.repeat(50));
    
    // Create analysis report directory if it doesn't exist
    if (!fs.existsSync(ANALYSIS_REPORTS_DIR)) {
        fs.mkdirSync(ANALYSIS_REPORTS_DIR, { recursive: true });
    }
    
    // Create timestamp for this analysis batch
    const timestamp = new Date().toISOString().split('T')[0];
    const reportPath = path.join(ANALYSIS_REPORTS_DIR, `contribution-analysis-${timestamp}.md`);
    
    let report = `# Contribution Analysis Report\n\n`;
    report += `Date: ${new Date().toISOString()}\n`;
    report += `Contributions Analyzed: ${newContributions.length}\n\n`;
    
    // Analyze each contribution
    for (const contrib of newContributions) {
        console.log(`\nAnalyzing: ${contrib.name}...`);
        
        report += `## ${contrib.name}\n\n`;
        
        // Read contribution files
        if (contrib.type === 'file') {
            // For standalone files, read the file directly
            const content = fs.readFileSync(contrib.path, 'utf-8');
            
            // Extract patterns from the content
            const patterns = extractPatterns(content);
            report += `### Patterns Identified\n`;
            patterns.forEach(p => report += `- ${p}\n`);
            report += '\n';
            
            // Also try to extract metrics
            const metrics = extractMetrics(content);
            if (metrics.length > 0) {
                report += `### Key Metrics\n`;
                metrics.forEach(m => report += `- ${m}\n`);
                report += '\n';
            }
        } else {
            // For folder-based contributions
            if (contrib.hasLearnings) {
                const learningsPath = path.join(contrib.path, 'learnings.md');
                const learnings = fs.readFileSync(learningsPath, 'utf-8');
                
                // Extract key patterns (simplified analysis)
                const patterns = extractPatterns(learnings);
                report += `### Patterns Identified\n`;
                patterns.forEach(p => report += `- ${p}\n`);
                report += '\n';
            }
            
            if (contrib.hasSummary) {
                const summaryPath = path.join(contrib.path, 'project-summary.md');
                const summary = fs.readFileSync(summaryPath, 'utf-8');
                
                // Extract metrics
                const metrics = extractMetrics(summary);
                report += `### Key Metrics\n`;
                metrics.forEach(m => report += `- ${m}\n`);
                report += '\n';
            }
        }
        
        report += `### Recommended Actions\n`;
        report += `- [ ] Review for agent improvements\n`;
        report += `- [ ] Validate patterns against existing implementations\n`;
        report += `- [ ] Create implementation plan if approved\n\n`;
    }
    
    // Write analysis report
    fs.writeFileSync(reportPath, report);
    console.log(`\n📝 Analysis report saved to: ${reportPath}`);
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Review the analysis report');
    console.log('2. Run /learn-from-contributions to start interactive workflow');
    console.log('3. Approve implementation plans as needed');
}

/**
 * Extract patterns from learnings content (simplified)
 */
function extractPatterns(content) {
    const patterns = [];
    
    // Look for common pattern indicators
    if (content.includes('performance')) patterns.push('Performance optimization pattern detected');
    if (content.includes('error') || content.includes('bug')) patterns.push('Error handling pattern detected');
    if (content.includes('testing')) patterns.push('Testing improvement pattern detected');
    if (content.includes('coordination')) patterns.push('Agent coordination pattern detected');
    if (content.includes('deployment')) patterns.push('Deployment pattern detected');
    
    return patterns.length > 0 ? patterns : ['No specific patterns detected - manual review required'];
}

/**
 * Extract metrics from summary content (simplified)
 */
function extractMetrics(content) {
    const metrics = [];
    
    // Look for metric indicators
    const lines = content.split('\n');
    lines.forEach(line => {
        if (line.match(/\d+%/) || line.match(/\$\d+/) || line.match(/\d+\s*(hours?|days?|sprints?)/)) {
            metrics.push(line.trim());
        }
    });
    
    return metrics.length > 0 ? metrics.slice(0, 5) : ['No quantifiable metrics found'];
}

/**
 * Show contribution status
 */
function showStatus() {
    const contributions = getContributions();
    const analyzed = getAnalyzedContributions();
    
    console.log('\n📊 Learning Analysis Status');
    console.log('━'.repeat(50));
    
    // Overall stats
    console.log('\n📈 Statistics:');
    console.log(`Total contributions: ${contributions.length}`);
    console.log(`Analyzed: ${analyzed.size}`);
    console.log(`Pending analysis: ${contributions.length - analyzed.size}`);
    
    // Archive stats
    const implementedCount = fs.existsSync(path.join(ARCHIVE_DIR, 'implemented')) 
        ? fs.readdirSync(path.join(ARCHIVE_DIR, 'implemented')).length 
        : 0;
    const rejectedCount = fs.existsSync(path.join(ARCHIVE_DIR, 'rejected'))
        ? fs.readdirSync(path.join(ARCHIVE_DIR, 'rejected')).length
        : 0;
        
    console.log(`\n📁 Archive Status:`);
    console.log(`Implemented patterns: ${implementedCount}`);
    console.log(`Rejected patterns: ${rejectedCount}`);
    
    // Recent analysis reports
    if (fs.existsSync(ANALYSIS_REPORTS_DIR)) {
        const reports = fs.readdirSync(ANALYSIS_REPORTS_DIR)
            .filter(f => f.startsWith('contribution-analysis-'))
            .sort()
            .reverse()
            .slice(0, 5);
            
        if (reports.length > 0) {
            console.log('\n📝 Recent Analysis Reports:');
            reports.forEach(r => {
                const date = r.match(/\d{4}-\d{2}-\d{2}/)[0];
                console.log(`- ${date}: ${path.join(ANALYSIS_REPORTS_DIR, r)}`);
            });
        }
    }
    
    // Readiness score
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
            message: `${pendingCount} contributions pending analysis - consider running --analyze`
        };
    }
}

/**
 * Interactive mode
 */
function interactiveMode() {
    console.log('\n🤖 Learning Analysis Agent - Interactive Mode');
    console.log('━'.repeat(50));
    
    const newContributions = checkContributions();
    
    if (newContributions.length === 0) {
        console.log('\nNo new contributions to process.');
        showStatus();
        return;
    }
    
    console.log('\n📋 Workflow Steps:');
    console.log('1. Discovery - Find new contributions ✓');
    console.log('2. Validation - Check contribution quality');
    console.log('3. Analysis - Extract patterns and insights');
    console.log('4. Planning - Create implementation plans');
    console.log('5. Approval - Get stakeholder approval');
    console.log('6. Implementation - Update agents');
    console.log('7. Archive - Store decisions and results');
    
    console.log('\n⚡ This is a placeholder for the full interactive workflow.');
    console.log('The Learning Analysis Agent will handle the complete process.');
    
    console.log('\n💡 Available Commands:');
    console.log('- /learn-from-contributions --check-only  (check for new contributions)');
    console.log('- /learn-from-contributions --analyze     (analyze contributions)');
    console.log('- /learn-from-contributions --status      (show current status)');
    console.log('- /learn-from-contributions              (start interactive workflow)');
}

// Main execution
function main() {
    console.log('🎯 Learn From Contributions Handler');
    
    switch (option) {
        case '--check-only':
            checkContributions();
            break;
        case '--analyze':
            analyzeContributions();
            break;
        case '--status':
            showStatus();
            break;
        case '--help':
        case '-h':
            console.log('\nUsage: learn-from-contributions [option]');
            console.log('\nOptions:');
            console.log('  --check-only    Check for new contributions without analysis');
            console.log('  --analyze       Perform analysis on new contributions');
            console.log('  --status        Show contribution learning status');
            console.log('  (no args)       Start interactive workflow');
            console.log('  --help, -h      Show this help message');
            break;
        default:
            if (option) {
                console.log(`\n❌ Unknown option: ${option}`);
                console.log('Run with --help to see available options');
            } else {
                interactiveMode();
            }
    }
}

// Run the handler
main();
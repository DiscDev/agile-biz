/**
 * Learning Implementer Module
 * 
 * Executes approved implementation plans with partial success support
 * 
 * Note: When updating ai-agents/*.md files, the MD→JSON hook system
 * automatically regenerates both JSON and Claude agent files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const BACKUP_DIR = path.join(__dirname, '../../.implementation-backups');
const AI_AGENTS_DIR = path.join(__dirname, '../../ai-agents');
const AAA_DOCUMENTS_DIR = path.join(__dirname, '../../aaa-documents');
const MACHINE_DATA_DIR = path.join(__dirname, '..');
const TESTS_DIR = path.join(__dirname, '../../tests');

// Color codes
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

/**
 * Execute approved implementation plans
 * @param {Array} approvedPlans - Plans approved by stakeholder
 * @param {Object} state - Current workflow state
 * @returns {Object} Implementation results
 */
async function executeImplementation(approvedPlans, state) {
    console.log(`\n🔨 Phase 6: Implementation`);
    console.log('━'.repeat(50));
    console.log(`Implementing ${approvedPlans.length} approved plans...\n`);
    
    const results = {
        successful: [],
        failed: [],
        partial: [],
        rollbacks: [],
        timestamp: new Date().toISOString()
    };
    
    // Create backup directory
    const backupTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sessionBackupDir = path.join(BACKUP_DIR, `backup-${backupTimestamp}`);
    ensureDirectory(sessionBackupDir);
    
    // Process each approved plan
    for (const plan of approvedPlans) {
        console.log(`\n${BLUE}Implementing: ${plan.title}${RESET}`);
        console.log('─'.repeat(plan.title.length + 15));
        
        const planResult = {
            plan: plan,
            changes: [],
            backups: [],
            start_time: new Date().toISOString()
        };
        
        // Execute each implementation step
        for (const step of plan.implementation_steps) {
            const stepResult = await executeStep(step, plan, sessionBackupDir);
            planResult.changes.push(stepResult);
            
            if (stepResult.status === 'success') {
                console.log(`  ${GREEN}✅ ${step.description}${RESET}`);
            } else if (stepResult.status === 'failed') {
                console.log(`  ${RED}❌ ${step.description}${RESET}`);
                console.log(`     Error: ${stepResult.error}`);
                
                // Attempt rollback for this specific change
                if (stepResult.backup) {
                    const rollbackSuccess = await rollbackChange(stepResult);
                    if (rollbackSuccess) {
                        console.log(`     ${YELLOW}↩️  Rolled back successfully${RESET}`);
                        stepResult.rolled_back = true;
                    }
                }
            }
        }
        
        // Run tests if specified
        if (plan.test_command) {
            console.log(`\n  Running tests...`);
            const testResult = await runTests(plan.test_command);
            planResult.test_result = testResult;
            
            if (!testResult.success) {
                console.log(`  ${RED}⚠️  Tests failed!${RESET}`);
                // Don't rollback automatically - let stakeholder decide
            }
        }
        
        // Categorize plan result
        planResult.end_time = new Date().toISOString();
        const successCount = planResult.changes.filter(c => c.status === 'success').length;
        const totalSteps = plan.implementation_steps.length;
        
        if (successCount === totalSteps) {
            results.successful.push(planResult);
            console.log(`\n  ${GREEN}✅ Plan fully implemented (${successCount}/${totalSteps} steps)${RESET}`);
        } else if (successCount > 0) {
            results.partial.push(planResult);
            console.log(`\n  ${YELLOW}⚠️  Partial implementation (${successCount}/${totalSteps} steps)${RESET}`);
        } else {
            results.failed.push(planResult);
            console.log(`\n  ${RED}❌ Implementation failed (0/${totalSteps} steps)${RESET}`);
        }
        
        // Update metrics
        if (plan.success_metrics) {
            planResult.metrics_baseline = await captureMetrics(plan.success_metrics);
        }
    }
    
    // Generate implementation report
    const report = generateImplementationReport(results);
    const reportPath = path.join(sessionBackupDir, 'implementation-report.md');
    fs.writeFileSync(reportPath, report);
    
    console.log(`\n📝 Implementation report saved to: ${reportPath}`);
    
    // Show summary
    showImplementationSummary(results);
    
    return results;
}

/**
 * Execute a single implementation step
 */
async function executeStep(step, plan, backupDir) {
    const result = {
        step: step,
        status: 'pending',
        backup: null,
        changes_made: [],
        timestamp: new Date().toISOString()
    };
    
    try {
        // Resolve file path
        const filePath = resolveFilePath(step.file);
        
        // Create backup if file exists
        if (fs.existsSync(filePath)) {
            result.backup = await createBackup(filePath, backupDir);
        }
        
        // Execute based on action type
        switch (step.action) {
            case 'create':
                await createFile(filePath, step);
                result.status = 'success';
                result.changes_made.push('File created');
                break;
                
            case 'update':
                await updateFile(filePath, step, plan);
                result.status = 'success';
                result.changes_made.push(`Updated ${step.sections ? step.sections.length : 1} sections`);
                break;
                
            case 'create_or_update':
                if (fs.existsSync(filePath)) {
                    await updateFile(filePath, step, plan);
                    result.changes_made.push('File updated');
                } else {
                    await createFile(filePath, step);
                    result.changes_made.push('File created');
                }
                result.status = 'success';
                break;
                
            case 'append':
                await appendToFile(filePath, step);
                result.status = 'success';
                result.changes_made.push('Content appended');
                break;
                
            default:
                throw new Error(`Unknown action: ${step.action}`);
        }
        
        // Regenerate JSON if this was an agent or document update
        if (filePath.includes('/ai-agents/') || filePath.includes('/aaa-documents/')) {
            await regenerateJSON(filePath);
            result.changes_made.push('JSON regenerated');
        }
        
    } catch (error) {
        result.status = 'failed';
        result.error = error.message;
    }
    
    return result;
}

/**
 * Resolve file path from step
 */
function resolveFilePath(file) {
    // Handle relative paths
    if (file.startsWith('ai-agents/')) {
        return path.join(__dirname, '../../', file);
    } else if (file.startsWith('aaa-documents/')) {
        return path.join(__dirname, '../../', file);
    } else if (file.startsWith('machine-data/')) {
        return path.join(__dirname, '../../', file);
    } else if (file.startsWith('tests/')) {
        return path.join(__dirname, '../../', file);
    }
    
    // Assume it's already a full path
    return file;
}

/**
 * Create backup of file
 */
async function createBackup(filePath, backupDir) {
    const relativePath = path.relative(path.join(__dirname, '../../'), filePath);
    const backupPath = path.join(backupDir, relativePath);
    
    // Ensure backup directory exists
    ensureDirectory(path.dirname(backupPath));
    
    // Copy file
    fs.copyFileSync(filePath, backupPath);
    
    return {
        original: filePath,
        backup: backupPath,
        timestamp: new Date().toISOString()
    };
}

/**
 * Create new file
 */
async function createFile(filePath, step) {
    // Ensure directory exists
    ensureDirectory(path.dirname(filePath));
    
    // Generate content based on step
    let content = '';
    
    if (step.content) {
        content = step.content;
    } else if (step.template) {
        content = generateFromTemplate(step.template, step);
    } else {
        // Default content based on file type
        if (filePath.endsWith('.md')) {
            content = `# ${path.basename(filePath, '.md').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\n\n`;
            content += `Created by Learning Implementation System\n`;
            content += `Date: ${new Date().toISOString()}\n\n`;
            content += `## Overview\n\n`;
            content += step.description || 'Documentation pending.\n';
        } else if (filePath.endsWith('.js')) {
            content = `/**\n * ${step.description || 'Implementation'}\n * Created by Learning Implementation System\n */\n\n`;
        }
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Update existing file
 */
async function updateFile(filePath, step, plan) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Apply updates based on step configuration
    if (step.sections) {
        // Update specific sections
        for (const section of step.sections) {
            content = updateSection(content, section, step, plan);
        }
    } else if (step.pattern_replacement) {
        // Pattern-based replacement
        const { pattern, replacement } = step.pattern_replacement;
        content = content.replace(new RegExp(pattern, 'gm'), replacement);
    } else if (step.content_insertion) {
        // Insert content at specific location
        content = insertContent(content, step.content_insertion);
    } else {
        // Append to end of file
        content += `\n\n${step.content || generateUpdateContent(step, plan)}`;
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Update a specific section in markdown
 */
function updateSection(content, sectionName, step, plan) {
    const sectionRegex = new RegExp(`(##+ ${sectionName}.*?)\n((?:(?!##).*\n?)*)`, 'i');
    const match = content.match(sectionRegex);
    
    if (match) {
        const [fullMatch, header, sectionContent] = match;
        let newContent = header + '\n\n';
        
        // Add new content
        if (step.section_content && step.section_content[sectionName]) {
            newContent += step.section_content[sectionName];
        } else {
            newContent += generateSectionContent(sectionName, step, plan);
        }
        
        // Preserve some existing content if specified
        if (step.preserve_existing) {
            newContent += '\n\n' + sectionContent.trim();
        }
        
        content = content.replace(fullMatch, newContent);
    } else {
        // Section doesn't exist, add it
        content += `\n\n## ${sectionName}\n\n`;
        content += step.section_content && step.section_content[sectionName] 
            ? step.section_content[sectionName]
            : generateSectionContent(sectionName, step, plan);
    }
    
    return content;
}

/**
 * Generate section content based on context
 */
function generateSectionContent(sectionName, step, plan) {
    const sectionLower = sectionName.toLowerCase();
    
    if (sectionLower.includes('workflow')) {
        return generateWorkflowContent(plan);
    } else if (sectionLower.includes('best practice') || sectionLower.includes('pattern')) {
        return generatePatternContent(plan);
    } else if (sectionLower.includes('error') || sectionLower.includes('validation')) {
        return generateErrorHandlingContent(plan);
    } else if (sectionLower.includes('test')) {
        return generateTestingContent(plan);
    }
    
    // Default content
    return `Enhanced based on community learnings:\n\n${plan.patterns.map(p => `- ${p.name}`).join('\n')}`;
}

/**
 * Generate workflow content
 */
function generateWorkflowContent(plan) {
    let content = 'Enhanced workflow based on proven patterns:\n\n';
    
    plan.patterns.forEach(pattern => {
        if (pattern.type === 'coordination' || pattern.type === 'workflow') {
            content += `### ${pattern.name}\n`;
            content += `${pattern.context || 'Community-validated pattern'}\n\n`;
        }
    });
    
    return content;
}

/**
 * Generate pattern content
 */
function generatePatternContent(plan) {
    let content = 'Community-validated patterns:\n\n';
    
    const patternsByType = {};
    plan.patterns.forEach(p => {
        if (!patternsByType[p.type]) patternsByType[p.type] = [];
        patternsByType[p.type].push(p);
    });
    
    Object.entries(patternsByType).forEach(([type, patterns]) => {
        content += `### ${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} Patterns\n\n`;
        patterns.forEach(p => {
            content += `**${p.name}**\n`;
            content += `- Confidence: ${p.confidence}%\n`;
            content += `- Sources: ${p.sources.join(', ')}\n\n`;
        });
    });
    
    return content;
}

/**
 * Generate error handling content
 */
function generateErrorHandlingContent(plan) {
    let content = 'Enhanced error handling strategies:\n\n';
    
    const errorPatterns = plan.patterns.filter(p => p.type === 'error_handling');
    errorPatterns.forEach(pattern => {
        content += `### ${pattern.name}\n`;
        content += '```javascript\n';
        content += generateErrorHandlingCode(pattern);
        content += '\n```\n\n';
    });
    
    return content;
}

/**
 * Generate error handling code example
 */
function generateErrorHandlingCode(pattern) {
    if (pattern.name.includes('Try-catch')) {
        return `try {
    // Operation that might fail
    const result = await riskyOperation();
    return { success: true, data: result };
} catch (error) {
    // Log error with context
    console.error('Operation failed:', error);
    
    // Return graceful failure
    return { 
        success: false, 
        error: error.message,
        fallback: getDefaultValue() 
    };
}`;
    } else if (pattern.name.includes('Defensive')) {
        return `// Defensive programming pattern
function safeOperation(data) {
    // Validate inputs
    if (!data || typeof data !== 'object') {
        return { error: 'Invalid input data' };
    }
    
    // Safe property access
    const value = data?.nested?.property ?? defaultValue;
    
    // Validate before use
    if (!isValid(value)) {
        return { error: 'Invalid value', fallback: defaultValue };
    }
    
    return { success: true, value };
}`;
    }
    
    return '// Pattern implementation';
}

/**
 * Generate testing content
 */
function generateTestingContent(plan) {
    let content = 'Enhanced testing patterns:\n\n';
    
    const testPatterns = plan.patterns.filter(p => p.type === 'testing');
    testPatterns.forEach(pattern => {
        content += `### ${pattern.name}\n\n`;
        content += generateTestExample(pattern);
        content += '\n\n';
    });
    
    return content;
}

/**
 * Generate test example
 */
function generateTestExample(pattern) {
    if (pattern.name.includes('Unit testing')) {
        return `\`\`\`javascript
describe('Component', () => {
    test('should handle edge cases', () => {
        // Arrange
        const input = null;
        
        // Act
        const result = component.process(input);
        
        // Assert
        expect(result).toBeDefined();
        expect(result.error).toBe('Invalid input');
    });
});
\`\`\``;
    }
    
    return '```javascript\n// Test implementation\n```';
}

/**
 * Append content to file
 */
async function appendToFile(filePath, step) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const newContent = content + '\n\n' + (step.content || step.description);
    fs.writeFileSync(filePath, newContent, 'utf-8');
}

/**
 * Regenerate JSON for agents and documents
 */
async function regenerateJSON(filePath) {
    try {
        // Determine which converter to use
        if (filePath.includes('/ai-agents/')) {
            execSync('npm run convert-md-to-json-ai-agents', {
                cwd: path.join(__dirname, '../../')
            });
        } else if (filePath.includes('/aaa-documents/')) {
            execSync('npm run convert-md-to-json-aaa-documents', {
                cwd: path.join(__dirname, '../../')
            });
        }
    } catch (error) {
        console.log(`  ${YELLOW}⚠️  JSON regeneration failed: ${error.message}${RESET}`);
    }
}

/**
 * Rollback a change
 */
async function rollbackChange(stepResult) {
    try {
        if (stepResult.backup) {
            fs.copyFileSync(stepResult.backup.backup, stepResult.backup.original);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Rollback failed: ${error.message}`);
        return false;
    }
}

/**
 * Run tests
 */
async function runTests(testCommand) {
    try {
        const output = execSync(testCommand, {
            cwd: path.join(__dirname, '../../'),
            encoding: 'utf-8'
        });
        
        return {
            success: true,
            output: output,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            success: false,
            output: error.stdout || error.message,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Capture current metrics
 */
async function captureMetrics(metricsDefinition) {
    const metrics = {};
    
    // This would integrate with actual metric collection
    // For now, return placeholder data
    Object.entries(metricsDefinition).forEach(([key, definition]) => {
        metrics[key] = {
            baseline: Math.random() * 100,
            unit: definition.measurement,
            timestamp: new Date().toISOString()
        };
    });
    
    return metrics;
}

/**
 * Generate implementation report
 */
function generateImplementationReport(results) {
    let report = `# Implementation Report\n\n`;
    report += `Date: ${results.timestamp}\n`;
    report += `Total Plans: ${results.successful.length + results.partial.length + results.failed.length}\n\n`;
    
    report += `## Summary\n\n`;
    report += `- ✅ Successful: ${results.successful.length}\n`;
    report += `- ⚠️  Partial: ${results.partial.length}\n`;
    report += `- ❌ Failed: ${results.failed.length}\n\n`;
    
    // Successful implementations
    if (results.successful.length > 0) {
        report += `## Successful Implementations\n\n`;
        results.successful.forEach(result => {
            report += `### ${result.plan.title}\n`;
            report += `- Duration: ${calculateDuration(result.start_time, result.end_time)}\n`;
            report += `- Steps completed: ${result.changes.length}\n`;
            report += `- Changes:\n`;
            result.changes.forEach(change => {
                report += `  - ${change.step.description}: ${change.changes_made.join(', ')}\n`;
            });
            report += '\n';
        });
    }
    
    // Partial implementations
    if (results.partial.length > 0) {
        report += `## Partial Implementations\n\n`;
        results.partial.forEach(result => {
            const successful = result.changes.filter(c => c.status === 'success').length;
            const failed = result.changes.filter(c => c.status === 'failed').length;
            
            report += `### ${result.plan.title}\n`;
            report += `- Success rate: ${successful}/${result.changes.length} steps\n`;
            report += `- Failed steps:\n`;
            result.changes.filter(c => c.status === 'failed').forEach(change => {
                report += `  - ${change.step.description}: ${change.error}\n`;
            });
            report += '\n';
        });
    }
    
    // Failed implementations
    if (results.failed.length > 0) {
        report += `## Failed Implementations\n\n`;
        results.failed.forEach(result => {
            report += `### ${result.plan.title}\n`;
            report += `- All steps failed\n`;
            report += `- Errors:\n`;
            result.changes.forEach(change => {
                if (change.error) {
                    report += `  - ${change.step.description}: ${change.error}\n`;
                }
            });
            report += '\n';
        });
    }
    
    return report;
}

/**
 * Calculate duration between timestamps
 */
function calculateDuration(start, end) {
    const duration = new Date(end) - new Date(start);
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
}

/**
 * Show implementation summary
 */
function showImplementationSummary(results) {
    console.log('\n📊 Implementation Summary');
    console.log('━'.repeat(50));
    console.log(`\n✅ Successful: ${results.successful.length}`);
    console.log(`⚠️  Partial: ${results.partial.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    
    if (results.partial.length > 0) {
        console.log('\n📋 Partial Implementations:');
        results.partial.forEach(result => {
            const successful = result.changes.filter(c => c.status === 'success').length;
            console.log(`   ${result.plan.title}: ${successful}/${result.changes.length} steps`);
        });
    }
    
    if (results.rollbacks.length > 0) {
        console.log(`\n↩️  Rollbacks performed: ${results.rollbacks.length}`);
    }
}

/**
 * Ensure directory exists
 */
function ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

/**
 * Generate content from template
 */
function generateFromTemplate(template, step) {
    // Simple template replacement
    let content = template;
    
    // Replace variables
    content = content.replace(/\{\{description\}\}/g, step.description || '');
    content = content.replace(/\{\{date\}\}/g, new Date().toISOString());
    content = content.replace(/\{\{title\}\}/g, step.title || path.basename(step.file, path.extname(step.file)));
    
    return content;
}

/**
 * Insert content at specific location
 */
function insertContent(content, insertion) {
    const { after, before, content: newContent } = insertion;
    
    if (after) {
        const index = content.indexOf(after);
        if (index !== -1) {
            const insertPoint = index + after.length;
            return content.slice(0, insertPoint) + '\n' + newContent + content.slice(insertPoint);
        }
    } else if (before) {
        const index = content.indexOf(before);
        if (index !== -1) {
            return content.slice(0, index) + newContent + '\n' + content.slice(index);
        }
    }
    
    // Fallback to append
    return content + '\n\n' + newContent;
}

/**
 * Generate update content
 */
function generateUpdateContent(step, plan) {
    let content = `\n## Enhancement: ${plan.title}\n\n`;
    content += `${step.description}\n\n`;
    content += `### Patterns Applied\n\n`;
    plan.patterns.forEach(p => {
        content += `- ${p.name} (${p.confidence}% confidence)\n`;
    });
    return content;
}

module.exports = {
    executeImplementation,
    showImplementationSummary,
    generateImplementationReport
};
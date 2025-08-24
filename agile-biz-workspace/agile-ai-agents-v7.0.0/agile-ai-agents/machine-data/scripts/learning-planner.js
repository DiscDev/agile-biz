/**
 * Learning Planner Module
 * 
 * Creates actionable implementation plans from analyzed patterns
 * for the Learn From Contributions Workflow
 */

const fs = require('fs');
const path = require('path');

// Paths
const AI_AGENTS_DIR = path.join(__dirname, '../../ai-agents');
const MACHINE_DATA_DIR = path.join(__dirname, '..');
const AAA_DOCUMENTS_DIR = path.join(__dirname, '../../aaa-documents');

/**
 * Generate implementation plans from patterns
 * @param {Array} patterns - Analyzed patterns from contributions
 * @param {Object} state - Current workflow state
 * @returns {Array} Implementation plans
 */
function generateImplementationPlans(patterns, state) {
    const plans = [];
    
    // Group patterns by type
    const groupedPatterns = groupPatterns(patterns);
    
    // Generate plan for each pattern group
    for (const [type, patternGroup] of Object.entries(groupedPatterns)) {
        const plan = createPlan(type, patternGroup, state);
        if (plan) {
            plans.push(plan);
        }
    }
    
    // Sort by priority
    plans.sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
    
    return plans;
}

/**
 * Group patterns by type
 */
function groupPatterns(patterns) {
    const groups = {
        error_handling: [],
        performance: [],
        testing: [],
        deployment: [],
        coordination: [],
        documentation: [],
        security: [],
        other: []
    };
    
    patterns.forEach(pattern => {
        const type = detectPatternType(pattern);
        if (groups[type]) {
            groups[type].push(pattern);
        } else {
            groups.other.push(pattern);
        }
    });
    
    // Remove empty groups
    Object.keys(groups).forEach(key => {
        if (groups[key].length === 0) {
            delete groups[key];
        }
    });
    
    return groups;
}

/**
 * Detect pattern type from content
 */
function detectPatternType(pattern) {
    // Use pattern name and type if content is not available
    const content = (pattern.content || pattern.name || '').toLowerCase();
    const patternType = (pattern.type || '').toLowerCase();
    
    if (content.includes('error') || content.includes('exception') || content.includes('defensive') || patternType === 'error_handling') {
        return 'error_handling';
    }
    if (content.includes('performance') || content.includes('optimization') || content.includes('speed') || patternType === 'performance') {
        return 'performance';
    }
    if (content.includes('test') || content.includes('coverage') || content.includes('validation') || patternType === 'testing') {
        return 'testing';
    }
    if (content.includes('deploy') || content.includes('ci/cd') || content.includes('pipeline') || patternType === 'deployment') {
        return 'deployment';
    }
    if (content.includes('coordination') || content.includes('handoff') || content.includes('communication') || patternType === 'coordination') {
        return 'coordination';
    }
    if (content.includes('document') || content.includes('readme') || content.includes('guide') || patternType === 'documentation') {
        return 'documentation';
    }
    if (content.includes('security') || content.includes('auth') || content.includes('vulnerability') || patternType === 'security') {
        return 'security';
    }
    
    return 'other';
}

/**
 * Create implementation plan for a pattern group
 */
function createPlan(type, patterns, state) {
    const plan = {
        id: `plan-${Date.now()}-${type}`,
        type: type,
        title: generatePlanTitle(type, patterns),
        patterns: patterns,
        confidence: calculateConfidence(patterns),
        impact: estimateImpact(type, patterns),
        risk: assessRisk(type, patterns),
        affected_agents: identifyAffectedAgents(type, patterns),
        implementation_steps: generateImplementationSteps(type, patterns),
        code_changes: identifyCodeChanges(type, patterns),
        success_metrics: defineSuccessMetrics(type, patterns),
        rollback_strategy: defineRollbackStrategy(type),
        dependencies: identifyDependencies(type, patterns),
        estimated_effort: estimateEffort(type, patterns),
        created_at: new Date().toISOString()
    };
    
    return plan;
}

/**
 * Generate descriptive plan title
 */
function generatePlanTitle(type, patterns) {
    const titles = {
        error_handling: 'Enhanced Error Handling and Recovery',
        performance: 'Performance Optimization Strategy',
        testing: 'Comprehensive Testing Enhancement',
        deployment: 'Deployment Pipeline Improvements',
        coordination: 'Agent Coordination Optimization',
        documentation: 'Documentation Standards Update',
        security: 'Security Hardening Implementation',
        other: 'General System Improvements'
    };
    
    return titles[type] || 'System Enhancement';
}

/**
 * Calculate confidence score based on pattern frequency
 */
function calculateConfidence(patterns) {
    const occurrences = patterns.reduce((sum, p) => sum + (p.occurrences || 1), 0);
    const sources = new Set(patterns.map(p => p.source)).size;
    
    // Base confidence on occurrences and unique sources
    let confidence = Math.min(95, (occurrences * 10) + (sources * 15));
    
    // Adjust for pattern consistency
    if (patterns.every(p => p.validated)) {
        confidence = Math.min(99, confidence + 10);
    }
    
    return confidence;
}

/**
 * Estimate impact of implementing patterns
 */
function estimateImpact(type, patterns) {
    const impactScores = {
        error_handling: { efficiency: 35, reliability: 45, maintainability: 20 },
        performance: { efficiency: 50, reliability: 20, maintainability: 10 },
        testing: { efficiency: 20, reliability: 50, maintainability: 30 },
        deployment: { efficiency: 40, reliability: 30, maintainability: 20 },
        coordination: { efficiency: 45, reliability: 25, maintainability: 30 },
        documentation: { efficiency: 10, reliability: 10, maintainability: 50 },
        security: { efficiency: 10, reliability: 60, maintainability: 20 },
        other: { efficiency: 20, reliability: 20, maintainability: 20 }
    };
    
    const baseImpact = impactScores[type] || impactScores.other;
    
    // Adjust based on pattern count
    const multiplier = Math.min(1.5, 1 + (patterns.length * 0.1));
    
    return {
        efficiency: Math.round(baseImpact.efficiency * multiplier),
        reliability: Math.round(baseImpact.reliability * multiplier),
        maintainability: Math.round(baseImpact.maintainability * multiplier),
        overall: Math.round((baseImpact.efficiency + baseImpact.reliability + baseImpact.maintainability) * multiplier / 3)
    };
}

/**
 * Assess implementation risk
 */
function assessRisk(type, patterns) {
    const riskFactors = {
        error_handling: 'low',
        performance: 'medium',
        testing: 'low',
        deployment: 'medium',
        coordination: 'high',
        documentation: 'low',
        security: 'high',
        other: 'medium'
    };
    
    let risk = riskFactors[type] || 'medium';
    
    // Increase risk for complex patterns
    if (patterns.some(p => p.complexity === 'high')) {
        risk = risk === 'low' ? 'medium' : 'high';
    }
    
    // Decrease risk for well-tested patterns
    if (patterns.every(p => p.tested)) {
        risk = risk === 'high' ? 'medium' : 'low';
    }
    
    return risk;
}

/**
 * Identify which agents are affected by the pattern
 */
function identifyAffectedAgents(type, patterns) {
    const agentMap = {
        error_handling: ['coder_agent', 'testing_agent', 'devops_agent'],
        performance: ['coder_agent', 'optimization_agent', 'testing_agent'],
        testing: ['testing_agent', 'coder_agent', 'devops_agent'],
        deployment: ['devops_agent', 'testing_agent', 'project_manager_agent'],
        coordination: ['scrum_master_agent', 'project_manager_agent', 'all_agents'],
        documentation: ['documentator_agent', 'coder_agent', 'all_agents'],
        security: ['security_agent', 'coder_agent', 'devops_agent'],
        other: ['coder_agent', 'testing_agent']
    };
    
    const baseAgents = agentMap[type] || agentMap.other;
    
    // Add specific agents mentioned in patterns
    const mentionedAgents = new Set(baseAgents);
    patterns.forEach(pattern => {
        if (pattern.mentioned_agents) {
            pattern.mentioned_agents.forEach(agent => mentionedAgents.add(agent));
        }
    });
    
    return Array.from(mentionedAgents);
}

/**
 * Generate specific implementation steps
 */
function generateImplementationSteps(type, patterns) {
    const steps = [];
    
    // Type-specific steps
    switch (type) {
        case 'error_handling':
            steps.push({
                order: 1,
                description: 'Update error handling guide in aaa-documents',
                file: 'aaa-documents/error-handling-patterns.md',
                action: 'create_or_update'
            });
            steps.push({
                order: 2,
                description: 'Modify coder agent workflow to include defensive programming',
                file: 'ai-agents/coder_agent.md',
                action: 'update',
                sections: ['workflows', 'best_practices']
            });
            steps.push({
                order: 3,
                description: 'Add error boundary patterns to testing agent',
                file: 'ai-agents/testing_agent.md',
                action: 'update',
                sections: ['test_patterns']
            });
            break;
            
        case 'performance':
            steps.push({
                order: 1,
                description: 'Create performance optimization checklist',
                file: 'aaa-documents/performance-checklist.md',
                action: 'create'
            });
            steps.push({
                order: 2,
                description: 'Update optimization agent with new patterns',
                file: 'ai-agents/optimization_agent.md',
                action: 'update',
                sections: ['optimization_strategies']
            });
            break;
            
        case 'testing':
            steps.push({
                order: 1,
                description: 'Enhance testing guide with new patterns',
                file: 'tests/TESTING-GUIDE.md',
                action: 'update'
            });
            steps.push({
                order: 2,
                description: 'Update testing agent protocols',
                file: 'ai-agents/testing_agent.md',
                action: 'update',
                sections: ['protocols', 'patterns']
            });
            break;
            
        default:
            steps.push({
                order: 1,
                description: `Update relevant documentation for ${type}`,
                file: `aaa-documents/${type}-guide.md`,
                action: 'create_or_update'
            });
    }
    
    // Add pattern-specific steps
    patterns.forEach((pattern, index) => {
        if (pattern.specific_changes) {
            pattern.specific_changes.forEach((change, changeIndex) => {
                steps.push({
                    order: steps.length + 1,
                    description: change.description,
                    file: change.file,
                    action: change.action || 'update',
                    content_preview: change.content
                });
            });
        }
    });
    
    return steps;
}

/**
 * Identify specific code changes needed
 */
function identifyCodeChanges(type, patterns) {
    const changes = [];
    
    // Add handler updates if needed
    if (type === 'coordination' || type === 'error_handling') {
        changes.push({
            file: 'machine-data/scripts/coordination-enhancer.js',
            type: 'new_file',
            description: 'Add coordination enhancement utilities'
        });
    }
    
    // Add validation updates
    if (type === 'testing' || type === 'error_handling') {
        changes.push({
            file: 'machine-data/scripts/validation-enhanced.js',
            type: 'update',
            description: 'Enhance validation with new patterns'
        });
    }
    
    // Pattern-specific code changes
    patterns.forEach(pattern => {
        if (pattern.code_examples) {
            pattern.code_examples.forEach(example => {
                changes.push({
                    file: example.file || 'machine-data/scripts/pattern-implementation.js',
                    type: 'update',
                    description: example.description,
                    code_snippet: example.code
                });
            });
        }
    });
    
    return changes;
}

/**
 * Define success metrics for the implementation
 */
function defineSuccessMetrics(type, patterns) {
    const baseMetrics = {
        error_handling: {
            'console_errors': { target: '-75%', measurement: 'error_count' },
            'error_recovery_time': { target: '-50%', measurement: 'average_time' },
            'user_facing_errors': { target: '-60%', measurement: 'error_reports' }
        },
        performance: {
            'response_time': { target: '-40%', measurement: 'average_ms' },
            'token_usage': { target: '-25%', measurement: 'tokens_per_operation' },
            'throughput': { target: '+30%', measurement: 'operations_per_minute' }
        },
        testing: {
            'test_coverage': { target: '+20%', measurement: 'percentage' },
            'bug_detection': { target: '+40%', measurement: 'bugs_found' },
            'false_positives': { target: '-30%', measurement: 'count' }
        },
        deployment: {
            'deployment_time': { target: '-50%', measurement: 'minutes' },
            'rollback_frequency': { target: '-70%', measurement: 'count' },
            'deployment_success_rate': { target: '+95%', measurement: 'percentage' }
        },
        coordination: {
            'handoff_time': { target: '-60%', measurement: 'seconds' },
            'coordination_errors': { target: '-80%', measurement: 'count' },
            'agent_idle_time': { target: '-40%', measurement: 'percentage' }
        },
        documentation: {
            'documentation_coverage': { target: '+50%', measurement: 'percentage' },
            'clarity_score': { target: '+30%', measurement: 'readability_index' },
            'update_frequency': { target: '+100%', measurement: 'updates_per_month' }
        },
        security: {
            'vulnerabilities': { target: '-90%', measurement: 'count' },
            'security_incidents': { target: '-100%', measurement: 'count' },
            'compliance_score': { target: '+95%', measurement: 'percentage' }
        }
    };
    
    return baseMetrics[type] || {
        'improvement_metric': { target: '+25%', measurement: 'general_score' }
    };
}

/**
 * Define rollback strategy
 */
function defineRollbackStrategy(type) {
    return {
        trigger_conditions: [
            'Tests failing after implementation',
            'Performance degradation > 10%',
            'Error rate increase > 5%',
            'Agent coordination failures'
        ],
        rollback_steps: [
            'Restore original files from backup',
            'Revert JSON regeneration',
            'Clear agent caches',
            'Notify stakeholder of rollback'
        ],
        recovery_time: type === 'coordination' ? '5 minutes' : '2 minutes'
    };
}

/**
 * Identify dependencies
 */
function identifyDependencies(type, patterns) {
    const deps = [];
    
    // System dependencies
    if (type === 'testing') {
        deps.push({ type: 'system', name: 'jest', version: '>=29.0.0' });
    }
    
    // File dependencies
    patterns.forEach(pattern => {
        if (pattern.requires_files) {
            pattern.requires_files.forEach(file => {
                deps.push({ type: 'file', name: file, status: 'must_exist' });
            });
        }
    });
    
    // Order dependencies
    if (type === 'coordination') {
        deps.push({ 
            type: 'order', 
            name: 'Update orchestrator first',
            prerequisite: 'orchestrator-workflows.md'
        });
    }
    
    return deps;
}

/**
 * Estimate implementation effort
 */
function estimateEffort(type, patterns) {
    const baseEffort = {
        error_handling: 2,
        performance: 3,
        testing: 2,
        deployment: 3,
        coordination: 4,
        documentation: 1,
        security: 4,
        other: 2
    };
    
    let hours = baseEffort[type] || 2;
    
    // Adjust for pattern count
    hours += patterns.length * 0.5;
    
    // Adjust for complexity
    if (patterns.some(p => p.complexity === 'high')) {
        hours *= 1.5;
    }
    
    return {
        estimated_hours: Math.round(hours),
        confidence: hours < 4 ? 'high' : 'medium'
    };
}

/**
 * Get priority score for sorting
 */
function getPriorityScore(plan) {
    let score = 0;
    
    // Impact weight
    score += plan.impact.overall * 2;
    
    // Confidence weight
    score += plan.confidence;
    
    // Risk adjustment
    if (plan.risk === 'low') score += 20;
    if (plan.risk === 'high') score -= 20;
    
    // Effort adjustment
    if (plan.estimated_effort.estimated_hours <= 2) score += 10;
    if (plan.estimated_effort.estimated_hours > 4) score -= 10;
    
    return score;
}

/**
 * Format plan for display
 */
function formatPlanForDisplay(plan) {
    const output = [];
    
    output.push(`\n${'='.repeat(60)}`);
    output.push(`IMPLEMENTATION PLAN: ${plan.title}`);
    output.push(`${'='.repeat(60)}\n`);
    
    output.push(`📊 Overview:`);
    output.push(`   Type: ${plan.type}`);
    output.push(`   Confidence: ${plan.confidence}%`);
    output.push(`   Risk Level: ${plan.risk}`);
    output.push(`   Estimated Effort: ${plan.estimated_effort.estimated_hours} hours\n`);
    
    output.push(`📈 Expected Impact:`);
    output.push(`   Efficiency: +${plan.impact.efficiency}%`);
    output.push(`   Reliability: +${plan.impact.reliability}%`);
    output.push(`   Maintainability: +${plan.impact.maintainability}%`);
    output.push(`   Overall: +${plan.impact.overall}%\n`);
    
    output.push(`👥 Affected Agents: ${plan.affected_agents.join(', ')}\n`);
    
    output.push(`📋 Implementation Steps:`);
    plan.implementation_steps.forEach(step => {
        output.push(`   ${step.order}. ${step.description}`);
        output.push(`      File: ${step.file}`);
        output.push(`      Action: ${step.action}`);
    });
    
    output.push(`\n📊 Success Metrics:`);
    Object.entries(plan.success_metrics).forEach(([metric, details]) => {
        output.push(`   - ${metric}: ${details.target} (${details.measurement})`);
    });
    
    if (plan.dependencies.length > 0) {
        output.push(`\n⚠️  Dependencies:`);
        plan.dependencies.forEach(dep => {
            output.push(`   - ${dep.type}: ${dep.name}`);
        });
    }
    
    output.push(`\n🔄 Rollback Strategy:`);
    output.push(`   Recovery Time: ${plan.rollback_strategy.recovery_time}`);
    output.push(`   Triggers: ${plan.rollback_strategy.trigger_conditions[0]}`);
    
    return output.join('\n');
}

module.exports = {
    generateImplementationPlans,
    formatPlanForDisplay,
    calculateConfidence,
    estimateImpact,
    assessRisk
};
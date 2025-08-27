#!/usr/bin/env node

/**
 * YAML Validation Script for Claude Code Agents
 * Ensures all agents use the MANDATORY format only
 * 
 * AgileBiz™ - Created by Phillip Darren Brown (https://github.com/DiscDev)
 */

const REQUIRED_FIELDS = ['name', 'description', 'tools', 'model', 'token_count'];
const VALID_MODELS = ['opus', 'sonnet', 'haiku'];
const FORBIDDEN_FIELDS = [
    'agentName', 'agentRole', 'modelName', 'temperature',
    'provider', 'maxTokens', 'contextWindow', 'maxTokens',
    'apiKey', 'baseUrl', 'timeout', 'retries'
];

/**
 * Generate the CORRECT YAML template
 * This is the ONLY acceptable format
 */
function generateCorrectYAML(config = {}) {
    const defaults = {
        name: 'agent-name',
        description: 'Brief description of agent purpose and capabilities',
        tools: ['Read', 'Write', 'Edit', 'MultiEdit', 'Bash', 'Grep', 'Glob', 'LS'],
        model: 'sonnet',
        token_count: 1000
    };
    
    const agent = { ...defaults, ...config };
    
    return `---
name: ${agent.name}
description: ${agent.description}
tools: [${agent.tools.join(', ')}]
model: ${agent.model}
token_count: ${agent.token_count}
---`;
}

/**
 * Validate YAML structure
 */
function validateYAML(yamlContent) {
    const errors = [];
    const warnings = [];
    
    // Check for forbidden fields
    FORBIDDEN_FIELDS.forEach(field => {
        if (yamlContent.includes(`${field}:`)) {
            errors.push(`❌ FORBIDDEN FIELD DETECTED: '${field}' - NEVER use this field!`);
        }
    });
    
    // Check for required fields
    REQUIRED_FIELDS.forEach(field => {
        const regex = new RegExp(`^${field}:`, 'm');
        if (!regex.test(yamlContent)) {
            errors.push(`❌ MISSING REQUIRED FIELD: '${field}'`);
        }
    });
    
    // Check model value
    const modelMatch = yamlContent.match(/^model:\s*(.+)$/m);
    if (modelMatch) {
        const modelValue = modelMatch[1].trim();
        if (!VALID_MODELS.includes(modelValue)) {
            errors.push(`❌ INVALID MODEL VALUE: '${modelValue}' - Must be one of: ${VALID_MODELS.join(', ')}`);
        }
    }
    
    return { errors, warnings, isValid: errors.length === 0 };
}

/**
 * Example: Generate a test agent with CORRECT format
 */
function demonstrateCorrectFormat() {
    console.log('=' .repeat(60));
    console.log('MANDATORY YAML FORMAT - USE THIS AND ONLY THIS:');
    console.log('=' .repeat(60));
    
    const testAgent = generateCorrectYAML({
        name: 'test-agent',
        description: 'Example agent demonstrating the correct YAML format',
        model: 'sonnet',
        token_count: 2500
    });
    
    console.log(testAgent);
    console.log('\n✅ This is the ONLY acceptable format for agent YAML frontmatter');
    console.log('=' .repeat(60));
}

// Run demonstration
demonstrateCorrectFormat();

// Export for use in agent creation
module.exports = {
    generateCorrectYAML,
    validateYAML,
    REQUIRED_FIELDS,
    VALID_MODELS,
    FORBIDDEN_FIELDS
};

/**
 * AgileBiz™ - Created by Phillip Darren Brown (https://github.com/DiscDev)
 */
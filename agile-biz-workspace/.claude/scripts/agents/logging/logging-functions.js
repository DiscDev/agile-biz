#!/usr/bin/env node

/**
 * Agent Logging Functions - Executable JavaScript
 * Core logging functions for Claude Code agent activity tracking
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration paths
const CONFIG_FILE = '.claude/configs/logging-config.json';
const LOG_FILE = '.claude/logs/agents/agents.json';
const ERROR_LOG_FILE = '.claude/logs/errors/error.log';

/**
 * Log error to error.log file
 * @param {string} agentId - Agent identifier
 * @param {string} level - Error level (ERROR, WARN, INFO)
 * @param {string} message - Error message
 */
function logError(agentId, level, message) {
    try {
        const timestamp = new Date().toISOString();
        const logEntry = `${timestamp} [${level}] Agent ${agentId}: ${message}\n`;
        fs.appendFileSync(ERROR_LOG_FILE, logEntry);
    } catch (error) {
        // If we can't log errors, just continue silently to avoid blocking agents
        console.error('Failed to write to error log:', error.message);
    }
}

/**
 * Check if logging is enabled via configuration
 * @returns {boolean} true if logging is enabled
 */
function isLoggingEnabled() {
    try {
        if (!fs.existsSync(CONFIG_FILE)) {
            logError('system', 'WARN', 'Logging config file missing, defaulting to enabled');
            return true; // Default to enabled
        }
        
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        return config.logging_enabled !== false;
    } catch (error) {
        logError('system', 'ERROR', `Error reading logging config: ${error.message}`);
        return true; // Default to enabled on error
    }
}

/**
 * Generate unique agent ID with timestamp
 * @param {string} agentType - Type of agent
 * @returns {string} Unique agent ID
 */
function generateAgentId(agentType) {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${agentType}_${timestamp}_${random}`;
}

/**
 * Read token count from YAML frontmatter in context file
 * @param {string} filepath - Path to context markdown file
 * @returns {number} Token count from YAML frontmatter
 */
function readTokenCount(filepath) {
    try {
        if (!fs.existsSync(filepath)) {
            return 0;
        }
        
        const content = fs.readFileSync(filepath, 'utf8');
        
        // Parse YAML frontmatter
        const yamlMatch = content.match(/^---\n(.*?)\n---/s);
        if (yamlMatch) {
            const yamlData = yaml.load(yamlMatch[1]);
            return yamlData.token_count || 0;
        }
        
        // Fallback: try to find HTML comment format for backwards compatibility
        const htmlMatch = content.match(/<!-- TOKEN_COUNT: (\d+) -->/);
        if (htmlMatch) {
            return parseInt(htmlMatch[1], 10);
        }
        
        return 0;
    } catch (error) {
        console.error(`Error reading token count from ${filepath}:`, error.message);
        return 0;
    }
}

/**
 * Initialize log file if it doesn't exist
 */
function initializeLogFile() {
    if (!fs.existsSync(LOG_FILE)) {
        // Ensure directory exists
        const logDir = path.dirname(LOG_FILE);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        // Create empty log array
        fs.writeFileSync(LOG_FILE, '[]', 'utf8');
    }
}

/**
 * Append event to log file
 * @param {Object} event - Event object to log
 */
function appendToLog(event) {
    try {
        initializeLogFile();
        
        // Read current log
        const currentLog = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
        
        // Add new event
        currentLog.push(event);
        
        // Write back to file
        fs.writeFileSync(LOG_FILE, JSON.stringify(currentLog, null, 2), 'utf8');
    } catch (error) {
        const agentId = event.agent_id || 'unknown';
        logError(agentId, 'ERROR', `Failed to write to log file: ${error.message}`);
    }
}

/**
 * Parse Claude Code hook data from user request string
 * @param {string} userRequest - Raw user request string (may be JSON)
 * @returns {Object} Parsed request data
 */
function parseUserRequest(userRequest) {
    try {
        // Try to parse as JSON (Claude Code hook format)
        const parsed = JSON.parse(userRequest);
        return {
            session_id: parsed.session_id || null,
            transcript_path: parsed.transcript_path || null,
            working_directory: parsed.cwd || null,
            hook_event: parsed.hook_event_name || null,
            user_prompt: parsed.prompt || userRequest,
            raw_data: parsed
        };
    } catch (error) {
        // Fallback for plain text requests
        return {
            session_id: null,
            transcript_path: null,
            working_directory: null,
            hook_event: null,
            user_prompt: userRequest,
            raw_data: null
        };
    }
}

/**
 * Log agent spawn event
 * @param {string} agentType - Type of agent
 * @param {string} spawnedBy - Who spawned this agent
 * @param {string} spawnReason - Reason for spawning
 * @param {string} userRequest - Original user request
 * @returns {string} Generated agent ID
 */
function logAgentSpawn(agentType, spawnedBy, spawnReason, userRequest) {
    if (!isLoggingEnabled()) {
        return generateAgentId(agentType); // Still return ID even if not logging
    }
    
    const agentId = generateAgentId(agentType);
    const timestamp = new Date().toISOString();
    const requestData = parseUserRequest(userRequest);
    
    const event = {
        timestamp,
        event_type: 'agent_spawn',
        agent_id: agentId,
        agent_type: agentType,
        spawned_by: spawnedBy,
        spawn_reason: spawnReason,
        session_info: {
            session_id: requestData.session_id,
            transcript_path: requestData.transcript_path,
            working_directory: requestData.working_directory,
            hook_event: requestData.hook_event
        },
        user_request: {
            prompt: requestData.user_prompt,
            raw_input: requestData.raw_data ? userRequest : null
        }
    };
    
    appendToLog(event);
    return agentId;
}

/**
 * Log sub-agent spawn event
 * @param {string} agentType - Type of sub-agent
 * @param {string} spawnedBy - Parent agent ID
 * @param {string} spawnReason - Reason for spawning sub-agent
 * @returns {string} Generated agent ID
 */
function logSubAgentSpawn(agentType, spawnedBy, spawnReason) {
    if (!isLoggingEnabled()) {
        return generateAgentId(agentType);
    }
    
    const agentId = generateAgentId(agentType);
    const timestamp = new Date().toISOString();
    
    const event = {
        timestamp,
        event_type: 'sub_agent_spawn',
        agent_id: agentId,
        agent_type: agentType,
        spawned_by: spawnedBy,
        spawn_reason: spawnReason
    };
    
    appendToLog(event);
    return agentId;
}

/**
 * Determine which contexts would be loaded based on keywords
 * @param {string} agentType - Type of agent
 * @param {Array<string>} keywords - Keywords detected
 * @returns {Array<Object>} Array of context objects with file, tokens, reason
 */
function determineContextsToLoad(agentType, keywords) {
    const contexts = [];
    
    // Always load the main agent definition file first
    const agentPath = `.claude/agents/${agentType}.md`;
    if (fs.existsSync(agentPath)) {
        contexts.push({
            file: `${agentType}.md`,
            tokens: readTokenCount(agentPath),
            reason: 'agent_definition'
        });
    }
    
    // Always load core principles
    const corePath = `.claude/agents/agent-tools/${agentType}/core-principles.md`;
    if (fs.existsSync(corePath)) {
        contexts.push({
            file: 'core-principles.md',
            tokens: readTokenCount(corePath),
            reason: 'always_loaded'
        });
    }
    
    // Check shared tools based on keywords
    const sharedToolMappings = {
        docker: 'docker-containerization.md',
        container: 'docker-containerization.md',
        containerize: 'docker-containerization.md',
        aws: 'aws-infrastructure.md',
        cloud: 'aws-infrastructure.md',
        infrastructure: 'aws-infrastructure.md',
        github: 'github-mcp-integration.md',
        git: 'github-mcp-integration.md',
        repository: 'github-mcp-integration.md',
        supabase: 'supabase-mcp-integration.md',
        database: 'supabase-mcp-integration.md',
        auth: 'supabase-mcp-integration.md'
    };
    
    const loadedSharedTools = new Set();
    
    keywords.forEach(keyword => {
        const tool = sharedToolMappings[keyword.toLowerCase()];
        if (tool && !loadedSharedTools.has(tool)) {
            const toolPath = `.claude/agents/shared-tools/${tool}`;
            if (fs.existsSync(toolPath)) {
                contexts.push({
                    file: `shared-tools/${tool}`,
                    tokens: readTokenCount(toolPath),
                    reason: 'keyword_match',
                    keywords: [keyword]
                });
                loadedSharedTools.add(tool);
            }
        }
    });
    
    // Load agent-specific contexts based on keywords
    const agentContextMappings = {
        developer: {
            code: 'code-quality-standards.md',
            quality: 'code-quality-standards.md',
            refactor: 'code-quality-standards.md',
            html: 'development-workflows.md',
            implement: 'development-workflows.md',
            create: 'development-workflows.md'
        },
        devops: {
            kubernetes: 'container-orchestration.md',
            k8s: 'container-orchestration.md',
            monitoring: 'monitoring-observability.md',
            security: 'security-compliance.md',
            pipeline: 'cicd-pipeline-management.md',
            deploy: 'cicd-pipeline-management.md'
        }
    };
    
    const agentMappings = agentContextMappings[agentType] || {};
    const loadedContexts = new Set();
    
    keywords.forEach(keyword => {
        const contextFile = agentMappings[keyword.toLowerCase()];
        if (contextFile && !loadedContexts.has(contextFile)) {
            const contextPath = `.claude/agents/agent-tools/${agentType}/${contextFile}`;
            if (fs.existsSync(contextPath)) {
                contexts.push({
                    file: contextFile,
                    tokens: readTokenCount(contextPath),
                    reason: 'keyword_match',
                    keywords: [keyword]
                });
                loadedContexts.add(contextFile);
            }
        }
    });
    
    return contexts;
}

/**
 * Log context loading event
 * @param {string} agentId - Agent ID
 * @param {string} agentType - Type of agent
 * @param {Array<string>} keywordsDetected - Keywords that triggered context loading
 */
function logContextLoading(agentId, agentType, keywordsDetected) {
    if (!isLoggingEnabled()) {
        return;
    }
    
    const timestamp = new Date().toISOString();
    const contextsLoaded = determineContextsToLoad(agentType, keywordsDetected);
    const totalTokens = contextsLoaded.reduce((sum, context) => sum + context.tokens, 0);
    
    const event = {
        timestamp,
        event_type: 'context_loading',
        agent_id: agentId,
        keywords_detected: keywordsDetected,
        contexts_loaded: contextsLoaded,
        total_tokens: totalTokens
    };
    
    appendToLog(event);
}

/**
 * Extract keywords from user prompt for agent context determination
 * @param {string} userPrompt - User's prompt text (may be JSON)
 * @param {string} agentType - Type of agent being spawned
 * @returns {Array<string>} Array of relevant keywords
 */
function extractKeywords(userPrompt, agentType) {
    // Parse the prompt to get the actual user text
    const requestData = parseUserRequest(userPrompt);
    const prompt = requestData.user_prompt.toLowerCase();
    const keywords = [];
    
    // Common keywords
    const keywordPatterns = [
        'html', 'css', 'javascript', 'react', 'node',
        'docker', 'container', 'containerize',
        'aws', 'cloud', 'infrastructure',
        'github', 'git', 'repository',
        'kubernetes', 'k8s', 'deploy',
        'code', 'implement', 'create', 'build',
        'database', 'auth', 'authentication',
        'monitoring', 'security', 'pipeline'
    ];
    
    keywordPatterns.forEach(keyword => {
        if (prompt.includes(keyword)) {
            keywords.push(keyword);
        }
    });
    
    return keywords;
}

// CLI interface when run directly
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'spawn':
            {
                const [, agentType, spawnedBy, spawnReason, userRequest] = args;
                const agentId = logAgentSpawn(agentType, spawnedBy, spawnReason, userRequest);
                console.log(agentId);
            }
            break;
            
        case 'context':
            {
                const [, agentId, agentType, ...keywordsArray] = args;
                logContextLoading(agentId, agentType, keywordsArray);
                console.log('Context loading logged');
            }
            break;
            
        case 'full-log':
            {
                const [, agentType, userRequest] = args;
                const keywords = extractKeywords(userRequest, agentType);
                const agentId = logAgentSpawn(agentType, 'claude_code', 'user_request', userRequest);
                logContextLoading(agentId, agentType, keywords);
                console.log(`Logged agent spawn and context loading for ${agentType}`);
            }
            break;
            
        case 'check-config':
            console.log('Logging enabled:', isLoggingEnabled());
            break;
            
        default:
            console.log('Usage: node logging-functions.js <command> [args...]');
            console.log('Commands:');
            console.log('  spawn <agentType> <spawnedBy> <spawnReason> <userRequest>');
            console.log('  context <agentId> <agentType> <keywords...>');
            console.log('  full-log <agentType> <userRequest>');
            console.log('  check-config');
    }
}

// Export functions for use in other modules
module.exports = {
    isLoggingEnabled,
    generateAgentId,
    readTokenCount,
    logAgentSpawn,
    logSubAgentSpawn,
    logContextLoading,
    extractKeywords,
    determineContextsToLoad
};

/**
 * Check if shared agent logging tool is available
 * @returns {boolean} true if shared tool exists
 */
function isSharedToolAvailable() {
    const sharedToolPath = '.claude/agents/shared-tools/agent-spawn-logging.md';
    const exists = fs.existsSync(sharedToolPath);
    if (!exists) {
        logError('system', 'ERROR', 'agent-spawn-logging.md shared tool not found');
    }
    return exists;
}

// Export functions for use in other modules (updated)
module.exports = {
    isLoggingEnabled,
    isSharedToolAvailable,
    generateAgentId,
    readTokenCount,
    logAgentSpawn,
    logSubAgentSpawn,
    logContextLoading,
    extractKeywords,
    determineContextsToLoad,
    logError
};

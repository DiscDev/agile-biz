// Preserved validation logic from old create-agent system
// Used by conversational workflow for agent name validation and input sanitization

class AgentNameValidator {
    constructor() {
        this.synonymMap = this.loadSynonymMap();
        this.existingAgents = [];
    }
    
    loadExistingAgents() {
        const fs = require('fs');
        const path = require('path');
        const agentsDir = path.join(process.cwd(), '.claude/agents');
        
        if (!fs.existsSync(agentsDir)) {
            return [];
        }
        
        const files = fs.readdirSync(agentsDir)
            .filter(file => file.endsWith('.md') && !file.includes('template'))
            .map(file => file.replace('.md', ''));
            
        this.existingAgents = files;
        return files;
    }
    
    loadSynonymMap() {
        return {
            // Weather/Climate domain
            weather: ["meteorology", "climate", "forecast", "atmospheric", "precipitation"],
            climate: ["weather", "meteorology", "environmental", "atmospheric"],
            forecast: ["weather", "prediction", "outlook", "projection"],
            
            // Development domain  
            development: ["coding", "programming", "software", "engineering", "dev"],
            developer: ["programmer", "coder", "engineer", "dev", "software"],
            programming: ["coding", "development", "software", "engineering"],
            
            // Music/Audio domain
            music: ["audio", "sound", "composition", "melody", "harmony", "song"],
            audio: ["music", "sound", "acoustic", "recording", "production"],
            composition: ["music", "songwriting", "arrangement", "creation"],
            
            // Data domain
            data: ["database", "analytics", "information", "dataset", "storage"],
            database: ["data", "storage", "repository", "db", "records"],
            analytics: ["data", "analysis", "metrics", "statistics", "insights"],
            
            // Infrastructure domain
            infrastructure: ["devops", "deployment", "hosting", "server", "cloud"],
            devops: ["infrastructure", "deployment", "operations", "automation"],
            deployment: ["devops", "infrastructure", "release", "distribution"],
            
            // AI/ML domain
            ai: ["artificial-intelligence", "machine-learning", "ml", "intelligent"],
            ml: ["machine-learning", "ai", "artificial-intelligence", "learning"],
            
            // Content domain
            content: ["text", "writing", "documentation", "copy", "material"],
            writing: ["content", "text", "documentation", "authoring", "composition"],
            
            // Admin/Management domain
            admin: ["administration", "management", "control", "governance"],
            management: ["admin", "administration", "control", "oversight"],
            
            // Helper/Assistant domain
            helper: ["assistant", "aid", "support", "utility", "tool"],
            assistant: ["helper", "aid", "support", "companion", "guide"]
        };
    }
    
    checkNameConflict(proposedName) {
        this.loadExistingAgents();
        
        // Check exact match
        if (this.existingAgents.includes(proposedName)) {
            return {
                hasConflict: true,
                type: 'exact_match',
                conflictingAgent: proposedName,
                message: `An agent named '${proposedName}' already exists.`,
                suggestion: `Choose a different name or modify the existing '${proposedName}' agent.`
            };
        }
        
        // Check synonym conflicts
        const synonymConflict = this.checkSynonymConflict(proposedName);
        if (synonymConflict.hasConflict) {
            return synonymConflict;
        }
        
        return {
            hasConflict: false,
            isValid: true,
            message: `Agent name '${proposedName}' is available.`
        };
    }
    
    checkSynonymConflict(proposedName) {
        const proposedWords = proposedName.toLowerCase().split(/[-_\s]+/);
        
        for (const existingAgent of this.existingAgents) {
            const existingWords = existingAgent.toLowerCase().split(/[-_\s]+/);
            
            // Check if any word in proposed name has synonyms with existing agent
            for (const proposedWord of proposedWords) {
                for (const existingWord of existingWords) {
                    if (this.areSynonyms(proposedWord, existingWord)) {
                        return {
                            hasConflict: true,
                            type: 'synonym_conflict',
                            conflictingAgent: existingAgent,
                            message: `An agent with similar functionality already exists: '${existingAgent}'.`,
                            suggestion: `Would you like to add capabilities to the existing '${existingAgent}' agent instead?`
                        };
                    }
                }
            }
        }
        
        return { hasConflict: false };
    }
    
    areSynonyms(word1, word2) {
        if (word1 === word2) return true;
        
        // Check if word1 is in word2's synonym list
        if (this.synonymMap[word1] && this.synonymMap[word1].includes(word2)) {
            return true;
        }
        
        // Check if word2 is in word1's synonym list
        if (this.synonymMap[word2] && this.synonymMap[word2].includes(word1)) {
            return true;
        }
        
        return false;
    }
}

class InputSanitizer {
    static sanitizeAgentName(name) {
        return name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\-_]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    
    static sanitizePurpose(purpose) {
        return purpose
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s\-.,!?()]/g, '')
            .slice(0, 200);
    }
    
    static sanitizeKeywords(keywords) {
        if (typeof keywords === 'string') {
            keywords = keywords.split(/[,\s]+/);
        }
        
        return keywords
            .map(keyword => keyword.trim().toLowerCase())
            .filter(keyword => /^[a-z0-9\-_]+$/.test(keyword))
            .filter(keyword => keyword.length >= 2 && keyword.length <= 20)
            .slice(0, 15);
    }
}

module.exports = { AgentNameValidator, InputSanitizer };
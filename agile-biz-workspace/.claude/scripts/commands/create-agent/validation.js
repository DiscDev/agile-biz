const fs = require('fs');
const path = require('path');

class AgentNameValidator {
    constructor() {
        this.synonymMap = this.loadSynonymMap();
        this.existingAgents = [];
    }
    
    loadExistingAgents() {
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
        
        // Check semantic similarity
        const semanticConflict = this.checkSemanticSimilarity(proposedName);
        if (semanticConflict.hasConflict) {
            return semanticConflict;
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
    
    checkSemanticSimilarity(proposedName) {
        const proposedWords = proposedName.toLowerCase().split(/[-_\s]+/);
        
        for (const existingAgent of this.existingAgents) {
            const existingWords = existingAgent.toLowerCase().split(/[-_\s]+/);
            const similarity = this.calculateWordSimilarity(proposedWords, existingWords);
            
            if (similarity > 0.7) {
                return {
                    hasConflict: true,
                    type: 'semantic_similarity',
                    conflictingAgent: existingAgent,
                    similarity: similarity,
                    message: `Agent name is very similar to existing agent: '${existingAgent}'.`,
                    suggestion: `Consider choosing a more distinct name or enhancing the existing agent.`
                };
            }
        }
        
        return { hasConflict: false };
    }
    
    calculateWordSimilarity(words1, words2) {
        const set1 = new Set(words1);
        const set2 = new Set(words2);
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return intersection.size / union.size;
    }
}

class PurposeValidator {
    static validatePurpose(purpose) {
        const trimmedPurpose = purpose.trim();
        
        // Check if too vague
        if (this.isTooVague(trimmedPurpose)) {
            return {
                isValid: false,
                type: 'too_vague',
                message: `The purpose "${trimmedPurpose}" is too vague.`,
                feedback: `Please be more specific about what the agent should do. For example:
- Instead of "help with weather" → "Analyze weather patterns and provide forecasting guidance"
- Instead of "music assistance" → "Compose melodies and provide music theory guidance"
- Instead of "development help" → "Generate code and provide software architecture advice"`
            };
        }
        
        // Check if too specific/narrow
        if (this.isTooSpecific(trimmedPurpose)) {
            return {
                isValid: false,
                type: 'too_specific',
                message: `The purpose "${trimmedPurpose}" might be too specific.`,
                feedback: `Consider broadening the scope to make the agent more useful. For example:
- Instead of "Convert CSV files to JSON" → "Process and transform data between various formats"
- Instead of "Check React component syntax" → "Analyze and improve React application code quality"
- Instead of "Forecast tomorrow's temperature" → "Analyze weather patterns and provide forecasting guidance"`
            };
        }
        
        // Check for clarity and completeness
        const clarityIssues = this.checkClarity(trimmedPurpose);
        if (clarityIssues.length > 0) {
            return {
                isValid: false,
                type: 'clarity_issues',
                message: `The purpose has some clarity issues.`,
                feedback: `Please address these issues:\n${clarityIssues.map(issue => `- ${issue}`).join('\n')}`
            };
        }
        
        return {
            isValid: true,
            message: `Purpose is clear and well-defined.`,
            purpose: trimmedPurpose
        };
    }
    
    static isTooVague(purpose) {
        const vaguePatterns = [
            /^help\s+(with|for)?/i,
            /^assist\s+(with|in)?/i,
            /^support/i,
            /^handle/i,
            /^manage/i,
            /^work\s+with/i,
            /^do\s+\w+\s+stuff/i,
            /^general\s+\w+/i
        ];
        
        const vagueWords = ['help', 'assist', 'support', 'handle', 'manage', 'stuff', 'things', 'various', 'general', 'basic'];
        const words = purpose.toLowerCase().split(/\s+/);
        const vagueWordCount = words.filter(word => vagueWords.includes(word)).length;
        
        return vaguePatterns.some(pattern => pattern.test(purpose)) || 
               (vagueWordCount / words.length) > 0.5 ||
               words.length < 4;
    }
    
    static isTooSpecific(purpose) {
        const specificPatterns = [
            /convert\s+\w+\s+to\s+\w+$/i,
            /check\s+\w+\s+syntax$/i,
            /validate\s+\w+\s+format$/i,
            /parse\s+\w+\s+files?$/i,
            /generate\s+\w+\s+reports?$/i,
            /\b(only|just|specifically|exclusively)\b/i
        ];
        
        const overlySpecificWords = ['only', 'just', 'specifically', 'exclusively', 'solely', 'merely'];
        const words = purpose.toLowerCase().split(/\s+/);
        
        return specificPatterns.some(pattern => pattern.test(purpose)) ||
               overlySpecificWords.some(word => words.includes(word)) ||
               (words.length > 15 && purpose.includes(' and ') && purpose.split(' and ').length > 3);
    }
    
    static checkClarity(purpose) {
        const issues = [];
        
        const actionVerbs = ['analyze', 'process', 'generate', 'create', 'provide', 'manage', 'monitor', 'optimize', 'transform', 'interpret'];
        const hasActionVerb = actionVerbs.some(verb => purpose.toLowerCase().includes(verb));
        
        if (!hasActionVerb) {
            issues.push('Add a clear action verb (analyze, process, generate, create, provide, etc.)');
        }
        
        if (/\b(it|this|that|they|them)\b/i.test(purpose) && !/\b(weather|data|code|music|content)\b/i.test(purpose)) {
            issues.push('Avoid unclear pronouns - specify what "it", "this", or "that" refers to');
        }
        
        const domainWords = ['weather', 'music', 'code', 'data', 'content', 'image', 'text', 'audio', 'video', 'document'];
        const hasDomainContext = domainWords.some(domain => purpose.toLowerCase().includes(domain));
        
        if (!hasDomainContext && purpose.length > 10) {
            issues.push('Include the domain or type of content the agent works with');
        }
        
        return issues;
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
    
    static sanitizeResponsibilities(responsibilities) {
        return responsibilities
            .map(resp => resp.trim())
            .filter(resp => resp.length > 0)
            .map(resp => resp.replace(/^[-*•]\s*/, ''))
            .slice(0, 10);
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

module.exports = { AgentNameValidator, PurposeValidator, InputSanitizer };
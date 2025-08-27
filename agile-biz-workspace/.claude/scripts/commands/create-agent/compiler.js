const { InputSanitizer } = require('./validation.js');

class SpecificationCompiler {
    constructor(workflowAnswers) {
        this.answers = workflowAnswers;
        this.specification = {};
        this.errors = [];
    }
    
    compile() {
        try {
            this.specification = {
                action: "create-agent-from-specification",
                specification: {
                    name: this.compileName(),
                    purpose: this.compilePurpose(),
                    model: this.compileModel(),
                    shared_tools: this.compileSharedTools(),
                    core_responsibilities: this.compileResponsibilities(),
                    boundaries: this.compileBoundaries(),
                    keywords: this.compileKeywords(),
                    specialized_tools: this.compileSpecializedTools(),
                    context_files_needed: this.determineContextFilesNeeded(),
                    creation_metadata: this.compileMetadata()
                }
            };
            
            this.validateSpecification();
            
            return {
                success: true,
                specification: this.specification,
                errors: this.errors
            };
            
        } catch (error) {
            return {
                success: false,
                specification: null,
                errors: [...this.errors, error.message]
            };
        }
    }
    
    compileName() {
        const name = this.answers.get('name');
        if (!name) throw new Error('Agent name is required');
        
        return InputSanitizer.sanitizeAgentName(name);
    }
    
    compilePurpose() {
        const purpose = this.answers.get('purpose');
        if (!purpose) throw new Error('Agent purpose is required');
        
        return purpose.trim().replace(/[.!?]*$/, '') + '.';
    }
    
    compileModel() {
        const modelChoice = this.answers.get('model');
        const modelMap = {
            '1': 'haiku',
            '2': 'sonnet', 
            '3': 'opus'
        };
        
        if (!modelChoice || !modelMap[modelChoice]) {
            throw new Error('Valid model selection is required');
        }
        
        return modelMap[modelChoice];
    }
    
    compileSharedTools() {
        const toolsInput = this.answers.get('sharedTools') || 'recommended';
        
        const toolMap = {
            '1': 'context7-mcp-integration',
            '2': 'github-mcp-integration',
            '3': 'git-version-control', 
            '4': 'supabase-mcp-integration',
            '5': 'aws-infrastructure'
        };
        
        if (toolsInput === 'recommended' || toolsInput === '1') {
            return ['context7-mcp-integration'];
        }
        
        const selectedTools = toolsInput.split(',')
            .map(t => t.trim())
            .filter(t => toolMap[t])
            .map(t => toolMap[t]);
            
        if (selectedTools.length === 0) {
            selectedTools.push('context7-mcp-integration');
        }
        
        return [...new Set(selectedTools)];
    }
    
    compileResponsibilities() {
        const responsibilities = this.answers.get('responsibilities');
        if (!responsibilities || !Array.isArray(responsibilities)) {
            throw new Error('Core responsibilities are required');
        }
        
        return InputSanitizer.sanitizeResponsibilities(responsibilities)
            .map(resp => {
                const cleaned = resp.replace(/^[-*•]\s*/, '').trim();
                return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
            });
    }
    
    compileBoundaries() {
        const boundaries = this.answers.get('boundaries');
        if (!boundaries || boundaries.trim().length === 0) {
            return null;
        }
        
        let cleaned = boundaries.trim();
        if (!cleaned.startsWith('Not') && !cleaned.startsWith('Does not') && !cleaned.startsWith('Cannot')) {
            cleaned = 'Not for ' + cleaned.toLowerCase();
        }
        
        return cleaned;
    }
    
    compileKeywords() {
        let keywords = this.answers.get('keywords') || [];
        
        if (typeof keywords === 'string') {
            keywords = keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
        }
        
        if (keywords.length === 0) {
            keywords = this.generateKeywordsFromContent();
        }
        
        return InputSanitizer.sanitizeKeywords(keywords);
    }
    
    compileSpecializedTools() {
        const tools = this.answers.get('specializedTools');
        if (!tools || tools.trim().toLowerCase() === 'none') {
            return null;
        }
        
        return tools.trim();
    }
    
    determineContextFilesNeeded() {
        const hasSpecializedTools = this.compileSpecializedTools() !== null;
        const hasMultipleResponsibilities = this.compileResponsibilities().length > 3;
        const hasComplexKeywords = this.compileKeywords().length > 5;
        
        return hasSpecializedTools || hasMultipleResponsibilities || hasComplexKeywords;
    }
    
    compileMetadata() {
        return {
            created_via: "create-agent-command",
            timestamp: new Date().toISOString(),
            workflow_version: "1.0.0",
            user_session_id: this.generateSessionId()
        };
    }
    
    generateKeywordsFromContent() {
        const name = this.answers.get('name') || '';
        const purpose = this.answers.get('purpose') || '';
        const responsibilities = this.answers.get('responsibilities') || [];
        
        const nameWords = name.split(/[-_\s]+/).filter(w => w.length > 2);
        
        const purposeWords = purpose.toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 3)
            .filter(w => !this.isStopWord(w))
            .slice(0, 3);
        
        const respWords = responsibilities.slice(0, 2)
            .join(' ').toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 4)
            .filter(w => !this.isStopWord(w))
            .slice(0, 3);
        
        return [...new Set([...nameWords, ...purposeWords, ...respWords])];
    }
    
    isStopWord(word) {
        const stopWords = [
            'this', 'that', 'with', 'from', 'they', 'them', 'will', 'would', 'should',
            'provide', 'handle', 'manage', 'process', 'analyze', 'create', 'generate',
            'help', 'assist', 'support', 'enable', 'allow', 'make', 'give', 'take'
        ];
        return stopWords.includes(word.toLowerCase());
    }
    
    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    validateSpecification() {
        const spec = this.specification.specification;
        
        const requiredFields = ['name', 'purpose', 'model', 'shared_tools', 'core_responsibilities', 'keywords'];
        for (const field of requiredFields) {
            if (!spec[field]) {
                this.errors.push(`Missing required field: ${field}`);
            }
        }
        
        if (spec.shared_tools && !Array.isArray(spec.shared_tools)) {
            this.errors.push('shared_tools must be an array');
        }
        
        if (spec.core_responsibilities && !Array.isArray(spec.core_responsibilities)) {
            this.errors.push('core_responsibilities must be an array');
        }
        
        if (spec.keywords && !Array.isArray(spec.keywords)) {
            this.errors.push('keywords must be an array');
        }
        
        if (spec.core_responsibilities && spec.core_responsibilities.length === 0) {
            this.errors.push('At least one core responsibility is required');
        }
        
        if (spec.keywords && spec.keywords.length === 0) {
            this.errors.push('At least one keyword is required');
        }
        
        if (spec.name && !/^[a-z0-9\-_]+$/.test(spec.name)) {
            this.errors.push('Agent name contains invalid characters');
        }
        
        if (spec.model && !['haiku', 'sonnet', 'opus'].includes(spec.model)) {
            this.errors.push('Invalid model selection');
        }
    }
}

module.exports = { SpecificationCompiler };
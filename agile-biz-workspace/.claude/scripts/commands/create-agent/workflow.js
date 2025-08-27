const { AgentNameValidator, PurposeValidator, InputSanitizer } = require('./validation.js');

class WorkflowManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 9; // Removed navigation step for simplicity
        this.userAnswers = new Map();
        this.validationResults = new Map();
    }
    
    async start(rl) {
        console.log('📋 Interactive Agent Creation Workflow\n');
        
        while (this.currentStep <= this.totalSteps) {
            const result = await this.executeCurrentStep(rl);
            
            if (result.goBack) {
                this.goBack();
            } else if (result.complete) {
                break;
            } else {
                this.currentStep++;
            }
        }
        
        console.log('\n✅ Agent workflow completed successfully!');
    }
    
    async executeCurrentStep(rl) {
        const progress = this.getProgressString();
        
        switch (this.currentStep) {
            case 1: return await this.stepBasicInfo(rl);
            case 2: return await this.stepCoreResponsibilities(rl);
            case 3: return await this.stepAgentBoundaries(rl);
            case 4: return await this.stepModelSelection(rl);
            case 5: return await this.stepSharedTools(rl);
            case 6: return await this.stepKeywords(rl);
            case 7: return await this.stepSpecializedTools(rl);
            case 8: return await this.stepFinalReview(rl);
            case 9: return { complete: true };
            default: return { complete: true };
        }
    }
    
    async stepBasicInfo(rl) {
        console.log(`${this.getProgressString()} Basic Agent Information\n`);
        
        // Get agent name
        if (!this.userAnswers.has('name')) {
            const name = await this.askQuestion(rl, 
                "What would you like to name your agent?\nExample: weather-helper\n\nAgent name: ");
            
            if (!name || name.trim().length === 0) {
                console.log('❌ Agent name is required.\n');
                return { retry: true };
            }
            
            const sanitizedName = InputSanitizer.sanitizeAgentName(name);
            this.userAnswers.set('name', sanitizedName);
        }
        
        // Validate name
        if (!this.validationResults.has('name')) {
            const validator = new AgentNameValidator();
            const nameValidation = validator.checkNameConflict(this.userAnswers.get('name'));
            this.validationResults.set('name', nameValidation);
            
            if (nameValidation.hasConflict) {
                console.log(`⚠️  ${nameValidation.message}\n${nameValidation.suggestion}\n`);
                const choice = await this.askQuestion(rl, 
                    "Would you like to:\n1. Choose a different name\n2. Continue anyway\n\nYour choice (1/2): ");
                
                if (choice === '1') {
                    this.userAnswers.delete('name');
                    this.validationResults.delete('name');
                    return { retry: true };
                }
            } else {
                console.log(`✅ ${nameValidation.message}\n`);
            }
        }
        
        // Get purpose
        if (!this.userAnswers.has('purpose')) {
            const purpose = await this.askQuestion(rl, 
                `What is the primary purpose of '${this.userAnswers.get('name')}'?\n(One clear sentence describing what it does)\n\nPurpose: `);
            
            if (!purpose || purpose.trim().length === 0) {
                console.log('❌ Agent purpose is required.\n');
                return { retry: true };
            }
            
            const sanitizedPurpose = InputSanitizer.sanitizePurpose(purpose);
            this.userAnswers.set('purpose', sanitizedPurpose);
        }
        
        // Validate purpose
        if (!this.validationResults.has('purpose')) {
            const purposeValidation = PurposeValidator.validatePurpose(this.userAnswers.get('purpose'));
            this.validationResults.set('purpose', purposeValidation);
            
            if (!purposeValidation.isValid) {
                console.log(`❌ ${purposeValidation.message}\n\n${purposeValidation.feedback}\n`);
                const refined = await this.askQuestion(rl, "Please provide a refined purpose: ");
                
                if (refined && refined.trim().length > 0) {
                    this.userAnswers.set('purpose', InputSanitizer.sanitizePurpose(refined));
                    this.validationResults.delete('purpose');
                    return { retry: true };
                }
            } else {
                console.log(`✅ ${purposeValidation.message}\n`);
            }
        }
        
        return { continue: true };
    }
    
    async stepCoreResponsibilities(rl) {
        console.log(`${this.getProgressString()} Core Responsibilities\n`);
        
        if (!this.userAnswers.has('responsibilities')) {
            console.log(`What are the main responsibilities for '${this.userAnswers.get('name')}'?`);
            console.log("Enter one responsibility per line. Press Enter on empty line when done.\n");
            
            const responsibilities = [];
            let lineNum = 1;
            
            while (true) {
                const resp = await this.askQuestion(rl, `${lineNum}. `);
                if (!resp || resp.trim().length === 0) break;
                
                responsibilities.push(resp.trim());
                lineNum++;
                
                if (responsibilities.length >= 10) {
                    console.log("Maximum of 10 responsibilities reached.\n");
                    break;
                }
            }
            
            if (responsibilities.length === 0) {
                console.log("❌ At least one responsibility is required.\n");
                return { retry: true };
            }
            
            this.userAnswers.set('responsibilities', InputSanitizer.sanitizeResponsibilities(responsibilities));
            console.log(`✅ Added ${responsibilities.length} responsibilities.\n`);
        }
        
        return { continue: true };
    }
    
    async stepAgentBoundaries(rl) {
        console.log(`${this.getProgressString()} Agent Boundaries\n`);
        
        if (!this.userAnswers.has('boundaries')) {
            const boundaries = await this.askQuestion(rl, 
                `To ensure clear scope, what should '${this.userAnswers.get('name')}' NOT handle?\n\nExample: 'Not for real-time weather alerts or emergency response'\n\nBoundaries (or press Enter to skip): `);
            
            this.userAnswers.set('boundaries', boundaries && boundaries.trim().length > 0 ? boundaries.trim() : null);
            console.log(boundaries ? '✅ Boundaries set.\n' : '✅ No boundaries specified.\n');
        }
        
        return { continue: true };
    }
    
    async stepModelSelection(rl) {
        console.log(`${this.getProgressString()} Model Selection\n`);
        
        if (!this.userAnswers.has('model')) {
            const model = await this.askQuestion(rl, 
                `Select the Claude model for '${this.userAnswers.get('name')}':\n\n1. Haiku - Fast, simple tasks, cost-effective\n2. Sonnet - Balanced performance and cost (recommended)\n3. Opus - Complex reasoning, highest capability\n\nYour choice (1/2/3): `);
            
            if (!['1', '2', '3'].includes(model)) {
                console.log('❌ Please select 1, 2, or 3.\n');
                return { retry: true };
            }
            
            this.userAnswers.set('model', model);
            const modelNames = { '1': 'Haiku', '2': 'Sonnet', '3': 'Opus' };
            console.log(`✅ Selected Claude ${modelNames[model]}.\n`);
        }
        
        return { continue: true };
    }
    
    async stepSharedTools(rl) {
        console.log(`${this.getProgressString()} Shared Tools Selection\n`);
        
        if (!this.userAnswers.has('sharedTools')) {
            const tools = await this.askQuestion(rl, 
                `Which shared tools should '${this.userAnswers.get('name')}' have access to?\n\n✓ Context7 MCP - API access, documentation (recommended)\n☐ GitHub MCP - Code repositories, PRs\n☐ Git - Version control\n☐ Supabase MCP - Database, backend services\n☐ AWS Infrastructure - Cloud services\n\nType numbers (e.g., '1,3,5') or 'recommended' for Context7 only: `);
            
            this.userAnswers.set('sharedTools', tools || 'recommended');
            console.log('✅ Shared tools configured.\n');
        }
        
        return { continue: true };
    }
    
    async stepKeywords(rl) {
        console.log(`${this.getProgressString()} Keywords Generation\n`);
        
        if (!this.userAnswers.has('keywords')) {
            const autoKeywords = this.generateKeywords();
            
            console.log(`Auto-generated keywords: ${autoKeywords.join(', ')}\n`);
            const additional = await this.askQuestion(rl, 
                "Add any additional keywords (comma-separated, or press Enter to continue): ");
            
            let finalKeywords = [...autoKeywords];
            if (additional && additional.trim().length > 0) {
                const additionalKeywords = InputSanitizer.sanitizeKeywords(additional.split(','));
                finalKeywords = [...finalKeywords, ...additionalKeywords];
            }
            
            this.userAnswers.set('keywords', finalKeywords.slice(0, 15));
            console.log(`✅ Keywords set: ${finalKeywords.join(', ')}\n`);
        }
        
        return { continue: true };
    }
    
    async stepSpecializedTools(rl) {
        console.log(`${this.getProgressString()} Specialized Tools\n`);
        
        if (!this.userAnswers.has('specializedTools')) {
            const tools = await this.askQuestion(rl, 
                `Does '${this.userAnswers.get('name')}' need specialized tools/APIs?\n\nExamples:\n- Weather APIs (NOAA, OpenWeatherMap)\n- Specialized databases\n- External webhooks\n- Domain-specific tools\n\nDescribe specialized tools (or type 'none'): `);
            
            this.userAnswers.set('specializedTools', tools && tools.toLowerCase() !== 'none' ? tools : null);
            console.log(tools && tools.toLowerCase() !== 'none' ? '✅ Specialized tools noted.\n' : '✅ No specialized tools.\n');
        }
        
        return { continue: true };
    }
    
    async stepFinalReview(rl) {
        console.log(`${this.getProgressString()} Final Review\n`);
        
        console.log('📋 Agent Configuration Summary:\n');
        console.log(`Name: ${this.userAnswers.get('name')}`);
        console.log(`Purpose: ${this.userAnswers.get('purpose')}`);
        console.log(`Model: ${this.getModelName()}`);
        console.log(`Shared Tools: ${this.getSharedToolsList()}`);
        console.log(`Core Responsibilities:`);
        this.userAnswers.get('responsibilities').forEach(resp => console.log(`  • ${resp}`));
        console.log(`Boundaries: ${this.userAnswers.get('boundaries') || 'None specified'}`);
        console.log(`Keywords: ${this.userAnswers.get('keywords').join(', ')}`);
        console.log(`Specialized Tools: ${this.userAnswers.get('specializedTools') || 'None'}\n`);
        
        const confirm = await this.askQuestion(rl, 'Create this agent? (yes/no): ');
        
        if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
            console.log('✅ Configuration approved!\n');
            return { continue: true };
        } else {
            console.log('❌ Agent creation cancelled.\n');
            process.exit(0);
        }
    }
    
    // Helper methods
    async askQuestion(rl, question) {
        return new Promise((resolve) => {
            rl.question(question, resolve);
        });
    }
    
    generateKeywords() {
        const name = this.userAnswers.get('name') || '';
        const purpose = this.userAnswers.get('purpose') || '';
        
        const nameWords = name.split(/[-_\s]+/).filter(w => w.length > 2);
        const purposeWords = purpose.toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 3)
            .filter(w => !['this', 'that', 'with', 'from', 'they', 'them', 'will', 'would', 'should'].includes(w))
            .slice(0, 5);
        
        return [...new Set([...nameWords, ...purposeWords])];
    }
    
    getModelName() {
        const modelMap = { '1': 'Claude Haiku', '2': 'Claude Sonnet', '3': 'Claude Opus' };
        return modelMap[this.userAnswers.get('model')] || 'Not selected';
    }
    
    getSharedToolsList() {
        const tools = this.userAnswers.get('sharedTools') || '';
        const toolMap = {
            '1': 'Context7 MCP',
            '2': 'GitHub MCP',
            '3': 'Git',
            '4': 'Supabase MCP',
            '5': 'AWS Infrastructure'
        };
        
        if (tools === 'recommended' || tools === '1') return 'Context7 MCP';
        
        return tools.split(',')
            .map(t => toolMap[t.trim()])
            .filter(Boolean)
            .join(', ') || 'None';
    }
    
    getProgressString() {
        const percentage = Math.round((this.currentStep / this.totalSteps) * 100);
        return `[${this.currentStep}/${this.totalSteps} - ${percentage}%]`;
    }
    
    goBack() {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }
}

module.exports = { WorkflowManager };
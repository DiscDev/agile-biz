/**
 * Stakeholder Prompt Validator
 * 
 * Validates and scores stakeholder prompt files based on the quality rubric
 */

const fs = require('fs').promises;
const path = require('path');

class PromptValidator {
    constructor() {
        this.requiredSections = {
            'new': [
                'Project Vision',
                'Boundaries - What This Is NOT',
                'Target Users',
                'Success Metrics',
                'Technical Preferences',
                'Business Model',
                'Constraints & Risks',
                'Competition & Differentiation'
            ],
            'existing': [
                'Current State Assessment',
                'Enhancement Goals',
                'What Must NOT Change',
                'Current Users & Usage',
                'Technical Current State',
                'Enhancement Scope',
                'Constraints & Risks',
                'Success Metrics'
            ]
        };

        this.scoringWeights = {
            visionClarity: 20,
            boundaries: 25,
            userDefinition: 20,
            successMetrics: 20,
            technicalClarity: 15
        };
    }

    /**
     * Main validation method
     */
    async validatePromptFile(filePath, projectType = 'new') {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const validation = {
                score: 0,
                maxScore: 100,
                sections: {},
                missing: [],
                feedback: [],
                quality: '',
                bonusPoints: 0,
                recommendations: []
            };

            // Parse sections
            const sections = this.parseSections(content);
            
            // Check required sections
            this.checkRequiredSections(sections, projectType, validation);
            
            // Score each category
            validation.score += this.scoreVisionClarity(sections, validation);
            validation.score += this.scoreBoundaries(sections, validation);
            validation.score += this.scoreUserDefinition(sections, validation);
            validation.score += this.scoreSuccessMetrics(sections, validation);
            validation.score += this.scoreTechnicalClarity(sections, validation);
            
            // Check for bonus points
            validation.bonusPoints = this.calculateBonusPoints(sections);
            validation.score += validation.bonusPoints;
            
            // Determine quality level
            validation.quality = this.determineQualityLevel(validation.score);
            
            // Generate recommendations
            this.generateRecommendations(validation);
            
            return validation;
        } catch (error) {
            throw new Error(`Failed to validate prompt file: ${error.message}`);
        }
    }

    /**
     * Parse markdown content into sections
     */
    parseSections(content) {
        const sections = {};
        const lines = content.split('\n');
        let currentSection = null;
        let currentContent = [];
        
        for (const line of lines) {
            if (line.startsWith('## ')) {
                if (currentSection) {
                    sections[currentSection] = currentContent.join('\n').trim();
                }
                currentSection = line.replace('## ', '').replace('*', '').trim();
                currentContent = [];
            } else if (currentSection) {
                currentContent.push(line);
            }
        }
        
        if (currentSection) {
            sections[currentSection] = currentContent.join('\n').trim();
        }
        
        return sections;
    }

    /**
     * Check for required sections
     */
    checkRequiredSections(sections, projectType, validation) {
        const required = this.requiredSections[projectType] || this.requiredSections['new'];
        
        for (const section of required) {
            const sectionKey = Object.keys(sections).find(key => 
                key.toLowerCase().includes(section.toLowerCase().split(' ')[0])
            );
            
            if (!sectionKey || !sections[sectionKey].trim()) {
                validation.missing.push(section);
                validation.feedback.push(`Missing required section: ${section}`);
            }
        }
    }

    /**
     * Score Vision Clarity (20 points)
     */
    scoreVisionClarity(sections, validation) {
        let score = 0;
        const visionSection = sections['Project Vision'] || sections['Current State Assessment'] || '';
        
        // Check for one-sentence description (10 points)
        const oneSentenceMatch = visionSection.match(/what (are we building|is this project)\?[^]*?\n(.+)/i);
        if (oneSentenceMatch && oneSentenceMatch[2]) {
            const description = oneSentenceMatch[2].trim();
            const sentenceCount = description.split(/[.!?]+/).filter(s => s.trim()).length;
            
            if (sentenceCount === 1 && description.length > 20 && description.length < 200) {
                score += 10;
                validation.sections.visionDescription = { score: 10, max: 10, quality: 'excellent' };
            } else if (sentenceCount <= 2) {
                score += 7;
                validation.sections.visionDescription = { score: 7, max: 10, quality: 'good' };
            } else {
                score += 4;
                validation.sections.visionDescription = { score: 4, max: 10, quality: 'needs improvement' };
            }
        }
        
        // Check for problem statement (10 points)
        const problemMatch = visionSection.match(/problem[^]*?solve[^]*?\n(.+)/i);
        if (problemMatch && problemMatch[1]) {
            const problem = problemMatch[1].trim();
            const hasMetrics = /\d+%|\d+ (hours|days|weeks|dollars)/.test(problem);
            
            if (hasMetrics && problem.length > 50) {
                score += 10;
                validation.sections.problemStatement = { score: 10, max: 10, quality: 'excellent' };
            } else if (problem.length > 30) {
                score += 7;
                validation.sections.problemStatement = { score: 7, max: 10, quality: 'good' };
            } else {
                score += 4;
                validation.sections.problemStatement = { score: 4, max: 10, quality: 'vague' };
            }
        }
        
        return score;
    }

    /**
     * Score Boundaries - NOT THIS (25 points)
     */
    scoreBoundaries(sections, validation) {
        let score = 0;
        const boundariesSection = sections['Boundaries - What This Is NOT'] || 
                                 sections['What Must NOT Change'] || '';
        
        // Count NOT items
        const notItems = boundariesSection.match(/^[-*]\s*(not|this is not|will not|cannot|must not).+/gmi) || [];
        
        // Quantity score (10 points)
        if (notItems.length >= 7) {
            score += 10;
            validation.sections.boundariesQuantity = { score: 10, max: 10, count: notItems.length };
        } else if (notItems.length >= 5) {
            score += 7;
            validation.sections.boundariesQuantity = { score: 7, max: 10, count: notItems.length };
        } else if (notItems.length >= 3) {
            score += 4;
            validation.sections.boundariesQuantity = { score: 4, max: 10, count: notItems.length };
        }
        
        // Specificity score (15 points)
        let specificCount = 0;
        for (const item of notItems) {
            // Check for specific terms vs vague ones
            if (!/not (everything|everyone|complicated|hard|difficult|bad)/.test(item.toLowerCase()) &&
                item.length > 20) {
                specificCount++;
            }
        }
        
        const specificityRatio = notItems.length > 0 ? specificCount / notItems.length : 0;
        if (specificityRatio >= 0.8) {
            score += 15;
            validation.sections.boundariesSpecificity = { score: 15, max: 15, quality: 'excellent' };
        } else if (specificityRatio >= 0.6) {
            score += 10;
            validation.sections.boundariesSpecificity = { score: 10, max: 15, quality: 'good' };
        } else if (specificityRatio >= 0.4) {
            score += 5;
            validation.sections.boundariesSpecificity = { score: 5, max: 15, quality: 'needs improvement' };
        }
        
        if (notItems.length < 5) {
            validation.feedback.push(`Add ${5 - notItems.length} more NOT THIS items for better project focus`);
        }
        
        return score;
    }

    /**
     * Score User Definition (20 points)
     */
    scoreUserDefinition(sections, validation) {
        let score = 0;
        const userSection = sections['Target Users'] || sections['Current Users & Usage'] || '';
        
        // Check persona detail (10 points)
        const hasPersonaName = /name\/title.*:.*\w+/i.test(userSection);
        const hasDemographics = /demographics|age|location/i.test(userSection);
        const hasGoals = /goals.*:.*\w+/i.test(userSection);
        const hasPainPoints = /pain points.*:.*\w+/i.test(userSection);
        const hasDayInLife = /day in.*life|usage|workflow/i.test(userSection);
        
        const personaElements = [hasPersonaName, hasDemographics, hasGoals, hasPainPoints, hasDayInLife];
        const personaScore = personaElements.filter(Boolean).length * 2;
        
        score += Math.min(personaScore, 10);
        validation.sections.userPersona = { 
            score: Math.min(personaScore, 10), 
            max: 10, 
            elements: personaElements.filter(Boolean).length 
        };
        
        // Check problem-user fit (10 points)
        const problemsSolved = userSection.match(/problems.*solving|pain points/i);
        if (problemsSolved && userSection.length > 200) {
            score += 10;
            validation.sections.problemUserFit = { score: 10, max: 10, quality: 'clear' };
        } else if (userSection.length > 100) {
            score += 7;
            validation.sections.problemUserFit = { score: 7, max: 10, quality: 'adequate' };
        } else {
            score += 4;
            validation.sections.problemUserFit = { score: 4, max: 10, quality: 'weak' };
        }
        
        return score;
    }

    /**
     * Score Success Metrics (20 points)
     */
    scoreSuccessMetrics(sections, validation) {
        let score = 0;
        const metricsSection = sections['Success Metrics'] || '';
        
        // Check measurability (10 points)
        const metrics = metricsSection.match(/\d+%|\$[\d,]+|\d+\s*(users|customers|hours|days|seconds)/gi) || [];
        
        if (metrics.length >= 5) {
            score += 10;
            validation.sections.measurableMetrics = { score: 10, max: 10, count: metrics.length };
        } else if (metrics.length >= 3) {
            score += 7;
            validation.sections.measurableMetrics = { score: 7, max: 10, count: metrics.length };
        } else if (metrics.length >= 1) {
            score += 4;
            validation.sections.measurableMetrics = { score: 4, max: 10, count: metrics.length };
        }
        
        // Check time-bound goals (10 points)
        const timeframes = metricsSection.match(/\d+\s*(days|weeks|months|quarters|years)|within\s*\d+|by\s*(Q\d|january|february|march|april|may|june|july|august|september|october|november|december)/gi) || [];
        
        if (timeframes.length >= 3) {
            score += 10;
            validation.sections.timeBoundGoals = { score: 10, max: 10, count: timeframes.length };
        } else if (timeframes.length >= 2) {
            score += 7;
            validation.sections.timeBoundGoals = { score: 7, max: 10, count: timeframes.length };
        } else if (timeframes.length >= 1) {
            score += 4;
            validation.sections.timeBoundGoals = { score: 4, max: 10, count: timeframes.length };
        }
        
        if (metrics.length < 3) {
            validation.feedback.push('Add more specific, measurable metrics');
        }
        
        return score;
    }

    /**
     * Score Technical Clarity (15 points)
     */
    scoreTechnicalClarity(sections, validation) {
        let score = 0;
        const techSection = sections['Technical Preferences'] || sections['Technical Current State'] || '';
        
        // Check requirements definition (8 points)
        const hasTechStack = /frontend|backend|database|hosting/i.test(techSection);
        const hasPerformance = /performance|load time|concurrent|latency/i.test(techSection);
        const hasSecurity = /security|authentication|encryption|compliance/i.test(techSection);
        
        const techElements = [hasTechStack, hasPerformance, hasSecurity].filter(Boolean).length;
        score += Math.min(techElements * 2.5, 8);
        
        validation.sections.technicalRequirements = { 
            score: Math.min(techElements * 2.5, 8), 
            max: 8, 
            elements: techElements 
        };
        
        // Check integrations and constraints (7 points)
        const hasIntegrations = /integrate|integration|api|connect/i.test(techSection);
        const hasConstraints = /constraint|cannot|must not|limitation/i.test(techSection);
        
        if (hasIntegrations && hasConstraints) {
            score += 7;
            validation.sections.integrationsConstraints = { score: 7, max: 7, quality: 'complete' };
        } else if (hasIntegrations || hasConstraints) {
            score += 5;
            validation.sections.integrationsConstraints = { score: 5, max: 7, quality: 'partial' };
        } else {
            score += 2;
            validation.sections.integrationsConstraints = { score: 2, max: 7, quality: 'minimal' };
        }
        
        return score;
    }

    /**
     * Calculate bonus points
     */
    calculateBonusPoints(sections) {
        let bonus = 0;
        
        // Competitive analysis (+3)
        const competitionSection = sections['Competition & Differentiation'] || '';
        if (/competitor.*what they do well.*where they fall short/is.test(competitionSection)) {
            bonus += 3;
        }
        
        // Risk mitigation (+3)
        const risksSection = sections['Constraints & Risks'] || '';
        if (/risk.*mitigation|mitigat/i.test(risksSection) && risksSection.length > 200) {
            bonus += 3;
        }
        
        // Visual materials (+2)
        const additionalSection = sections['Additional Context'] || '';
        if (/mockups|diagrams|designs|wireframes/i.test(additionalSection)) {
            bonus += 2;
        }
        
        // Team alignment (+2)
        const projectInfo = sections['Project Information'] || '';
        if (/prepared by.*,.*,/i.test(projectInfo)) {
            bonus += 2;
        }
        
        return Math.min(bonus, 10); // Cap at 10 bonus points
    }

    /**
     * Determine quality level based on score
     */
    determineQualityLevel(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 50) return 'Adequate';
        return 'Needs Work';
    }

    /**
     * Generate recommendations based on scoring
     */
    generateRecommendations(validation) {
        const recs = validation.recommendations;
        
        // Check each section score
        if (validation.sections.visionDescription?.score < 7) {
            recs.push('Refine your one-sentence project description to be more specific');
        }
        
        if (validation.sections.boundariesQuantity?.count < 5) {
            recs.push('Add more NOT THIS items to better define project boundaries');
        }
        
        if (validation.sections.measurableMetrics?.count < 3) {
            recs.push('Include more measurable success metrics with specific numbers');
        }
        
        if (validation.sections.userPersona?.elements < 4) {
            recs.push('Expand user persona with demographics, goals, and usage scenarios');
        }
        
        if (validation.missing.length > 0) {
            recs.push(`Complete missing sections: ${validation.missing.join(', ')}`);
        }
        
        // Add quality-specific recommendations
        if (validation.quality === 'Needs Work') {
            recs.unshift('Consider reviewing the example prompts before proceeding');
        } else if (validation.quality === 'Adequate') {
            recs.unshift('Spend 30 minutes adding more detail to weak sections');
        }
    }

    /**
     * Generate human-readable report
     */
    generateReport(validation) {
        const report = [`
## Prompt Quality Score: ${validation.score}/100 (${validation.quality})

### Score Breakdown:
- Vision Clarity: ${this.getSectionScore(validation, 'vision')}/20
- Boundaries (NOT THIS): ${this.getSectionScore(validation, 'boundaries')}/25  
- User Definition: ${this.getSectionScore(validation, 'user')}/20
- Success Metrics: ${this.getSectionScore(validation, 'metrics')}/20
- Technical Clarity: ${this.getSectionScore(validation, 'technical')}/15
${validation.bonusPoints > 0 ? `- Bonus Points: +${validation.bonusPoints}` : ''}

### Strengths:
${this.getStrengths(validation).map(s => `- ${s}`).join('\n')}

### Areas for Improvement:
${validation.feedback.map(f => `- ${f}`).join('\n')}

### Priority Actions:
${validation.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

### Missing Sections:
${validation.missing.length > 0 ? validation.missing.map(m => `- ${m}`).join('\n') : 'None - all required sections present'}
        `];

        return report.join('\n');
    }

    /**
     * Helper to get section scores
     */
    getSectionScore(validation, category) {
        let score = 0;
        for (const [key, value] of Object.entries(validation.sections)) {
            if (key.toLowerCase().includes(category)) {
                score += value.score || 0;
            }
        }
        return score;
    }

    /**
     * Helper to identify strengths
     */
    getStrengths(validation) {
        const strengths = [];
        
        if (validation.sections.visionDescription?.quality === 'excellent') {
            strengths.push('Clear, concise project vision');
        }
        
        if (validation.sections.boundariesQuantity?.count >= 7) {
            strengths.push('Comprehensive NOT THIS list prevents scope creep');
        }
        
        if (validation.sections.measurableMetrics?.count >= 5) {
            strengths.push('Well-defined measurable success metrics');
        }
        
        if (validation.bonusPoints >= 6) {
            strengths.push('Excellent supporting materials and team alignment');
        }
        
        if (strengths.length === 0) {
            strengths.push('Prompt submission shows good initiative');
        }
        
        return strengths;
    }
}

module.exports = PromptValidator;
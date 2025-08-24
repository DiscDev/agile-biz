/**
 * Document Quality Validator
 * 
 * Validates quality and completeness of generated documents
 * Part of Phase 4: Document Creation Reliability
 */

const fs = require('fs');
const path = require('path');

class DocumentQualityValidator {
    constructor() {
        // Validation rules by document type
        this.validationRules = {
            research: {
                requiredSections: [
                    'Overview',
                    'Executive Summary',
                    'Market Analysis',
                    'Findings',
                    'Recommendations'
                ],
                minWordCount: 500,
                maxWordCount: 10000,
                requiredKeywords: ['analysis', 'market', 'research'],
                qualityChecks: [
                    'hasDataSupport',
                    'hasCitations',
                    'hasConclusions'
                ]
            },
            requirements: {
                requiredSections: [
                    'Overview',
                    'User Stories',
                    'Functional Requirements',
                    'Non-Functional Requirements',
                    'Acceptance Criteria'
                ],
                minWordCount: 300,
                maxWordCount: 8000,
                requiredKeywords: ['requirement', 'shall', 'must'],
                qualityChecks: [
                    'hasUserStories',
                    'hasMeasurableCriteria',
                    'hasTraceability'
                ]
            },
            technical: {
                requiredSections: [
                    'Overview',
                    'Architecture',
                    'Implementation',
                    'API',
                    'Deployment'
                ],
                minWordCount: 400,
                maxWordCount: 15000,
                requiredKeywords: ['architecture', 'implementation', 'technical'],
                qualityChecks: [
                    'hasDiagrams',
                    'hasCodeExamples',
                    'hasAPISpecs'
                ]
            },
            sprint: {
                requiredSections: [
                    'Sprint Goals',
                    'User Stories',
                    'Tasks',
                    'Success Criteria'
                ],
                minWordCount: 200,
                maxWordCount: 5000,
                requiredKeywords: ['sprint', 'story', 'task'],
                qualityChecks: [
                    'hasEstimates',
                    'hasAssignments',
                    'hasDeliverables'
                ]
            }
        };
        
        // Default rules for unknown types
        this.defaultRules = {
            requiredSections: ['Overview', 'Purpose'],
            minWordCount: 100,
            maxWordCount: 20000,
            requiredKeywords: [],
            qualityChecks: ['hasContent', 'hasStructure']
        };
        
        // Quality thresholds
        this.qualityThresholds = {
            excellent: 90,
            good: 75,
            acceptable: 60,
            poor: 40
        };
    }

    /**
     * Validate document quality
     */
    async validateDocument(documentPath, documentType) {
        console.log(`\n🔍 Validating document: ${path.basename(documentPath)}`);
        
        try {
            // Read document content
            const content = fs.readFileSync(documentPath, 'utf8');
            
            // Get validation rules for type
            const rules = this.validationRules[documentType] || this.defaultRules;
            
            // Perform validation
            const validation = {
                path: documentPath,
                type: documentType,
                timestamp: new Date().toISOString(),
                passed: true,
                score: 100,
                errors: [],
                warnings: [],
                suggestions: [],
                metrics: {},
                details: {}
            };
            
            // Run all validation checks
            await this.checkStructure(content, rules, validation);
            await this.checkContent(content, rules, validation);
            await this.checkCompleteness(content, rules, validation);
            await this.checkQuality(content, rules, validation);
            await this.checkFormatting(content, validation);
            
            // Calculate final score
            validation.score = this.calculateQualityScore(validation);
            validation.passed = validation.errors.length === 0 && validation.score >= this.qualityThresholds.acceptable;
            
            // Generate quality rating
            validation.rating = this.getQualityRating(validation.score);
            
            // Add improvement suggestions
            this.addImprovementSuggestions(validation);
            
            console.log(`   📊 Quality Score: ${validation.score}/100 (${validation.rating})`);
            console.log(`   ✅ Passed: ${validation.passed}`);
            
            return validation;
            
        } catch (error) {
            console.error(`Validation error: ${error.message}`);
            return {
                path: documentPath,
                type: documentType,
                timestamp: new Date().toISOString(),
                passed: false,
                score: 0,
                errors: [`Validation failed: ${error.message}`],
                warnings: [],
                suggestions: []
            };
        }
    }

    /**
     * Check document structure
     */
    async checkStructure(content, rules, validation) {
        validation.details.structure = {
            hasRequiredSections: true,
            missingSections: [],
            extraSections: [],
            sectionOrder: 'correct'
        };
        
        // Extract sections from content
        const sections = this.extractSections(content);
        validation.metrics.totalSections = sections.length;
        
        // Check required sections
        for (const required of rules.requiredSections) {
            const found = sections.some(s => 
                s.toLowerCase().includes(required.toLowerCase())
            );
            
            if (!found) {
                validation.errors.push(`Missing required section: ${required}`);
                validation.details.structure.missingSections.push(required);
                validation.details.structure.hasRequiredSections = false;
            }
        }
        
        // Check section hierarchy
        const hierarchy = this.checkSectionHierarchy(content);
        if (!hierarchy.valid) {
            validation.warnings.push('Inconsistent section hierarchy');
            validation.details.structure.sectionOrder = 'inconsistent';
        }
    }

    /**
     * Check content quality
     */
    async checkContent(content, rules, validation) {
        validation.details.content = {
            wordCount: 0,
            sentenceCount: 0,
            paragraphCount: 0,
            readabilityScore: 0,
            hasRequiredKeywords: true,
            missingKeywords: []
        };
        
        // Count words
        const wordCount = this.countWords(content);
        validation.metrics.wordCount = wordCount;
        validation.details.content.wordCount = wordCount;
        
        // Check word count constraints
        if (wordCount < rules.minWordCount) {
            validation.errors.push(`Content too short: ${wordCount} words (minimum: ${rules.minWordCount})`);
        }
        if (wordCount > rules.maxWordCount) {
            validation.warnings.push(`Content too long: ${wordCount} words (maximum: ${rules.maxWordCount})`);
        }
        
        // Check required keywords
        for (const keyword of rules.requiredKeywords) {
            if (!content.toLowerCase().includes(keyword.toLowerCase())) {
                validation.warnings.push(`Missing expected keyword: ${keyword}`);
                validation.details.content.missingKeywords.push(keyword);
                validation.details.content.hasRequiredKeywords = false;
            }
        }
        
        // Calculate readability
        validation.details.content.readabilityScore = this.calculateReadability(content);
        if (validation.details.content.readabilityScore < 50) {
            validation.warnings.push('Low readability score - consider simplifying language');
        }
    }

    /**
     * Check document completeness
     */
    async checkCompleteness(content, rules, validation) {
        validation.details.completeness = {
            hasPlaceholders: false,
            hasTodos: false,
            hasEmptySections: false,
            completenessScore: 100
        };
        
        // Check for placeholders
        const placeholderPatterns = [
            /\[TODO\]/gi,
            /\[PLACEHOLDER\]/gi,
            /\[INSERT.*\]/gi,
            /XXX/g,
            /TBD/g
        ];
        
        for (const pattern of placeholderPatterns) {
            if (pattern.test(content)) {
                validation.errors.push('Document contains placeholders or TODOs');
                validation.details.completeness.hasPlaceholders = true;
                validation.details.completeness.hasTodos = true;
                break;
            }
        }
        
        // Check for empty sections
        const sections = content.split(/^#{1,6}\s+/m);
        for (const section of sections) {
            const trimmed = section.trim();
            if (trimmed && trimmed.split('\n').length === 1 && trimmed.length < 50) {
                validation.warnings.push('Found section with minimal content');
                validation.details.completeness.hasEmptySections = true;
            }
        }
        
        // Calculate completeness score
        let deductions = 0;
        if (validation.details.completeness.hasPlaceholders) deductions += 30;
        if (validation.details.completeness.hasEmptySections) deductions += 20;
        validation.details.completeness.completenessScore = Math.max(0, 100 - deductions);
    }

    /**
     * Check quality aspects
     */
    async checkQuality(content, rules, validation) {
        validation.details.quality = {};
        
        // Run type-specific quality checks
        for (const check of rules.qualityChecks) {
            const result = await this.runQualityCheck(check, content, validation.type);
            validation.details.quality[check] = result;
            
            if (!result.passed && result.severity === 'error') {
                validation.errors.push(result.message);
            } else if (!result.passed && result.severity === 'warning') {
                validation.warnings.push(result.message);
            }
        }
    }

    /**
     * Check document formatting
     */
    async checkFormatting(content, validation) {
        validation.details.formatting = {
            hasMetadata: false,
            hasProperLineEndings: true,
            hasConsistentIndentation: true,
            hasTrailingWhitespace: false
        };
        
        // Check for metadata header
        if (content.startsWith('---\n')) {
            validation.details.formatting.hasMetadata = true;
        } else {
            validation.suggestions.push('Consider adding metadata header');
        }
        
        // Check line endings
        if (content.includes('\r\n')) {
            validation.warnings.push('Inconsistent line endings detected');
            validation.details.formatting.hasProperLineEndings = false;
        }
        
        // Check for trailing whitespace
        if (/[ \t]+$/m.test(content)) {
            validation.suggestions.push('Remove trailing whitespace');
            validation.details.formatting.hasTrailingWhitespace = true;
        }
        
        // Check markdown formatting
        const markdownIssues = this.checkMarkdownFormatting(content);
        if (markdownIssues.length > 0) {
            validation.warnings.push(...markdownIssues);
        }
    }

    /**
     * Run specific quality check
     */
    async runQualityCheck(checkName, content, documentType) {
        const checks = {
            hasDataSupport: () => ({
                passed: /\d+%|\$\d+|data|statistics|survey/i.test(content),
                message: 'Research should include supporting data and statistics',
                severity: 'warning'
            }),
            
            hasCitations: () => ({
                passed: /\[[\d\w]+\]|\(\d{4}\)|References|Sources/i.test(content),
                message: 'Research should include citations or references',
                severity: 'warning'
            }),
            
            hasConclusions: () => ({
                passed: /conclusion|summary|recommendation/i.test(content),
                message: 'Document should have clear conclusions',
                severity: 'warning'
            }),
            
            hasUserStories: () => ({
                passed: /as a|i want|so that|user stor/i.test(content),
                message: 'Requirements should include user stories',
                severity: 'error'
            }),
            
            hasMeasurableCriteria: () => ({
                passed: /must|shall|will|criteria|metric/i.test(content),
                message: 'Requirements should have measurable criteria',
                severity: 'warning'
            }),
            
            hasTraceability: () => ({
                passed: /REQ-\d+|FR\d+|NFR\d+|requirement.*\d+/i.test(content),
                message: 'Requirements should have traceability identifiers',
                severity: 'warning'
            }),
            
            hasDiagrams: () => ({
                passed: /```mermaid|```diagram|!\[.*\]\(|diagram|flowchart/i.test(content),
                message: 'Technical documents benefit from diagrams',
                severity: 'warning'
            }),
            
            hasCodeExamples: () => ({
                passed: /```[\w]+|code:|example:/i.test(content),
                message: 'Technical documents should include code examples',
                severity: 'warning'
            }),
            
            hasAPISpecs: () => ({
                passed: /endpoint|api|request|response|http|rest/i.test(content),
                message: 'Technical documents should include API specifications',
                severity: 'warning'
            }),
            
            hasEstimates: () => ({
                passed: /hour|day|point|estimate|effort/i.test(content),
                message: 'Sprint documents should include effort estimates',
                severity: 'warning'
            }),
            
            hasAssignments: () => ({
                passed: /assigned to|owner|responsible|@/i.test(content),
                message: 'Sprint documents should include assignments',
                severity: 'warning'
            }),
            
            hasDeliverables: () => ({
                passed: /deliverable|output|result|artifact/i.test(content),
                message: 'Sprint documents should define deliverables',
                severity: 'warning'
            }),
            
            hasContent: () => ({
                passed: content.length > 100,
                message: 'Document has insufficient content',
                severity: 'error'
            }),
            
            hasStructure: () => ({
                passed: /^#{1,6}\s+/m.test(content),
                message: 'Document lacks proper structure',
                severity: 'error'
            })
        };
        
        const check = checks[checkName];
        return check ? check() : { passed: true, message: '', severity: 'info' };
    }

    /**
     * Calculate quality score
     */
    calculateQualityScore(validation) {
        let score = 100;
        
        // Deduct for errors (10 points each)
        score -= validation.errors.length * 10;
        
        // Deduct for warnings (3 points each)
        score -= validation.warnings.length * 3;
        
        // Factor in completeness
        if (validation.details.completeness) {
            score = score * (validation.details.completeness.completenessScore / 100);
        }
        
        // Factor in content quality
        if (validation.details.content && validation.details.content.readabilityScore) {
            const readabilityFactor = validation.details.content.readabilityScore / 100;
            score = score * (0.7 + readabilityFactor * 0.3); // 30% weight to readability
        }
        
        return Math.max(0, Math.round(score));
    }

    /**
     * Get quality rating
     */
    getQualityRating(score) {
        if (score >= this.qualityThresholds.excellent) return 'Excellent';
        if (score >= this.qualityThresholds.good) return 'Good';
        if (score >= this.qualityThresholds.acceptable) return 'Acceptable';
        if (score >= this.qualityThresholds.poor) return 'Poor';
        return 'Unacceptable';
    }

    /**
     * Add improvement suggestions
     */
    addImprovementSuggestions(validation) {
        // Based on score and issues
        if (validation.score < this.qualityThresholds.good) {
            if (validation.details.content && validation.details.content.wordCount < 300) {
                validation.suggestions.push('Expand content with more details and examples');
            }
            
            if (validation.details.structure && validation.details.structure.missingSections.length > 0) {
                validation.suggestions.push('Add missing required sections');
            }
            
            if (validation.details.quality) {
                const failedChecks = Object.entries(validation.details.quality)
                    .filter(([_, result]) => !result.passed)
                    .map(([check, _]) => check);
                    
                if (failedChecks.length > 0) {
                    validation.suggestions.push(`Improve: ${failedChecks.join(', ')}`);
                }
            }
        }
        
        // General suggestions
        if (!validation.details.formatting || !validation.details.formatting.hasMetadata) {
            validation.suggestions.push('Add metadata header for better tracking');
        }
    }

    /**
     * Utility methods
     */
    
    extractSections(content) {
        const sections = [];
        const lines = content.split('\n');
        
        for (const line of lines) {
            const match = line.match(/^#{1,6}\s+(.+)$/);
            if (match) {
                sections.push(match[1]);
            }
        }
        
        return sections;
    }

    checkSectionHierarchy(content) {
        const lines = content.split('\n');
        let lastLevel = 0;
        let valid = true;
        
        for (const line of lines) {
            const match = line.match(/^(#{1,6})\s+/);
            if (match) {
                const level = match[1].length;
                if (level > lastLevel + 1) {
                    valid = false;
                    break;
                }
                lastLevel = level;
            }
        }
        
        return { valid };
    }

    countWords(content) {
        // Remove metadata, code blocks, and markdown formatting
        let text = content.replace(/---[\s\S]*?---/g, ''); // Remove metadata
        text = text.replace(/```[\s\S]*?```/g, ''); // Remove code blocks
        text = text.replace(/[#*`_\[\]()]/g, ''); // Remove markdown syntax
        
        return text.split(/\s+/).filter(word => word.length > 0).length;
    }

    calculateReadability(content) {
        // Simple readability score based on sentence length and complexity
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = this.countWords(content);
        
        if (sentences.length === 0) return 0;
        
        const avgWordsPerSentence = words / sentences.length;
        
        // Simple readability formula (lower is better)
        // Ideal is 10-15 words per sentence
        let score = 100;
        if (avgWordsPerSentence > 20) score -= (avgWordsPerSentence - 20) * 2;
        if (avgWordsPerSentence < 5) score -= (5 - avgWordsPerSentence) * 5;
        
        return Math.max(0, Math.min(100, score));
    }

    checkMarkdownFormatting(content) {
        const issues = [];
        
        // Check for common markdown issues
        if (/^[*-]\s+[A-Z]/m.test(content)) {
            issues.push('Bullet points should not start with capital letters unless proper nouns');
        }
        
        if (/\n#{1,6}[^\s]/m.test(content)) {
            issues.push('Headers should have space after hash symbols');
        }
        
        if (/[^`]\s+```/m.test(content)) {
            issues.push('Code blocks should not be indented');
        }
        
        return issues;
    }

    /**
     * Batch validate multiple documents
     */
    async validateBatch(documents) {
        const results = {
            total: documents.length,
            passed: 0,
            failed: 0,
            averageScore: 0,
            documents: []
        };
        
        let totalScore = 0;
        
        for (const doc of documents) {
            const validation = await this.validateDocument(doc.path, doc.type);
            results.documents.push(validation);
            
            if (validation.passed) {
                results.passed++;
            } else {
                results.failed++;
            }
            
            totalScore += validation.score;
        }
        
        results.averageScore = Math.round(totalScore / documents.length);
        
        return results;
    }
}

module.exports = DocumentQualityValidator;
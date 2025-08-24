/**
 * Document Generation Wrapper
 * 
 * Wraps document generation with retry logic and error handling
 * Part of Phase 4: Document Creation Reliability
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const { 
    handleWorkflowError,
    createWorkflowError,
    ERROR_TYPES
} = require('./scripts/workflow-error-handler');

class DocumentGenerationWrapper extends EventEmitter {
    constructor() {
        super();
        
        // Configuration
        this.config = {
            maxRetries: 3,
            retryDelay: 2000, // 2 seconds
            retryBackoff: 2, // Exponential backoff multiplier
            timeout: 300000, // 5 minutes per document
            tempDir: path.join(__dirname, '../.temp-documents'),
            validation: {
                minSize: 100, // Minimum 100 bytes
                maxSize: 10 * 1024 * 1024, // Maximum 10MB
                requiredSections: ['Overview', 'Purpose'] // Minimum sections
            }
        };
        
        // State tracking
        this.activeGenerations = new Map();
        this.completedDocuments = new Map();
        this.failedDocuments = new Map();
        this.retryCount = new Map();
        
        // Statistics
        this.stats = {
            attempted: 0,
            succeeded: 0,
            failed: 0,
            retried: 0,
            totalRetries: 0
        };
        
        // Ensure temp directory exists
        this.ensureTempDirectory();
    }

    /**
     * Generate document with retry logic
     */
    async generateDocument(documentSpec) {
        const docId = this.generateDocumentId(documentSpec);
        this.stats.attempted++;
        
        console.log(`\n📄 Generating document: ${documentSpec.name}`);
        console.log(`   Type: ${documentSpec.type}`);
        console.log(`   Agent: ${documentSpec.agent}`);
        
        // Track active generation
        this.activeGenerations.set(docId, {
            spec: documentSpec,
            startTime: new Date(),
            attempts: 0
        });
        
        try {
            // Attempt generation with retries
            const result = await this.attemptWithRetry(
                () => this.performGeneration(documentSpec),
                docId
            );
            
            // Success
            this.stats.succeeded++;
            this.completedDocuments.set(docId, {
                ...result,
                completedAt: new Date()
            });
            
            this.emit('document-completed', {
                docId,
                document: result,
                attempts: this.retryCount.get(docId) || 1
            });
            
            return result;
            
        } catch (error) {
            // Failed after all retries
            this.stats.failed++;
            this.failedDocuments.set(docId, {
                spec: documentSpec,
                error: error.message,
                attempts: this.retryCount.get(docId) || 1,
                failedAt: new Date()
            });
            
            this.emit('document-failed', {
                docId,
                spec: documentSpec,
                error: error.message
            });
            
            throw error;
            
        } finally {
            // Cleanup
            this.activeGenerations.delete(docId);
            this.retryCount.delete(docId);
        }
    }

    /**
     * Perform document generation
     */
    async performGeneration(documentSpec) {
        const { type, name, agent, template, data, outputPath } = documentSpec;
        
        // Step 1: Prepare generation environment
        const tempPath = path.join(this.config.tempDir, `${Date.now()}-${name}`);
        
        try {
            // Step 2: Invoke agent to generate content
            const content = await this.invokeAgent(agent, {
                type,
                template,
                data,
                requirements: documentSpec.requirements || {}
            });
            
            // Step 3: Validate generated content
            const validation = await this.validateContent(content, documentSpec);
            if (!validation.valid) {
                throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
            }
            
            // Step 4: Process and enhance content
            const processedContent = await this.processContent(content, documentSpec);
            
            // Step 5: Write to temporary location
            await this.writeToTemp(tempPath, processedContent);
            
            // Step 6: Move to final location
            const finalPath = outputPath || this.generateOutputPath(documentSpec);
            await this.moveToFinal(tempPath, finalPath);
            
            return {
                path: finalPath,
                size: Buffer.byteLength(processedContent),
                checksum: this.calculateChecksum(processedContent),
                generatedBy: agent,
                generatedAt: new Date().toISOString(),
                metadata: {
                    type,
                    name,
                    template: template || 'default'
                }
            };
            
        } catch (error) {
            // Cleanup temp file if exists
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
            
            throw error;
        }
    }

    /**
     * Attempt operation with retry logic
     */
    async attemptWithRetry(operation, docId) {
        const maxAttempts = this.config.maxRetries + 1;
        let lastError;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                // Update retry count
                this.retryCount.set(docId, attempt);
                
                // Set timeout for operation
                const result = await this.withTimeout(
                    operation(),
                    this.config.timeout
                );
                
                return result;
                
            } catch (error) {
                lastError = error;
                
                if (attempt < maxAttempts) {
                    // Calculate retry delay with exponential backoff
                    const delay = this.config.retryDelay * 
                        Math.pow(this.config.retryBackoff, attempt - 1);
                    
                    console.log(`   ⚠️ Attempt ${attempt} failed: ${error.message}`);
                    console.log(`   ↻ Retrying in ${delay / 1000} seconds...`);
                    
                    this.stats.retried++;
                    this.stats.totalRetries++;
                    
                    this.emit('document-retry', {
                        docId,
                        attempt,
                        error: error.message,
                        nextDelay: delay
                    });
                    
                    await this.delay(delay);
                } else {
                    console.error(`   ❌ Failed after ${attempt} attempts: ${error.message}`);
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Invoke agent to generate content
     */
    async invokeAgent(agentName, context) {
        // This would integrate with actual agent invocation
        // For now, simulate content generation
        
        console.log(`   🤖 Invoking agent: ${agentName}`);
        
        // Simulate agent work
        await this.delay(1000 + Math.random() * 2000);
        
        // Generate sample content based on type
        let content = '';
        
        switch (context.type) {
            case 'research':
                content = this.generateResearchContent(context);
                break;
            case 'requirements':
                content = this.generateRequirementsContent(context);
                break;
            case 'technical':
                content = this.generateTechnicalContent(context);
                break;
            default:
                content = this.generateDefaultContent(context);
        }
        
        return content;
    }

    /**
     * Validate generated content
     */
    async validateContent(content, documentSpec) {
        const validation = {
            valid: true,
            errors: [],
            warnings: []
        };
        
        // Check content exists
        if (!content || content.trim().length === 0) {
            validation.valid = false;
            validation.errors.push('Content is empty');
            return validation;
        }
        
        // Check size constraints
        const size = Buffer.byteLength(content);
        if (size < this.config.validation.minSize) {
            validation.valid = false;
            validation.errors.push(`Content too small: ${size} bytes`);
        }
        if (size > this.config.validation.maxSize) {
            validation.valid = false;
            validation.errors.push(`Content too large: ${size} bytes`);
        }
        
        // Check required sections
        for (const section of this.config.validation.requiredSections) {
            if (!content.includes(`# ${section}`) && !content.includes(`## ${section}`)) {
                validation.warnings.push(`Missing recommended section: ${section}`);
            }
        }
        
        // Type-specific validation
        const typeValidation = await this.validateByType(content, documentSpec.type);
        validation.errors.push(...typeValidation.errors);
        validation.warnings.push(...typeValidation.warnings);
        
        if (typeValidation.errors.length > 0) {
            validation.valid = false;
        }
        
        return validation;
    }

    /**
     * Type-specific content validation
     */
    async validateByType(content, type) {
        const validation = {
            errors: [],
            warnings: []
        };
        
        switch (type) {
            case 'research':
                if (!content.includes('Market') && !content.includes('Analysis')) {
                    validation.warnings.push('Research document should include market analysis');
                }
                break;
                
            case 'requirements':
                if (!content.includes('User Stor') && !content.includes('Requirement')) {
                    validation.errors.push('Requirements document must include user stories or requirements');
                }
                break;
                
            case 'technical':
                if (!content.includes('Architecture') && !content.includes('Implementation')) {
                    validation.warnings.push('Technical document should include architecture or implementation details');
                }
                break;
        }
        
        return validation;
    }

    /**
     * Process and enhance content
     */
    async processContent(content, documentSpec) {
        let processed = content;
        
        // Add metadata header
        const metadata = [
            '---',
            `title: ${documentSpec.name}`,
            `type: ${documentSpec.type}`,
            `generated_by: ${documentSpec.agent}`,
            `generated_at: ${new Date().toISOString()}`,
            `version: 1.0.0`,
            '---',
            ''
        ].join('\n');
        
        processed = metadata + processed;
        
        // Add footer
        const footer = [
            '',
            '---',
            '',
            `*Generated by AgileAiAgents - ${documentSpec.agent}*`,
            `*${new Date().toLocaleString()}*`
        ].join('\n');
        
        processed = processed + footer;
        
        // Format and clean
        processed = this.formatContent(processed);
        
        return processed;
    }

    /**
     * Format content for consistency
     */
    formatContent(content) {
        // Ensure consistent line endings
        content = content.replace(/\r\n/g, '\n');
        
        // Remove excessive blank lines
        content = content.replace(/\n{3,}/g, '\n\n');
        
        // Ensure headers have proper spacing
        content = content.replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2');
        
        // Trim whitespace
        content = content.trim();
        
        return content;
    }

    /**
     * Write content to temporary location
     */
    async writeToTemp(tempPath, content) {
        const dir = path.dirname(tempPath);
        
        // Ensure directory exists
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // Write atomically
        fs.writeFileSync(tempPath, content, 'utf8');
        
        // Verify write
        const written = fs.readFileSync(tempPath, 'utf8');
        if (written !== content) {
            throw new Error('Content verification failed after write');
        }
    }

    /**
     * Move from temp to final location
     */
    async moveToFinal(tempPath, finalPath) {
        const dir = path.dirname(finalPath);
        
        // Ensure directory exists
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // Check if file already exists
        if (fs.existsSync(finalPath)) {
            // Create backup
            const backupPath = `${finalPath}.backup-${Date.now()}`;
            fs.renameSync(finalPath, backupPath);
        }
        
        // Move file
        fs.renameSync(tempPath, finalPath);
        
        // Verify move
        if (!fs.existsSync(finalPath)) {
            throw new Error('File not found after move');
        }
    }

    /**
     * Generate output path for document
     */
    generateOutputPath(documentSpec) {
        const baseDir = path.join(__dirname, '../project-documents');
        const typeDir = documentSpec.type || 'general';
        const fileName = `${documentSpec.name.toLowerCase().replace(/\s+/g, '-')}.md`;
        
        return path.join(baseDir, typeDir, fileName);
    }

    /**
     * Generate unique document ID
     */
    generateDocumentId(documentSpec) {
        return `${documentSpec.type}-${documentSpec.name}-${Date.now()}`;
    }

    /**
     * Calculate content checksum
     */
    calculateChecksum(content) {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    /**
     * Ensure temp directory exists
     */
    ensureTempDirectory() {
        if (!fs.existsSync(this.config.tempDir)) {
            fs.mkdirSync(this.config.tempDir, { recursive: true });
        }
    }

    /**
     * Utility: Delay execution
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Utility: Execute with timeout
     */
    withTimeout(promise, timeout) {
        return Promise.race([
            promise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Operation timed out')), timeout)
            )
        ]);
    }

    /**
     * Generate sample content for testing
     */
    generateResearchContent(context) {
        return `# ${context.data?.title || 'Research Document'}

## Overview
This research document provides comprehensive analysis and insights.

## Executive Summary
Key findings and recommendations based on thorough research.

## Market Analysis
- Market size and growth projections
- Competitive landscape
- Target audience insights

## Methodology
Research methods and data sources used.

## Findings
Detailed research findings and analysis.

## Recommendations
Strategic recommendations based on research.

## Conclusion
Summary of key insights and next steps.
`;
    }

    generateRequirementsContent(context) {
        return `# ${context.data?.title || 'Requirements Document'}

## Overview
This document outlines the functional and non-functional requirements.

## Purpose
Define clear requirements for successful implementation.

## User Stories
1. As a user, I want to...
2. As an admin, I need to...

## Functional Requirements
- FR1: System shall...
- FR2: Application must...

## Non-Functional Requirements
- Performance requirements
- Security requirements
- Usability requirements

## Acceptance Criteria
Clear criteria for requirement validation.
`;
    }

    generateTechnicalContent(context) {
        return `# ${context.data?.title || 'Technical Document'}

## Overview
Technical specifications and implementation details.

## Architecture
High-level system architecture and design patterns.

## Implementation Details
- Technology stack
- Component structure
- Data flow

## API Specifications
Detailed API endpoints and contracts.

## Database Schema
Data models and relationships.

## Deployment
Deployment architecture and procedures.
`;
    }

    generateDefaultContent(context) {
        return `# ${context.data?.title || 'Document'}

## Overview
Document overview and purpose.

## Purpose
Why this document exists and its goals.

## Content
Main document content goes here.

## Summary
Key takeaways and conclusions.
`;
    }

    /**
     * Get generation statistics
     */
    getStatistics() {
        return {
            ...this.stats,
            active: this.activeGenerations.size,
            successRate: this.stats.attempted > 0 
                ? Math.round((this.stats.succeeded / this.stats.attempted) * 100) 
                : 0,
            averageRetries: this.stats.retried > 0
                ? Math.round(this.stats.totalRetries / this.stats.retried * 10) / 10
                : 0
        };
    }

    /**
     * Get failed documents for recovery
     */
    getFailedDocuments() {
        return Array.from(this.failedDocuments.entries()).map(([id, data]) => ({
            id,
            ...data
        }));
    }

    /**
     * Retry failed document
     */
    async retryFailedDocument(docId) {
        const failed = this.failedDocuments.get(docId);
        if (!failed) {
            throw new Error(`Failed document not found: ${docId}`);
        }
        
        // Remove from failed list
        this.failedDocuments.delete(docId);
        
        // Reset retry count
        this.retryCount.delete(docId);
        
        // Attempt generation again
        return this.generateDocument(failed.spec);
    }

    /**
     * Clear completed documents
     */
    clearCompleted() {
        this.completedDocuments.clear();
    }

    /**
     * Clear failed documents
     */
    clearFailed() {
        this.failedDocuments.clear();
    }
}

module.exports = DocumentGenerationWrapper;
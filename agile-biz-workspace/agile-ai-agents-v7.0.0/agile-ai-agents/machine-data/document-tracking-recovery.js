/**
 * Document Tracking and Recovery System
 * 
 * Tracks all document operations and provides recovery mechanisms
 * Part of Phase 4: Document Creation Reliability
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const DocumentGenerationWrapper = require('./document-generation-wrapper');
const DocumentQualityValidator = require('./document-quality-validator');
const AtomicDocumentManager = require('./atomic-document-manager');

class DocumentTrackingRecovery extends EventEmitter {
    constructor() {
        super();
        
        // Configuration
        this.config = {
            trackingFile: path.join(__dirname, '../project-state/document-tracking.json'),
            recoveryDir: path.join(__dirname, '../.document-recovery'),
            checkInterval: 60000, // 1 minute
            staleThreshold: 600000, // 10 minutes
            maxRecoveryAttempts: 3
        };
        
        // Component instances
        this.generator = new DocumentGenerationWrapper();
        this.validator = new DocumentQualityValidator();
        this.atomicManager = new AtomicDocumentManager();
        
        // Document tracking
        this.documentRegistry = new Map();
        this.generationQueue = [];
        this.failedDocuments = new Map();
        this.recoveryAttempts = new Map();
        
        // Monitoring
        this.monitoring = false;
        this.checkTimer = null;
        
        // Load existing tracking data
        this.loadTrackingData();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Track document for generation
     */
    async trackDocument(documentSpec) {
        const docId = this.generateDocumentId(documentSpec);
        
        const trackingEntry = {
            id: docId,
            spec: documentSpec,
            status: 'queued',
            attempts: 0,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            events: []
        };
        
        // Add to registry
        this.documentRegistry.set(docId, trackingEntry);
        
        // Add to queue
        this.generationQueue.push(docId);
        
        // Save tracking data
        await this.saveTrackingData();
        
        console.log(`📋 Tracking document: ${documentSpec.name} (${docId})`);
        
        this.emit('document-tracked', {
            id: docId,
            name: documentSpec.name,
            type: documentSpec.type
        });
        
        return docId;
    }

    /**
     * Generate document with full tracking
     */
    async generateTrackedDocument(docId) {
        const tracking = this.documentRegistry.get(docId);
        if (!tracking) {
            throw new Error(`Document not tracked: ${docId}`);
        }
        
        console.log(`\n🚀 Generating tracked document: ${tracking.spec.name}`);
        
        try {
            // Update status
            await this.updateDocumentStatus(docId, 'generating');
            
            // Generate document
            const result = await this.generator.generateDocument(tracking.spec);
            
            // Validate quality
            const validation = await this.validator.validateDocument(
                result.path,
                tracking.spec.type
            );
            
            // Save atomically
            const content = fs.readFileSync(result.path, 'utf8');
            const saveResult = await this.atomicManager.saveDocument(
                result.path,
                content,
                {
                    docId,
                    validation: validation.score,
                    generatedBy: tracking.spec.agent
                }
            );
            
            // Update tracking
            await this.updateDocumentStatus(docId, 'completed', {
                path: result.path,
                validation,
                saveResult,
                completedAt: new Date().toISOString()
            });
            
            // Remove from queue
            this.generationQueue = this.generationQueue.filter(id => id !== docId);
            
            console.log(`✅ Document completed: ${tracking.spec.name}`);
            console.log(`   Quality Score: ${validation.score}/100`);
            
            return {
                success: true,
                docId,
                path: result.path,
                validation,
                tracking
            };
            
        } catch (error) {
            console.error(`❌ Generation failed: ${error.message}`);
            
            // Track failure
            await this.handleGenerationFailure(docId, error);
            
            throw error;
        }
    }

    /**
     * Handle generation failure
     */
    async handleGenerationFailure(docId, error) {
        const tracking = this.documentRegistry.get(docId);
        if (!tracking) return;
        
        tracking.attempts++;
        
        // Update status
        await this.updateDocumentStatus(docId, 'failed', {
            error: error.message,
            attempt: tracking.attempts
        });
        
        // Add to failed documents
        this.failedDocuments.set(docId, {
            tracking,
            error: error.message,
            failedAt: new Date()
        });
        
        // Schedule recovery if under max attempts
        if (tracking.attempts < this.config.maxRecoveryAttempts) {
            console.log(`↻ Scheduling recovery for ${tracking.spec.name} (attempt ${tracking.attempts + 1})`);
            this.scheduleRecovery(docId);
        } else {
            console.error(`⛔ Max recovery attempts reached for ${tracking.spec.name}`);
            await this.updateDocumentStatus(docId, 'abandoned');
        }
    }

    /**
     * Schedule document recovery
     */
    scheduleRecovery(docId) {
        // Add to recovery queue with exponential backoff
        const attempts = this.recoveryAttempts.get(docId) || 0;
        const delay = Math.min(60000 * Math.pow(2, attempts), 300000); // Max 5 minutes
        
        setTimeout(() => {
            this.attemptRecovery(docId);
        }, delay);
        
        this.recoveryAttempts.set(docId, attempts + 1);
        
        this.emit('recovery-scheduled', {
            docId,
            attempt: attempts + 1,
            delay
        });
    }

    /**
     * Attempt document recovery
     */
    async attemptRecovery(docId) {
        console.log(`\n🔧 Attempting recovery for document: ${docId}`);
        
        try {
            // Get tracking info
            const tracking = this.documentRegistry.get(docId);
            if (!tracking) {
                console.error('Document not found in registry');
                return;
            }
            
            // Update status
            await this.updateDocumentStatus(docId, 'recovering');
            
            // Attempt generation
            const result = await this.generateTrackedDocument(docId);
            
            // Success - remove from failed
            this.failedDocuments.delete(docId);
            this.recoveryAttempts.delete(docId);
            
            console.log(`✅ Recovery successful for ${tracking.spec.name}`);
            
            this.emit('recovery-success', {
                docId,
                path: result.path
            });
            
        } catch (error) {
            console.error(`Recovery failed: ${error.message}`);
            
            this.emit('recovery-failed', {
                docId,
                error: error.message
            });
        }
    }

    /**
     * Start monitoring for stale documents
     */
    startMonitoring() {
        if (this.monitoring) {
            console.log('Document monitoring already active');
            return;
        }
        
        this.monitoring = true;
        console.log('📡 Started document tracking monitor');
        
        // Initial check
        this.checkStaleDocuments();
        
        // Schedule regular checks
        this.checkTimer = setInterval(() => {
            this.checkStaleDocuments();
        }, this.config.checkInterval);
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
            this.checkTimer = null;
        }
        
        this.monitoring = false;
        console.log('📡 Stopped document tracking monitor');
    }

    /**
     * Check for stale documents
     */
    async checkStaleDocuments() {
        const now = new Date();
        const staleDocuments = [];
        
        for (const [docId, tracking] of this.documentRegistry) {
            if (tracking.status === 'generating' || tracking.status === 'queued') {
                const lastUpdate = new Date(tracking.lastUpdated);
                const age = now - lastUpdate;
                
                if (age > this.config.staleThreshold) {
                    staleDocuments.push({
                        docId,
                        tracking,
                        age: Math.floor(age / 60000) // minutes
                    });
                }
            }
        }
        
        if (staleDocuments.length > 0) {
            console.log(`\n⚠️ Found ${staleDocuments.length} stale documents`);
            
            for (const stale of staleDocuments) {
                console.log(`   - ${stale.tracking.spec.name} (${stale.age} minutes old)`);
                
                // Mark as stale and attempt recovery
                await this.updateDocumentStatus(stale.docId, 'stale');
                await this.handleGenerationFailure(
                    stale.docId, 
                    new Error('Document generation stalled')
                );
            }
        }
    }

    /**
     * Update document status
     */
    async updateDocumentStatus(docId, status, details = {}) {
        const tracking = this.documentRegistry.get(docId);
        if (!tracking) return;
        
        // Update tracking
        tracking.status = status;
        tracking.lastUpdated = new Date().toISOString();
        
        // Add event
        tracking.events.push({
            timestamp: new Date().toISOString(),
            status,
            details
        });
        
        // Save tracking data
        await this.saveTrackingData();
        
        this.emit('status-updated', {
            docId,
            status,
            details
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Generator events
        this.generator.on('document-completed', (event) => {
            this.emit('generation-completed', event);
        });
        
        this.generator.on('document-retry', (event) => {
            this.emit('generation-retry', event);
        });
        
        // Atomic manager events
        this.atomicManager.on('document-saved', (event) => {
            this.emit('document-saved', event);
        });
        
        this.atomicManager.on('document-rollback', (event) => {
            this.emit('document-rollback', event);
        });
    }

    /**
     * Process document queue
     */
    async processQueue() {
        if (this.generationQueue.length === 0) {
            console.log('📭 Document queue is empty');
            return;
        }
        
        console.log(`\n📬 Processing ${this.generationQueue.length} queued documents...`);
        
        const results = {
            total: this.generationQueue.length,
            succeeded: 0,
            failed: 0
        };
        
        // Process queue in order
        while (this.generationQueue.length > 0) {
            const docId = this.generationQueue[0];
            
            try {
                await this.generateTrackedDocument(docId);
                results.succeeded++;
            } catch (error) {
                results.failed++;
                // Error is handled by generateTrackedDocument
            }
        }
        
        console.log(`\n📊 Queue processing complete:`);
        console.log(`   ✅ Succeeded: ${results.succeeded}`);
        console.log(`   ❌ Failed: ${results.failed}`);
        
        return results;
    }

    /**
     * Get document status
     */
    getDocumentStatus(docId) {
        const tracking = this.documentRegistry.get(docId);
        if (!tracking) {
            return { exists: false };
        }
        
        return {
            exists: true,
            ...tracking,
            isStale: this.isDocumentStale(tracking),
            canRecover: tracking.attempts < this.config.maxRecoveryAttempts
        };
    }

    /**
     * Get recovery status
     */
    getRecoveryStatus() {
        return {
            monitoring: this.monitoring,
            queueLength: this.generationQueue.length,
            failedCount: this.failedDocuments.size,
            recoveryQueue: this.recoveryAttempts.size,
            registry: {
                total: this.documentRegistry.size,
                byStatus: this.getDocumentsByStatus()
            }
        };
    }

    /**
     * Get documents by status
     */
    getDocumentsByStatus() {
        const byStatus = {};
        
        for (const [_, tracking] of this.documentRegistry) {
            const status = tracking.status;
            if (!byStatus[status]) {
                byStatus[status] = 0;
            }
            byStatus[status]++;
        }
        
        return byStatus;
    }

    /**
     * Check if document is stale
     */
    isDocumentStale(tracking) {
        if (tracking.status !== 'generating' && tracking.status !== 'queued') {
            return false;
        }
        
        const age = new Date() - new Date(tracking.lastUpdated);
        return age > this.config.staleThreshold;
    }

    /**
     * Retry all failed documents
     */
    async retryAllFailed() {
        const failed = Array.from(this.failedDocuments.keys());
        
        console.log(`\n↻ Retrying ${failed.length} failed documents...`);
        
        for (const docId of failed) {
            const tracking = this.documentRegistry.get(docId);
            if (tracking && tracking.attempts < this.config.maxRecoveryAttempts) {
                this.scheduleRecovery(docId);
            }
        }
        
        return failed.length;
    }

    /**
     * Clear completed documents
     */
    clearCompleted() {
        let cleared = 0;
        
        for (const [docId, tracking] of this.documentRegistry) {
            if (tracking.status === 'completed') {
                this.documentRegistry.delete(docId);
                cleared++;
            }
        }
        
        this.saveTrackingData();
        
        console.log(`🗑️ Cleared ${cleared} completed documents`);
        
        return cleared;
    }

    /**
     * Generate document ID
     */
    generateDocumentId(spec) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 5);
        return `${spec.type}-${spec.name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}-${random}`;
    }

    /**
     * Save tracking data
     */
    async saveTrackingData() {
        const data = {
            timestamp: new Date().toISOString(),
            registry: Array.from(this.documentRegistry.entries()),
            queue: this.generationQueue,
            failed: Array.from(this.failedDocuments.entries()),
            recoveryAttempts: Array.from(this.recoveryAttempts.entries())
        };
        
        const dir = path.dirname(this.config.trackingFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(
            this.config.trackingFile,
            JSON.stringify(data, null, 2)
        );
    }

    /**
     * Load tracking data
     */
    loadTrackingData() {
        if (!fs.existsSync(this.config.trackingFile)) {
            return;
        }
        
        try {
            const data = JSON.parse(
                fs.readFileSync(this.config.trackingFile, 'utf8')
            );
            
            // Restore registry
            if (data.registry) {
                this.documentRegistry = new Map(data.registry);
            }
            
            // Restore queue
            if (data.queue) {
                this.generationQueue = data.queue;
            }
            
            // Restore failed documents
            if (data.failed) {
                this.failedDocuments = new Map(data.failed);
            }
            
            // Restore recovery attempts
            if (data.recoveryAttempts) {
                this.recoveryAttempts = new Map(data.recoveryAttempts);
            }
            
            console.log(`📂 Loaded tracking data: ${this.documentRegistry.size} documents`);
            
        } catch (error) {
            console.error(`Failed to load tracking data: ${error.message}`);
        }
    }

    /**
     * Export tracking report
     */
    exportTrackingReport() {
        const report = {
            generated: new Date().toISOString(),
            summary: {
                total: this.documentRegistry.size,
                completed: 0,
                failed: 0,
                inProgress: 0,
                queued: this.generationQueue.length
            },
            documents: [],
            failures: [],
            statistics: this.generator.getStatistics()
        };
        
        // Categorize documents
        for (const [docId, tracking] of this.documentRegistry) {
            const doc = {
                id: docId,
                name: tracking.spec.name,
                type: tracking.spec.type,
                status: tracking.status,
                attempts: tracking.attempts,
                created: tracking.createdAt,
                updated: tracking.lastUpdated,
                events: tracking.events.length
            };
            
            report.documents.push(doc);
            
            switch (tracking.status) {
                case 'completed':
                    report.summary.completed++;
                    break;
                case 'failed':
                case 'abandoned':
                    report.summary.failed++;
                    report.failures.push(doc);
                    break;
                case 'generating':
                case 'recovering':
                    report.summary.inProgress++;
                    break;
            }
        }
        
        return report;
    }
}

module.exports = DocumentTrackingRecovery;
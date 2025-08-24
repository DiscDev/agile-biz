/**
 * Atomic Document Manager
 * 
 * Provides atomic document saves with rollback capability
 * Part of Phase 4: Document Creation Reliability
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const EventEmitter = require('events');

class AtomicDocumentManager extends EventEmitter {
    constructor() {
        super();
        
        // Configuration
        this.config = {
            backupDir: path.join(__dirname, '../.document-backups'),
            tempDir: path.join(__dirname, '../.temp-documents'),
            lockTimeout: 30000, // 30 seconds
            maxBackups: 5,
            checksumAlgorithm: 'sha256'
        };
        
        // State tracking
        this.activeLocks = new Map();
        this.documentBackups = new Map();
        this.transactionLog = [];
        
        // Statistics
        this.stats = {
            saves: 0,
            rollbacks: 0,
            conflicts: 0,
            failures: 0
        };
        
        // Ensure directories exist
        this.ensureDirectories();
    }

    /**
     * Save document atomically
     */
    async saveDocument(documentPath, content, metadata = {}) {
        const transactionId = this.generateTransactionId();
        const startTime = new Date();
        
        console.log(`\n💾 Atomic save: ${path.basename(documentPath)}`);
        console.log(`   Transaction: ${transactionId}`);
        
        try {
            // Step 1: Acquire lock
            await this.acquireLock(documentPath, transactionId);
            
            // Step 2: Create backup if file exists
            const backup = await this.createBackup(documentPath, transactionId);
            
            // Step 3: Prepare transaction
            const transaction = {
                id: transactionId,
                path: documentPath,
                content,
                metadata,
                backup,
                startTime,
                status: 'pending'
            };
            
            // Step 4: Execute atomic save
            await this.executeAtomicSave(transaction);
            
            // Step 5: Verify save
            await this.verifySave(transaction);
            
            // Step 6: Commit transaction
            await this.commitTransaction(transaction);
            
            // Success
            this.stats.saves++;
            console.log(`   ✅ Document saved successfully`);
            
            this.emit('document-saved', {
                transactionId,
                path: documentPath,
                size: Buffer.byteLength(content),
                duration: Date.now() - startTime
            });
            
            return {
                success: true,
                transactionId,
                checksum: this.calculateChecksum(content),
                backup: backup?.path
            };
            
        } catch (error) {
            // Rollback on failure
            console.error(`   ❌ Save failed: ${error.message}`);
            this.stats.failures++;
            
            await this.rollbackTransaction(transactionId, documentPath, error);
            
            throw error;
            
        } finally {
            // Release lock
            this.releaseLock(documentPath);
        }
    }

    /**
     * Execute atomic save operation
     */
    async executeAtomicSave(transaction) {
        const { path: documentPath, content } = transaction;
        
        // Generate temp file path
        const tempPath = this.getTempPath(transaction.id);
        
        try {
            // Step 1: Write to temporary file
            await this.writeToTemp(tempPath, content);
            
            // Step 2: Calculate checksums
            const tempChecksum = await this.calculateFileChecksum(tempPath);
            const contentChecksum = this.calculateChecksum(content);
            
            // Verify checksums match
            if (tempChecksum !== contentChecksum) {
                throw new Error('Checksum mismatch during write');
            }
            
            // Step 3: Create directory if needed
            const dir = path.dirname(documentPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            // Step 4: Atomic rename
            fs.renameSync(tempPath, documentPath);
            
            // Update transaction
            transaction.tempPath = tempPath;
            transaction.checksum = contentChecksum;
            transaction.status = 'written';
            
        } catch (error) {
            // Clean up temp file
            if (fs.existsSync(tempPath)) {
                fs.unlinkSync(tempPath);
            }
            
            throw new Error(`Atomic save failed: ${error.message}`);
        }
    }

    /**
     * Verify document was saved correctly
     */
    async verifySave(transaction) {
        const { path: documentPath, checksum } = transaction;
        
        // Check file exists
        if (!fs.existsSync(documentPath)) {
            throw new Error('Document not found after save');
        }
        
        // Verify checksum
        const savedChecksum = await this.calculateFileChecksum(documentPath);
        if (savedChecksum !== checksum) {
            throw new Error('Document corrupted after save');
        }
        
        // Verify content readable
        try {
            const content = fs.readFileSync(documentPath, 'utf8');
            if (!content || content.length === 0) {
                throw new Error('Document is empty after save');
            }
        } catch (error) {
            throw new Error(`Document not readable: ${error.message}`);
        }
        
        transaction.status = 'verified';
    }

    /**
     * Commit transaction
     */
    async commitTransaction(transaction) {
        // Update transaction status
        transaction.status = 'committed';
        transaction.endTime = new Date();
        transaction.duration = transaction.endTime - transaction.startTime;
        
        // Log transaction
        this.transactionLog.push({
            id: transaction.id,
            path: transaction.path,
            timestamp: transaction.endTime,
            duration: transaction.duration,
            status: 'success'
        });
        
        // Cleanup old backups
        await this.cleanupOldBackups(transaction.path);
        
        // Emit commit event
        this.emit('transaction-committed', transaction);
    }

    /**
     * Rollback transaction
     */
    async rollbackTransaction(transactionId, documentPath, error) {
        console.log(`\n⏪ Rolling back transaction: ${transactionId}`);
        
        this.stats.rollbacks++;
        
        try {
            // Get backup info
            const backups = this.documentBackups.get(documentPath) || [];
            const backup = backups.find(b => b.transactionId === transactionId);
            
            if (backup && fs.existsSync(backup.path)) {
                // Restore from backup
                fs.copyFileSync(backup.path, documentPath);
                console.log(`   ✅ Restored from backup: ${backup.path}`);
                
                this.emit('document-rollback', {
                    transactionId,
                    path: documentPath,
                    backup: backup.path,
                    reason: error.message
                });
            } else if (fs.existsSync(documentPath)) {
                // No backup but file exists - leave as is
                console.log(`   ℹ️ No backup available, keeping existing file`);
            }
            
            // Log failed transaction
            this.transactionLog.push({
                id: transactionId,
                path: documentPath,
                timestamp: new Date(),
                status: 'failed',
                error: error.message
            });
            
        } catch (rollbackError) {
            console.error(`   ❌ Rollback failed: ${rollbackError.message}`);
            this.emit('rollback-failed', {
                transactionId,
                path: documentPath,
                error: rollbackError.message
            });
        }
    }

    /**
     * Create backup of existing document
     */
    async createBackup(documentPath, transactionId) {
        if (!fs.existsSync(documentPath)) {
            return null;
        }
        
        const backupName = `${path.basename(documentPath)}.${transactionId}.backup`;
        const backupPath = path.join(this.config.backupDir, backupName);
        
        try {
            // Copy file to backup
            fs.copyFileSync(documentPath, backupPath);
            
            // Calculate checksum
            const checksum = await this.calculateFileChecksum(backupPath);
            
            // Store backup info
            const backup = {
                transactionId,
                path: backupPath,
                originalPath: documentPath,
                checksum,
                timestamp: new Date()
            };
            
            // Track backup
            if (!this.documentBackups.has(documentPath)) {
                this.documentBackups.set(documentPath, []);
            }
            this.documentBackups.get(documentPath).push(backup);
            
            console.log(`   📋 Created backup: ${backupName}`);
            
            return backup;
            
        } catch (error) {
            console.warn(`   ⚠️ Backup creation failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Clean up old backups
     */
    async cleanupOldBackups(documentPath) {
        const backups = this.documentBackups.get(documentPath) || [];
        
        if (backups.length > this.config.maxBackups) {
            // Sort by timestamp, oldest first
            backups.sort((a, b) => a.timestamp - b.timestamp);
            
            // Remove old backups
            while (backups.length > this.config.maxBackups) {
                const oldBackup = backups.shift();
                
                try {
                    if (fs.existsSync(oldBackup.path)) {
                        fs.unlinkSync(oldBackup.path);
                        console.log(`   🗑️ Removed old backup: ${path.basename(oldBackup.path)}`);
                    }
                } catch (error) {
                    console.warn(`Failed to remove backup: ${error.message}`);
                }
            }
        }
    }

    /**
     * Lock management
     */
    async acquireLock(documentPath, transactionId) {
        // Check for existing lock
        if (this.activeLocks.has(documentPath)) {
            const lock = this.activeLocks.get(documentPath);
            const lockAge = Date.now() - lock.timestamp;
            
            if (lockAge < this.config.lockTimeout) {
                this.stats.conflicts++;
                throw new Error(`Document is locked by transaction ${lock.transactionId}`);
            } else {
                // Lock expired, remove it
                console.warn(`   ⚠️ Removing expired lock: ${lock.transactionId}`);
                this.activeLocks.delete(documentPath);
            }
        }
        
        // Create new lock
        this.activeLocks.set(documentPath, {
            transactionId,
            timestamp: Date.now()
        });
    }

    releaseLock(documentPath) {
        this.activeLocks.delete(documentPath);
    }

    /**
     * Write content to temporary file
     */
    async writeToTemp(tempPath, content) {
        const dir = path.dirname(tempPath);
        
        // Ensure directory exists
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // Write with sync to ensure data is flushed
        const fd = fs.openSync(tempPath, 'w');
        fs.writeSync(fd, content);
        fs.fsyncSync(fd);
        fs.closeSync(fd);
    }

    /**
     * Calculate checksum
     */
    calculateChecksum(content) {
        return crypto
            .createHash(this.config.checksumAlgorithm)
            .update(content)
            .digest('hex');
    }

    async calculateFileChecksum(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        return this.calculateChecksum(content);
    }

    /**
     * Generate transaction ID
     */
    generateTransactionId() {
        return `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get temp file path
     */
    getTempPath(transactionId) {
        return path.join(this.config.tempDir, `${transactionId}.tmp`);
    }

    /**
     * Ensure required directories exist
     */
    ensureDirectories() {
        const dirs = [this.config.backupDir, this.config.tempDir];
        
        for (const dir of dirs) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        }
    }

    /**
     * Batch save multiple documents
     */
    async saveDocumentBatch(documents) {
        const results = {
            total: documents.length,
            succeeded: 0,
            failed: 0,
            documents: []
        };
        
        console.log(`\n📦 Batch saving ${documents.length} documents...`);
        
        for (const doc of documents) {
            try {
                const result = await this.saveDocument(
                    doc.path,
                    doc.content,
                    doc.metadata
                );
                
                results.succeeded++;
                results.documents.push({
                    path: doc.path,
                    success: true,
                    ...result
                });
                
            } catch (error) {
                results.failed++;
                results.documents.push({
                    path: doc.path,
                    success: false,
                    error: error.message
                });
            }
        }
        
        console.log(`\n📊 Batch save complete:`);
        console.log(`   ✅ Succeeded: ${results.succeeded}`);
        console.log(`   ❌ Failed: ${results.failed}`);
        
        return results;
    }

    /**
     * Restore document from backup
     */
    async restoreFromBackup(documentPath, backupId = null) {
        const backups = this.documentBackups.get(documentPath) || [];
        
        if (backups.length === 0) {
            throw new Error('No backups available');
        }
        
        // Find specific backup or use latest
        const backup = backupId 
            ? backups.find(b => b.transactionId === backupId)
            : backups[backups.length - 1];
            
        if (!backup) {
            throw new Error('Backup not found');
        }
        
        if (!fs.existsSync(backup.path)) {
            throw new Error('Backup file missing');
        }
        
        // Restore
        fs.copyFileSync(backup.path, documentPath);
        
        console.log(`✅ Restored document from backup: ${backup.transactionId}`);
        
        return {
            restored: true,
            backup: backup.transactionId,
            timestamp: backup.timestamp
        };
    }

    /**
     * Get document history
     */
    getDocumentHistory(documentPath) {
        const backups = this.documentBackups.get(documentPath) || [];
        const transactions = this.transactionLog.filter(t => t.path === documentPath);
        
        return {
            backups: backups.map(b => ({
                id: b.transactionId,
                timestamp: b.timestamp,
                checksum: b.checksum,
                available: fs.existsSync(b.path)
            })),
            transactions: transactions
        };
    }

    /**
     * Get statistics
     */
    getStatistics() {
        return {
            ...this.stats,
            activeLocks: this.activeLocks.size,
            totalBackups: Array.from(this.documentBackups.values())
                .reduce((sum, backups) => sum + backups.length, 0),
            transactionHistory: this.transactionLog.length
        };
    }

    /**
     * Clear old transaction logs
     */
    clearOldTransactions(daysToKeep = 7) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysToKeep);
        
        const before = this.transactionLog.length;
        this.transactionLog = this.transactionLog.filter(
            t => new Date(t.timestamp) > cutoff
        );
        const removed = before - this.transactionLog.length;
        
        console.log(`🗑️ Cleared ${removed} old transactions`);
        
        return removed;
    }
}

module.exports = AtomicDocumentManager;
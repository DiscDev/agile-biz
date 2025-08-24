/**
 * State Protection Layer
 * 
 * Provides corruption prevention and atomic state operations
 * Part of Phase 2: State Protection & Recovery
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { 
    validateWorkflowState,
    createWorkflowError,
    ERROR_TYPES 
} = require('./scripts/workflow-error-handler');

class StateProtectionLayer {
    constructor() {
        this.stateDir = path.join(__dirname, '../project-state/workflow-states');
        this.backupDir = path.join(this.stateDir, 'backups');
        this.checksumFile = path.join(this.stateDir, 'state-checksums.json');
        
        // Ensure directories exist
        this.ensureDirectories();
        
        // Load existing checksums
        this.checksums = this.loadChecksums();
    }

    /**
     * Ensure required directories exist
     */
    ensureDirectories() {
        [this.stateDir, this.backupDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    /**
     * Load existing checksums
     */
    loadChecksums() {
        try {
            if (fs.existsSync(this.checksumFile)) {
                return JSON.parse(fs.readFileSync(this.checksumFile, 'utf8'));
            }
        } catch (error) {
            console.warn('Failed to load checksums, starting fresh:', error.message);
        }
        return {};
    }

    /**
     * Save checksums
     */
    saveChecksums() {
        try {
            fs.writeFileSync(this.checksumFile, JSON.stringify(this.checksums, null, 2));
        } catch (error) {
            console.error('Failed to save checksums:', error.message);
        }
    }

    /**
     * Calculate checksum for state object
     */
    calculateChecksum(state) {
        const stateString = JSON.stringify(state, Object.keys(state).sort());
        return crypto.createHash('sha256').update(stateString).digest('hex');
    }

    /**
     * Validate state before save
     */
    async validateBeforeSave(state) {
        // Run built-in validation
        const errors = validateWorkflowState(state);
        
        // Additional validation rules
        if (state.phase_index !== undefined) {
            if (state.phases_completed && state.phases_completed.length > state.phase_index + 1) {
                errors.push('Phases completed count exceeds current phase index');
            }
        }
        
        // Check for required nested structures
        if (!state.phase_details || typeof state.phase_details !== 'object') {
            errors.push('Missing or invalid phase_details');
        }
        
        if (!state.checkpoints || typeof state.checkpoints !== 'object') {
            errors.push('Missing or invalid checkpoints structure');
        }
        
        // Validate approval gates structure
        if (state.approval_gates) {
            for (const [gateName, gate] of Object.entries(state.approval_gates)) {
                if (typeof gate !== 'object' || gate === null) {
                    errors.push(`Invalid approval gate structure for ${gateName}`);
                }
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Create atomic backup before save
     */
    async createBackup(statePath) {
        if (!fs.existsSync(statePath)) {
            return null;
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `state-backup-${timestamp}.json`;
        const backupPath = path.join(this.backupDir, backupName);
        
        try {
            fs.copyFileSync(statePath, backupPath);
            
            // Keep only last 10 backups
            this.cleanOldBackups();
            
            return backupPath;
        } catch (error) {
            throw new Error(`Failed to create backup: ${error.message}`);
        }
    }

    /**
     * Clean old backups, keeping only the most recent
     */
    cleanOldBackups() {
        try {
            const backups = fs.readdirSync(this.backupDir)
                .filter(f => f.startsWith('state-backup-'))
                .sort()
                .reverse();
            
            // Keep last 10 backups
            const toDelete = backups.slice(10);
            toDelete.forEach(backup => {
                fs.unlinkSync(path.join(this.backupDir, backup));
            });
        } catch (error) {
            console.warn('Failed to clean old backups:', error.message);
        }
    }

    /**
     * Save state with protection
     */
    async saveState(state, statePath = null) {
        const targetPath = statePath || path.join(this.stateDir, 'current-workflow.json');
        
        // Step 1: Validate state
        const validation = await this.validateBeforeSave(state);
        if (!validation.isValid) {
            throw createWorkflowError(
                ERROR_TYPES.STATE_CORRUPTION,
                'Invalid state detected before save',
                { validation_errors: validation.errors }
            );
        }
        
        // Step 2: Create backup
        const backupPath = await this.createBackup(targetPath);
        
        try {
            // Step 3: Atomic save with temporary file
            const tempPath = `${targetPath}.tmp`;
            const checksum = this.calculateChecksum(state);
            
            // Write to temporary file first
            fs.writeFileSync(tempPath, JSON.stringify(state, null, 2));
            
            // Verify write succeeded
            const written = fs.readFileSync(tempPath, 'utf8');
            const writtenState = JSON.parse(written);
            const writtenChecksum = this.calculateChecksum(writtenState);
            
            if (writtenChecksum !== checksum) {
                throw new Error('Checksum mismatch after write');
            }
            
            // Atomic rename
            fs.renameSync(tempPath, targetPath);
            
            // Step 4: Update checksum record
            this.checksums[targetPath] = checksum;
            this.saveChecksums();
            
            // Step 5: Verify final integrity
            await this.verifyIntegrity(targetPath);
            
            return {
                success: true,
                path: targetPath,
                checksum,
                backupPath
            };
            
        } catch (error) {
            // Rollback on failure
            if (backupPath) {
                await this.rollback(backupPath, targetPath);
            }
            
            throw createWorkflowError(
                ERROR_TYPES.STATE_CORRUPTION,
                `Failed to save state: ${error.message}`,
                { original_error: error.message }
            );
        }
    }

    /**
     * Verify state file integrity
     */
    async verifyIntegrity(statePath) {
        try {
            const content = fs.readFileSync(statePath, 'utf8');
            const state = JSON.parse(content);
            const currentChecksum = this.calculateChecksum(state);
            const storedChecksum = this.checksums[statePath];
            
            if (storedChecksum && currentChecksum !== storedChecksum) {
                throw new Error('State file corruption detected - checksum mismatch');
            }
            
            // Update checksum if not stored
            if (!storedChecksum) {
                this.checksums[statePath] = currentChecksum;
                this.saveChecksums();
            }
            
            return {
                valid: true,
                checksum: currentChecksum
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }

    /**
     * Rollback to backup
     */
    async rollback(backupPath, targetPath) {
        try {
            if (fs.existsSync(backupPath)) {
                fs.copyFileSync(backupPath, targetPath);
                console.log(`State rolled back from backup: ${backupPath}`);
                return true;
            }
        } catch (error) {
            console.error(`Rollback failed: ${error.message}`);
        }
        return false;
    }

    /**
     * Load state with integrity check
     */
    async loadState(statePath) {
        const fullPath = statePath || path.join(this.stateDir, 'current-workflow.json');
        
        if (!fs.existsSync(fullPath)) {
            return null;
        }
        
        // Verify integrity before loading
        const integrity = await this.verifyIntegrity(fullPath);
        if (!integrity.valid) {
            // Try to recover from backup
            const recovered = await this.recoverFromLatestBackup(fullPath);
            if (!recovered) {
                throw createWorkflowError(
                    ERROR_TYPES.STATE_CORRUPTION,
                    'State file corrupted and recovery failed',
                    { integrity_error: integrity.error }
                );
            }
        }
        
        try {
            const content = fs.readFileSync(fullPath, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            throw createWorkflowError(
                ERROR_TYPES.FILE_ACCESS,
                `Failed to load state: ${error.message}`,
                { path: fullPath }
            );
        }
    }

    /**
     * Recover from latest backup
     */
    async recoverFromLatestBackup(targetPath) {
        try {
            const backups = fs.readdirSync(this.backupDir)
                .filter(f => f.startsWith('state-backup-'))
                .sort()
                .reverse();
            
            if (backups.length === 0) {
                return false;
            }
            
            // Try backups in order until we find a valid one
            for (const backup of backups) {
                const backupPath = path.join(this.backupDir, backup);
                const integrity = await this.verifyIntegrity(backupPath);
                
                if (integrity.valid) {
                    fs.copyFileSync(backupPath, targetPath);
                    console.log(`Recovered state from backup: ${backup}`);
                    return true;
                }
            }
        } catch (error) {
            console.error(`Recovery failed: ${error.message}`);
        }
        
        return false;
    }

    /**
     * Create a state snapshot
     */
    async createSnapshot(snapshotName) {
        const currentState = await this.loadState();
        if (!currentState) {
            throw new Error('No current state to snapshot');
        }
        
        const snapshotPath = path.join(this.stateDir, 'snapshots', `${snapshotName}.json`);
        const snapshotDir = path.dirname(snapshotPath);
        
        if (!fs.existsSync(snapshotDir)) {
            fs.mkdirSync(snapshotDir, { recursive: true });
        }
        
        await this.saveState(currentState, snapshotPath);
        
        return {
            name: snapshotName,
            path: snapshotPath,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * List available snapshots
     */
    listSnapshots() {
        const snapshotDir = path.join(this.stateDir, 'snapshots');
        
        if (!fs.existsSync(snapshotDir)) {
            return [];
        }
        
        return fs.readdirSync(snapshotDir)
            .filter(f => f.endsWith('.json'))
            .map(f => ({
                name: f.replace('.json', ''),
                path: path.join(snapshotDir, f),
                created: fs.statSync(path.join(snapshotDir, f)).mtime
            }))
            .sort((a, b) => b.created - a.created);
    }

    /**
     * Restore from snapshot
     */
    async restoreSnapshot(snapshotName) {
        const snapshotPath = path.join(this.stateDir, 'snapshots', `${snapshotName}.json`);
        
        if (!fs.existsSync(snapshotPath)) {
            throw new Error(`Snapshot not found: ${snapshotName}`);
        }
        
        const snapshotState = await this.loadState(snapshotPath);
        const currentPath = path.join(this.stateDir, 'current-workflow.json');
        
        // Create backup of current state before restoring
        await this.createBackup(currentPath);
        
        // Restore snapshot
        await this.saveState(snapshotState, currentPath);
        
        return {
            success: true,
            message: `Restored from snapshot: ${snapshotName}`
        };
    }
}

module.exports = StateProtectionLayer;
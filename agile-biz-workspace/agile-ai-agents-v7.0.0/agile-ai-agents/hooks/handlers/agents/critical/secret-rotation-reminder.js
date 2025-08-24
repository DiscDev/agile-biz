const BaseAgentHook = require('../../shared/base-agent-hook');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

/**
 * Secret Rotation Reminder Hook
 * Tracks secret age and reminds about rotation schedules
 * Monitors environment variables, API keys, certificates, and tokens
 */
class SecretRotationReminder extends BaseAgentHook {
  constructor(config = {}) {
    super({
      name: 'secret-rotation-reminder',
      agent: 'security_agent',
      category: 'critical',
      impact: 'low', // Just checks metadata, doesn't access secrets
      cacheEnabled: true,
      cacheTTL: 3600000, // 1 hour
      ...config
    });

    // Rotation schedules in days
    this.rotationSchedules = {
      api_key: config.config?.schedules?.api_key ?? 90,
      password: config.config?.schedules?.password ?? 60,
      oauth_token: config.config?.schedules?.oauth_token ?? 365,
      jwt_secret: config.config?.schedules?.jwt_secret ?? 180,
      database_password: config.config?.schedules?.database_password ?? 90,
      encryption_key: config.config?.schedules?.encryption_key ?? 365,
      certificate: config.config?.schedules?.certificate ?? 365,
      ssh_key: config.config?.schedules?.ssh_key ?? 365,
      webhook_secret: config.config?.schedules?.webhook_secret ?? 180,
      service_account: config.config?.schedules?.service_account ?? 90
    };

    // Warning thresholds (days before expiry)
    this.warningThresholds = {
      critical: config.config?.warningDays?.critical ?? 7,
      warning: config.config?.warningDays?.warning ?? 30,
      info: config.config?.warningDays?.info ?? 60
    };

    // Secret patterns to detect in .env files
    this.secretPatterns = [
      { pattern: /API_KEY/i, type: 'api_key' },
      { pattern: /PASSWORD/i, type: 'password' },
      { pattern: /SECRET/i, type: 'jwt_secret' },
      { pattern: /TOKEN/i, type: 'oauth_token' },
      { pattern: /DATABASE.*PASS/i, type: 'database_password' },
      { pattern: /DB.*PASS/i, type: 'database_password' },
      { pattern: /ENCRYPTION_KEY/i, type: 'encryption_key' },
      { pattern: /PRIVATE_KEY/i, type: 'ssh_key' },
      { pattern: /WEBHOOK.*SECRET/i, type: 'webhook_secret' },
      { pattern: /SERVICE_ACCOUNT/i, type: 'service_account' },
      { pattern: /CERT/i, type: 'certificate' }
    ];

    // Metadata storage
    this.metadataFile = '.secret-rotation-metadata.json';
  }

  async handle(context) {
    const { projectPath, action, trigger } = context;

    // Check on various triggers
    if (!['daily-check', 'deployment', 'security-scan', 'manual-check'].includes(trigger)) {
      return { skipped: true, reason: 'Not a secret rotation check trigger' };
    }

    try {
      // Load or initialize metadata
      const metadata = await this.loadMetadata(projectPath);
      
      // Scan for secrets
      const secrets = await this.scanForSecrets(projectPath);
      
      // Update metadata with new secrets
      const updatedMetadata = await this.updateMetadata(metadata, secrets, projectPath);
      
      // Check rotation schedules
      const rotationStatus = this.checkRotationSchedules(updatedMetadata);
      
      // Save updated metadata
      await this.saveMetadata(projectPath, updatedMetadata);
      
      // Generate notifications
      const notifications = this.generateNotifications(rotationStatus);

      return {
        success: true,
        totalSecrets: Object.keys(updatedMetadata.secrets).length,
        rotationStatus,
        notifications,
        blocked: rotationStatus.critical.length > 0 && context.blockOnCritical,
        message: this.generateMessage(rotationStatus, notifications)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `⚠️ Secret rotation check failed: ${error.message}`
      };
    }
  }

  async loadMetadata(projectPath) {
    const metadataPath = path.join(projectPath, this.metadataFile);
    
    try {
      if (await fs.pathExists(metadataPath)) {
        return await fs.readJSON(metadataPath);
      }
    } catch (error) {
      console.error('[SecretRotationReminder] Error loading metadata:', error);
    }

    // Initialize metadata
    return {
      version: '1.0',
      secrets: {},
      lastScan: null,
      rotationHistory: []
    };
  }

  async scanForSecrets(projectPath) {
    const secrets = [];
    const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];
    
    // Scan environment files
    for (const envFile of envFiles) {
      const envPath = path.join(projectPath, envFile);
      if (await fs.pathExists(envPath)) {
        const content = await fs.readFile(envPath, 'utf8');
        const envSecrets = this.parseEnvFile(content, envFile);
        secrets.push(...envSecrets);
      }
    }

    // Scan for certificates
    const certPaths = ['certs', 'certificates', 'ssl', '.ssl'];
    for (const certPath of certPaths) {
      const fullPath = path.join(projectPath, certPath);
      if (await fs.pathExists(fullPath)) {
        const certSecrets = await this.scanCertificates(fullPath);
        secrets.push(...certSecrets);
      }
    }

    // Scan for key files
    const keyPatterns = ['*.pem', '*.key', '*.p12', '*.pfx'];
    const keySecrets = await this.scanKeyFiles(projectPath, keyPatterns);
    secrets.push(...keySecrets);

    return secrets;
  }

  parseEnvFile(content, filename) {
    const secrets = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || !line.trim()) return;
      
      const match = line.match(/^([A-Z_]+)=(.*)$/);
      if (match) {
        const [, key, value] = match;
        
        // Check if this looks like a secret
        for (const { pattern, type } of this.secretPatterns) {
          if (pattern.test(key)) {
            secrets.push({
              name: key,
              type,
              location: `${filename}:${index + 1}`,
              hash: this.hashValue(value)
            });
            break;
          }
        }
      }
    });

    return secrets;
  }

  async scanCertificates(certPath) {
    const secrets = [];
    
    try {
      const files = await fs.readdir(certPath);
      const certFiles = files.filter(f => 
        f.endsWith('.crt') || f.endsWith('.cert') || f.endsWith('.pem')
      );

      for (const file of certFiles) {
        const filePath = path.join(certPath, file);
        const stats = await fs.stat(filePath);
        
        // Try to read certificate info (simplified)
        const content = await fs.readFile(filePath, 'utf8');
        const expiryMatch = content.match(/Not After\s*:\s*(.+)$/m);
        
        secrets.push({
          name: file,
          type: 'certificate',
          location: filePath,
          created: stats.birthtime,
          expiry: expiryMatch ? new Date(expiryMatch[1]) : null
        });
      }
    } catch (error) {
      console.error('[SecretRotationReminder] Error scanning certificates:', error);
    }

    return secrets;
  }

  async scanKeyFiles(projectPath, patterns) {
    const secrets = [];
    
    // Simplified key file scanning
    const sshPath = path.join(projectPath, '.ssh');
    if (await fs.pathExists(sshPath)) {
      try {
        const files = await fs.readdir(sshPath);
        const keyFiles = files.filter(f => 
          f.endsWith('.pem') || f.endsWith('.key') || f === 'id_rsa' || f === 'id_ed25519'
        );

        for (const file of keyFiles) {
          const filePath = path.join(sshPath, file);
          const stats = await fs.stat(filePath);
          
          secrets.push({
            name: file,
            type: 'ssh_key',
            location: filePath,
            created: stats.birthtime
          });
        }
      } catch (error) {
        // Ignore permission errors
      }
    }

    return secrets;
  }

  hashValue(value) {
    // Create a hash of the secret value for comparison
    // This allows us to detect when a secret has changed
    return crypto.createHash('sha256').update(value).digest('hex').substring(0, 16);
  }

  async updateMetadata(metadata, secrets, projectPath) {
    const now = new Date();
    metadata.lastScan = now.toISOString();

    // Update or add secrets
    for (const secret of secrets) {
      const key = `${secret.type}:${secret.name}`;
      
      if (!metadata.secrets[key]) {
        // New secret
        metadata.secrets[key] = {
          ...secret,
          firstSeen: now.toISOString(),
          lastRotated: now.toISOString(),
          rotationCount: 0
        };
      } else {
        // Existing secret - check if it changed
        const existing = metadata.secrets[key];
        if (secret.hash && existing.hash !== secret.hash) {
          // Secret was rotated
          metadata.secrets[key] = {
            ...existing,
            ...secret,
            lastRotated: now.toISOString(),
            rotationCount: existing.rotationCount + 1,
            previousRotation: existing.lastRotated
          };

          // Add to rotation history
          metadata.rotationHistory.push({
            secret: key,
            rotatedAt: now.toISOString(),
            previousRotation: existing.lastRotated
          });
        }
      }
    }

    // Clean up old rotation history (keep last 100)
    if (metadata.rotationHistory.length > 100) {
      metadata.rotationHistory = metadata.rotationHistory.slice(-100);
    }

    return metadata;
  }

  checkRotationSchedules(metadata) {
    const now = new Date();
    const status = {
      critical: [],
      warning: [],
      info: [],
      healthy: []
    };

    for (const [key, secret] of Object.entries(metadata.secrets)) {
      const lastRotated = new Date(secret.lastRotated);
      const daysSinceRotation = Math.floor((now - lastRotated) / (1000 * 60 * 60 * 24));
      const rotationSchedule = this.rotationSchedules[secret.type] || 90;
      const daysUntilRotation = rotationSchedule - daysSinceRotation;

      const secretInfo = {
        name: secret.name,
        type: secret.type,
        location: secret.location,
        lastRotated: secret.lastRotated,
        daysSinceRotation,
        daysUntilRotation,
        rotationSchedule,
        rotationCount: secret.rotationCount
      };

      if (daysUntilRotation <= 0) {
        secretInfo.status = 'overdue';
        secretInfo.overdueDays = Math.abs(daysUntilRotation);
        status.critical.push(secretInfo);
      } else if (daysUntilRotation <= this.warningThresholds.critical) {
        secretInfo.status = 'critical';
        status.critical.push(secretInfo);
      } else if (daysUntilRotation <= this.warningThresholds.warning) {
        secretInfo.status = 'warning';
        status.warning.push(secretInfo);
      } else if (daysUntilRotation <= this.warningThresholds.info) {
        secretInfo.status = 'info';
        status.info.push(secretInfo);
      } else {
        secretInfo.status = 'healthy';
        status.healthy.push(secretInfo);
      }
    }

    return status;
  }

  generateNotifications(rotationStatus) {
    const notifications = [];

    // Critical notifications
    for (const secret of rotationStatus.critical) {
      notifications.push({
        level: 'critical',
        secret: secret.name,
        message: secret.status === 'overdue' 
          ? `${secret.type} "${secret.name}" is ${secret.overdueDays} days overdue for rotation!`
          : `${secret.type} "${secret.name}" expires in ${secret.daysUntilRotation} days`,
        action: `Rotate immediately`,
        location: secret.location
      });
    }

    // Warning notifications
    for (const secret of rotationStatus.warning) {
      notifications.push({
        level: 'warning',
        secret: secret.name,
        message: `${secret.type} "${secret.name}" should be rotated within ${secret.daysUntilRotation} days`,
        action: `Schedule rotation`,
        location: secret.location
      });
    }

    // Info notifications (only first 3)
    for (const secret of rotationStatus.info.slice(0, 3)) {
      notifications.push({
        level: 'info',
        secret: secret.name,
        message: `${secret.type} "${secret.name}" rotation due in ${secret.daysUntilRotation} days`,
        action: `Plan rotation`,
        location: secret.location
      });
    }

    return notifications;
  }

  async saveMetadata(projectPath, metadata) {
    const metadataPath = path.join(projectPath, this.metadataFile);
    
    try {
      await fs.writeJSON(metadataPath, metadata, { spaces: 2 });
      
      // Add to .gitignore if not already there
      const gitignorePath = path.join(projectPath, '.gitignore');
      if (await fs.pathExists(gitignorePath)) {
        const gitignore = await fs.readFile(gitignorePath, 'utf8');
        if (!gitignore.includes(this.metadataFile)) {
          await fs.appendFile(gitignorePath, `\n${this.metadataFile}\n`);
        }
      }
    } catch (error) {
      console.error('[SecretRotationReminder] Error saving metadata:', error);
    }
  }

  generateMessage(rotationStatus, notifications) {
    const criticalCount = rotationStatus.critical.length;
    const warningCount = rotationStatus.warning.length;
    const totalSecrets = Object.values(rotationStatus).reduce((sum, arr) => sum + arr.length, 0);

    if (criticalCount > 0) {
      const overdue = rotationStatus.critical.filter(s => s.status === 'overdue').length;
      if (overdue > 0) {
        return `🚨 ${overdue} secrets are OVERDUE for rotation! ${criticalCount - overdue} expire soon.`;
      }
      return `⚠️ ${criticalCount} secrets require immediate rotation (expire within ${this.warningThresholds.critical} days)`;
    }

    if (warningCount > 0) {
      return `⚠️ ${warningCount} secrets should be rotated soon (expire within ${this.warningThresholds.warning} days)`;
    }

    return `✅ All ${totalSecrets} tracked secrets are within rotation schedule`;
  }

  getDescription() {
    return 'Tracks secret age and reminds about rotation schedules';
  }

  getConfigurableOptions() {
    return {
      schedules: {
        type: 'object',
        default: {
          api_key: 90,
          password: 60,
          oauth_token: 365,
          jwt_secret: 180,
          database_password: 90,
          encryption_key: 365,
          certificate: 365,
          ssh_key: 365,
          webhook_secret: 180,
          service_account: 90
        },
        description: 'Rotation schedules in days for different secret types'
      },
      warningDays: {
        critical: {
          type: 'number',
          default: 7,
          description: 'Days before expiry to trigger critical warning'
        },
        warning: {
          type: 'number',
          default: 30,
          description: 'Days before expiry to trigger warning'
        },
        info: {
          type: 'number',
          default: 60,
          description: 'Days before expiry to trigger info'
        }
      },
      blockOnCritical: {
        type: 'boolean',
        default: false,
        description: 'Block deployments if critical secrets need rotation'
      },
      scanPaths: {
        type: 'array',
        default: ['.env', '.env.*', 'config/', 'certs/', '.ssh/'],
        description: 'Paths to scan for secrets'
      }
    };
  }
}

module.exports = SecretRotationReminder;
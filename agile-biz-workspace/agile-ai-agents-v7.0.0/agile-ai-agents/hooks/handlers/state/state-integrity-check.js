#!/usr/bin/env node

/**
 * State Integrity Check Hook Handler
 * Validates project state files for consistency and corruption
 */

const fs = require('fs');
const path = require('path');

class StateIntegrityChecker {
  constructor() {
    this.context = this.parseContext();
    this.projectRoot = path.join(__dirname, '../../..');
    this.stateDir = path.join(this.projectRoot, 'project-state');
    this.validationRules = this.loadValidationRules();
  }

  parseContext() {
    return {
      filePath: process.env.FILE_PATH || process.argv[2],
      activeAgent: process.env.ACTIVE_AGENT || 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  loadValidationRules() {
    return {
      'runtime.json': {
        required: ['version', 'project_id', 'created_at', 'last_updated'],
        schema: {
          version: 'string',
          project_id: 'string',
          created_at: 'string',
          last_updated: 'string',
          current_task: 'object',
          active_sprint: 'object',
          recent_decisions: 'array',
          recent_files: 'array'
        }
      },
      'runtime.json': {
        required: ['active_workflow', 'workflow_phase'],
        schema: {
          active_workflow: ['string', 'null'],
          workflow_phase: ['string', 'null'],
          sections_completed: 'array',
          approvals: 'object'
        }
      },
      'persistent.json': {
        required: ['decisions'],
        schema: {
          decisions: 'array',
          total_count: 'number',
          last_updated: 'string'
        }
      }
    };
  }

  async execute() {
    try {
      const { filePath } = this.context;
      
      if (!filePath || !this.isStateFile(filePath)) {
        return { status: 'skipped', reason: 'Not a state file' };
      }

      // Perform integrity checks
      const checks = await this.performChecks(filePath);
      
      // Auto-repair if possible
      if (checks.hasErrors && checks.repairable) {
        const repaired = await this.attemptRepair(filePath, checks.errors);
        if (repaired) {
          checks.repaired = true;
          checks.hasErrors = false;
        }
      }

      // Generate report
      const report = this.generateReport(filePath, checks);
      
      return {
        status: checks.hasErrors ? 'error' : 'success',
        file: path.basename(filePath),
        checks,
        report
      };

    } catch (error) {
      console.error('State integrity check failed:', error);
      throw error;
    }
  }

  isStateFile(filePath) {
    return filePath.includes('/project-state/') && filePath.endsWith('.json');
  }

  async performChecks(filePath) {
    const checks = {
      exists: false,
      readable: false,
      validJson: false,
      schemaValid: false,
      crossReferences: false,
      consistency: false,
      hasErrors: false,
      repairable: false,
      errors: []
    };

    // Check 1: File exists
    if (!fs.existsSync(filePath)) {
      checks.hasErrors = true;
      checks.errors.push({ type: 'missing', message: 'File does not exist' });
      return checks;
    }
    checks.exists = true;

    // Check 2: File is readable
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      checks.readable = true;

      // Check 3: Valid JSON
      let data;
      try {
        data = JSON.parse(content);
        checks.validJson = true;
      } catch (error) {
        checks.hasErrors = true;
        checks.repairable = true;
        checks.errors.push({ 
          type: 'json_parse', 
          message: 'Invalid JSON format',
          details: error.message 
        });
        return checks;
      }

      // Check 4: Schema validation
      const schemaErrors = this.validateSchema(filePath, data);
      if (schemaErrors.length === 0) {
        checks.schemaValid = true;
      } else {
        checks.hasErrors = true;
        checks.repairable = true;
        checks.errors.push(...schemaErrors);
      }

      // Check 5: Cross-reference validation
      const crossRefErrors = await this.validateCrossReferences(filePath, data);
      if (crossRefErrors.length === 0) {
        checks.crossReferences = true;
      } else {
        checks.errors.push(...crossRefErrors);
      }

      // Check 6: Consistency checks
      const consistencyErrors = this.validateConsistency(filePath, data);
      if (consistencyErrors.length === 0) {
        checks.consistency = true;
      } else {
        checks.hasErrors = true;
        checks.errors.push(...consistencyErrors);
      }

    } catch (error) {
      checks.hasErrors = true;
      checks.errors.push({ 
        type: 'read_error', 
        message: 'Cannot read file',
        details: error.message 
      });
    }

    return checks;
  }

  validateSchema(filePath, data) {
    const errors = [];
    const fileName = path.basename(filePath);
    const rules = this.validationRules[fileName];

    if (!rules) {
      return errors; // No rules defined for this file
    }

    // Check required fields
    if (rules.required) {
      for (const field of rules.required) {
        if (!data.hasOwnProperty(field)) {
          errors.push({
            type: 'missing_field',
            message: `Required field '${field}' is missing`,
            field,
            repairable: true
          });
        }
      }
    }

    // Check field types
    if (rules.schema) {
      for (const [field, expectedType] of Object.entries(rules.schema)) {
        if (data.hasOwnProperty(field)) {
          const actualType = Array.isArray(data[field]) ? 'array' : typeof data[field];
          
          if (Array.isArray(expectedType)) {
            if (!expectedType.includes(actualType)) {
              errors.push({
                type: 'type_mismatch',
                message: `Field '${field}' should be one of [${expectedType.join(', ')}], got ${actualType}`,
                field,
                expectedType,
                actualType
              });
            }
          } else if (actualType !== expectedType) {
            errors.push({
              type: 'type_mismatch',
              message: `Field '${field}' should be ${expectedType}, got ${actualType}`,
              field,
              expectedType,
              actualType
            });
          }
        }
      }
    }

    return errors;
  }

  async validateCrossReferences(filePath, data) {
    const errors = [];
    const fileName = path.basename(filePath);

    // Validate cross-references based on file type
    switch (fileName) {
      case 'runtime.json':
        // Check if referenced sprint exists
        if (data.active_sprint && data.active_sprint.id) {
          const sprintPath = path.join(
            this.projectRoot,
            'project-documents/orchestration/sprints',
            data.active_sprint.id
          );
          if (!fs.existsSync(sprintPath)) {
            errors.push({
              type: 'invalid_reference',
              message: `Referenced sprint '${data.active_sprint.id}' does not exist`,
              reference: 'active_sprint.id'
            });
          }
        }

        // Check if referenced files exist
        if (data.recent_files && Array.isArray(data.recent_files)) {
          for (const file of data.recent_files) {
            const fullPath = path.join(this.projectRoot, file.path);
            if (!fs.existsSync(fullPath)) {
              errors.push({
                type: 'invalid_reference',
                message: `Referenced file '${file.path}' does not exist`,
                reference: 'recent_files'
              });
            }
          }
        }
        break;

      case 'runtime.json':
        // Check if workflow templates exist
        if (data.active_workflow) {
          const workflowPath = path.join(
            this.projectRoot,
            'aaa-documents/workflow-templates',
            `${data.active_workflow}-template.json`
          );
          if (!fs.existsSync(workflowPath)) {
            errors.push({
              type: 'invalid_reference',
              message: `Workflow template '${data.active_workflow}' not found`,
              reference: 'active_workflow'
            });
          }
        }
        break;
    }

    return errors;
  }

  validateConsistency(filePath, data) {
    const errors = [];
    const fileName = path.basename(filePath);

    switch (fileName) {
      case 'runtime.json':
        // Check timestamp consistency
        if (data.created_at && data.last_updated) {
          const created = new Date(data.created_at);
          const updated = new Date(data.last_updated);
          
          if (created > updated) {
            errors.push({
              type: 'consistency_error',
              message: 'created_at is after last_updated',
              details: { created_at: data.created_at, last_updated: data.last_updated }
            });
          }
        }

        // Check array size limits
        if (data.recent_decisions && data.recent_decisions.length > 100) {
          errors.push({
            type: 'size_limit',
            message: 'recent_decisions exceeds maximum size (100)',
            current: data.recent_decisions.length,
            maximum: 100
          });
        }
        break;

      case 'persistent.json':
        // Check decision count consistency
        if (data.decisions && data.total_count) {
          if (data.decisions.length !== data.total_count) {
            errors.push({
              type: 'consistency_error',
              message: 'Decision count mismatch',
              details: { 
                array_length: data.decisions.length, 
                total_count: data.total_count 
              }
            });
          }
        }
        break;
    }

    return errors;
  }

  async attemptRepair(filePath, errors) {
    try {
      let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      let repaired = false;

      for (const error of errors) {
        switch (error.type) {
          case 'missing_field':
            // Add missing required fields with defaults
            if (error.field === 'version') {
              data.version = '1.0.0';
              repaired = true;
            } else if (error.field === 'created_at' || error.field === 'last_updated') {
              data[error.field] = new Date().toISOString();
              repaired = true;
            } else if (error.field === 'decisions') {
              data.decisions = [];
              repaired = true;
            }
            break;

          case 'consistency_error':
            // Fix consistency issues
            if (error.message.includes('created_at is after last_updated')) {
              data.last_updated = new Date().toISOString();
              repaired = true;
            } else if (error.message.includes('Decision count mismatch')) {
              data.total_count = data.decisions.length;
              repaired = true;
            }
            break;

          case 'size_limit':
            // Trim arrays to size limits
            if (error.message.includes('recent_decisions')) {
              data.recent_decisions = data.recent_decisions.slice(-100);
              repaired = true;
            }
            break;
        }
      }

      if (repaired) {
        // Create backup before repair
        const backupPath = filePath + '.backup-' + Date.now();
        fs.copyFileSync(filePath, backupPath);
        
        // Write repaired data
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        
        console.log(`State file repaired: ${path.basename(filePath)}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Repair attempt failed:', error);
      return false;
    }
  }

  generateReport(filePath, checks) {
    const report = {
      file: path.basename(filePath),
      timestamp: this.context.timestamp,
      summary: {
        passed: Object.values(checks).filter(v => v === true).length,
        failed: checks.errors.length,
        repaired: checks.repaired || false
      },
      details: checks
    };

    // Save report if there were issues
    if (checks.hasErrors || checks.repaired) {
      const reportPath = path.join(
        this.stateDir,
        'integrity-reports',
        `${path.basename(filePath, '.json')}-${Date.now()}.json`
      );
      
      const reportDir = path.dirname(reportPath);
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    }

    return report;
  }
}

if (require.main === module) {
  const checker = new StateIntegrityChecker();
  checker.execute()
    .then(result => {
      console.log(JSON.stringify(result));
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = StateIntegrityChecker;
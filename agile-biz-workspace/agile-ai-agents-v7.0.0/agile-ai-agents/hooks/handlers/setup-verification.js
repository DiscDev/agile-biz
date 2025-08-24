/**
 * Setup Verification Handler
 * Performs pre-flight checks before workflow execution
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SetupVerificationHandler {
  constructor(projectRoot) {
    this.projectRoot = projectRoot || process.cwd();
    this.rulesPath = path.join(this.projectRoot, 'machine-data', 'setup-verification-rules.json');
    this.results = {};
    this.hasErrors = false;
    this.hasWarnings = false;
  }

  /**
   * Load verification rules from JSON
   */
  loadRules() {
    try {
      const rulesContent = fs.readFileSync(this.rulesPath, 'utf8');
      this.rules = JSON.parse(rulesContent);
      return true;
    } catch (error) {
      console.error('Failed to load verification rules:', error);
      return false;
    }
  }

  /**
   * Run all verification checks
   */
  async runVerification() {
    if (!this.loadRules()) {
      return {
        success: false,
        error: 'Failed to load verification rules'
      };
    }

    console.log('\n🔍 Running Setup Verification...\n');

    const executionOrder = this.rules.execution_order;
    
    for (const category of executionOrder) {
      await this.verifyCategory(category);
    }

    return this.generateReport();
  }

  /**
   * Verify a specific category of checks
   */
  async verifyCategory(categoryName) {
    const category = this.rules.verification_categories[categoryName];
    if (!category) return;

    console.log(`\n📋 ${categoryName.toUpperCase()} Checks (${category.priority} priority)`);
    console.log('─'.repeat(50));

    this.results[categoryName] = {
      priority: category.priority,
      checks: []
    };

    for (const check of category.checks) {
      const result = await this.performCheck(check);
      this.results[categoryName].checks.push(result);
      this.displayCheckResult(result);
      
      if (!result.success) {
        if (check.required) {
          this.hasErrors = true;
        } else {
          this.hasWarnings = true;
        }
      }
    }
  }

  /**
   * Perform individual check
   */
  async performCheck(check) {
    const result = {
      id: check.id,
      name: check.name,
      required: check.required,
      success: false,
      message: '',
      recovery: check.recovery
    };

    try {
      switch (check.type) {
        case 'file_exists':
          result.success = this.checkFileExists(check.path);
          break;
        
        case 'folder_exists':
          result.success = this.checkFolderExists(check.path);
          break;
        
        case 'file_contains':
          result.success = this.checkFileContains(check.path, check.pattern);
          break;
        
        case 'json_value':
          result.success = this.checkJsonValue(check.path, check.key, check.expected);
          break;
        
        case 'json_valid':
          result.success = this.checkJsonValid(check.path);
          break;
        
        case 'command_exists':
          result.success = this.checkCommandExists(check.command);
          break;
        
        case 'disk_space':
          result.success = await this.checkDiskSpace(check.minimum_gb);
          break;
        
        case 'permissions':
          result.success = this.checkPermissions(check.path, check.permission);
          break;
        
        case 'folder_permissions':
          result.success = this.checkFolderPermissions(check.path, check.permission);
          break;
        
        default:
          result.message = 'Unknown check type';
      }
    } catch (error) {
      result.success = false;
      result.message = error.message;
    }

    return result;
  }

  /**
   * Check if file exists
   */
  checkFileExists(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);
    return fs.existsSync(fullPath) && fs.statSync(fullPath).isFile();
  }

  /**
   * Check if folder exists
   */
  checkFolderExists(folderPath) {
    const fullPath = path.join(this.projectRoot, folderPath);
    return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
  }

  /**
   * Check if file contains pattern
   */
  checkFileContains(filePath, pattern) {
    const fullPath = path.join(this.projectRoot, filePath);
    if (!fs.existsSync(fullPath)) return false;
    
    const content = fs.readFileSync(fullPath, 'utf8');
    return content.includes(pattern);
  }

  /**
   * Check JSON value
   */
  checkJsonValue(filePath, key, expected) {
    const fullPath = path.join(this.projectRoot, filePath);
    if (!fs.existsSync(fullPath)) return false;
    
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const json = JSON.parse(content);
      
      // Handle nested keys
      const keys = key.split('.');
      let value = json;
      for (const k of keys) {
        value = value[k];
        if (value === undefined) return false;
      }
      
      return value === expected;
    } catch {
      return false;
    }
  }

  /**
   * Check if JSON is valid
   */
  checkJsonValid(filePath) {
    const fullPath = path.join(this.projectRoot, filePath);
    if (!fs.existsSync(fullPath)) return false;
    
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if command exists
   */
  checkCommandExists(command) {
    try {
      execSync(`which ${command}`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check disk space (simplified)
   */
  async checkDiskSpace(minimumGb) {
    try {
      const output = execSync('df -BG . | tail -1', { encoding: 'utf8' });
      const available = parseInt(output.split(/\s+/)[3]);
      return available >= minimumGb;
    } catch {
      // Assume sufficient space if check fails
      return true;
    }
  }

  /**
   * Check permissions
   */
  checkPermissions(filePath, permission) {
    const fullPath = path.join(this.projectRoot, filePath);
    if (!fs.existsSync(fullPath)) return false;
    
    try {
      if (permission === 'write') {
        fs.accessSync(fullPath, fs.constants.W_OK);
      } else if (permission === 'read') {
        fs.accessSync(fullPath, fs.constants.R_OK);
      } else if (permission === 'execute') {
        fs.accessSync(fullPath, fs.constants.X_OK);
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check folder permissions
   */
  checkFolderPermissions(folderPath, permission) {
    const fullPath = path.join(this.projectRoot, folderPath);
    if (!fs.existsSync(fullPath)) return false;
    
    return this.checkPermissions(folderPath, permission);
  }

  /**
   * Display check result
   */
  displayCheckResult(result) {
    const symbols = this.rules.display_format;
    let symbol, color;
    
    if (result.success) {
      symbol = symbols.success;
      color = '\x1b[32m'; // green
    } else if (result.required) {
      symbol = symbols.failure;
      color = '\x1b[31m'; // red
    } else {
      symbol = symbols.warning;
      color = '\x1b[33m'; // yellow
    }
    
    const reset = '\x1b[0m';
    const status = result.required ? '(required)' : '(optional)';
    
    console.log(`${color}${symbol}${reset} ${result.name} ${status}`);
    
    if (!result.success && result.recovery) {
      console.log(`  → Recovery: ${result.recovery}`);
    }
  }

  /**
   * Generate final report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    
    let criticalErrors = 0;
    let warnings = 0;
    let passed = 0;
    
    for (const [category, results] of Object.entries(this.results)) {
      for (const check of results.checks) {
        if (check.success) {
          passed++;
        } else if (check.required) {
          criticalErrors++;
        } else {
          warnings++;
        }
      }
    }
    
    console.log(`\n✓ Passed: ${passed}`);
    if (warnings > 0) {
      console.log(`⚠ Warnings: ${warnings}`);
    }
    if (criticalErrors > 0) {
      console.log(`✗ Critical Errors: ${criticalErrors}`);
    }
    
    if (criticalErrors > 0) {
      console.log('\n❌ VERIFICATION FAILED');
      console.log('Please fix the critical errors above before proceeding.');
      return {
        success: false,
        passed,
        warnings,
        errors: criticalErrors,
        canProceed: false
      };
    } else if (warnings > 0) {
      console.log('\n⚠️  VERIFICATION PASSED WITH WARNINGS');
      console.log('You can proceed, but some optional features may not work.');
      return {
        success: true,
        passed,
        warnings,
        errors: 0,
        canProceed: true
      };
    } else {
      console.log('\n✅ ALL CHECKS PASSED');
      console.log('System is ready for workflow execution.');
      return {
        success: true,
        passed,
        warnings: 0,
        errors: 0,
        canProceed: true
      };
    }
  }
}

// Export for use in workflows
module.exports = SetupVerificationHandler;

// Allow direct execution for testing
if (require.main === module) {
  const handler = new SetupVerificationHandler();
  handler.runVerification().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
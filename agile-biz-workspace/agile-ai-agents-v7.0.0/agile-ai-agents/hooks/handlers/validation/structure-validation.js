#!/usr/bin/env node

/**
 * Structure Validation Hook Handler
 * Validates new files against approved project structure template
 */

const fs = require('fs');
const path = require('path');

class StructureValidationHandler {
  constructor() {
    this.context = this.parseContext();
    this.projectRoot = path.join(__dirname, '../../..');
  }

  parseContext() {
    return {
      filePath: process.env.FILE_PATH || process.argv[2],
      activeAgent: process.env.ACTIVE_AGENT || 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  async execute() {
    try {
      const { filePath } = this.context;
      
      if (!filePath) {
        return { status: 'skipped', reason: 'No file path provided' };
      }

      // Skip non-code files
      if (!this.isCodeFile(filePath)) {
        return { status: 'skipped', reason: 'Not a code file' };
      }

      // Load approved structure if exists
      const structurePath = path.join(
        this.projectRoot, 
        'project-state/approved-structure.json'
      );
      
      if (!fs.existsSync(structurePath)) {
        return { status: 'skipped', reason: 'No approved structure found' };
      }

      const approvedStructure = JSON.parse(
        fs.readFileSync(structurePath, 'utf8')
      );

      // Validate file placement
      const validation = this.validateFilePlacement(
        filePath, 
        approvedStructure
      );

      if (!validation.isValid) {
        console.error(`[Structure Validation] ❌ Invalid file placement: ${filePath}`);
        console.error(`Reason: ${validation.reason}`);
        console.error(`Expected: ${validation.expected}`);
        
        // Create warning file
        this.createWarning(filePath, validation);
        
        return {
          status: 'warning',
          validation: validation
        };
      }

      return {
        status: 'success',
        message: 'File placement is valid'
      };
      
    } catch (error) {
      console.error('Structure validation failed:', error);
      throw error;
    }
  }

  isCodeFile(filePath) {
    const codeExtensions = [
      '.js', '.jsx', '.ts', '.tsx',
      '.py', '.php', '.rb', '.go',
      '.java', '.cs', '.cpp', '.c'
    ];
    
    return codeExtensions.some(ext => filePath.endsWith(ext));
  }

  validateFilePlacement(filePath, structure) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    // Extract relative path from project root
    const projectIndex = normalizedPath.lastIndexOf('/agile-ai-agents/');
    if (projectIndex === -1) {
      return { isValid: true }; // Outside project scope
    }
    
    const relativePath = normalizedPath.substring(projectIndex + 16);
    
    // Check against structure rules
    if (structure.type === 'separated-stack') {
      return this.validateSeparatedStack(relativePath, structure);
    } else if (structure.type === 'monolithic') {
      return this.validateMonolithic(relativePath, structure);
    } else if (structure.type === 'microservices') {
      return this.validateMicroservices(relativePath, structure);
    }
    
    return { isValid: true };
  }

  validateSeparatedStack(relativePath, structure) {
    // Frontend files must be in frontend/
    if (this.isFrontendFile(relativePath)) {
      if (!relativePath.startsWith('frontend/')) {
        return {
          isValid: false,
          reason: 'Frontend file outside frontend directory',
          expected: 'frontend/' + path.basename(relativePath)
        };
      }
    }
    
    // Backend files must be in backend/
    if (this.isBackendFile(relativePath)) {
      if (!relativePath.startsWith('backend/')) {
        return {
          isValid: false,
          reason: 'Backend file outside backend directory',
          expected: 'backend/' + path.basename(relativePath)
        };
      }
    }
    
    return { isValid: true };
  }

  validateMonolithic(relativePath, structure) {
    // Framework-specific validation
    if (structure.framework === 'django') {
      // Django apps should be in apps/
      if (relativePath.includes('/models.py') || 
          relativePath.includes('/views.py')) {
        if (!relativePath.startsWith('apps/')) {
          return {
            isValid: false,
            reason: 'Django app file outside apps directory',
            expected: 'apps/' + relativePath
          };
        }
      }
    }
    
    return { isValid: true };
  }

  validateMicroservices(relativePath, structure) {
    // Services must be in services/
    if (!relativePath.startsWith('services/') && 
        !relativePath.startsWith('shared/')) {
      return {
        isValid: false,
        reason: 'Service file outside services directory',
        expected: 'services/[service-name]/' + path.basename(relativePath)
      };
    }
    
    return { isValid: true };
  }

  isFrontendFile(filePath) {
    const frontendIndicators = [
      '.jsx', '.tsx', 'component', 'Component',
      'pages/', 'components/', 'hooks/', 'contexts/'
    ];
    
    return frontendIndicators.some(indicator => 
      filePath.includes(indicator)
    );
  }

  isBackendFile(filePath) {
    const backendIndicators = [
      'controller', 'Controller', 'model', 'Model',
      'routes/', 'controllers/', 'models/', 'services/'
    ];
    
    return backendIndicators.some(indicator => 
      filePath.includes(indicator)
    );
  }

  createWarning(filePath, validation) {
    const warningsPath = path.join(
      this.projectRoot,
      'project-documents/implementation/testing/structure-warnings.md'
    );
    
    const warning = `
## Structure Warning: ${new Date().toISOString()}

**File**: ${filePath}
**Issue**: ${validation.reason}
**Expected Location**: ${validation.expected}
**Agent**: ${this.context.activeAgent}

---
`;
    
    if (fs.existsSync(warningsPath)) {
      fs.appendFileSync(warningsPath, warning);
    } else {
      const content = `# Project Structure Warnings

This file tracks structure validation warnings.

${warning}`;
      fs.writeFileSync(warningsPath, content);
    }
  }
}

if (require.main === module) {
  const handler = new StructureValidationHandler();
  handler.execute()
    .then(result => {
      console.log(JSON.stringify(result));
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = StructureValidationHandler;
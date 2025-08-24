#!/usr/bin/env node

/**
 * Input Security Scan Hook Handler
 * Scans user input for potential security issues
 */

const fs = require('fs');
const path = require('path');

class InputSecurityScanner {
  constructor() {
    this.context = this.parseContext();
    this.projectRoot = path.join(__dirname, '../../..');
    this.patterns = this.loadSecurityPatterns();
    this.whitelist = this.loadWhitelist();
  }

  parseContext() {
    return {
      prompt: process.env.USER_PROMPT || process.argv[2] || '',
      activeAgent: process.env.ACTIVE_AGENT || 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  loadSecurityPatterns() {
    return {
      // API Keys and Tokens
      api_keys: [
        {
          name: 'Generic API Key',
          pattern: /\b[A-Za-z0-9]{32,}\b/g,
          confidence: 0.6,
          severity: 'high'
        },
        {
          name: 'AWS Access Key',
          pattern: /\b(AKIA[0-9A-Z]{16})\b/g,
          confidence: 0.95,
          severity: 'critical'
        },
        {
          name: 'AWS Secret Key',
          pattern: /\b[A-Za-z0-9\/+=]{40}\b/g,
          confidence: 0.7,
          severity: 'critical'
        },
        {
          name: 'GitHub Token',
          pattern: /\b(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59})\b/g,
          confidence: 0.95,
          severity: 'critical'
        },
        {
          name: 'Slack Token',
          pattern: /\b(xox[baprs]-[0-9a-zA-Z\-]+)\b/g,
          confidence: 0.95,
          severity: 'high'
        },
        {
          name: 'Stripe API Key',
          pattern: /\b(sk_live_[0-9a-zA-Z]{24}|pk_live_[0-9a-zA-Z]{24})\b/g,
          confidence: 0.95,
          severity: 'critical'
        },
        {
          name: 'JWT Token',
          pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
          confidence: 0.9,
          severity: 'high'
        }
      ],
      
      // Passwords and Secrets
      passwords: [
        {
          name: 'Password in Text',
          pattern: /(?:password|passwd|pwd|pass)\s*[:=]\s*["']?([^"'\s]+)["']?/gi,
          confidence: 0.8,
          severity: 'critical'
        },
        {
          name: 'Secret in Text',
          pattern: /(?:secret|api_secret|app_secret)\s*[:=]\s*["']?([^"'\s]+)["']?/gi,
          confidence: 0.8,
          severity: 'critical'
        },
        {
          name: 'Database URL with Password',
          pattern: /(?:mongodb|mysql|postgresql|redis):\/\/[^:]+:([^@]+)@/gi,
          confidence: 0.9,
          severity: 'critical'
        }
      ],
      
      // Private Keys
      private_keys: [
        {
          name: 'RSA Private Key',
          pattern: /-----BEGIN RSA PRIVATE KEY-----/g,
          confidence: 1.0,
          severity: 'critical'
        },
        {
          name: 'SSH Private Key',
          pattern: /-----BEGIN OPENSSH PRIVATE KEY-----/g,
          confidence: 1.0,
          severity: 'critical'
        },
        {
          name: 'EC Private Key',
          pattern: /-----BEGIN EC PRIVATE KEY-----/g,
          confidence: 1.0,
          severity: 'critical'
        }
      ],
      
      // Personal Information
      pii: [
        {
          name: 'Email Address',
          pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
          confidence: 0.9,
          severity: 'medium'
        },
        {
          name: 'SSN',
          pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
          confidence: 0.7,
          severity: 'high'
        },
        {
          name: 'Credit Card',
          pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
          confidence: 0.8,
          severity: 'critical'
        },
        {
          name: 'Phone Number',
          pattern: /\b(?:\+?1[-.●]?)?\(?([0-9]{3})\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})\b/g,
          confidence: 0.6,
          severity: 'low'
        }
      ],
      
      // Cloud Credentials
      cloud: [
        {
          name: 'Azure Storage Key',
          pattern: /\b[a-zA-Z0-9+\/]{86}==\b/g,
          confidence: 0.7,
          severity: 'critical'
        },
        {
          name: 'Google Cloud API Key',
          pattern: /\bAIza[0-9A-Za-z\-_]{35}\b/g,
          confidence: 0.95,
          severity: 'critical'
        },
        {
          name: 'Heroku API Key',
          pattern: /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g,
          confidence: 0.5,
          severity: 'high'
        }
      ],
      
      // File Paths
      sensitive_paths: [
        {
          name: 'Private Key Path',
          pattern: /(?:\/home\/|\/Users\/|C:\\Users\\)[^\/\s]+\/\.ssh\/[^\s]+/g,
          confidence: 0.8,
          severity: 'medium'
        },
        {
          name: 'Environment File',
          pattern: /\.env(?:\.local|\.production|\.development)?/g,
          confidence: 0.7,
          severity: 'medium'
        }
      ]
    };
  }

  loadWhitelist() {
    const whitelistPath = path.join(this.projectRoot, 'hooks/config/security-whitelist.json');
    if (fs.existsSync(whitelistPath)) {
      return JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));
    }
    
    return {
      patterns: [
        'EXAMPLE_API_KEY',
        'your-api-key-here',
        'sk_test_',
        'pk_test_'
      ],
      domains: [
        'example.com',
        'test.com',
        'localhost'
      ]
    };
  }

  async execute() {
    try {
      const { prompt } = this.context;
      
      if (!prompt) {
        return { status: 'skipped', reason: 'No prompt to scan' };
      }

      // Perform security scan
      const findings = this.scanForSecrets(prompt);
      
      // Filter out whitelisted items
      const filteredFindings = this.filterWhitelisted(findings);
      
      // Assess risk level
      const riskLevel = this.assessRiskLevel(filteredFindings);
      
      // Log findings if any
      if (filteredFindings.length > 0) {
        this.logFindings(filteredFindings, riskLevel);
      }

      // Prepare response
      const response = {
        status: filteredFindings.length > 0 ? 'warning' : 'success',
        findings: filteredFindings.length,
        riskLevel,
        categories: this.categorizeFindings(filteredFindings)
      };

      // Add remediation suggestions
      if (filteredFindings.length > 0) {
        response.remediation = this.generateRemediation(filteredFindings);
      }

      return response;

    } catch (error) {
      console.error('Security scan failed:', error);
      throw error;
    }
  }

  scanForSecrets(text) {
    const findings = [];
    
    // Scan each category
    for (const [category, patterns] of Object.entries(this.patterns)) {
      for (const patternDef of patterns) {
        const matches = text.matchAll(patternDef.pattern);
        
        for (const match of matches) {
          const finding = {
            type: patternDef.name,
            category,
            match: match[0],
            index: match.index,
            length: match[0].length,
            confidence: patternDef.confidence,
            severity: patternDef.severity,
            context: this.extractContext(text, match.index, match[0].length)
          };
          
          // Additional validation for some patterns
          if (this.validateFinding(finding, patternDef)) {
            findings.push(finding);
          }
        }
      }
    }
    
    return findings;
  }

  extractContext(text, index, length) {
    const contextSize = 30;
    const start = Math.max(0, index - contextSize);
    const end = Math.min(text.length, index + length + contextSize);
    
    let context = text.substring(start, end);
    
    // Mask the actual secret in context
    const secretStart = index - start;
    const secretEnd = secretStart + length;
    context = context.substring(0, secretStart) + 
              '*'.repeat(length) + 
              context.substring(secretEnd);
    
    return context;
  }

  validateFinding(finding, patternDef) {
    // Additional validation for specific types
    switch (finding.type) {
      case 'Generic API Key':
        // Check if it's actually a hash or random string
        return !this.isLikelyHash(finding.match) && 
               !this.isLikelyRandomString(finding.match);
        
      case 'Email Address':
        // Check if it's a common example email
        return !finding.match.includes('@example.') && 
               !finding.match.includes('@test.');
        
      case 'Phone Number':
        // Check if it's a valid format
        return this.isValidPhoneNumber(finding.match);
        
      default:
        return true;
    }
  }

  isLikelyHash(str) {
    // Common hash lengths
    const hashLengths = [32, 40, 64, 128]; // MD5, SHA1, SHA256, SHA512
    return hashLengths.includes(str.length) && /^[a-f0-9]+$/i.test(str);
  }

  isLikelyRandomString(str) {
    // Check for common patterns that are not secrets
    const commonPatterns = [
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, // UUID
      /^[A-Z0-9]{26}$/ // ULID
    ];
    
    return commonPatterns.some(pattern => pattern.test(str));
  }

  isValidPhoneNumber(str) {
    const cleaned = str.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  filterWhitelisted(findings) {
    return findings.filter(finding => {
      // Check if match is in whitelist
      if (this.whitelist.patterns.some(pattern => 
        finding.match.includes(pattern))) {
        return false;
      }
      
      // Check domain whitelist for emails
      if (finding.type === 'Email Address') {
        const domain = finding.match.split('@')[1];
        if (this.whitelist.domains.includes(domain)) {
          return false;
        }
      }
      
      return true;
    });
  }

  assessRiskLevel(findings) {
    if (findings.length === 0) return 'none';
    
    const severityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    
    findings.forEach(finding => {
      severityCounts[finding.severity]++;
    });
    
    if (severityCounts.critical > 0) return 'critical';
    if (severityCounts.high > 0) return 'high';
    if (severityCounts.medium > 0) return 'medium';
    return 'low';
  }

  categorizeFindings(findings) {
    const categories = {};
    
    findings.forEach(finding => {
      if (!categories[finding.category]) {
        categories[finding.category] = {
          count: 0,
          types: []
        };
      }
      
      categories[finding.category].count++;
      if (!categories[finding.category].types.includes(finding.type)) {
        categories[finding.category].types.push(finding.type);
      }
    });
    
    return categories;
  }

  generateRemediation(findings) {
    const suggestions = [];
    const categories = new Set(findings.map(f => f.category));
    
    if (categories.has('api_keys')) {
      suggestions.push({
        category: 'api_keys',
        action: 'Use environment variables or secure key management service',
        priority: 'immediate'
      });
    }
    
    if (categories.has('passwords')) {
      suggestions.push({
        category: 'passwords',
        action: 'Never include passwords in code or prompts',
        priority: 'immediate'
      });
    }
    
    if (categories.has('private_keys')) {
      suggestions.push({
        category: 'private_keys',
        action: 'Store private keys securely and reference by path only',
        priority: 'immediate'
      });
    }
    
    if (categories.has('pii')) {
      suggestions.push({
        category: 'pii',
        action: 'Anonymize or redact personal information',
        priority: 'high'
      });
    }
    
    // Add general suggestion
    suggestions.push({
      category: 'general',
      action: 'Review security best practices and use example/dummy data',
      priority: 'medium'
    });
    
    return suggestions;
  }

  logFindings(findings, riskLevel) {
    const logPath = path.join(this.projectRoot, 'logs/security-scans.log');
    
    const logEntry = {
      timestamp: this.context.timestamp,
      agent: this.context.activeAgent,
      riskLevel,
      findingsCount: findings.length,
      findings: findings.map(f => ({
        type: f.type,
        category: f.category,
        severity: f.severity,
        confidence: f.confidence
      }))
    };
    
    // Ensure log directory exists
    const logDir = path.dirname(logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
    
    // Console warning for critical findings
    if (riskLevel === 'critical') {
      console.warn('🚨 [Security] Critical security issue detected in input!');
      console.warn(`Found ${findings.length} potential secrets or sensitive data.`);
      console.warn('Please remove sensitive information before proceeding.');
    }
  }
}

if (require.main === module) {
  const scanner = new InputSecurityScanner();
  scanner.execute()
    .then(result => {
      console.log(JSON.stringify(result));
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = InputSecurityScanner;
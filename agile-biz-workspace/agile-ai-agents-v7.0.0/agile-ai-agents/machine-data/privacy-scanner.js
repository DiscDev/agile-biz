/**
 * Privacy Scanner
 * Scans contributions for sensitive data before submission
 */

const fs = require('fs');
const path = require('path');

class PrivacyScanner {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.rulesPath = path.join(projectRoot, 'machine-data', 'privacy-rules.json');
    this.scanLogPath = path.join(projectRoot, 'machine-data', 'privacy-scan-log.json');
    this.initializeRules();
  }

  /**
   * Initialize privacy rules
   */
  initializeRules() {
    if (!fs.existsSync(this.rulesPath)) {
      const defaultRules = {
        patterns: {
          api_keys: [
            /[a-zA-Z0-9]{32,}/g,  // Generic long keys
            /sk_[a-zA-Z0-9]{32,}/g,  // Stripe keys
            /AIza[a-zA-Z0-9_-]{35}/g,  // Google API keys
            /ghp_[a-zA-Z0-9]{36}/g,  // GitHub tokens
            /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi  // UUIDs
          ],
          secrets: [
            /password\s*[:=]\s*["']([^"']+)["']/gi,
            /secret\s*[:=]\s*["']([^"']+)["']/gi,
            /token\s*[:=]\s*["']([^"']+)["']/gi,
            /apikey\s*[:=]\s*["']([^"']+)["']/gi
          ],
          urls: [
            /https?:\/\/[a-zA-Z0-9.-]+\.(internal|local|corp|private)[^\s]*/gi,
            /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}[^\s]*/g,  // IP addresses
            /https?:\/\/localhost[^\s]*/gi,
            /https?:\/\/127\.0\.0\.1[^\s]*/gi
          ],
          emails: [
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
          ],
          names: [
            // Common patterns for real names (simplified)
            /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g
          ],
          financial: [
            /\$\d{1,3}(,\d{3})*(\.\d{2})?/g,  // Dollar amounts
            /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,  // Credit card patterns
            /\b\d{3}-\d{2}-\d{4}\b/g  // SSN pattern
          ]
        },
        whitelist: {
          urls: [
            'https://github.com',
            'https://example.com',
            'https://localhost:3000',
            'http://localhost:3001'
          ],
          emails: [
            'noreply@anthropic.com',
            'example@example.com',
            'test@test.com'
          ],
          names: [
            'John Doe',
            'Jane Smith',
            'Test User'
          ]
        },
        anonymization_rules: {
          company_names: {
            pattern: /(?:Inc\.|LLC|Corp\.|Corporation|Ltd\.|Limited|Company)/gi,
            replacement: '[Company]'
          },
          specific_numbers: {
            users: {
              ranges: [
                { max: 100, replacement: 'Under 100' },
                { max: 1000, replacement: '100-1000' },
                { max: 10000, replacement: '1K-10K' },
                { max: 100000, replacement: '10K-100K' },
                { max: 1000000, replacement: '100K-1M' },
                { max: Infinity, replacement: '1M+' }
              ]
            },
            revenue: {
              ranges: [
                { max: 1000, replacement: 'Under $1K' },
                { max: 10000, replacement: '$1K-10K' },
                { max: 100000, replacement: '$10K-100K' },
                { max: 1000000, replacement: '$100K-1M' },
                { max: 10000000, replacement: '$1M-10M' },
                { max: Infinity, replacement: '$10M+' }
              ]
            }
          }
        }
      };
      fs.writeFileSync(this.rulesPath, JSON.stringify(defaultRules, null, 2));
    }

    if (!fs.existsSync(this.scanLogPath)) {
      fs.writeFileSync(this.scanLogPath, JSON.stringify({ scans: [] }, null, 2));
    }
  }

  /**
   * Scan contribution files for sensitive data
   */
  async scanContribution(contributionPath) {
    const files = [
      path.join(contributionPath, 'project-summary.md'),
      path.join(contributionPath, 'learnings.md')
    ];

    const scanResults = {
      id: this.generateScanId(),
      timestamp: new Date().toISOString(),
      contribution_path: contributionPath,
      findings: [],
      summary: {
        total_issues: 0,
        critical: 0,
        warning: 0,
        info: 0
      },
      anonymized: false
    };

    for (const file of files) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const fileFindings = await this.scanContent(content, file);
        scanResults.findings.push(...fileFindings);
      }
    }

    // Categorize findings
    scanResults.findings.forEach(finding => {
      scanResults.summary.total_issues++;
      scanResults.summary[finding.severity]++;
    });

    // Log scan
    this.logScan(scanResults);

    return scanResults;
  }

  /**
   * Scan content for sensitive patterns
   */
  async scanContent(content, filePath) {
    const findings = [];
    const rules = JSON.parse(fs.readFileSync(this.rulesPath, 'utf8'));

    // Check each pattern category
    for (const [category, patterns] of Object.entries(rules.patterns)) {
      for (const pattern of patterns) {
        // Convert string pattern to RegExp if needed
        const regex = typeof pattern === 'string' ? new RegExp(pattern, 'gi') : pattern;
        const matches = content.matchAll(regex);
        
        for (const match of matches) {
          const finding = {
            file: path.basename(filePath),
            category,
            match: match[0],
            line: this.getLineNumber(content, match.index),
            severity: this.getSeverity(category),
            suggestion: this.getSuggestion(category, match[0])
          };

          // Check if whitelisted
          if (!this.isWhitelisted(category, match[0], rules.whitelist)) {
            findings.push(finding);
          }
        }
      }
    }

    // Check for company names
    const companyFindings = this.scanForCompanyNames(content, filePath);
    findings.push(...companyFindings);

    return findings;
  }

  /**
   * Scan for company names
   */
  scanForCompanyNames(content, filePath) {
    const findings = [];
    const rules = JSON.parse(fs.readFileSync(this.rulesPath, 'utf8'));
    const companyPattern = rules.anonymization_rules.company_names.pattern;
    
    // Find lines with company indicators
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (companyPattern.test(line)) {
        // Extract potential company name
        const words = line.split(/\s+/);
        for (let i = 0; i < words.length; i++) {
          if (companyPattern.test(words[i])) {
            // Look for company name before the indicator
            if (i > 0 && /^[A-Z]/.test(words[i-1])) {
              findings.push({
                file: path.basename(filePath),
                category: 'company_name',
                match: words.slice(Math.max(0, i-2), i+1).join(' '),
                line: index + 1,
                severity: 'warning',
                suggestion: 'Replace with "[Industry] Company"'
              });
            }
          }
        }
      }
    });

    return findings;
  }

  /**
   * Get line number for match
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Get severity for category
   */
  getSeverity(category) {
    const severityMap = {
      api_keys: 'critical',
      secrets: 'critical',
      financial: 'critical',
      urls: 'warning',
      emails: 'warning',
      names: 'info',
      company_name: 'warning'
    };
    return severityMap[category] || 'info';
  }

  /**
   * Get suggestion for category
   */
  getSuggestion(category, match) {
    const suggestions = {
      api_keys: 'Remove API key and use environment variable reference',
      secrets: 'Remove secret and use placeholder like [SECRET]',
      urls: 'Replace with example.com or generic URL',
      emails: 'Replace with example@example.com',
      names: 'Replace with generic name like "User" or "Developer"',
      financial: 'Use ranges instead of specific amounts',
      company_name: 'Replace with "[Industry] Company"'
    };
    return suggestions[category] || 'Consider removing or anonymizing';
  }

  /**
   * Check if match is whitelisted
   */
  isWhitelisted(category, match, whitelist) {
    if (!whitelist[category]) return false;
    return whitelist[category].includes(match);
  }

  /**
   * Anonymize contribution files
   */
  async anonymizeContribution(contributionPath, scanResults) {
    const files = [
      path.join(contributionPath, 'project-summary.md'),
      path.join(contributionPath, 'learnings.md')
    ];

    for (const file of files) {
      if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        // Apply anonymization for each finding
        const fileFindings = scanResults.findings.filter(f => 
          f.file === path.basename(file)
        );

        // Sort by position (reverse) to maintain indices
        fileFindings.sort((a, b) => b.line - a.line);

        for (const finding of fileFindings) {
          content = this.anonymizeMatch(content, finding);
        }

        // Write anonymized content
        fs.writeFileSync(file, content);
      }
    }

    scanResults.anonymized = true;
    return scanResults;
  }

  /**
   * Anonymize a specific match
   */
  anonymizeMatch(content, finding) {
    const rules = JSON.parse(fs.readFileSync(this.rulesPath, 'utf8'));
    
    switch (finding.category) {
      case 'api_keys':
      case 'secrets':
        return content.replace(finding.match, '[REDACTED]');
      
      case 'urls':
        return content.replace(finding.match, 'https://example.com');
      
      case 'emails':
        return content.replace(finding.match, 'user@example.com');
      
      case 'names':
        return content.replace(finding.match, 'User');
      
      case 'financial':
        return this.anonymizeFinancial(content, finding.match);
      
      case 'company_name':
        return content.replace(finding.match, '[Industry] Company');
      
      default:
        return content;
    }
  }

  /**
   * Anonymize financial data
   */
  anonymizeFinancial(content, match) {
    const rules = JSON.parse(fs.readFileSync(this.rulesPath, 'utf8'));
    
    // Extract number from match
    const amount = parseFloat(match.replace(/[$,]/g, ''));
    
    // Find appropriate range
    const ranges = rules.anonymization_rules.specific_numbers.revenue.ranges;
    for (const range of ranges) {
      if (amount <= range.max) {
        return content.replace(match, range.replacement);
      }
    }
    
    return content;
  }

  /**
   * Interactive anonymization prompt
   */
  async promptAnonymization(scanResults) {
    if (scanResults.summary.total_issues === 0) {
      console.log('✅ No sensitive data found!');
      return { accepted: true, anonymized: false };
    }

    console.log(`\n⚠️  Found ${scanResults.summary.total_issues} potential sensitive items:`);
    console.log(`   Critical: ${scanResults.summary.critical}`);
    console.log(`   Warning: ${scanResults.summary.warning}`);
    console.log(`   Info: ${scanResults.summary.info}\n`);

    // Show findings
    scanResults.findings.forEach((finding, index) => {
      console.log(`${index + 1}. [${finding.severity.toUpperCase()}] ${finding.category}`);
      console.log(`   File: ${finding.file}, Line: ${finding.line}`);
      console.log(`   Found: "${finding.match}"`);
      console.log(`   Suggestion: ${finding.suggestion}\n`);
    });

    // In real implementation, would prompt user
    // For now, return recommendation
    return {
      accepted: scanResults.summary.critical === 0,
      anonymize: scanResults.summary.total_issues > 0,
      critical_issues: scanResults.summary.critical > 0
    };
  }

  /**
   * Log scan results
   */
  logScan(scanResults) {
    const log = JSON.parse(fs.readFileSync(this.scanLogPath, 'utf8'));
    log.scans.push(scanResults);
    
    // Keep last 100 scans
    if (log.scans.length > 100) {
      log.scans = log.scans.slice(-100);
    }

    fs.writeFileSync(this.scanLogPath, JSON.stringify(log, null, 2));
  }

  /**
   * Get scan report
   */
  getScanReport() {
    const log = JSON.parse(fs.readFileSync(this.scanLogPath, 'utf8'));
    
    const report = {
      total_scans: log.scans.length,
      recent_scans: log.scans.slice(-10),
      common_issues: this.analyzeCommonIssues(log.scans),
      anonymization_rate: this.calculateAnonymizationRate(log.scans)
    };

    return report;
  }

  /**
   * Analyze common privacy issues
   */
  analyzeCommonIssues(scans) {
    const issues = {};
    
    scans.forEach(scan => {
      scan.findings.forEach(finding => {
        if (!issues[finding.category]) {
          issues[finding.category] = 0;
        }
        issues[finding.category]++;
      });
    });

    return Object.entries(issues)
      .sort(([,a], [,b]) => b - a)
      .map(([category, count]) => ({ category, count }));
  }

  /**
   * Calculate anonymization rate
   */
  calculateAnonymizationRate(scans) {
    if (scans.length === 0) return 0;
    
    const anonymized = scans.filter(s => s.anonymized).length;
    return (anonymized / scans.length * 100).toFixed(1);
  }

  /**
   * Generate scan ID
   */
  generateScanId() {
    return `SCAN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = PrivacyScanner;

// CLI interface
if (require.main === module) {
  const scanner = new PrivacyScanner(path.join(__dirname, '..'));
  
  const command = process.argv[2];
  const args = process.argv.slice(3);
  
  switch (command) {
    case 'scan':
      if (args.length === 0) {
        console.log('Usage: node privacy-scanner.js scan <contribution-path>');
        process.exit(1);
      }
      scanner.scanContribution(args[0]).then(results => {
        console.log('🔍 Privacy Scan Results');
        console.log('======================');
        console.log(JSON.stringify(results, null, 2));
      });
      break;

    case 'report':
      const report = scanner.getScanReport();
      console.log('📊 Privacy Scan Report');
      console.log('=====================');
      console.log(JSON.stringify(report, null, 2));
      break;

    default:
      console.log('Commands: scan <path>, report');
  }
}
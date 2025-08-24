/**
 * Rules Loader
 * Ensures system rules are always loaded first in context
 */

const fs = require('fs');
const path = require('path');

class RulesLoader {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.rulesPath = path.join(__dirname, 'system-rules.json');
    
    // Cache for loaded rules
    this.systemRules = null;
    this.rulesLoaded = false;
    
    // Load rules immediately
    this.loadRules();
  }
  
  /**
   * Load system rules
   */
  loadRules() {
    try {
      if (fs.existsSync(this.rulesPath)) {
        this.systemRules = JSON.parse(fs.readFileSync(this.rulesPath, 'utf-8'));
        this.rulesLoaded = true;
        console.log('✅ System rules loaded successfully');
        return this.systemRules;
      } else {
        console.error('⚠️  System rules file not found!');
        this.createDefaultRules();
      }
    } catch (error) {
      console.error('❌ Error loading system rules:', error.message);
      return null;
    }
  }
  
  /**
   * Get system rules (always available)
   */
  getRules() {
    if (!this.rulesLoaded) {
      this.loadRules();
    }
    return this.systemRules;
  }
  
  /**
   * Validate current session against rules
   */
  validateSession(sessionData) {
    const violations = [];
    const rules = this.getRules();
    
    if (!rules) {
      violations.push({
        severity: 'critical',
        message: 'System rules not available for validation'
      });
      return violations;
    }
    
    // Check document creation rules
    if (sessionData.recent_files) {
      const mdInMachineData = sessionData.recent_files.filter(
        file => file.includes('/machine-data/') && file.endsWith('.md')
      );
      
      if (mdInMachineData.length > 0) {
        violations.push({
          severity: 'high',
          rule: 'doc-001',
          message: 'Markdown files found in machine-data directory',
          files: mdInMachineData,
          fix: 'Move .md files to /project-documents/ and create JSON versions'
        });
      }
    }
    
    // Check agent count
    if (sessionData.agent_count && sessionData.agent_count !== 34) {
      violations.push({
        severity: 'medium',
        rule: 'agent-002',
        message: `Agent count mismatch: found ${sessionData.agent_count}, expected 34`,
        fix: 'Update agent count references to 34'
      });
    }
    
    // Check context preservation
    if (!sessionData.state_saved_recently) {
      violations.push({
        severity: 'medium',
        rule: 'context-001',
        message: 'Project state not saved recently',
        fix: 'Run "checkpoint now" to save current state'
      });
    }
    
    return violations;
  }
  
  /**
   * Display rule violations
   */
  displayViolations(violations) {
    if (violations.length === 0) {
      console.log('✅ No rule violations detected');
      return;
    }
    
    console.log('\n⚠️  RULE VIOLATIONS DETECTED');
    console.log('=' . repeat(60));
    
    // Group by severity
    const critical = violations.filter(v => v.severity === 'critical');
    const high = violations.filter(v => v.severity === 'high');
    const medium = violations.filter(v => v.severity === 'medium');
    
    if (critical.length > 0) {
      console.log('\n🚨 CRITICAL VIOLATIONS');
      critical.forEach(v => {
        console.log(`  • ${v.message}`);
        if (v.fix) console.log(`    Fix: ${v.fix}`);
      });
    }
    
    if (high.length > 0) {
      console.log('\n⚠️  HIGH PRIORITY VIOLATIONS');
      high.forEach(v => {
        console.log(`  • [${v.rule}] ${v.message}`);
        if (v.fix) console.log(`    Fix: ${v.fix}`);
        if (v.files) console.log(`    Files: ${v.files.join(', ')}`);
      });
    }
    
    if (medium.length > 0) {
      console.log('\n📋 MEDIUM PRIORITY VIOLATIONS');
      medium.forEach(v => {
        console.log(`  • [${v.rule}] ${v.message}`);
        if (v.fix) console.log(`    Fix: ${v.fix}`);
      });
    }
    
    console.log('\n' + '=' . repeat(60));
  }
  
  /**
   * Get rule by ID
   */
  getRule(ruleId) {
    const rules = this.getRules();
    if (!rules) return null;
    
    // Search through all categories
    for (const [category, categoryData] of Object.entries(rules.rules)) {
      const rule = categoryData.rules.find(r => r.id === ruleId);
      if (rule) {
        return {
          category,
          rule
        };
      }
    }
    
    return null;
  }
  
  /**
   * Get rules by category
   */
  getRulesByCategory(category) {
    const rules = this.getRules();
    if (!rules || !rules.rules[category]) return [];
    
    return rules.rules[category].rules;
  }
  
  /**
   * Get all critical rules
   */
  getCriticalRules() {
    const rules = this.getRules();
    if (!rules) return [];
    
    const critical = [];
    
    Object.entries(rules.rules).forEach(([category, categoryData]) => {
      if (categoryData.priority === 'critical') {
        critical.push({
          category,
          rules: categoryData.rules
        });
      }
    });
    
    return critical;
  }
  
  /**
   * Create default rules if missing
   */
  createDefaultRules() {
    const defaultRules = {
      meta: {
        document: 'system-rules',
        version: '1.0.0',
        created_at: new Date().toISOString(),
        priority: 'critical',
        description: 'Core system rules - auto-generated'
      },
      rules: {
        document_creation: {
          priority: 'critical',
          rules: [
            {
              id: 'doc-001',
              rule: 'ALL project documents MUST follow two-step process',
              details: 'Create as .md in /project-documents/, then convert to .json'
            }
          ]
        },
        agent_coordination: {
          priority: 'critical',
          rules: [
            {
              id: 'agent-001',
              rule: 'Dual reporting structure',
              details: 'Agents report to Scrum Master for execution, PM for strategy'
            },
            {
              id: 'agent-002',
              rule: 'Total agent count is 34',
              details: 'System includes 34 specialized agents'
            }
          ]
        },
        context_persistence: {
          priority: 'critical',
          rules: [
            {
              id: 'context-001',
              rule: 'Update project state after significant actions',
              details: 'Task completion, decisions, errors must trigger state save'
            }
          ]
        }
      }
    };
    
    try {
      fs.writeFileSync(this.rulesPath, JSON.stringify(defaultRules, null, 2));
      console.log('✅ Created default system rules');
      this.systemRules = defaultRules;
      this.rulesLoaded = true;
    } catch (error) {
      console.error('❌ Could not create default rules:', error.message);
    }
  }
  
  /**
   * Get rules summary for context
   */
  getRulesSummary() {
    const rules = this.getRules();
    if (!rules) return 'System rules not available';
    
    const summary = {
      version: rules.meta.version,
      categories: Object.keys(rules.rules),
      total_rules: 0,
      critical_rules: [],
      key_reminders: []
    };
    
    // Count rules and extract critical ones
    Object.entries(rules.rules).forEach(([category, categoryData]) => {
      summary.total_rules += categoryData.rules.length;
      
      if (categoryData.priority === 'critical') {
        categoryData.rules.forEach(rule => {
          summary.critical_rules.push(`[${rule.id}] ${rule.rule}`);
        });
      }
    });
    
    // Key reminders
    summary.key_reminders = [
      'Always create .md files in /project-documents/ first',
      'System has 34 agents with dual-reporting structure',
      'Save state after significant actions',
      'Use absolute paths in all tools'
    ];
    
    return summary;
  }
  
  /**
   * Check if rules need update
   */
  checkForUpdates() {
    const rules = this.getRules();
    if (!rules) return false;
    
    // Check if version is current
    const currentVersion = '1.0.0';
    if (rules.meta.version !== currentVersion) {
      console.log(`⚠️  System rules version mismatch: ${rules.meta.version} vs ${currentVersion}`);
      return true;
    }
    
    // Check if all required categories exist
    const requiredCategories = [
      'document_creation',
      'agent_coordination',
      'context_persistence',
      'development_standards'
    ];
    
    const missingCategories = requiredCategories.filter(
      cat => !rules.rules[cat]
    );
    
    if (missingCategories.length > 0) {
      console.log(`⚠️  Missing rule categories: ${missingCategories.join(', ')}`);
      return true;
    }
    
    return false;
  }
  
  /**
   * Export rules for context
   */
  exportForContext() {
    const rules = this.getRules();
    if (!rules) return null;
    
    // Return a condensed version for context
    return {
      system_rules: {
        _priority: 'CRITICAL - ALWAYS IN CONTEXT',
        _note: 'These rules must never be pruned from context',
        document_creation: 'Two-step process: .md in /project-documents/, then JSON',
        agent_count: '34 agents total',
        dual_reporting: 'Agents → SM (execution), PM (strategy)',
        state_saving: 'Save after significant actions',
        absolute_paths: 'Always use absolute paths in tools',
        _full_rules: 'See system-rules.json for complete rules'
      }
    };
  }
}

// Export singleton instance
const rulesLoader = new RulesLoader();

module.exports = {
  RulesLoader,
  rulesLoader,
  
  // Convenience exports
  getRules: () => rulesLoader.getRules(),
  validateSession: (data) => rulesLoader.validateSession(data),
  displayViolations: (violations) => rulesLoader.displayViolations(violations),
  getRulesSummary: () => rulesLoader.getRulesSummary(),
  exportForContext: () => rulesLoader.exportForContext()
};
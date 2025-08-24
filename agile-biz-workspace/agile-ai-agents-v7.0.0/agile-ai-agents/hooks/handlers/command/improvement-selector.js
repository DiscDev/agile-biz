/**
 * Improvement Selector Command Handler
 * Provides interactive interface for stakeholders to select improvements
 */

const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

class ImprovementSelector {
  constructor() {
    this.rl = null;
    this.improvementsPath = path.join(__dirname, '../../../project-state/improvements');
    this.selectedImprovements = [];
    this.deferredImprovements = [];
  }

  /**
   * Main selection interface
   */
  async startSelection(improvements, groups) {
    console.log(chalk.cyan('\n════════════════════════════════════════════'));
    console.log(chalk.cyan.bold('   SELECT IMPROVEMENTS TO IMPLEMENT'));
    console.log(chalk.cyan('════════════════════════════════════════════\n'));

    console.log(chalk.yellow('⚠️  Note: You have full control over what gets implemented.'));
    console.log(chalk.yellow('All items are recommendations only.\n'));

    // Display summary
    this.displaySummary(improvements, groups);

    // Display grouped improvements
    if (groups.groups.length > 0) {
      console.log(chalk.bold('\n📦 GROUPED IMPROVEMENTS'));
      console.log(chalk.gray('────────────────────────────\n'));
      await this.displayGroups(groups.groups, improvements);
    }

    // Display standalone improvements
    if (groups.standalone.length > 0) {
      console.log(chalk.bold('\n📋 STANDALONE IMPROVEMENTS'));
      console.log(chalk.gray('────────────────────────────\n'));
      await this.displayStandalone(groups.standalone);
    }

    // Start interactive selection
    const selections = await this.interactiveSelection(improvements, groups);
    
    // Set priorities
    const prioritized = await this.setPriorities(selections);
    
    // Handle deferred items
    await this.handleDeferredItems(improvements, selections);
    
    // Generate summary
    const summary = await this.generateSelectionSummary(prioritized, this.deferredImprovements);
    
    return {
      selected: prioritized,
      deferred: this.deferredImprovements,
      summary
    };
  }

  /**
   * Display improvements summary
   */
  displaySummary(improvements, groups) {
    const categories = this.categorizeImprovements(improvements);
    
    console.log(chalk.bold('📊 ANALYSIS SUMMARY'));
    console.log(`Total improvements identified: ${chalk.green(improvements.length)}`);
    console.log(`Grouped improvements: ${chalk.blue(groups.groups.length)} groups`);
    console.log(`Standalone improvements: ${chalk.blue(groups.standalone.length)}\n`);

    console.log(chalk.bold('By Category:'));
    Object.entries(categories).forEach(([category, items]) => {
      if (items.length > 0) {
        const icon = this.getCategoryIcon(category);
        console.log(`  ${icon} ${this.formatCategoryName(category)}: ${items.length}`);
      }
    });
  }

  /**
   * Display grouped improvements
   */
  async displayGroups(groups, allImprovements) {
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const groupItems = group.items.map(id => 
        allImprovements.find(imp => imp.id === id)
      ).filter(Boolean);

      console.log(`${chalk.bold(`[G${i + 1}]`)} ${chalk.green(group.group_name)}`);
      console.log(`     ${chalk.gray(group.description)}`);
      console.log(`     Impact: ${this.formatImpact(group.impact)} | Effort: ${this.formatEffort(group.effort)} | Duration: ${chalk.cyan(group.sprint_size)}`);
      
      // Show items in group
      console.log(chalk.gray('     Contains:'));
      groupItems.forEach(item => {
        console.log(`       • ${item.title}`);
      });
      console.log();
    }
  }

  /**
   * Display standalone improvements
   */
  async displayStandalone(standalone) {
    for (let i = 0; i < standalone.length; i++) {
      const item = standalone[i];
      const icon = this.getCategoryIcon(item.category);
      
      console.log(`${chalk.bold(`[S${i + 1}]`)} ${icon} ${chalk.green(item.title)}`);
      console.log(`     ${chalk.gray(item.description)}`);
      console.log(`     Impact: ${this.formatImpact(item.impact)} | Effort: ${this.formatEffort(item.effort)} | ROI: ${chalk.cyan(item.roi_timeline)}`);
      
      if (item.risk_if_deferred) {
        console.log(`     ${chalk.red('⚠️  Risk if deferred:')} ${item.risk_if_deferred}`);
      }
      console.log();
    }
  }

  /**
   * Interactive selection process
   */
  async interactiveSelection(improvements, groups) {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log(chalk.bold('\n🎯 SELECTION MODE'));
    console.log(chalk.gray('────────────────────────────\n'));
    console.log('Enter the IDs of improvements to implement (comma-separated).');
    console.log('Format: G1,G2,S1,S3 (G=Group, S=Standalone)');
    console.log('Special commands:');
    console.log('  • "all" - Select all improvements');
    console.log('  • "critical" - Select all critical security items');
    console.log('  • "quick" - Select all low-effort items');
    console.log('  • "none" - Defer all improvements\n');

    const answer = await this.askQuestion('Your selections: ');
    
    const selected = this.parseSelections(answer, improvements, groups);
    
    this.rl.close();
    
    return selected;
  }

  /**
   * Parse selection input
   */
  parseSelections(input, improvements, groups) {
    const selected = [];
    const normalizedInput = input.toLowerCase().trim();

    // Handle special commands
    if (normalizedInput === 'all') {
      return improvements;
    }
    
    if (normalizedInput === 'critical') {
      return improvements.filter(i => i.category === 'critical_security');
    }
    
    if (normalizedInput === 'quick') {
      return improvements.filter(i => i.effort === 'low');
    }
    
    if (normalizedInput === 'none') {
      return [];
    }

    // Parse individual selections
    const selections = normalizedInput.split(',').map(s => s.trim());
    
    selections.forEach(selection => {
      if (selection.startsWith('g')) {
        // Group selection
        const groupIndex = parseInt(selection.substring(1)) - 1;
        if (groups.groups[groupIndex]) {
          const group = groups.groups[groupIndex];
          group.items.forEach(itemId => {
            const improvement = improvements.find(i => i.id === itemId);
            if (improvement && !selected.includes(improvement)) {
              selected.push(improvement);
            }
          });
        }
      } else if (selection.startsWith('s')) {
        // Standalone selection
        const standaloneIndex = parseInt(selection.substring(1)) - 1;
        if (groups.standalone[standaloneIndex]) {
          selected.push(groups.standalone[standaloneIndex]);
        }
      }
    });

    return selected;
  }

  /**
   * Set priorities for selected improvements
   */
  async setPriorities(selections) {
    if (selections.length === 0) return [];

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log(chalk.bold('\n📌 SET PRIORITIES'));
    console.log(chalk.gray('────────────────────────────\n'));
    console.log('Selected improvements:');
    
    selections.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.title}`);
    });

    console.log('\nEnter priority order (comma-separated numbers).');
    console.log('Example: "2,1,3" means item 2 is highest priority');
    console.log('Press Enter to keep default order.\n');

    const answer = await this.askQuestion('Priority order: ');
    
    this.rl.close();

    if (!answer.trim()) {
      // Keep default order
      return selections.map((item, index) => ({
        ...item,
        priority: index + 1
      }));
    }

    // Parse priority order
    const priorities = answer.split(',').map(p => parseInt(p.trim()) - 1);
    const prioritized = [];
    
    priorities.forEach((itemIndex, priority) => {
      if (selections[itemIndex]) {
        prioritized.push({
          ...selections[itemIndex],
          priority: priority + 1
        });
      }
    });

    // Add any missing items at the end
    selections.forEach(item => {
      if (!prioritized.find(p => p.id === item.id)) {
        prioritized.push({
          ...item,
          priority: prioritized.length + 1
        });
      }
    });

    return prioritized;
  }

  /**
   * Handle deferred items
   */
  async handleDeferredItems(allImprovements, selected) {
    const selectedIds = new Set(selected.map(s => s.id));
    const deferred = allImprovements.filter(i => !selectedIds.has(i.id));

    if (deferred.length === 0) return;

    // Check for critical items being deferred
    const criticalDeferred = deferred.filter(i => i.category === 'critical_security');
    
    if (criticalDeferred.length > 0) {
      await this.handleCriticalDeferral(criticalDeferred);
    }

    // Store all deferred items
    for (const item of deferred) {
      this.deferredImprovements.push({
        ...item,
        deferred_date: new Date().toISOString(),
        reason: await this.getDeferralReason(item),
        revisit_date: this.calculateRevisitDate(item)
      });
    }
  }

  /**
   * Handle critical item deferral with risk acknowledgment
   */
  async handleCriticalDeferral(criticalItems) {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log(chalk.red.bold('\n⚠️  CRITICAL SECURITY ITEMS DEFERRED'));
    console.log(chalk.red('────────────────────────────────────\n'));
    
    for (const item of criticalItems) {
      console.log(chalk.red(`Deferring: ${item.title}`));
      console.log(`Risk Level: ${chalk.red.bold('CRITICAL')}`);
      console.log(`Potential Impact: ${item.risk_if_deferred}`);
      
      const acknowledge = await this.askQuestion('\nAccept risk and defer? (yes/no): ');
      
      if (acknowledge.toLowerCase() !== 'yes') {
        console.log(chalk.green('Item will be added to selected improvements.'));
        this.selectedImprovements.push(item);
      } else {
        const reason = await this.askQuestion('Reason for deferral: ');
        item.deferral_reason = reason;
        item.risk_acknowledged = true;
      }
    }

    this.rl.close();
  }

  /**
   * Get deferral reason (simplified for now)
   */
  async getDeferralReason(item) {
    // In a real implementation, this might prompt for each item
    // For now, return a default reason based on category
    const reasons = {
      features: 'Not aligned with current roadmap',
      modernization: 'Waiting for next major release',
      documentation: 'Lower priority',
      technical_debt: 'Resource constraints',
      testing: 'Pending test strategy review'
    };
    
    return reasons[item.category] || 'Deferred by stakeholder decision';
  }

  /**
   * Calculate revisit date for deferred item
   */
  calculateRevisitDate(item) {
    const daysToAdd = {
      critical_security: 7,
      performance: 14,
      technical_debt: 30,
      features: 60,
      modernization: 90,
      testing: 30,
      documentation: 90
    };
    
    const days = daysToAdd[item.category] || 30;
    const revisitDate = new Date();
    revisitDate.setDate(revisitDate.getDate() + days);
    
    return revisitDate.toISOString();
  }

  /**
   * Generate selection summary
   */
  async generateSelectionSummary(selected, deferred) {
    const totalHours = selected.reduce((sum, item) => sum + (item.estimated_hours || 0), 0);
    const estimatedSprints = Math.ceil(totalHours / 80); // Assuming 80 hours per sprint
    
    const summary = {
      timestamp: new Date().toISOString(),
      statistics: {
        total_identified: selected.length + deferred.length,
        total_selected: selected.length,
        total_deferred: deferred.length,
        estimated_hours: totalHours,
        estimated_sprints: estimatedSprints
      },
      by_category: this.summarizeByCategory(selected),
      critical_deferred: deferred.filter(i => i.category === 'critical_security').length,
      next_steps: this.generateNextSteps(selected)
    };

    // Save to state
    await this.saveSelectionState(selected, deferred, summary);
    
    // Display summary
    this.displaySelectionSummary(summary);
    
    return summary;
  }

  /**
   * Save selection state
   */
  async saveSelectionState(selected, deferred, summary) {
    // Save selected improvements
    await fs.writeFile(
      path.join(this.improvementsPath, 'selected-improvements.json'),
      JSON.stringify({
        selected_improvements: selected,
        metadata: {
          last_updated: new Date().toISOString(),
          total_selected: selected.length,
          selection_session: summary.timestamp
        }
      }, null, 2)
    );

    // Save deferred improvements
    await fs.writeFile(
      path.join(this.improvementsPath, 'deferred-improvements.json'),
      JSON.stringify({
        deferred_improvements: deferred,
        metadata: {
          last_reviewed: new Date().toISOString(),
          total_deferred: deferred.length,
          next_review: this.calculateNextReview(deferred)
        }
      }, null, 2)
    );
  }

  /**
   * Calculate next review date for deferred items
   */
  calculateNextReview(deferred) {
    if (deferred.length === 0) return null;
    
    // Find earliest revisit date
    const dates = deferred.map(d => new Date(d.revisit_date));
    return new Date(Math.min(...dates)).toISOString();
  }

  /**
   * Display selection summary
   */
  displaySelectionSummary(summary) {
    console.log(chalk.green.bold('\n✅ SELECTION COMPLETE'));
    console.log(chalk.green('════════════════════════════════════════════\n'));
    
    console.log(chalk.bold('Summary:'));
    console.log(`  • Selected: ${chalk.green(summary.statistics.total_selected)} improvements`);
    console.log(`  • Deferred: ${chalk.yellow(summary.statistics.total_deferred)} improvements`);
    if (summary.critical_deferred > 0) {
      console.log(`  • ${chalk.red(`⚠️  Critical items deferred: ${summary.critical_deferred}`)}`);
    }
    console.log(`  • Estimated effort: ${chalk.cyan(summary.statistics.estimated_hours)} hours`);
    console.log(`  • Estimated sprints: ${chalk.cyan(summary.statistics.estimated_sprints)}\n`);
    
    console.log(chalk.bold('Next Steps:'));
    summary.next_steps.forEach((step, index) => {
      console.log(`  ${index + 1}. ${step}`);
    });
  }

  /**
   * Summarize by category
   */
  summarizeByCategory(selected) {
    const summary = {};
    selected.forEach(item => {
      if (!summary[item.category]) {
        summary[item.category] = 0;
      }
      summary[item.category]++;
    });
    return summary;
  }

  /**
   * Generate next steps
   */
  generateNextSteps(selected) {
    const steps = [];
    
    if (selected.length > 0) {
      steps.push('Review generated sprint plan');
      steps.push(`Begin implementation with priority 1: ${selected[0]?.title}`);
      steps.push('Monitor progress via dashboard');
    } else {
      steps.push('No improvements selected for implementation');
      steps.push('Review deferred items in future planning session');
    }
    
    return steps;
  }

  /**
   * Helper: Ask question
   */
  askQuestion(question) {
    return new Promise(resolve => {
      this.rl.question(question, answer => {
        resolve(answer);
      });
    });
  }

  /**
   * Helper: Categorize improvements
   */
  categorizeImprovements(improvements) {
    const categories = {};
    improvements.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });
    return categories;
  }

  /**
   * Helper: Get category icon
   */
  getCategoryIcon(category) {
    const icons = {
      critical_security: '🔴',
      performance: '⚡',
      technical_debt: '🏗️',
      features: '✨',
      modernization: '🚀',
      testing: '🧪',
      documentation: '📚',
      accessibility: '♿',
      infrastructure: '🔧'
    };
    return icons[category] || '📋';
  }

  /**
   * Helper: Format category name
   */
  formatCategoryName(category) {
    return category.replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Helper: Format impact
   */
  formatImpact(impact) {
    const colors = {
      high: chalk.red,
      medium: chalk.yellow,
      low: chalk.green
    };
    return (colors[impact] || chalk.gray)(impact.toUpperCase());
  }

  /**
   * Helper: Format effort
   */
  formatEffort(effort) {
    const colors = {
      high: chalk.red,
      medium: chalk.yellow,
      low: chalk.green
    };
    return (colors[effort] || chalk.gray)(effort.toUpperCase());
  }
}

module.exports = ImprovementSelector;
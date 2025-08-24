/**
 * Stakeholder Interaction Manager
 * Manages contribution prompts and stakeholder engagement
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class StakeholderInteractionManager {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.interactionLogPath = path.join(projectRoot, 'machine-data', 'stakeholder-interactions.json');
    this.promptConfigPath = path.join(projectRoot, 'machine-data', 'contribution-prompts.json');
    this.initializeConfig();
  }

  /**
   * Initialize configuration files
   */
  initializeConfig() {
    if (!fs.existsSync(this.interactionLogPath)) {
      fs.writeFileSync(this.interactionLogPath, JSON.stringify({
        interactions: [],
        statistics: {
          total_prompts: 0,
          accepted_contributions: 0,
          declined_contributions: 0,
          contribution_rate: 0
        }
      }, null, 2));
    }

    if (!fs.existsSync(this.promptConfigPath)) {
      const defaultPrompts = {
        sprint_end: {
          enabled: true,
          template: `🎉 Sprint {sprint_number} Completed!

Great work on completing this sprint! Your project has made significant progress.

Would you like to contribute your learnings to help improve AgileAiAgents for everyone?

By contributing, you'll help:
• Improve agent performance for future projects
• Share valuable patterns with the community
• Make AgileAiAgents smarter with each project

Your contribution will be anonymized by default, protecting sensitive information.

Would you like to contribute? (yes/no): `,
          timing: 'immediate'
        },
        milestone_completion: {
          enabled: true,
          template: `🏆 Milestone Achieved: {milestone_name}

Congratulations on reaching this important milestone!

This is a great opportunity to share the learnings from this achievement.
Would you like to contribute your insights? (yes/no): `,
          timing: 'immediate'
        },
        project_completion: {
          enabled: true,
          template: `🚀 Project Successfully Completed!

Congratulations on completing your project! 

Your journey from idea to deployment contains valuable learnings that could help
countless other developers using AgileAiAgents.

Would you like to share your project learnings with the community? (yes/no): `,
          timing: 'immediate'
        },
        weekly_check: {
          enabled: false,
          template: `📊 Weekly Learning Check

It's been a productive week! Would you like to capture any learnings
from the past week's development? (yes/no): `,
          timing: 'scheduled'
        }
      };
      fs.writeFileSync(this.promptConfigPath, JSON.stringify(defaultPrompts, null, 2));
    }
  }

  /**
   * Prompt stakeholder at sprint end
   */
  async promptSprintEnd(sprintData) {
    const prompts = JSON.parse(fs.readFileSync(this.promptConfigPath, 'utf8'));
    const prompt = prompts.sprint_end;

    if (!prompt.enabled) return null;

    const interaction = {
      id: this.generateInteractionId(),
      type: 'sprint_end',
      timestamp: new Date().toISOString(),
      sprint_number: sprintData.sprint_number,
      prompt_shown: prompt.template.replace('{sprint_number}', sprintData.sprint_number),
      response: null,
      contribution_generated: false
    };

    // In real implementation, this would show interactive prompt
    // For now, simulate the interaction
    console.log('\n' + interaction.prompt_shown);
    
    const response = await this.getUserResponse();
    interaction.response = response;

    if (response.toLowerCase() === 'yes') {
      interaction.contribution_generated = true;
      await this.initiateContribution(sprintData);
    }

    this.logInteraction(interaction);
    this.updateStatistics(response.toLowerCase() === 'yes');

    return interaction;
  }

  /**
   * Prompt for milestone completion
   */
  async promptMilestoneCompletion(milestoneData) {
    const prompts = JSON.parse(fs.readFileSync(this.promptConfigPath, 'utf8'));
    const prompt = prompts.milestone_completion;

    if (!prompt.enabled) return null;

    const interaction = {
      id: this.generateInteractionId(),
      type: 'milestone_completion',
      timestamp: new Date().toISOString(),
      milestone: milestoneData.name,
      prompt_shown: prompt.template.replace('{milestone_name}', milestoneData.name),
      response: null,
      contribution_generated: false
    };

    console.log('\n' + interaction.prompt_shown);
    
    const response = await this.getUserResponse();
    interaction.response = response;

    if (response.toLowerCase() === 'yes') {
      interaction.contribution_generated = true;
      await this.initiateContribution(milestoneData);
    }

    this.logInteraction(interaction);
    this.updateStatistics(response.toLowerCase() === 'yes');

    return interaction;
  }

  /**
   * Handle contribution workflow when user agrees
   */
  async initiateContribution(contextData) {
    console.log('\n✨ Generating contribution files...\n');

    // Run contribution generator
    const CommunityContributionGenerator = require('./community-contribution-generator');
    const generator = new CommunityContributionGenerator(this.projectRoot);
    
    try {
      const contributionPath = await generator.generateContribution();
      
      console.log(`✅ Contribution files generated at: ${contributionPath}\n`);
      console.log('📝 Opening files for review...\n');
      
      // Open files for review (in real implementation)
      await this.openFilesForReview(contributionPath);
      
      console.log('\n📋 Review checklist:');
      console.log('   ✓ Project description is complete');
      console.log('   ✓ All learnings sections have content');
      console.log('   ✓ No sensitive data (keys, passwords, internal URLs)');
      console.log('   ✓ Company name is anonymized (if desired)');
      console.log('   ✓ Metrics and improvements are accurate\n');
      
      console.log('When ready, run: npm run submit-contribution\n');
      
      // Track contribution metadata
      this.trackContribution(contributionPath, contextData);
      
    } catch (error) {
      console.error('❌ Error generating contribution:', error.message);
    }
  }

  /**
   * Open contribution files for review
   */
  async openFilesForReview(contributionPath) {
    // In real implementation, this would open files in editor
    // For now, just log the paths
    const files = [
      path.join(contributionPath, 'project-summary.md'),
      path.join(contributionPath, 'learnings.md')
    ];
    
    console.log('Files ready for review:');
    files.forEach(file => console.log(`  - ${file}`));
  }

  /**
   * Track contribution metadata
   */
  trackContribution(contributionPath, contextData) {
    const contributionMeta = {
      path: contributionPath,
      created: new Date().toISOString(),
      context: contextData,
      status: 'pending_review',
      submitted: false
    };

    // Save to project state or separate tracking file
    const trackingPath = path.join(this.projectRoot, 'machine-data', 'pending-contributions.json');
    let pending = [];
    
    if (fs.existsSync(trackingPath)) {
      pending = JSON.parse(fs.readFileSync(trackingPath, 'utf8'));
    }
    
    pending.push(contributionMeta);
    fs.writeFileSync(trackingPath, JSON.stringify(pending, null, 2));
  }

  /**
   * Get user response (simulated for now)
   */
  async getUserResponse() {
    // In real implementation, this would be interactive
    // For testing, simulate random responses
    const responses = ['yes', 'no'];
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    console.log(`User response: ${response}\n`);
    return response;
  }

  /**
   * Create custom prompt for specific situations
   */
  createCustomPrompt(type, template, variables = {}) {
    let prompt = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      prompt = prompt.replace(`{${key}}`, value);
    });

    return {
      id: this.generateInteractionId(),
      type: `custom_${type}`,
      timestamp: new Date().toISOString(),
      prompt_shown: prompt,
      variables
    };
  }

  /**
   * Log interaction
   */
  logInteraction(interaction) {
    const log = JSON.parse(fs.readFileSync(this.interactionLogPath, 'utf8'));
    log.interactions.push(interaction);
    
    // Keep last 100 interactions
    if (log.interactions.length > 100) {
      log.interactions = log.interactions.slice(-100);
    }

    fs.writeFileSync(this.interactionLogPath, JSON.stringify(log, null, 2));
  }

  /**
   * Update statistics
   */
  updateStatistics(accepted) {
    const log = JSON.parse(fs.readFileSync(this.interactionLogPath, 'utf8'));
    log.statistics.total_prompts++;
    
    if (accepted) {
      log.statistics.accepted_contributions++;
    } else {
      log.statistics.declined_contributions++;
    }
    
    log.statistics.contribution_rate = 
      (log.statistics.accepted_contributions / log.statistics.total_prompts * 100).toFixed(1);

    fs.writeFileSync(this.interactionLogPath, JSON.stringify(log, null, 2));
  }

  /**
   * Get interaction report
   */
  getInteractionReport() {
    const log = JSON.parse(fs.readFileSync(this.interactionLogPath, 'utf8'));
    
    const report = {
      summary: log.statistics,
      recent_interactions: log.interactions.slice(-10),
      by_type: this.groupByType(log.interactions),
      contribution_trends: this.analyzeTrends(log.interactions),
      recommendations: this.generateRecommendations(log)
    };

    return report;
  }

  /**
   * Group interactions by type
   */
  groupByType(interactions) {
    const grouped = {};
    
    interactions.forEach(interaction => {
      if (!grouped[interaction.type]) {
        grouped[interaction.type] = {
          count: 0,
          accepted: 0,
          acceptance_rate: 0
        };
      }
      
      grouped[interaction.type].count++;
      if (interaction.response?.toLowerCase() === 'yes') {
        grouped[interaction.type].accepted++;
      }
    });

    // Calculate acceptance rates
    Object.values(grouped).forEach(group => {
      group.acceptance_rate = (group.accepted / group.count * 100).toFixed(1);
    });

    return grouped;
  }

  /**
   * Analyze contribution trends
   */
  analyzeTrends(interactions) {
    const trends = {
      weekly: {},
      monthly: {},
      overall_direction: 'stable'
    };

    interactions.forEach(interaction => {
      const date = new Date(interaction.timestamp);
      const week = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      // Weekly trends
      if (!trends.weekly[week]) {
        trends.weekly[week] = { total: 0, accepted: 0 };
      }
      trends.weekly[week].total++;
      if (interaction.response?.toLowerCase() === 'yes') {
        trends.weekly[week].accepted++;
      }

      // Monthly trends
      if (!trends.monthly[month]) {
        trends.monthly[month] = { total: 0, accepted: 0 };
      }
      trends.monthly[month].total++;
      if (interaction.response?.toLowerCase() === 'yes') {
        trends.monthly[month].accepted++;
      }
    });

    // Determine overall direction
    const recentMonths = Object.keys(trends.monthly).slice(-3);
    if (recentMonths.length >= 2) {
      const rates = recentMonths.map(month => 
        trends.monthly[month].accepted / trends.monthly[month].total
      );
      
      if (rates[rates.length - 1] > rates[0]) {
        trends.overall_direction = 'improving';
      } else if (rates[rates.length - 1] < rates[0]) {
        trends.overall_direction = 'declining';
      }
    }

    return trends;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(log) {
    const recommendations = [];
    const rate = parseFloat(log.statistics.contribution_rate);

    if (rate < 30) {
      recommendations.push({
        type: 'engagement',
        priority: 'high',
        message: 'Low contribution rate detected',
        action: 'Consider improving prompt messaging or timing'
      });
    }

    if (log.statistics.total_prompts < 10) {
      recommendations.push({
        type: 'data',
        priority: 'low',
        message: 'Limited interaction data',
        action: 'Continue collecting data for better insights'
      });
    }

    const sprintEndRate = this.getTypeAcceptanceRate(log.interactions, 'sprint_end');
    if (sprintEndRate < 50 && sprintEndRate !== null) {
      recommendations.push({
        type: 'timing',
        priority: 'medium',
        message: 'Sprint-end contributions have low acceptance',
        action: 'Consider prompting at different milestones'
      });
    }

    return recommendations;
  }

  /**
   * Get acceptance rate for specific interaction type
   */
  getTypeAcceptanceRate(interactions, type) {
    const typeInteractions = interactions.filter(i => i.type === type);
    if (typeInteractions.length === 0) return null;
    
    const accepted = typeInteractions.filter(i => 
      i.response?.toLowerCase() === 'yes'
    ).length;
    
    return (accepted / typeInteractions.length * 100);
  }

  /**
   * Generate interaction ID
   */
  generateInteractionId() {
    return `INT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = StakeholderInteractionManager;

// CLI interface
if (require.main === module) {
  const manager = new StakeholderInteractionManager(path.join(__dirname, '..'));
  
  const command = process.argv[2];
  
  switch (command) {
    case 'report':
      const report = manager.getInteractionReport();
      console.log('📊 Stakeholder Interaction Report');
      console.log('=================================');
      console.log(JSON.stringify(report, null, 2));
      break;

    case 'prompt':
      // Example sprint-end prompt
      manager.promptSprintEnd({
        sprint_number: 3,
        completed_tasks: 25,
        velocity: 45
      });
      break;

    default:
      console.log('Commands: report, prompt');
  }
}
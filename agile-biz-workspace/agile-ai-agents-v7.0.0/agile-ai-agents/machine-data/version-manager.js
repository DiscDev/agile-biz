/**
 * Version Manager for AgileAiAgents
 * Handles dual versioning system (system + self-improvements)
 */

const fs = require('fs');
const path = require('path');

class VersionManager {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.agentsPath = path.join(projectRoot, 'ai-agents');
    this.versionHistoryPath = path.join(projectRoot, 'machine-data', 'version-history.json');
    this.initializeHistory();
  }

  /**
   * Initialize version history file if it doesn't exist
   */
  initializeHistory() {
    if (!fs.existsSync(this.versionHistoryPath)) {
      const initialHistory = {
        system_version: '1.0.0',
        agents: {},
        history: []
      };
      fs.writeFileSync(this.versionHistoryPath, JSON.stringify(initialHistory, null, 2));
    }
  }

  /**
   * Get current version of an agent
   */
  getCurrentVersion(agentName) {
    const agentPath = path.join(this.agentsPath, `${agentName}.md`);
    if (!fs.existsSync(agentPath)) {
      throw new Error(`Agent ${agentName} not found`);
    }

    const content = fs.readFileSync(agentPath, 'utf8');
    const versionMatch = content.match(/##\s*Version\s*History[\s\S]*?###\s*v([\d.]+(?:\+\d{8}\.\d+)?)/);
    
    return versionMatch ? versionMatch[1] : '1.0.0';
  }

  /**
   * Update agent version with self-improvement
   */
  updateAgentVersion(agentName, improvement) {
    const currentVersion = this.getCurrentVersion(agentName);
    const baseVersion = currentVersion.split('+')[0];
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    
    // Check if there's already a self-improvement today
    let incrementNumber = 1;
    if (currentVersion.includes(`+${today}`)) {
      const currentIncrement = parseInt(currentVersion.split('.').pop());
      incrementNumber = currentIncrement + 1;
    }

    const newVersion = `${baseVersion}+${today}.${incrementNumber}`;

    // Update agent MD file
    this.updateAgentFile(agentName, newVersion, improvement);
    
    // Update version history
    this.updateVersionHistory(agentName, currentVersion, newVersion, improvement);

    return newVersion;
  }

  /**
   * Update agent MD file with new version
   */
  updateAgentFile(agentName, newVersion, improvement) {
    const agentPath = path.join(this.agentsPath, `${agentName}.md`);
    let content = fs.readFileSync(agentPath, 'utf8');

    // Find Version History section
    const versionHistoryIndex = content.indexOf('## Version History');
    if (versionHistoryIndex === -1) {
      // Add Version History section if it doesn't exist
      content += `\n\n## Version History\n\n### v${newVersion}\n${this.formatVersionEntry(improvement)}`;
    } else {
      // Insert new version at the top of history
      const insertPoint = content.indexOf('\n', versionHistoryIndex + 18) + 1;
      const versionEntry = `\n### v${newVersion}\n${this.formatVersionEntry(improvement)}\n`;
      content = content.slice(0, insertPoint) + versionEntry + content.slice(insertPoint);
    }

    fs.writeFileSync(agentPath, content);
  }

  /**
   * Format version entry for MD file
   */
  formatVersionEntry(improvement) {
    const date = new Date().toISOString().split('T')[0];
    return `- **Source**: ${improvement.source}
- **Changes**: ${improvement.changes}
- **Impact**: ${improvement.impact}
- **Validated**: ${date}`;
  }

  /**
   * Update central version history
   */
  updateVersionHistory(agentName, oldVersion, newVersion, improvement) {
    const history = JSON.parse(fs.readFileSync(this.versionHistoryPath, 'utf8'));
    
    // Update agent version
    if (!history.agents[agentName]) {
      history.agents[agentName] = {
        current_version: newVersion,
        base_version: newVersion.split('+')[0],
        improvements: []
      };
    } else {
      history.agents[agentName].current_version = newVersion;
    }

    // Add improvement record
    history.agents[agentName].improvements.push({
      date: new Date().toISOString(),
      from_version: oldVersion,
      to_version: newVersion,
      source: improvement.source,
      changes: improvement.changes,
      impact: improvement.impact,
      validated: false
    });

    // Add to global history
    history.history.push({
      timestamp: new Date().toISOString(),
      agent: agentName,
      action: 'version_update',
      from: oldVersion,
      to: newVersion,
      reason: improvement.changes
    });

    fs.writeFileSync(this.versionHistoryPath, JSON.stringify(history, null, 2));
  }

  /**
   * Update system version (for official releases)
   */
  updateSystemVersion(newVersion) {
    // Update version.json
    const versionPath = path.join(this.projectRoot, 'version.json');
    const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
    const oldVersion = versionData.version;
    versionData.version = newVersion;
    versionData.updated = new Date().toISOString();
    fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));

    // Update version history
    const history = JSON.parse(fs.readFileSync(this.versionHistoryPath, 'utf8'));
    history.system_version = newVersion;
    history.history.push({
      timestamp: new Date().toISOString(),
      action: 'system_version_update',
      from: oldVersion,
      to: newVersion
    });
    fs.writeFileSync(this.versionHistoryPath, JSON.stringify(history, null, 2));

    return { oldVersion, newVersion };
  }

  /**
   * Get version history for an agent
   */
  getAgentHistory(agentName) {
    const history = JSON.parse(fs.readFileSync(this.versionHistoryPath, 'utf8'));
    return history.agents[agentName] || null;
  }

  /**
   * Check if a version update was successful
   */
  validateVersion(agentName, version, metrics) {
    const history = JSON.parse(fs.readFileSync(this.versionHistoryPath, 'utf8'));
    
    if (!history.agents[agentName]) {
      return false;
    }

    const improvement = history.agents[agentName].improvements.find(
      imp => imp.to_version === version
    );

    if (improvement) {
      improvement.validated = true;
      improvement.validation_date = new Date().toISOString();
      improvement.validation_metrics = metrics;
      fs.writeFileSync(this.versionHistoryPath, JSON.stringify(history, null, 2));
      return true;
    }

    return false;
  }

  /**
   * Rollback to a previous version
   */
  rollbackVersion(agentName, targetVersion) {
    const history = JSON.parse(fs.readFileSync(this.versionHistoryPath, 'utf8'));
    const currentVersion = this.getCurrentVersion(agentName);

    // Log rollback
    history.history.push({
      timestamp: new Date().toISOString(),
      agent: agentName,
      action: 'version_rollback',
      from: currentVersion,
      to: targetVersion,
      reason: 'Improvement validation failed'
    });

    // Update agent file (would need to restore from backup in real implementation)
    // For now, just update the version history
    history.agents[agentName].current_version = targetVersion;
    
    fs.writeFileSync(this.versionHistoryPath, JSON.stringify(history, null, 2));

    return { from: currentVersion, to: targetVersion };
  }

  /**
   * Get all agents with self-improvements
   */
  getImprovedAgents() {
    const history = JSON.parse(fs.readFileSync(this.versionHistoryPath, 'utf8'));
    const improved = [];

    for (const [agentName, agentData] of Object.entries(history.agents)) {
      if (agentData.current_version.includes('+')) {
        improved.push({
          agent: agentName,
          version: agentData.current_version,
          improvementCount: agentData.improvements.length,
          lastImprovement: agentData.improvements[agentData.improvements.length - 1]
        });
      }
    }

    return improved;
  }

  /**
   * Generate version report
   */
  generateVersionReport() {
    const history = JSON.parse(fs.readFileSync(this.versionHistoryPath, 'utf8'));
    const report = {
      system_version: history.system_version,
      total_agents: Object.keys(history.agents).length,
      improved_agents: this.getImprovedAgents().length,
      total_improvements: Object.values(history.agents)
        .reduce((sum, agent) => sum + agent.improvements.length, 0),
      recent_updates: history.history.slice(-10).reverse()
    };

    return report;
  }
}

// Export for use in other modules
module.exports = VersionManager;

// CLI interface
if (require.main === module) {
  const manager = new VersionManager(path.join(__dirname, '..'));
  
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'update':
      if (args.length < 4) {
        console.log('Usage: node version-manager.js update <agent> <source> <changes> <impact>');
        process.exit(1);
      }
      const [agent, source, changes, impact] = args;
      const newVersion = manager.updateAgentVersion(agent, { source, changes, impact });
      console.log(`✅ Updated ${agent} to version ${newVersion}`);
      break;

    case 'report':
      const report = manager.generateVersionReport();
      console.log('📊 Version Report');
      console.log('================');
      console.log(`System Version: ${report.system_version}`);
      console.log(`Total Agents: ${report.total_agents}`);
      console.log(`Improved Agents: ${report.improved_agents}`);
      console.log(`Total Improvements: ${report.total_improvements}`);
      console.log('\nRecent Updates:');
      report.recent_updates.forEach(update => {
        console.log(`  - ${update.timestamp}: ${update.action} for ${update.agent || 'system'}`);
      });
      break;

    default:
      console.log('Commands: update, report');
  }
}
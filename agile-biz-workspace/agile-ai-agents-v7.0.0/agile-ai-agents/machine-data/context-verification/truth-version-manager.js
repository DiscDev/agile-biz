/**
 * Truth Version Manager
 * 
 * Manages versioning and history of project truth documents
 */

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

class TruthVersionManager {
  constructor() {
    this.projectRoot = path.join(__dirname, '..', '..');
    this.truthPath = path.join(this.projectRoot, 'project-documents', 'project-truth');
    this.versionsPath = path.join(this.truthPath, 'versions');
    this.historyPath = path.join(this.truthPath, 'history.json');
    this.currentVersion = null;
    this.history = [];
  }

  /**
   * Initialize version manager
   */
  async initialize() {
    try {
      // Ensure directories exist
      await fs.ensureDir(this.truthPath);
      await fs.ensureDir(this.versionsPath);
      
      // Load version history
      await this.loadHistory();
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Load version history
   */
  async loadHistory() {
    if (await fs.pathExists(this.historyPath)) {
      const data = await fs.readJSON(this.historyPath);
      this.history = data.versions || [];
      this.currentVersion = data.currentVersion || null;
    }
  }

  /**
   * Save version history
   */
  async saveHistory() {
    const historyData = {
      lastUpdated: new Date().toISOString(),
      currentVersion: this.currentVersion,
      totalVersions: this.history.length,
      versions: this.history
    };
    
    await fs.writeJSON(this.historyPath, historyData, { spaces: 2 });
  }

  /**
   * Create a new version of the project truth
   */
  async createVersion(truthData, changeReason, author = 'system') {
    const version = {
      id: `v${this.history.length + 1}`,
      version: this.generateSemanticVersion(),
      timestamp: new Date().toISOString(),
      author,
      changeReason,
      changes: await this.detectChanges(truthData),
      hash: this.generateHash(truthData)
    };

    // Save version file
    const versionPath = path.join(
      this.versionsPath,
      `${version.id}-${version.timestamp.split('T')[0]}.json`
    );
    
    const versionData = {
      ...version,
      truth: truthData
    };
    
    await fs.writeJSON(versionPath, versionData, { spaces: 2 });
    
    // Update history
    this.history.push(version);
    this.currentVersion = version.id;
    
    // Save history
    await this.saveHistory();
    
    // Create changelog entry
    await this.createChangelogEntry(version);
    
    return {
      success: true,
      version
    };
  }

  /**
   * Generate semantic version based on changes
   */
  generateSemanticVersion() {
    if (this.history.length === 0) {
      return '1.0.0';
    }
    
    const lastVersion = this.history[this.history.length - 1];
    const [major, minor, patch] = (lastVersion.version || '1.0.0').split('.').map(Number);
    
    // For now, just increment patch version
    // In future, could analyze changes to determine major/minor/patch
    return `${major}.${minor}.${patch + 1}`;
  }

  /**
   * Detect changes between versions
   */
  async detectChanges(newTruth) {
    if (this.history.length === 0) {
      return {
        type: 'initial',
        summary: 'Initial project truth creation',
        details: []
      };
    }

    // Load previous version
    const previousVersion = await this.getVersion(this.currentVersion);
    if (!previousVersion) {
      return {
        type: 'unknown',
        summary: 'Unable to compare with previous version',
        details: []
      };
    }

    const oldTruth = previousVersion.truth;
    const changes = {
      type: 'update',
      summary: '',
      details: []
    };

    // Compare each field
    if (oldTruth.whatWereBuilding !== newTruth.whatWereBuilding) {
      changes.details.push({
        field: 'whatWereBuilding',
        old: oldTruth.whatWereBuilding,
        new: newTruth.whatWereBuilding,
        impact: 'critical'
      });
    }

    if (oldTruth.industry !== newTruth.industry) {
      changes.details.push({
        field: 'industry',
        old: oldTruth.industry,
        new: newTruth.industry,
        impact: 'critical'
      });
    }

    // Compare target users
    if (JSON.stringify(oldTruth.targetUsers) !== JSON.stringify(newTruth.targetUsers)) {
      changes.details.push({
        field: 'targetUsers',
        old: oldTruth.targetUsers,
        new: newTruth.targetUsers,
        impact: 'high'
      });
    }

    // Compare NOT THIS list
    const oldNotThis = new Set(oldTruth.notThis || []);
    const newNotThis = new Set(newTruth.notThis || []);
    
    const addedNotThis = [...newNotThis].filter(x => !oldNotThis.has(x));
    const removedNotThis = [...oldNotThis].filter(x => !newNotThis.has(x));
    
    if (addedNotThis.length > 0 || removedNotThis.length > 0) {
      changes.details.push({
        field: 'notThis',
        added: addedNotThis,
        removed: removedNotThis,
        impact: 'medium'
      });
    }

    // Compare competitors
    const competitorChanges = this.compareCompetitors(oldTruth.competitors, newTruth.competitors);
    if (competitorChanges) {
      changes.details.push({
        field: 'competitors',
        ...competitorChanges,
        impact: 'low'
      });
    }

    // Generate summary
    if (changes.details.length === 0) {
      changes.summary = 'No significant changes detected';
    } else {
      const criticalChanges = changes.details.filter(c => c.impact === 'critical').length;
      const highChanges = changes.details.filter(c => c.impact === 'high').length;
      
      if (criticalChanges > 0) {
        changes.type = 'major';
        changes.summary = `Major changes: ${criticalChanges} critical field(s) modified`;
      } else if (highChanges > 0) {
        changes.type = 'minor';
        changes.summary = `Minor changes: ${highChanges} important field(s) modified`;
      } else {
        changes.type = 'patch';
        changes.summary = `Patch changes: ${changes.details.length} field(s) updated`;
      }
    }

    return changes;
  }

  /**
   * Compare competitors lists
   */
  compareCompetitors(oldComp, newComp) {
    const oldNames = new Set((oldComp || []).map(c => c.name || c));
    const newNames = new Set((newComp || []).map(c => c.name || c));
    
    const added = [...newNames].filter(x => !oldNames.has(x));
    const removed = [...oldNames].filter(x => !newNames.has(x));
    
    if (added.length === 0 && removed.length === 0) {
      return null;
    }
    
    return { added, removed };
  }

  /**
   * Generate hash for truth data
   */
  generateHash(data) {
    const content = JSON.stringify(data, null, 2);
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 8);
  }

  /**
   * Create changelog entry
   */
  async createChangelogEntry(version) {
    const changelogPath = path.join(this.truthPath, 'CHANGELOG.md');
    
    let changelog = '';
    if (await fs.pathExists(changelogPath)) {
      changelog = await fs.readFile(changelogPath, 'utf8');
    } else {
      changelog = '# Project Truth Changelog\n\nAll changes to the project truth document are tracked here.\n\n';
    }

    // Add new entry at the top (after header)
    const entry = `
## ${version.version} - ${new Date(version.timestamp).toDateString()}

**Author**: ${version.author}
**Reason**: ${version.changeReason}

### Changes
${version.changes.details.map(change => {
  if (change.field === 'notThis' || change.field === 'competitors') {
    let text = `- **${change.field}**: `;
    if (change.added && change.added.length > 0) {
      text += `Added ${change.added.join(', ')}`;
    }
    if (change.removed && change.removed.length > 0) {
      if (change.added && change.added.length > 0) text += '; ';
      text += `Removed ${change.removed.join(', ')}`;
    }
    return text;
  } else {
    return `- **${change.field}**: Changed from "${change.old}" to "${change.new}"`;
  }
}).join('\n')}

---
`;

    // Insert after header
    const lines = changelog.split('\n');
    let insertIndex = lines.findIndex(line => line.startsWith('All changes'));
    if (insertIndex === -1) insertIndex = 2;
    
    lines.splice(insertIndex + 2, 0, entry);
    
    await fs.writeFile(changelogPath, lines.join('\n'), 'utf8');
  }

  /**
   * Get a specific version
   */
  async getVersion(versionId) {
    const versionInfo = this.history.find(v => v.id === versionId);
    if (!versionInfo) {
      return null;
    }

    // Find version file
    const files = await fs.readdir(this.versionsPath);
    const versionFile = files.find(f => f.startsWith(versionId));
    
    if (!versionFile) {
      return null;
    }

    const versionPath = path.join(this.versionsPath, versionFile);
    const versionData = await fs.readJSON(versionPath);
    
    return versionData;
  }

  /**
   * Get version history
   */
  getHistory() {
    return this.history.map(v => ({
      id: v.id,
      version: v.version,
      timestamp: v.timestamp,
      author: v.author,
      changeReason: v.changeReason,
      changeType: v.changes.type,
      changeSummary: v.changes.summary
    }));
  }

  /**
   * Compare two versions
   */
  async compareVersions(versionId1, versionId2) {
    const v1 = await this.getVersion(versionId1);
    const v2 = await this.getVersion(versionId2);
    
    if (!v1 || !v2) {
      return {
        success: false,
        error: 'One or both versions not found'
      };
    }

    const comparison = {
      version1: {
        id: v1.id,
        version: v1.version,
        timestamp: v1.timestamp
      },
      version2: {
        id: v2.id,
        version: v2.version,
        timestamp: v2.timestamp
      },
      differences: []
    };

    // Compare all fields
    const fields = ['whatWereBuilding', 'industry', 'targetUsers', 'notThis', 'competitors', 'domainTerms'];
    
    for (const field of fields) {
      const val1 = JSON.stringify(v1.truth[field]);
      const val2 = JSON.stringify(v2.truth[field]);
      
      if (val1 !== val2) {
        comparison.differences.push({
          field,
          version1: v1.truth[field],
          version2: v2.truth[field]
        });
      }
    }

    return {
      success: true,
      comparison
    };
  }

  /**
   * Rollback to a previous version
   */
  async rollbackToVersion(versionId, reason) {
    const version = await this.getVersion(versionId);
    
    if (!version) {
      return {
        success: false,
        error: 'Version not found'
      };
    }

    // Create a new version with the old data
    const rollbackResult = await this.createVersion(
      version.truth,
      `Rollback to ${versionId}: ${reason}`,
      'system-rollback'
    );

    if (rollbackResult.success) {
      // Update current project-truth.md
      const truthFilePath = path.join(this.truthPath, 'project-truth.md');
      const markdownContent = this.generateMarkdownFromTruth(version.truth);
      await fs.writeFile(truthFilePath, markdownContent, 'utf8');
    }

    return rollbackResult;
  }

  /**
   * Generate markdown from truth data
   */
  generateMarkdownFromTruth(truth) {
    return `# PROJECT TRUTH: ${truth.projectName || 'Project'}
Generated: ${new Date().toISOString()}
Last Verified: ${new Date().toISOString()}

## WHAT WE'RE BUILDING
${truth.whatWereBuilding}

## INDUSTRY/DOMAIN
${truth.industry}

## TARGET USERS
- Primary: ${truth.targetUsers.primary}
- Secondary: ${truth.targetUsers.secondary || 'N/A'}

## NOT THIS
This project is NOT:
${(truth.notThis || []).map(item => `- ❌ ${item}`).join('\n')}

## COMPETITORS
${(truth.competitors || []).map(c => `- ${c.name || c} - ${c.description || ''}`).join('\n')}

## DOMAIN TERMS
${(truth.domainTerms || []).map(t => `- **${t.term}**: ${t.definition}`).join('\n')}

## VERSION HISTORY
See CHANGELOG.md for detailed version history.

---
*This document is the single source of truth for project context. All features, stories, and tasks must align with this document.*
`;
  }

  /**
   * Get version recommendation based on changes
   */
  getVersionRecommendation(changes) {
    const criticalFields = ['whatWereBuilding', 'industry'];
    const majorFields = ['targetUsers'];
    
    const hasCriticalChanges = changes.some(c => criticalFields.includes(c.field));
    const hasMajorChanges = changes.some(c => majorFields.includes(c.field));
    
    if (hasCriticalChanges) {
      return {
        type: 'major',
        reason: 'Critical fields changed - this represents a significant shift in project direction'
      };
    } else if (hasMajorChanges) {
      return {
        type: 'minor',
        reason: 'Important fields changed - this represents notable adjustments'
      };
    } else {
      return {
        type: 'patch',
        reason: 'Minor updates and clarifications'
      };
    }
  }

  /**
   * Generate diff report between versions
   */
  async generateDiffReport(versionId1, versionId2) {
    const comparison = await this.compareVersions(versionId1, versionId2);
    
    if (!comparison.success) {
      return comparison;
    }

    let report = `# Project Truth Version Comparison

**Version 1**: ${comparison.comparison.version1.id} (${comparison.comparison.version1.version})
**Date**: ${new Date(comparison.comparison.version1.timestamp).toDateString()}

**Version 2**: ${comparison.comparison.version2.id} (${comparison.comparison.version2.version})
**Date**: ${new Date(comparison.comparison.version2.timestamp).toDateString()}

## Differences

`;

    if (comparison.comparison.differences.length === 0) {
      report += 'No differences found between versions.\n';
    } else {
      comparison.comparison.differences.forEach(diff => {
        report += `### ${diff.field}\n\n`;
        report += `**Version 1**:\n\`\`\`\n${JSON.stringify(diff.version1, null, 2)}\n\`\`\`\n\n`;
        report += `**Version 2**:\n\`\`\`\n${JSON.stringify(diff.version2, null, 2)}\n\`\`\`\n\n`;
      });
    }

    const reportPath = path.join(
      this.truthPath,
      `diff-${versionId1}-${versionId2}.md`
    );
    
    await fs.writeFile(reportPath, report, 'utf8');
    
    return {
      success: true,
      reportPath,
      differences: comparison.comparison.differences.length
    };
  }
}

// Export singleton instance
module.exports = new TruthVersionManager();
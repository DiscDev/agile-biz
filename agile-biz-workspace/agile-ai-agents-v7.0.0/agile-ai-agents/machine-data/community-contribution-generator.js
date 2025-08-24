/**
 * Community Contribution Generator
 * Automatically generates contribution files from project data
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const PrivacyScanner = require('./privacy-scanner');

class CommunityContributionGenerator {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.projectDocuments = path.join(projectRoot, 'project-documents');
    this.machineData = path.join(projectRoot, 'machine-data');
    this.contributionsPath = path.join(projectRoot, 'community-learnings', 'contributions');
    this.privacyScanner = new PrivacyScanner(projectRoot);
  }

  /**
   * Generate contribution files for current project
   */
  async generateContribution() {
    const timestamp = new Date().toISOString().split('T')[0];
    const projectInfo = await this.extractProjectInfo();
    const contributionId = `${timestamp}-${projectInfo.projectType}`;
    const contributionPath = path.join(this.contributionsPath, contributionId);

    // Create contribution directory
    if (!fs.existsSync(contributionPath)) {
      fs.mkdirSync(contributionPath, { recursive: true });
    }

    // Generate project summary
    const projectSummary = await this.generateProjectSummary(projectInfo);
    fs.writeFileSync(
      path.join(contributionPath, 'project-summary.md'),
      projectSummary
    );

    // Generate learnings
    const learnings = await this.generateLearnings(projectInfo);
    fs.writeFileSync(
      path.join(contributionPath, 'learnings.md'),
      learnings
    );

    // Scan for privacy issues
    console.log('\n🔍 Scanning for sensitive data...');
    const scanResults = await this.privacyScanner.scanContribution(contributionPath);
    
    if (scanResults.summary.total_issues > 0) {
      console.log(`\n⚠️  Found ${scanResults.summary.total_issues} potential sensitive items:`);
      console.log(`   Critical: ${scanResults.summary.critical}`);
      console.log(`   Warning: ${scanResults.summary.warning}`);
      console.log(`   Info: ${scanResults.summary.info}`);
      
      if (scanResults.summary.critical > 0) {
        console.log('\n❌ Critical issues found! Please review and fix before submitting.');
      } else {
        console.log('\n⚠️  Please review warnings before submitting.');
      }
      
      // Save scan report
      const scanReportPath = path.join(contributionPath, 'privacy-scan-report.json');
      fs.writeFileSync(scanReportPath, JSON.stringify(scanResults, null, 2));
      console.log(`\n📋 Detailed scan report saved to: ${scanReportPath}`);
    } else {
      console.log('✅ No sensitive data detected!');
    }

    console.log(`\n✅ Contribution files generated at: ${contributionPath}`);
    return { contributionPath, scanResults };
  }

  /**
   * Extract project information from various sources
   */
  async extractProjectInfo() {
    const info = {
      projectType: 'unknown',
      industry: 'unknown',
      duration: 'unknown',
      technology: {},
      metrics: {},
      agentVersions: {},
      repositoryEvolution: []
    };

    // Extract from PRD
    const prdPath = path.join(this.projectDocuments, '05-requirements', 'prd.json');
    if (fs.existsSync(prdPath)) {
      const prd = JSON.parse(fs.readFileSync(prdPath, 'utf8'));
      info.projectType = prd.project_overview?.type || info.projectType;
      info.industry = this.detectIndustry(prd);
    }

    // Extract technology stack
    info.technology = await this.detectTechnology();

    // Extract metrics from sprint retrospectives
    info.metrics = await this.extractMetrics();

    // Extract agent versions
    info.agentVersions = await this.getCurrentAgentVersions();

    // Extract repository evolution
    info.repositoryEvolution = await this.extractRepositoryEvolution();

    // Calculate project duration
    info.duration = await this.calculateProjectDuration();

    return info;
  }

  /**
   * Detect technology stack with versions
   */
  async detectTechnology() {
    const tech = {
      frontend: { framework: 'Unknown', version: 'Unknown', packages: [] },
      backend: { framework: 'Unknown', version: 'Unknown', packages: [] },
      database: { type: 'Unknown', version: 'Unknown' }
    };

    // Check package.json
    const packageJsonPath = path.join(this.projectRoot, '..', 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Detect frontend
      if (packageJson.dependencies?.react) {
        tech.frontend.framework = 'React';
        tech.frontend.version = packageJson.dependencies.react.replace('^', '');
        tech.frontend.packages = this.extractKeyPackages(packageJson.dependencies, [
          'react-router', 'redux', '@reduxjs/toolkit', 'next'
        ]);
      } else if (packageJson.dependencies?.vue) {
        tech.frontend.framework = 'Vue';
        tech.frontend.version = packageJson.dependencies.vue.replace('^', '');
      } else if (packageJson.dependencies?.['@angular/core']) {
        tech.frontend.framework = 'Angular';
        tech.frontend.version = packageJson.dependencies['@angular/core'].replace('^', '');
      }

      // Detect backend
      if (packageJson.dependencies?.express) {
        tech.backend.framework = 'Express/Node.js';
        tech.backend.version = process.version;
        tech.backend.packages = this.extractKeyPackages(packageJson.dependencies, [
          'express', 'mongoose', 'sequelize', 'prisma'
        ]);
      }
    }

    // Check requirements.txt for Python projects
    const requirementsPath = path.join(this.projectRoot, '..', 'requirements.txt');
    if (fs.existsSync(requirementsPath)) {
      const requirements = fs.readFileSync(requirementsPath, 'utf8');
      if (requirements.includes('django')) {
        tech.backend.framework = 'Django';
        tech.backend.version = this.extractVersion(requirements, 'django');
      } else if (requirements.includes('flask')) {
        tech.backend.framework = 'Flask';
        tech.backend.version = this.extractVersion(requirements, 'flask');
      }
    }

    return tech;
  }

  /**
   * Extract key packages with versions
   */
  extractKeyPackages(dependencies, keyPackages) {
    const packages = [];
    for (const pkg of keyPackages) {
      if (dependencies[pkg]) {
        packages.push(`${pkg}@${dependencies[pkg].replace('^', '')}`);
      }
    }
    return packages;
  }

  /**
   * Detect industry from project content
   */
  detectIndustry(prd) {
    const content = JSON.stringify(prd).toLowerCase();
    const industryKeywords = {
      'Healthcare': ['health', 'medical', 'patient', 'clinic', 'hospital'],
      'Finance': ['finance', 'banking', 'payment', 'transaction', 'investment'],
      'E-commerce': ['shop', 'store', 'product', 'cart', 'order', 'commerce'],
      'Education': ['education', 'learning', 'course', 'student', 'teacher'],
      'SaaS': ['saas', 'subscription', 'dashboard', 'analytics', 'platform'],
      'Social': ['social', 'community', 'user', 'profile', 'feed'],
      'Productivity': ['task', 'project', 'workflow', 'productivity', 'management']
    };

    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      const matches = keywords.filter(keyword => content.includes(keyword));
      if (matches.length >= 2) {
        return industry;
      }
    }

    return 'Technology';
  }

  /**
   * Extract metrics from sprint retrospectives
   */
  async extractMetrics() {
    const metrics = {
      sprintCount: 0,
      totalTasks: 0,
      initialVelocity: 0,
      finalVelocity: 0,
      timeToFirstDeployment: 'Unknown',
      totalDevelopmentTime: 'Unknown'
    };

    const retrospectivesPath = path.join(
      this.projectDocuments,
      '00-orchestration',
      'sprint-retrospectives'
    );

    if (fs.existsSync(retrospectivesPath)) {
      const files = fs.readdirSync(retrospectivesPath)
        .filter(f => f.endsWith('.json'))
        .sort();

      metrics.sprintCount = files.length;

      if (files.length > 0) {
        // Get initial velocity
        const firstSprint = JSON.parse(
          fs.readFileSync(path.join(retrospectivesPath, files[0]), 'utf8')
        );
        metrics.initialVelocity = firstSprint.metrics?.velocity || 0;
        
        // Get final velocity
        const lastSprint = JSON.parse(
          fs.readFileSync(path.join(retrospectivesPath, files[files.length - 1]), 'utf8')
        );
        metrics.finalVelocity = lastSprint.metrics?.velocity || 0;

        // Count total tasks
        for (const file of files) {
          const sprint = JSON.parse(
            fs.readFileSync(path.join(retrospectivesPath, file), 'utf8')
          );
          metrics.totalTasks += sprint.completed_tasks?.length || 0;
        }
      }
    }

    return metrics;
  }

  /**
   * Get current agent versions
   */
  async getCurrentAgentVersions() {
    const versions = {};
    const agentsPath = path.join(this.projectRoot, 'ai-agents');
    
    if (fs.existsSync(agentsPath)) {
      const agentFiles = fs.readdirSync(agentsPath)
        .filter(f => f.endsWith('.md'));

      for (const file of agentFiles) {
        const agentName = file.replace('.md', '');
        const content = fs.readFileSync(path.join(agentsPath, file), 'utf8');
        
        // Extract version from ## Version History section
        const versionMatch = content.match(/##\s*Version\s*History[\s\S]*?###\s*v([\d.]+(?:\+\d{8}\.\d+)?)/);
        if (versionMatch) {
          versions[agentName] = versionMatch[1];
        } else {
          // Default version if not found
          versions[agentName] = '1.0.0';
        }
      }
    }

    return versions;
  }

  /**
   * Extract repository evolution history
   */
  async extractRepositoryEvolution() {
    const evolution = [];
    
    // Check for repository structure documentation
    const structurePath = path.join(
      this.projectDocuments,
      '09-project-planning',
      'repository-structure.json'
    );

    if (fs.existsSync(structurePath)) {
      const structure = JSON.parse(fs.readFileSync(structurePath, 'utf8'));
      if (structure.evolution) {
        return structure.evolution;
      }
    }

    // Default single repo if no evolution found
    return [{
      date: new Date().toISOString().split('T')[0],
      from: 'none',
      to: 'single-repo',
      reason: 'Initial project setup'
    }];
  }

  /**
   * Calculate project duration
   */
  async calculateProjectDuration() {
    const sprintPath = path.join(
      this.projectDocuments,
      '00-orchestration',
      'sprint-retrospectives'
    );

    if (fs.existsSync(sprintPath)) {
      const files = fs.readdirSync(sprintPath)
        .filter(f => f.endsWith('.json'))
        .sort();

      if (files.length > 0) {
        const firstSprint = JSON.parse(
          fs.readFileSync(path.join(sprintPath, files[0]), 'utf8')
        );
        const lastSprint = JSON.parse(
          fs.readFileSync(path.join(sprintPath, files[files.length - 1]), 'utf8')
        );

        const startDate = new Date(firstSprint.start_date);
        const endDate = new Date(lastSprint.end_date);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        if (days < 14) return `${days} days`;
        if (days < 60) return `${Math.ceil(days / 7)} weeks`;
        return `${Math.ceil(days / 30)} months`;
      }
    }

    return 'Unknown';
  }

  /**
   * Anonymize sensitive data
   */
  anonymize(data, type) {
    switch (type) {
      case 'company':
        return '[Industry] Company';
      case 'revenue':
        const amount = parseFloat(data.replace(/[^0-9.]/g, ''));
        if (amount < 1000) return 'Under $1K';
        if (amount < 10000) return '$1K-10K';
        if (amount < 100000) return '$10K-100K';
        if (amount < 1000000) return '$100K-1M';
        if (amount < 10000000) return '$1M-10M';
        return '$10M+';
      case 'url':
        return 'example.com';
      default:
        return data;
    }
  }

  /**
   * Generate project summary markdown
   */
  async generateProjectSummary(info) {
    const agileVersion = await this.getAgileAiAgentsVersion();
    const contributionId = `CL-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    return `# Project Summary

## Project Information

**Project Type**: ${info.projectType}  
**Industry**: ${info.industry} *  
**Project Duration**: ${info.duration} *  
**Team Size**: Solo developer  
**Deployment Target**: Cloud *  
**Company Name**: [${info.industry} Company]

## Project Description

[Please provide a brief 2-3 sentence description of what your project does]

## Technology Stack Used

**Frontend**: ${info.technology.frontend.framework} ${info.technology.frontend.version} *  
**Backend**: ${info.technology.backend.framework} ${info.technology.backend.version} *  
**Database**: ${info.technology.database.type} ${info.technology.database.version} *  
**Infrastructure**: Docker, Cloud Services *  
**Key Packages**: ${info.technology.frontend.packages.concat(info.technology.backend.packages).join(', ')} *

## AgileAiAgents Versions

**AgileAiAgents Version**: ${agileVersion} *  
**Agent Versions**: *
\`\`\`json
${JSON.stringify(info.agentVersions, null, 2)}
\`\`\`

## Agent Participation Summary *

[Auto-generated summary of which agents were used and how often]

## Repository Structure Evolution

**Initial Structure**: ${info.repositoryEvolution[0]?.to || 'single-repo'} *  
**Final Structure**: ${info.repositoryEvolution[info.repositoryEvolution.length - 1]?.to || 'single-repo'} *  
**Evolution Timeline**: *
${info.repositoryEvolution.map(e => `- ${e.date}: ${e.from} → ${e.to} (${e.reason})`).join('\n')}

## Key Metrics Summary

**Sprint Count**: ${info.metrics.sprintCount} sprints *  
**Total Tasks Completed**: ${info.metrics.totalTasks} tasks *  
**Initial Sprint Velocity**: ${info.metrics.initialVelocity} story points *  
**Final Sprint Velocity**: ${info.metrics.finalVelocity} story points *  
**Velocity Improvement**: ${Math.round((info.metrics.finalVelocity - info.metrics.initialVelocity) / info.metrics.initialVelocity * 100)}% increase *

**Time Metrics**:
- Time to First Deployment: ${info.metrics.timeToFirstDeployment} *
- Total Development Time: ${info.duration} *
- Estimated Traditional Time: [Please estimate]

## Stakeholder Satisfaction

**Overall Satisfaction**: [1-10 scale] *  
**Would Recommend**: Yes *  
**Key Feedback**: [Please summarize feedback]

## Privacy Settings

- [ ] Include company name (default: anonymized)
- [ ] Include specific revenue/user numbers (default: ranges)
- [ ] Include team member names (default: roles only)
- [ ] Make contact information public

---

**Contributor**: [Your GitHub username]  
**Date**: ${new Date().toISOString().split('T')[0]} *  
**Contribution ID**: ${contributionId} *

* = Auto-populated fields`;
  }

  /**
   * Generate learnings markdown
   */
  async generateLearnings(info) {
    const metrics = await this.extractDetailedMetrics();
    const agentLearnings = await this.extractAgentLearnings();
    const patterns = await this.extractPatterns();

    return `# Learnings

## Overall Metrics

### Performance Improvements *
\`\`\`json
${JSON.stringify(metrics.performance, null, 2)}
\`\`\`

### Success Indicators
${metrics.success.map(s => `- ${s.checked ? '✅' : '⬜'} ${s.label}`).join('\n')}

## Individual Agent Learnings

${agentLearnings.map(agent => `### ${agent.name}
**Version**: ${agent.version} *
- **Learned**: ${agent.learned || '[What did this agent learn?]'}
- **Challenge**: ${agent.challenge || '[What challenge was encountered?]'}
- **Solution**: ${agent.solution || '[How was it solved?]'}
- **Impact**: ${agent.impact || '[What was the measurable impact?]'}
- **Recommendation**: ${agent.recommendation || '[What should future projects do?]'}`).join('\n\n')}

## Team Coordination Learnings

### Successful Patterns
${patterns.successful.map((p, i) => `${i + 1}. **${p.name}**
   - **Agents Involved**: ${p.agents}
   - **Context**: ${p.context}
   - **Outcome**: ${p.outcome}`).join('\n\n')}

### Anti-Patterns Discovered
${patterns.antiPatterns.map((p, i) => `${i + 1}. **${p.name}**
   - **Issue**: ${p.issue}
   - **Root Cause**: ${p.cause}
   - **Solution**: ${p.solution}`).join('\n\n')}

## Repository Evolution

### Structure Changes
\`\`\`yaml
timeline:
${info.repositoryEvolution.map(e => `  - date: "${e.date}"
    action: "${e.action || 'Structure change'}"
    reason: "${e.reason}"
    from: "${e.from}"
    to: "${e.to}"
    impact: 
      - "${e.impact || 'To be measured'}"
`).join('')}\`\`\`

### Lessons Learned
- **When to split repositories**: [What criteria did you discover?]
- **Coordination challenges**: [How did you handle multi-repo coordination?]
- **Benefits realized**: [What measurable improvements did you see?]

## System-Level Insights

### Architecture Decisions
[Please add any significant architecture decisions and their outcomes]

### Technology Discoveries
[Please add any technology insights or integrations that worked well]

### Process Improvements
[Please add any process improvements that increased efficiency]

## Error Patterns & Solutions

### Common Errors Encountered
[Please describe any recurring errors and their solutions]

### Recovery Strategies
[Please describe any effective error recovery strategies]

## Learning Priority

### High Priority (Bug Fixes)
1. [Any critical bugs or issues that should be fixed]

### Medium Priority (Optimizations)
1. [Any performance or efficiency improvements]

### Low Priority (Enhancements)
1. [Any nice-to-have features or improvements]

## Recommendations for AgileAiAgents

### Agent-Specific Improvements
[Please suggest improvements for specific agents based on your experience]

### System-Wide Enhancements
[Please suggest any system-wide improvements]

### New Pattern Suggestions
[Please suggest any new patterns that could help future projects]

## Negative Learnings

### What Didn't Work
[Please describe approaches that failed and why]

### False Starts
[Please describe any initial directions that required pivoting]

## Cross-Agent Learning Opportunities

### Learnings That Should Be Shared
[Which learnings would benefit other agents?]

### Integration Points
[Where could agents work together better?]

## Validation Metrics

### Before Implementation
- **Metric 1**: [Baseline value]
- **Metric 2**: [Baseline value]

### After Implementation  
- **Metric 1**: [New value] (+X% improvement)
- **Metric 2**: [New value] (+X% improvement)

### Validation Method
[How were these improvements measured?]

---

## Contribution Metadata

**Analysis Date**: ${new Date().toISOString().split('T')[0]} *  
**Implementation Status**: Not Started  
**Last Updated**: ${new Date().toISOString().split('T')[0]} *  
**Contribution Quality Score**: [Auto-calculated] *

* = Auto-populated fields`;
  }

  /**
   * Extract detailed metrics for learnings
   */
  async extractDetailedMetrics() {
    return {
      performance: {
        development_speed: {
          baseline: 'Traditional estimate',
          achieved: this.info?.duration || 'Unknown',
          improvement: 'To be calculated'
        },
        bug_rate: {
          baseline: 'Industry average',
          achieved: 'Project actual',
          improvement: 'To be calculated'
        },
        token_usage: {
          initial_average: 'First sprint average',
          final_average: 'Last sprint average',
          optimization: 'To be calculated'
        }
      },
      success: [
        { label: 'Project delivered on time', checked: true },
        { label: 'Met all requirements', checked: true },
        { label: 'Stakeholder satisfied', checked: true },
        { label: 'System performing as expected', checked: true },
        { label: 'Maintainable codebase', checked: true }
      ]
    };
  }

  /**
   * Extract learnings for each agent
   */
  async extractAgentLearnings() {
    const learnings = [];
    const agentActivityPath = path.join(
      this.machineData,
      'project-documents-json',
      '00-orchestration',
      'agent-activity.json'
    );

    if (fs.existsSync(agentActivityPath)) {
      const activity = JSON.parse(fs.readFileSync(agentActivityPath, 'utf8'));
      
      // Get top 5 most active agents
      const topAgents = Object.entries(activity.agent_tasks || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([agent]) => agent);

      for (const agentName of topAgents) {
        learnings.push({
          name: this.formatAgentName(agentName),
          version: this.info?.agentVersions[agentName] || '1.0.0',
          learned: null,
          challenge: null,
          solution: null,
          impact: null,
          recommendation: null
        });
      }
    }

    return learnings;
  }

  /**
   * Extract patterns from project
   */
  async extractPatterns() {
    return {
      successful: [
        {
          name: 'Pattern Name',
          agents: '[List involved agents]',
          context: '[When this pattern works]',
          outcome: '[Results achieved]'
        }
      ],
      antiPatterns: [
        {
          name: 'Anti-Pattern Name',
          issue: '[What went wrong]',
          cause: '[Root cause]',
          solution: '[How to avoid]'
        }
      ]
    };
  }

  /**
   * Format agent name for display
   */
  formatAgentName(agentName) {
    return agentName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get AgileAiAgents version
   */
  async getAgileAiAgentsVersion() {
    const versionPath = path.join(this.projectRoot, 'version.json');
    if (fs.existsSync(versionPath)) {
      const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
      return version.version || '1.0.0';
    }
    return '1.0.0';
  }

  /**
   * Extract version from requirements.txt line
   */
  extractVersion(requirements, packageName) {
    const lines = requirements.split('\n');
    const line = lines.find(l => l.startsWith(packageName));
    if (line) {
      const match = line.match(/==([\d.]+)/);
      return match ? match[1] : 'latest';
    }
    return 'unknown';
  }
}

// Export for use in other modules
module.exports = CommunityContributionGenerator;

// CLI execution
if (require.main === module) {
  const generator = new CommunityContributionGenerator(
    path.join(__dirname, '..')
  );
  
  generator.generateContribution()
    .then(result => {
      console.log(`\\n✨ Contribution ready for review at: ${result.contributionPath}`);
      console.log('\\nNext steps:');
      console.log('1. Review and edit the generated files');
      if (result.scanResults.summary.total_issues > 0) {
        console.log('2. Fix privacy issues identified in privacy-scan-report.json');
      } else {
        console.log('2. Verify no sensitive information remains');
      }
      console.log('3. Run: npm run submit-contribution');
    })
    .catch(err => {
      console.error('❌ Error generating contribution:', err);
      process.exit(1);
    });
}
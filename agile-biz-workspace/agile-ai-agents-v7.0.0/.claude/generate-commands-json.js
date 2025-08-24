#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Command categories and descriptions
const commandData = {
  // Workflow
  'new-project-workflow': { category: 'workflow', desc: 'Start structured new project discovery and implementation', priority: 1 },
  'existing-project-workflow': { category: 'workflow', desc: 'Analyze existing codebase and plan enhancements', priority: 2 },
  'select-phases': { category: 'workflow', desc: 'Select operational or enhancement phases after core workflow', priority: 3 },
  'workflow-recovery': { category: 'workflow', desc: 'Recover from workflow errors or interruptions', priority: 4 },
  
  // Help
  'quickstart': { category: 'help', desc: 'Interactive menu for all AgileAiAgents options', priority: 5 },
  'aaa-help': { category: 'help', desc: 'Show all available AgileAiAgents commands', priority: 6 },
  
  // State Management
  'aaa-status': { category: 'state', desc: 'Get comprehensive project status and context', priority: 7 },
  'continue': { category: 'state', desc: 'Resume from last saved state', priority: 8 },
  'checkpoint': { category: 'state', desc: 'Create manual checkpoint of current progress', priority: 9 },
  'save-decision': { category: 'state', desc: 'Document important project decision', priority: 10 },
  'update-state': { category: 'state', desc: 'Manually update project state', priority: 11 },
  'show-last-session': { category: 'state', desc: 'Show last session details', priority: 12 },
  'show-decisions': { category: 'state', desc: 'Display all project decisions', priority: 13 },
  
  // Sprint Management
  'start-sprint': { category: 'sprint', desc: 'Begin a new agile sprint', priority: 14 },
  'sprint-status': { category: 'sprint', desc: 'Show current sprint progress', priority: 15 },
  'sprint-progress': { category: 'sprint', desc: 'View current sprint progress', priority: 16 },
  'sprint-review': { category: 'sprint', desc: 'Conduct sprint review with stakeholder', priority: 17 },
  'sprint-retrospective': { category: 'sprint', desc: 'Run sprint retrospective with AI agents', priority: 18 },
  'sprint-planning': { category: 'sprint', desc: 'Sprint planning session', priority: 19 },
  'milestone': { category: 'sprint', desc: 'Record major project achievement', priority: 20 },
  'update-burndown': { category: 'sprint', desc: 'Update sprint burndown metrics', priority: 21 },
  
  // Development
  'start-development': { category: 'development', desc: 'Begin development for a sprint', priority: 22 },
  'implement': { category: 'development', desc: 'Get help implementing specific task', priority: 23 },
  'generate-code': { category: 'development', desc: 'Generate code for specific need', priority: 24 },
  'review-code': { category: 'development', desc: 'Get code review from AI agents', priority: 25 },
  'debug': { category: 'development', desc: 'Get debugging assistance', priority: 26 },
  'test': { category: 'development', desc: 'Generate and run tests', priority: 27 },
  'refactor': { category: 'development', desc: 'Get refactoring suggestions', priority: 28 },
  'update-feature': { category: 'development', desc: 'Get help updating existing feature', priority: 29 },
  'migrate': { category: 'development', desc: 'Database/code migration assistance', priority: 30 },
  
  // Research & Analysis
  'research-only': { category: 'research', desc: 'Market research without implementation', priority: 31 },
  'analyze-market': { category: 'research', desc: 'Focused market analysis', priority: 32 },
  'analyze-competition': { category: 'research', desc: 'Competitive landscape analysis', priority: 33 },
  'analyze-code': { category: 'research', desc: 'Deep code analysis for existing projects', priority: 34 },
  
  // Multi-LLM Support (v6.1.0)
  'configure-models': { category: 'research', desc: 'Configure multi-LLM support for cost savings', priority: 35 },
  'model-status': { category: 'research', desc: 'View current LLM configuration and usage', priority: 36 },
  'research-boost': { category: 'research', desc: 'Enable 3-5x faster parallel research', priority: 37 },
  
  // Documentation
  'generate-prd': { category: 'documentation', desc: 'Create Product Requirements Document', priority: 38 },
  'generate-pitch-deck': { category: 'documentation', desc: 'Create investor presentation', priority: 39 },
  'generate-documentation': { category: 'documentation', desc: 'Generate technical documentation', priority: 40 },
  'list-documents': { category: 'documentation', desc: 'Show all project documents', priority: 41 },
  
  // Document Router (v6.2.0)
  'import-documents': { category: 'documentation', desc: 'Import existing documents after upgrade', priority: 42 },
  'validate-documents': { category: 'documentation', desc: 'Check document health and freshness', priority: 43 },
  'consolidate-folders': { category: 'documentation', desc: 'Review folder consolidation suggestions', priority: 44 },
  'document-map': { category: 'documentation', desc: 'View document organization and routing stats', priority: 45 },
  
  // Community
  'capture-learnings': { category: 'community', desc: 'Capture project learnings for community', priority: 46 },
  'contribution-status': { category: 'community', desc: 'View contribution readiness', priority: 47 },
  'show-contribution-status': { category: 'community', desc: 'Show contribution status', priority: 48 },
  'skip-contribution': { category: 'community', desc: 'Skip current contribution prompt', priority: 49 },
  'contribute-now': { category: 'community', desc: 'Start contribution immediately', priority: 50 },
  'show-learnings': { category: 'community', desc: 'Display project learnings', priority: 51 },
  'learn-from-contributions-workflow': { category: 'community', desc: 'Run 7-phase learning analysis', priority: 52 },
  'review-learnings': { category: 'community', desc: 'Review captured learnings', priority: 53 },
  
  // Advanced Development
  'task-complete': { category: 'advanced', desc: 'Mark task as done and update progress', priority: 54 },
  'blocker': { category: 'advanced', desc: 'Report and get help with blocker', priority: 55 },
  'context': { category: 'advanced', desc: 'Get context about specific area', priority: 56 },
  'explain': { category: 'advanced', desc: 'Get explanation of code or concept', priority: 57 },
  'best-practice': { category: 'advanced', desc: 'Get best practice recommendations', priority: 58 },
  
  // Bug & Maintenance
  'analyze-bug': { category: 'maintenance', desc: 'Analyze bug and suggest fixes', priority: 59 },
  'fix-bug': { category: 'maintenance', desc: 'Generate bug fix code', priority: 60 },
  'regression-test': { category: 'maintenance', desc: 'Create regression tests', priority: 61 },
  'impact-analysis': { category: 'maintenance', desc: 'Analyze impact of proposed change', priority: 62 },
  
  // Performance & Optimization
  'profile': { category: 'optimization', desc: 'Profile performance', priority: 63 },
  'optimize': { category: 'optimization', desc: 'Get optimization suggestions', priority: 64 },
  'refactor-legacy': { category: 'optimization', desc: 'Modernize legacy code', priority: 65 },
  'health-check': { category: 'optimization', desc: 'System health analysis', priority: 66 },
  'security-scan': { category: 'optimization', desc: 'Security vulnerability check', priority: 67 },
  'performance-report': { category: 'optimization', desc: 'Performance metrics analysis', priority: 68 },
  
  // Conversion
  'convert-md-to-json-aaa-documents': { category: 'conversion', desc: 'Convert aaa-documents to JSON', priority: 69 },
  'convert-md-to-json-ai-agents': { category: 'conversion', desc: 'Convert agents to JSON', priority: 70 },
  'convert-md-to-json-project-documents': { category: 'conversion', desc: 'Convert project docs to JSON', priority: 71 },
  'convert-all-md-to-json': { category: 'conversion', desc: 'Run all conversions', priority: 72 },
  
  // System Management
  'setup-dev-environment': { category: 'system', desc: 'Setup development environment', priority: 73 },
  'project-state-reset': { category: 'system', desc: 'Clean project state', priority: 74 },
  'project-documents-reset': { category: 'system', desc: 'Empty document folders', priority: 75 },
  'community-learnings-reset': { category: 'system', desc: 'Clear contributions', priority: 76 },
  'clear-logs': { category: 'system', desc: 'Remove all logs', priority: 77 },
  'backup-before-reset': { category: 'system', desc: 'Manual backup before reset', priority: 78 },
  'restore-from-backup': { category: 'system', desc: 'Restore from backup', priority: 79 },
  'reset': { category: 'system', desc: 'Reset project with confirmation', priority: 80 },
  
  // Project Context
  'init': { category: 'context', desc: 'Initialize Claude context in project', priority: 81 },
  'add-agile-context': { category: 'context', desc: 'Add AgileAI context to existing project', priority: 82 },
  'verify-context': { category: 'context', desc: 'Verify project context', priority: 83 },
  'select-velocity-profile': { category: 'context', desc: 'Select velocity profile for project', priority: 84 },
  
  // Deployment
  'deployment-success': { category: 'deployment', desc: 'Mark deployment success', priority: 85 },
  'project-complete': { category: 'deployment', desc: 'Complete project lifecycle', priority: 86 }
};

// Categories definition
const categories = {
  workflow: { description: 'Main workflow commands', color: 'blue' },
  help: { description: 'Help and documentation commands', color: 'yellow' },
  state: { description: 'State management commands', color: 'purple' },
  sprint: { description: 'Sprint management commands', color: 'orange' },
  development: { description: 'Development assistance commands', color: 'green' },
  research: { description: 'Research and analysis commands', color: 'cyan' },
  documentation: { description: 'Documentation generation commands', color: 'magenta' },
  community: { description: 'Community contribution commands', color: 'white' },
  advanced: { description: 'Advanced development commands', color: 'brightBlue' },
  maintenance: { description: 'Bug fixes and maintenance commands', color: 'red' },
  optimization: { description: 'Performance and optimization commands', color: 'brightGreen' },
  conversion: { description: 'MD to JSON conversion commands', color: 'brightYellow' },
  system: { description: 'System management commands', color: 'gray' },
  context: { description: 'Project context commands', color: 'brightCyan' },
  deployment: { description: 'Deployment and completion commands', color: 'brightMagenta' }
};

// Generate commands array
const commands = Object.entries(commandData).map(([name, data]) => ({
  name,
  description: data.desc,
  file: `${name}.md`,
  category: data.category,
  priority: data.priority
}));

// Sort by priority
commands.sort((a, b) => a.priority - b.priority);

// Create the final JSON structure
const commandsJson = {
  version: '3.0.0',
  description: 'AgileAiAgents custom slash commands for Claude Code - Complete Edition',
  totalCommands: commands.length,
  commands,
  categories
};

// Write to file
const outputPath = path.join(__dirname, 'commands.json');
fs.writeFileSync(outputPath, JSON.stringify(commandsJson, null, 2));

console.log(`✅ Generated commands.json with ${commands.length} commands`);
console.log(`📁 Saved to: ${outputPath}`);
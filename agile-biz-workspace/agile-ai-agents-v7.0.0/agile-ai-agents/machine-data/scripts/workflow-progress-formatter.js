/**
 * Workflow Progress Formatter
 * 
 * Formats workflow progress for display in Claude Code
 */

const { getCurrentWorkflowState, WORKFLOW_PHASES } = require('./workflow-state-handler');

/**
 * Generate progress bar
 */
function generateProgressBar(percentage, width = 20) {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Format time elapsed
 */
function formatTimeElapsed(startTime) {
    const elapsed = Date.now() - new Date(startTime).getTime();
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

/**
 * Format workflow progress for Claude Code display
 */
function formatWorkflowProgress() {
    const state = getCurrentWorkflowState();
    if (!state) {
        return 'No active workflow. Use `/start-new-project-workflow` or `/start-existing-project-workflow` to begin.';
    }
    
    const workflowDef = WORKFLOW_PHASES[state.workflow_type];
    if (!workflowDef) {
        return `Error: Invalid workflow type '${state.workflow_type}'. Valid types are: ${Object.keys(WORKFLOW_PHASES).join(', ')}`;
    }
    const phaseNumber = state.phase_index + 1;
    const totalPhases = workflowDef.phases.length;
    const workflowTitle = state.workflow_type === 'new-project' ? 'New Project Workflow' : 'Existing Project Workflow';
    
    let output = [];
    
    // Header
    output.push(`## 🚀 ${workflowTitle} Progress\n`);
    
    // Current Phase
    output.push(`**Current Phase**: ${state.phase_details.name} (${phaseNumber} of ${totalPhases})`);
    output.push(`**Progress**: ${generateProgressBar(state.phase_details.progress_percentage)} ${state.phase_details.progress_percentage}%`);
    output.push(`**Time Elapsed**: ${formatTimeElapsed(state.phase_details.started_at)} | **Est. Remaining**: ${state.phase_details.estimated_time_remaining}\n`);
    
    // Active Agents
    if (state.phase_details.active_agents && state.phase_details.active_agents.length > 0) {
        output.push(`**Active Agents** (${state.phase_details.active_agents.length}):`);
        state.phase_details.active_agents.forEach(agent => {
            output.push(`- ${agent.icon || '🤖'} ${agent.name}: ${agent.status}...`);
        });
        output.push('');
    }
    
    // Documents Progress
    if (state.phase_details.documents_total > 0) {
        output.push(`**Documents Created**: ${state.phase_details.documents_created} of ${state.phase_details.documents_total}`);
        
        if (state.phase_details.documents && state.phase_details.documents.length > 0) {
            state.phase_details.documents.forEach(doc => {
                const status = doc.completed ? '✅' : doc.progress > 0 ? '⏳' : '○';
                const progress = doc.progress > 0 && !doc.completed ? ` (${doc.progress}%)` : '';
                output.push(`- ${status} ${doc.name}${progress}`);
            });
        }
        output.push('');
    }
    
    // Approval Gate Warning
    if (state.awaiting_approval) {
        output.push('⚠️ **Awaiting Approval**');
        output.push(`This workflow is paused at approval gate: ${state.awaiting_approval}`);
        output.push('Use the approval interface to review and continue.\n');
    }
    
    // Commands hint
    output.push('💡 **Commands**:');
    output.push(`- \`/start-${state.workflow_type}-workflow --save-state\` to save progress`);
    output.push(`- \`/start-${state.workflow_type}-workflow --status\` for detailed status`);
    
    return output.join('\\n');
}

/**
 * Format detailed workflow status
 */
function formatDetailedStatus() {
    const state = getCurrentWorkflowState();
    if (!state) {
        return 'No active workflow found.';
    }
    
    const workflowDef = WORKFLOW_PHASES[state.workflow_type];
    if (!workflowDef) {
        return `Error: Invalid workflow type '${state.workflow_type}'`;
    }
    let output = [];
    
    // Header
    output.push(`## 📊 Workflow Status Report\n`);
    output.push(`**Workflow ID**: ${state.workflow_id}`);
    output.push(`**Type**: ${state.workflow_type}`);
    output.push(`**Started**: ${new Date(state.started_at).toLocaleString()}`);
    output.push(`**Parallel Mode**: ${state.parallel_mode ? 'Enabled' : 'Disabled'}\n`);
    
    // Phase Timeline
    output.push('### 📅 Phase Timeline\n');
    
    workflowDef.phases.forEach((phase, index) => {
        const isCompleted = state.phases_completed.includes(phase);
        const isCurrent = phase === state.current_phase;
        const isPending = index > state.phase_index;
        
        let status = '○';
        let statusText = 'Pending';
        
        if (isCompleted) {
            status = '✅';
            statusText = 'Completed';
            if (state.checkpoints.phase_checkpoints[phase]) {
                statusText += ` at ${new Date(state.checkpoints.phase_checkpoints[phase]).toLocaleTimeString()}`;
            }
        } else if (isCurrent) {
            status = '🔄';
            statusText = `In Progress (${state.phase_details.progress_percentage}%)`;
        }
        
        output.push(`${status} **${getPhaseDisplayName(state.workflow_type, phase)}**`);
        output.push(`   Status: ${statusText}`);
        output.push(`   Duration: ${workflowDef.phaseDurations[phase]}`);
        
        // Check for approval gates after this phase
        const gate = findGateAfterPhase(state.workflow_type, phase);
        if (gate) {
            const gateStatus = state.approval_gates[gate];
            if (gateStatus.approved) {
                output.push(`   🚦 Approval Gate: ✅ Approved at ${new Date(gateStatus.approved_at).toLocaleTimeString()}`);
            } else if (state.awaiting_approval === gate) {
                output.push(`   🚦 Approval Gate: ⏸️ **Awaiting Approval**`);
            } else {
                output.push(`   🚦 Approval Gate: Pending`);
            }
        }
        
        output.push('');
    });
    
    // Checkpoints
    output.push('### 💾 Checkpoints\n');
    output.push(`**Last Save**: ${new Date(state.checkpoints.last_save).toLocaleString()}`);
    if (state.checkpoints.last_partial_save) {
        output.push(`**Last Partial Save**: ${new Date(state.checkpoints.last_partial_save).toLocaleString()}`);
    }
    
    // Overall Progress
    const completedCount = state.phases_completed.length;
    const totalCount = workflowDef.phases.length;
    const overallProgress = Math.round((completedCount / totalCount) * 100);
    
    output.push('\n### 📈 Overall Progress\n');
    output.push(`${generateProgressBar(overallProgress, 30)} ${overallProgress}%`);
    output.push(`Phases Completed: ${completedCount} of ${totalCount}`);
    
    return output.join('\\n');
}

/**
 * Format approval gate interface
 */
function formatApprovalGate(gateName) {
    const state = getCurrentWorkflowState();
    if (!state || state.awaiting_approval !== gateName) {
        return 'No approval gate pending.';
    }
    
    const workflowDef = WORKFLOW_PHASES[state.workflow_type];
    const gateDef = workflowDef.approvalGates[gateName];
    const completedPhase = gateDef.after;
    const nextPhase = gateDef.before;
    
    let output = [];
    
    // Header
    output.push(`## 🚦 Approval Gate: ${formatGateName(gateName)}\n`);
    
    // Phase Summary
    output.push('### 📊 Phase Summary');
    output.push(`**Completed**: ${getPhaseDisplayName(state.workflow_type, completedPhase)}`);
    output.push(`**Duration**: ${formatTimeElapsed(state.phase_details.started_at)}`);
    
    if (state.phase_details.documents_created > 0) {
        output.push(`**Documents Created**: ${state.phase_details.documents_created}`);
    }
    
    // Key Findings (would be populated by phase completion)
    output.push('\n### 🔍 Key Findings');
    output.push(generateKeyFindings(state, completedPhase));
    
    // Documents for Review
    output.push('\n### 📁 Documents Available for Review');
    output.push(generateDocumentLinks(state, completedPhase));
    
    // Next Phase Preview
    output.push('\n### 🎯 Next Phase Preview');
    output.push(`**Phase**: ${getPhaseDisplayName(state.workflow_type, nextPhase)}`);
    output.push(`**Estimated Duration**: ${workflowDef.phaseDurations[nextPhase]}`);
    output.push(`**Agents Involved**: ${getPhaseAgents(state.workflow_type, nextPhase).join(', ')}`);
    output.push(`**Expected Outputs**: ${getPhaseOutputs(state.workflow_type, nextPhase)}`);
    
    // Modification Options
    output.push('\n### ⚙️ Modification Options');
    output.push(generateModificationOptions(state, nextPhase));
    
    // Actions
    output.push('\n### 🔧 Actions');
    output.push('[✅ Approve & Continue] [🔄 Request Changes] [⏸️ Pause Workflow] [❌ Cancel Workflow]');
    
    return output.join('\\n');
}

/**
 * Format dry run preview
 */
function formatDryRun(workflowType) {
    const workflowDef = WORKFLOW_PHASES[workflowType];
    const workflowTitle = workflowType === 'new-project' ? 'New Project' : 'Existing Project';
    
    let output = [];
    
    // Header
    output.push(`## 🔍 Workflow Dry Run: ${workflowTitle}\n`);
    output.push(`**Workflow**: /start-${workflowType}-workflow`);
    output.push('**Mode**: Sequential (with approval gates)');
    output.push(`**Estimated Total Duration**: ${estimateTotalDuration(workflowType)}\n`);
    
    // Phases
    output.push('### Phases That Will Run:');
    
    workflowDef.phases.forEach((phase, index) => {
        const phaseName = getPhaseDisplayName(workflowType, phase);
        const duration = workflowDef.phaseDurations[phase];
        
        output.push(`\n${index + 1}. ✅ **${phaseName}** (${duration})`);
        
        // Add phase details
        const details = getPhaseDetails(workflowType, phase);
        details.forEach(detail => {
            output.push(`   - ${detail}`);
        });
        
        // Check for approval gate after this phase
        const gate = findGateAfterPhase(workflowType, phase);
        if (gate) {
            output.push(`\n   🚦 **Approval Gate ${getGateNumber(workflowType, gate)}**`);
        }
    });
    
    output.push('\n**Note**: This is a preview only. No actions will be taken.');
    
    return output.join('\\n');
}

// Helper functions

function getPhaseDisplayName(workflowType, phase) {
    const displayNames = {
        'new-project': {
            discovery: 'Stakeholder Discovery Interview',
            research: 'Market Research & Analysis',
            analysis: 'Analysis & Synthesis',
            requirements: 'Requirements & Specifications',
            planning: 'Project Planning & Architecture',
            backlog: 'Product Backlog Creation',
            scaffold: 'Project Scaffolding',
            sprint: 'Sprint Implementation'
        },
        'existing-project': {
            analyze: 'Code Analysis & Assessment',
            discovery: 'Stakeholder Interview',
            assessment: 'Gap Analysis & Opportunities',
            planning: 'Enhancement Planning',
            backlog: 'Enhancement Backlog',
            implementation: 'Implementation'
        }
    };
    
    return displayNames[workflowType]?.[phase] || phase;
}

function findGateAfterPhase(workflowType, phase) {
    const workflowDef = WORKFLOW_PHASES[workflowType];
    
    for (const [gateName, gateDef] of Object.entries(workflowDef.approvalGates)) {
        if (gateDef.after === phase) {
            return gateName;
        }
    }
    
    return null;
}

function formatGateName(gateName) {
    const names = {
        'post-research': 'Post-Research Review',
        'post-requirements': 'Post-Requirements Review',
        'pre-implementation': 'Pre-Implementation Review',
        'post-analysis': 'Post-Analysis Review'
    };
    
    return names[gateName] || gateName;
}

function generateKeyFindings(state, phase) {
    // This would be populated with actual findings from the phase
    const findings = {
        research: [
            '1. **Market Size**: $X.XB TAM with XX% CAGR',
            '2. **Competition**: X major players, opportunity for differentiation',
            '3. **Technical Feasibility**: All core features achievable',
            '4. **Risk Assessment**: Medium risk, mainly around user adoption'
        ],
        analyze: [
            '1. **Code Quality**: XX% test coverage, well-structured',
            '2. **Performance**: Average response time XXms',
            '3. **Security**: X critical issues found',
            '4. **Technical Debt**: XX hours estimated'
        ]
    };
    
    return findings[phase]?.join('\\n') || 'Findings will be displayed here after phase completion.';
}

function generateDocumentLinks(state, phase) {
    // This would generate actual document links
    const docs = {
        research: [
            '- [View Full Research Report](./project-documents/research/executive-summary.md)',
            '- [Financial Analysis](./project-documents/research/financial-analysis.md)',
            '- [Competitive Analysis](./project-documents/research/competitive-analysis.md)'
        ],
        analyze: [
            '- [Code Analysis Report](./project-documents/analysis-reports/code-analysis.md)',
            '- [Security Assessment](./project-documents/analysis-reports/security-assessment.md)',
            '- [Performance Report](./project-documents/analysis-reports/performance-report.md)'
        ]
    };
    
    return docs[phase]?.join('\\n') || 'Documents will be listed here after phase completion.';
}

function getPhaseAgents(workflowType, phase) {
    const agents = {
        'new-project': {
            discovery: ['Project Analyzer Agent'],
            research: ['Research Agent', 'Market Analyst', 'Finance Agent'],
            analysis: ['Analysis Agent', 'Business Strategy Agent'],
            requirements: ['PRD Agent', 'Technical Architect'],
            planning: ['Project Manager Agent', 'Architecture Agent'],
            backlog: ['Project Manager Agent', 'Scrum Master Agent'],
            scaffold: ['Project Structure Agent', 'Coder Agent'],
            sprint: ['Scrum Master Agent', 'Coder Agent', 'Testing Agent']
        },
        'existing-project': {
            analyze: ['Code Analyzer Agent', 'Security Agent', 'Performance Agent'],
            discovery: ['Project Analyzer Agent'],
            assessment: ['Analysis Agent', 'Technical Architect'],
            planning: ['Project Manager Agent', 'PRD Agent'],
            backlog: ['Project Manager Agent', 'Scrum Master Agent'],
            implementation: ['Coder Agent', 'Testing Agent', 'DevOps Agent']
        }
    };
    
    return agents[workflowType]?.[phase] || ['TBD'];
}

function getPhaseOutputs(workflowType, phase) {
    const outputs = {
        'new-project': {
            discovery: 'Project vision, constraints, success criteria',
            research: 'Market analysis, financial projections, competitive landscape',
            analysis: 'Strategic recommendations, risk mitigation',
            requirements: 'PRD document, technical specifications',
            planning: 'Project roadmap, system architecture',
            backlog: 'Epics, user stories, estimation',
            scaffold: 'Project structure, development environment',
            sprint: 'Working code, tests, documentation'
        },
        'existing-project': {
            analyze: 'Code quality report, security assessment, performance metrics',
            discovery: 'Enhancement priorities, constraints',
            assessment: 'Gap analysis, opportunity matrix',
            planning: 'Enhancement roadmap, technical approach',
            backlog: 'Prioritized enhancements, estimates',
            implementation: 'Enhanced code, tests, deployment'
        }
    };
    
    return outputs[workflowType]?.[phase] || 'Phase outputs';
}

function generateModificationOptions(state, nextPhase) {
    // This would generate relevant modification options
    const options = {
        analysis: [
            '1. **Adjust Analysis Depth**:',
            '   - [ ] Extended market validation',
            '   - [ ] Additional competitor analysis',
            '   - [ ] International market research'
        ],
        requirements: [
            '1. **Requirement Scope**:',
            '   - [ ] Include mobile app requirements',
            '   - [ ] Add accessibility requirements',
            '   - [ ] Include compliance requirements'
        ]
    };
    
    const phaseOptions = options[nextPhase] || ['No modification options available.'];
    
    return phaseOptions.join('\\n') + '\\n\\n2. **Custom Requirements**:\\n   ```\\n   Enter any additional requirements for the ' + 
           getPhaseDisplayName(state.workflow_type, nextPhase) + ':\\n   _____________________________________________\\n   ```';
}

function getPhaseDetails(workflowType, phase) {
    const details = {
        'new-project': {
            discovery: ['Stakeholder interview (4 sections)', 'Project vision alignment'],
            research: ['Market analysis', 'Competitive research', 'Financial projections'],
            analysis: ['Synthesize findings', 'Strategic recommendations'],
            requirements: ['PRD generation', 'Technical specifications'],
            planning: ['Project roadmap', 'Architecture design'],
            backlog: ['Epic creation', 'Story writing', 'Estimation'],
            scaffold: ['Project structure', 'Initial setup'],
            sprint: ['First sprint planning', 'Implementation start']
        },
        'existing-project': {
            analyze: ['Code quality assessment', 'Security scan', 'Performance analysis'],
            discovery: ['Stakeholder priorities', 'Enhancement goals'],
            assessment: ['Gap identification', 'Opportunity mapping'],
            planning: ['Enhancement roadmap', 'Technical approach'],
            backlog: ['Enhancement stories', 'Priority ranking'],
            implementation: ['Code enhancements', 'Testing', 'Deployment']
        }
    };
    
    return details[workflowType]?.[phase] || ['Phase activities'];
}

function estimateTotalDuration(workflowType) {
    const estimates = {
        'new-project': '24-32 hours',
        'existing-project': '15-20 hours'
    };
    
    return estimates[workflowType] || 'Variable';
}

function getGateNumber(workflowType, gateName) {
    const workflowDef = WORKFLOW_PHASES[workflowType];
    const gates = Object.keys(workflowDef.approvalGates);
    return gates.indexOf(gateName) + 1;
}

module.exports = {
    formatWorkflowProgress,
    formatDetailedStatus,
    formatApprovalGate,
    formatDryRun
};
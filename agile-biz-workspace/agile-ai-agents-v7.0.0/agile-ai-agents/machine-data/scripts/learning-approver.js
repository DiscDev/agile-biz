/**
 * Learning Approver Module
 * 
 * CLI-based stakeholder approval interface for implementation plans
 */

const readline = require('readline');

// Color codes
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

/**
 * Create readline interface
 */
function createInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

/**
 * Prompt for user input
 */
function prompt(rl, question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

/**
 * Display plan summary for approval
 */
function displayPlanSummary(plan, index, total) {
    console.clear();
    console.log(`${BOLD}✅ Phase 5: Stakeholder Approval${RESET}`);
    console.log('━'.repeat(60));
    console.log(`Plan ${index + 1} of ${total}\n`);
    
    console.log(`${BOLD}${BLUE}${plan.title}${RESET}`);
    console.log(`${'─'.repeat(plan.title.length)}\n`);
    
    // Overview section
    console.log(`${CYAN}📊 Overview:${RESET}`);
    console.log(`   Type: ${plan.type}`);
    console.log(`   Confidence: ${getConfidenceColor(plan.confidence)}${plan.confidence}%${RESET}`);
    console.log(`   Risk Level: ${getRiskColor(plan.risk)}${plan.risk}${RESET}`);
    console.log(`   Estimated Effort: ${plan.estimated_effort.estimated_hours} hours`);
    console.log(`   Pattern Sources: ${plan.patterns.length} patterns from ${new Set(plan.patterns.map(p => p.source)).size} contributions\n`);
    
    // Impact section
    console.log(`${CYAN}📈 Expected Impact:${RESET}`);
    console.log(`   Efficiency: ${GREEN}+${plan.impact.efficiency}%${RESET}`);
    console.log(`   Reliability: ${GREEN}+${plan.impact.reliability}%${RESET}`);
    console.log(`   Maintainability: ${GREEN}+${plan.impact.maintainability}%${RESET}`);
    console.log(`   ${BOLD}Overall: ${GREEN}+${plan.impact.overall}%${RESET}\n`);
    
    // Affected agents
    console.log(`${CYAN}👥 Affected Agents:${RESET}`);
    const agents = plan.affected_agents.slice(0, 5);
    console.log(`   ${agents.join(', ')}${plan.affected_agents.length > 5 ? ` (+${plan.affected_agents.length - 5} more)` : ''}\n`);
    
    // Implementation approach
    console.log(`${CYAN}🛠️  Implementation Approach:${RESET}`);
    console.log(`   • Incremental rollout possible`);
    console.log(`   • Rollback available for each change`);
    console.log(`   • No breaking changes expected`);
    console.log(`   • Recovery time: ${plan.rollback_strategy.recovery_time}\n`);
    
    // Key changes preview
    console.log(`${CYAN}📝 Key Changes (${plan.implementation_steps.length} total):${RESET}`);
    plan.implementation_steps.slice(0, 3).forEach(step => {
        console.log(`   ${step.order}. ${step.description}`);
        console.log(`      ${YELLOW}→${RESET} ${step.file}`);
    });
    if (plan.implementation_steps.length > 3) {
        console.log(`   ... and ${plan.implementation_steps.length - 3} more steps\n`);
    } else {
        console.log();
    }
    
    console.log(`${CYAN}${BOLD}Stakeholder Decision Required${RESET}`);
    console.log('─'.repeat(30));
}

/**
 * Get color for confidence score
 */
function getConfidenceColor(confidence) {
    if (confidence >= 85) return GREEN;
    if (confidence >= 70) return YELLOW;
    return RED;
}

/**
 * Get color for risk level
 */
function getRiskColor(risk) {
    if (risk === 'low') return GREEN;
    if (risk === 'medium') return YELLOW;
    return RED;
}

/**
 * Display detailed plan information
 */
async function showPlanDetails(plan, rl) {
    console.clear();
    console.log(`${BOLD}${BLUE}Detailed Plan: ${plan.title}${RESET}`);
    console.log('━'.repeat(60));
    
    // Patterns that led to this plan
    console.log(`\n${CYAN}📊 Source Patterns:${RESET}`);
    plan.patterns.forEach((pattern, idx) => {
        console.log(`   ${idx + 1}. ${pattern.name}`);
        console.log(`      Source: ${pattern.source}`);
        console.log(`      Confidence: ${pattern.confidence}%`);
        console.log(`      Occurrences: ${pattern.occurrences}`);
    });
    
    // Full implementation steps
    console.log(`\n${CYAN}📋 Complete Implementation Steps:${RESET}`);
    plan.implementation_steps.forEach(step => {
        console.log(`\n   ${BOLD}Step ${step.order}: ${step.description}${RESET}`);
        console.log(`   File: ${step.file}`);
        console.log(`   Action: ${step.action}`);
        if (step.sections) {
            console.log(`   Sections: ${step.sections.join(', ')}`);
        }
    });
    
    // Success metrics
    console.log(`\n${CYAN}📊 Success Metrics:${RESET}`);
    Object.entries(plan.success_metrics).forEach(([metric, details]) => {
        console.log(`   • ${metric}: ${details.target} (measured by ${details.measurement})`);
    });
    
    // Dependencies
    if (plan.dependencies.length > 0) {
        console.log(`\n${CYAN}⚠️  Dependencies:${RESET}`);
        plan.dependencies.forEach(dep => {
            console.log(`   • ${dep.type}: ${dep.name}`);
        });
    }
    
    // Rollback strategy
    console.log(`\n${CYAN}🔄 Rollback Strategy:${RESET}`);
    console.log(`   Recovery Time: ${plan.rollback_strategy.recovery_time}`);
    console.log(`   Trigger Conditions:`);
    plan.rollback_strategy.trigger_conditions.forEach(condition => {
        console.log(`   • ${condition}`);
    });
    
    await prompt(rl, '\nPress Enter to return to decision menu...');
}

/**
 * Modify plan interface
 */
async function modifyPlan(plan, rl) {
    console.clear();
    console.log(`${BOLD}${YELLOW}Modify Plan: ${plan.title}${RESET}`);
    console.log('━'.repeat(60));
    
    console.log('\nWhat would you like to modify?');
    console.log('1. Add notes/conditions');
    console.log('2. Remove specific steps');
    console.log('3. Defer certain agents');
    console.log('4. Change priority/timing');
    console.log('5. Cancel modifications');
    
    const choice = await prompt(rl, '\nYour choice (1-5): ');
    
    switch (choice) {
        case '1':
            const notes = await prompt(rl, '\nAdd notes or conditions: ');
            plan.approval_notes = plan.approval_notes || [];
            plan.approval_notes.push(notes);
            console.log(`\n${GREEN}✓ Notes added${RESET}`);
            break;
            
        case '2':
            console.log('\nImplementation steps:');
            plan.implementation_steps.forEach((step, idx) => {
                console.log(`${idx + 1}. ${step.description}`);
            });
            const stepNum = await prompt(rl, '\nStep number to remove (or 0 to cancel): ');
            if (stepNum > 0 && stepNum <= plan.implementation_steps.length) {
                const removed = plan.implementation_steps.splice(stepNum - 1, 1);
                console.log(`\n${YELLOW}✓ Removed: ${removed[0].description}${RESET}`);
                plan.modified = true;
            }
            break;
            
        case '3':
            console.log('\nAffected agents:');
            plan.affected_agents.forEach((agent, idx) => {
                console.log(`${idx + 1}. ${agent}`);
            });
            const agentNum = await prompt(rl, '\nAgent number to defer (or 0 to cancel): ');
            if (agentNum > 0 && agentNum <= plan.affected_agents.length) {
                plan.deferred_agents = plan.deferred_agents || [];
                const deferred = plan.affected_agents.splice(agentNum - 1, 1)[0];
                plan.deferred_agents.push(deferred);
                console.log(`\n${YELLOW}✓ Deferred: ${deferred}${RESET}`);
                plan.modified = true;
            }
            break;
            
        case '4':
            const timing = await prompt(rl, '\nNew timing (immediate/next-sprint/next-month): ');
            plan.implementation_timing = timing;
            console.log(`\n${GREEN}✓ Timing updated to: ${timing}${RESET}`);
            plan.modified = true;
            break;
    }
    
    await prompt(rl, '\nPress Enter to continue...');
}

/**
 * Compare with archived patterns
 */
async function compareWithArchive(plan, archiveData, rl) {
    console.clear();
    console.log(`${BOLD}${CYAN}Archive Comparison: ${plan.title}${RESET}`);
    console.log('━'.repeat(60));
    
    // Find similar patterns in archive
    const similarPatterns = findSimilarArchivedPatterns(plan, archiveData);
    
    if (similarPatterns.length === 0) {
        console.log('\n✅ No similar patterns found in archive.');
        console.log('This appears to be a novel implementation.\n');
    } else {
        console.log('\n📚 Similar Historical Patterns:\n');
        
        similarPatterns.forEach((archived, idx) => {
            console.log(`${idx + 1}. ${archived.title}`);
            console.log(`   Date: ${archived.date}`);
            console.log(`   Status: ${getStatusColor(archived.status)}${archived.status}${RESET}`);
            console.log(`   Result: ${archived.result}`);
            if (archived.metrics) {
                console.log(`   Actual Impact: ${archived.metrics.actual_impact}`);
            }
            console.log();
        });
        
        console.log(`${YELLOW}⚠️  Consider these historical outcomes in your decision.${RESET}`);
    }
    
    await prompt(rl, '\nPress Enter to return to decision menu...');
}

/**
 * Find similar patterns in archive
 */
function findSimilarArchivedPatterns(plan, archiveData) {
    // Simplified - in real implementation would use more sophisticated matching
    return archiveData.filter(archived => 
        archived.type === plan.type || 
        archived.patterns.some(p => plan.patterns.some(pp => pp.name.includes(p)))
    );
}

/**
 * Get status color
 */
function getStatusColor(status) {
    if (status === 'implemented') return GREEN;
    if (status === 'partial') return YELLOW;
    if (status === 'failed') return RED;
    return RESET;
}

/**
 * Main approval workflow
 */
async function approveImplementationPlans(plans, state) {
    const rl = createInterface();
    const approvalResults = {
        approved: [],
        rejected: [],
        deferred: [],
        modified: [],
        stakeholder_notes: {},
        approval_timestamp: new Date().toISOString()
    };
    
    try {
        console.log(`\n${BOLD}${GREEN}✅ Phase 5: Stakeholder Approval${RESET}`);
        console.log('━'.repeat(60));
        console.log('\nAll implementation plans require your approval before execution.');
        console.log(`You have ${plans.length} plans to review.\n`);
        
        await prompt(rl, 'Press Enter to begin review...');
        
        // Review each plan
        for (let i = 0; i < plans.length; i++) {
            const plan = plans[i];
            let decided = false;
            
            while (!decided) {
                displayPlanSummary(plan, i, plans.length);
                
                console.log('\n[A]pprove  [M]odify  [R]eject  [D]efer  [V]iew Details  [C]ompare Archive');
                const action = await prompt(rl, '\nYour decision: ');
                
                switch (action.toLowerCase()) {
                    case 'a':
                    case 'approve':
                        const approvalNotes = await prompt(rl, '\nApproval notes (optional): ');
                        plan.approval = {
                            status: 'approved',
                            notes: approvalNotes,
                            timestamp: new Date().toISOString(),
                            modified: plan.modified || false
                        };
                        approvalResults.approved.push(plan);
                        if (approvalNotes) {
                            approvalResults.stakeholder_notes[plan.id] = approvalNotes;
                        }
                        console.log(`\n${GREEN}✅ Plan approved${RESET}`);
                        decided = true;
                        break;
                        
                    case 'm':
                    case 'modify':
                        await modifyPlan(plan, rl);
                        approvalResults.modified.push(plan.id);
                        break;
                        
                    case 'r':
                    case 'reject':
                        const rejectReason = await prompt(rl, '\nRejection reason: ');
                        plan.approval = {
                            status: 'rejected',
                            reason: rejectReason,
                            timestamp: new Date().toISOString()
                        };
                        approvalResults.rejected.push(plan);
                        approvalResults.stakeholder_notes[plan.id] = `Rejected: ${rejectReason}`;
                        console.log(`\n${RED}❌ Plan rejected${RESET}`);
                        decided = true;
                        break;
                        
                    case 'd':
                    case 'defer':
                        const deferReason = await prompt(rl, '\nDefer until when/why: ');
                        plan.approval = {
                            status: 'deferred',
                            reason: deferReason,
                            timestamp: new Date().toISOString()
                        };
                        approvalResults.deferred.push(plan);
                        approvalResults.stakeholder_notes[plan.id] = `Deferred: ${deferReason}`;
                        console.log(`\n${YELLOW}⏸️  Plan deferred${RESET}`);
                        decided = true;
                        break;
                        
                    case 'v':
                    case 'view':
                        await showPlanDetails(plan, rl);
                        break;
                        
                    case 'c':
                    case 'compare':
                        // Load archive data (simplified for now)
                        const archiveData = [];
                        await compareWithArchive(plan, archiveData, rl);
                        break;
                        
                    default:
                        console.log(`\n${RED}Invalid option. Please try again.${RESET}`);
                        await prompt(rl, 'Press Enter to continue...');
                }
            }
            
            if (i < plans.length - 1) {
                await prompt(rl, '\nPress Enter to review next plan...');
            }
        }
        
        // Show approval summary
        console.clear();
        console.log(`${BOLD}${GREEN}Approval Summary${RESET}`);
        console.log('━'.repeat(60));
        console.log(`\n📊 Decision Breakdown:`);
        console.log(`   ${GREEN}Approved: ${approvalResults.approved.length}${RESET}`);
        console.log(`   ${RED}Rejected: ${approvalResults.rejected.length}${RESET}`);
        console.log(`   ${YELLOW}Deferred: ${approvalResults.deferred.length}${RESET}`);
        console.log(`   Modified: ${approvalResults.modified.length}`);
        
        if (approvalResults.approved.length > 0) {
            console.log(`\n${GREEN}✅ Approved Plans:${RESET}`);
            approvalResults.approved.forEach((plan, idx) => {
                console.log(`   ${idx + 1}. ${plan.title}`);
                if (plan.approval.notes) {
                    console.log(`      Note: ${plan.approval.notes}`);
                }
            });
        }
        
        if (approvalResults.rejected.length > 0) {
            console.log(`\n${RED}❌ Rejected Plans:${RESET}`);
            approvalResults.rejected.forEach((plan, idx) => {
                console.log(`   ${idx + 1}. ${plan.title}`);
                console.log(`      Reason: ${plan.approval.reason}`);
            });
        }
        
        if (approvalResults.deferred.length > 0) {
            console.log(`\n${YELLOW}⏸️  Deferred Plans:${RESET}`);
            approvalResults.deferred.forEach((plan, idx) => {
                console.log(`   ${idx + 1}. ${plan.title}`);
                console.log(`      Reason: ${plan.approval.reason}`);
            });
        }
        
        await prompt(rl, '\nPress Enter to continue...');
        
    } finally {
        rl.close();
    }
    
    return approvalResults;
}

module.exports = {
    approveImplementationPlans,
    displayPlanSummary,
    showPlanDetails
};
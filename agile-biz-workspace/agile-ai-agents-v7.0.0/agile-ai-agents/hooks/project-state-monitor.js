#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_STATE_PATH = path.join(__dirname, '..', 'project-state');
const DEBOUNCE_DELAY = 1000; // ms
const previousStates = new Map(); // Store previous states for comparison

// Files to monitor and their triggers
const MONITOR_CONFIG = {
  'workflow-state.json': detectWorkflowTriggers,
  'current-state.json': detectProjectTriggers,
  'decisions-log.json': detectDecisionTriggers,
  'task-tracker.json': detectTaskTriggers,
  'sprint-board.json': detectSprintTriggers,
  'blockers.json': detectBlockerTriggers,
  'agent-activities.json': detectAgentTriggers,
  'team-pulse.json': detectTeamHealthTriggers
};

// Main execution
async function main() {
  const context = JSON.parse(process.env.HOOK_CONTEXT || '{}');
  
  // Check if monitoring is needed
  if (context.event !== 'file-change' || !context.filePath) {
    process.exit(0);
  }
  
  // Check if this is a project-state file
  if (!context.filePath.includes('project-state')) {
    process.exit(0);
  }
  
  const fileName = path.basename(context.filePath);
  const detector = MONITOR_CONFIG[fileName];
  
  if (!detector) {
    process.exit(0); // Not a monitored file
  }
  
  try {
    const triggers = await detector(context.filePath);
    
    if (triggers.length > 0) {
      // Emit triggers for other systems to handle
      console.log(JSON.stringify({
        triggers,
        timestamp: new Date().toISOString(),
        file: fileName,
        hookName: 'project-state-monitor'
      }));
      
      // Log triggers for debugging
      triggers.forEach(trigger => {
        console.error(`[Project State Monitor] Detected: ${trigger.type}`);
      });
    }
  } catch (error) {
    console.error(`[Project State Monitor] Error: ${error.message}`);
    process.exit(1);
  }
}

// Helper function to get previous state
function getPreviousState(filePath) {
  return previousStates.get(filePath) || null;
}

// Helper function to save current state
function saveCurrentState(filePath, data) {
  previousStates.set(filePath, JSON.parse(JSON.stringify(data)));
}

// Trigger detection functions
async function detectWorkflowTriggers(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const previous = getPreviousState(filePath);
  const triggers = [];
  
  // Workflow start
  if (data.active_workflow && (!previous || !previous.active_workflow)) {
    triggers.push({
      type: 'workflow_start',
      data: { 
        workflow: data.active_workflow,
        initiated_by: data.initiated_by,
        started_at: data.started_at
      }
    });
  }
  
  // Workflow phase change
  if (previous && data.workflow_phase !== previous.workflow_phase) {
    triggers.push({
      type: 'workflow_phase_change',
      data: { 
        workflow: data.active_workflow,
        from: previous.workflow_phase,
        to: data.workflow_phase
      }
    });
  }
  
  // Workflow completion
  if (previous && previous.active_workflow && !data.active_workflow) {
    triggers.push({
      type: 'workflow_completion',
      data: { 
        workflow: previous.active_workflow,
        completed_at: new Date().toISOString()
      }
    });
  }
  
  saveCurrentState(filePath, data);
  return triggers;
}

async function detectProjectTriggers(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const previous = getPreviousState(filePath);
  const triggers = [];
  
  if (!previous) {
    saveCurrentState(filePath, data);
    return triggers;
  }
  
  // Sprint changes
  if (data.current_sprint !== previous.current_sprint) {
    triggers.push({
      type: 'sprint_changes',
      data: { 
        from: previous.current_sprint,
        to: data.current_sprint,
        project: data.project_name
      }
    });
  }
  
  // Project phase change
  if (data.project_phase !== previous.project_phase) {
    triggers.push({
      type: 'project_phase_change',
      data: { 
        from: previous.project_phase,
        to: data.project_phase,
        project: data.project_name
      }
    });
  }
  
  saveCurrentState(filePath, data);
  return triggers;
}

async function detectDecisionTriggers(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const previous = getPreviousState(filePath);
  const triggers = [];
  
  if (!previous) {
    saveCurrentState(filePath, data);
    return triggers;
  }
  
  // Check for new decisions
  const previousCount = previous.decisions ? previous.decisions.length : 0;
  const currentCount = data.decisions ? data.decisions.length : 0;
  
  if (currentCount > previousCount) {
    const newDecisions = data.decisions.slice(previousCount);
    newDecisions.forEach(decision => {
      triggers.push({
        type: 'decision_made',
        data: {
          decision_id: decision.id,
          title: decision.title,
          made_by: decision.made_by,
          timestamp: decision.timestamp
        }
      });
    });
  }
  
  saveCurrentState(filePath, data);
  return triggers;
}

async function detectTaskTriggers(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const previous = getPreviousState(filePath);
  const triggers = [];
  
  if (!previous) {
    saveCurrentState(filePath, data);
    return triggers;
  }
  
  // Check for task completions
  if (data.tasks && previous.tasks) {
    data.tasks.forEach(task => {
      const previousTask = previous.tasks.find(t => t.id === task.id);
      
      if (previousTask) {
        // Task completion
        if (task.status === 'completed' && previousTask.status !== 'completed') {
          triggers.push({
            type: 'task_completion',
            data: {
              task_id: task.id,
              title: task.title,
              completed_by: task.assigned_to,
              completed_at: task.updated_at
            }
          });
        }
        
        // Task assignment change
        if (task.assigned_to !== previousTask.assigned_to) {
          triggers.push({
            type: 'task_assignment',
            data: {
              task_id: task.id,
              title: task.title,
              from: previousTask.assigned_to,
              to: task.assigned_to
            }
          });
        }
      }
    });
  }
  
  saveCurrentState(filePath, data);
  return triggers;
}

async function detectSprintTriggers(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const previous = getPreviousState(filePath);
  const triggers = [];
  
  if (!previous) {
    saveCurrentState(filePath, data);
    return triggers;
  }
  
  // Sprint status changes
  if (data.current_sprint && previous.current_sprint) {
    if (data.current_sprint.status !== previous.current_sprint.status) {
      triggers.push({
        type: 'sprint_changes',
        data: {
          sprint_id: data.current_sprint.id,
          sprint_name: data.current_sprint.name,
          from_status: previous.current_sprint.status,
          to_status: data.current_sprint.status
        }
      });
    }
  }
  
  // Task status changes within sprint
  if (data.tasks && previous.tasks) {
    data.tasks.forEach(task => {
      const previousTask = previous.tasks.find(t => t.id === task.id);
      
      if (previousTask && task.status !== previousTask.status) {
        triggers.push({
          type: 'task_status_change',
          data: {
            task_id: task.id,
            title: task.title,
            from: previousTask.status,
            to: task.status,
            sprint_id: data.current_sprint?.id
          }
        });
      }
    });
  }
  
  saveCurrentState(filePath, data);
  return triggers;
}

async function detectBlockerTriggers(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const previous = getPreviousState(filePath);
  const triggers = [];
  
  if (!previous) {
    saveCurrentState(filePath, data);
    return triggers;
  }
  
  // Check for new blockers
  if (data.blockers && previous.blockers) {
    // New blockers
    data.blockers.forEach(blocker => {
      const previousBlocker = previous.blockers.find(b => b.id === blocker.id);
      
      if (!previousBlocker) {
        triggers.push({
          type: 'blocker_created',
          data: {
            blocker_id: blocker.id,
            title: blocker.title,
            severity: blocker.severity,
            created_by: blocker.created_by,
            created_at: blocker.created_at
          }
        });
      } else if (blocker.status === 'resolved' && previousBlocker.status !== 'resolved') {
        triggers.push({
          type: 'blocker_resolved',
          data: {
            blocker_id: blocker.id,
            title: blocker.title,
            resolved_by: blocker.resolved_by,
            resolved_at: blocker.resolved_at
          }
        });
      }
    });
  }
  
  saveCurrentState(filePath, data);
  return triggers;
}

async function detectAgentTriggers(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const previous = getPreviousState(filePath);
  const triggers = [];
  
  if (!previous) {
    saveCurrentState(filePath, data);
    return triggers;
  }
  
  // Check for new agent activities
  if (data.activities && previous.activities) {
    const previousCount = previous.activities.length;
    const currentCount = data.activities.length;
    
    if (currentCount > previousCount) {
      const newActivities = data.activities.slice(previousCount);
      newActivities.forEach(activity => {
        triggers.push({
          type: 'agent_activity',
          data: {
            agent: activity.agent,
            action: activity.action,
            timestamp: activity.timestamp,
            details: activity.details
          }
        });
      });
    }
  }
  
  saveCurrentState(filePath, data);
  return triggers;
}

async function detectTeamHealthTriggers(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const previous = getPreviousState(filePath);
  const triggers = [];
  
  if (!previous) {
    saveCurrentState(filePath, data);
    return triggers;
  }
  
  // Check for significant health changes
  if (data.health_score !== undefined && previous.health_score !== undefined) {
    const change = data.health_score - previous.health_score;
    
    // Trigger on significant changes (> 10% change)
    if (Math.abs(change) > 10) {
      triggers.push({
        type: 'team_health_change',
        data: {
          from: previous.health_score,
          to: data.health_score,
          change: change,
          direction: change > 0 ? 'improved' : 'declined',
          timestamp: data.last_updated
        }
      });
    }
  }
  
  saveCurrentState(filePath, data);
  return triggers;
}

// Run if executed directly
if (require.main === module) {
  main();
}
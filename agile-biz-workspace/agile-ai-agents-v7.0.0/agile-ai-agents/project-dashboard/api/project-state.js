const express = require('express');
const fs = require('fs-extra');
const path = require('path');

const router = express.Router();

// Paths
const PROJECT_ROOT = path.join(__dirname, '..', '..');
const PROJECT_STATE_PATH = path.join(PROJECT_ROOT, 'project-state');
const CURRENT_STATE_FILE = path.join(PROJECT_STATE_PATH, 'runtime.json');
const WORKFLOW_STATE_FILE = path.join(PROJECT_STATE_PATH, 'runtime.json');
const LEARNING_WORKFLOW_FILE = path.join(PROJECT_STATE_PATH, 'learning-workflow', 'current-runtime.json');

// Get project state
router.get('/', async (req, res) => {
  try {
    const result = {
      hasState: false,
      currentState: null,
      workflowState: null,
      learningWorkflow: null,
      lastUpdated: null
    };

    // Read current state
    if (await fs.pathExists(CURRENT_STATE_FILE)) {
      const currentState = await fs.readJSON(CURRENT_STATE_FILE);
      result.currentState = currentState;
      result.hasState = true;
      result.lastUpdated = currentState.project_info?.last_updated || null;
    }

    // Read workflow state
    if (await fs.pathExists(WORKFLOW_STATE_FILE)) {
      result.workflowState = await fs.readJSON(WORKFLOW_STATE_FILE);
    }

    // Read learning workflow state
    if (await fs.pathExists(LEARNING_WORKFLOW_FILE)) {
      result.learningWorkflow = await fs.readJSON(LEARNING_WORKFLOW_FILE);
    }

    res.json(result);
  } catch (error) {
    console.error('Error reading project state:', error);
    res.status(500).json({ error: 'Failed to read project state' });
  }
});

// Get current workflow details
router.get('/workflow', async (req, res) => {
  try {
    const workflows = {
      main: null,
      learning: null
    };

    // Main workflow from runtime.json
    if (await fs.pathExists(CURRENT_STATE_FILE)) {
      const currentState = await fs.readJSON(CURRENT_STATE_FILE);
      if (currentState.workflow_state?.active_workflow) {
        workflows.main = {
          type: currentState.workflow_state.active_workflow,
          phase: currentState.workflow_state.workflow_phase,
          startedAt: currentState.workflow_state.started_at,
          initiatedBy: currentState.workflow_state.initiated_by
        };
      }
    }

    // Alternative workflow state from runtime.json
    if (await fs.pathExists(WORKFLOW_STATE_FILE)) {
      const workflowState = await fs.readJSON(WORKFLOW_STATE_FILE);
      if (workflowState.active_workflow && !workflows.main) {
        workflows.main = {
          type: workflowState.active_workflow,
          phase: workflowState.workflow_phase,
          startedAt: workflowState.started_at,
          initiatedBy: workflowState.initiated_by
        };
      }
    }

    // Learning workflow
    if (await fs.pathExists(LEARNING_WORKFLOW_FILE)) {
      const learningWorkflow = await fs.readJSON(LEARNING_WORKFLOW_FILE);
      if (learningWorkflow.workflow_id) {
        workflows.learning = {
          id: learningWorkflow.workflow_id,
          phase: learningWorkflow.current_phase,
          startedAt: learningWorkflow.started_at,
          phasesCompleted: learningWorkflow.phases_completed || []
        };
      }
    }

    res.json(workflows);
  } catch (error) {
    console.error('Error reading workflow state:', error);
    res.status(500).json({ error: 'Failed to read workflow state' });
  }
});

// Get recent decisions
router.get('/decisions', async (req, res) => {
  try {
    const decisions = [];
    
    if (await fs.pathExists(CURRENT_STATE_FILE)) {
      const currentState = await fs.readJSON(CURRENT_STATE_FILE);
      if (currentState.recent_decisions) {
        decisions.push(...currentState.recent_decisions);
      }
    }

    res.json({ decisions });
  } catch (error) {
    console.error('Error reading decisions:', error);
    res.status(500).json({ error: 'Failed to read decisions' });
  }
});

// Get active tasks
router.get('/tasks', async (req, res) => {
  try {
    const tasks = [];
    
    if (await fs.pathExists(CURRENT_STATE_FILE)) {
      const currentState = await fs.readJSON(CURRENT_STATE_FILE);
      if (currentState.active_tasks) {
        tasks.push(...currentState.active_tasks);
      }
    }

    res.json({ tasks });
  } catch (error) {
    console.error('Error reading tasks:', error);
    res.status(500).json({ error: 'Failed to read tasks' });
  }
});

// Get project info
router.get('/info', async (req, res) => {
  try {
    let projectInfo = {
      name: 'Untitled Project',
      version: '0.0.1',
      created_at: null,
      last_updated: null
    };
    
    if (await fs.pathExists(CURRENT_STATE_FILE)) {
      const currentState = await fs.readJSON(CURRENT_STATE_FILE);
      if (currentState.project_info) {
        projectInfo = currentState.project_info;
      }
    }

    res.json(projectInfo);
  } catch (error) {
    console.error('Error reading project info:', error);
    res.status(500).json({ error: 'Failed to read project info' });
  }
});

// Get contribution state
router.get('/contributions', async (req, res) => {
  try {
    let contributionState = {
      last_prompt: null,
      pending_prompt: null,
      skip_until: null,
      contribution_history: []
    };
    
    if (await fs.pathExists(CURRENT_STATE_FILE)) {
      const currentState = await fs.readJSON(CURRENT_STATE_FILE);
      if (currentState.contribution_state) {
        contributionState = currentState.contribution_state;
      }
    }

    res.json(contributionState);
  } catch (error) {
    console.error('Error reading contribution state:', error);
    res.status(500).json({ error: 'Failed to read contribution state' });
  }
});

module.exports = router;
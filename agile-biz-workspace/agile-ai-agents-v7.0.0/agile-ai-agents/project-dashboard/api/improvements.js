/**
 * API endpoints for improvement tracking
 */

const fs = require('fs').promises;
const path = require('path');

const IMPROVEMENTS_PATH = path.join(__dirname, '../../project-state/improvements');

/**
 * Get improvement backlog
 */
async function getBacklog(req, res) {
  try {
    const backlogPath = path.join(IMPROVEMENTS_PATH, 'improvement-backlog.json');
    const backlogData = await fs.readFile(backlogPath, 'utf-8');
    const backlog = JSON.parse(backlogData);
    
    res.json(backlog);
  } catch (error) {
    // Return empty backlog if file doesn't exist
    res.json({
      items: [],
      sprints: [],
      metadata: {
        total_items: 0,
        estimated_sprints: 0
      }
    });
  }
}

/**
 * Get deferred improvements
 */
async function getDeferred(req, res) {
  try {
    const deferredPath = path.join(IMPROVEMENTS_PATH, 'deferred-improvements.json');
    const deferredData = await fs.readFile(deferredPath, 'utf-8');
    const deferred = JSON.parse(deferredData);
    
    res.json(deferred);
  } catch (error) {
    // Return empty deferred list if file doesn't exist
    res.json({
      deferred_improvements: [],
      metadata: {
        last_reviewed: null,
        total_deferred: 0,
        next_review: null
      }
    });
  }
}

/**
 * Update improvement status
 */
async function updateStatus(req, res) {
  try {
    const { id, status } = req.body;
    
    if (!id || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const backlogPath = path.join(IMPROVEMENTS_PATH, 'improvement-backlog.json');
    const backlogData = await fs.readFile(backlogPath, 'utf-8');
    const backlog = JSON.parse(backlogData);
    
    // Find and update item
    const item = backlog.items.find(i => i.id === id);
    if (!item) {
      return res.status(404).json({ error: 'Improvement not found' });
    }
    
    item.status = status;
    
    // Update sprint status if needed
    if (status === 'in_progress') {
      const sprint = backlog.sprints.find(s => s.items.includes(id));
      if (sprint && sprint.status === 'planned') {
        sprint.status = 'active';
      }
    }
    
    // Save updated backlog
    await fs.writeFile(backlogPath, JSON.stringify(backlog, null, 2));
    
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Move deferred item to backlog
 */
async function moveToBacklog(req, res) {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Missing improvement ID' });
    }
    
    // Load deferred items
    const deferredPath = path.join(IMPROVEMENTS_PATH, 'deferred-improvements.json');
    const deferredData = await fs.readFile(deferredPath, 'utf-8');
    const deferred = JSON.parse(deferredData);
    
    // Find item
    const itemIndex = deferred.deferred_improvements.findIndex(i => i.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Deferred item not found' });
    }
    
    const item = deferred.deferred_improvements[itemIndex];
    
    // Remove from deferred
    deferred.deferred_improvements.splice(itemIndex, 1);
    deferred.metadata.total_deferred = deferred.deferred_improvements.length;
    
    // Add to backlog
    const backlogPath = path.join(IMPROVEMENTS_PATH, 'improvement-backlog.json');
    const backlogData = await fs.readFile(backlogPath, 'utf-8');
    const backlog = JSON.parse(backlogData);
    
    // Create backlog item
    const backlogItem = {
      id: item.id,
      title: item.title,
      description: item.description,
      priority: backlog.items.length + 1, // Add at end
      category: item.category,
      estimated_hours: 8, // Default estimate
      status: 'todo',
      sprint_id: null,
      dependencies: []
    };
    
    backlog.items.push(backlogItem);
    backlog.metadata.total_items = backlog.items.length;
    
    // Assign to next available sprint
    const lastSprint = backlog.sprints[backlog.sprints.length - 1];
    if (lastSprint && lastSprint.estimated_hours + 8 <= 80) {
      lastSprint.items.push(item.id);
      lastSprint.estimated_hours += 8;
      backlogItem.sprint_id = lastSprint.id;
    } else {
      // Create new sprint
      const newSprint = {
        id: `sprint-improvement-${backlog.sprints.length + 1}`,
        name: `Improvement Sprint ${backlog.sprints.length + 1}`,
        items: [item.id],
        estimated_hours: 8,
        start_date: null,
        status: 'planned'
      };
      backlog.sprints.push(newSprint);
      backlogItem.sprint_id = newSprint.id;
    }
    
    // Save both files
    await fs.writeFile(deferredPath, JSON.stringify(deferred, null, 2));
    await fs.writeFile(backlogPath, JSON.stringify(backlog, null, 2));
    
    res.json({ success: true, item: backlogItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get improvement statistics
 */
async function getStatistics(req, res) {
  try {
    const backlogPath = path.join(IMPROVEMENTS_PATH, 'improvement-backlog.json');
    const deferredPath = path.join(IMPROVEMENTS_PATH, 'deferred-improvements.json');
    
    let backlog = { items: [], sprints: [] };
    let deferred = { deferred_improvements: [] };
    
    try {
      const backlogData = await fs.readFile(backlogPath, 'utf-8');
      backlog = JSON.parse(backlogData);
    } catch (e) {}
    
    try {
      const deferredData = await fs.readFile(deferredPath, 'utf-8');
      deferred = JSON.parse(deferredData);
    } catch (e) {}
    
    const stats = {
      total_identified: backlog.items.length + deferred.deferred_improvements.length,
      total_selected: backlog.items.length,
      total_deferred: deferred.deferred_improvements.length,
      completed: backlog.items.filter(i => i.status === 'completed').length,
      in_progress: backlog.items.filter(i => i.status === 'in_progress').length,
      todo: backlog.items.filter(i => i.status === 'todo').length,
      blocked: backlog.items.filter(i => i.status === 'blocked').length,
      sprints_total: backlog.sprints.length,
      sprints_completed: backlog.sprints.filter(s => s.status === 'completed').length,
      sprints_active: backlog.sprints.filter(s => s.status === 'active').length,
      critical_deferred: deferred.deferred_improvements.filter(i => i.category === 'critical_security').length,
      by_category: {}
    };
    
    // Count by category
    [...backlog.items, ...deferred.deferred_improvements].forEach(item => {
      if (!stats.by_category[item.category]) {
        stats.by_category[item.category] = {
          selected: 0,
          deferred: 0,
          completed: 0
        };
      }
      
      if (backlog.items.find(i => i.id === item.id)) {
        stats.by_category[item.category].selected++;
        if (item.status === 'completed') {
          stats.by_category[item.category].completed++;
        }
      } else {
        stats.by_category[item.category].deferred++;
      }
    });
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getBacklog,
  getDeferred,
  updateStatus,
  moveToBacklog,
  getStatistics
};
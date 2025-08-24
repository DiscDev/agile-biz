/**
 * Improvement Selection Handler
 * Orchestrates the improvement selection process within the existing project workflow
 */

const fs = require('fs').promises;
const path = require('path');
const ImprovementAnalyzer = require('../improvement-analyzer');
const ImprovementGroupingEngine = require('../improvement-grouping-engine');
const ImprovementSelector = require('../../hooks/handlers/command/improvement-selector');

class ImprovementSelectionHandler {
  constructor() {
    this.analyzer = new ImprovementAnalyzer();
    this.groupingEngine = new ImprovementGroupingEngine();
    this.selector = new ImprovementSelector();
    this.statePath = path.join(__dirname, '../../project-state/improvements');
  }

  /**
   * Main handler for improvement selection phase
   */
  async handleImprovementSelection(analysisResults) {
    console.log('\n## Phase: Improvement Selection & Prioritization\n');
    console.log('Based on the analysis, I\'ve identified opportunities for improvement.');
    console.log('You have complete control over which improvements to implement.\n');

    try {
      // Step 1: Analyze and generate improvements
      console.log('🔍 Analyzing findings and generating improvement recommendations...\n');
      const improvements = await this.analyzer.analyzeProject(analysisResults);
      
      // Step 2: Group related improvements
      console.log('📦 Grouping related improvements for better organization...\n');
      const grouped = this.groupingEngine.groupImprovements(improvements.improvements);
      
      // Step 3: Interactive selection
      const selection = await this.selector.startSelection(
        improvements.improvements,
        grouped
      );
      
      // Step 4: Generate backlog from selections
      const backlog = await this.generateBacklog(selection.selected);
      
      // Step 5: Save state for workflow continuation
      await this.saveSelectionState(selection, backlog);
      
      return {
        success: true,
        selected: selection.selected,
        deferred: selection.deferred,
        backlog: backlog,
        summary: selection.summary
      };
    } catch (error) {
      console.error('Error in improvement selection:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate backlog from selected improvements
   */
  async generateBacklog(selectedImprovements) {
    const backlog = {
      items: [],
      sprints: [],
      metadata: {
        created: new Date().toISOString(),
        total_items: selectedImprovements.length,
        estimated_sprints: 0
      }
    };

    // Sort by priority
    const sorted = selectedImprovements.sort((a, b) => a.priority - b.priority);
    
    // Create backlog items
    let currentSprint = {
      id: `sprint-improvement-1`,
      name: 'Improvement Sprint 1',
      items: [],
      estimated_hours: 0,
      start_date: null,
      status: 'planned'
    };
    
    const sprintCapacity = 80; // hours per sprint
    let sprintNumber = 1;

    for (const improvement of sorted) {
      const backlogItem = {
        id: improvement.id,
        title: improvement.title,
        description: improvement.description,
        priority: improvement.priority,
        category: improvement.category,
        estimated_hours: improvement.estimated_hours || 8,
        status: 'todo',
        sprint_id: null,
        dependencies: improvement.dependencies || []
      };

      // Check if item fits in current sprint
      if (currentSprint.estimated_hours + backlogItem.estimated_hours <= sprintCapacity) {
        currentSprint.items.push(backlogItem.id);
        currentSprint.estimated_hours += backlogItem.estimated_hours;
        backlogItem.sprint_id = currentSprint.id;
      } else {
        // Save current sprint and start new one
        backlog.sprints.push(currentSprint);
        sprintNumber++;
        
        currentSprint = {
          id: `sprint-improvement-${sprintNumber}`,
          name: `Improvement Sprint ${sprintNumber}`,
          items: [backlogItem.id],
          estimated_hours: backlogItem.estimated_hours,
          start_date: null,
          status: 'planned'
        };
        backlogItem.sprint_id = currentSprint.id;
      }
      
      backlog.items.push(backlogItem);
    }
    
    // Add last sprint
    if (currentSprint.items.length > 0) {
      backlog.sprints.push(currentSprint);
    }
    
    backlog.metadata.estimated_sprints = backlog.sprints.length;
    
    return backlog;
  }

  /**
   * Save selection state for workflow
   */
  async saveSelectionState(selection, backlog) {
    // Save improvement selection state
    const selectionState = {
      timestamp: new Date().toISOString(),
      phase: 'improvement-selection',
      completed: true,
      results: {
        total_identified: selection.selected.length + selection.deferred.length,
        total_selected: selection.selected.length,
        total_deferred: selection.deferred.length,
        estimated_sprints: backlog.metadata.estimated_sprints
      },
      next_phase: 'planning'
    };

    await fs.writeFile(
      path.join(this.statePath, 'selection-state.json'),
      JSON.stringify(selectionState, null, 2)
    );

    // Save backlog
    await fs.writeFile(
      path.join(this.statePath, 'improvement-backlog.json'),
      JSON.stringify(backlog, null, 2)
    );
  }

  /**
   * Load previous selection if resuming
   */
  async loadPreviousSelection() {
    try {
      const selectionPath = path.join(this.statePath, 'selection-state.json');
      const selectionData = await fs.readFile(selectionPath, 'utf-8');
      return JSON.parse(selectionData);
    } catch (error) {
      return null;
    }
  }

  /**
   * Handle re-prioritization request
   */
  async handleReprioritization() {
    console.log('\n## Re-prioritization Mode\n');
    
    try {
      // Load current state
      const currentBacklog = await this.loadCurrentBacklog();
      const remainingItems = currentBacklog.items.filter(i => i.status !== 'completed');
      
      if (remainingItems.length === 0) {
        console.log('All improvements have been completed. No items to reprioritize.');
        return { success: true, message: 'No items to reprioritize' };
      }
      
      console.log(`Found ${remainingItems.length} remaining improvements.\n`);
      
      // Display current priorities
      this.displayCurrentPriorities(remainingItems);
      
      // Allow re-prioritization
      const reprioritized = await this.selector.setPriorities(remainingItems);
      
      // Update backlog
      await this.updateBacklogPriorities(reprioritized);
      
      console.log('✅ Priorities updated successfully.');
      
      return {
        success: true,
        reprioritized: reprioritized.length,
        message: 'Priorities updated'
      };
    } catch (error) {
      console.error('Error during reprioritization:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Load current backlog
   */
  async loadCurrentBacklog() {
    const backlogPath = path.join(this.statePath, 'improvement-backlog.json');
    const backlogData = await fs.readFile(backlogPath, 'utf-8');
    return JSON.parse(backlogData);
  }

  /**
   * Display current priorities
   */
  displayCurrentPriorities(items) {
    console.log('Current priority order:');
    items.sort((a, b) => a.priority - b.priority)
      .forEach((item, index) => {
        const status = item.status === 'in_progress' ? ' (IN PROGRESS)' : '';
        console.log(`  ${index + 1}. ${item.title}${status}`);
      });
    console.log();
  }

  /**
   * Update backlog with new priorities
   */
  async updateBacklogPriorities(reprioritizedItems) {
    const backlog = await this.loadCurrentBacklog();
    
    // Update priorities
    reprioritizedItems.forEach(item => {
      const backlogItem = backlog.items.find(bi => bi.id === item.id);
      if (backlogItem) {
        backlogItem.priority = item.priority;
      }
    });
    
    // Re-organize sprints based on new priorities
    backlog.sprints = this.reorganizeSprints(backlog.items, backlog.sprints);
    
    // Save updated backlog
    await fs.writeFile(
      path.join(this.statePath, 'improvement-backlog.json'),
      JSON.stringify(backlog, null, 2)
    );
  }

  /**
   * Reorganize sprints based on new priorities
   */
  reorganizeSprints(items, existingSprints) {
    // Keep completed sprints as-is
    const completedSprints = existingSprints.filter(s => s.status === 'completed');
    
    // Get uncompleted items sorted by new priority
    const todoItems = items
      .filter(i => i.status !== 'completed')
      .sort((a, b) => a.priority - b.priority);
    
    // Rebuild sprint assignments
    const newSprints = [];
    let currentSprint = null;
    let sprintNumber = completedSprints.length + 1;
    const sprintCapacity = 80;
    
    todoItems.forEach(item => {
      if (!currentSprint || currentSprint.estimated_hours + item.estimated_hours > sprintCapacity) {
        if (currentSprint) {
          newSprints.push(currentSprint);
        }
        currentSprint = {
          id: `sprint-improvement-${sprintNumber}`,
          name: `Improvement Sprint ${sprintNumber}`,
          items: [],
          estimated_hours: 0,
          start_date: null,
          status: 'planned'
        };
        sprintNumber++;
      }
      
      currentSprint.items.push(item.id);
      currentSprint.estimated_hours += item.estimated_hours;
      item.sprint_id = currentSprint.id;
    });
    
    if (currentSprint && currentSprint.items.length > 0) {
      newSprints.push(currentSprint);
    }
    
    return [...completedSprints, ...newSprints];
  }

  /**
   * Show deferred improvements
   */
  async showDeferredImprovements() {
    try {
      const deferredPath = path.join(this.statePath, 'deferred-improvements.json');
      const deferredData = await fs.readFile(deferredPath, 'utf-8');
      const deferred = JSON.parse(deferredData);
      
      if (deferred.deferred_improvements.length === 0) {
        console.log('No deferred improvements.');
        return { success: true, count: 0 };
      }
      
      console.log('\n📋 DEFERRED IMPROVEMENTS\n');
      console.log(`Total deferred: ${deferred.deferred_improvements.length}`);
      console.log(`Next review: ${deferred.metadata.next_review || 'Not scheduled'}\n`);
      
      deferred.deferred_improvements.forEach((item, index) => {
        const daysSinceDeferred = Math.floor(
          (Date.now() - new Date(item.deferred_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        console.log(`${index + 1}. ${item.title}`);
        console.log(`   Category: ${item.category}`);
        console.log(`   Reason: ${item.reason}`);
        console.log(`   Deferred: ${daysSinceDeferred} days ago`);
        console.log(`   Revisit: ${item.revisit_date}\n`);
      });
      
      return {
        success: true,
        count: deferred.deferred_improvements.length
      };
    } catch (error) {
      console.log('No deferred improvements found.');
      return { success: true, count: 0 };
    }
  }
}

module.exports = ImprovementSelectionHandler;
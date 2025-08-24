/**
 * Phase Selection Menu Handler
 * Manages the operational phase selection after MVP/Analysis
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class PhaseSelectionMenu {
  constructor(projectRoot, workflowType) {
    this.projectRoot = projectRoot || process.cwd();
    this.workflowType = workflowType; // 'new-project' or 'existing-project'
    this.configPath = path.join(this.projectRoot, 'machine-data', 'workflow-phase-configuration.json');
    this.statePath = path.join(this.projectRoot, 'project-state', 'runtime.json');
    this.loadConfiguration();
  }

  /**
   * Load workflow configuration
   */
  loadConfiguration() {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf8');
      this.config = JSON.parse(configContent);
      
      const stateContent = fs.readFileSync(this.statePath, 'utf8');
      this.state = JSON.parse(stateContent);
    } catch (error) {
      console.error('Error loading configuration:', error);
      throw error;
    }
  }

  /**
   * Display the phase selection menu
   */
  async displayMenu() {
    const stage = this.workflowType === 'new-project' ? 'operations' : 'enhancements';
    const phases = this.config.workflows[this.workflowType].stages[stage].phases;
    const quickPackages = this.config.phase_selection_menu.quick_packages;

    console.log('\n' + '='.repeat(60));
    console.log('PHASE SELECTION MENU');
    console.log('='.repeat(60));
    
    if (this.workflowType === 'new-project') {
      console.log('\n🎉 Congratulations! Your MVP is deployed.');
      console.log('Now you can select operational phases to enhance your project.\n');
    } else {
      console.log('\n✅ Analysis complete!');
      console.log('Select enhancement phases to improve your existing project.\n');
    }

    // Display Quick Packages
    console.log('📦 QUICK PACKAGES');
    console.log('─'.repeat(40));
    
    let packageIndex = 1;
    const packageKeys = Object.keys(quickPackages);
    
    packageKeys.forEach(key => {
      const pkg = quickPackages[key];
      console.log(`${packageIndex}. ${pkg.name}`);
      console.log(`   ${pkg.description}`);
      console.log(`   Includes: ${pkg.phases.join(', ')}\n`);
      packageIndex++;
    });

    // Display Individual Phases
    console.log('🔧 INDIVIDUAL PHASES');
    console.log('─'.repeat(40));
    
    const categories = {};
    phases.forEach(phase => {
      if (!categories[phase.category]) {
        categories[phase.category] = [];
      }
      categories[phase.category].push(phase);
    });

    let phaseIndex = packageIndex;
    Object.keys(categories).forEach(category => {
      console.log(`\n${category.toUpperCase().replace('_', ' ')}`);
      categories[category].forEach(phase => {
        console.log(`${phaseIndex}. ${phase.name}`);
        console.log(`   Time: ${phase.estimated_time}`);
        console.log(`   Agent(s): ${Array.isArray(phase.agents) ? phase.agents.join(', ') : phase.agent}`);
        phaseIndex++;
      });
    });

    // Display Execution Modes
    console.log('\n⚙️  EXECUTION MODES');
    console.log('─'.repeat(40));
    
    const modes = this.config.phase_selection_menu.execution_modes;
    Object.keys(modes).forEach((mode, index) => {
      console.log(`${index + 1}. ${mode.toUpperCase()}: ${modes[mode].description}`);
    });

    console.log('\n' + '='.repeat(60));
    
    return {
      packages: packageKeys,
      phases: phases,
      totalOptions: phaseIndex - 1
    };
  }

  /**
   * Process user selection
   */
  async processSelection(selection) {
    const quickPackages = this.config.phase_selection_menu.quick_packages;
    const stage = this.workflowType === 'new-project' ? 'operations' : 'enhancements';
    const phases = this.config.workflows[this.workflowType].stages[stage].phases;
    
    let selectedPhases = [];
    
    // Parse selection (can be comma-separated)
    const selections = selection.split(',').map(s => s.trim());
    
    selections.forEach(sel => {
      const num = parseInt(sel);
      
      if (num <= Object.keys(quickPackages).length) {
        // Quick package selected
        const packageKey = Object.keys(quickPackages)[num - 1];
        const packagePhases = quickPackages[packageKey].phases;
        selectedPhases.push(...packagePhases);
      } else {
        // Individual phase selected
        const phaseIndex = num - Object.keys(quickPackages).length - 1;
        if (phaseIndex >= 0 && phaseIndex < phases.length) {
          selectedPhases.push(phases[phaseIndex].id);
        }
      }
    });
    
    // Remove duplicates
    selectedPhases = [...new Set(selectedPhases)];
    
    return selectedPhases;
  }

  /**
   * Get execution mode from user
   */
  async getExecutionMode() {
    console.log('\nHow would you like to execute these phases?');
    console.log('1. Sequential (one at a time)');
    console.log('2. Parallel (simultaneously where possible)');
    console.log('3. Priority (based on business value)');
    console.log('\nEnter choice (1-3) [default: 2]: ');
    
    // In actual implementation, this would get user input
    // For now, return default
    return 'parallel';
  }

  /**
   * Display selected phases summary
   */
  displaySummary(selectedPhases, executionMode) {
    console.log('\n' + '='.repeat(60));
    console.log('SELECTION SUMMARY');
    console.log('='.repeat(60));
    
    console.log('\n📋 Selected Phases:');
    const stage = this.workflowType === 'new-project' ? 'operations' : 'enhancements';
    const allPhases = this.config.workflows[this.workflowType].stages[stage].phases;
    
    selectedPhases.forEach(phaseId => {
      const phase = allPhases.find(p => p.id === phaseId);
      if (phase) {
        console.log(`  • ${phase.name} (${phase.estimated_time})`);
      }
    });
    
    console.log(`\n⚙️  Execution Mode: ${executionMode.toUpperCase()}`);
    
    // Calculate estimated time
    let totalMinutes = 0;
    selectedPhases.forEach(phaseId => {
      const phase = allPhases.find(p => p.id === phaseId);
      if (phase && phase.estimated_time) {
        // Parse time estimates (simplified)
        const match = phase.estimated_time.match(/(\d+)-(\d+)\s*(hours?|days?)/);
        if (match) {
          const avg = (parseInt(match[1]) + parseInt(match[2])) / 2;
          const unit = match[3];
          if (unit.startsWith('hour')) {
            totalMinutes += avg * 60;
          } else if (unit.startsWith('day')) {
            totalMinutes += avg * 8 * 60; // Assume 8 hour work day
          }
        }
      }
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (executionMode === 'parallel') {
      // Reduce time estimate for parallel execution
      totalMinutes = Math.floor(totalMinutes * 0.4); // 60% reduction
    }
    
    console.log(`\n⏱️  Estimated Time: ${hours}h ${minutes}m`);
    
    if (executionMode === 'parallel') {
      console.log('   (Time reduced due to parallel execution)');
    }
    
    console.log('\n' + '='.repeat(60));
  }

  /**
   * Save phase selection to state
   */
  saveSelection(selectedPhases, executionMode) {
    // Update workflow state
    this.state.phases.selected.active = selectedPhases;
    this.state.phases.selected.execution_mode = executionMode;
    this.state.last_updated = new Date().toISOString();
    
    // Save state
    fs.writeFileSync(this.statePath, JSON.stringify(this.state, null, 2));
    
    return {
      success: true,
      phases: selectedPhases,
      mode: executionMode
    };
  }

  /**
   * Main execution flow
   */
  async execute() {
    try {
      // Check if phase selection is unlocked
      if (!this.state.phase_selection_unlocked) {
        console.log('⚠️  Phase selection is not yet available.');
        console.log('Complete the required sequential phases first.');
        return { success: false };
      }
      
      // Display menu
      const menuInfo = await this.displayMenu();
      
      // Get user selection (in real implementation, would be interactive)
      console.log('\nEnter your selection(s) - comma separated for multiple:');
      console.log('Example: 1 (for package) or 4,5,6 (for individual phases)');
      console.log('Or type "all" to select all phases: ');
      
      // For demo, we'll simulate a selection
      const userInput = '1'; // Selecting startup package
      
      // Process selection
      const selectedPhases = await this.processSelection(userInput);
      
      if (selectedPhases.length === 0) {
        console.log('No valid phases selected.');
        return { success: false };
      }
      
      // Get execution mode
      const executionMode = await this.getExecutionMode();
      
      // Display summary
      this.displaySummary(selectedPhases, executionMode);
      
      // Confirm selection
      console.log('\nProceed with these selections? (yes/no): ');
      const confirmation = 'yes'; // Simulated
      
      if (confirmation.toLowerCase() === 'yes') {
        // Save selection
        const result = this.saveSelection(selectedPhases, executionMode);
        
        console.log('\n✅ Phase selection saved successfully!');
        console.log('The selected phases will now be executed.');
        
        return result;
      } else {
        console.log('Phase selection cancelled.');
        return { success: false };
      }
      
    } catch (error) {
      console.error('Error in phase selection:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export for use in workflows
module.exports = PhaseSelectionMenu;

// Allow direct execution for testing
if (require.main === module) {
  // Test with new project workflow
  const menu = new PhaseSelectionMenu(process.cwd(), 'new-project');
  
  // Simulate unlocked state for testing
  const statePath = path.join(process.cwd(), 'project-state', 'runtime.json');
  if (fs.existsSync(statePath)) {
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    state.phase_selection_unlocked = true;
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  }
  
  menu.execute().then(result => {
    console.log('Result:', result);
  });
}
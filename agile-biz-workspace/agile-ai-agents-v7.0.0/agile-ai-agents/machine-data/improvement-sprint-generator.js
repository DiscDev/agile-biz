/**
 * Improvement Sprint Generator
 * Converts selected improvements into executable sprints
 */

const fs = require('fs').promises;
const path = require('path');

class ImprovementSprintGenerator {
  constructor() {
    this.sprintCapacityHours = 80; // Default sprint capacity
    this.sprintsPath = path.join(__dirname, '../project-documents/sprints');
    this.templatePath = path.join(__dirname, '../templates');
  }

  /**
   * Generate sprints from selected improvements
   */
  async generateSprints(selectedImprovements, options = {}) {
    const sprints = [];
    const sortedImprovements = this.sortByPriority(selectedImprovements);
    
    // Group improvements into sprints based on capacity
    let currentSprint = this.initializeSprint(1, options.startDate);
    let sprintNumber = 1;
    
    for (const improvement of sortedImprovements) {
      const hours = improvement.estimated_hours || 8;
      
      // Check if improvement fits in current sprint
      if (currentSprint.allocated_hours + hours <= this.sprintCapacityHours) {
        currentSprint.items.push(improvement);
        currentSprint.allocated_hours += hours;
      } else {
        // Save current sprint and start new one
        if (currentSprint.items.length > 0) {
          sprints.push(currentSprint);
          sprintNumber++;
        }
        currentSprint = this.initializeSprint(sprintNumber, this.calculateNextSprintDate(currentSprint.end_date));
        currentSprint.items.push(improvement);
        currentSprint.allocated_hours = hours;
      }
    }
    
    // Add last sprint
    if (currentSprint.items.length > 0) {
      sprints.push(currentSprint);
    }
    
    // Generate sprint documents
    for (const sprint of sprints) {
      await this.generateSprintDocument(sprint);
    }
    
    return {
      sprints,
      total_sprints: sprints.length,
      total_hours: sortedImprovements.reduce((sum, i) => sum + (i.estimated_hours || 8), 0),
      estimated_duration: `${sprints.length * 2} weeks`
    };
  }

  /**
   * Initialize a new sprint
   */
  initializeSprint(number, startDate) {
    const start = startDate || new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 14); // 2-week sprints
    
    return {
      id: `sprint-${new Date().toISOString().split('T')[0]}-improvement-${number}`,
      number,
      name: `Improvement Sprint ${number}`,
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
      items: [],
      allocated_hours: 0,
      status: 'planned',
      goals: [],
      success_criteria: [],
      risks: []
    };
  }

  /**
   * Calculate next sprint start date
   */
  calculateNextSprintDate(previousEndDate) {
    const nextStart = new Date(previousEndDate);
    nextStart.setDate(nextStart.getDate() + 1); // Start next day
    
    // Skip weekends
    if (nextStart.getDay() === 6) { // Saturday
      nextStart.setDate(nextStart.getDate() + 2);
    } else if (nextStart.getDay() === 0) { // Sunday
      nextStart.setDate(nextStart.getDate() + 1);
    }
    
    return nextStart;
  }

  /**
   * Sort improvements by priority
   */
  sortByPriority(improvements) {
    return [...improvements].sort((a, b) => {
      // First by priority number (lower is higher priority)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      
      // Then by category weight
      const categoryWeights = {
        critical_security: 10,
        performance: 7,
        testing: 6,
        technical_debt: 5,
        features: 4,
        modernization: 3,
        documentation: 2
      };
      
      const aWeight = categoryWeights[a.category] || 0;
      const bWeight = categoryWeights[b.category] || 0;
      
      return bWeight - aWeight;
    });
  }

  /**
   * Generate sprint document
   */
  async generateSprintDocument(sprint) {
    const sprintDoc = `# ${sprint.name}

## Sprint Information
- **Sprint ID**: ${sprint.id}
- **Duration**: ${sprint.start_date} to ${sprint.end_date}
- **Capacity**: ${this.sprintCapacityHours} hours
- **Allocated**: ${sprint.allocated_hours} hours
- **Status**: ${sprint.status}

## Sprint Goals
${this.generateSprintGoals(sprint.items).map(goal => `- ${goal}`).join('\n')}

## Improvements to Implement

${sprint.items.map((item, index) => this.formatImprovementItem(item, index + 1)).join('\n\n')}

## Success Criteria
${this.generateSuccessCriteria(sprint.items).map(criteria => `- [ ] ${criteria}`).join('\n')}

## Technical Approach

### Implementation Order
${this.determineImplementationOrder(sprint.items).map((item, index) => 
  `${index + 1}. **${item.title}** (${item.estimated_hours}h)\n   - ${item.description}`
).join('\n')}

### Dependencies
${this.identifyDependencies(sprint.items)}

### Risk Mitigation
${this.identifyRisks(sprint.items).map(risk => `- **${risk.type}**: ${risk.description}\n  - *Mitigation*: ${risk.mitigation}`).join('\n')}

## Daily Standup Template

\`\`\`
Date: [DATE]
Progress:
- Yesterday: [What was completed]
- Today: [What will be worked on]
- Blockers: [Any impediments]

Improvements Status:
${sprint.items.map(item => `- [ ] ${item.title}: [Status]`).join('\n')}
\`\`\`

## Sprint Retrospective Template

### What Went Well
- 

### What Could Be Improved
- 

### Action Items
- 

## Resources

### Documentation
- [Project Analysis](../existing-project-analysis/)
- [Improvement Recommendations](../improvements/recommendations.md)
- [Technical Standards](../standards/)

### Testing
- Run existing tests before making changes
- Add tests for each improvement
- Ensure all tests pass before marking complete

## Notes

- Prioritize backward compatibility
- Document all changes
- Update relevant documentation
- Communicate progress daily

---

**Sprint Generated**: ${new Date().toISOString()}
**Generator Version**: 1.0.0`;

    // Save sprint document
    const sprintPath = path.join(this.sprintsPath, sprint.id);
    await fs.mkdir(sprintPath, { recursive: true });
    await fs.writeFile(
      path.join(sprintPath, 'sprint-plan.md'),
      sprintDoc
    );
    
    return sprintDoc;
  }

  /**
   * Format improvement item for documentation
   */
  formatImprovementItem(item, number) {
    return `### ${number}. ${item.title}

**Category**: ${this.formatCategory(item.category)}
**Priority**: ${item.priority}
**Estimated Hours**: ${item.estimated_hours || 8}
**Impact**: ${item.impact}
**Effort**: ${item.effort}

**Description**:
${item.description}

**Implementation Notes**:
- ${item.affected_components ? `Affects: ${item.affected_components.join(', ')}` : 'Review affected components'}
- ${item.dependencies?.length > 0 ? `Dependencies: ${item.dependencies.join(', ')}` : 'No dependencies'}
- ${item.risk_if_deferred ? `Risk if not completed: ${item.risk_if_deferred}` : ''}

**Acceptance Criteria**:
- [ ] Implementation complete
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Deployed successfully`;
  }

  /**
   * Generate sprint goals based on improvements
   */
  generateSprintGoals(items) {
    const goals = [];
    
    // Group by category for goals
    const byCategory = {};
    items.forEach(item => {
      if (!byCategory[item.category]) {
        byCategory[item.category] = [];
      }
      byCategory[item.category].push(item);
    });
    
    // Generate goals per category
    Object.entries(byCategory).forEach(([category, categoryItems]) => {
      switch (category) {
        case 'critical_security':
          goals.push(`Address ${categoryItems.length} critical security vulnerabilities`);
          break;
        case 'performance':
          goals.push(`Improve application performance through ${categoryItems.length} optimizations`);
          break;
        case 'technical_debt':
          goals.push(`Reduce technical debt by completing ${categoryItems.length} refactoring tasks`);
          break;
        case 'features':
          goals.push(`Deliver ${categoryItems.length} feature enhancements`);
          break;
        case 'testing':
          goals.push(`Improve test coverage with ${categoryItems.length} testing improvements`);
          break;
        default:
          goals.push(`Complete ${categoryItems.length} ${this.formatCategory(category)} improvements`);
      }
    });
    
    return goals;
  }

  /**
   * Generate success criteria
   */
  generateSuccessCriteria(items) {
    const criteria = [
      'All selected improvements implemented successfully',
      'No regression issues introduced',
      'All tests passing',
      'Documentation updated for changes'
    ];
    
    // Add specific criteria based on categories
    const hasSecurityItems = items.some(i => i.category === 'critical_security');
    if (hasSecurityItems) {
      criteria.push('Security vulnerabilities resolved and verified');
    }
    
    const hasPerformanceItems = items.some(i => i.category === 'performance');
    if (hasPerformanceItems) {
      criteria.push('Performance improvements measured and documented');
    }
    
    const hasTestingItems = items.some(i => i.category === 'testing');
    if (hasTestingItems) {
      criteria.push('Test coverage increased to target levels');
    }
    
    return criteria;
  }

  /**
   * Determine implementation order considering dependencies
   */
  determineImplementationOrder(items) {
    const ordered = [];
    const remaining = [...items];
    const completed = new Set();
    
    // First, add items with no dependencies
    const noDeps = remaining.filter(item => !item.dependencies || item.dependencies.length === 0);
    noDeps.forEach(item => {
      ordered.push(item);
      completed.add(item.id);
      remaining.splice(remaining.indexOf(item), 1);
    });
    
    // Then add items whose dependencies are satisfied
    while (remaining.length > 0) {
      let added = false;
      
      for (let i = 0; i < remaining.length; i++) {
        const item = remaining[i];
        const depsS satisfied = !item.dependencies || 
          item.dependencies.every(dep => completed.has(dep));
        
        if (depsSatisfied) {
          ordered.push(item);
          completed.add(item.id);
          remaining.splice(i, 1);
          added = true;
          break;
        }
      }
      
      // If no items could be added, add remaining items (circular deps)
      if (!added && remaining.length > 0) {
        ordered.push(remaining.shift());
      }
    }
    
    return ordered;
  }

  /**
   * Identify dependencies within sprint
   */
  identifyDependencies(items) {
    const deps = [];
    
    items.forEach(item => {
      if (item.dependencies && item.dependencies.length > 0) {
        item.dependencies.forEach(depId => {
          const depItem = items.find(i => i.id === depId);
          if (depItem) {
            deps.push(`- **${item.title}** depends on **${depItem.title}**`);
          }
        });
      }
    });
    
    return deps.length > 0 ? deps.join('\n') : '- No inter-sprint dependencies identified';
  }

  /**
   * Identify risks for the sprint
   */
  identifyRisks(items) {
    const risks = [];
    
    // Check for high-effort items
    const highEffortItems = items.filter(i => i.effort === 'high');
    if (highEffortItems.length > 0) {
      risks.push({
        type: 'Capacity',
        description: `${highEffortItems.length} high-effort items may impact sprint completion`,
        mitigation: 'Monitor progress daily and escalate blockers immediately'
      });
    }
    
    // Check for critical security items
    const securityItems = items.filter(i => i.category === 'critical_security');
    if (securityItems.length > 0) {
      risks.push({
        type: 'Security',
        description: 'Critical security fixes require careful testing',
        mitigation: 'Allocate extra time for security testing and verification'
      });
    }
    
    // Check for items affecting core components
    const coreComponents = ['auth', 'database', 'api'];
    const coreItems = items.filter(i => 
      i.affected_components?.some(c => 
        coreComponents.some(core => c.toLowerCase().includes(core))
      )
    );
    if (coreItems.length > 0) {
      risks.push({
        type: 'Stability',
        description: 'Changes to core components may impact system stability',
        mitigation: 'Implement feature flags and have rollback plan ready'
      });
    }
    
    // Default risk if none identified
    if (risks.length === 0) {
      risks.push({
        type: 'General',
        description: 'Standard sprint execution risks',
        mitigation: 'Follow established development practices'
      });
    }
    
    return risks;
  }

  /**
   * Format category name
   */
  formatCategory(category) {
    return category.replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Create sprint execution tracker
   */
  async createExecutionTracker(sprint) {
    const tracker = {
      sprint_id: sprint.id,
      sprint_name: sprint.name,
      start_date: sprint.start_date,
      end_date: sprint.end_date,
      status: 'not_started',
      daily_updates: [],
      completed_items: [],
      blocked_items: [],
      metrics: {
        planned_hours: sprint.allocated_hours,
        actual_hours: 0,
        velocity: 0,
        completion_rate: 0
      }
    };
    
    const trackerPath = path.join(this.sprintsPath, sprint.id, 'execution-tracker.json');
    await fs.writeFile(trackerPath, JSON.stringify(tracker, null, 2));
    
    return tracker;
  }
}

module.exports = ImprovementSprintGenerator;
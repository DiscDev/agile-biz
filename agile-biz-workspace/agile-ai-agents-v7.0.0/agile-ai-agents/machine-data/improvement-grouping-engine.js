/**
 * Improvement Grouping Engine
 * Groups related improvements for better organization and execution
 */

class ImprovementGroupingEngine {
  constructor() {
    this.groupingStrategies = {
      component: this.groupByComponent.bind(this),
      dependency: this.groupByDependency.bind(this),
      effort: this.groupByEffort.bind(this),
      theme: this.groupByTheme.bind(this)
    };

    this.themes = {
      authentication: ['auth', 'login', 'password', '2fa', 'session', 'jwt', 'oauth'],
      database: ['query', 'index', 'migration', 'schema', 'sql', 'orm'],
      api: ['endpoint', 'rest', 'graphql', 'response', 'request', 'route'],
      frontend: ['ui', 'ux', 'component', 'style', 'css', 'react', 'vue'],
      testing: ['test', 'coverage', 'unit', 'integration', 'e2e', 'mock'],
      performance: ['optimize', 'cache', 'lazy', 'speed', 'memory', 'cpu'],
      security: ['vulnerability', 'injection', 'xss', 'csrf', 'encryption', 'sanitize']
    };
  }

  /**
   * Main grouping function that applies multiple strategies
   */
  groupImprovements(improvements) {
    const groups = [];
    const ungrouped = [...improvements];
    let groupIdCounter = 1;

    // First, find strongly related items (dependencies + same component)
    const strongGroups = this.findStronglyRelatedGroups(improvements);
    strongGroups.forEach(group => {
      if (group.items.length > 1) {
        groups.push({
          group_id: `GROUP-${groupIdCounter++}`,
          group_name: this.generateGroupName(group.items),
          description: this.generateGroupDescription(group.items),
          items: group.items.map(i => i.id),
          impact: this.calculateGroupImpact(group.items),
          effort: this.calculateGroupEffort(group.items),
          sprint_size: this.estimateSprintSize(group.items),
          rationale: group.rationale
        });

        // Remove grouped items from ungrouped list
        group.items.forEach(item => {
          const index = ungrouped.findIndex(u => u.id === item.id);
          if (index > -1) ungrouped.splice(index, 1);
        });
      }
    });

    // Then, apply thematic grouping to remaining items
    const thematicGroups = this.groupByTheme(ungrouped);
    thematicGroups.forEach(group => {
      if (group.items.length > 1) {
        groups.push({
          group_id: `GROUP-${groupIdCounter++}`,
          group_name: group.name,
          description: group.description,
          items: group.items.map(i => i.id),
          impact: this.calculateGroupImpact(group.items),
          effort: this.calculateGroupEffort(group.items),
          sprint_size: this.estimateSprintSize(group.items),
          rationale: `Thematically related ${group.theme} improvements`
        });

        // Remove from ungrouped
        group.items.forEach(item => {
          const index = ungrouped.findIndex(u => u.id === item.id);
          if (index > -1) ungrouped.splice(index, 1);
        });
      }
    });

    return {
      groups,
      standalone: ungrouped,
      metadata: {
        totalGroups: groups.length,
        totalStandalone: ungrouped.length,
        groupingStrategy: 'multi-factor'
      }
    };
  }

  /**
   * Find strongly related groups based on dependencies and components
   */
  findStronglyRelatedGroups(improvements) {
    const groups = [];
    const processed = new Set();

    improvements.forEach(improvement => {
      if (processed.has(improvement.id)) return;

      const related = this.findRelatedImprovements(improvement, improvements);
      if (related.length > 0) {
        const group = [improvement, ...related];
        group.forEach(item => processed.add(item.id));
        
        groups.push({
          items: group,
          rationale: this.determineGroupRationale(group)
        });
      }
    });

    return groups;
  }

  /**
   * Find improvements related to a given improvement
   */
  findRelatedImprovements(improvement, allImprovements) {
    const related = [];
    
    allImprovements.forEach(other => {
      if (other.id === improvement.id) return;
      
      // Check dependencies
      if (improvement.dependencies?.includes(other.id) || 
          other.dependencies?.includes(improvement.id)) {
        related.push(other);
        return;
      }

      // Check component overlap
      const componentOverlap = this.calculateComponentOverlap(
        improvement.affected_components || [],
        other.affected_components || []
      );
      
      if (componentOverlap > 0.5) {
        related.push(other);
        return;
      }

      // Check if same category and closely related
      if (improvement.category === other.category) {
        const titleSimilarity = this.calculateStringSimilarity(
          improvement.title.toLowerCase(),
          other.title.toLowerCase()
        );
        if (titleSimilarity > 0.6) {
          related.push(other);
        }
      }
    });

    return related;
  }

  /**
   * Group improvements by component
   */
  groupByComponent(improvements) {
    const componentMap = new Map();
    
    improvements.forEach(improvement => {
      const components = improvement.affected_components || [];
      components.forEach(component => {
        if (!componentMap.has(component)) {
          componentMap.set(component, []);
        }
        componentMap.get(component).push(improvement);
      });
    });

    const groups = [];
    componentMap.forEach((items, component) => {
      if (items.length > 1) {
        groups.push({
          component,
          items,
          type: 'component'
        });
      }
    });

    return groups;
  }

  /**
   * Group improvements by dependency chain
   */
  groupByDependency(improvements) {
    const chains = [];
    const processed = new Set();

    improvements.forEach(improvement => {
      if (processed.has(improvement.id)) return;
      
      const chain = this.buildDependencyChain(improvement, improvements);
      if (chain.length > 1) {
        chain.forEach(item => processed.add(item.id));
        chains.push({
          items: chain,
          type: 'dependency'
        });
      }
    });

    return chains;
  }

  /**
   * Build dependency chain for an improvement
   */
  buildDependencyChain(improvement, allImprovements) {
    const chain = [improvement];
    const added = new Set([improvement.id]);

    // Add dependencies
    if (improvement.dependencies) {
      improvement.dependencies.forEach(depId => {
        const dep = allImprovements.find(i => i.id === depId);
        if (dep && !added.has(dep.id)) {
          chain.push(dep);
          added.add(dep.id);
        }
      });
    }

    // Add items that depend on this
    allImprovements.forEach(other => {
      if (other.dependencies?.includes(improvement.id) && !added.has(other.id)) {
        chain.push(other);
        added.add(other.id);
      }
    });

    return chain;
  }

  /**
   * Group improvements by effort level
   */
  groupByEffort(improvements) {
    return {
      low: improvements.filter(i => i.effort === 'low'),
      medium: improvements.filter(i => i.effort === 'medium'),
      high: improvements.filter(i => i.effort === 'high')
    };
  }

  /**
   * Group improvements by theme
   */
  groupByTheme(improvements) {
    const themeGroups = [];

    Object.entries(this.themes).forEach(([theme, keywords]) => {
      const themeItems = improvements.filter(improvement => {
        const searchText = `${improvement.title} ${improvement.description}`.toLowerCase();
        return keywords.some(keyword => searchText.includes(keyword));
      });

      if (themeItems.length > 1) {
        themeGroups.push({
          theme,
          name: this.formatThemeName(theme),
          description: `${theme.charAt(0).toUpperCase() + theme.slice(1)} related improvements`,
          items: themeItems
        });
      }
    });

    return themeGroups;
  }

  /**
   * Generate group name based on items
   */
  generateGroupName(items) {
    // If all same category, use category name
    const categories = [...new Set(items.map(i => i.category))];
    if (categories.length === 1) {
      const categoryNames = {
        critical_security: 'Security Hardening',
        performance: 'Performance Optimization',
        technical_debt: 'Code Quality Improvement',
        features: 'Feature Enhancement',
        modernization: 'Stack Modernization',
        testing: 'Test Coverage Expansion',
        documentation: 'Documentation Update'
      };
      return categoryNames[categories[0]] || 'Related Improvements';
    }

    // If same component affected
    const components = this.findCommonComponents(items);
    if (components.length > 0) {
      return `${components[0]} Enhancement`;
    }

    // Default naming
    return `${items.length} Related Improvements`;
  }

  /**
   * Generate group description
   */
  generateGroupDescription(items) {
    const actions = items.map(i => i.title).join(', ');
    return `Grouped improvements: ${actions}`;
  }

  /**
   * Calculate group impact (highest impact in group)
   */
  calculateGroupImpact(items) {
    const impacts = items.map(i => i.impact);
    if (impacts.includes('high')) return 'high';
    if (impacts.includes('medium')) return 'medium';
    return 'low';
  }

  /**
   * Calculate group effort (sum of efforts)
   */
  calculateGroupEffort(items) {
    const totalHours = items.reduce((sum, item) => sum + (item.estimated_hours || 0), 0);
    
    if (totalHours <= 8) return 'low';
    if (totalHours <= 24) return 'medium';
    return 'high';
  }

  /**
   * Estimate sprint size for group
   */
  estimateSprintSize(items) {
    const totalHours = items.reduce((sum, item) => sum + (item.estimated_hours || 0), 0);
    const totalDays = Math.ceil(totalHours / 6); // Assuming 6 productive hours per day
    
    if (totalDays <= 2) return '2 days';
    if (totalDays <= 5) return '1 sprint';
    if (totalDays <= 10) return '2 sprints';
    return `${Math.ceil(totalDays / 5)} sprints`;
  }

  /**
   * Find common components across items
   */
  findCommonComponents(items) {
    if (items.length === 0) return [];
    
    const firstComponents = items[0].affected_components || [];
    return firstComponents.filter(component =>
      items.every(item => 
        item.affected_components?.includes(component)
      )
    );
  }

  /**
   * Calculate component overlap between two lists
   */
  calculateComponentOverlap(components1, components2) {
    if (components1.length === 0 || components2.length === 0) return 0;
    
    const set1 = new Set(components1);
    const set2 = new Set(components2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    
    return intersection.size / Math.min(set1.size, set2.size);
  }

  /**
   * Calculate string similarity (simple implementation)
   */
  calculateStringSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Levenshtein distance for string similarity
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Determine rationale for grouping
   */
  determineGroupRationale(items) {
    // Check if dependency-based
    const hasDependencies = items.some(item =>
      items.some(other => 
        item.dependencies?.includes(other.id) || 
        other.dependencies?.includes(item.id)
      )
    );
    if (hasDependencies) {
      return 'Dependencies require coordinated implementation';
    }

    // Check if component-based
    const commonComponents = this.findCommonComponents(items);
    if (commonComponents.length > 0) {
      return `All affect ${commonComponents[0]} component`;
    }

    // Check if category-based
    const categories = [...new Set(items.map(i => i.category))];
    if (categories.length === 1) {
      return `Related ${categories[0].replace('_', ' ')} improvements`;
    }

    return 'Logically related improvements';
  }

  /**
   * Format theme name for display
   */
  formatThemeName(theme) {
    const formatted = {
      authentication: 'Authentication System',
      database: 'Database Layer',
      api: 'API Infrastructure',
      frontend: 'Frontend Components',
      testing: 'Test Suite',
      performance: 'Performance Suite',
      security: 'Security Framework'
    };
    
    return formatted[theme] || theme.charAt(0).toUpperCase() + theme.slice(1);
  }
}

module.exports = ImprovementGroupingEngine;
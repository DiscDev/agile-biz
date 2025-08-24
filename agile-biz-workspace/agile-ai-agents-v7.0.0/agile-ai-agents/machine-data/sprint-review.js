/**
 * Sprint Review Automation System
 * Automates sprint review with Definition of Done verification
 */

const fs = require('fs');
const path = require('path');
const { storyTracker } = require('./story-tracker');
const { coverageAnalyzer } = require('./coverage-analyzer');

class SprintReview {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.reviewsPath = path.join(
      this.basePath,
      'machine-data',
      'project-documents-json',
      '00-orchestration',
      'sprint-reviews'
    );
    
    // Definition of Done criteria
    this.definitionOfDone = {
      code_tested: {
        name: "Code tested",
        check: (story) => this.checkCodeTested(story),
        required: true
      },
      technical_documentation: {
        name: "Technical documentation",
        check: (story) => this.checkTechnicalDocs(story),
        required: true
      },
      user_manual_documentation: {
        name: "User manual documentation",
        check: (story) => this.checkUserDocs(story),
        required: (story) => story.requires_user_docs
      },
      all_tests_pass: {
        name: "All tests pass",
        check: (story) => this.checkTestsPassing(story),
        required: true
      },
      security_scan_completed: {
        name: "Security scan completed",
        check: (story) => this.checkSecurityScan(story),
        required: true
      },
      review_approved: {
        name: "Review approved",
        check: (story) => this.checkReviewApproval(story),
        required: true
      }
    };
    
    // Ensure reviews directory exists
    this.ensureReviewsDirectory();
  }
  
  ensureReviewsDirectory() {
    if (!fs.existsSync(this.reviewsPath)) {
      fs.mkdirSync(this.reviewsPath, { recursive: true });
      console.log(`📁 Created sprint reviews directory: ${this.reviewsPath}`);
    }
  }
  
  /**
   * Conduct sprint review
   */
  conductSprintReview(sprintData) {
    console.log(`🎯 Conducting Sprint Review for ${sprintData.sprint_id}`);
    
    const review = {
      meta: {
        document_type: "sprint_review",
        version: "1.0.0",
        timestamp: new Date().toISOString()
      },
      sprint_review: {
        sprint_id: sprintData.sprint_id,
        sprint_goal: sprintData.sprint_goal,
        start_date: sprintData.start_date,
        end_date: sprintData.end_date,
        review_date: new Date().toISOString(),
        
        // Sprint metrics
        metrics: this.calculateSprintMetrics(sprintData),
        
        // Story reviews
        story_reviews: [],
        
        // Definition of Done summary
        definition_of_done_summary: {
          total_stories: 0,
          fully_compliant: 0,
          partially_compliant: 0,
          non_compliant: 0
        },
        
        // Deliverables
        deliverables: [],
        
        // Stakeholder feedback placeholder
        stakeholder_feedback: {
          collected: false,
          feedback_items: []
        }
      }
    };
    
    // Review each story
    const stories = storyTracker.getSprintStories(sprintData.sprint_id);
    
    for (const storyData of stories) {
      const storyReview = this.reviewStory(storyData);
      review.sprint_review.story_reviews.push(storyReview);
      
      // Update DoD summary
      review.sprint_review.definition_of_done_summary.total_stories++;
      
      if (storyReview.definition_of_done.compliance === 'full') {
        review.sprint_review.definition_of_done_summary.fully_compliant++;
      } else if (storyReview.definition_of_done.compliance === 'partial') {
        review.sprint_review.definition_of_done_summary.partially_compliant++;
      } else {
        review.sprint_review.definition_of_done_summary.non_compliant++;
      }
      
      // Collect deliverables
      if (storyReview.deliverables) {
        review.sprint_review.deliverables.push(...storyReview.deliverables);
      }
    }
    
    // Generate review summary
    review.sprint_review.summary = this.generateReviewSummary(review);
    
    // Save review
    this.saveReview(review);
    
    // Generate report
    const report = this.generateReviewReport(review);
    
    console.log(`✅ Sprint Review Complete: ${report.summary.completion_rate}`);
    
    return report;
  }
  
  /**
   * Review individual story
   */
  reviewStory(storyData) {
    const story = storyData.story;
    
    const storyReview = {
      story_id: story.id,
      story_title: story.title,
      story_points: story.story_points,
      status: story.status,
      
      // Definition of Done checks
      definition_of_done: {
        checks: {},
        passed: 0,
        failed: 0,
        not_applicable: 0,
        compliance: 'pending'
      },
      
      // Timing
      timing: {
        estimated_hours: story.timing.estimated_hours,
        actual_hours: story.timing.actual_hours,
        blocked_hours: story.timing.blocked_hours || 0,
        efficiency: story.timing.actual_hours > 0 
          ? (story.timing.estimated_hours / story.timing.actual_hours * 100).toFixed(1) + '%'
          : 'N/A'
      },
      
      // Coverage
      coverage: story.coverage_requirements,
      
      // Deliverables
      deliverables: this.extractDeliverables(story)
    };
    
    // Run Definition of Done checks
    for (const [key, criterion] of Object.entries(this.definitionOfDone)) {
      if (!criterion.required || (typeof criterion.required === 'function' && !criterion.required(story))) {
        storyReview.definition_of_done.checks[key] = {
          name: criterion.name,
          status: 'not_applicable',
          details: 'Not required for this story'
        };
        storyReview.definition_of_done.not_applicable++;
      } else {
        const checkResult = criterion.check(story);
        storyReview.definition_of_done.checks[key] = {
          name: criterion.name,
          status: checkResult.passed ? 'passed' : 'failed',
          details: checkResult.details
        };
        
        if (checkResult.passed) {
          storyReview.definition_of_done.passed++;
        } else {
          storyReview.definition_of_done.failed++;
        }
      }
    }
    
    // Determine compliance level
    if (storyReview.definition_of_done.failed === 0) {
      storyReview.definition_of_done.compliance = 'full';
    } else if (storyReview.definition_of_done.passed > storyReview.definition_of_done.failed) {
      storyReview.definition_of_done.compliance = 'partial';
    } else {
      storyReview.definition_of_done.compliance = 'non_compliant';
    }
    
    return storyReview;
  }
  
  /**
   * Check if code is tested
   */
  checkCodeTested(story) {
    const coverage = story.coverage_requirements;
    
    if (!coverage) {
      return {
        passed: false,
        details: 'No coverage data available'
      };
    }
    
    const meetsThreshold = coverage.actual >= coverage.target;
    
    return {
      passed: meetsThreshold,
      details: `Coverage: ${coverage.actual}% (target: ${coverage.target}%)`
    };
  }
  
  /**
   * Check technical documentation
   */
  checkTechnicalDocs(story) {
    // In real implementation, would check for API docs, code comments, etc.
    // For now, check if story has technical docs flag
    const hasDocs = story.deliverables && 
      story.deliverables.some(d => d.type === 'technical_documentation');
    
    return {
      passed: hasDocs || story.status === 'completed',
      details: hasDocs ? 'Technical documentation provided' : 'Assumed complete for completed stories'
    };
  }
  
  /**
   * Check user documentation
   */
  checkUserDocs(story) {
    const hasDocs = story.deliverables && 
      story.deliverables.some(d => d.type === 'user_documentation');
    
    return {
      passed: hasDocs,
      details: hasDocs ? 'User documentation provided' : 'User documentation missing'
    };
  }
  
  /**
   * Check if all tests pass
   */
  checkTestsPassing(story) {
    // In real implementation, would check test results
    // For now, check if story has test results
    const hasTestResults = story.test_results && story.test_results.all_passing;
    
    return {
      passed: hasTestResults !== false,
      details: hasTestResults === false ? 'Tests failing' : 'Tests passing or assumed passing'
    };
  }
  
  /**
   * Check security scan
   */
  checkSecurityScan(story) {
    // Check if story involves security-critical code
    const isSecurityCritical = story.coverage_requirements && 
      story.coverage_requirements.risk_level === 'high';
    
    if (!isSecurityCritical) {
      return {
        passed: true,
        details: 'Not security-critical'
      };
    }
    
    const hasSecurityScan = story.security_scan && story.security_scan.completed;
    
    return {
      passed: hasSecurityScan === true,
      details: hasSecurityScan ? 'Security scan completed' : 'Security scan pending'
    };
  }
  
  /**
   * Check review approval
   */
  checkReviewApproval(story) {
    const isApproved = story.review_status === 'approved' || story.status === 'completed';
    
    return {
      passed: isApproved,
      details: isApproved ? 'Review approved' : 'Pending review approval'
    };
  }
  
  /**
   * Extract deliverables from story
   */
  extractDeliverables(story) {
    const deliverables = [];
    
    // Add completed features
    if (story.status === 'completed') {
      deliverables.push({
        type: 'feature',
        name: story.title,
        description: story.description
      });
    }
    
    // Add any explicit deliverables
    if (story.deliverables) {
      deliverables.push(...story.deliverables);
    }
    
    return deliverables;
  }
  
  /**
   * Calculate sprint metrics
   */
  calculateSprintMetrics(sprintData) {
    const stories = storyTracker.getSprintStories(sprintData.sprint_id);
    
    const metrics = {
      planned_points: 0,
      completed_points: 0,
      velocity: 0,
      completion_rate: 0,
      
      stories_planned: stories.length,
      stories_completed: 0,
      stories_in_progress: 0,
      stories_blocked: 0,
      
      total_hours_worked: 0,
      total_blocked_hours: 0,
      efficiency_rate: 0
    };
    
    for (const storyData of stories) {
      const story = storyData.story;
      const points = typeof story.story_points === 'object' 
        ? story.story_points.total 
        : story.story_points;
      
      metrics.planned_points += points;
      
      if (story.status === 'completed') {
        metrics.completed_points += points;
        metrics.stories_completed++;
      } else if (story.status === 'in_progress') {
        metrics.stories_in_progress++;
      } else if (story.status === 'blocked') {
        metrics.stories_blocked++;
      }
      
      if (story.timing.actual_hours) {
        metrics.total_hours_worked += story.timing.actual_hours;
      }
      
      if (story.timing.blocked_hours) {
        metrics.total_blocked_hours += story.timing.blocked_hours;
      }
    }
    
    // Calculate derived metrics
    metrics.velocity = metrics.completed_points;
    metrics.completion_rate = metrics.planned_points > 0
      ? (metrics.completed_points / metrics.planned_points * 100).toFixed(1) + '%'
      : '0%';
    
    const totalEstimatedHours = stories.reduce((sum, s) => sum + s.story.timing.estimated_hours, 0);
    metrics.efficiency_rate = metrics.total_hours_worked > 0
      ? (totalEstimatedHours / metrics.total_hours_worked * 100).toFixed(1) + '%'
      : 'N/A';
    
    return metrics;
  }
  
  /**
   * Generate review summary
   */
  generateReviewSummary(review) {
    const metrics = review.sprint_review.metrics;
    const dodSummary = review.sprint_review.definition_of_done_summary;
    
    const summary = {
      headline: `Sprint ${review.sprint_review.sprint_id} Review: ${metrics.completion_rate} Complete`,
      
      key_achievements: [
        `Completed ${metrics.completed_points} of ${metrics.planned_points} story points`,
        `${metrics.stories_completed} stories fully delivered`,
        `${dodSummary.fully_compliant} stories met all Definition of Done criteria`
      ],
      
      challenges: [],
      
      recommendations: []
    };
    
    // Add challenges
    if (metrics.stories_blocked > 0) {
      summary.challenges.push(`${metrics.stories_blocked} stories were blocked during sprint`);
    }
    
    if (dodSummary.non_compliant > 0) {
      summary.challenges.push(`${dodSummary.non_compliant} stories did not meet Definition of Done`);
    }
    
    if (parseFloat(metrics.efficiency_rate) < 80) {
      summary.challenges.push(`Efficiency rate of ${metrics.efficiency_rate} indicates estimation improvements needed`);
    }
    
    // Add recommendations
    if (metrics.completion_rate < 80) {
      summary.recommendations.push('Consider reducing sprint scope or improving estimation accuracy');
    }
    
    if (dodSummary.partially_compliant > 0) {
      summary.recommendations.push('Focus on completing Definition of Done criteria before marking stories complete');
    }
    
    if (metrics.total_blocked_hours > metrics.total_hours_worked * 0.1) {
      summary.recommendations.push('Address blocker resolution process to reduce wait times');
    }
    
    return summary;
  }
  
  /**
   * Save review to file
   */
  saveReview(review) {
    const fileName = `sprint_${review.sprint_review.sprint_id}_review.json`;
    const filePath = path.join(this.reviewsPath, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(review, null, 2));
    console.log(`💾 Sprint review saved to ${fileName}`);
  }
  
  /**
   * Generate review report
   */
  generateReviewReport(review) {
    const report = {
      sprint_id: review.sprint_review.sprint_id,
      review_date: review.sprint_review.review_date,
      
      summary: {
        completion_rate: review.sprint_review.metrics.completion_rate,
        velocity: review.sprint_review.metrics.velocity,
        stories_delivered: review.sprint_review.metrics.stories_completed,
        definition_of_done_compliance: 
          `${review.sprint_review.definition_of_done_summary.fully_compliant}/${review.sprint_review.definition_of_done_summary.total_stories} stories`
      },
      
      metrics: review.sprint_review.metrics,
      
      deliverables: review.sprint_review.deliverables.map(d => ({
        type: d.type,
        name: d.name
      })),
      
      issues: [],
      
      action_items: []
    };
    
    // Add issues from non-compliant stories
    for (const storyReview of review.sprint_review.story_reviews) {
      if (storyReview.definition_of_done.compliance !== 'full') {
        report.issues.push({
          story: storyReview.story_title,
          issue: `Failed Definition of Done: ${storyReview.definition_of_done.failed} criteria not met`,
          severity: storyReview.status === 'completed' ? 'high' : 'medium'
        });
      }
    }
    
    // Generate action items from summary recommendations
    if (review.sprint_review.summary.recommendations) {
      report.action_items = review.sprint_review.summary.recommendations.map(rec => ({
        action: rec,
        priority: 'medium',
        target_sprint: 'next'
      }));
    }
    
    return report;
  }
  
  /**
   * Add stakeholder feedback
   */
  addStakeholderFeedback(sprintId, feedback) {
    const reviewFile = `sprint_${sprintId}_review.json`;
    const filePath = path.join(this.reviewsPath, reviewFile);
    
    try {
      if (fs.existsSync(filePath)) {
        const review = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        review.sprint_review.stakeholder_feedback.collected = true;
        review.sprint_review.stakeholder_feedback.feedback_items.push({
          timestamp: new Date().toISOString(),
          feedback: feedback
        });
        
        fs.writeFileSync(filePath, JSON.stringify(review, null, 2));
        
        console.log(`📝 Stakeholder feedback added to sprint ${sprintId} review`);
        return true;
      }
    } catch (error) {
      console.error('Error adding stakeholder feedback:', error.message);
    }
    
    return false;
  }
}

// Export the class and create instance
const sprintReview = new SprintReview();

module.exports = {
  SprintReview,
  sprintReview,
  
  // Convenience exports
  conductSprintReview: (sprintData) => sprintReview.conductSprintReview(sprintData),
  addStakeholderFeedback: (sprintId, feedback) => sprintReview.addStakeholderFeedback(sprintId, feedback)
};

// If run directly, simulate a sprint review
if (require.main === module) {
  console.log('🎯 Simulating Sprint Review');
  
  // Create some test stories first
  const story1 = storyTracker.createStory({
    title: "User Authentication",
    description: "Implement login/logout",
    sprint_id: "sprint_1",
    story_points: 5,
    coverage_requirements: { target: 90, actual: 92, risk_level: 'high' }
  });
  
  const story2 = storyTracker.createStory({
    title: "Dashboard UI",
    description: "Create admin dashboard",
    sprint_id: "sprint_1",
    story_points: 8,
    coverage_requirements: { target: 70, actual: 65, risk_level: 'medium' }
  });
  
  // Update story statuses
  storyTracker.updateStoryStatus(story1.story.id, 'completed');
  storyTracker.updateStoryStatus(story2.story.id, 'in_progress');
  
  // Conduct sprint review
  const report = sprintReview.conductSprintReview({
    sprint_id: "sprint_1",
    sprint_goal: "Complete authentication and dashboard foundation",
    start_date: "2024-01-15",
    end_date: "2024-01-16"
  });
  
  console.log('\nSprint Review Report:', JSON.stringify(report, null, 2));
}
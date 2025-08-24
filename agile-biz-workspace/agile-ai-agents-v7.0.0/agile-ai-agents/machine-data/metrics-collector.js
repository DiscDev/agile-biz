/**
 * Metrics Collector for Repository Evolution Tracking
 * Used by other agents to report metrics that feed into evolution tracking
 */

const fs = require('fs');
const path = require('path');

class MetricsCollector {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.trackerPath = path.join(projectRoot, 'machine-data', 'repository-evolution-tracker.js');
    this.lockFile = path.join(projectRoot, 'machine-data', '.metrics-lock');
  }

  /**
   * Report build metrics
   */
  reportBuildMetrics(repository, buildTime, success = true) {
    return this.updateMetrics(repository, 'build', {
      build_time: buildTime,
      build_success: success,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Report deployment metrics
   */
  reportDeploymentMetrics(repository, success, duration = null) {
    return this.updateMetrics(repository, 'deployment', {
      deployment_success: success,
      deployment_duration: duration,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Report code metrics
   */
  reportCodeMetrics(repository, linesOfCode, fileCount, complexity = null) {
    return this.updateMetrics(repository, 'code', {
      lines_of_code: linesOfCode,
      file_count: fileCount,
      complexity: complexity,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Report merge conflict
   */
  reportMergeConflict(repository, conflictFiles = [], resolutionTime = null) {
    return this.updateMetrics(repository, 'conflict', {
      merge_conflict: true,
      conflict_files: conflictFiles,
      resolution_time: resolutionTime,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Report developer friction metrics
   */
  reportDeveloperFriction(repository, type, severity, details = {}) {
    return this.updateMetrics(repository, 'friction', {
      friction_type: type,
      friction_severity: severity,
      friction_details: details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Report performance metrics
   */
  reportPerformanceMetrics(repository, testRunTime, testCoverage = null) {
    return this.updateMetrics(repository, 'performance', {
      test_run_time: testRunTime,
      test_coverage: testCoverage,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generic metric update function
   */
  updateMetrics(repository, category, metrics) {
    try {
      // Acquire lock to prevent concurrent updates
      this.acquireLock();

      const RepositoryEvolutionTracker = require(this.trackerPath);
      const tracker = new RepositoryEvolutionTracker(this.projectRoot);
      
      tracker.updateMetrics({
        repository,
        category,
        metrics
      });

      this.releaseLock();
      
      return {
        success: true,
        timestamp: new Date().toISOString(),
        repository,
        category
      };
    } catch (error) {
      this.releaseLock();
      console.error('Failed to update metrics:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        repository,
        category
      };
    }
  }

  /**
   * Bulk metric update for multiple repositories
   */
  updateBulkMetrics(metricsArray) {
    const results = [];
    
    try {
      this.acquireLock();
      
      const RepositoryEvolutionTracker = require(this.trackerPath);
      const tracker = new RepositoryEvolutionTracker(this.projectRoot);

      metricsArray.forEach(({ repository, category, metrics }) => {
        try {
          tracker.updateMetrics({ repository, category, metrics });
          results.push({
            success: true,
            repository,
            category
          });
        } catch (error) {
          results.push({
            success: false,
            repository,
            category,
            error: error.message
          });
        }
      });

      this.releaseLock();
    } catch (error) {
      this.releaseLock();
      throw error;
    }

    return results;
  }

  /**
   * Check current evolution triggers
   */
  checkEvolutionTriggers() {
    try {
      const RepositoryEvolutionTracker = require(this.trackerPath);
      const tracker = new RepositoryEvolutionTracker(this.projectRoot);
      return tracker.checkEvolutionTriggers();
    } catch (error) {
      console.error('Failed to check evolution triggers:', error);
      return [];
    }
  }

  /**
   * Get evolution recommendations
   */
  getEvolutionRecommendations() {
    try {
      const RepositoryEvolutionTracker = require(this.trackerPath);
      const tracker = new RepositoryEvolutionTracker(this.projectRoot);
      return tracker.generateEvolutionReport();
    } catch (error) {
      console.error('Failed to get evolution recommendations:', error);
      return null;
    }
  }

  /**
   * Simple file-based locking
   */
  acquireLock() {
    let attempts = 0;
    const maxAttempts = 50;
    const delay = 100;

    while (attempts < maxAttempts) {
      try {
        fs.writeFileSync(this.lockFile, process.pid.toString(), { flag: 'wx' });
        return;
      } catch (error) {
        if (error.code === 'EEXIST') {
          // Check if lock is stale
          try {
            const lockPid = fs.readFileSync(this.lockFile, 'utf8');
            const lockAge = Date.now() - fs.statSync(this.lockFile).mtime.getTime();
            
            // If lock is older than 30 seconds, assume it's stale
            if (lockAge > 30000) {
              fs.unlinkSync(this.lockFile);
              continue;
            }
          } catch (e) {
            // Lock file might have been removed, try again
          }
          
          attempts++;
          setTimeout(() => {}, delay);
        } else {
          throw error;
        }
      }
    }
    
    throw new Error('Could not acquire metrics lock after maximum attempts');
  }

  releaseLock() {
    try {
      fs.unlinkSync(this.lockFile);
    } catch (error) {
      // Lock file might already be removed
    }
  }
}

/**
 * Helper functions for common use cases
 */

// Build completion helper
function reportBuildComplete(repository, startTime, success = true) {
  const buildTime = Math.floor((Date.now() - startTime) / 1000);
  const collector = new MetricsCollector();
  return collector.reportBuildMetrics(repository, buildTime, success);
}

// Deployment helper
function reportDeployment(repository, success, duration = null) {
  const collector = new MetricsCollector();
  return collector.reportDeploymentMetrics(repository, success, duration);
}

// Code analysis helper
function reportCodeAnalysis(repository, stats) {
  const collector = new MetricsCollector();
  return collector.reportCodeMetrics(
    repository,
    stats.linesOfCode,
    stats.fileCount,
    stats.complexity
  );
}

// Test run helper
function reportTestRun(repository, startTime, coverage = null) {
  const testTime = Math.floor((Date.now() - startTime) / 1000);
  const collector = new MetricsCollector();
  return collector.reportPerformanceMetrics(repository, testTime, coverage);
}

// Developer friction helper
function reportFriction(repository, type, details) {
  const collector = new MetricsCollector();
  
  // Determine severity based on details
  let severity = 'low';
  if (type === 'build_failure' || type === 'deployment_failure') severity = 'high';
  if (type === 'merge_conflict' || type === 'dependency_issue') severity = 'medium';
  
  return collector.reportDeveloperFriction(repository, type, severity, details);
}

module.exports = {
  MetricsCollector,
  reportBuildComplete,
  reportDeployment,
  reportCodeAnalysis,
  reportTestRun,
  reportFriction
};

// CLI interface for testing
if (require.main === module) {
  const collector = new MetricsCollector();
  const command = process.argv[2];
  const repository = process.argv[3] || 'main';

  switch (command) {
    case 'test-build':
      const result = collector.reportBuildMetrics(repository, 120, true);
      console.log('Build metrics reported:', result);
      break;

    case 'test-deployment':
      const deployResult = collector.reportDeploymentMetrics(repository, true, 45);
      console.log('Deployment metrics reported:', deployResult);
      break;

    case 'check-triggers':
      const triggers = collector.checkEvolutionTriggers();
      console.log('Current triggers:', JSON.stringify(triggers, null, 2));
      break;

    case 'get-recommendations':
      const recommendations = collector.getEvolutionRecommendations();
      console.log('Evolution recommendations:', JSON.stringify(recommendations, null, 2));
      break;

    default:
      console.log('Usage: node metrics-collector.js <command> [repository]');
      console.log('Commands: test-build, test-deployment, check-triggers, get-recommendations');
  }
}
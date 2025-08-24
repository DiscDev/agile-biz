/**
 * Performance Monitor for AgileAiAgents JSON Context Optimization
 * Tracks metrics, monitors performance, and provides analytics
 */

const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      generation: {
        files_generated: 0,
        total_generation_time: 0,
        average_generation_time: 0,
        files_per_minute: 0,
        success_rate: 100,
        failed_generations: 0
      },
      queries: {
        total_queries: 0,
        cache_hits: 0,
        cache_misses: 0,
        cache_hit_rate: 0,
        average_query_time: 0,
        total_query_time: 0
      },
      context_optimization: {
        total_optimizations: 0,
        total_bytes_saved: 0,
        average_reduction_percentage: 0,
        peak_optimization: 0,
        optimizations_per_agent: {}
      },
      streaming: {
        events_streamed: 0,
        streams_created: 0,
        average_event_size: 0,
        events_per_minute: 0,
        stream_types: {}
      },
      errors: {
        total_errors: 0,
        error_rate: 0,
        errors_by_type: {},
        recent_errors: []
      },
      stories: {
        total_stories: 0,
        stories_in_progress: 0,
        stories_completed: 0,
        stories_blocked: 0,
        total_story_points: 0,
        completed_story_points: 0,
        average_cycle_time: 0,
        story_timings: {},
        blocked_time_total: 0
      },
      tasks: {
        total_tasks: 0,
        tasks_completed: 0,
        average_task_time: 0,
        task_completion_rate: 0,
        tasks_by_agent: {}
      }
    };

    this.startTime = Date.now();
    this.lastMetricsUpdate = Date.now();
    this.metricsHistory = [];
    
    // Performance thresholds
    this.thresholds = {
      generation_time: 2000,    // 2 seconds
      query_time: 100,          // 100ms
      cache_hit_rate: 80,       // 80%
      context_reduction: 70,    // 70%
      error_rate: 5             // 5%
    };

    this.basePath = path.join(__dirname, 'project-documents-json', '00-orchestration');
    this.ensureDirectories();
    
    // Auto-save metrics every 5 minutes
    setInterval(() => this.saveMetrics(), 5 * 60 * 1000);
  }

  ensureDirectories() {
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  /**
   * Record JSON generation performance
   */
  recordGeneration(agentName, generationTime, success = true, fileSize = 0) {
    this.metrics.generation.files_generated++;
    
    if (success) {
      this.metrics.generation.total_generation_time += generationTime;
      this.metrics.generation.average_generation_time = 
        this.metrics.generation.total_generation_time / this.metrics.generation.files_generated;
    } else {
      this.metrics.generation.failed_generations++;
    }

    this.metrics.generation.success_rate = 
      ((this.metrics.generation.files_generated - this.metrics.generation.failed_generations) / 
       this.metrics.generation.files_generated) * 100;

    // Calculate files per minute
    const elapsedMinutes = (Date.now() - this.startTime) / (1000 * 60);
    this.metrics.generation.files_per_minute = this.metrics.generation.files_generated / elapsedMinutes;

    // Check thresholds
    if (generationTime > this.thresholds.generation_time) {
      this.recordAlert('generation_slow', {
        agent: agentName,
        generation_time: generationTime,
        threshold: this.thresholds.generation_time
      });
    }

    this.updateMetricsTimestamp();
  }

  /**
   * Record query performance
   */
  recordQuery(queryPath, queryTime, cacheHit = false, contextReduction = 0) {
    this.metrics.queries.total_queries++;
    this.metrics.queries.total_query_time += queryTime;
    this.metrics.queries.average_query_time = 
      this.metrics.queries.total_query_time / this.metrics.queries.total_queries;

    if (cacheHit) {
      this.metrics.queries.cache_hits++;
    } else {
      this.metrics.queries.cache_misses++;
    }

    this.metrics.queries.cache_hit_rate = 
      (this.metrics.queries.cache_hits / this.metrics.queries.total_queries) * 100;

    // Record context optimization if applicable
    if (contextReduction > 0) {
      this.recordContextOptimization(queryPath, contextReduction);
    }

    // Check thresholds
    if (queryTime > this.thresholds.query_time) {
      this.recordAlert('query_slow', {
        query_path: queryPath,
        query_time: queryTime,
        threshold: this.thresholds.query_time
      });
    }

    if (this.metrics.queries.cache_hit_rate < this.thresholds.cache_hit_rate && 
        this.metrics.queries.total_queries > 50) {
      this.recordAlert('low_cache_hit_rate', {
        cache_hit_rate: this.metrics.queries.cache_hit_rate,
        threshold: this.thresholds.cache_hit_rate
      });
    }

    this.updateMetricsTimestamp();
  }

  /**
   * Record context optimization performance
   */
  recordContextOptimization(source, reductionPercentage, bytesSaved = 0, agentName = null) {
    this.metrics.context_optimization.total_optimizations++;
    this.metrics.context_optimization.total_bytes_saved += bytesSaved;
    
    // Update average reduction percentage
    const currentTotal = this.metrics.context_optimization.average_reduction_percentage * 
                        (this.metrics.context_optimization.total_optimizations - 1);
    this.metrics.context_optimization.average_reduction_percentage = 
      (currentTotal + reductionPercentage) / this.metrics.context_optimization.total_optimizations;

    // Track peak optimization
    if (reductionPercentage > this.metrics.context_optimization.peak_optimization) {
      this.metrics.context_optimization.peak_optimization = reductionPercentage;
    }

    // Track per-agent optimization
    if (agentName) {
      if (!this.metrics.context_optimization.optimizations_per_agent[agentName]) {
        this.metrics.context_optimization.optimizations_per_agent[agentName] = {
          count: 0,
          total_reduction: 0,
          average_reduction: 0,
          bytes_saved: 0
        };
      }
      
      const agentStats = this.metrics.context_optimization.optimizations_per_agent[agentName];
      agentStats.count++;
      agentStats.total_reduction += reductionPercentage;
      agentStats.average_reduction = agentStats.total_reduction / agentStats.count;
      agentStats.bytes_saved += bytesSaved;
    }

    // Check thresholds
    if (reductionPercentage < this.thresholds.context_reduction) {
      this.recordAlert('low_context_reduction', {
        source: source,
        reduction_percentage: reductionPercentage,
        threshold: this.thresholds.context_reduction,
        agent: agentName
      });
    }

    this.updateMetricsTimestamp();
  }

  /**
   * Record streaming performance
   */
  recordStreaming(eventType, eventSize, streamType = 'general') {
    this.metrics.streaming.events_streamed++;
    
    if (!this.metrics.streaming.stream_types[streamType]) {
      this.metrics.streaming.stream_types[streamType] = {
        count: 0,
        total_size: 0,
        average_size: 0
      };
    }

    const typeStats = this.metrics.streaming.stream_types[streamType];
    typeStats.count++;
    typeStats.total_size += eventSize;
    typeStats.average_size = typeStats.total_size / typeStats.count;

    // Update overall average
    const totalSize = Object.values(this.metrics.streaming.stream_types)
      .reduce((sum, type) => sum + type.total_size, 0);
    this.metrics.streaming.average_event_size = totalSize / this.metrics.streaming.events_streamed;

    // Calculate events per minute
    const elapsedMinutes = (Date.now() - this.startTime) / (1000 * 60);
    this.metrics.streaming.events_per_minute = this.metrics.streaming.events_streamed / elapsedMinutes;

    this.updateMetricsTimestamp();
  }

  /**
   * Record error
   */
  recordError(errorType, errorMessage, context = {}) {
    this.metrics.errors.total_errors++;
    
    if (!this.metrics.errors.errors_by_type[errorType]) {
      this.metrics.errors.errors_by_type[errorType] = 0;
    }
    this.metrics.errors.errors_by_type[errorType]++;

    // Calculate error rate
    const totalOperations = this.metrics.generation.files_generated + 
                           this.metrics.queries.total_queries + 
                           this.metrics.streaming.events_streamed;
    this.metrics.errors.error_rate = (this.metrics.errors.total_errors / totalOperations) * 100;

    // Add to recent errors (keep last 10)
    this.metrics.errors.recent_errors.unshift({
      type: errorType,
      message: errorMessage,
      context: context,
      timestamp: new Date().toISOString()
    });
    
    if (this.metrics.errors.recent_errors.length > 10) {
      this.metrics.errors.recent_errors.pop();
    }

    // Check error rate threshold
    if (this.metrics.errors.error_rate > this.thresholds.error_rate && totalOperations > 20) {
      this.recordAlert('high_error_rate', {
        error_rate: this.metrics.errors.error_rate,
        threshold: this.thresholds.error_rate,
        recent_error: errorType
      });
    }

    this.updateMetricsTimestamp();
  }

  /**
   * Record performance alert
   */
  recordAlert(alertType, details) {
    const alert = {
      type: alertType,
      details: details,
      timestamp: new Date().toISOString(),
      severity: this.getAlertSeverity(alertType)
    };

    console.warn(`⚠️ Performance Alert [${alert.severity}]: ${alertType}`, details);
    
    // Could integrate with streaming infrastructure here
    // streaming.streamAlert('performance_monitor', alert.severity, alert);
  }

  /**
   * Get alert severity based on type
   */
  getAlertSeverity(alertType) {
    const severityMap = {
      generation_slow: 'medium',
      query_slow: 'low',
      low_cache_hit_rate: 'medium',
      low_context_reduction: 'medium',
      high_error_rate: 'high'
    };
    
    return severityMap[alertType] || 'low';
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const uptimeMinutes = (Date.now() - this.startTime) / (1000 * 60);
    
    return {
      uptime_minutes: Math.round(uptimeMinutes),
      overall_health: this.calculateOverallHealth(),
      key_metrics: {
        files_generated: this.metrics.generation.files_generated,
        generation_success_rate: `${this.metrics.generation.success_rate.toFixed(1)}%`,
        average_generation_time: `${this.metrics.generation.average_generation_time.toFixed(0)}ms`,
        query_cache_hit_rate: `${this.metrics.queries.cache_hit_rate.toFixed(1)}%`,
        average_query_time: `${this.metrics.queries.average_query_time.toFixed(0)}ms`,
        context_reduction: `${this.metrics.context_optimization.average_reduction_percentage.toFixed(1)}%`,
        total_bytes_saved: this.formatBytes(this.metrics.context_optimization.total_bytes_saved),
        events_streamed: this.metrics.streaming.events_streamed,
        error_rate: `${this.metrics.errors.error_rate.toFixed(2)}%`
      },
      thresholds_status: this.checkThresholds()
    };
  }

  /**
   * Calculate overall system health score
   */
  calculateOverallHealth() {
    let score = 100;
    
    // Deduct points for threshold violations
    if (this.metrics.generation.average_generation_time > this.thresholds.generation_time) score -= 15;
    if (this.metrics.queries.cache_hit_rate < this.thresholds.cache_hit_rate) score -= 20;
    if (this.metrics.queries.average_query_time > this.thresholds.query_time) score -= 10;
    if (this.metrics.context_optimization.average_reduction_percentage < this.thresholds.context_reduction) score -= 25;
    if (this.metrics.errors.error_rate > this.thresholds.error_rate) score -= 30;

    score = Math.max(0, score);
    
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 40) return 'poor';
    return 'critical';
  }

  /**
   * Check all thresholds
   */
  checkThresholds() {
    return {
      generation_time: this.metrics.generation.average_generation_time <= this.thresholds.generation_time,
      query_time: this.metrics.queries.average_query_time <= this.thresholds.query_time,
      cache_hit_rate: this.metrics.queries.cache_hit_rate >= this.thresholds.cache_hit_rate,
      context_reduction: this.metrics.context_optimization.average_reduction_percentage >= this.thresholds.context_reduction,
      error_rate: this.metrics.errors.error_rate <= this.thresholds.error_rate
    };
  }

  /**
   * Get detailed metrics
   */
  getDetailedMetrics() {
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime,
      last_updated: this.lastMetricsUpdate,
      performance_summary: this.getPerformanceSummary()
    };
  }

  /**
   * Save metrics to centralized metrics file
   */
  saveMetrics() {
    const metricsData = {
      meta: {
        document_type: "performance_metrics",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        monitoring_system: "json_context_optimization"
      },
      summary: "Real-time performance metrics for AgileAiAgents JSON Context Optimization system",
      system_health: {
        overall_status: this.calculateOverallHealth(),
        uptime_minutes: Math.round((Date.now() - this.startTime) / (1000 * 60)),
        health_score: this.calculateHealthScore(),
        last_updated: new Date().toISOString()
      },
      metrics: this.getDetailedMetrics(),
      thresholds: this.thresholds,
      performance_targets: {
        context_reduction_goal: "80-90%",
        query_response_time: "< 100ms",
        cache_hit_rate_target: "> 80%",
        generation_success_rate: "> 95%",
        system_availability: "> 99%"
      }
    };

    const filePath = path.join(this.basePath, 'metrics.json');
    
    try {
      fs.writeFileSync(filePath, JSON.stringify(metricsData, null, 2));
      
      // Also save to history
      this.metricsHistory.push({
        timestamp: metricsData.timestamp,
        summary: this.getPerformanceSummary()
      });
      
      // Keep only last 100 history entries
      if (this.metricsHistory.length > 100) {
        this.metricsHistory.shift();
      }
      
      console.log('💾 Performance metrics saved to centralized metrics.json');
      
      // Stream metrics update if streaming infrastructure is available
      this.streamMetricsUpdate(metricsData);
      
    } catch (error) {
      console.error('Error saving metrics:', error.message);
      this.recordError('metrics_save_failed', error.message);
    }
  }

  /**
   * Load saved metrics
   */
  loadMetrics() {
    const filePath = path.join(this.basePath, 'performance-metrics.json');
    
    try {
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        this.metrics = data.metrics;
        console.log('📖 Performance metrics loaded from', filePath);
        return true;
      }
    } catch (error) {
      console.error('Error loading metrics:', error.message);
      this.recordError('metrics_load_failed', error.message);
    }
    
    return false;
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      generation: { files_generated: 0, total_generation_time: 0, average_generation_time: 0, files_per_minute: 0, success_rate: 100, failed_generations: 0 },
      queries: { total_queries: 0, cache_hits: 0, cache_misses: 0, cache_hit_rate: 0, average_query_time: 0, total_query_time: 0 },
      context_optimization: { total_optimizations: 0, total_bytes_saved: 0, average_reduction_percentage: 0, peak_optimization: 0, optimizations_per_agent: {} },
      streaming: { events_streamed: 0, streams_created: 0, average_event_size: 0, events_per_minute: 0, stream_types: {} },
      errors: { total_errors: 0, error_rate: 0, errors_by_type: {}, recent_errors: [] },
      stories: { total_stories: 0, stories_in_progress: 0, stories_completed: 0, stories_blocked: 0, total_story_points: 0, completed_story_points: 0, average_cycle_time: 0, story_timings: {}, blocked_time_total: 0 },
      tasks: { total_tasks: 0, tasks_completed: 0, average_task_time: 0, task_completion_rate: 0, tasks_by_agent: {} }
    };
    
    this.startTime = Date.now();
    this.lastMetricsUpdate = Date.now();
    this.metricsHistory = [];
    
    console.log('🔄 Performance metrics reset');
  }

  /**
   * Update metrics timestamp
   */
  updateMetricsTimestamp() {
    this.lastMetricsUpdate = Date.now();
  }

  /**
   * Calculate numeric health score (0-100)
   */
  calculateHealthScore() {
    let score = 100;
    
    // Deduct points for threshold violations
    if (this.metrics.generation.average_generation_time > this.thresholds.generation_time) score -= 15;
    if (this.metrics.queries.cache_hit_rate < this.thresholds.cache_hit_rate) score -= 20;
    if (this.metrics.queries.average_query_time > this.thresholds.query_time) score -= 10;
    if (this.metrics.context_optimization.average_reduction_percentage < this.thresholds.context_reduction) score -= 25;
    if (this.metrics.errors.error_rate > this.thresholds.error_rate) score -= 30;

    return Math.max(0, score);
  }

  /**
   * Stream metrics update to other agents
   */
  streamMetricsUpdate(metricsData) {
    try {
      // Try to use streaming infrastructure if available
      const streamingPath = path.join(__dirname, 'streaming-infrastructure.js');
      
      if (fs.existsSync(streamingPath)) {
        const { StreamingInfrastructure } = require('./streaming-infrastructure');
        const streaming = new StreamingInfrastructure();
        
        // Stream performance metrics event
        streaming.streamPerformanceMetric('performance_monitor', 'system_health', {
          health_status: metricsData.system_health.overall_status,
          health_score: metricsData.system_health.health_score,
          uptime_minutes: metricsData.system_health.uptime_minutes,
          key_metrics: metricsData.metrics,
          threshold_violations: this.getThresholdViolations()
        });
        
        console.log('📡 Metrics streamed to system');
      }
    } catch (error) {
      // Silently fail if streaming is not available
      console.log('💡 Streaming infrastructure not available for metrics update');
    }
  }

  /**
   * Get current threshold violations
   */
  getThresholdViolations() {
    const violations = [];
    
    if (this.metrics.generation.average_generation_time > this.thresholds.generation_time) {
      violations.push({
        type: 'generation_time',
        current: this.metrics.generation.average_generation_time,
        threshold: this.thresholds.generation_time
      });
    }
    
    if (this.metrics.queries.cache_hit_rate < this.thresholds.cache_hit_rate && this.metrics.queries.total_queries > 50) {
      violations.push({
        type: 'cache_hit_rate',
        current: this.metrics.queries.cache_hit_rate,
        threshold: this.thresholds.cache_hit_rate
      });
    }
    
    if (this.metrics.queries.average_query_time > this.thresholds.query_time) {
      violations.push({
        type: 'query_time',
        current: this.metrics.queries.average_query_time,
        threshold: this.thresholds.query_time
      });
    }
    
    if (this.metrics.context_optimization.average_reduction_percentage < this.thresholds.context_reduction) {
      violations.push({
        type: 'context_reduction',
        current: this.metrics.context_optimization.average_reduction_percentage,
        threshold: this.thresholds.context_reduction
      });
    }
    
    if (this.metrics.errors.error_rate > this.thresholds.error_rate) {
      violations.push({
        type: 'error_rate',
        current: this.metrics.errors.error_rate,
        threshold: this.thresholds.error_rate
      });
    }
    
    return violations;
  }

  /**
   * Format bytes for display
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Record story start
   */
  recordStoryStart(storyId, storyPoints) {
    this.metrics.stories.total_stories++;
    this.metrics.stories.stories_in_progress++;
    this.metrics.stories.total_story_points += (typeof storyPoints === 'object' ? storyPoints.total : storyPoints);
    
    this.metrics.stories.story_timings[storyId] = {
      start_time: Date.now(),
      story_points: storyPoints,
      status: 'in_progress'
    };
    
    console.log(`📖 Story ${storyId} started (${typeof storyPoints === 'object' ? storyPoints.total : storyPoints} points)`);
  }

  /**
   * Record story completion
   */
  recordStoryComplete(storyId) {
    const storyTiming = this.metrics.stories.story_timings[storyId];
    
    if (!storyTiming) {
      console.error(`Story ${storyId} not found in timings`);
      return;
    }
    
    const duration = Date.now() - storyTiming.start_time;
    storyTiming.end_time = Date.now();
    storyTiming.duration = duration;
    storyTiming.status = 'completed';
    
    this.metrics.stories.stories_in_progress--;
    this.metrics.stories.stories_completed++;
    this.metrics.stories.completed_story_points += (
      typeof storyTiming.story_points === 'object' 
        ? storyTiming.story_points.total 
        : storyTiming.story_points
    );
    
    // Update average cycle time
    const completedStories = Object.values(this.metrics.stories.story_timings)
      .filter(s => s.status === 'completed');
    
    const totalDuration = completedStories.reduce((sum, s) => sum + s.duration, 0);
    this.metrics.stories.average_cycle_time = totalDuration / completedStories.length;
    
    console.log(`✅ Story ${storyId} completed in ${this.formatDuration(duration)}`);
  }

  /**
   * Record story blocked time
   */
  recordStoryBlocked(storyId, blockedDuration, reason) {
    const storyTiming = this.metrics.stories.story_timings[storyId];
    
    if (!storyTiming) {
      console.error(`Story ${storyId} not found in timings`);
      return;
    }
    
    if (!storyTiming.blocked_time) {
      storyTiming.blocked_time = 0;
    }
    
    storyTiming.blocked_time += blockedDuration;
    storyTiming.blocked_reasons = storyTiming.blocked_reasons || [];
    storyTiming.blocked_reasons.push({
      duration: blockedDuration,
      reason: reason,
      timestamp: new Date().toISOString()
    });
    
    this.metrics.stories.blocked_time_total += blockedDuration;
    
    if (storyTiming.status === 'in_progress') {
      this.metrics.stories.stories_blocked++;
      storyTiming.status = 'blocked';
    }
    
    console.log(`⏸️ Story ${storyId} blocked for ${this.formatDuration(blockedDuration)}: ${reason}`);
  }

  /**
   * Record story unblocked
   */
  recordStoryUnblocked(storyId) {
    const storyTiming = this.metrics.stories.story_timings[storyId];
    
    if (!storyTiming || storyTiming.status !== 'blocked') {
      return;
    }
    
    storyTiming.status = 'in_progress';
    this.metrics.stories.stories_blocked--;
    
    console.log(`▶️ Story ${storyId} unblocked and resumed`);
  }

  /**
   * Record task completion
   */
  recordTaskComplete(taskId, agentName, duration) {
    this.metrics.tasks.total_tasks++;
    this.metrics.tasks.tasks_completed++;
    
    // Update average task time
    const currentAvg = this.metrics.tasks.average_task_time;
    const totalCompleted = this.metrics.tasks.tasks_completed;
    this.metrics.tasks.average_task_time = 
      (currentAvg * (totalCompleted - 1) + duration) / totalCompleted;
    
    // Update completion rate
    this.metrics.tasks.task_completion_rate = 
      (this.metrics.tasks.tasks_completed / this.metrics.tasks.total_tasks) * 100;
    
    // Track by agent
    if (!this.metrics.tasks.tasks_by_agent[agentName]) {
      this.metrics.tasks.tasks_by_agent[agentName] = {
        completed: 0,
        total_time: 0,
        average_time: 0
      };
    }
    
    const agentTasks = this.metrics.tasks.tasks_by_agent[agentName];
    agentTasks.completed++;
    agentTasks.total_time += duration;
    agentTasks.average_time = agentTasks.total_time / agentTasks.completed;
    
    console.log(`✓ Task ${taskId} completed by ${agentName} in ${this.formatDuration(duration)}`);
  }

  /**
   * Get story metrics summary
   */
  getStoryMetrics() {
    return {
      total_stories: this.metrics.stories.total_stories,
      in_progress: this.metrics.stories.stories_in_progress,
      completed: this.metrics.stories.stories_completed,
      blocked: this.metrics.stories.stories_blocked,
      completion_rate: this.metrics.stories.total_stories > 0 
        ? (this.metrics.stories.stories_completed / this.metrics.stories.total_stories * 100).toFixed(1) + '%'
        : '0%',
      velocity: {
        total_points: this.metrics.stories.total_story_points,
        completed_points: this.metrics.stories.completed_story_points,
        percentage: this.metrics.stories.total_story_points > 0
          ? (this.metrics.stories.completed_story_points / this.metrics.stories.total_story_points * 100).toFixed(1) + '%'
          : '0%'
      },
      average_cycle_time: this.formatDuration(this.metrics.stories.average_cycle_time),
      total_blocked_time: this.formatDuration(this.metrics.stories.blocked_time_total)
    };
  }

  /**
   * Get task metrics by agent
   */
  getTaskMetricsByAgent() {
    const agentMetrics = {};
    
    for (const [agent, data] of Object.entries(this.metrics.tasks.tasks_by_agent)) {
      agentMetrics[agent] = {
        tasks_completed: data.completed,
        average_time: this.formatDuration(data.average_time),
        total_time: this.formatDuration(data.total_time),
        efficiency_score: this.calculateAgentEfficiency(agent, data)
      };
    }
    
    return agentMetrics;
  }

  /**
   * Calculate agent efficiency score
   */
  calculateAgentEfficiency(agentName, taskData) {
    // Base efficiency on completion rate and speed relative to average
    const avgTaskTime = this.metrics.tasks.average_task_time;
    const agentAvgTime = taskData.average_time;
    
    if (avgTaskTime === 0 || agentAvgTime === 0) return 100;
    
    // Faster than average = higher score
    const speedScore = (avgTaskTime / agentAvgTime) * 100;
    
    // Cap at reasonable bounds
    return Math.min(150, Math.max(50, speedScore));
  }

  /**
   * Format duration for display
   */
  formatDuration(milliseconds) {
    if (milliseconds < 1000) return `${milliseconds}ms`;
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}

// Export the class and create a default instance
const performanceMonitor = new PerformanceMonitor();

module.exports = {
  PerformanceMonitor,
  monitor: performanceMonitor
};
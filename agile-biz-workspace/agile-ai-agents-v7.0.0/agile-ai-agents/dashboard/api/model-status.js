/**
 * Dashboard API endpoint for multi-model status
 */

const fs = require('fs').promises;
const path = require('path');

// Import multi-LLM modules
const ServiceDetector = require('../../machine-data/service-detector');
const FallbackManager = require('../../machine-data/fallback-manager');

let detector = null;
let manager = null;

// Initialize on first request
async function initialize() {
  if (!detector) {
    detector = new ServiceDetector();
    await detector.detectServices();
  }
  
  if (!manager) {
    manager = new FallbackManager();
    await manager.initialize();
  }
}

module.exports = async (req, res) => {
  try {
    await initialize();
    
    // Get current status
    const services = detector.getServiceStatus();
    const health = manager.getAllServiceHealth();
    const costStatus = manager.getCostStatus();
    const stats = manager.getStatistics();
    
    // Read model status file if exists
    const statusFile = path.join(__dirname, '../../machine-data/model-status.json');
    let modelStatus = {};
    
    try {
      const data = await fs.readFile(statusFile, 'utf8');
      modelStatus = JSON.parse(data);
    } catch (e) {
      // File may not exist yet
    }
    
    // Read recent activity from state
    const stateFile = path.join(__dirname, '../../project-state/current-state.json');
    let recentActivity = [];
    
    try {
      const stateData = await fs.readFile(stateFile, 'utf8');
      const state = JSON.parse(stateData);
      recentActivity = state.model_activity || [];
    } catch (e) {
      // State file may not exist
    }
    
    // Combine all data
    const response = {
      strategy: detector.strategy || 'claude-native',
      models_active: Object.values(services).filter(s => s === true).length,
      services: {},
      performance: {
        speed: modelStatus.performance?.speed || '1x',
        success_rate: stats.healthyServices / (stats.services || 1) * 100,
        fallback_rate: modelStatus.fallback_rate || 0,
        avg_response: modelStatus.avg_response || '1.2',
        total_requests: modelStatus.total_requests || 0
      },
      cost: {
        session: costStatus.current.session,
        session_limit: costStatus.limits.session,
        hourly: costStatus.current.hourly,
        hourly_limit: costStatus.limits.hourly,
        savings: modelStatus.cost_savings || 0,
        breakdown: modelStatus.cost_breakdown || {}
      },
      health: health,
      recent_activity: recentActivity.slice(0, 10)
    };
    
    // Add service details
    for (const [name, active] of Object.entries(services)) {
      const healthInfo = health.find(h => h.name === name) || {};
      response.services[name] = {
        active,
        status: healthInfo.status || (active ? 'healthy' : 'offline'),
        uptime: healthInfo.uptime || '100%',
        required: name === 'claude'
      };
    }
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching model status:', error);
    res.status(500).json({ 
      error: 'Failed to fetch model status',
      message: error.message 
    });
  }
};
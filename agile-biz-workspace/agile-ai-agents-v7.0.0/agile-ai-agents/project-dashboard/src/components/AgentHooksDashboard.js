/**
 * Agent Hooks Dashboard Component
 * Provides UI for configuring and monitoring agent-specific hooks
 */

import React, { useState, useEffect } from 'react';
import './AgentHooksDashboard.css';

const AgentHooksDashboard = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [hookConfig, setHookConfig] = useState({});
  const [performanceData, setPerformanceData] = useState({});
  const [selectedProfile, setSelectedProfile] = useState('standard');
  const [performanceBudget, setPerformanceBudget] = useState({ used: 0, total: 1000 });

  useEffect(() => {
    loadAgentData();
    loadHookConfiguration();
    startPerformanceMonitoring();
  }, []);

  const loadAgentData = async () => {
    try {
      const response = await fetch('/api/agents');
      const data = await response.json();
      setAgents(data.agents);
      if (data.agents.length > 0) {
        setSelectedAgent(data.agents[0].name);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const loadHookConfiguration = async () => {
    try {
      const response = await fetch('/api/hooks/config');
      const data = await response.json();
      setHookConfig(data);
      setSelectedProfile(data.currentProfile || 'standard');
    } catch (error) {
      console.error('Failed to load hook configuration:', error);
    }
  };

  const startPerformanceMonitoring = () => {
    const ws = new WebSocket('ws://localhost:3001/hooks/performance');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPerformanceData(prevData => ({
        ...prevData,
        [data.agent]: data.metrics
      }));
      updatePerformanceBudget(data);
    };

    return () => ws.close();
  };

  const updatePerformanceBudget = (data) => {
    const totalUsed = Object.values(data.activeHooks || {})
      .reduce((sum, hook) => sum + (hook.avgTime || 0), 0);
    
    setPerformanceBudget({
      used: totalUsed,
      total: 1000,
      percentage: (totalUsed / 1000) * 100
    });
  };

  const toggleHook = async (hookName, category) => {
    try {
      const response = await fetch('/api/hooks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: selectedAgent,
          hook: hookName,
          category,
          enabled: !isHookEnabled(hookName, category)
        })
      });
      
      if (response.ok) {
        loadHookConfiguration();
      }
    } catch (error) {
      console.error('Failed to toggle hook:', error);
    }
  };

  const isHookEnabled = (hookName, category) => {
    const agentConfig = hookConfig.agent_defaults?.[selectedAgent];
    if (!agentConfig) return false;
    
    const categoryHooks = agentConfig.overrides?.[category] || [];
    return categoryHooks.includes('all') || categoryHooks.includes(hookName);
  };

  const changeProfile = async (profile) => {
    try {
      const response = await fetch('/api/hooks/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: selectedAgent,
          profile
        })
      });
      
      if (response.ok) {
        setSelectedProfile(profile);
        loadHookConfiguration();
      }
    } catch (error) {
      console.error('Failed to change profile:', error);
    }
  };

  const getPerformanceClass = (time) => {
    if (time < 50) return 'excellent';
    if (time < 100) return 'good';
    if (time < 200) return 'fair';
    if (time < 500) return 'poor';
    return 'critical';
  };

  const renderHookCategory = (category, hooks) => {
    const categoryConfig = {
      critical: { icon: '🚨', description: 'Essential security and quality gates' },
      valuable: { icon: '⭐', description: 'High-value development support' },
      enhancement: { icon: '✨', description: 'Code quality improvements' },
      specialized: { icon: '🔬', description: 'Domain-specific validations' }
    };

    const config = categoryConfig[category];
    const agentPerf = performanceData[selectedAgent] || {};

    return (
      <div key={category} className={`hook-category ${category}`}>
        <div className="category-header">
          <h3>
            <span className="category-icon">{config.icon}</span>
            {category.charAt(0).toUpperCase() + category.slice(1)} Hooks
          </h3>
          <p className="category-description">{config.description}</p>
        </div>
        
        <div className="hooks-list">
          {hooks.map(hook => {
            const enabled = isHookEnabled(hook.name, category);
            const performance = agentPerf[hook.name];
            
            return (
              <div key={hook.name} className={`hook-item ${enabled ? 'enabled' : 'disabled'}`}>
                <div className="hook-main">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => toggleHook(hook.name, category)}
                    disabled={category === 'critical'}
                  />
                  <div className="hook-info">
                    <h4>{hook.displayName}</h4>
                    <p>{hook.description}</p>
                  </div>
                </div>
                
                {enabled && performance && (
                  <div className="hook-performance">
                    <span className={`performance-badge ${getPerformanceClass(performance.avgTime)}`}>
                      {performance.avgTime}ms avg
                    </span>
                    <span className="execution-count">
                      {performance.executions} runs
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPerformanceSummary = () => {
    const agentPerf = performanceData[selectedAgent];
    if (!agentPerf) return null;

    const topSlowHooks = Object.entries(agentPerf)
      .sort((a, b) => b[1].avgTime - a[1].avgTime)
      .slice(0, 3);

    return (
      <div className="performance-summary">
        <h3>Performance Summary</h3>
        
        <div className="performance-metrics">
          <div className="metric">
            <span className="metric-label">Total Hook Time</span>
            <span className="metric-value">{performanceBudget.used}ms</span>
          </div>
          <div className="metric">
            <span className="metric-label">Performance Score</span>
            <span className={`metric-value score-${getPerformanceClass(performanceBudget.used)}`}>
              {Math.max(0, 100 - Math.floor(performanceBudget.percentage))}
            </span>
          </div>
        </div>

        {topSlowHooks.length > 0 && (
          <div className="slow-hooks">
            <h4>Top Performance Impact</h4>
            {topSlowHooks.map(([name, data]) => (
              <div key={name} className="slow-hook-item">
                <span className="hook-name">{name}</span>
                <span className={`hook-time ${getPerformanceClass(data.avgTime)}`}>
                  {data.avgTime}ms
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const hooks = {
    critical: [
      { name: 'vulnerability-scanner', displayName: 'Vulnerability Scanner', description: 'Scans for security vulnerabilities' },
      { name: 'defensive-patterns', displayName: 'Defensive Patterns', description: 'Enforces defensive programming' },
      { name: 'coverage-gatekeeper', displayName: 'Coverage Gatekeeper', description: 'Maintains test coverage' },
      { name: 'secret-rotation-reminder', displayName: 'Secret Rotation', description: 'Tracks secret expiration' },
      { name: 'deployment-window-enforcer', displayName: 'Deployment Windows', description: 'Enforces deployment schedules' }
    ],
    valuable: [
      { name: 'import-validator', displayName: 'Import Validator', description: 'Validates imports and dependencies' },
      { name: 'test-categorizer', displayName: 'Test Categorizer', description: 'Organizes test structure' },
      { name: 'error-boundary-enforcer', displayName: 'Error Boundaries', description: 'Ensures error handling' },
      { name: 'api-contract-validator', displayName: 'API Contracts', description: 'Validates API schemas' }
    ],
    enhancement: [
      { name: 'code-complexity', displayName: 'Code Complexity', description: 'Monitors complexity metrics' },
      { name: 'naming-conventions', displayName: 'Naming Conventions', description: 'Enforces naming standards' },
      { name: 'bundle-size-monitor', displayName: 'Bundle Size', description: 'Tracks build size' }
    ],
    specialized: [
      { name: 'gdpr-compliance-checker', displayName: 'GDPR Compliance', description: 'Privacy regulation checks' },
      { name: 'ml-model-validator', displayName: 'ML Validator', description: 'Machine learning validation' }
    ]
  };

  return (
    <div className="agent-hooks-dashboard">
      <div className="dashboard-header">
        <h2>Agent Hook Configuration</h2>
        
        <div className="header-controls">
          <div className="agent-selector">
            <label>Active Agent:</label>
            <select 
              value={selectedAgent || ''} 
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              {agents.map(agent => (
                <option key={agent.name} value={agent.name}>
                  {agent.displayName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="profile-selector">
            <label>Profile:</label>
            <select value={selectedProfile} onChange={(e) => changeProfile(e.target.value)}>
              <option value="minimal">Minimal (Fastest)</option>
              <option value="standard">Standard (Balanced)</option>
              <option value="advanced">Advanced (Comprehensive)</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
      </div>

      <div className="performance-budget">
        <h3>Performance Budget</h3>
        <div className="budget-meter">
          <div 
            className={`budget-used ${getPerformanceClass(performanceBudget.used)}`}
            style={{ width: `${Math.min(100, performanceBudget.percentage)}%` }}
          >
            {performanceBudget.used}ms used
          </div>
          <div className="budget-available">
            {Math.max(0, performanceBudget.total - performanceBudget.used)}ms available
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="hooks-configuration">
          {Object.entries(hooks).map(([category, categoryHooks]) => 
            renderHookCategory(category, categoryHooks)
          )}
        </div>
        
        <div className="dashboard-sidebar">
          {renderPerformanceSummary()}
          
          <div className="recommendations">
            <h3>Recommendations</h3>
            <ul>
              <li>Consider disabling 'code-complexity' hook (avg: 850ms)</li>
              <li>Enable 'import-validator' for better dependency management</li>
              <li>Performance budget allows 2 more enhancement hooks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentHooksDashboard;
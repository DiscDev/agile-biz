import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Settings, Activity, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

const HookConfiguration = () => {
  const [config, setConfig] = useState(null);
  const [registry, setRegistry] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    loadConfiguration();
    loadRegistry();
    loadPerformance();
  }, []);

  const loadConfiguration = async () => {
    try {
      const response = await fetch('/api/hooks/config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Failed to load hook configuration:', error);
    }
  };

  const loadRegistry = async () => {
    try {
      const response = await fetch('/api/hooks/registry');
      const data = await response.json();
      setRegistry(data);
    } catch (error) {
      console.error('Failed to load hook registry:', error);
    }
  };

  const loadPerformance = async () => {
    try {
      const response = await fetch('/api/hooks/performance');
      const data = await response.json();
      setPerformance(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load performance data:', error);
      setLoading(false);
    }
  };

  const updateConfig = async (updates) => {
    try {
      const response = await fetch('/api/hooks/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const updatedConfig = await response.json();
        setConfig(updatedConfig);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Failed to update configuration:', error);
      setSaveStatus('error');
    }
  };

  const toggleHook = (hookName, enabled) => {
    const updatedHooks = { ...config.hooks, [hookName]: { ...config.hooks[hookName], enabled } };
    updateConfig({ hooks: updatedHooks });
  };

  const updateProfile = (profile) => {
    updateConfig({ profile });
  };

  const updateThreshold = (type, value) => {
    const updatedPerformance = { ...config.performance, [type]: parseInt(value) };
    updateConfig({ performance: updatedPerformance });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Hook Configuration
        </h2>
        {saveStatus && (
          <Alert className={`w-auto ${saveStatus === 'success' ? 'border-green-500' : 'border-red-500'}`}>
            <AlertDescription>
              {saveStatus === 'success' ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Configuration saved successfully
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Failed to save configuration
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="hooks">Hook Management</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="agents">Agent Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium">Hooks Enabled</label>
                  <p className="text-sm text-gray-600">Master switch for all hooks</p>
                </div>
                <Switch
                  checked={config?.enabled}
                  onCheckedChange={(checked) => updateConfig({ enabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <label className="font-medium">Hook Profile</label>
                <Select value={config?.profile} onValueChange={updateProfile}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal - Essential hooks only</SelectItem>
                    <SelectItem value="standard">Standard - Recommended configuration</SelectItem>
                    <SelectItem value="advanced">Advanced - All hooks enabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="font-medium">Logging Level</label>
                <Select 
                  value={config?.logging?.level} 
                  onValueChange={(level) => updateConfig({ logging: { ...config.logging, level } })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hooks" className="space-y-4">
          {registry?.hooks && Object.entries(registry.hooks).map(([hookName, hook]) => (
            <Card key={hookName}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{hook.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{hook.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={hook.priority === 'critical' ? 'destructive' : 'secondary'}>
                      {hook.priority}
                    </Badge>
                    <Switch
                      checked={config?.hooks?.[hookName]?.enabled ?? true}
                      onCheckedChange={(checked) => toggleHook(hookName, checked)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Category:</span> {hook.category}
                  </div>
                  <div>
                    <span className="font-medium">Triggers:</span> {hook.triggers.join(', ')}
                  </div>
                  {performance?.hooks?.[hookName] && (
                    <>
                      <div>
                        <span className="font-medium">Executions:</span> {performance.hooks[hookName].executions}
                      </div>
                      <div>
                        <span className="font-medium">Avg Time:</span> {performance.hooks[hookName].avgTime}ms
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="font-medium">Timeout (ms)</label>
                <input
                  type="number"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={config?.performance?.timeout}
                  onChange={(e) => updateThreshold('timeout', e.target.value)}
                />
              </div>

              <div>
                <label className="font-medium">Warning Threshold (ms)</label>
                <input
                  type="number"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={config?.performance?.warningThreshold}
                  onChange={(e) => updateThreshold('warningThreshold', e.target.value)}
                />
              </div>

              <div>
                <label className="font-medium">Max Retries</label>
                <input
                  type="number"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={config?.performance?.maxRetries}
                  onChange={(e) => updateThreshold('maxRetries', e.target.value)}
                />
              </div>

              <div>
                <label className="font-medium">Debounce Delay (ms)</label>
                <input
                  type="number"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={config?.performance?.debounceDelay}
                  onChange={(e) => updateThreshold('debounceDelay', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {performance && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Executions</p>
                    <p className="text-2xl font-bold">{performance.summary?.totalExecutions || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Time</p>
                    <p className="text-2xl font-bold">{performance.summary?.avgTime || 0}ms</p>
                  </div>
                </div>

                {performance.topSlowest && performance.topSlowest.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Slowest Hooks</h4>
                    <div className="space-y-2">
                      {performance.topSlowest.map((hook) => (
                        <div key={hook.name} className="flex justify-between text-sm">
                          <span>{hook.name}</span>
                          <span className="text-red-600">{hook.avgTime}ms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          {config?.agentSpecific && Object.entries(config.agentSpecific).map(([agent, agentConfig]) => (
            <Card key={agent}>
              <CardHeader>
                <CardTitle className="text-lg">{agent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">Agent Hooks Enabled</span>
                  <Switch
                    checked={agentConfig.enabled}
                    onCheckedChange={(checked) => {
                      const updated = { ...config.agentSpecific };
                      updated[agent].enabled = checked;
                      updateConfig({ agentSpecific: updated });
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Active Hooks:</p>
                  <div className="flex flex-wrap gap-2">
                    {agentConfig.hooks.map((hook) => (
                      <Badge key={hook} variant="outline">{hook}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={loadConfiguration}>
          Reset
        </Button>
        <Button onClick={() => updateConfig(config)}>
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default HookConfiguration;
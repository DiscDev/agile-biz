import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle,
  Server,
  Zap,
  DollarSign,
  Clock
} from 'lucide-react';

const ModelMonitor = () => {
  const [modelStatus, setModelStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModelStatus = async () => {
      try {
        const response = await fetch('/api/model-status');
        const data = await response.json();
        setModelStatus(data);
      } catch (error) {
        console.error('Failed to fetch model status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModelStatus();
    const interval = setInterval(fetchModelStatus, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading model status...</div>
        </CardContent>
      </Card>
    );
  }

  if (!modelStatus) {
    return null;
  }

  const {
    strategy = 'claude-native',
    models_active = 1,
    services = {},
    performance = {},
    cost = {},
    health = [],
    recent_activity = []
  } = modelStatus;

  const getStrategyColor = (strategy) => {
    switch (strategy) {
      case 'zen-enabled': return 'bg-purple-500';
      case 'hybrid': return 'bg-blue-500';
      case 'claude-native': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthIcon = (status) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'offline': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Server className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Strategy Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Multi-Model Configuration</span>
            <Badge className={getStrategyColor(strategy)}>
              {strategy.replace('-', ' ').toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">{models_active} Models</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">{performance.speed || '1x'}</p>
                <p className="text-xs text-gray-500">Speed</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">{cost.savings || '0%'}</p>
                <p className="text-xs text-gray-500">Savings</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Health */}
      <Card>
        <CardHeader>
          <CardTitle>Service Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(services).map(([name, config]) => (
              <div key={name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  {getHealthIcon(config.status)}
                  <span className="text-sm font-medium capitalize">{name}</span>
                  {config.required && (
                    <Badge variant="outline" className="text-xs">Required</Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">{config.uptime || '100%'} uptime</span>
                  {config.status === 'healthy' && (
                    <Badge variant="success" className="text-xs">Active</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Session Cost</span>
                <span>${cost.session || '0.00'} / ${cost.session_limit || '50.00'}</span>
              </div>
              <Progress 
                value={(cost.session / cost.session_limit) * 100 || 0} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Hourly Cost</span>
                <span>${cost.hourly || '0.00'} / ${cost.hourly_limit || '10.00'}</span>
              </div>
              <Progress 
                value={(cost.hourly / cost.hourly_limit) * 100 || 0} 
                className="h-2"
              />
            </div>
            {cost.breakdown && (
              <div className="pt-2 border-t">
                <p className="text-xs font-medium mb-2">Cost by Model</p>
                <div className="space-y-1">
                  {Object.entries(cost.breakdown).map(([model, amount]) => (
                    <div key={model} className="flex justify-between text-xs">
                      <span className="text-gray-600">{model}</span>
                      <span>${amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Success Rate</p>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={performance.success_rate || 100} 
                  className="flex-1 h-2"
                />
                <span className="text-sm font-medium">{performance.success_rate || 100}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Fallback Rate</p>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={performance.fallback_rate || 0} 
                  className="flex-1 h-2"
                />
                <span className="text-sm font-medium">{performance.fallback_rate || 0}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Avg Response Time</p>
              <p className="text-sm font-medium">{performance.avg_response || '1.2'}s</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Requests</p>
              <p className="text-sm font-medium">{performance.total_requests || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {recent_activity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recent_activity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{activity.time}</span>
                    <span className="font-medium">{activity.model}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">{activity.task}</span>
                    <span className="text-xs font-medium">${activity.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ModelMonitor;
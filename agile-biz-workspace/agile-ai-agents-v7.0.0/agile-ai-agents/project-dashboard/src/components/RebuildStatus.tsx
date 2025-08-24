import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, Clock, Activity } from 'lucide-react';

interface RebuildState {
  active: boolean;
  type: 'technical' | 'partial' | 'business-model' | 'complete';
  phase: string;
  started: string;
  systems: {
    original: {
      status: string;
      traffic_percentage: number;
      users: number;
    };
    rebuild: {
      status: string;
      traffic_percentage: number;
      users: number;
    };
  };
  migration: {
    status: string;
    percentage: number;
  };
  feature_parity: {
    total_features: number;
    implemented: number;
    percentage: number;
  };
}

export function RebuildStatus() {
  const [rebuildState, setRebuildState] = useState<RebuildState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRebuildState();
    const interval = setInterval(fetchRebuildState, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRebuildState = async () => {
    try {
      const response = await fetch('/api/rebuild/status');
      const data = await response.json();
      setRebuildState(data);
    } catch (error) {
      console.error('Failed to fetch rebuild state:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading rebuild status...</div>
        </CardContent>
      </Card>
    );
  }

  if (!rebuildState || !rebuildState.active) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-muted-foreground">No active rebuild workflow</div>
        </CardContent>
      </Card>
    );
  }

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'implementation':
        return <Activity className="h-4 w-4" />;
      case 'migration':
        return <Clock className="h-4 w-4" />;
      case 'parallel-operations':
        return <Activity className="h-4 w-4 animate-pulse" />;
      case 'cutover':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getRebuildTypeBadge = (type: string) => {
    const colors = {
      technical: 'bg-blue-100 text-blue-800',
      partial: 'bg-green-100 text-green-800',
      'business-model': 'bg-yellow-100 text-yellow-800',
      complete: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100'}>
        {type.replace('-', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getDaysElapsed = () => {
    const start = new Date(rebuildState.started);
    const now = new Date();
    const days = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getPhaseIcon(rebuildState.phase)}
            <span>Rebuild Status</span>
          </div>
          {getRebuildTypeBadge(rebuildState.type)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phase Information */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Current Phase</span>
            <span className="font-medium capitalize">
              {rebuildState.phase.replace('-', ' ')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Duration</span>
            <span>{getDaysElapsed()} days</span>
          </div>
        </div>

        {/* System Status */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Systems</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 border rounded">
              <div className="text-xs text-muted-foreground">Original</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {rebuildState.systems.original.status}
                </span>
                <span className="text-xs">
                  {rebuildState.systems.original.traffic_percentage}%
                </span>
              </div>
            </div>
            <div className="p-2 border rounded">
              <div className="text-xs text-muted-foreground">Rebuild</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {rebuildState.systems.rebuild.status}
                </span>
                <span className="text-xs">
                  {rebuildState.systems.rebuild.traffic_percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Migration Progress */}
        {rebuildState.migration.percentage > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Migration</span>
              <span>{rebuildState.migration.percentage}%</span>
            </div>
            <Progress value={rebuildState.migration.percentage} />
          </div>
        )}

        {/* Feature Parity */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Feature Parity</span>
            <span>
              {rebuildState.feature_parity.implemented}/{rebuildState.feature_parity.total_features}
            </span>
          </div>
          <Progress value={rebuildState.feature_parity.percentage} />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button className="flex-1 px-3 py-1 text-xs border rounded hover:bg-gray-50">
            View Details
          </button>
          <button className="flex-1 px-3 py-1 text-xs border rounded hover:bg-gray-50">
            Compare Systems
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
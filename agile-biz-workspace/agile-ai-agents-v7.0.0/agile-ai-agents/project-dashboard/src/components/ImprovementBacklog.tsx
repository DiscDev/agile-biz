import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { CheckCircle, Clock, AlertCircle, PlayCircle } from 'lucide-react';

interface ImprovementItem {
  id: string;
  title: string;
  description: string;
  priority: number;
  category: string;
  estimated_hours: number;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  sprint_id: string;
}

interface Sprint {
  id: string;
  name: string;
  items: string[];
  estimated_hours: number;
  status: 'planned' | 'active' | 'completed';
}

interface BacklogData {
  items: ImprovementItem[];
  sprints: Sprint[];
  metadata: {
    total_items: number;
    estimated_sprints: number;
  };
}

export function ImprovementBacklog() {
  const [backlog, setBacklog] = useState<BacklogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSprint, setSelectedSprint] = useState<string | null>(null);

  useEffect(() => {
    fetchBacklog();
    const interval = setInterval(fetchBacklog, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBacklog = async () => {
    try {
      const response = await fetch('/api/improvements/backlog');
      const data = await response.json();
      setBacklog(data);
      
      // Auto-select active sprint
      const activeSprint = data.sprints.find((s: Sprint) => s.status === 'active');
      if (activeSprint && !selectedSprint) {
        setSelectedSprint(activeSprint.id);
      }
    } catch (error) {
      console.error('Failed to fetch improvement backlog:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      critical_security: '🔴',
      performance: '⚡',
      technical_debt: '🏗️',
      features: '✨',
      modernization: '🚀',
      testing: '🧪',
      documentation: '📚'
    };
    return icons[category] || '📋';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      blocked: 'bg-red-100 text-red-800',
      todo: 'bg-gray-100 text-gray-800'
    };
    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const calculateProgress = () => {
    if (!backlog) return 0;
    const completed = backlog.items.filter(i => i.status === 'completed').length;
    return Math.round((completed / backlog.items.length) * 100);
  };

  const getCurrentSprint = () => {
    if (!backlog || !selectedSprint) return null;
    return backlog.sprints.find(s => s.id === selectedSprint);
  };

  const getSprintItems = (sprint: Sprint) => {
    if (!backlog) return [];
    return backlog.items.filter(item => sprint.items.includes(item.id));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading improvement backlog...</div>
        </CardContent>
      </Card>
    );
  }

  if (!backlog || backlog.items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-muted-foreground">No improvements selected yet</div>
        </CardContent>
      </Card>
    );
  }

  const currentSprint = getCurrentSprint();
  const progress = calculateProgress();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Improvement Backlog</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {backlog.items.filter(i => i.status === 'completed').length}/{backlog.items.length} completed
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Sprint Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {backlog.sprints.map((sprint) => (
            <button
              key={sprint.id}
              onClick={() => setSelectedSprint(sprint.id)}
              className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
                selectedSprint === sprint.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {sprint.name}
              {sprint.status === 'active' && ' (Active)'}
            </button>
          ))}
        </div>

        {/* Current Sprint Items */}
        {currentSprint && (
          <div className="space-y-2">
            <div className="text-sm font-medium">{currentSprint.name}</div>
            <div className="space-y-2">
              {getSprintItems(currentSprint).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-2 p-2 border rounded hover:bg-gray-50"
                >
                  <div className="mt-0.5">{getStatusIcon(item.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getCategoryIcon(item.category)}</span>
                      <span className="text-sm font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">
                        ({item.estimated_hours}h)
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Priority: {item.priority}
                    </div>
                  </div>
                  <div>{getStatusBadge(item.status)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sprint Summary */}
        {currentSprint && (
          <div className="pt-2 border-t">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Sprint Capacity: {currentSprint.estimated_hours} hours</span>
              <span>
                Items: {getSprintItems(currentSprint).filter(i => i.status === 'completed').length}/
                {currentSprint.items.length}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button className="flex-1 px-3 py-1 text-xs border rounded hover:bg-gray-50">
            View Details
          </button>
          <button className="flex-1 px-3 py-1 text-xs border rounded hover:bg-gray-50">
            Re-prioritize
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
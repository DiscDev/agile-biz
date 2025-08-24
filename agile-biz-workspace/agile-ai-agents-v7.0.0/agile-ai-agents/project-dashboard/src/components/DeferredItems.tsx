import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertTriangle, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface DeferredItem {
  id: string;
  title: string;
  description: string;
  category: string;
  reason: string;
  deferred_date: string;
  revisit_date: string;
  risk_acknowledged?: boolean;
  risk_if_deferred?: string;
}

interface DeferredData {
  deferred_improvements: DeferredItem[];
  metadata: {
    last_reviewed: string | null;
    total_deferred: number;
    next_review: string | null;
  };
}

export function DeferredItems() {
  const [deferred, setDeferred] = useState<DeferredData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchDeferred();
    const interval = setInterval(fetchDeferred, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchDeferred = async () => {
    try {
      const response = await fetch('/api/improvements/deferred');
      const data = await response.json();
      setDeferred(data);
    } catch (error) {
      console.error('Failed to fetch deferred items:', error);
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

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      critical_security: 'bg-red-100 text-red-800',
      performance: 'bg-yellow-100 text-yellow-800',
      technical_debt: 'bg-orange-100 text-orange-800',
      features: 'bg-blue-100 text-blue-800',
      modernization: 'bg-purple-100 text-purple-800',
      testing: 'bg-green-100 text-green-800',
      documentation: 'bg-gray-100 text-gray-800'
    };
    
    const name = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return (
      <Badge className={colors[category] || 'bg-gray-100'}>
        {name}
      </Badge>
    );
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getDaysUntilRevisit = (revisitDate: string) => {
    const revisit = new Date(revisitDate);
    const now = new Date();
    const diffTime = revisit.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getRevisitBadge = (revisitDate: string) => {
    const days = getDaysUntilRevisit(revisitDate);
    
    if (days < 0) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    } else if (days <= 7) {
      return <Badge className="bg-yellow-100 text-yellow-800">Review Soon</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">{days} days</Badge>;
    }
  };

  const getFilteredItems = () => {
    if (!deferred) return [];
    
    switch (filter) {
      case 'critical':
        return deferred.deferred_improvements.filter(i => i.category === 'critical_security');
      case 'overdue':
        return deferred.deferred_improvements.filter(i => getDaysUntilRevisit(i.revisit_date) < 0);
      case 'upcoming':
        return deferred.deferred_improvements.filter(i => {
          const days = getDaysUntilRevisit(i.revisit_date);
          return days >= 0 && days <= 7;
        });
      default:
        return deferred.deferred_improvements;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading deferred items...</div>
        </CardContent>
      </Card>
    );
  }

  if (!deferred || deferred.deferred_improvements.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-muted-foreground">No deferred improvements</div>
        </CardContent>
      </Card>
    );
  }

  const filteredItems = getFilteredItems();
  const criticalCount = deferred.deferred_improvements.filter(i => i.category === 'critical_security').length;
  const overdueCount = deferred.deferred_improvements.filter(i => getDaysUntilRevisit(i.revisit_date) < 0).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Deferred Items</span>
            {criticalCount > 0 && (
              <Badge className="bg-red-100 text-red-800">
                {criticalCount} Critical
              </Badge>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {deferred.deferred_improvements.length} total
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs rounded ${
              filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-gray-100'
            }`}
          >
            All ({deferred.deferred_improvements.length})
          </button>
          {criticalCount > 0 && (
            <button
              onClick={() => setFilter('critical')}
              className={`px-3 py-1 text-xs rounded ${
                filter === 'critical' ? 'bg-primary text-primary-foreground' : 'bg-gray-100'
              }`}
            >
              Critical ({criticalCount})
            </button>
          )}
          {overdueCount > 0 && (
            <button
              onClick={() => setFilter('overdue')}
              className={`px-3 py-1 text-xs rounded ${
                filter === 'overdue' ? 'bg-primary text-primary-foreground' : 'bg-gray-100'
              }`}
            >
              Overdue ({overdueCount})
            </button>
          )}
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1 text-xs rounded ${
              filter === 'upcoming' ? 'bg-primary text-primary-foreground' : 'bg-gray-100'
            }`}
          >
            Upcoming
          </button>
        </div>

        {/* Items List */}
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div key={item.id} className="border rounded">
              <div
                className="p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpanded(item.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{getCategoryIcon(item.category)}</span>
                      <span className="font-medium text-sm">{item.title}</span>
                      {item.risk_acknowledged && (
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {getCategoryBadge(item.category)}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Revisit:</span>
                        {getRevisitBadge(item.revisit_date)}
                      </div>
                    </div>
                  </div>
                  <div className="ml-2">
                    {expandedItems.has(item.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </div>
              
              {expandedItems.has(item.id) && (
                <div className="px-3 pb-3 border-t">
                  <div className="mt-2 space-y-2">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Description</div>
                      <div className="text-sm">{item.description}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Reason for Deferral</div>
                      <div className="text-sm">{item.reason}</div>
                    </div>
                    {item.risk_if_deferred && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground">Risk if Deferred</div>
                        <div className="text-sm text-red-600">{item.risk_if_deferred}</div>
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button className="px-2 py-1 text-xs border rounded hover:bg-gray-50">
                        Add to Backlog
                      </button>
                      <button className="px-2 py-1 text-xs border rounded hover:bg-gray-50">
                        Update Revisit Date
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        {deferred.metadata.next_review && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              Next review scheduled: {new Date(deferred.metadata.next_review).toLocaleDateString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
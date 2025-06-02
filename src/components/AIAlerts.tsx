
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, TrendingUp, X } from 'lucide-react';

interface Alert {
  id: string;
  type: 'warning' | 'budget' | 'timeline' | 'opportunity';
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  actionable: boolean;
}

const AIAlerts = () => {
  const alerts: Alert[] = [
    {
      id: '1',
      type: 'budget',
      title: 'Budget Overrun Alert',
      message: 'Labor costs are 12% over budget. Consider reviewing tradie schedules.',
      severity: 'high',
      actionable: true
    },
    {
      id: '2',
      type: 'timeline',
      title: 'Timeline Risk',
      message: 'Electrical work delay may impact kitchen installation by 3 days.',
      severity: 'medium',
      actionable: true
    },
    {
      id: '3',
      type: 'opportunity',
      title: 'Value Add Opportunity',
      message: 'Adding a skylight could increase property value by $15,000 for $8,000 cost.',
      severity: 'low',
      actionable: true
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'budget': return <TrendingUp className="h-5 w-5 text-orange-500" />;
      case 'timeline': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'opportunity': return <TrendingUp className="h-5 w-5 text-green-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20';
      case 'medium': return 'bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20';
      case 'low': return 'bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'budget': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'timeline': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'opportunity': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Card key={alert.id} className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getAlertIcon(alert.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                  <Badge className={`text-xs px-2 py-1 ${getTypeColor(alert.type)}`}>
                    {alert.type}
                  </Badge>
                  <Badge className={`text-xs px-2 py-1 ${getAlertColor(alert.severity)}`}>
                    {alert.severity}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">{alert.message}</p>
                
                {alert.actionable && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white">
                      Take Action
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-600">
                      View Details
                    </Button>
                  </div>
                )}
              </div>
              
              <Button variant="ghost" size="sm" className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AIAlerts;

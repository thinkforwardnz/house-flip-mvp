
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, AlertTriangle } from 'lucide-react';

interface Alert {
  id: string;
  type: 'reminder' | 'warning' | 'info';
  message: string;
  property?: string;
  timestamp: string;
}

const AlertsPanel = () => {
  const alerts: Alert[] = [
    {
      id: '1',
      type: 'warning',
      message: 'Renovation budget exceeded by 15%',
      property: '123 Oak Street',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'reminder',
      message: 'Follow up with contractor tomorrow',
      property: '456 Pine Avenue',
      timestamp: '1 day ago'
    },
    {
      id: '3',
      type: 'info',
      message: 'Market analysis ready for review',
      property: '789 Elm Drive',
      timestamp: '2 days ago'
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'reminder': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'info': return <Bell className="h-4 w-4 text-green-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-100 text-amber-800';
      case 'reminder': return 'bg-blue-100 text-blue-800';
      case 'info': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-80 border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Alerts & Reminders</h3>
          <Badge className="bg-red-100 text-red-800 ml-auto">
            {alerts.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
              {getAlertIcon(alert.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium">{alert.message}</p>
                {alert.property && (
                  <p className="text-xs text-gray-500 mt-1">{alert.property}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <Badge className={`text-xs px-2 py-1 ${getAlertColor(alert.type)}`}>
                    {alert.type}
                  </Badge>
                  <span className="text-xs text-gray-400">{alert.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;

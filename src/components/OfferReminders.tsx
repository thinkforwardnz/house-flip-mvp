
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Phone, X } from 'lucide-react';

interface Reminder {
  id: string;
  type: 'expiry' | 'response' | 'action';
  title: string;
  message: string;
  time: string;
  urgent: boolean;
}

const OfferReminders = () => {
  const reminders: Reminder[] = [
    {
      id: '1',
      type: 'response',
      title: 'Agent Response Due',
      message: 'Your offer expires in 2 hours. Consider following up with the agent.',
      time: '2 hours',
      urgent: true
    },
    {
      id: '2',
      type: 'action',
      title: 'Finance Pre-approval',
      message: 'Update your finance pre-approval before submitting next offer.',
      time: '1 day',
      urgent: false
    }
  ];

  const getIcon = (type: string, urgent: boolean) => {
    const iconClass = urgent ? 'text-[#D32F2F]' : 'text-[#FF9800]';
    
    switch (type) {
      case 'expiry':
        return <Clock className={`h-5 w-5 ${iconClass}`} />;
      case 'response':
        return <Phone className={`h-5 w-5 ${iconClass}`} />;
      case 'action':
        return <AlertTriangle className={`h-5 w-5 ${iconClass}`} />;
      default:
        return <AlertTriangle className={`h-5 w-5 ${iconClass}`} />;
    }
  };

  const getBgColor = (urgent: boolean) => {
    return urgent 
      ? 'bg-[#D32F2F]/10 border-[#D32F2F]/20' 
      : 'bg-[#FF9800]/10 border-[#FF9800]/20';
  };

  if (reminders.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {reminders.map((reminder) => (
        <Card key={reminder.id} className={`border ${getBgColor(reminder.urgent)}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(reminder.type, reminder.urgent)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">{reminder.title}</h4>
                    <p className="text-sm text-gray-700 mb-2">{reminder.message}</p>
                    <span className="text-xs text-gray-500 font-medium">
                      Due in {reminder.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Take Action
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-400 hover:bg-gray-50 p-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OfferReminders;

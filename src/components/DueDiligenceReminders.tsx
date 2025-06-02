
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Calendar, X } from 'lucide-react';

interface Reminder {
  id: string;
  type: 'expiry' | 'deadline' | 'followup';
  title: string;
  message: string;
  time: string;
  urgent: boolean;
  dueDate: string;
}

const DueDiligenceReminders = () => {
  const reminders: Reminder[] = [
    {
      id: '1',
      type: 'expiry',
      title: 'Due Diligence Expiry',
      message: 'Due diligence period expires in 12 days. Ensure all conditions are met.',
      time: '12 days',
      urgent: false,
      dueDate: '2024-02-28'
    },
    {
      id: '2',
      type: 'deadline',
      title: 'Finance Approval Deadline',
      message: 'Finance approval must be obtained by this date to meet contract terms.',
      time: '8 days',
      urgent: true,
      dueDate: '2024-02-20'
    },
    {
      id: '3',
      type: 'followup',
      title: 'Builder\'s Report Follow-up',
      message: 'Inspector was scheduled to complete report today. Follow up if not received.',
      time: 'Today',
      urgent: true,
      dueDate: '2024-02-12'
    },
    {
      id: '4',
      type: 'deadline',
      title: 'LIM Report Expiry',
      message: 'LIM report expires in 45 days. Consider ordering new one if settlement delayed.',
      time: '45 days',
      urgent: false,
      dueDate: '2024-03-28'
    }
  ];

  const getIcon = (type: string, urgent: boolean) => {
    const iconClass = urgent ? 'text-[#D32F2F]' : 'text-[#FF9800]';
    
    switch (type) {
      case 'expiry':
        return <Clock className={`h-5 w-5 ${iconClass}`} />;
      case 'deadline':
        return <Calendar className={`h-5 w-5 ${iconClass}`} />;
      case 'followup':
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
    <div className="mb-6 space-y-3">
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
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="font-medium">
                        Due in {reminder.time}
                      </span>
                      <span>
                        Date: {reminder.dueDate}
                      </span>
                    </div>
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

export default DueDiligenceReminders;

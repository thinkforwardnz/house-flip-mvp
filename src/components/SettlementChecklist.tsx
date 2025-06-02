
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, FileText, Key, Shield, DollarSign, Calculator, AlertCircle } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'in-progress';
  icon: any;
  priority: 'high' | 'medium' | 'low';
}

const SettlementChecklist = () => {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: '1',
      title: 'Legal Transfer Complete',
      description: 'Property title transferred to new owner',
      status: 'completed',
      icon: FileText,
      priority: 'high'
    },
    {
      id: '2',
      title: 'Key Handover',
      description: 'All keys and access codes provided',
      status: 'completed',
      icon: Key,
      priority: 'high'
    },
    {
      id: '3',
      title: 'Insurance Cancelled',
      description: 'Property insurance policy cancelled',
      status: 'pending',
      icon: Shield,
      priority: 'medium'
    },
    {
      id: '4',
      title: 'Agent Payment',
      description: 'Real estate agent commission paid',
      status: 'completed',
      icon: DollarSign,
      priority: 'high'
    },
    {
      id: '5',
      title: 'IRD/Tax Documentation',
      description: 'Tax obligations and GST requirements addressed',
      status: 'in-progress',
      icon: Calculator,
      priority: 'high'
    },
    {
      id: '6',
      title: 'Final Settlement Statement',
      description: 'Received and filed settlement documentation',
      status: 'pending',
      icon: FileText,
      priority: 'medium'
    }
  ]);

  const toggleItemStatus = (itemId: string) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const newStatus = item.status === 'completed' ? 'pending' : 'completed';
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-[#388E3C]" />;
      case 'in-progress':
        return <AlertCircle className="h-5 w-5 text-[#FF9800]" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20">In Progress</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Pending</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-[#D32F2F]';
      case 'medium':
        return 'border-l-[#FF9800]';
      default:
        return 'border-l-gray-300';
    }
  };

  const completedCount = items.filter(item => item.status === 'completed').length;
  const completionPercentage = Math.round((completedCount / items.length) * 100);

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Settlement Checklist</CardTitle>
          <Badge className="bg-[#1B5E20]/10 text-[#1B5E20] border-[#1B5E20]/20">
            {completedCount}/{items.length} Complete
          </Badge>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
          <div 
            className="bg-[#1B5E20] h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-1">{completionPercentage}% complete</p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {items.map((item) => {
          const IconComponent = item.icon;
          return (
            <div 
              key={item.id} 
              className={`p-4 border-l-4 bg-gray-50 rounded-r-lg ${getPriorityColor(item.priority)}`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleItemStatus(item.id)}
                  className="mt-1 flex-shrink-0 hover:scale-110 transition-transform"
                >
                  {getStatusIcon(item.status)}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-gray-600" />
                      <h4 className={`font-medium ${item.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {item.title}
                      </h4>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              className="border-gray-300 text-gray-600"
            >
              Add Item
            </Button>
            <Button 
              size="sm" 
              className="bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white"
            >
              Mark All Complete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettlementChecklist;


import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Upload, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'complete' | 'overdue';
  dueDate: string;
  documentUploaded: boolean;
  documentName?: string;
  required: boolean;
}

const DueDiligenceChecklist = () => {
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: '1',
      title: 'LIM Report',
      description: 'Land Information Memorandum from council',
      status: 'complete',
      dueDate: '2024-02-15',
      documentUploaded: true,
      documentName: 'lim_report_1234_elm_st.pdf',
      required: true
    },
    {
      id: '2',
      title: "Builder's Report",
      description: 'Professional building inspection report',
      status: 'in-progress',
      dueDate: '2024-02-18',
      documentUploaded: false,
      required: true
    },
    {
      id: '3',
      title: 'Finance Approval',
      description: 'Unconditional finance approval from bank',
      status: 'in-progress',
      dueDate: '2024-02-20',
      documentUploaded: false,
      required: true
    },
    {
      id: '4',
      title: 'Insurance Quote',
      description: 'Property insurance quote and coverage',
      status: 'pending',
      dueDate: '2024-02-22',
      documentUploaded: false,
      required: true
    },
    {
      id: '5',
      title: 'Property Valuation',
      description: 'Independent property valuation',
      status: 'overdue',
      dueDate: '2024-02-12',
      documentUploaded: false,
      required: true
    },
    {
      id: '6',
      title: 'Renovation Quotes',
      description: 'Final quotes from contractors',
      status: 'in-progress',
      dueDate: '2024-02-25',
      documentUploaded: true,
      documentName: 'contractor_quotes.pdf',
      required: true
    }
  ]);

  const handleStatusChange = (id: string, newStatus: ChecklistItem['status']) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, status: newStatus } : item
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-[#388E3C]" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-[#FF9800]" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-[#D32F2F]" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20';
      case 'in-progress':
        return 'bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20';
      case 'overdue':
        return 'bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const completedItems = items.filter(item => item.status === 'complete').length;
  const totalItems = items.length;
  const progressPercentage = (completedItems / totalItems) * 100;

  return (
    <div className="p-6 space-y-6">
      {/* Progress Overview */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Due Diligence Progress</h3>
            <Badge className={`px-3 py-1 ${
              progressPercentage === 100 ? 'bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20' :
              progressPercentage >= 70 ? 'bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20' :
              'bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20'
            }`}>
              {completedItems}/{totalItems} Complete
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Overall Progress</span>
              <span className="text-gray-900 font-medium">{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Checklist Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(item.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        {item.required && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                            Required
                          </Badge>
                        )}
                        <Badge className={`text-xs px-2 py-1 border ${getStatusColor(item.status)}`}>
                          {item.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {item.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Document Upload/Status */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    {item.documentUploaded ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-[#388E3C]" />
                          <span className="text-sm text-gray-700">{item.documentName}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="text-xs">
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs">
                            Replace
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">No document uploaded</span>
                        <Button size="sm" className="bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white text-xs">
                          <Upload className="h-3 w-3 mr-1" />
                          Upload
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Status Controls */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange(item.id, 'pending')}
                      className={`text-xs ${item.status === 'pending' ? 'bg-gray-100' : ''}`}
                    >
                      Pending
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange(item.id, 'in-progress')}
                      className={`text-xs ${item.status === 'in-progress' ? 'bg-[#FF9800]/10 text-[#FF9800]' : ''}`}
                    >
                      In Progress
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange(item.id, 'complete')}
                      className={`text-xs ${item.status === 'complete' ? 'bg-[#388E3C]/10 text-[#388E3C]' : ''}`}
                    >
                      Complete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DueDiligenceChecklist;

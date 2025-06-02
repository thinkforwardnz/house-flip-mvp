
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, AlertTriangle } from 'lucide-react';

interface ComplianceItem {
  id: string;
  category: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  dueDate?: string;
  notes?: string;
}

const ComplianceChecklist = () => {
  const [items, setItems] = useState<ComplianceItem[]>([
    {
      id: '1',
      category: 'Building Consent',
      title: 'Building Consent Application',
      description: 'Submit building consent for structural changes',
      completed: true,
      required: true,
      dueDate: '2024-01-15'
    },
    {
      id: '2',
      category: 'Building Consent',
      title: 'Council Inspection - Foundation',
      description: 'Council inspection of foundation work',
      completed: true,
      required: true,
      dueDate: '2024-02-01'
    },
    {
      id: '3',
      category: 'Electrical',
      title: 'Electrical Certificate of Compliance',
      description: 'COC for electrical work completion',
      completed: false,
      required: true,
      dueDate: '2024-02-15'
    },
    {
      id: '4',
      category: 'Plumbing',
      title: 'Plumbing Certificate of Compliance',
      description: 'COC for plumbing work completion',
      completed: false,
      required: true,
      dueDate: '2024-02-20'
    },
    {
      id: '5',
      category: 'Health & Safety',
      title: 'Site Safety Plan',
      description: 'Health and safety plan for renovation site',
      completed: true,
      required: true
    },
    {
      id: '6',
      category: 'Insurance',
      title: 'Contractor Insurance',
      description: 'Verify all contractors have valid insurance',
      completed: false,
      required: true
    },
    {
      id: '7',
      category: 'Final',
      title: 'Code Compliance Certificate',
      description: 'Final CCC from council',
      completed: false,
      required: true,
      dueDate: '2024-03-30'
    }
  ]);

  const handleToggle = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const categories = [...new Set(items.map(item => item.category))];
  const completedItems = items.filter(item => item.completed).length;
  const totalItems = items.length;
  const completionRate = (completedItems / totalItems) * 100;

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Progress Overview */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Compliance Progress</h3>
            <Badge className={`px-3 py-1 ${
              completionRate === 100 ? 'bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20' :
              completionRate >= 70 ? 'bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20' :
              'bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20'
            }`}>
              {completedItems}/{totalItems} Complete
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Overall Progress</span>
              <span className="text-gray-900 font-medium">{completionRate.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  completionRate === 100 ? 'bg-[#388E3C]' : 
                  completionRate >= 70 ? 'bg-[#FF9800]' : 'bg-[#D32F2F]'
                }`}
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist by Category */}
      {categories.map((category) => (
        <Card key={category} className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4">{category}</h4>
            
            <div className="space-y-4">
              {items
                .filter(item => item.category === category)
                .map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => handleToggle(item.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className={`font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {item.title}
                        </h5>
                        {item.required && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                            Required
                          </Badge>
                        )}
                        {item.dueDate && isOverdue(item.dueDate) && !item.completed && (
                          <Badge className="bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20 text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      
                      <p className={`text-sm ${item.completed ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                        {item.description}
                      </p>
                      
                      {item.dueDate && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {item.dueDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ComplianceChecklist;


import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

const TaskKanban = () => {
  const [tasks] = useState<{ [key: string]: Task[] }>({
    'To Do': [
      {
        id: '1',
        title: 'Kitchen Cabinet Installation',
        description: 'Install new kitchen cabinets',
        assignee: 'John Smith',
        dueDate: '2024-02-15',
        priority: 'high',
        category: 'Kitchen'
      },
      {
        id: '2',
        title: 'Bathroom Tiling',
        description: 'Tile main bathroom walls',
        assignee: 'Mike Johnson',
        dueDate: '2024-02-20',
        priority: 'medium',
        category: 'Bathroom'
      }
    ],
    'In Progress': [
      {
        id: '3',
        title: 'Electrical Rewiring',
        description: 'Update electrical system',
        assignee: 'Sarah Wilson',
        dueDate: '2024-02-10',
        priority: 'high',
        category: 'Electrical'
      }
    ],
    'Review': [
      {
        id: '4',
        title: 'Plumbing Inspection',
        description: 'Check new plumbing work',
        assignee: 'Dave Brown',
        dueDate: '2024-02-08',
        priority: 'medium',
        category: 'Plumbing'
      }
    ],
    'Done': [
      {
        id: '5',
        title: 'Demolition',
        description: 'Remove old fixtures',
        assignee: 'Team A',
        dueDate: '2024-02-01',
        priority: 'high',
        category: 'Demo'
      }
    ]
  });

  const columns = ['To Do', 'In Progress', 'Review', 'Done'];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20';
      case 'medium': return 'bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20';
      case 'low': return 'bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{column}</h3>
              <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                {tasks[column]?.length || 0}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {tasks[column]?.map((task) => (
                <Card key={task.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{task.description}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs px-2 py-1 ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          {task.category}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <User className="h-3 w-3" />
                          <span>{task.assignee}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>{task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskKanban;

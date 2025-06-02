
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, GripVertical } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  due_date: string | null;
  priority: number;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  type: string;
}

interface DraggableTaskCardProps {
  task: Task;
}

const DraggableTaskCard = ({ task }: DraggableTaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20';
    if (priority <= 4) return 'bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20';
    return 'bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority <= 2) return 'high';
    if (priority <= 4) return 'medium';
    return 'low';
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer ${
        isDragging ? 'ring-2 ring-blue-primary' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
              {task.description && (
                <p className="text-xs text-gray-600 mt-1">{task.description}</p>
              )}
            </div>
            <div
              {...attributes}
              {...listeners}
              className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge className={`text-xs px-2 py-1 ${getPriorityColor(task.priority)}`}>
              {getPriorityLabel(task.priority)}
            </Badge>
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
              {task.type}
            </span>
          </div>
          
          <div className="space-y-2">
            {task.assigned_to && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <User className="h-3 w-3" />
                <span>{task.assigned_to}</span>
              </div>
            )}
            {task.due_date && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar className="h-3 w-3" />
                <span>{new Date(task.due_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DraggableTaskCard;

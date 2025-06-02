
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DraggableTaskCard from './DraggableTaskCard';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];

interface DroppableColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

const DroppableColumn = ({ id, title, tasks, onTaskClick }: DroppableColumnProps) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-700 flex items-center justify-between">
          {title}
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div
          ref={setNodeRef}
          className="min-h-[200px] space-y-3"
        >
          <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <DraggableTaskCard 
                key={task.id} 
                task={task} 
                onTaskClick={onTaskClick}
              />
            ))}
          </SortableContext>
        </div>
      </CardContent>
    </Card>
  );
};

export default DroppableColumn;

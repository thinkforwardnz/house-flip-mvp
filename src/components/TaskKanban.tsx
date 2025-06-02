
import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { useSelectedDeal } from '@/hooks/useSelectedDeal';
import { useTasks } from '@/hooks/useTasks';
import DroppableColumn from './DroppableColumn';

const TaskKanban = () => {
  const { selectedDeal } = useSelectedDeal('Reno');
  const { tasks, isLoading, updateTaskStatus } = useTasks(selectedDeal?.id || '');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = [
    { id: 'pending', title: 'To Do', status: 'pending' as const },
    { id: 'in_progress', title: 'In Progress', status: 'in_progress' as const },
    { id: 'on_hold', title: 'Review', status: 'on_hold' as const },
    { id: 'completed', title: 'Done', status: 'completed' as const },
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as 'pending' | 'in_progress' | 'completed' | 'on_hold';

    // Find the task and check if status actually changed
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    updateTaskStatus(taskId, newStatus);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="h-32 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedDeal) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Please select a deal to view tasks</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <DroppableColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={getTasksByStatus(column.status)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default TaskKanban;

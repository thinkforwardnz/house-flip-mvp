
import React, { useState } from 'react';
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
import TaskCreateDialog from './TaskCreateDialog';
import TaskEditDialog from './TaskEditDialog';
import TaskListView from './TaskListView';
import TaskCalendarView from './TaskCalendarView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, List, Calendar, Zap } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type ViewType = 'kanban' | 'list' | 'calendar';

const TaskKanban = () => {
  const { selectedDeal } = useSelectedDeal('Reno');
  const { tasks, templates, isLoading, createTask, updateTask, deleteTask, updateTaskStatus, generateTemplateTasks } = useTasks(selectedDeal?.id || '');
  const [currentView, setCurrentView] = useState<ViewType>('kanban');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = [
    { id: 'to_do', title: 'To Do', status: 'to_do' as const },
    { id: 'in_progress', title: 'In Progress', status: 'in_progress' as const },
    { id: 'review', title: 'Review', status: 'review' as const },
    { id: 'done', title: 'Done', status: 'done' as const },
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as Task['status'];

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    updateTaskStatus(taskId, newStatus);
  };

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
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

  const viewButtons = [
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
    { id: 'list', label: 'List', icon: List },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                Task Management
                <Badge variant="outline">{tasks.length} tasks</Badge>
              </CardTitle>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={generateTemplateTasks}
                className="flex items-center gap-2"
                disabled={tasks.length > 0}
              >
                <Zap className="h-4 w-4" />
                Generate Template Tasks
              </Button>
              <TaskCreateDialog onCreateTask={createTask} templates={templates} />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* View Switcher */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {viewButtons.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id as ViewType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    currentView === view.id
                      ? 'bg-blue-primary text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {view.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Task Views */}
      {currentView === 'kanban' && (
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
                onTaskClick={handleTaskClick}
              />
            ))}
          </div>
        </DndContext>
      )}

      {currentView === 'list' && (
        <TaskListView 
          tasks={tasks} 
          onUpdateStatus={updateTaskStatus}
          onTaskClick={handleTaskClick}
        />
      )}

      {currentView === 'calendar' && (
        <TaskCalendarView 
          tasks={tasks} 
          onUpdateStatus={updateTaskStatus}
          onTaskClick={handleTaskClick}
        />
      )}

      {/* Task Edit Dialog */}
      <TaskEditDialog
        task={editingTask}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
      />
    </div>
  );
};

export default TaskKanban;

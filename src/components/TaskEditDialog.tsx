
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Save, Trash2, Upload } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

interface TaskEditDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTask: (taskId: string, updates: Partial<TaskUpdate>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

const TaskEditDialog = ({ task, open, onOpenChange, onUpdateTask, onDeleteTask }: TaskEditDialogProps) => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    start_date: string;
    due_date: string;
    assigned_to: string;
    priority: number;
    type: Database['public']['Enums']['task_type'];
    status: Database['public']['Enums']['task_status'];
  }>({
    title: '',
    description: '',
    start_date: '',
    due_date: '',
    assigned_to: '',
    priority: 3,
    type: 'Reno',
    status: 'to_do'
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        start_date: task.start_date || '',
        due_date: task.due_date || '',
        assigned_to: task.assigned_to || '',
        priority: task.priority || 3,
        type: task.type || 'Reno',
        status: task.status || 'to_do'
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    
    try {
      await onUpdateTask(task.id, {
        ...formData,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
        assigned_to: formData.assigned_to || null
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    
    try {
      await onDeleteTask(task.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const taskTypes: Database['public']['Enums']['task_type'][] = ['DD', 'Reno', 'Marketing', 'Legal', 'Finance', 'Inspection', 'Other'];
  const taskStatuses: Database['public']['Enums']['task_status'][] = ['to_do', 'in_progress', 'review', 'done'];
  const priorities = [
    { value: 1, label: 'High' },
    { value: 2, label: 'Medium' },
    { value: 3, label: 'Low' }
  ];

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Task description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: Database['public']['Enums']['task_status']) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="to_do">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value.toString()}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="assigned_to">Assignee</Label>
              <Input
                id="assigned_to"
                value={formData.assigned_to}
                onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
                placeholder="Who is responsible?"
              />
            </div>

            <div>
              <Label htmlFor="type">Task Type</Label>
              <Select value={formData.type} onValueChange={(value: Database['public']['Enums']['task_type']) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {taskTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="attachments">Attachments</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" className="h-10">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
                <span className="text-sm text-gray-500">No files selected</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Task</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this task? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-primary hover:bg-blue-600 text-white">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditDialog;

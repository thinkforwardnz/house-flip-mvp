
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskTemplate = Database['public']['Tables']['task_templates']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];

export const useTasks = (dealId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const createTask = async (taskData: Partial<TaskInsert>): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title!,
          deal_id: dealId,
          description: taskData.description || null,
          assigned_to: taskData.assigned_to || null,
          due_date: taskData.due_date || null,
          start_date: taskData.start_date || null,
          priority: taskData.priority || 3,
          type: taskData.type || 'Other',
          status: 'to_do',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Task created successfully',
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));

      toast({
        title: 'Success',
        description: 'Task status updated',
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive'
      });
      fetchTasks();
    }
  };

  const generateTemplateTasks = async () => {
    try {
      const { error } = await supabase.rpc('create_template_tasks_for_deal', {
        deal_uuid: dealId
      });

      if (error) throw error;

      await fetchTasks();
      toast({
        title: 'Success',
        description: 'Template tasks generated successfully',
      });
    } catch (error) {
      console.error('Error generating template tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate template tasks',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (dealId) {
      fetchTasks();
      fetchTemplates();

      const channel = supabase
        .channel('tasks-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `deal_id=eq.${dealId}`
          },
          () => {
            fetchTasks();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [dealId]);

  return {
    tasks,
    templates,
    isLoading,
    createTask,
    updateTaskStatus,
    generateTemplateTasks,
    refetch: fetchTasks
  };
};

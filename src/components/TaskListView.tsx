
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Search, Filter } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskListViewProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
  onTaskClick?: (task: Task) => void;
}

const TaskListView = ({ tasks, onUpdateStatus, onTaskClick }: TaskListViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('due_date');

  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesType = typeFilter === 'all' || task.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'priority':
          return a.priority! - b.priority!;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const getPriorityColor = (priority: number) => {
    if (priority <= 1) return 'bg-red-100 text-red-700 border-red-200';
    if (priority <= 2) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority <= 1) return 'High';
    if (priority <= 2) return 'Medium';
    return 'Low';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'review':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'to_do':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'review':
        return 'Review';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };

  const uniqueTypes = [...new Set(tasks.map(task => task.type))];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="to_do">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type} value={type!}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due_date">Due Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No tasks found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card 
              key={task.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onTaskClick?.(task)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      <Badge className={`text-xs ${getPriorityColor(task.priority!)}`}>
                        {getPriorityLabel(task.priority!)}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(task.status!)}`}>
                        {getStatusLabel(task.status!)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {task.type}
                      </Badge>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      {task.assigned_to && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{task.assigned_to}</span>
                        </div>
                      )}
                      {task.start_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Start: {new Date(task.start_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(task.id, 'to_do');
                      }}
                      className={task.status === 'to_do' ? 'bg-gray-100' : ''}
                    >
                      To Do
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(task.id, 'in_progress');
                      }}
                      className={task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : ''}
                    >
                      In Progress
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(task.id, 'review');
                      }}
                      className={task.status === 'review' ? 'bg-orange-100 text-orange-700' : ''}
                    >
                      Review
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateStatus(task.id, 'done');
                      }}
                      className={task.status === 'done' ? 'bg-green-100 text-green-700' : ''}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskListView;

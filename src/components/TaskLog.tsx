
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, User, MessageSquare } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'complete';
  createdDate: string;
  notes: string[];
}

const TaskLog = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Follow up on builder\'s report',
      description: 'Contact building inspector for completion timeline',
      assignee: 'You',
      dueDate: '2024-02-15',
      status: 'in-progress',
      createdDate: '2024-02-10',
      notes: ['Called inspector at 2pm - expecting report by Friday']
    },
    {
      id: '2',
      title: 'Get insurance quote',
      description: 'Obtain property insurance quote for settlement',
      assignee: 'Sarah (Insurance Broker)',
      dueDate: '2024-02-18',
      status: 'pending',
      createdDate: '2024-02-09',
      notes: []
    },
    {
      id: '3',
      title: 'Review LIM report findings',
      description: 'Analyze flood risk section and determine impact',
      assignee: 'You',
      dueDate: '2024-02-12',
      status: 'complete',
      createdDate: '2024-02-08',
      notes: ['Reviewed with lawyer', 'Flood risk manageable with proper insurance']
    }
  ]);

  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    dueDate: ''
  });

  const [newNote, setNewNote] = useState<{[key: string]: string}>({});

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        ...newTask,
        status: 'pending',
        createdDate: new Date().toISOString().split('T')[0],
        notes: []
      };
      setTasks([task, ...tasks]);
      setNewTask({ title: '', description: '', assignee: '', dueDate: '' });
      setShowNewTask(false);
    }
  };

  const handleAddNote = (taskId: string) => {
    const note = newNote[taskId];
    if (note?.trim()) {
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, notes: [...task.notes, note] }
          : task
      ));
      setNewNote({ ...newNote, [taskId]: '' });
    }
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20';
      case 'in-progress':
        return 'bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Add New Task */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tasks & Notes</h3>
            <Button 
              onClick={() => setShowNewTask(!showNewTask)}
              className="bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          {showNewTask && (
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="task-title">Task Title</Label>
                  <Input
                    id="task-title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="task-assignee">Assignee</Label>
                  <Input
                    id="task-assignee"
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    placeholder="Who is responsible?"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Task details"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="task-due">Due Date</Label>
                  <Input
                    id="task-due"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddTask} className="bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white">
                  Add Task
                </Button>
                <Button variant="outline" onClick={() => setShowNewTask(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{task.title}</h4>
                    <Badge className={`text-xs px-2 py-1 border ${getStatusColor(task.status)}`}>
                      {task.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{task.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{task.assignee}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Due: {task.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Created: {task.createdDate}</span>
                    </div>
                  </div>

                  {/* Status Controls */}
                  <div className="flex gap-2 mb-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange(task.id, 'pending')}
                      className={`text-xs ${task.status === 'pending' ? 'bg-gray-100' : ''}`}
                    >
                      Pending
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange(task.id, 'in-progress')}
                      className={`text-xs ${task.status === 'in-progress' ? 'bg-[#FF9800]/10 text-[#FF9800]' : ''}`}
                    >
                      In Progress
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusChange(task.id, 'complete')}
                      className={`text-xs ${task.status === 'complete' ? 'bg-[#388E3C]/10 text-[#388E3C]' : ''}`}
                    >
                      Complete
                    </Button>
                  </div>

                  {/* Notes */}
                  {task.notes.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-medium text-gray-800 mb-2 flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        Notes
                      </h5>
                      <div className="space-y-2">
                        {task.notes.map((note, index) => (
                          <div key={index} className="p-2 bg-blue-50 rounded text-sm text-gray-700">
                            {note}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Note */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a note..."
                      value={newNote[task.id] || ''}
                      onChange={(e) => setNewNote({ ...newNote, [task.id]: e.target.value })}
                      className="text-sm"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleAddNote(task.id)}
                      className="bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white"
                    >
                      Add Note
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

export default TaskLog;

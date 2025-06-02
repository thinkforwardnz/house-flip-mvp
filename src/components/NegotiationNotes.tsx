
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Plus, Trash } from 'lucide-react';

interface Note {
  id: string;
  date: string;
  title: string;
  content: string;
}

const NegotiationNotes = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      date: '2024-02-10',
      title: 'Initial agent conversation',
      content: 'Agent mentioned vendor is motivated to sell. Property has been on market for 45 days. May consider offers around $630k.'
    },
    {
      id: '2',
      date: '2024-02-12',
      title: 'Rejection feedback',
      content: 'First offer rejected. Agent said vendor wants closer to $640k. Suggested resubmitting with shorter conditions.'
    }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const addNote = () => {
    if (newTitle.trim() && newContent.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        title: newTitle,
        content: newContent
      };
      setNotes([newNote, ...notes]);
      setNewTitle('');
      setNewContent('');
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#1B5E20]" />
          Negotiation Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Note */}
        <div className="bg-[#F8F9FA] rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="noteTitle" className="text-sm font-medium text-gray-700">
              Note Title
            </Label>
            <Input
              id="noteTitle"
              placeholder="e.g., Agent conversation, Vendor feedback..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="border-gray-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="noteContent" className="text-sm font-medium text-gray-700">
              Notes
            </Label>
            <Textarea
              id="noteContent"
              placeholder="Add your negotiation notes, agent feedback, or strategy thoughts..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="border-gray-300 min-h-[100px]"
            />
          </div>
          <Button 
            onClick={addNote} 
            className="bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No notes yet. Add your first negotiation note above.</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{note.title}</h4>
                      <span className="text-xs text-gray-500">
                        {new Date(note.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteNote(note.id)}
                    className="border-red-300 text-red-600 hover:bg-red-50 ml-4"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NegotiationNotes;

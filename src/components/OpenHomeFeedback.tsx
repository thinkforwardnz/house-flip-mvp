
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, Star } from 'lucide-react';

interface Feedback {
  id: string;
  date: string;
  prospectName: string;
  rating: number;
  feedback: string;
  interest: 'high' | 'medium' | 'low';
  contact: string;
}

const OpenHomeFeedback = () => {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([
    {
      id: '1',
      date: '2024-02-17',
      prospectName: 'Emma Johnson',
      rating: 4,
      feedback: 'Beautiful property with great natural light. Love the kitchen renovation. Concerned about the garden size for our family.',
      interest: 'high',
      contact: 'emma.j@email.com'
    },
    {
      id: '2',
      date: '2024-02-17',
      prospectName: 'Michael Brown',
      rating: 3,
      feedback: 'Good location and well-presented. The bathrooms need updating. Parking could be an issue.',
      interest: 'medium',
      contact: '021 555 0123'
    },
    {
      id: '3',
      date: '2024-02-18',
      prospectName: 'Lisa Chang',
      rating: 5,
      feedback: 'Absolutely love everything about this property. Perfect for our needs. Very interested in making an offer.',
      interest: 'high',
      contact: 'lisa.chang@email.com'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    prospectName: '',
    rating: 5,
    feedback: '',
    interest: 'medium' as 'high' | 'medium' | 'low',
    contact: ''
  });

  const handleAddFeedback = () => {
    if (newFeedback.prospectName && newFeedback.feedback) {
      const feedback: Feedback = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        ...newFeedback
      };
      setFeedbackList([feedback, ...feedbackList]);
      setNewFeedback({
        prospectName: '',
        rating: 5,
        feedback: '',
        interest: 'medium',
        contact: ''
      });
      setShowAddForm(false);
    }
  };

  const getInterestBadge = (interest: string) => {
    switch (interest) {
      case 'high':
        return <Badge className="bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20">High Interest</Badge>;
      case 'medium':
        return <Badge className="bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20">Medium Interest</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Low Interest</Badge>;
      default:
        return null;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-[#FF9800] fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="bg-white border-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-900">Open Home Feedback</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="border-[#1B5E20] text-[#1B5E20] hover:bg-[#1B5E20] hover:text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Feedback
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Feedback Form */}
        {showAddForm && (
          <Card className="border border-gray-200 bg-gray-50">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prospect Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={newFeedback.prospectName}
                    onChange={(e) => setNewFeedback({ ...newFeedback, prospectName: e.target.value })}
                    placeholder="Enter prospect name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={newFeedback.contact}
                    onChange={(e) => setNewFeedback({ ...newFeedback, contact: e.target.value })}
                    placeholder="Email or phone"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={newFeedback.rating}
                    onChange={(e) => setNewFeedback({ ...newFeedback, rating: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num} Star{num !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interest Level
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    value={newFeedback.interest}
                    onChange={(e) => setNewFeedback({ ...newFeedback, interest: e.target.value as 'high' | 'medium' | 'low' })}
                  >
                    <option value="high">High Interest</option>
                    <option value="medium">Medium Interest</option>
                    <option value="low">Low Interest</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback Notes
                </label>
                <Textarea
                  className="w-full"
                  value={newFeedback.feedback}
                  onChange={(e) => setNewFeedback({ ...newFeedback, feedback: e.target.value })}
                  placeholder="Enter detailed feedback from the prospect..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white"
                  onClick={handleAddFeedback}
                >
                  Add Feedback
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feedback List */}
        <div className="space-y-4">
          {feedbackList.map((feedback) => (
            <Card key={feedback.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">{feedback.prospectName}</h4>
                      <div className="flex items-center gap-1">
                        {renderStars(feedback.rating)}
                      </div>
                      {getInterestBadge(feedback.interest)}
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>Date: {feedback.date}</p>
                      <p>Contact: {feedback.contact}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{feedback.feedback}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {feedbackList.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No feedback recorded yet. Add feedback from open home visits.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OpenHomeFeedback;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Target, Home, Gavel } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  date: string;
  type: 'listing' | 'open-home' | 'deadline' | 'auction' | 'campaign-end';
  status: 'completed' | 'upcoming' | 'today';
  description?: string;
}

const CampaignCalendar = () => {
  const [milestones] = useState<Milestone[]>([
    {
      id: '1',
      title: 'Listing Goes Live',
      date: '2024-02-10',
      type: 'listing',
      status: 'completed',
      description: 'Property listed on Trade Me and RealEstate.co.nz'
    },
    {
      id: '2',
      title: 'First Open Home',
      date: '2024-02-17',
      type: 'open-home',
      status: 'completed',
      description: 'Weekend open home 2:00 PM - 3:00 PM'
    },
    {
      id: '3',
      title: 'Second Open Home',
      date: '2024-02-18',
      type: 'open-home',
      status: 'completed',
      description: 'Sunday open home 11:00 AM - 12:00 PM'
    },
    {
      id: '4',
      title: 'Offer Deadline',
      date: '2024-02-21',
      type: 'deadline',
      status: 'upcoming',
      description: 'Deadline for best offers by 5:00 PM'
    },
    {
      id: '5',
      title: 'Final Open Home',
      date: '2024-02-24',
      type: 'open-home',
      status: 'upcoming',
      description: 'Last weekend viewing before auction'
    },
    {
      id: '6',
      title: 'Auction Date',
      date: '2024-02-28',
      type: 'auction',
      status: 'upcoming',
      description: 'On-site auction at 2:00 PM'
    }
  ]);

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'listing':
        return <Target className="h-5 w-5 text-[#1B5E20]" />;
      case 'open-home':
        return <Home className="h-5 w-5 text-[#FF9800]" />;
      case 'deadline':
        return <Clock className="h-5 w-5 text-[#D32F2F]" />;
      case 'auction':
        return <Gavel className="h-5 w-5 text-[#1B5E20]" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20">Completed</Badge>;
      case 'today':
        return <Badge className="bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20">Today</Badge>;
      case 'upcoming':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Upcoming</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NZ', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const isPast = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString < today;
  };

  return (
    <Card className="bg-white border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Campaign Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="relative">
              {/* Timeline connector */}
              {index < milestones.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200"></div>
              )}
              
              <Card className={`border ${
                isToday(milestone.date) 
                  ? 'border-[#FF9800] bg-[#FF9800]/5' 
                  : isPast(milestone.date)
                    ? 'border-[#388E3C] bg-[#388E3C]/5'
                    : 'border-gray-200'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${
                      isToday(milestone.date)
                        ? 'bg-[#FF9800]/10'
                        : isPast(milestone.date)
                          ? 'bg-[#388E3C]/10'
                          : 'bg-gray-100'
                    }`}>
                      {getMilestoneIcon(milestone.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                        {getStatusBadge(
                          isToday(milestone.date) 
                            ? 'today' 
                            : isPast(milestone.date) 
                              ? 'completed' 
                              : 'upcoming'
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(milestone.date)}</span>
                        </div>
                      </div>
                      
                      {milestone.description && (
                        <p className="text-sm text-gray-700">{milestone.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Campaign Summary */}
        <Card className="border border-gray-200 bg-gray-50 mt-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500 mb-1">Campaign Duration</p>
                <p className="font-semibold text-gray-900">18 days</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Open Homes Completed</p>
                <p className="font-semibold text-gray-900">2 of 3</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Days to Auction</p>
                <p className="font-semibold text-gray-900">7 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default CampaignCalendar;

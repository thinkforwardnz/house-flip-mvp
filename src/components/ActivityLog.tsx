
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useActivityLog } from '@/hooks/useActivityLog';
import { 
  Activity, 
  Search, 
  Filter, 
  Download,
  Calendar,
  FileText,
  DollarSign,
  Users,
  Settings,
  Eye,
  CheckSquare
} from 'lucide-react';

const ActivityLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterUser, setFilterUser] = useState('all');

  const { activities, summary, isLoading, error } = useActivityLog();

  const getIcon = (iconName: string) => {
    const icons = {
      FileText,
      DollarSign,
      Users,
      Settings,
      Eye,
      CheckSquare
    };
    return icons[iconName as keyof typeof icons] || FileText;
  };

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'deal_created', label: 'Deal Created' },
    { value: 'task_created', label: 'Task Created' },
    { value: 'offer_submitted', label: 'Offer Submitted' },
    { value: 'offer_accepted', label: 'Offer Accepted' },
    { value: 'offer_pending', label: 'Offer Pending' },
    { value: 'document_uploaded', label: 'Document Uploaded' }
  ];

  // Get unique users from activities for filter dropdown
  const users = [
    { value: 'all', label: 'All Users' },
    ...Array.from(new Set(activities.map(activity => activity.user_name)))
      .map(userName => ({
        value: userName.toLowerCase().replace(' ', '_'),
        label: userName
      }))
  ];

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || activity.type === filterType;
    const matchesUser = filterUser === 'all' || activity.user_name.toLowerCase().includes(filterUser);
    
    return matchesSearch && matchesType && matchesUser;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getActivityBadge = (type: string) => {
    const badges = {
      deal_created: { color: 'bg-blue-100 text-blue-800', label: 'Deal' },
      deal_updated: { color: 'bg-blue-100 text-blue-800', label: 'Deal' },
      task_created: { color: 'bg-purple-100 text-purple-800', label: 'Task' },
      offer_submitted: { color: 'bg-yellow-100 text-yellow-800', label: 'Offer' },
      offer_accepted: { color: 'bg-green-100 text-green-800', label: 'Offer' },
      offer_pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Offer' },
      document_uploaded: { color: 'bg-orange-100 text-orange-800', label: 'Document' },
      team_invite: { color: 'bg-purple-100 text-purple-800', label: 'Team' },
      settings_changed: { color: 'bg-gray-100 text-gray-800', label: 'Settings' },
      property_viewed: { color: 'bg-indigo-100 text-indigo-800', label: 'Property' }
    };
    
    return badges[type as keyof typeof badges] || { color: 'bg-gray-100 text-gray-800', label: 'Activity' };
  };

  const handleExportLog = () => {
    // Export functionality would be implemented here
    console.log('Exporting activity log...');
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Log & Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.value} value={user.value}>
                    {user.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={handleExportLog}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Activity Feed */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => {
                const IconComponent = getIcon(activity.icon);
                const badge = getActivityBadge(activity.type);
                
                return (
                  <div key={activity.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-lg bg-gray-100 ${activity.color}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/placeholder.svg" alt={activity.user_name} />
                          <AvatarFallback className="text-xs">{getInitials(activity.user_name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{activity.user_name}</span>
                        <Badge className={badge.color}>{badge.label}</Badge>
                      </div>
                      
                      <p className="text-sm text-gray-900 mb-1">
                        <span className="font-medium">{activity.action}</span>
                        {activity.details && (
                          <span className="text-gray-600 ml-1">{activity.details}</span>
                        )}
                      </p>
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredActivities.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No activities found matching your filters.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Summary (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.dealsCreated || 0}</div>
                <div className="text-sm text-gray-600">Deals Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.offersSubmitted || 0}</div>
                <div className="text-sm text-gray-600">Offers Submitted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{summary.documentsUploaded || 0}</div>
                <div className="text-sm text-gray-600">Documents Uploaded</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{summary.teamMembersAdded || 0}</div>
                <div className="text-sm text-gray-600">Team Members Added</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLog;

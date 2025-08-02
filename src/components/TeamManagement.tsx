
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  UserPlus, 
  Mail, 
  MoreVertical, 
  Trash2, 
  Shield, 
  Eye,
  Edit,
  Send,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

const TeamManagement = () => {
  const { toast } = useToast();
  const { teamMembers, isLoading, error } = useTeamMembers();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'investor',
    message: ''
  });

  const roleColors = {
    admin: 'bg-red-100 text-red-800',
    investor: 'bg-blue-100 text-blue-800',
    team_member: 'bg-gray-100 text-gray-800'
  };

  const roleTitles = {
    admin: 'Admin',
    investor: 'Investor',
    team_member: 'Team Member'
  };

  const handleSendInvite = () => {
    if (!inviteData.email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send the invitation.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Invitation Sent",
      description: `Invitation sent to ${inviteData.email} successfully.`,
    });

    setInviteData({ email: '', role: 'viewer', message: '' });
    setShowInviteForm(false);
  };

  const handleRemoveMember = (memberName: string) => {
    toast({
      title: "Member Removed",
      description: `${memberName} has been removed from the team.`,
    });
  };

  const getInitials = (firstName: string | null, lastName: string | null, email: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (lastName) {
      return lastName[0].toUpperCase();
    }
    return email[0].toUpperCase();
  };

  const getDisplayName = (firstName: string | null, lastName: string | null, email: string) => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) {
      return firstName;
    }
    if (lastName) {
      return lastName;
    }
    return email;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading team members...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load team members</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members ({teamMembers.length})
            </CardTitle>
            <Button 
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="bg-[#1B5E20] hover:bg-[#1B5E20]/90"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Invite Form */}
          {showInviteForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="font-medium mb-4">Invite New Team Member</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email Address</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inviteRole">Role</Label>
                  <Select 
                    value={inviteData.role} 
                    onValueChange={(value) => setInviteData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="team_member">
                        <div>
                          <div className="font-medium">Team Member</div>
                          <div className="text-sm text-gray-600">Can view deals and reports</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="investor">
                        <div>
                          <div className="font-medium">Investor</div>
                          <div className="text-sm text-gray-600">Can edit deals and add comments</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div>
                          <div className="font-medium">Admin</div>
                          <div className="text-sm text-gray-600">Full access including team management</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inviteMessage">Personal Message (Optional)</Label>
                  <Input
                    id="inviteMessage"
                    value={inviteData.message}
                    onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Add a personal message to the invitation"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSendInvite} className="bg-[#1B5E20] hover:bg-[#1B5E20]/90">
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                  <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Team Members List */}
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar_url || "/placeholder.svg"} alt={getDisplayName(member.first_name, member.last_name, member.email)} />
                    <AvatarFallback>{getInitials(member.first_name, member.last_name, member.email)}</AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{getDisplayName(member.first_name, member.last_name, member.email)}</h4>
                      {member.role && (
                        <Badge className={roleColors[member.role as keyof typeof roleColors]}>
                          {roleTitles[member.role as keyof typeof roleTitles]}
                        </Badge>
                      )}
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </span>
                      {member.created_at && (
                        <span>Joined {format(new Date(member.created_at), 'MMM dd, yyyy')}</span>
                      )}
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Role
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="h-4 w-4 mr-2" />
                      Resend Invite
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => handleRemoveMember(getDisplayName(member.first_name, member.last_name, member.email))}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-700">Admin</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Full access to all deals</li>
                  <li>• Team management</li>
                  <li>• Financial data access</li>
                  <li>• Export all reports</li>
                  <li>• Account settings</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-blue-700">Investor</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Create and edit deals</li>
                  <li>• Add comments & notes</li>
                  <li>• Upload documents</li>
                  <li>• View team activity</li>
                  <li>• Access all reports</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Team Member</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• View assigned deals</li>
                  <li>• Add comments on deals</li>
                  <li>• View shared documents</li>
                  <li>• View team activity</li>
                  <li>• Basic reporting access</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamManagement;

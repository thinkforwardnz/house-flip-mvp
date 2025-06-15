
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Bell, Settings as SettingsIcon, Users, Activity, Globe } from 'lucide-react';
import ProfileSettings from '@/components/ProfileSettings';
import NotificationSettings from '@/components/NotificationSettings';
import PreferenceSettings from '@/components/PreferenceSettings';
import TeamManagement from '@/components/TeamManagement';
import ActivityLog from '@/components/ActivityLog';
import ScraperEndpointSettings from '@/components/ScraperEndpointSettings';

const Settings = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-blue-100 text-lg">Manage your account and preferences</p>
      </div>

      {/* Settings Tabs */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-6 bg-gray-100 rounded-xl p-1">
              <TabsTrigger value="profile" className="flex items-center gap-2 rounded-xl">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 rounded-xl">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2 rounded-xl">
                <SettingsIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="endpoints" className="flex items-center gap-2 rounded-xl">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Endpoints</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center gap-2 rounded-xl">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Team</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2 rounded-xl">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileSettings />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationSettings />
            </TabsContent>

            <TabsContent value="preferences">
              <PreferenceSettings />
            </TabsContent>

            <TabsContent value="endpoints">
              <ScraperEndpointSettings />
            </TabsContent>

            <TabsContent value="team">
              <TeamManagement />
            </TabsContent>

            <TabsContent value="activity">
              <ActivityLog />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

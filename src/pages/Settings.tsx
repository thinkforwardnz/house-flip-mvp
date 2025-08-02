import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Bell, Settings as SettingsIcon, Users, Activity, Globe, Archive } from 'lucide-react';
import ProfileSettings from '@/components/ProfileSettings';
import NotificationSettings from '@/components/NotificationSettings';
import PreferenceSettings from '@/components/PreferenceSettings';
import TeamManagement from '@/components/TeamManagement';
import ActivityLog from '@/components/ActivityLog';
import ApiConfigurationManager from '@/components/ApiConfigurationManager';
import ArchivedProperties from '@/components/ArchivedProperties';
import { useProfile } from '@/hooks/useProfile';
const Settings = () => {
  const { profile } = useProfile();
  const isAdmin = profile?.role === 'admin';

  return <div className="w-[1280px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-700 mb-2">Settings</h1>
        <p className="text-lg text-slate-700">Manage your account and preferences</p>
      </div>

      {/* Settings Tabs */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-7' : 'grid-cols-6'} mb-6 bg-gray-100 rounded-xl p-1`}>
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
              {isAdmin && (
                <TabsTrigger value="endpoints" className="flex items-center gap-2 rounded-xl">
                  <Globe className="h-4 w-4" />
                  <span className="hidden sm:inline">API Keys</span>
                </TabsTrigger>
              )}
              {isAdmin && (
                <TabsTrigger value="team" className="flex items-center gap-2 rounded-xl">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Team</span>
                </TabsTrigger>
              )}
              <TabsTrigger value="archive" className="flex items-center gap-2 rounded-xl">
                <Archive className="h-4 w-4" />
                <span className="hidden sm:inline">Archive</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2 rounded-xl">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="min-h-[600px]">
              <ProfileSettings />
            </TabsContent>

            <TabsContent value="notifications" className="min-h-[600px]">
              <NotificationSettings />
            </TabsContent>

            <TabsContent value="preferences" className="min-h-[600px]">
              <PreferenceSettings />
            </TabsContent>

            {isAdmin && (
              <TabsContent value="endpoints" className="min-h-[600px]">
                <ApiConfigurationManager />
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent value="team" className="min-h-[600px]">
                <TeamManagement />
              </TabsContent>
            )}

            <TabsContent value="archive" className="min-h-[600px]">
              <ArchivedProperties />
            </TabsContent>

            <TabsContent value="activity" className="min-h-[600px]">
              <ActivityLog />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
};
export default Settings;
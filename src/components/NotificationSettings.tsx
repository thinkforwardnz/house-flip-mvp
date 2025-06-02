
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Mail, MessageSquare, Phone, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NotificationSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    email: {
      dealUpdates: true,
      marketAlerts: true,
      taskReminders: true,
      weeklyReports: false,
      teamNotifications: true,
    },
    sms: {
      urgentAlerts: true,
      appointmentReminders: true,
      offerUpdates: false,
    },
    inApp: {
      allNotifications: true,
      soundEnabled: false,
      pushNotifications: true,
    }
  });

  const handleToggle = (category: string, setting: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: !prev[category as keyof typeof prev][setting as keyof typeof prev[category as keyof typeof prev]]
      }
    }));
  };

  const handleSave = () => {
    toast({
      title: "Notification Preferences Updated",
      description: "Your notification settings have been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dealUpdates">Deal Updates</Label>
              <p className="text-sm text-gray-600">Status changes, new offers, contract updates</p>
            </div>
            <Switch
              id="dealUpdates"
              checked={settings.email.dealUpdates}
              onCheckedChange={() => handleToggle('email', 'dealUpdates')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="marketAlerts">Market Alerts</Label>
              <p className="text-sm text-gray-600">New properties matching your criteria</p>
            </div>
            <Switch
              id="marketAlerts"
              checked={settings.email.marketAlerts}
              onCheckedChange={() => handleToggle('email', 'marketAlerts')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="taskReminders">Task Reminders</Label>
              <p className="text-sm text-gray-600">Due diligence deadlines, follow-ups</p>
            </div>
            <Switch
              id="taskReminders"
              checked={settings.email.taskReminders}
              onCheckedChange={() => handleToggle('email', 'taskReminders')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weeklyReports">Weekly Reports</Label>
              <p className="text-sm text-gray-600">Portfolio performance and market insights</p>
            </div>
            <Switch
              id="weeklyReports"
              checked={settings.email.weeklyReports}
              onCheckedChange={() => handleToggle('email', 'weeklyReports')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="teamNotifications">Team Notifications</Label>
              <p className="text-sm text-gray-600">Team member activities and updates</p>
            </div>
            <Switch
              id="teamNotifications"
              checked={settings.email.teamNotifications}
              onCheckedChange={() => handleToggle('email', 'teamNotifications')}
            />
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="urgentAlerts">Urgent Alerts</Label>
              <p className="text-sm text-gray-600">Critical deadlines and immediate actions needed</p>
            </div>
            <Switch
              id="urgentAlerts"
              checked={settings.sms.urgentAlerts}
              onCheckedChange={() => handleToggle('sms', 'urgentAlerts')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="appointmentReminders">Appointment Reminders</Label>
              <p className="text-sm text-gray-600">Property viewings, meetings, inspections</p>
            </div>
            <Switch
              id="appointmentReminders"
              checked={settings.sms.appointmentReminders}
              onCheckedChange={() => handleToggle('sms', 'appointmentReminders')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="offerUpdates">Offer Updates</Label>
              <p className="text-sm text-gray-600">Offer responses and counter-offers</p>
            </div>
            <Switch
              id="offerUpdates"
              checked={settings.sms.offerUpdates}
              onCheckedChange={() => handleToggle('sms', 'offerUpdates')}
            />
          </div>
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            In-App Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allNotifications">All Notifications</Label>
              <p className="text-sm text-gray-600">Show notifications within the app</p>
            </div>
            <Switch
              id="allNotifications"
              checked={settings.inApp.allNotifications}
              onCheckedChange={() => handleToggle('inApp', 'allNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="soundEnabled">Sound Alerts</Label>
              <p className="text-sm text-gray-600">Play sound for new notifications</p>
            </div>
            <Switch
              id="soundEnabled"
              checked={settings.inApp.soundEnabled}
              onCheckedChange={() => handleToggle('inApp', 'soundEnabled')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="pushNotifications">Browser Push Notifications</Label>
              <p className="text-sm text-gray-600">Receive notifications when app is closed</p>
            </div>
            <Switch
              id="pushNotifications"
              checked={settings.inApp.pushNotifications}
              onCheckedChange={() => handleToggle('inApp', 'pushNotifications')}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="bg-[#1B5E20] hover:bg-[#1B5E20]/90">
        <Save className="h-4 w-4 mr-2" />
        Save Notification Settings
      </Button>
    </div>
  );
};

export default NotificationSettings;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/components/AuthProvider';
import { User, Mail, Phone } from 'lucide-react';

const ProfileSettings = () => {
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardHeader className="p-6">
            <CardTitle className="text-navy-dark">Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardHeader className="p-6">
          <CardTitle className="text-navy-dark">Profile Settings</CardTitle>
          <p className="text-navy text-sm">Update your personal information</p>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name" className="text-navy-dark">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="first_name"
                    type="text"
                    placeholder="Enter your first name"
                    className="pl-10 rounded-xl"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="last_name" className="text-navy-dark">Last Name</Label>
                <Input
                  id="last_name"
                  type="text"
                  placeholder="Enter your last name"
                  className="rounded-xl"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email" className="text-navy-dark">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10 rounded-xl"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed here. Use authentication settings to update your email.
              </p>
            </div>
            
            <div>
              <Label htmlFor="phone" className="text-navy-dark">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  className="pl-10 rounded-xl"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl"
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {profile && (
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardHeader className="p-6">
            <CardTitle className="text-navy-dark">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-sm text-navy space-y-1">
              <p>User ID: {user?.id}</p>
              <p>Account created: {new Date(profile.created_at).toLocaleDateString()}</p>
              <p>Last updated: {new Date(profile.updated_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileSettings;

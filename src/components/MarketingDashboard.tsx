
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Plus, Calendar } from 'lucide-react';

const MarketingDashboard = () => {
  const [showAddOpenHome, setShowAddOpenHome] = useState(false);

  const agentInfo = {
    name: 'Sarah Mitchell',
    phone: '+64 21 123 4567',
    email: 'sarah.mitchell@realestate.co.nz',
    agency: 'Premium Properties Auckland'
  };

  const listings = [
    {
      platform: 'Trade Me',
      url: 'https://trademe.co.nz/property/123456',
      status: 'Live',
      views: 2847
    },
    {
      platform: 'RealEstate.co.nz',
      url: 'https://realestate.co.nz/property/654321',
      status: 'Live',
      views: 1923
    }
  ];

  const openHomes = [
    { date: '2024-02-17', time: '2:00 PM - 3:00 PM', attendees: 12 },
    { date: '2024-02-18', time: '11:00 AM - 12:00 PM', attendees: 8 },
    { date: '2024-02-24', time: '2:00 PM - 3:00 PM', attendees: null }
  ];

  return (
    <div className="mb-6 space-y-6">
      {/* Agent Information */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Agent Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Agent</p>
              <p className="text-gray-900">{agentInfo.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Phone</p>
              <p className="text-gray-900">{agentInfo.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Email</p>
              <p className="text-gray-900">{agentInfo.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Agency</p>
              <p className="text-gray-900">{agentInfo.agency}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listing Links */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Online Listings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {listings.map((listing, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{listing.platform}</h4>
                    <p className="text-sm text-gray-500">{listing.views} views</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20">
                    {listing.status}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300"
                    onClick={() => window.open(listing.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Open Homes Calendar */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Open Homes</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddOpenHome(!showAddOpenHome)}
              className="border-[#1B5E20] text-[#1B5E20] hover:bg-[#1B5E20] hover:text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Open Home
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {openHomes.map((openHome, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-[#FF9800]" />
                  <div>
                    <p className="font-medium text-gray-900">{openHome.date}</p>
                    <p className="text-sm text-gray-500">{openHome.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {openHome.attendees ? `${openHome.attendees} attendees` : 'Upcoming'}
                  </p>
                </div>
              </div>
            ))}
            
            {showAddOpenHome && (
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Date"
                  />
                  <input
                    type="time"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Start time"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white">
                    Add
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowAddOpenHome(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketingDashboard;


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Calendar, Clock } from 'lucide-react';

interface Tradie {
  id: string;
  name: string;
  trade: string;
  phone: string;
  email: string;
  status: 'available' | 'busy' | 'on-site' | 'unavailable';
  currentJob?: string;
  nextAvailable?: string;
  rating: number;
}

const TradieScheduler = () => {
  const tradies: Tradie[] = [
    {
      id: '1',
      name: 'John Smith',
      trade: 'Carpenter',
      phone: '021 123 4567',
      email: 'john@example.com',
      status: 'on-site',
      currentJob: 'Kitchen Cabinet Installation',
      rating: 4.8
    },
    {
      id: '2',
      name: 'Mike Johnson',
      trade: 'Tiler',
      phone: '021 234 5678',
      email: 'mike@example.com',
      status: 'available',
      nextAvailable: '2024-02-15',
      rating: 4.6
    },
    {
      id: '3',
      name: 'Sarah Wilson',
      trade: 'Electrician',
      phone: '021 345 6789',
      email: 'sarah@example.com',
      status: 'busy',
      currentJob: 'Electrical Rewiring',
      nextAvailable: '2024-02-12',
      rating: 4.9
    },
    {
      id: '4',
      name: 'Dave Brown',
      trade: 'Plumber',
      phone: '021 456 7890',
      email: 'dave@example.com',
      status: 'available',
      nextAvailable: '2024-02-10',
      rating: 4.7
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20';
      case 'busy': return 'bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20';
      case 'on-site': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'unavailable': return 'bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Tradie Schedule</h2>
        <Button className="bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white">
          Add Tradie
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tradies.map((tradie) => (
          <Card key={tradie.id} className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{tradie.name}</h3>
                    <p className="text-sm text-gray-600">{tradie.trade}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-sm text-[#FF9800]">★</span>
                      <span className="text-sm text-gray-600">{tradie.rating}</span>
                    </div>
                  </div>
                  <Badge className={`text-xs px-3 py-1 ${getStatusColor(tradie.status)}`}>
                    {tradie.status.replace('-', ' ')}
                  </Badge>
                </div>

                {tradie.currentJob && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Current Job:</p>
                    <p className="text-sm text-gray-600">{tradie.currentJob}</p>
                  </div>
                )}

                {tradie.nextAvailable && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Next available: {tradie.nextAvailable}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{tradie.phone}</span>
                  </div>
                  <p className="text-sm text-gray-600">{tradie.email}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 border-gray-300 text-gray-600">
                    Contact
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 border-[#1B5E20] text-[#1B5E20]">
                    Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TradieScheduler;

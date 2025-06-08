
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, MapPin, Ruler } from 'lucide-react';
import type { Deal } from '@/types/analysis';

interface CMASubjectPropertyProps {
  deal: Deal;
}

const CMASubjectProperty = ({ deal }: CMASubjectPropertyProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-navy-dark flex items-center gap-2">
            <Home className="h-5 w-5" />
            Subject Property Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-navy-dark">Address:</span>
                <span className="text-navy">{deal.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-navy-dark">Property Type:</span>
                <span className="text-navy">Residential House</span>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-navy-dark">Floor Area:</span>
                <span className="text-navy">{deal.floor_area ? `${deal.floor_area}m²` : 'TBD'}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-navy-dark">Bedrooms:</span>
                <span className="text-navy">{deal.bedrooms || 'TBD'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-navy-dark">Bathrooms:</span>
                <span className="text-navy">{deal.bathrooms || 'TBD'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-navy-dark">Land Area:</span>
                <span className="text-navy">{deal.land_area ? `${deal.land_area}m²` : 'TBD'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Photos */}
      {deal.photos && deal.photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-navy-dark">Property Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {deal.photos.slice(0, 6).map((photo, index) => (
                <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={photo} 
                    alt={`Property photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CMASubjectProperty;

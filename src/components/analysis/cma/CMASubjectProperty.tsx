
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, MapPin, Ruler, RefreshCw, Car, Wifi } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Deal } from '@/types/analysis';

interface CMASubjectPropertyProps {
  deal: Deal;
  onDealUpdate?: (updatedDeal: Deal) => void;
}

const CMASubjectProperty = ({ deal, onDealUpdate }: CMASubjectPropertyProps) => {
  const [isEnriching, setIsEnriching] = useState(false);
  const { toast } = useToast();

  const handleEnrichProperty = async () => {
    setIsEnriching(true);
    try {
      console.log('Starting property enrichment for deal:', deal.id);
      
      const { data, error } = await supabase.functions.invoke('enrich-deal-property', {
        body: { dealId: deal.id }
      });

      if (error) {
        console.error('Enrichment error:', error);
        throw error;
      }

      if (data.success) {
        toast({
          title: "Property Enriched",
          description: "Property data has been updated with latest information",
        });

        // Fetch the updated deal data
        const { data: updatedDealData, error: fetchError } = await supabase
          .from('deals')
          .select('*')
          .eq('id', deal.id)
          .single();

        if (!fetchError && updatedDealData && onDealUpdate) {
          // Transform the Supabase data to match our Deal interface
          const transformedDeal: Deal = {
            ...updatedDealData,
            coordinates: updatedDealData.coordinates && 
              typeof updatedDealData.coordinates === 'object' && 
              updatedDealData.coordinates !== null &&
              'lat' in updatedDealData.coordinates && 
              'lng' in updatedDealData.coordinates
              ? {
                  lat: (updatedDealData.coordinates as any).lat,
                  lng: (updatedDealData.coordinates as any).lng
                }
              : undefined
          };
          onDealUpdate(transformedDeal);
        }
      } else {
        toast({
          title: "No New Data",
          description: data.message || "No additional property data found",
        });
      }
    } catch (error: any) {
      console.error('Error enriching property:', error);
      toast({
        title: "Enrichment Failed",
        description: error.message || "Failed to enrich property data",
        variant: "destructive",
      });
    } finally {
      setIsEnriching(false);
    }
  };

  // Get listing details if available
  const listingDetails = deal.listing_details || {};

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-navy-dark flex items-center gap-2">
              <Home className="h-5 w-5" />
              Subject Property Details
            </CardTitle>
            <Button
              onClick={handleEnrichProperty}
              disabled={isEnriching}
              variant="outline"
              size="sm"
              className="rounded-xl"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isEnriching ? 'animate-spin' : ''}`} />
              {isEnriching ? 'Enriching...' : 'Refresh Data'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-navy-dark">Address:</span>
                <span className="text-navy">{deal.address}</span>
              </div>
              
              {listingDetails.type && (
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-navy-dark">Property Type:</span>
                  <span className="text-navy">{listingDetails.type}</span>
                </div>
              )}
              
              {!listingDetails.type && (
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-navy-dark">Property Type:</span>
                  <span className="text-navy">Residential House</span>
                </div>
              )}

              {listingDetails.method && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-navy-dark">Sale Method:</span>
                  <span className="text-navy">{listingDetails.method}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-navy-dark">Floor Area:</span>
                <span className="text-navy">{deal.floor_area ? `${deal.floor_area}m²` : 'TBD'}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium text-navy-dark">Land Area:</span>
                <span className="text-navy">{deal.land_area ? `${deal.land_area}m²` : 'TBD'}</span>
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

              {listingDetails.parking && (
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-navy-dark">Parking:</span>
                  <span className="text-navy">{listingDetails.parking}</span>
                </div>
              )}

              {listingDetails.internet && (
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-navy-dark">Internet:</span>
                  <span className="text-navy">{listingDetails.internet}</span>
                </div>
              )}

              {listingDetails.date && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-navy-dark">Listed:</span>
                  <span className="text-navy">{listingDetails.date}</span>
                </div>
              )}
            </div>
          </div>

          {listingDetails.other_features && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="space-y-2">
                <span className="font-medium text-navy-dark">Additional Features:</span>
                <p className="text-navy text-sm">{listingDetails.other_features}</p>
              </div>
            </div>
          )}
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
            {deal.photos.length > 6 && (
              <p className="text-sm text-gray-500 mt-2">
                Showing 6 of {deal.photos.length} photos
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CMASubjectProperty;

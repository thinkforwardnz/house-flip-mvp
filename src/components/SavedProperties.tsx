import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Trash2, ExternalLink } from 'lucide-react';
import { useSavedListings } from '@/hooks/useScrapedListings';
import { Skeleton } from '@/components/ui/skeleton';

interface ScrapedListing {
  id: string;
  address: string;
  suburb: string | null;
  city: string | null;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  floor_area: number | null;
  photos: string[] | null;
  source_url: string;
}

const SavedProperties = () => {
  const { savedListings, isLoading } = useSavedListings();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Saved Properties</h2>
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Saved Properties</h2>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>
      
      {savedListings.length === 0 ? (
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Properties</h3>
            <p className="text-gray-600 mb-4">
              Properties you save for later will appear here for easy access.
            </p>
            <Button variant="outline">
              Browse Properties
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedListings.map((listing: ScrapedListing) => (
            <Card key={listing.id} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
                    {listing.address}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {listing.suburb}, {listing.city || 'Auckland'}
                  </p>
                </div>
                
                <div className="mb-3">
                  <div className="text-lg font-bold text-gray-900 mb-1">
                    {formatCurrency(Number(listing.price))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>{listing.bedrooms || 0} beds</span>
                    <span>{listing.bathrooms || 0} baths</span>
                    <span>{listing.floor_area || 0}m²</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => window.open(listing.source_url, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Listing
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-xs px-2 text-gray-500 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedProperties;

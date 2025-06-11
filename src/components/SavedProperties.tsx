
import React from 'react';
import { usePropertiesByTags } from '@/hooks/useUnifiedProperties';
import PropertyListingCard from '@/components/PropertyListingCard';
import { Skeleton } from '@/components/ui/skeleton';

const SavedProperties = () => {
  const { data: savedProperties, isLoading } = usePropertiesByTags(['saved']);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!savedProperties || savedProperties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No saved properties found.</p>
        <p className="text-sm text-gray-400">Properties you save from the feed will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {savedProperties.map((property) => {
        const featuredImage = property.photos && property.photos.length > 0 
          ? property.photos[0] 
          : '/placeholder.svg';

        const transformedProperty = {
          id: property.id,
          address: property.address,
          suburb: property.suburb || '',
          city: property.city || 'Auckland',
          price: Number(property.current_price || 0),
          bedrooms: property.bedrooms || 0,
          bathrooms: Number(property.bathrooms || 0),
          floorArea: Number(property.floor_area || 0),
          landArea: Number(property.land_area || 0),
          imageUrl: featuredImage,
          listingUrl: property.source_url || '',
          description: property.description || 'No description available',
          aiAnalysis: {
            renovationCost: Number(property.ai_reno_cost || 0),
            arv: Number(property.ai_arv || 0),
            projectedProfit: Number(property.ai_est_profit || 0),
            flipPotential: (property.flip_potential as 'High' | 'Medium' | 'Low') || 'Medium',
            confidence: property.ai_confidence || 0,
          },
          source: property.source_site || 'Unknown',
          listedDate: property.listing_date || property.date_scraped || property.created_at,
        };

        return (
          <PropertyListingCard
            key={property.id}
            property={transformedProperty}
            onAnalyse={() => {}}
            onSaveForLater={() => {}}
            onDismiss={() => {}}
            isLoading={false}
            userAction="saved"
          />
        );
      })}
    </div>
  );
};

export default SavedProperties;

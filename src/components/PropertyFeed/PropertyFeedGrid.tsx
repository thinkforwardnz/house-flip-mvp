
import React from 'react';
import PropertyListingCard from '@/components/PropertyListingCard';
import { UnifiedProperty } from '@/hooks/useUnifiedProperties';

interface PropertyFeedGridProps {
  properties: UnifiedProperty[];
  onAnalyse: (property: UnifiedProperty) => void;
  onSaveForLater: (property: UnifiedProperty) => void;
  onDismiss: (property: UnifiedProperty) => void;
}

const PropertyFeedGrid = ({ 
  properties, 
  onAnalyse, 
  onSaveForLater, 
  onDismiss 
}: PropertyFeedGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => {
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

        // Determine user action based on tags
        let userAction: 'new' | 'saved' | 'dismissed' | 'imported' = 'new';
        if (property.tags.includes('saved')) userAction = 'saved';
        if (property.tags.includes('dismissed')) userAction = 'dismissed';
        if (property.tags.includes('deal')) userAction = 'imported';

        return (
          <PropertyListingCard
            key={property.id}
            property={transformedProperty}
            onAnalyse={() => onAnalyse(property)}
            onSaveForLater={() => onSaveForLater(property)}
            onDismiss={() => onDismiss(property)}
            isLoading={false}
            userAction={userAction}
          />
        );
      })}
    </div>
  );
};

export default PropertyFeedGrid;


import React, { useState } from 'react';
import PropertyListingCard from '@/components/PropertyListingCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { useScrapedListings } from '@/hooks/useScrapedListings';
import { useEnhancedScraping } from '@/hooks/useEnhancedScraping';
import ScrapingProgress from '@/components/ScrapingProgress';

interface SearchFilters {
  suburb: string;
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  maxBeds: string;
  minBaths: string;
  maxBaths: string;
  keywords: string;
}

interface PropertyFeedProps {
  filters: SearchFilters;
}

const PropertyFeed = ({ filters }: PropertyFeedProps) => {
  const {
    listings,
    isLoading,
    error,
    saveListing,
    dismissListing,
    importAsDeal,
    isSaving,
    isDismissing,
    isImporting
  } = useScrapedListings(filters);

  const {
    isScrapingActive,
    sourceProgress,
    totalProgress,
    startScraping,
    cancelScraping,
  } = useEnhancedScraping();

  const handleImportAsDeal = (listing: any) => {
    importAsDeal(listing);
  };

  const handleSaveForLater = (listing: any) => {
    saveListing(listing.id);
  };

  const handleDismiss = (listing: any) => {
    dismissListing(listing.id);
  };

  const handleRefresh = () => {
    if (isScrapingActive) return;
    
    const scrapingFilters = {
      suburb: filters.suburb,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minBeds: filters.minBeds,
      keywords: filters.keywords
    };
    
    startScraping(scrapingFilters);
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading properties. Please try again.</p>
      </div>
    );
  }

  // Filter out dismissed listings from display
  const visibleListings = listings.filter(listing => 
    listing.user_action !== 'dismissed' && listing.user_action !== 'imported'
  );

  return (
    <div className="space-y-6">
      {/* Scraping Progress */}
      <ScrapingProgress
        isActive={isScrapingActive}
        sources={sourceProgress}
        totalProgress={totalProgress}
        onCancel={cancelScraping}
      />

      {/* Property Listings */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600">
              Found {visibleListings.length} properties matching your criteria
            </p>
            <Button 
              variant="outline"
              onClick={handleRefresh}
              disabled={isScrapingActive}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isScrapingActive ? 'animate-spin' : ''}`} />
              {isScrapingActive ? 'Scraping...' : 'Refresh Feed'}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleListings.map((listing) => {
              // Get the featured image from photos array
              const featuredImage = listing.photos && listing.photos.length > 0 
                ? listing.photos[0] 
                : '/placeholder.svg';
              
              console.log('Listing photos for', listing.address, ':', listing.photos);
              console.log('Featured image URL:', featuredImage);

              // Transform scraped listing to match PropertyListingCard props
              const property = {
                id: listing.id,
                address: listing.address,
                suburb: listing.suburb || '',
                city: listing.city || 'Auckland',
                price: Number(listing.price),
                bedrooms: listing.bedrooms || 0,
                bathrooms: Number(listing.bathrooms || 0),
                floorArea: Number(listing.floor_area || 0),
                landArea: Number(listing.land_area || 0),
                imageUrl: featuredImage,
                listingUrl: listing.source_url,
                description: listing.summary || 'No description available',
                aiAnalysis: {
                  renovationCost: Number(listing.ai_reno_cost || 0),
                  arv: Number(listing.ai_arv || 0),
                  projectedProfit: Number(listing.ai_est_profit || 0),
                  flipPotential: (listing.flip_potential as 'High' | 'Medium' | 'Low') || 'Medium',
                  confidence: listing.ai_confidence || 0,
                },
                source: listing.source_site || 'Unknown',
                listedDate: listing.listing_date || listing.date_scraped,
              };

              return (
                <PropertyListingCard
                  key={listing.id}
                  property={property}
                  onImportAsDeal={() => handleImportAsDeal(listing)}
                  onSaveForLater={() => handleSaveForLater(listing)}
                  onDismiss={() => handleDismiss(listing)}
                  isLoading={isSaving || isDismissing || isImporting}
                  userAction={listing.user_action}
                />
              );
            })}
          </div>
          
          {visibleListings.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No properties found matching your criteria.</p>
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isScrapingActive}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isScrapingActive ? 'animate-spin' : ''}`} />
                {isScrapingActive ? 'Scraping...' : 'Refresh Feed'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PropertyFeed;

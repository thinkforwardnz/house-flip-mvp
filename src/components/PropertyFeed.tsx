
import React, { useState } from 'react';
import PropertyListingCard from '@/components/PropertyListingCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { useProspectingProperties, UnifiedProperty } from '@/hooks/useUnifiedProperties';
import { useEnhancedScraping } from '@/hooks/useEnhancedScraping';
import { useRefreshFeed } from '@/hooks/useRefreshFeed';
import ScrapingProgress from '@/components/ScrapingProgress';
import AgentQLTestButton from '@/components/AgentQLTestButton';
import { SearchFilters } from '@/types/filters';
import { useToast } from '@/hooks/use-toast';

interface PropertyFeedProps {
  filters: SearchFilters;
  onSwitchToSavedTab?: () => void;
}

const PropertyFeed = ({ filters, onSwitchToSavedTab }: PropertyFeedProps) => {
  const {
    properties,
    isLoading,
    error,
    addTag,
    removeTag,
    refetch
  } = useProspectingProperties(filters);

  const {
    isScrapingActive,
    sourceProgress,
    totalProgress,
    startScraping,
    cancelScraping,
  } = useEnhancedScraping();

  const {
    isRefreshing,
    progress: refreshProgress,
    refreshFeed,
  } = useRefreshFeed();

  const { toast } = useToast();

  const handleImportAsDeal = (property: UnifiedProperty) => {
    // Add 'deal' and 'analysis' tags to convert to a deal
    addTag({ propertyId: property.id, tag: 'deal' });
    addTag({ propertyId: property.id, tag: 'analysis' });
    
    toast({
      title: "Property Imported",
      description: "Property has been added to your pipeline as a new deal.",
    });
  };

  const handleSaveForLater = (property: UnifiedProperty) => {
    addTag({ propertyId: property.id, tag: 'saved' });
  };

  const handleDismiss = (property: UnifiedProperty) => {
    addTag({ propertyId: property.id, tag: 'dismissed' });
  };

  const handleAnalyse = (property: UnifiedProperty) => {
    handleImportAsDeal(property);
    if (onSwitchToSavedTab) {
      setTimeout(() => {
        onSwitchToSavedTab();
      }, 1000);
    }
  };

  const handleSearchProperties = () => {
    if (isScrapingActive || isRefreshing) return;
    
    const scrapingFilters = {
      region: filters.region,
      district: filters.district,
      suburb: filters.suburb,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minBeds: filters.minBeds,
      propertyType: filters.propertyType,
      keywords: filters.keywords,
      searchNearbySuburbs: filters.searchNearbySuburbs,
      openHomesOnly: filters.openHomesOnly,
      newHomesOnly: filters.newHomesOnly
    };
    
    startScraping(scrapingFilters, filters.selectedSources);
  };

  const handleRefreshFeed = async () => {
    if (isScrapingActive || isRefreshing) return;
    
    try {
      await refreshFeed();
      refetch();
    } catch (error) {
      toast({
        title: 'Error refreshing feed',
        description: error instanceof Error ? error.message : 'An error occurred while refreshing the feed.',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    toast({
      title: 'Error loading properties',
      description: error instanceof Error ? error.message : 'An error occurred while loading properties.',
      variant: 'destructive',
    });
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading properties. Please try again.</p>
      </div>
    );
  }

  // Filter out dismissed and imported properties from display
  const visibleProperties = properties.filter(property => 
    !property.tags.includes('dismissed') && !property.tags.includes('deal')
  );

  return (
    <div className="space-y-6">
      <AgentQLTestButton />

      <ScrapingProgress
        isActive={isScrapingActive}
        sources={sourceProgress}
        totalProgress={totalProgress}
        onCancel={cancelScraping}
      />

      {isRefreshing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-900">
              Refreshing Feed Data...
            </h3>
          </div>
          <p className="text-sm text-blue-700 mb-2">
            Completed: {refreshProgress.completed} | Skipped: {refreshProgress.skipped} | Total: {refreshProgress.total}
          </p>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: refreshProgress.total > 0 
                  ? `${((refreshProgress.completed + refreshProgress.skipped) / refreshProgress.total) * 100}%`
                  : '0%'
              }}
            />
          </div>
        </div>
      )}

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
              Found {visibleProperties.length} properties matching your criteria
            </p>
            <Button 
              variant="outline"
              onClick={handleRefreshFeed}
              disabled={isRefreshing || isScrapingActive}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Feed'}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProperties.map((property) => {
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
                  onAnalyse={() => handleAnalyse(property)}
                  onSaveForLater={() => handleSaveForLater(property)}
                  onDismiss={() => handleDismiss(property)}
                  isLoading={false}
                  userAction={userAction}
                />
              );
            })}
          </div>
          
          {visibleProperties.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No properties found matching your criteria.</p>
              <Button 
                variant="outline" 
                onClick={handleRefreshFeed}
                disabled={isRefreshing || isScrapingActive}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Feed'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PropertyFeed;

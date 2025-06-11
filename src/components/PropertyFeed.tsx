
import React from 'react';
import { useProspectingProperties } from '@/hooks/useUnifiedProperties';
import { useEnhancedScraping } from '@/hooks/useEnhancedScraping';
import { useRefreshFeed } from '@/hooks/useRefreshFeed';
import { useToast } from '@/hooks/use-toast';
import { SearchFilters } from '@/types/filters';

import ScrapingProgress from '@/components/ScrapingProgress';
import AgentQLTestButton from '@/components/AgentQLTestButton';
import PropertyFeedHeader from '@/components/PropertyFeed/PropertyFeedHeader';
import PropertyFeedGrid from '@/components/PropertyFeed/PropertyFeedGrid';
import PropertyFeedEmpty from '@/components/PropertyFeed/PropertyFeedEmpty';
import PropertyFeedLoading from '@/components/PropertyFeed/PropertyFeedLoading';
import { usePropertyFeedActions } from '@/components/PropertyFeed/PropertyFeedActions';

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

  const { handleAnalyse, handleSaveForLater, handleDismiss } = usePropertyFeedActions({
    addTag,
    onSwitchToSavedTab,
  });

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
        <PropertyFeedLoading />
      ) : (
        <>
          <PropertyFeedHeader
            propertyCount={visibleProperties.length}
            isRefreshing={isRefreshing}
            isScrapingActive={isScrapingActive}
            onRefreshFeed={handleRefreshFeed}
          />
          
          {visibleProperties.length === 0 ? (
            <PropertyFeedEmpty
              isRefreshing={isRefreshing}
              isScrapingActive={isScrapingActive}
              onRefreshFeed={handleRefreshFeed}
            />
          ) : (
            <PropertyFeedGrid
              properties={visibleProperties}
              onAnalyse={handleAnalyse}
              onSaveForLater={handleSaveForLater}
              onDismiss={handleDismiss}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PropertyFeed;

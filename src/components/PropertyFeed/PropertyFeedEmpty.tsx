
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface PropertyFeedEmptyProps {
  isRefreshing: boolean;
  isScrapingActive: boolean;
  onRefreshFeed: () => void;
}

const PropertyFeedEmpty = ({ 
  isRefreshing, 
  isScrapingActive, 
  onRefreshFeed 
}: PropertyFeedEmptyProps) => {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 mb-4">No properties found matching your criteria.</p>
      <Button 
        variant="outline" 
        onClick={onRefreshFeed}
        disabled={isRefreshing || isScrapingActive}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh Feed'}
      </Button>
    </div>
  );
};

export default PropertyFeedEmpty;

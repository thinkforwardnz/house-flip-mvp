
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface PropertyFeedHeaderProps {
  propertyCount: number;
  isRefreshing: boolean;
  isScrapingActive: boolean;
  onRefreshFeed: () => void;
}

const PropertyFeedHeader = ({ 
  propertyCount, 
  isRefreshing, 
  isScrapingActive, 
  onRefreshFeed 
}: PropertyFeedHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="text-gray-600">
        Found {propertyCount} properties matching your criteria
      </p>
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

export default PropertyFeedHeader;

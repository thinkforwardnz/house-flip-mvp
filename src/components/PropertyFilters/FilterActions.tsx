
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';

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

interface FilterActionsProps {
  onClearFilters: () => void;
  onSearchProperties: () => void;
  isScrapingActive: boolean;
}

const FilterActions = ({ onClearFilters, onSearchProperties, isScrapingActive }: FilterActionsProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-2">
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
        <Button 
          className="bg-[#1B5E20] hover:bg-[#1B5E20]/90"
          onClick={onSearchProperties}
          disabled={isScrapingActive}
        >
          <Search className="h-4 w-4 mr-2" />
          {isScrapingActive ? 'Searching...' : 'Search Properties'}
        </Button>
      </div>
    </div>
  );
};

export default FilterActions;

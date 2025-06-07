
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';

interface FilterActionsProps {
  onClearFilters: () => void;
  onSearchProperties: () => void;
  isScrapingActive: boolean;
}

const FilterActions = ({ onClearFilters, onSearchProperties, isScrapingActive }: FilterActionsProps) => {
  return (
    <div className="w-full">
      <Button 
        className="w-full bg-[#1B5E20] hover:bg-[#1B5E20]/90"
        onClick={onSearchProperties}
        disabled={isScrapingActive}
      >
        <Search className="h-4 w-4 mr-2" />
        {isScrapingActive ? 'Searching...' : 'Search Properties'}
      </Button>
    </div>
  );
};

export default FilterActions;

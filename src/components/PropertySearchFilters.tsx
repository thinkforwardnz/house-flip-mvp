
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedScraping } from '@/hooks/useEnhancedScraping';
import { SearchFilters, PropertySearchFiltersProps } from '@/types/filters';
import FilterGrid from '@/components/PropertyFilters/FilterGrid';
import SourceSelector from '@/components/PropertyFilters/SourceSelector';
import FilterActions from '@/components/PropertyFilters/FilterActions';

const PropertySearchFilters = ({ filters, onFiltersChange }: PropertySearchFiltersProps) => {
  const [selectedSources, setSelectedSources] = useState(['trademe', 'realestate', 'oneroof']);
  const { toast } = useToast();
  const { isScrapingActive, startScraping } = useEnhancedScraping();

  const clearFilters = () => {
    onFiltersChange({
      suburb: '',
      minPrice: '',
      maxPrice: '',
      minBeds: '',
      maxBeds: '',
      minBaths: '',
      maxBaths: '',
      keywords: 'renovate, fixer upper, deceased estate, needs work',
    });
  };

  const handleSourceChange = (source: string, checked: boolean) => {
    if (checked) {
      setSelectedSources([...selectedSources, source]);
    } else {
      setSelectedSources(selectedSources.filter(s => s !== source));
    }
  };

  const handleRefreshListings = async () => {
    if (selectedSources.length === 0) {
      toast({
        title: "No Sources Selected",
        description: "Please select at least one property source to scrape.",
        variant: "destructive",
      });
      return;
    }

    startScraping(filters, selectedSources);
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <FilterGrid 
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
        
        <SourceSelector 
          selectedSources={selectedSources}
          onSourceChange={handleSourceChange}
        />
        
        <FilterActions 
          onClearFilters={clearFilters}
          onRefreshListings={handleRefreshListings}
          isScrapingActive={isScrapingActive}
        />
      </CardContent>
    </Card>
  );
};

export default PropertySearchFilters;

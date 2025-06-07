
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FilterActions from '@/components/PropertyFilters/FilterActions';
import { useEnhancedScraping } from '@/hooks/useEnhancedScraping';

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

interface PropertySearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const PropertySearchFilters = ({ filters, onFiltersChange }: PropertySearchFiltersProps) => {
  const { isScrapingActive, startScraping } = useEnhancedScraping();

  const handleInputChange = (field: keyof SearchFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      suburb: '',
      minPrice: '',
      maxPrice: '',
      minBeds: '',
      maxBeds: '',
      minBaths: '',
      maxBaths: '',
      keywords: '',
    });
  };

  const handleSearchProperties = () => {
    const scrapingFilters = {
      suburb: filters.suburb,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minBeds: filters.minBeds,
      keywords: filters.keywords
    };
    
    startScraping(scrapingFilters);
  };

  return (
    <div className="space-y-6">
      {/* Location Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="suburb">Suburb</Label>
          <Input
            id="suburb"
            value={filters.suburb}
            onChange={(e) => handleInputChange('suburb', e.target.value)}
            placeholder="e.g. Paraparaumu"
          />
        </div>
        <div>
          <Label htmlFor="keywords">Keywords</Label>
          <Input
            id="keywords"
            value={filters.keywords}
            onChange={(e) => handleInputChange('keywords', e.target.value)}
            placeholder="e.g. sea view, renovation"
          />
        </div>
      </div>

      {/* Price Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minPrice">Min Price</Label>
          <Input
            id="minPrice"
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleInputChange('minPrice', e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="maxPrice">Max Price</Label>
          <Input
            id="maxPrice"
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleInputChange('maxPrice', e.target.value)}
            placeholder="1000000"
          />
        </div>
      </div>

      {/* Bedrooms & Bathrooms */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="minBeds">Min Beds</Label>
          <Input
            id="minBeds"
            type="number"
            value={filters.minBeds}
            onChange={(e) => handleInputChange('minBeds', e.target.value)}
            placeholder="1"
          />
        </div>
        <div>
          <Label htmlFor="maxBeds">Max Beds</Label>
          <Input
            id="maxBeds"
            type="number"
            value={filters.maxBeds}
            onChange={(e) => handleInputChange('maxBeds', e.target.value)}
            placeholder="5"
          />
        </div>
        <div>
          <Label htmlFor="minBaths">Min Baths</Label>
          <Input
            id="minBaths"
            type="number"
            value={filters.minBaths}
            onChange={(e) => handleInputChange('minBaths', e.target.value)}
            placeholder="1"
          />
        </div>
        <div>
          <Label htmlFor="maxBaths">Max Baths</Label>
          <Input
            id="maxBaths"
            type="number"
            value={filters.maxBaths}
            onChange={(e) => handleInputChange('maxBaths', e.target.value)}
            placeholder="3"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <FilterActions
        onClearFilters={handleClearFilters}
        onSearchProperties={handleSearchProperties}
        isScrapingActive={isScrapingActive}
      />
    </div>
  );
};

export default PropertySearchFilters;

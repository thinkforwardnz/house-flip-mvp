
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import FilterActions from '@/components/PropertyFilters/FilterActions';
import SourceSelector from '@/components/PropertyFilters/SourceSelector';
import { useEnhancedScraping } from '@/hooks/useEnhancedScraping';
import { SearchFilters } from '@/types/filters';

interface PropertySearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const regions = [
  'Wellington',
  'Auckland',
  'Canterbury',
  'Bay of Plenty',
  'Waikato',
  'Otago',
  'Manawatu-Wanganui',
  'Northland',
  'Hawke\'s Bay',
  'Taranaki',
  'Nelson',
  'Marlborough',
  'Southland',
  'Tasman',
  'Gisborne',
  'West Coast'
];

const wellingtonDistricts = [
  'Wellington City',
  'Lower Hutt City',
  'Upper Hutt City',
  'Porirua City',
  'Kapiti Coast District',
  'South Wairarapa District',
  'Carterton District',
  'Masterton District'
];

const aucklandDistricts = [
  'Auckland Council'
];

const canterburyDistricts = [
  'Christchurch City',
  'Selwyn District',
  'Waimakariri District',
  'Ashburton District',
  'Timaru District',
  'Mackenzie District',
  'Waimate District',
  'Hurunui District',
  'Kaikoura District'
];

const propertyTypes = [
  'All Properties',
  'House',
  'Apartment',
  'Townhouse',
  'Unit',
  'Section',
  'Other'
];

const bedroomOptions = [
  'Any',
  '1+',
  '2+',
  '3+',
  '4+',
  '5+'
];

const bathroomOptions = [
  'Any',
  '1+',
  '2+',
  '3+',
  '4+'
];

const PropertySearchFilters = ({ filters, onFiltersChange }: PropertySearchFiltersProps) => {
  const { isScrapingActive, startScraping } = useEnhancedScraping();

  const handleInputChange = (field: keyof SearchFilters, value: string | boolean | string[]) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const getDistrictsForRegion = (region: string) => {
    switch (region) {
      case 'Wellington':
        return wellingtonDistricts;
      case 'Auckland':
        return aucklandDistricts;
      case 'Canterbury':
        return canterburyDistricts;
      default:
        return [];
    }
  };

  const handleSourceChange = (source: string, checked: boolean) => {
    const updatedSources = checked
      ? [...filters.selectedSources, source]
      : filters.selectedSources.filter(s => s !== source);
    
    handleInputChange('selectedSources', updatedSources);
  };

  const handleClearFilters = () => {
    onFiltersChange({
      region: '',
      district: '',
      suburb: '',
      minPrice: '',
      maxPrice: '',
      minBeds: '',
      maxBeds: '',
      minBaths: '',
      maxBaths: '',
      propertyType: '',
      keywords: '',
      selectedSources: ['trademe'],
      searchNearbySuburbs: false,
      openHomesOnly: false,
      newHomesOnly: false,
    });
  };

  const handleSearchProperties = () => {
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

  return (
    <div className="space-y-6">
      {/* Top row: Region, District, Suburb, Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="region">Region</Label>
          <Select value={filters.region} onValueChange={(value) => handleInputChange('region', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="district">District</Label>
          <Select 
            value={filters.district} 
            onValueChange={(value) => handleInputChange('district', value)}
            disabled={!filters.region}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {getDistrictsForRegion(filters.region).map((district) => (
                <SelectItem key={district} value={district}>
                  {district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="suburb">Suburb</Label>
          <Input
            id="suburb"
            value={filters.suburb}
            onChange={(e) => handleInputChange('suburb', e.target.value)}
            placeholder="e.g. Kelburn"
          />
        </div>

        <div className="flex items-end">
          <FilterActions
            onClearFilters={handleClearFilters}
            onSearchProperties={handleSearchProperties}
            isScrapingActive={isScrapingActive}
          />
        </div>
      </div>

      {/* Second row: Price, Bedrooms, Bathrooms, Property Type, Keywords */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <Label>Price Range (NZD)</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleInputChange('minPrice', e.target.value)}
            />
            <Input
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleInputChange('maxPrice', e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Select value={filters.minBeds} onValueChange={(value) => handleInputChange('minBeds', value === 'any' ? '' : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {bedroomOptions.map((option) => (
                <SelectItem key={option} value={option === 'Any' ? 'any' : option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Select value={filters.minBaths} onValueChange={(value) => handleInputChange('minBaths', value === 'any' ? '' : value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {bathroomOptions.map((option) => (
                <SelectItem key={option} value={option === 'Any' ? 'any' : option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="propertyType">Property Type</Label>
          <Select value={filters.propertyType} onValueChange={(value) => handleInputChange('propertyType', value === 'all' ? '' : value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type} value={type === 'All Properties' ? 'all' : type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      {/* Third row: Additional filter checkboxes */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="searchNearbySuburbs"
            checked={filters.searchNearbySuburbs}
            onCheckedChange={(checked) => handleInputChange('searchNearbySuburbs', checked as boolean)}
          />
          <Label htmlFor="searchNearbySuburbs" className="text-sm">Search nearby suburbs</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="openHomesOnly"
            checked={filters.openHomesOnly}
            onCheckedChange={(checked) => handleInputChange('openHomesOnly', checked as boolean)}
          />
          <Label htmlFor="openHomesOnly" className="text-sm">Open homes only</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="newHomesOnly"
            checked={filters.newHomesOnly}
            onCheckedChange={(checked) => handleInputChange('newHomesOnly', checked as boolean)}
          />
          <Label htmlFor="newHomesOnly" className="text-sm">New homes only</Label>
        </div>

        <button 
          onClick={handleClearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Clear refinements
        </button>
      </div>

      {/* Fourth row: Property Sources */}
      <SourceSelector
        selectedSources={filters.selectedSources}
        onSourceChange={handleSourceChange}
      />
    </div>
  );
};

export default PropertySearchFilters;

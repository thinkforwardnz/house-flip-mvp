
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface FilterGridProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const wellingtonSuburbs = [
  'Wellington Central', 'Kelburn', 'Mount Victoria', 'Thorndon', 'Te Aro', 'Newtown', 'Island Bay',
  'Petone', 'Lower Hutt', 'Wainuiomata', 'Eastbourne', 'Stokes Valley',
  'Upper Hutt', 'Totara Park', 'Heretaunga', 'Trentham',
  'Porirua', 'Whitby', 'Paremata', 'Plimmerton',
  'Paraparaumu', 'Waikanae', 'Otaki'
];

const FilterGrid = ({ filters, onFiltersChange }: FilterGridProps) => {
  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <div>
        <Label htmlFor="suburb">Wellington Suburb</Label>
        <Select value={filters.suburb} onValueChange={(value) => handleFilterChange('suburb', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select suburb" />
          </SelectTrigger>
          <SelectContent>
            {wellingtonSuburbs.map((suburb) => (
              <SelectItem key={suburb} value={suburb}>
                {suburb}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="keywords">Flip Keywords</Label>
        <Input
          id="keywords"
          placeholder="renovation, fixer upper, deceased estate"
          value={filters.keywords}
          onChange={(e) => handleFilterChange('keywords', e.target.value)}
        />
      </div>
      
      <div>
        <Label>Price Range (NZD)</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
          />
          <Input
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <Label>Bedrooms</Label>
        <div className="flex gap-2">
          <Select value={filters.minBeds} onValueChange={(value) => handleFilterChange('minBeds', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.maxBeds} onValueChange={(value) => handleFilterChange('maxBeds', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Max" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="6">6+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default FilterGrid;


import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  const [selectedSources, setSelectedSources] = useState(['trademe', 'realestate', 'oneroof']);
  const { toast } = useToast();
  const { isScrapingActive, startScraping } = useEnhancedScraping();

  const wellingtonSuburbs = [
    'Wellington Central', 'Kelburn', 'Mount Victoria', 'Thorndon', 'Te Aro', 'Newtown', 'Island Bay',
    'Petone', 'Lower Hutt', 'Wainuiomata', 'Eastbourne', 'Stokes Valley',
    'Upper Hutt', 'Totara Park', 'Heretaunga', 'Trentham',
    'Porirua', 'Whitby', 'Paremata', 'Plimmerton',
    'Paraparaumu', 'Waikanae', 'Otaki'
  ];

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

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

    const scrapingFilters = {
      ...filters,
      keywords: filters.keywords || 'renovate, fixer upper, deceased estate, needs work'
    };
    
    startScraping(scrapingFilters, selectedSources);
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardContent className="p-6">
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

        <div className="mb-4">
          <Label className="text-sm font-medium mb-2 block">Property Sources</Label>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="trademe"
                checked={selectedSources.includes('trademe')}
                onCheckedChange={(checked) => handleSourceChange('trademe', checked as boolean)}
              />
              <Label htmlFor="trademe" className="text-sm">TradeMe</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="realestate"
                checked={selectedSources.includes('realestate')}
                onCheckedChange={(checked) => handleSourceChange('realestate', checked as boolean)}
              />
              <Label htmlFor="realestate" className="text-sm">Realestate.co.nz</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="oneroof"
                checked={selectedSources.includes('oneroof')}
                onCheckedChange={(checked) => handleSourceChange('oneroof', checked as boolean)}
              />
              <Label htmlFor="oneroof" className="text-sm">OneRoof</Label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button className="bg-[#1B5E20] hover:bg-[#1B5E20]/90">
              <Search className="h-4 w-4 mr-2" />
              Search Properties
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshListings}
            disabled={isScrapingActive}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isScrapingActive ? 'animate-spin' : ''}`} />
            {isScrapingActive ? 'Scraping Wellington...' : 'Refresh Feed'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertySearchFilters;

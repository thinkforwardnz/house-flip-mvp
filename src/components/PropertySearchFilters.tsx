
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

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
      keywords: '',
    });
  };

  const handleRefreshListings = async () => {
    setIsRefreshing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('refresh-listings', {
        body: { filters }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Listings Refreshed",
          description: `Found ${data.results.scraped} new listings, skipped ${data.results.skipped} duplicates.`,
        });
        
        // Trigger a page refresh to show new listings
        window.location.reload();
      } else {
        throw new Error('Refresh failed');
      }
    } catch (error: any) {
      console.error('Error refreshing listings:', error);
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh listings. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <Label htmlFor="suburb">Suburb</Label>
            <Input
              id="suburb"
              placeholder="e.g., Ponsonby"
              value={filters.suburb}
              onChange={(e) => handleFilterChange('suburb', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="keywords">Keywords</Label>
            <Input
              id="keywords"
              placeholder="renovation, fixer upper"
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
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Feed'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertySearchFilters;

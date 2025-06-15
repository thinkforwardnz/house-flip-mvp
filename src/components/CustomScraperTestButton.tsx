
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, TestTube, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useScraperEndpoint } from '@/hooks/useScraperEndpoint';

const CustomScraperTestButton = () => {
  const [isTestingSearch, setIsTestingSearch] = useState(false);
  const [isTestingProperty, setIsTestingProperty] = useState(false);
  const [searchUrl, setSearchUrl] = useState('https://www.trademe.co.nz/a/property/residential/sale/wellington/kapiti-coast/paraparaumu');
  const [propertyUrl, setPropertyUrl] = useState('https://www.trademe.co.nz/a/property/residential/sale/wellington/kapiti-coast/paraparaumu/listing/5317539831');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [propertyResult, setPropertyResult] = useState<any>(null);
  const { toast } = useToast();
  const { endpoint } = useScraperEndpoint();

  const testSearchScraping = async () => {
    setIsTestingSearch(true);
    setSearchResults([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('scrape-trademe', {
        body: {
          filters: {
            searchUrl: searchUrl
          }
        }
      });

      if (error) {
        throw error;
      }

      console.log('Search scraping result:', data);
      setSearchResults(data?.properties || []);
      
      toast({
        title: "Search Scraping Test Complete",
        description: `Found ${data?.scraped || 0} properties`,
      });
    } catch (error) {
      console.error('Search scraping test failed:', error);
      toast({
        title: "Search Scraping Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsTestingSearch(false);
    }
  };

  const testPropertyScraping = async () => {
    setIsTestingProperty(true);
    setPropertyResult(null);
    
    try {
      // Extract property ID from URL
      const match = propertyUrl.match(/listing\/(\d+)/);
      if (!match) {
        throw new Error('Invalid property URL format');
      }

      const response = await fetch(`${endpoint}/scrape-property-full`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: propertyUrl,
          backend: 'playwright'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Property scraping result:', data);
      setPropertyResult(data);
      
      toast({
        title: "Property Scraping Test Complete",
        description: `Successfully scraped property: ${data?.structured?.address || 'Unknown'}`,
      });
    } catch (error) {
      console.error('Property scraping test failed:', error);
      toast({
        title: "Property Scraping Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsTestingProperty(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Custom Scraper Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Testing */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Test Search Results Scraping</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter search URL..."
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={testSearchScraping}
              disabled={isTestingSearch || !searchUrl}
              variant="outline"
            >
              {isTestingSearch && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test Search
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Search Results ({searchResults.length}):</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {searchResults.slice(0, 5).map((property, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                    <div className="font-medium">{property.title}</div>
                    <div className="text-gray-600">{property.address}</div>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary">{property.price}</Badge>
                      {property.property_features?.map((feature: any, i: number) => (
                        <Badge key={i} variant="outline">{feature.label}: {feature.value}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Property Testing */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Test Full Property Scraping</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter property URL..."
              value={propertyUrl}
              onChange={(e) => setPropertyUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={testPropertyScraping}
              disabled={isTestingProperty || !propertyUrl}
              variant="outline"
            >
              {isTestingProperty && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test Property
            </Button>
          </div>
          
          {propertyResult && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Property Result:</h4>
              <div className="p-3 bg-gray-50 rounded text-xs space-y-2">
                <div className="font-medium">{propertyResult.structured?.title}</div>
                <div className="text-gray-600">{propertyResult.structured?.address}</div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{propertyResult.structured?.price}</Badge>
                  <Badge variant="outline">{propertyResult.structured?.bedrooms} bed</Badge>
                  <Badge variant="outline">{propertyResult.structured?.bathrooms}</Badge>
                  <Badge variant="outline">{propertyResult.structured?.floor_area}</Badge>
                </div>
                {propertyResult.structured?.nearby_sales && (
                  <div className="mt-2">
                    <div className="text-xs font-medium">Nearby Sales: {propertyResult.structured.nearby_sales.length}</div>
                  </div>
                )}
                {propertyResult.structured?.images && (
                  <div className="text-xs">Images: {propertyResult.structured.images.length}</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          Current endpoint: {endpoint}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomScraperTestButton;


import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PropertyListingCard from '@/components/PropertyListingCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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

interface PropertyFeedProps {
  filters: SearchFilters;
}

// Mock data for development - replace with real API call
const mockProperties = [
  {
    id: '1',
    address: '123 Queen Street',
    suburb: 'Ponsonby',
    city: 'Auckland',
    price: 850000,
    bedrooms: 3,
    bathrooms: 2,
    floorArea: 120,
    landArea: 400,
    imageUrl: '/placeholder.svg',
    listingUrl: 'https://trademe.co.nz/property/123',
    description: 'Charming villa with original features, needs renovation',
    aiAnalysis: {
      renovationCost: 85000,
      arv: 1200000,
      projectedProfit: 265000,
      flipPotential: 'High' as const,
      confidence: 85,
    },
    source: 'Trade Me',
    listedDate: '2024-01-15',
  },
  {
    id: '2',
    address: '456 Karangahape Road',
    suburb: 'Newton',
    city: 'Auckland',
    price: 720000,
    bedrooms: 2,
    bathrooms: 1,
    floorArea: 85,
    landArea: 300,
    imageUrl: '/placeholder.svg',
    listingUrl: 'https://realestate.co.nz/property/456',
    description: 'Compact home perfect for first-time renovators',
    aiAnalysis: {
      renovationCost: 65000,
      arv: 950000,
      projectedProfit: 165000,
      flipPotential: 'Medium' as const,
      confidence: 72,
    },
    source: 'Realestate.co.nz',
    listedDate: '2024-01-14',
  },
  {
    id: '3',
    address: '789 Mount Eden Road',
    suburb: 'Mount Eden',
    city: 'Auckland',
    price: 1100000,
    bedrooms: 4,
    bathrooms: 2,
    floorArea: 180,
    landArea: 600,
    imageUrl: '/placeholder.svg',
    listingUrl: 'https://trademe.co.nz/property/789',
    description: 'Large family home in excellent location, cosmetic work needed',
    aiAnalysis: {
      renovationCost: 45000,
      arv: 1280000,
      projectedProfit: 135000,
      flipPotential: 'Low' as const,
      confidence: 68,
    },
    source: 'Trade Me',
    listedDate: '2024-01-13',
  },
];

const PropertyFeed = ({ filters }: PropertyFeedProps) => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  
  const { data: properties, isLoading, error } = useQuery({
    queryKey: ['properties', filters, page],
    queryFn: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter mock data based on filters
      let filtered = mockProperties;
      
      if (filters.suburb) {
        filtered = filtered.filter(p => 
          p.suburb.toLowerCase().includes(filters.suburb.toLowerCase())
        );
      }
      
      if (filters.minPrice) {
        filtered = filtered.filter(p => p.price >= parseInt(filters.minPrice));
      }
      
      if (filters.maxPrice) {
        filtered = filtered.filter(p => p.price <= parseInt(filters.maxPrice));
      }
      
      if (filters.minBeds) {
        filtered = filtered.filter(p => p.bedrooms >= parseInt(filters.minBeds));
      }
      
      if (filters.keywords) {
        filtered = filtered.filter(p => 
          p.description.toLowerCase().includes(filters.keywords.toLowerCase()) ||
          p.address.toLowerCase().includes(filters.keywords.toLowerCase())
        );
      }
      
      return filtered;
    },
  });

  const handleImportAsDeal = (property: any) => {
    toast({
      title: "Property Imported",
      description: `${property.address} has been added to your pipeline as a new deal.`,
    });
  };

  const handleSaveForLater = (property: any) => {
    toast({
      title: "Property Saved",
      description: `${property.address} has been saved to your watchlist.`,
    });
  };

  const handleDismiss = (property: any) => {
    toast({
      title: "Property Dismissed",
      description: `${property.address} will no longer appear in your feed.`,
    });
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading properties. Please try again.</p>
      </div>
    );
  }

  return (
    <div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-gray-600">
              Found {properties?.length || 0} properties matching your criteria
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties?.map((property) => (
              <PropertyListingCard
                key={property.id}
                property={property}
                onImportAsDeal={() => handleImportAsDeal(property)}
                onSaveForLater={() => handleSaveForLater(property)}
                onDismiss={() => handleDismiss(property)}
              />
            ))}
          </div>
          
          {properties && properties.length > 0 && (
            <div className="text-center mt-8">
              <Button 
                variant="outline" 
                className="mr-4"
                onClick={() => setPage(page + 1)}
              >
                See More Properties
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Feed
              </Button>
            </div>
          )}
          
          {properties && properties.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No properties found matching your criteria.</p>
              <Button variant="outline">Adjust Filters</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PropertyFeed;

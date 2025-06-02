
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PropertySearchFilters from '@/components/PropertySearchFilters';
import PropertyFeed from '@/components/PropertyFeed';
import SavedProperties from '@/components/SavedProperties';

const Find = () => {
  const [searchFilters, setSearchFilters] = useState({
    suburb: '',
    minPrice: '',
    maxPrice: '',
    minBeds: '',
    maxBeds: '',
    minBaths: '',
    maxBaths: '',
    keywords: '',
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Properties</h1>
          <p className="text-gray-600">Discover potential flip opportunities with AI-powered analysis</p>
        </div>

        <PropertySearchFilters 
          filters={searchFilters}
          onFiltersChange={setSearchFilters}
        />

        <Tabs defaultValue="feed" className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="feed">Property Feed</TabsTrigger>
            <TabsTrigger value="saved">Saved Properties</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed">
            <PropertyFeed filters={searchFilters} />
          </TabsContent>
          
          <TabsContent value="saved">
            <SavedProperties />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Find;

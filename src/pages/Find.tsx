
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Find Properties</h1>
        <p className="text-blue-100 text-lg">Discover potential flip opportunities with AI-powered analysis</p>
      </div>

      {/* Search Filters */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardHeader className="p-6">
          <CardTitle className="text-navy-dark">Search Filters</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <PropertySearchFilters 
            filters={searchFilters}
            onFiltersChange={setSearchFilters}
          />
        </CardContent>
      </Card>

      {/* Property Feed */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <Tabs defaultValue="feed" className="w-full">
            <TabsList className="mb-6">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Find;


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Trash2 } from 'lucide-react';

const SavedProperties = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Saved Properties</h2>
        <Button variant="outline" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>
      
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-8 text-center">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Properties</h3>
          <p className="text-gray-600 mb-4">
            Properties you save for later will appear here for easy access.
          </p>
          <Button variant="outline">
            Browse Properties
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SavedProperties;

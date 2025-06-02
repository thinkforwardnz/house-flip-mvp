
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import PropertyCard from './PropertyCard';

interface Property {
  id: string;
  address: string;
  status: string;
  profit: number;
  risk: 'Low' | 'Medium' | 'High';
  stage: string;
  hasAlert: boolean;
  purchasePrice?: number;
  estimatedValue?: number;
  daysInStage?: number;
}

interface KanbanColumnProps {
  title: string;
  properties: Property[];
  count: number;
  color: string;
}

const KanbanColumn = ({ title, properties, count, color }: KanbanColumnProps) => {
  return (
    <div className="flex-1 min-w-80">
      <Card className="h-full bg-gray-50 border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">{title}</h2>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
              {count}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
            {properties.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No properties in this stage
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KanbanColumn;


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

interface PropertyCardProps {
  property: {
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
  };
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow duration-200 cursor-pointer border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-sm text-gray-900 leading-tight">
            {property.address}
          </h3>
          {property.hasAlert && (
            <Bell className="h-4 w-4 text-amber-500 flex-shrink-0 ml-2" />
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Profit Potential</span>
            <span className={`text-xs font-semibold ${property.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(property.profit)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Risk Level</span>
            <Badge className={`text-xs px-2 py-1 ${getRiskColor(property.risk)}`}>
              {property.risk}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Days in Stage</span>
            <span className="text-xs font-medium text-gray-700">
              {property.daysInStage || 0} days
            </span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Purchase: {property.purchasePrice ? formatCurrency(property.purchasePrice) : 'TBD'}</span>
            <span>Est. Value: {property.estimatedValue ? formatCurrency(property.estimatedValue) : 'TBD'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Home, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface PropertySummaryProps {
  property: {
    address: string;
    listPrice: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    aiRiskLevel: 'Low' | 'Medium' | 'High';
    estimatedProfit: number;
    roi: number;
  };
}

const PropertySummary = ({ property }: PropertySummaryProps) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20';
      case 'Medium': return 'bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20';
      case 'High': return 'bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Property Details */}
          <div className="md:col-span-2">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#1B5E20]/10 rounded-lg flex items-center justify-center">
                <Home className="h-6 w-6 text-[#1B5E20]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{property.address}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">List Price:</span>
                    <p className="font-semibold text-[#1B5E20]">${property.listPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Size:</span>
                    <p className="font-medium text-gray-900">{property.sqft.toLocaleString()} sq ft</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Bedrooms:</span>
                    <p className="font-medium text-gray-900">{property.bedrooms} bed</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Bathrooms:</span>
                    <p className="font-medium text-gray-900">{property.bathrooms} bath</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Risk Assessment */}
          <div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#FF9800]/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-[#FF9800]" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">AI Risk Level</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(property.aiRiskLevel)}`}>
                  {property.aiRiskLevel} Risk
                </span>
                <p className="text-xs text-gray-500 mt-2">
                  Based on market analysis and property condition
                </p>
              </div>
            </div>
          </div>

          {/* Profit Projection */}
          <div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#388E3C]/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-[#388E3C]" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Profit Projection</h4>
                <p className="text-lg font-bold text-[#388E3C]">
                  ${property.estimatedProfit.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  {property.roi}% ROI
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertySummary;

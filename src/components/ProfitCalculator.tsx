
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CalculatorProps {
  listPrice: number;
  offerPrice: number;
  renoEstimate: number;
  timeline: number;
  holdingCosts: number;
  sellingCosts: number;
  addBedroom: boolean;
  bedroomCost: number;
}

const ProfitCalculator = ({
  listPrice,
  offerPrice,
  renoEstimate,
  timeline,
  holdingCosts,
  sellingCosts,
  addBedroom,
  bedroomCost
}: CalculatorProps) => {
  // Estimated ARV (After Repair Value) - simplified calculation
  const estimatedARV = addBedroom ? listPrice * 1.25 : listPrice * 1.15;
  
  // Total costs
  const totalRenoCoast = renoEstimate + (addBedroom ? bedroomCost : 0);
  const totalHoldingCosts = holdingCosts * (timeline / 4); // Convert weeks to months
  const totalCosts = offerPrice + totalRenoCoast + totalHoldingCosts + sellingCosts;
  
  // Profit calculations
  const grossProfit = estimatedARV - totalCosts;
  const roi = offerPrice > 0 ? (grossProfit / offerPrice) * 100 : 0;
  
  const getRiskColor = (roi: number) => {
    if (roi >= 25) return 'text-green-600 bg-green-50';
    if (roi >= 15) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRiskLabel = (roi: number) => {
    if (roi >= 25) return 'Excellent';
    if (roi >= 15) return 'Good';
    if (roi >= 10) return 'Marginal';
    return 'High Risk';
  };

  return (
    <Card className="bg-gradient-to-br from-[#1B5E20]/5 to-[#FF9800]/5">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center justify-between">
          Profit Calculator
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(roi)}`}>
            {getRiskLabel(roi)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Revenue */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">Revenue</h4>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Estimated ARV:</span>
            <span className="font-medium">${estimatedARV.toLocaleString()}</span>
          </div>
          {addBedroom && (
            <div className="text-xs text-green-600 ml-4">
              +25% value boost from added bedroom
            </div>
          )}
        </div>

        {/* Costs Breakdown */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">Total Costs</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Purchase Price:</span>
              <span>${offerPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Renovation:</span>
              <span>${totalRenoCoast.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Holding Costs:</span>
              <span>${totalHoldingCosts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Selling Costs:</span>
              <span>${sellingCosts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>Total Costs:</span>
              <span>${totalCosts.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Profit Summary */}
        <div className="bg-white rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-800">Estimated Profit:</span>
            <span className={`text-xl font-bold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${grossProfit.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-800">ROI:</span>
            <span className={`text-lg font-semibold ${roi >= 15 ? 'text-green-600' : roi >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
              {roi.toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Target ROI: 15-25% for profitable flips
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitCalculator;


import React from 'react';
import { DollarSign, Target, Wrench, TrendingUp } from 'lucide-react';
import type { Deal } from '@/types/analysis';
import { calculateARV, calculateTotalRenovationCost } from '@/utils/arvCalculation';
import type { RenovationSelections } from '@/types/renovation';

interface OverviewTabProps {
  deal: Deal;
  formatCurrency: (amount: number) => string;
  renovationEstimate: number;
  offerPrice: number;
}

const OverviewTab = ({ deal, formatCurrency }: OverviewTabProps) => {
  const calculatedARV = calculateARV(deal);
  const renovationSelections = (deal.renovation_selections as RenovationSelections) || {};
  const selectedRenovationCost = calculateTotalRenovationCost(renovationSelections);
  const totalRenovationCost = selectedRenovationCost > 0 ? selectedRenovationCost : (deal.estimated_renovation_cost || 50000);
  
  // Calculate offer price using dynamic ARV
  const offerPrice = calculatedARV > 0 
    ? calculatedARV - totalRenovationCost - (calculatedARV * 0.1) - (calculatedARV * 0.15)
    : 0;

  const estimatedProfit = calculatedARV > 0 && deal.purchase_price
    ? calculatedARV - deal.purchase_price - totalRenovationCost - (calculatedARV * 0.1)
    : (deal.current_profit || 0);

  console.log('OverviewTab - deal:', deal.id);
  console.log('OverviewTab - calculatedARV:', calculatedARV);
  console.log('OverviewTab - selectedRenovationCost:', selectedRenovationCost);
  console.log('OverviewTab - offerPrice:', offerPrice);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">Purchase Price</p>
          </div>
          <p className="text-xl font-bold text-blue-900">
            {deal.purchase_price ? formatCurrency(deal.purchase_price) : 'TBD'}
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Target className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-900">Calculated ARV</p>
          </div>
          <p className="text-xl font-bold text-green-900">
            {calculatedARV > 0 ? formatCurrency(calculatedARV) : 'TBD'}
          </p>
          {selectedRenovationCost > 0 && (
            <p className="text-xs text-green-700 mt-1">Based on selected renovations</p>
          )}
        </div>

        <div className="bg-orange-50 p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Wrench className="h-5 w-5 text-orange-600" />
            <p className="text-sm font-medium text-orange-900">Total Renovation</p>
          </div>
          <p className="text-xl font-bold text-orange-900">
            {formatCurrency(totalRenovationCost)}
          </p>
          {selectedRenovationCost > 0 && (
            <p className="text-xs text-orange-700 mt-1">From selected items</p>
          )}
        </div>

        <div className="bg-purple-50 p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <p className="text-sm font-medium text-purple-900">Est. Profit</p>
          </div>
          <p className={`text-xl font-bold ${estimatedProfit > 0 ? 'text-purple-900' : 'text-gray-600'}`}>
            {estimatedProfit > 0 ? formatCurrency(estimatedProfit) : 'TBD'}
          </p>
        </div>
      </div>

      {/* Offer Scenarios */}
      {calculatedARV > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-navy-dark mb-4">Offer Scenarios</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-xl p-4">
              <h4 className="font-medium text-green-600 mb-2">Conservative</h4>
              <p className="text-lg font-bold text-navy-dark">{formatCurrency(offerPrice * 0.9)}</p>
              <p className="text-xs text-navy mt-1">Low risk, lower returns</p>
            </div>
            <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
              <h4 className="font-medium text-blue-600 mb-2">Balanced</h4>
              <p className="text-lg font-bold text-navy-dark">{formatCurrency(offerPrice)}</p>
              <p className="text-xs text-navy mt-1">Recommended offer</p>
            </div>
            <div className="border border-orange-200 rounded-xl p-4">
              <h4 className="font-medium text-orange-600 mb-2">Aggressive</h4>
              <p className="text-lg font-bold text-navy-dark">{formatCurrency(offerPrice * 1.1)}</p>
              <p className="text-xs text-navy mt-1">Higher risk, higher returns</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;

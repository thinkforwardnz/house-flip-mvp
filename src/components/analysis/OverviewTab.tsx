
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
  
  const offerPrice = calculatedARV > 0 
    ? calculatedARV - totalRenovationCost - (calculatedARV * 0.1) - (calculatedARV * 0.15)
    : 0;

  const estimatedProfit = calculatedARV > 0 && deal.purchase_price
    ? calculatedARV - deal.purchase_price - totalRenovationCost - (calculatedARV * 0.1)
    : (deal.current_profit || 0);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <div className="bg-blue-50 p-2 sm:p-3 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <p className="text-xs font-medium text-blue-900">Purchase Price</p>
          </div>
          <p className="text-sm sm:text-base font-bold text-blue-900">
            {deal.purchase_price ? formatCurrency(deal.purchase_price) : 'TBD'}
          </p>
        </div>

        <div className="bg-green-50 p-2 sm:p-3 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-green-600" />
            <p className="text-xs font-medium text-green-900">Calculated ARV</p>
          </div>
          <p className="text-sm sm:text-base font-bold text-green-900">
            {calculatedARV > 0 ? formatCurrency(calculatedARV) : 'TBD'}
          </p>
          {selectedRenovationCost > 0 && (
            <p className="text-xs text-green-700 mt-0.5">Based on selected renovations</p>
          )}
        </div>

        <div className="bg-orange-50 p-2 sm:p-3 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="h-4 w-4 text-orange-600" />
            <p className="text-xs font-medium text-orange-900">Total Renovation</p>
          </div>
          <p className="text-sm sm:text-base font-bold text-orange-900">
            {formatCurrency(totalRenovationCost)}
          </p>
          {selectedRenovationCost > 0 && (
            <p className="text-xs text-orange-700 mt-0.5">From selected items</p>
          )}
        </div>

        <div className="bg-purple-50 p-2 sm:p-3 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <p className="text-xs font-medium text-purple-900">Est. Profit</p>
          </div>
          <p className={`text-sm sm:text-base font-bold ${estimatedProfit > 0 ? 'text-purple-900' : 'text-gray-600'}`}>
            {estimatedProfit > 0 ? formatCurrency(estimatedProfit) : 'TBD'}
          </p>
        </div>
      </div>

      {/* Offer Scenarios */}
      {calculatedARV > 0 && (
        <div className="mt-3 sm:mt-4">
          <h3 className="text-sm font-semibold text-navy-dark mb-2">Offer Scenarios</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="border border-gray-200 rounded-xl p-2 sm:p-3">
              <h4 className="font-medium text-green-600 mb-1 text-xs sm:text-sm">Conservative</h4>
              <p className="text-sm sm:text-base font-bold text-navy-dark">{formatCurrency(offerPrice * 0.9)}</p>
              <p className="text-xs text-navy mt-0.5">Low risk, lower returns</p>
            </div>
            <div className="border border-blue-200 rounded-xl p-2 sm:p-3 bg-blue-50">
              <h4 className="font-medium text-blue-600 mb-1 text-xs sm:text-sm">Balanced</h4>
              <p className="text-sm sm:text-base font-bold text-navy-dark">{formatCurrency(offerPrice)}</p>
              <p className="text-xs text-navy mt-0.5">Recommended offer</p>
            </div>
            <div className="border border-orange-200 rounded-xl p-2 sm:p-3">
              <h4 className="font-medium text-orange-600 mb-1 text-xs sm:text-sm">Aggressive</h4>
              <p className="text-sm sm:text-base font-bold text-navy-dark">{formatCurrency(offerPrice * 1.1)}</p>
              <p className="text-xs text-navy mt-0.5">Higher risk, higher returns</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;

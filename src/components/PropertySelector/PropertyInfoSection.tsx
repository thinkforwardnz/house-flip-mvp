
import React from 'react';
import type { Deal } from '@/types/analysis';
import { calculateARV, calculateTotalRenovationCost } from '@/utils/arvCalculation';
import type { RenovationSelections } from '@/types/renovation';

interface PropertyInfoSectionProps {
  currentDeal: Deal | undefined;
  formatCurrency: (amount: number) => string;
}

const PropertyInfoSection = ({ currentDeal, formatCurrency }: PropertyInfoSectionProps) => {
  if (!currentDeal) return null;

  const targetARV = calculateARV(currentDeal);
  const renovationSelections = (currentDeal.renovation_selections as RenovationSelections) || {};
  const totalRenovationCost = calculateTotalRenovationCost(renovationSelections);

  // Base value is the pre-renovation value. We use the same fallback logic as
  // calculateARV for consistency, which prioritizes market data over purchase price
  // during early analysis.
  const baseValueForProfit = currentDeal.market_analysis?.analysis?.estimated_arv ||
                             currentDeal.target_sale_price ||
                             currentDeal.purchase_price ||
                             0;

  // Estimated Gross Profit = ARV - Base Value - Renovation Costs
  const grossProfit = (targetARV > 0 && baseValueForProfit > 0)
    ? targetARV - baseValueForProfit - totalRenovationCost
    : 0;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="text-navy font-medium block mb-1">Location:</span>
          <p className="text-navy-dark">{currentDeal.suburb}, {currentDeal.city}</p>
        </div>
        {currentDeal.purchase_price ? ( // Show purchase price if available
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-navy font-medium block mb-1">Purchase Price:</span>
            <p className="text-navy-dark font-semibold">{formatCurrency(currentDeal.purchase_price)}</p>
          </div>
        ) : ( // Otherwise show the estimated market value
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-navy font-medium block mb-1">Market Value:</span>
            <p className="text-navy-dark font-semibold">{baseValueForProfit > 0 ? formatCurrency(baseValueForProfit) : 'TBD'}</p>
          </div>
        )}
        {targetARV > 0 && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-navy font-medium block mb-1">Target ARV:</span>
            <p className="text-navy-dark font-semibold">{formatCurrency(targetARV)}</p>
          </div>
        )}
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="text-navy font-medium block mb-1">Estimated Gross Profit:</span>
          <p className={`font-semibold ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(targetARV > 0 && baseValueForProfit > 0) ? formatCurrency(grossProfit) : 'TBD'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PropertyInfoSection;

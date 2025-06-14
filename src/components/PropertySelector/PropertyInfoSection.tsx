
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
  
  const estimatedProfit = targetARV > 0 && currentDeal.purchase_price
    ? targetARV - currentDeal.purchase_price - totalRenovationCost - (targetARV * 0.1) // Assuming 10% for fees/other costs
    : currentDeal.current_profit || 0;

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="text-navy font-medium block mb-1">Location:</span>
          <p className="text-navy-dark">{currentDeal.suburb}, {currentDeal.city}</p>
        </div>
        {currentDeal.purchase_price && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-navy font-medium block mb-1">Purchase Price:</span>
            <p className="text-navy-dark font-semibold">{formatCurrency(currentDeal.purchase_price)}</p>
          </div>
        )}
        {targetARV > 0 && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-navy font-medium block mb-1">Target ARV:</span>
            <p className="text-navy-dark font-semibold">{formatCurrency(targetARV)}</p>
          </div>
        )}
        <div className="bg-gray-50 p-3 rounded-lg">
          <span className="text-navy font-medium block mb-1">Target Profit:</span>
          <p className={`font-semibold ${estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(estimatedProfit)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PropertyInfoSection;

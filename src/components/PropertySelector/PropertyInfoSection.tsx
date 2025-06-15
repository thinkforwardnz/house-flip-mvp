
import React from 'react';
import type { Deal } from '@/types/analysis';
import { calculateARV } from '@/utils/arvCalculation';

interface PropertyInfoSectionProps {
  currentDeal: Deal | undefined;
  formatCurrency: (amount: number) => string;
}

const PropertyInfoSection = ({ currentDeal, formatCurrency }: PropertyInfoSectionProps) => {
  if (!currentDeal) return null;

  const targetARV = calculateARV(currentDeal);
  // Consistent with OfferTab, target profit is 15% of ARV
  const targetProfit = targetARV > 0 ? targetARV * 0.15 : 0;

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
          <p className={`font-semibold text-green-600`}>
            {targetProfit > 0 ? formatCurrency(targetProfit) : 'TBD'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PropertyInfoSection;

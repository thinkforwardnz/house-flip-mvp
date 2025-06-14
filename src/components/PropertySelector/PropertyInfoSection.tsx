
import React from 'react';
import type { Deal } from '@/types/analysis';

interface PropertyInfoSectionProps {
  currentDeal: Deal | undefined;
  formatCurrency: (amount: number) => string;
}

const PropertyInfoSection = ({ currentDeal, formatCurrency }: PropertyInfoSectionProps) => {
  if (!currentDeal) return null;

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
        {currentDeal.target_sale_price && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-navy font-medium block mb-1">Target Sale:</span>
            <p className="text-navy-dark font-semibold">{formatCurrency(currentDeal.target_sale_price)}</p>
          </div>
        )}
        {currentDeal.current_profit && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-navy font-medium block mb-1">Target Profit:</span>
            <p className="text-navy-dark font-semibold">{formatCurrency(currentDeal.current_profit)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyInfoSection;

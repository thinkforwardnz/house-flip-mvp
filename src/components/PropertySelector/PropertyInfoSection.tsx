
import React from 'react';
import type { Deal } from '@/types/analysis';

interface PropertyInfoSectionProps {
  currentDeal: Deal | undefined;
  formatCurrency: (amount: number) => string;
}

const PropertyInfoSection = ({ currentDeal, formatCurrency }: PropertyInfoSectionProps) => {
  if (!currentDeal) return null;

  return (
    <div className="mt-2 xs:mt-3 pt-2 xs:pt-3 border-t border-gray-100">
      <div className="grid grid-cols-1 gap-2 xs:gap-3 md:grid-cols-4 md:gap-4 text-2xs xs:text-xs sm:text-sm">
        <div>
          <span className="text-navy font-medium">Location:</span>
          <p className="text-navy-dark">{currentDeal.suburb}, {currentDeal.city}</p>
        </div>
        {currentDeal.purchase_price && (
          <div>
            <span className="text-navy font-medium">Purchase Price:</span>
            <p className="text-navy-dark">{formatCurrency(currentDeal.purchase_price)}</p>
          </div>
        )}
        {currentDeal.target_sale_price && (
          <div>
            <span className="text-navy font-medium">Target Sale:</span>
            <p className="text-navy-dark">{formatCurrency(currentDeal.target_sale_price)}</p>
          </div>
        )}
        {currentDeal.current_profit && (
          <div>
            <span className="text-navy font-medium">Target Profit:</span>
            <p className="text-navy-dark">{formatCurrency(currentDeal.current_profit)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyInfoSection;

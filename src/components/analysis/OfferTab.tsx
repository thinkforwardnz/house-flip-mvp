
import React from 'react';
import type { Deal } from '@/types/analysis';

interface OfferTabProps {
  deal: Deal;
  formatCurrency: (amount: number) => string;
  renovationEstimate: number;
  offerPrice: number;
}

const OfferTab = ({ deal, formatCurrency, renovationEstimate, offerPrice }: OfferTabProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-navy-dark">Offer Price Calculation</h3>
      
      <div className="bg-gray-50 p-6 rounded-xl">
        <h4 className="font-medium text-navy-dark mb-4">Back-calculation from ARV</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Target ARV:</span>
            <span className="font-medium">{deal.target_sale_price ? formatCurrency(deal.target_sale_price) : 'TBD'}</span>
          </div>
          <div className="flex justify-between">
            <span>Less: Renovation Costs:</span>
            <span className="font-medium text-red-600">-{formatCurrency(renovationEstimate)}</span>
          </div>
          <div className="flex justify-between">
            <span>Less: Transaction Costs (10%):</span>
            <span className="font-medium text-red-600">-{formatCurrency((deal.target_sale_price || 0) * 0.1)}</span>
          </div>
          <div className="flex justify-between">
            <span>Less: Target Profit (15%):</span>
            <span className="font-medium text-red-600">-{formatCurrency((deal.target_sale_price || 0) * 0.15)}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-lg font-bold">
            <span>Maximum Purchase Price:</span>
            <span className="text-green-600">{formatCurrency(offerPrice)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-green-200 rounded-xl p-4 bg-green-50">
          <h4 className="font-medium text-green-600 mb-2">Conservative Strategy</h4>
          <p className="text-xl font-bold text-green-900">{formatCurrency(offerPrice * 0.9)}</p>
          <p className="text-xs text-green-700 mt-2">90% of calculated max price</p>
          <ul className="text-xs text-green-600 mt-2 space-y-1">
            <li>• Lower risk</li>
            <li>• Higher chance of acceptance</li>
            <li>• Buffer for unexpected costs</li>
          </ul>
        </div>
        
        <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
          <h4 className="font-medium text-blue-600 mb-2">Balanced Strategy</h4>
          <p className="text-xl font-bold text-blue-900">{formatCurrency(offerPrice)}</p>
          <p className="text-xs text-blue-700 mt-2">100% of calculated max price</p>
          <ul className="text-xs text-blue-600 mt-2 space-y-1">
            <li>• Calculated max price</li>
            <li>• Target profit maintained</li>
            <li>• Recommended approach</li>
          </ul>
        </div>
        
        <div className="border border-orange-200 rounded-xl p-4 bg-orange-50">
          <h4 className="font-medium text-orange-600 mb-2">Aggressive Strategy</h4>
          <p className="text-xl font-bold text-orange-900">{formatCurrency(offerPrice * 1.1)}</p>
          <p className="text-xs text-orange-700 mt-2">110% of calculated max price</p>
          <ul className="text-xs text-orange-600 mt-2 space-y-1">
            <li>• Higher risk</li>
            <li>• Reduced profit margin</li>
            <li>• Competitive market strategy</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OfferTab;

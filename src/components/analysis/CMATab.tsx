
import React from 'react';
import { Building } from 'lucide-react';
import type { Deal } from '@/types/analysis';

interface CMATabProps {
  deal: Deal;
  formatCurrency: (amount: number) => string;
}

const CMATab = ({ deal, formatCurrency }: CMATabProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-navy-dark">Comparative Market Analysis</h3>
      
      {deal.market_analysis?.analysis ? (
        <div className="bg-blue-50 p-4 rounded-xl">
          <h4 className="font-medium text-blue-900 mb-2">Market Analysis Results</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-blue-700">Estimated ARV</p>
              <p className="text-lg font-bold text-blue-900">
                {deal.market_analysis.analysis.estimated_arv ? 
                  formatCurrency(deal.market_analysis.analysis.estimated_arv) : 'TBD'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-700">Market Trend</p>
              <p className="text-lg font-bold text-blue-900 capitalize">
                {deal.market_analysis.analysis.market_trend || 'TBD'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-700">Days on Market</p>
              <p className="text-lg font-bold text-blue-900">
                {deal.market_analysis.analysis.avg_days_on_market || 'TBD'}
              </p>
            </div>
          </div>
          {deal.market_analysis.analysis.insights && (
            <div className="mt-4">
              <p className="text-sm text-blue-700 font-medium">Market Insights:</p>
              <p className="text-sm text-blue-800 mt-1">{deal.market_analysis.analysis.insights}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-blue-50 p-4 rounded-xl">
          <h4 className="font-medium text-blue-900 mb-2">AVM Estimates</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-blue-700">HomesEstimate</p>
              <p className="text-lg font-bold text-blue-900">TBD</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-700">OneRoof AVM</p>
              <p className="text-lg font-bold text-blue-900">TBD</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-700">Council CV</p>
              <p className="text-lg font-bold text-blue-900">TBD</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h4 className="font-medium text-navy-dark mb-3">Recent Comparable Sales</h4>
        {deal.market_analysis?.comparables?.length > 0 ? (
          <div className="space-y-3">
            {deal.market_analysis.comparables.slice(0, 5).map((comp, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-navy-dark">{comp.address || 'Address not available'}</p>
                    <p className="text-sm text-navy">
                      {comp.bedrooms}br, {comp.bathrooms}ba
                      {comp.floor_area && ` • ${comp.floor_area}m²`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-navy-dark">
                      {comp.sold_price ? formatCurrency(comp.sold_price) : 'Price not available'}
                    </p>
                    <p className="text-sm text-navy">{comp.sold_date || 'Date not available'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Building className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Comparable sales data will be collected automatically</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CMATab;

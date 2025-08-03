
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import type { Deal } from '@/types/analysis';

interface CMAAnalysisProps {
  deal: Deal;
  formatCurrency: (amount: number) => string;
  analysis: any;
  pricePerSqm: number;
}

const CMAAnalysis = ({ deal, formatCurrency, analysis, pricePerSqm }: CMAAnalysisProps) => {
  const getMarketTrendIcon = () => {
    switch (analysis?.market_trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-navy-dark">Professional Market Analysis Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Recommendation */}
        <div className="bg-green-50 p-4 rounded-xl">
          <h4 className="font-semibold text-green-900 mb-3">Price Recommendation</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-green-700">Conservative</p>
              <p className="text-xl font-bold text-green-900">
                {analysis?.estimated_arv ? formatCurrency(analysis.estimated_arv * 0.95) : 'TBD'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-green-700">Most Likely</p>
              <p className="text-2xl font-bold text-green-900">
                {analysis?.estimated_arv ? formatCurrency(analysis.estimated_arv) : 'TBD'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-green-700">Optimistic</p>
              <p className="text-xl font-bold text-green-900">
                {analysis?.estimated_arv ? formatCurrency(analysis.estimated_arv * 1.05) : 'TBD'}
              </p>
            </div>
          </div>
        </div>

        {/* Market Conditions */}
        <div>
          <h4 className="font-semibold text-navy-dark mb-3">Current Market Conditions</h4>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-navy">Market Trend:</span>
                <div className="flex items-center gap-1">
                  {getMarketTrendIcon()}
                  <span className="font-medium capitalize">{analysis?.market_trend || 'Stable'}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-navy">Average Days on Market:</span>
                <span className="font-medium">{analysis?.avg_days_on_market || 'TBD'} days</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-navy">Inventory Level:</span>
                <span className="font-medium">Moderate</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy">Price per m²:</span>
                <span className="font-medium">
                  {pricePerSqm > 0 ? `$${Math.round(pricePerSqm).toLocaleString()}` : 'TBD'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Timing */}
        <div>
          <h4 className="font-semibold text-navy-dark mb-3">Investment Timing Assessment</h4>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800">
              Based on current market conditions and comparable sales analysis, this appears to be a 
              {analysis?.market_trend === 'increasing' ? ' favorable' : analysis?.market_trend === 'declining' ? ' cautious' : 'n optimal'} 
              time for property investment in {deal.suburb}. 
              {analysis?.market_trend === 'increasing' && ' Rising market conditions suggest potential for capital growth.'}
              {analysis?.market_trend === 'declining' && ' Declining market conditions require careful consideration of entry price.'}
              {(!analysis?.market_trend || analysis?.market_trend === 'stable') && ' Stable market conditions provide predictable investment returns.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CMAAnalysis;

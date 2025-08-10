import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Ruler, Calendar, Building, DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Deal } from '@/types/analysis';
interface CMAOverviewProps {
  deal: Deal;
  formatCurrency: (amount: number) => string;
  analysis: any;
  comparables: any[];
  priceRange: {
    low: number;
    high: number;
    median: number;
  };
  subjectPricePerSqm: number;
  pricePerSqm: number;
}
const CMAOverview = ({
  deal,
  formatCurrency,
  analysis,
  comparables,
  priceRange,
  subjectPricePerSqm,
  pricePerSqm
}: CMAOverviewProps) => {
  const getMarketTrendIcon = () => {
    switch (analysis?.market_trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };
  return <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Market Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-2">
              <p className="text-sm text-blue-700 mb-1">Estimated Market Value</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-900 break-words">
                {analysis?.estimated_arv ? formatCurrency(analysis.estimated_arv) : 'TBD'}
              </p>
            </div>
            <div className="text-center p-2">
              <p className="text-sm text-blue-700 mb-1">Price Range</p>
              <p className="text-sm sm:text-lg font-bold text-blue-900 break-words">
                {priceRange.low > 0 ? `${formatCurrency(priceRange.low)} - ${formatCurrency(priceRange.high)}` : 'TBD'}
              </p>
            </div>
            <div className="text-center p-2">
              <p className="text-sm text-blue-700 mb-1">Market Trend</p>
              <div className="flex items-center justify-center gap-2 text-base">
                {getMarketTrendIcon()}
                <p className="text-sm sm:text-lg font-bold text-blue-900 capitalize">
                  {analysis?.market_trend || 'TBD'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-600">Price per m²</p>
            </div>
            <p className="text-xl font-bold text-navy-dark">
              {subjectPricePerSqm > 0 ? `$${Math.round(subjectPricePerSqm).toLocaleString()}` : 'TBD'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-600">Days on Market</p>
            </div>
            <p className="text-xl font-bold text-navy-dark">
              {analysis?.avg_days_on_market || 'TBD'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-600">Comparables</p>
            </div>
            <p className="text-xl font-bold text-navy-dark">
              {comparables.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-gray-600" />
              <p className="text-sm text-gray-600">Rental Yield</p>
            </div>
            <p className="text-xl font-bold text-navy-dark">
              {analysis?.rental_yield ? `${analysis.rental_yield.toFixed(1)}%` : 'TBD'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Condition Assessment */}
      {deal.market_analysis?.condition_assessment && <Card>
          <CardHeader>
            <CardTitle className="text-navy-dark">AI Condition Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
          const cond = deal.market_analysis?.condition_assessment;
          const overall = cond?.overall_condition;
          const quickWins = cond?.quick_wins || [];
          const redFlags = cond?.red_flags || [];
          return <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Overall Condition</p>
                    <p className="text-xl font-bold text-navy-dark">
                      {overall?.label || 'TBD'} {overall?.score !== undefined ? `(${Math.round(overall.score)}/100)` : ''}
                    </p>
                    {overall?.confidence !== undefined && <p className="text-xs text-gray-500 mt-1">Confidence: {Math.round((overall.confidence || 0) * 100)}%</p>}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Quick Wins</p>
                    <ul className="list-disc pl-5 text-sm text-navy space-y-1">
                      {quickWins.slice(0, 3).map((w, i) => <li key={i}>{w}</li>)}
                      {quickWins.length === 0 && <li>None identified</li>}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Red Flags</p>
                    <ul className="list-disc pl-5 text-sm text-navy space-y-1">
                      {redFlags.slice(0, 3).map((r, i) => <li key={i}>{r}</li>)}
                      {redFlags.length === 0 && <li>No major issues</li>}
                    </ul>
                  </div>
                </div>;
        })()}
          </CardContent>
        </Card>}

      {/* Market Insights */}
      {analysis?.insights && <Card>
          <CardHeader>
            <CardTitle className="text-navy-dark">Market Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-navy leading-relaxed">{analysis.insights}</p>
          </CardContent>
        </Card>}
    </div>;
};
export default CMAOverview;
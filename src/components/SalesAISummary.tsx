
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from 'lucide-react';

const SalesAISummary = () => {
  const insights = {
    priceRecommendation: {
      type: 'increase',
      amount: 15000,
      confidence: 'High',
      reason: 'Multiple high-interest prospects and competitive offers suggest pricing below market value'
    },
    marketingAdjustments: [
      {
        type: 'strategy',
        title: 'Highlight Kitchen Features',
        description: 'Multiple prospects mentioned loving the kitchen renovation. Feature this more prominently in marketing materials.',
        priority: 'high'
      },
      {
        type: 'concern',
        title: 'Address Garden Size',
        description: 'Two prospects mentioned concerns about garden size. Consider highlighting low-maintenance benefits.',
        priority: 'medium'
      },
      {
        type: 'opportunity',
        title: 'Parking Solutions',
        description: 'Parking was mentioned as a concern. Highlight nearby street parking availability.',
        priority: 'medium'
      }
    ],
    offerAnalysis: {
      averageOffer: 643333,
      highestOffer: 655000,
      offerTrend: 'increasing',
      competitionLevel: 'high'
    },
    recommendations: [
      'Consider setting a deadline for best offers to create urgency',
      'Schedule additional open homes on weekends to increase exposure',
      'Prepare a comparison sheet highlighting unique property features'
    ]
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20">Medium Priority</Badge>;
      case 'low':
        return <Badge className="bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20">Low Priority</Badge>;
      default:
        return null;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strategy':
        return <Lightbulb className="h-5 w-5 text-[#FF9800]" />;
      case 'concern':
        return <AlertTriangle className="h-5 w-5 text-[#D32F2F]" />;
      case 'opportunity':
        return <TrendingUp className="h-5 w-5 text-[#388E3C]" />;
      default:
        return <Lightbulb className="h-5 w-5 text-[#FF9800]" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Card className="bg-white border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">AI Market Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Recommendation */}
        <Card className="border border-gray-200 bg-gradient-to-r from-[#1B5E20]/5 to-[#388E3C]/5">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {insights.priceRecommendation.type === 'increase' ? (
                  <TrendingUp className="h-5 w-5 text-[#388E3C]" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-[#D32F2F]" />
                )}
                <h3 className="font-semibold text-gray-900">Price Recommendation</h3>
              </div>
              <Badge className="bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20">
                {insights.priceRecommendation.confidence} Confidence
              </Badge>
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">
              Consider {insights.priceRecommendation.type === 'increase' ? 'increasing' : 'decreasing'} price by {formatPrice(insights.priceRecommendation.amount)}
            </p>
            <p className="text-sm text-gray-600">{insights.priceRecommendation.reason}</p>
          </CardContent>
        </Card>

        {/* Offer Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-gray-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Average Offer</p>
              <p className="text-xl font-semibold text-gray-900">{formatPrice(insights.offerAnalysis.averageOffer)}</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Highest Offer</p>
              <p className="text-xl font-semibold text-gray-900">{formatPrice(insights.offerAnalysis.highestOffer)}</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-gray-500 mb-1">Competition</p>
              <Badge className="bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20">
                {insights.offerAnalysis.competitionLevel} Level
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Marketing Adjustments */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Marketing Strategy Adjustments</h3>
          <div className="space-y-3">
            {insights.marketingAdjustments.map((adjustment, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getInsightIcon(adjustment.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{adjustment.title}</h4>
                        {getPriorityBadge(adjustment.priority)}
                      </div>
                      <p className="text-sm text-gray-600">{adjustment.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Action Recommendations */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Recommended Actions</h3>
          <div className="space-y-2">
            {insights.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-[#1B5E20] text-white rounded-full flex items-center justify-center text-xs font-semibold mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesAISummary;

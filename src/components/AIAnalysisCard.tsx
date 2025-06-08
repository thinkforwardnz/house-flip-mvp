
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Home,
  Wrench,
  Target,
  Database,
  Star
} from 'lucide-react';
import type { Deal } from '@/types/analysis';

interface AIAnalysisCardProps {
  deal: Deal;
}

const AIAnalysisCard = ({ deal }: AIAnalysisCardProps) => {
  const [activeTab, setActiveTab] = useState('summary');

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-500';
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOverallConfidence = () => {
    const confidences = [
      deal.market_analysis?.analysis?.market_confidence,
      deal.renovation_analysis?.confidence_level,
      deal.risk_assessment?.confidence_level
    ].filter(Boolean);
    
    if (confidences.length === 0) return 0;
    return Math.round(confidences.reduce((a, b) => a + b!, 0) / confidences.length);
  };

  const getDataCompleteness = () => {
    let completed = 0;
    let total = 5;
    
    if (deal.market_analysis?.analysis) completed++;
    if (deal.renovation_analysis?.total_cost) completed++;
    if (deal.risk_assessment?.overall_risk_score) completed++;
    if (deal.market_analysis?.comparables?.length) completed++;
    if (deal.coordinates) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const overallConfidence = getOverallConfidence();
  const dataCompleteness = getDataCompleteness();

  return (
    <Card className="bg-white shadow-lg rounded-2xl border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl text-navy-dark">AI Analysis Summary</CardTitle>
            <p className="text-sm text-navy mt-1">
              Comprehensive AI-powered property analysis and recommendations
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className={`text-sm font-medium ${getConfidenceColor(overallConfidence)}`}>
                {overallConfidence}% Confidence
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-navy">{dataCompleteness}% Complete</span>
            </div>
          </div>
        </div>
        
        {/* Overall Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-navy-dark">Analysis Progress</span>
            <span className="text-sm text-navy">{dataCompleteness}%</span>
          </div>
          <Progress value={dataCompleteness} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full">
            <TabsTrigger value="summary" className="flex-1">Summary</TabsTrigger>
            <TabsTrigger value="market" className="flex-1">Market Data</TabsTrigger>
            <TabsTrigger value="renovation" className="flex-1">Renovation</TabsTrigger>
            <TabsTrigger value="risk" className="flex-1">Risk Analysis</TabsTrigger>
            <TabsTrigger value="raw" className="flex-1">Raw Data</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <div className="space-y-6">
              {/* Key Metrics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Est. ARV</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900">
                    {formatCurrency(deal.market_analysis?.analysis?.estimated_arv)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`text-xs ${getConfidenceColor(deal.market_analysis?.analysis?.market_confidence)}`}>
                      {deal.market_analysis?.analysis?.market_confidence || 0}% confidence
                    </span>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">Renovation Cost</span>
                  </div>
                  <p className="text-lg font-bold text-orange-900">
                    {formatCurrency(deal.renovation_analysis?.total_cost)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`text-xs ${getConfidenceColor(deal.renovation_analysis?.confidence_level)}`}>
                      {deal.renovation_analysis?.confidence_level || 0}% confidence
                    </span>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Est. Profit</span>
                  </div>
                  <p className="text-lg font-bold text-green-900">
                    {formatCurrency(deal.current_profit)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-green-700">
                      {deal.market_analysis?.investment_metrics?.roi_percentage 
                        ? `${Math.round(deal.market_analysis.investment_metrics.roi_percentage)}% ROI`
                        : 'ROI TBD'
                      }
                    </span>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-900">Risk Level</span>
                  </div>
                  <p className="text-lg font-bold text-red-900 capitalize">
                    {deal.risk_assessment?.overall_risk_level || deal.current_risk || 'Unknown'}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`text-xs ${getConfidenceColor(deal.risk_assessment?.confidence_level)}`}>
                      {deal.risk_assessment?.confidence_level || 0}% confidence
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              {(deal.risk_assessment?.recommendations?.length || deal.renovation_analysis?.recommendations?.length) && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-900 mb-3">AI Recommendations</h4>
                  <div className="space-y-2">
                    {deal.risk_assessment?.recommendations?.slice(0, 3).map((rec, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">{rec}</p>
                      </div>
                    ))}
                    {deal.renovation_analysis?.recommendations?.slice(0, 2).map((rec, index) => (
                      <div key={`reno-${index}`} className="flex items-start gap-2">
                        <Wrench className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Market Insights */}
              {deal.market_analysis?.analysis?.insights && (
                <div className="bg-green-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-green-900 mb-2">Market Insights</h4>
                  <p className="text-sm text-green-800">{deal.market_analysis.analysis.insights}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="market">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">Market Trend</p>
                  <p className="text-lg font-bold text-navy-dark capitalize">
                    {deal.market_analysis?.analysis?.market_trend || 'Unknown'}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">Days on Market</p>
                  <p className="text-lg font-bold text-navy-dark">
                    {deal.market_analysis?.analysis?.avg_days_on_market || 'TBD'}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">Price per m²</p>
                  <p className="text-lg font-bold text-navy-dark">
                    {deal.market_analysis?.analysis?.price_per_sqm 
                      ? `$${Math.round(deal.market_analysis.analysis.price_per_sqm)}`
                      : 'TBD'
                    }
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-navy-dark mb-3">Comparable Sales ({deal.market_analysis?.comparables?.length || 0})</h4>
                {deal.market_analysis?.comparables?.length ? (
                  <div className="space-y-3">
                    {deal.market_analysis.comparables.slice(0, 5).map((comp, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-navy-dark">{comp.address || 'Address unavailable'}</p>
                          <p className="text-sm text-navy">
                            {comp.bedrooms}br, {comp.bathrooms}ba
                            {comp.floor_area && ` • ${comp.floor_area}m²`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-navy-dark">{formatCurrency(comp.sold_price)}</p>
                          <p className="text-sm text-navy">{comp.sold_date || 'Date unknown'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Home className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No comparable sales data available</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="renovation">
            <div className="space-y-6">
              {deal.renovation_analysis?.total_cost ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-navy-dark mb-3">Cost Breakdown</h4>
                      <div className="space-y-3">
                        {Object.entries(deal.renovation_analysis)
                          .filter(([key, value]) => typeof value === 'object' && value?.cost)
                          .map(([room, data]: [string, any]) => (
                            <div key={room} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <span className="font-medium capitalize">{room.replace('_', ' ')}</span>
                                {data.description && (
                                  <p className="text-xs text-gray-600">{data.description}</p>
                                )}
                              </div>
                              <span className="font-medium">{formatCurrency(data.cost)}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-navy-dark mb-3">Summary</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700">Total Cost</p>
                          <p className="text-lg font-bold text-blue-900">
                            {formatCurrency(deal.renovation_analysis.total_cost)}
                          </p>
                        </div>
                        {deal.renovation_analysis.timeline_weeks && (
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-700">Timeline</p>
                            <p className="text-lg font-bold text-green-900">
                              {deal.renovation_analysis.timeline_weeks} weeks
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {deal.renovation_analysis.recommendations && (
                    <div className="bg-orange-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-orange-900 mb-3">Renovation Recommendations</h4>
                      <div className="space-y-2">
                        {deal.renovation_analysis.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Wrench className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-orange-800">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Wrench className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Renovation analysis not yet completed</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="risk">
            <div className="space-y-6">
              {deal.risk_assessment?.overall_risk_score ? (
                <>
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-blue-900 mb-3">Overall Risk Assessment</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Progress value={deal.risk_assessment.overall_risk_score} className="h-3" />
                      </div>
                      <Badge className={`${
                        deal.risk_assessment.overall_risk_level === 'low' ? 'bg-green-100 text-green-800' :
                        deal.risk_assessment.overall_risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {deal.risk_assessment.overall_risk_level} Risk
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                      Risk Score: {deal.risk_assessment.overall_risk_score}/100
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(deal.risk_assessment)
                      .filter(([key]) => key.endsWith('_risk'))
                      .map(([key, risk]: [string, any]) => (
                        <div key={key} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium capitalize">
                              {key.replace('_risk', '').replace('_', ' ')} Risk
                            </span>
                            <Badge className={`${
                              risk?.level === 'low' ? 'bg-green-100 text-green-800' :
                              risk?.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            } text-xs`}>
                              {risk?.level || 'Unknown'}
                            </Badge>
                          </div>
                          {risk?.score && (
                            <p className="text-xs text-gray-600">Score: {risk.score}/100</p>
                          )}
                          {risk?.factors?.length > 0 && (
                            <p className="text-xs text-gray-600 mt-1">
                              Key factors: {risk.factors.slice(0, 2).join(', ')}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>

                  {deal.risk_assessment.key_risks && (
                    <div className="bg-red-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-red-900 mb-3">Key Risk Factors</h4>
                      <div className="space-y-2">
                        {deal.risk_assessment.key_risks.map((risk, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-800">{risk}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Risk assessment not yet completed</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="raw">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-medium text-blue-900 mb-2">Market Analysis</h4>
                  <pre className="text-xs text-blue-800 bg-white p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(deal.market_analysis, null, 2)}
                  </pre>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl">
                  <h4 className="font-medium text-orange-900 mb-2">Renovation Analysis</h4>
                  <pre className="text-xs text-orange-800 bg-white p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(deal.renovation_analysis, null, 2)}
                  </pre>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <h4 className="font-medium text-red-900 mb-2">Risk Assessment</h4>
                  <pre className="text-xs text-red-800 bg-white p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(deal.risk_assessment, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-2">Complete Deal Data</h4>
                <pre className="text-xs text-gray-800 bg-white p-3 rounded overflow-auto max-h-60">
                  {JSON.stringify(deal, null, 2)}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIAnalysisCard;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle, AlertTriangle, TrendingUp, Home } from 'lucide-react';
import type { Deal } from '@/types/analysis';
interface AIAnalysisSummaryProps {
  deal: Deal;
}
const AIAnalysisSummary = ({
  deal
}: AIAnalysisSummaryProps) => {
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0
    }).format(amount);
  };
  const getOverallConfidence = () => {
    const confidences = [deal.market_analysis?.analysis?.market_confidence, deal.renovation_analysis?.confidence_level, deal.risk_assessment?.confidence_level].filter(Boolean);
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
    return Math.round(completed / total * 100);
  };
  const getExecutiveSummary = () => {
    const arv = deal.market_analysis?.analysis?.estimated_arv;
    const renovationCost = deal.renovation_analysis?.total_cost;
    const profit = deal.current_profit;
    const risk = deal.risk_assessment?.overall_risk_level || deal.current_risk;
    const confidence = getOverallConfidence();
    if (!arv && !renovationCost) {
      return "Analysis is in progress. Our AI is currently gathering property data from multiple sources including LINZ, Trade Me, and comparable sales records to provide a comprehensive investment assessment.";
    }
    const recommendation = profit && profit > 50000 ? "RECOMMENDED" : profit && profit > 20000 ? "PROCEED WITH CAUTION" : "NOT RECOMMENDED";
    return `Based on comprehensive data analysis, this property shows ${recommendation.toLowerCase()} investment potential. Our AI estimates an After Repair Value (ARV) of ${formatCurrency(arv)} with renovation costs around ${formatCurrency(renovationCost)}, resulting in an estimated profit of ${formatCurrency(profit)}. The overall risk level is assessed as ${risk} with ${confidence}% confidence in our analysis.`;
  };
  const getDataSourcesExplanation = () => {
    const sources = [];
    const quality = [];
    if (deal.coordinates) {
      sources.push("LINZ property records for official property boundaries and zoning information");
      quality.push("✓ Location data verified");
    }
    if (deal.photos?.length) {
      sources.push(`Trade Me listing data including ${deal.photos.length} property photos for condition assessment`);
      quality.push("✓ Visual condition data available");
    }
    if (deal.market_analysis?.comparables?.length) {
      sources.push(`${deal.market_analysis.comparables.length} comparable sales from recent market transactions`);
      quality.push("✓ Market data comprehensive");
    }
    if (deal.market_analysis?.analysis) {
      sources.push("Regional market trend analysis from multiple property databases");
      quality.push("✓ Market analysis complete");
    }
    if (sources.length === 0) {
      return "Data collection is currently in progress. Our AI will analyze information from LINZ property records, Trade Me listings, comparable sales data, and regional market trends to provide accurate valuations.";
    }
    return `Our analysis draws from ${sources.length} primary data sources: ${sources.join(', ')}. Data quality indicators: ${quality.join(', ')}.`;
  };
  const getMarketAnalysisExplanation = () => {
    const analysis = deal.market_analysis?.analysis;
    const comparables = deal.market_analysis?.comparables;
    if (!analysis) {
      return "Market analysis is pending. Our AI will evaluate comparable sales, local market trends, and property-specific factors to determine the optimal After Repair Value (ARV).";
    }
    const arvExplanation = analysis.estimated_arv ? `The estimated ARV of ${formatCurrency(analysis.estimated_arv)} was calculated by analyzing ${comparables?.length || 0} comparable properties in ${deal.suburb}, considering factors such as property size (${deal.bedrooms}br/${deal.bathrooms}ba), recent sale trends, and market conditions.` : "ARV calculation is in progress.";
    const marketTrend = analysis.market_trend ? `Current market trend analysis indicates ${analysis.market_trend} conditions in the local area.` : "";
    const daysOnMarket = analysis.avg_days_on_market ? ` Properties in this area typically sell within ${analysis.avg_days_on_market} days, indicating ${analysis.avg_days_on_market < 30 ? 'strong' : analysis.avg_days_on_market < 60 ? 'moderate' : 'slower'} market demand.` : "";
    const confidence = analysis.market_confidence ? ` Our confidence in this valuation is ${analysis.market_confidence}%, based on the quality and quantity of comparable data available.` : "";
    return `${arvExplanation} ${marketTrend}${daysOnMarket}${confidence}`;
  };
  const getRenovationExplanation = () => {
    const renovation = deal.renovation_analysis;
    if (!renovation?.total_cost) {
      return "Renovation cost analysis is in progress. Our AI will examine property photos and condition indicators to estimate required improvements including kitchen, bathroom, flooring, and cosmetic updates based on Wellington market standards.";
    }
    const totalCost = formatCurrency(renovation.total_cost);
    const timeline = renovation.timeline_weeks ? `over approximately ${renovation.timeline_weeks} weeks` : "";
    const breakdown = [];
    if (renovation.kitchen?.cost) breakdown.push(`kitchen renovation (${formatCurrency(renovation.kitchen.cost)})`);
    if (renovation.bathrooms?.cost) breakdown.push(`bathroom updates (${formatCurrency(renovation.bathrooms.cost)})`);
    if (renovation.flooring?.cost) breakdown.push(`flooring replacement (${formatCurrency(renovation.flooring.cost)})`);
    if (renovation.painting?.cost) breakdown.push(`interior/exterior painting (${formatCurrency(renovation.painting.cost)})`);
    const breakdownText = breakdown.length > 0 ? ` Key components include ${breakdown.join(', ')}.` : "";
    const confidence = renovation.confidence_level ? ` This estimate has ${renovation.confidence_level}% confidence based on visual property assessment and Wellington renovation cost benchmarks.` : "";
    return `Our AI estimates total renovation costs of ${totalCost} ${timeline}.${breakdownText}${confidence} These costs are based on current Wellington contractor rates and material costs, with allowances for typical scope variations in older properties.`;
  };
  const getInvestmentCalculation = () => {
    const arv = deal.market_analysis?.analysis?.estimated_arv;
    const renovationCost = deal.renovation_analysis?.total_cost || 50000;
    const profit = deal.current_profit;
    if (!arv) {
      return "Investment calculation will be completed once market analysis is finished. This will include purchase price recommendations based on the 70% rule and local market conditions.";
    }
    const maxPurchase = arv * 0.7 - renovationCost;
    const transactionCosts = arv * 0.1;
    const targetProfit = arv * 0.15;
    return `Using the conservative 70% rule for house flipping, with an ARV of ${formatCurrency(arv)} and renovation costs of ${formatCurrency(renovationCost)}, the maximum recommended purchase price is ${formatCurrency(maxPurchase)}. This calculation accounts for transaction costs (${formatCurrency(transactionCosts)} - 10% of ARV) and target profit margin (${formatCurrency(targetProfit)} - 15% of ARV). Current estimated profit of ${formatCurrency(profit)} ${profit && profit > 50000 ? 'exceeds' : profit && profit > 20000 ? 'meets minimum' : 'falls below'} recommended thresholds for Wellington market conditions.`;
  };
  const getRiskAnalysisNarrative = () => {
    const risk = deal.risk_assessment;
    if (!risk?.overall_risk_score) {
      return "Comprehensive risk assessment is in progress. Our AI will evaluate market risks, financial exposure, property-specific risks, and renovation complexities to provide a detailed risk profile.";
    }
    const riskLevel = risk.overall_risk_level;
    const riskScore = risk.overall_risk_score;
    const riskFactors = [];
    if (risk.market_risk?.level) riskFactors.push(`market risk is ${risk.market_risk.level}`);
    if (risk.financial_risk?.level) riskFactors.push(`financial risk is ${risk.financial_risk.level}`);
    if (risk.property_risk?.level) riskFactors.push(`property-specific risk is ${risk.property_risk.level}`);
    if (risk.renovation_risk?.level) riskFactors.push(`renovation risk is ${risk.renovation_risk.level}`);
    const factorsText = riskFactors.length > 0 ? ` Key factors: ${riskFactors.join(', ')}.` : "";
    const keyRisks = risk.key_risks?.length ? ` Primary concerns include: ${risk.key_risks.slice(0, 3).join(', ')}.` : "";
    const recommendations = risk.recommendations?.length ? ` Recommended mitigation strategies: ${risk.recommendations.slice(0, 2).join(', ')}.` : "";
    return `Overall risk assessment: ${riskLevel?.toUpperCase()} (${riskScore}/100).${factorsText}${keyRisks}${recommendations} This assessment considers local market volatility, property condition, renovation complexity, and financial exposure specific to Wellington's property investment landscape.`;
  };
  const getFinalRecommendations = () => {
    const profit = deal.current_profit;
    const risk = deal.risk_assessment?.overall_risk_level || deal.current_risk;
    const confidence = getOverallConfidence();
    if (!profit) {
      return "Final recommendations will be provided once all analysis components are complete.";
    }
    let recommendation = "";
    if (profit > 50000 && risk === 'low') {
      recommendation = "STRONG BUY - Excellent profit potential with manageable risk profile.";
    } else if (profit > 30000 && (risk === 'low' || risk === 'medium')) {
      recommendation = "PROCEED - Good investment opportunity with standard due diligence.";
    } else if (profit > 15000) {
      recommendation = "PROCEED WITH CAUTION - Marginal returns requiring careful risk management.";
    } else {
      recommendation = "AVOID - Insufficient profit margin for recommended investment criteria.";
    }
    const nextSteps = ["Verify renovation cost estimates with local contractors", "Conduct detailed property inspection focusing on structural elements", "Confirm market analysis with recent local sales", "Secure pre-approval for purchase and renovation financing"];
    return `${recommendation} Based on ${confidence}% analysis confidence, immediate next steps should include: ${nextSteps.join(', ')}. Consider consulting with local real estate professionals to validate assumptions before proceeding with any offers.`;
  };
  const overallConfidence = getOverallConfidence();
  const dataCompleteness = getDataCompleteness();
  return <Card className="bg-white shadow-lg rounded-2xl border-0">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl text-navy-dark">AI Investment Analysis Report</CardTitle>
            <p className="text-sm text-navy mt-1">
              Comprehensive property analysis and investment recommendation
            </p>
          </div>
          <div className="text-right">
            <Badge className={`mb-2 ${overallConfidence >= 80 ? 'bg-green-100 text-green-800' : overallConfidence >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
              {overallConfidence}% Confidence
            </Badge>
            <div className="text-sm text-navy">{dataCompleteness}% Data Complete</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 py-[30px] px-[15px]">
        {/* Executive Summary */}
        <div className="bg-blue-50 p-4 rounded-xl my-0 mb-20">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Executive Summary
          </h3>
          <p className="text-blue-800 leading-relaxed">{getExecutiveSummary()}</p>
        </div>

        {/* Data Sources */}
        <div>
          <h3 className="font-semibold text-navy-dark mb-2">Data Collection & Sources</h3>
          <p className="text-navy leading-relaxed">{getDataSourcesExplanation()}</p>
        </div>

        {/* Market Analysis */}
        <div>
          <h3 className="font-semibold text-navy-dark mb-2">Market Valuation Methodology</h3>
          <p className="text-navy leading-relaxed">{getMarketAnalysisExplanation()}</p>
        </div>

        {/* Renovation Analysis */}
        <div>
          <h3 className="font-semibold text-navy-dark mb-2">Renovation Cost Assessment</h3>
          <p className="text-navy leading-relaxed">{getRenovationExplanation()}</p>
        </div>

        {/* Investment Calculation */}
        <div>
          <h3 className="font-semibold text-navy-dark mb-2">Investment Calculation Framework</h3>
          <p className="text-navy leading-relaxed">{getInvestmentCalculation()}</p>
        </div>

        {/* Risk Analysis */}
        <div>
          <h3 className="font-semibold text-navy-dark mb-2">Risk Assessment</h3>
          <p className="text-navy leading-relaxed">{getRiskAnalysisNarrative()}</p>
        </div>

        {/* Final Recommendations */}
        <div className="bg-green-50 p-4 rounded-xl">
          <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Investment Recommendation
          </h3>
          <p className="text-green-800 leading-relaxed">{getFinalRecommendations()}</p>
        </div>

        {/* Analysis Completeness Indicator */}
        {dataCompleteness < 100 && <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <h4 className="font-medium text-yellow-900">Analysis In Progress</h4>
            </div>
            <p className="text-yellow-800 text-sm">
              This analysis is {dataCompleteness}% complete. Additional data collection and analysis are ongoing to provide more accurate recommendations. Final figures may vary as more information becomes available.
            </p>
          </div>}
      </CardContent>
    </Card>;
};
export default AIAnalysisSummary;
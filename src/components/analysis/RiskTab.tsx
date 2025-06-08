
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle } from 'lucide-react';
import type { Deal, RiskAssessment } from '@/types/analysis';

interface RiskTabProps {
  deal: Deal;
}

const RiskTab = ({ deal }: RiskTabProps) => {
  // Type-safe accessor functions
  const getRiskLevel = (riskData: any): string => {
    return riskData?.level || 'unknown';
  };

  const getRiskScore = (riskData: any): number => {
    return riskData?.score || 0;
  };

  const getRiskFactors = (riskData: any): string[] => {
    return riskData?.factors || [];
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-navy-dark">Risk Assessment</h3>
      
      {deal.risk_assessment ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-navy-dark mb-3">Risk Categories</h4>
              <div className="space-y-3">
                {Object.entries(deal.risk_assessment as RiskAssessment).filter(([key]) => key.endsWith('_risk')).map(([key, risk]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize">{key.replace('_risk', '').replace('_', ' ')} Risk</span>
                      <Badge className={`${
                        getRiskLevel(risk) === 'low' ? 'bg-green-100 text-green-800' :
                        getRiskLevel(risk) === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      } text-xs`}>
                        {getRiskLevel(risk)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">Score: {getRiskScore(risk)}/100</p>
                    {getRiskFactors(risk).length > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        Key factors: {getRiskFactors(risk).slice(0, 2).join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-navy-dark mb-3">Risk Mitigation</h4>
              <div className="space-y-3">
                {deal.risk_assessment.recommendations?.map((rec, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl">
            <h4 className="font-medium text-blue-900 mb-2">Overall Risk Assessment</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Progress value={deal.risk_assessment.overall_risk_score || 50} className="h-3" />
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
              {deal.risk_assessment.confidence_level && 
                ` • Confidence: ${deal.risk_assessment.confidence_level}%`
              }
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-navy-dark mb-3">Market Risks</h4>
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Market Trends</span>
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">Medium</Badge>
                  </div>
                  <p className="text-xs text-yellow-700">Market analysis needed</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Days on Market</span>
                    <Badge className="bg-green-100 text-green-800 text-xs">Low</Badge>
                  </div>
                  <p className="text-xs text-green-700">Good sales velocity in area</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Rental Yield</span>
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">Medium</Badge>
                  </div>
                  <p className="text-xs text-yellow-700">Analysis in progress</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-navy-dark mb-3">Property Risks</h4>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Zoning Compliance</span>
                    <Badge className="bg-gray-100 text-gray-800 text-xs">Unknown</Badge>
                  </div>
                  <p className="text-xs text-gray-600">Council data required</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Structural Condition</span>
                    <Badge className="bg-green-100 text-green-800 text-xs">Low</Badge>
                  </div>
                  <p className="text-xs text-green-700">No obvious issues visible</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Renovation Complexity</span>
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">Medium</Badge>
                  </div>
                  <p className="text-xs text-yellow-700">Standard renovation scope</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl">
            <h4 className="font-medium text-blue-900 mb-2">Overall Risk Score</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Progress value={60} className="h-3" />
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              Overall risk is medium due to pending market analysis and zoning verification.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default RiskTab;

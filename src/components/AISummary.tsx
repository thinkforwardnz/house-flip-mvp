
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface AISummaryProps {
  summary: string;
  confidence: 'High' | 'Medium' | 'Low';
  keyInsights: string[];
}

const AISummary = ({ summary, confidence, keyInsights }: AISummaryProps) => {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High': return 'bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20';
      case 'Medium': return 'bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20';
      case 'Low': return 'bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI Analysis: {summary}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 font-medium">Confidence:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(confidence)}`}>
                {confidence}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">Key Insights:</h4>
          <ul className="space-y-1">
            {keyInsights.map((insight, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="text-[#FF9800] mr-2 font-bold">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AISummary;

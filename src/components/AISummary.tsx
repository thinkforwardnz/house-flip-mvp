
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
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-gradient-to-r from-[#1B5E20]/5 to-[#FF9800]/5 border border-[#1B5E20]/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI Analysis: {summary}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Confidence:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(confidence)}`}>
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
                <span className="text-[#FF9800] mr-2">•</span>
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

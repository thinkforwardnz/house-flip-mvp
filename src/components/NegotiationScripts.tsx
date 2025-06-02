
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Copy, RefreshCw } from 'lucide-react';

interface Script {
  id: string;
  scenario: string;
  script: string;
  context: string;
}

const NegotiationScripts = () => {
  const [scripts] = useState<Script[]>([
    {
      id: '1',
      scenario: 'Quick Settlement Offer',
      script: "We're prepared to offer a 10-day settlement with no conditions if you can meet us at $630,000. This gives you certainty and a fast transaction with minimal risk.",
      context: 'Best for motivated vendors who need quick sale'
    },
    {
      id: '2',
      scenario: 'Price Justification',
      script: "Based on recent sales in the area and the renovation costs we've identified, our offer of $625,000 reflects fair market value. We're ready to proceed immediately with pre-approved finance.",
      context: 'When vendor questions your offer price'
    },
    {
      id: '3',
      scenario: 'Conditional Offer Follow-up',
      script: "We understand conditions can seem risky, but we have strong pre-approval and our builder's report is just due diligence. We're committed buyers and won't use conditions to renegotiate unless major issues arise.",
      context: 'When vendor is hesitant about conditions'
    },
    {
      id: '4',
      scenario: 'Counter-offer Response',
      script: "Thank you for the counter-offer. We appreciate your position, but our analysis shows $635,000 is our absolute maximum. We can remove the LIM condition to show our commitment at this price.",
      context: 'Responding to vendor counter-offers'
    }
  ]);

  const [generatingNew, setGeneratingNew] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateNewScript = () => {
    setGeneratingNew(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratingNew(false);
    }, 2000);
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#1B5E20]" />
            AI Negotiation Scripts
          </div>
          <Button 
            onClick={generateNewScript}
            disabled={generatingNew}
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-600"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${generatingNew ? 'animate-spin' : ''}`} />
            Generate New
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scripts.map((script) => (
          <div key={script.id} className="bg-[#F8F9FA] rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">{script.scenario}</h4>
                <p className="text-xs text-gray-500">{script.context}</p>
              </div>
              <Button
                onClick={() => copyToClipboard(script.script)}
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="bg-white rounded-md p-3 border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed italic">
                "{script.script}"
              </p>
            </div>
          </div>
        ))}

        {generatingNew && (
          <div className="bg-[#F8F9FA] rounded-lg p-4 border border-gray-200 animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="h-4 w-4 animate-spin text-[#1B5E20]" />
              <span className="text-sm font-medium text-gray-600">Generating personalized script...</span>
            </div>
            <div className="bg-white rounded-md p-3 border border-gray-200">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NegotiationScripts;

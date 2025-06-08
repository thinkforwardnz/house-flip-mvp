
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CMAOverview from './cma/CMAOverview';
import CMASubjectProperty from './cma/CMASubjectProperty';
import CMAComparables from './cma/CMAComparables';
import CMAAnalysis from './cma/CMAAnalysis';
import type { Deal } from '@/types/analysis';

interface CMATabProps {
  deal: Deal;
  formatCurrency: (amount: number) => string;
}

const CMATab = ({ deal, formatCurrency }: CMATabProps) => {
  const [activeView, setActiveView] = useState('overview');

  // Calculate key metrics
  const analysis = deal.market_analysis?.analysis;
  const comparables = deal.market_analysis?.comparables || [];
  const pricePerSqm = analysis?.price_per_sqm || 0;
  const subjectPricePerSqm = deal.floor_area && analysis?.estimated_arv 
    ? analysis.estimated_arv / deal.floor_area 
    : 0;

  // Calculate price range based on comparables
  const calculatePriceRange = () => {
    if (comparables.length === 0) return { low: 0, high: 0, median: 0 };
    
    const prices = comparables
      .filter(comp => comp.sold_price)
      .map(comp => comp.sold_price!)
      .sort((a, b) => a - b);
    
    if (prices.length === 0) return { low: 0, high: 0, median: 0 };
    
    return {
      low: prices[0],
      high: prices[prices.length - 1],
      median: prices[Math.floor(prices.length / 2)]
    };
  };

  const priceRange = calculatePriceRange();

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-navy-dark">Comparative Market Analysis (CMA)</h3>
        <Badge className={analysis?.market_confidence ? getConfidenceColor(analysis.market_confidence) : 'bg-gray-100 text-gray-800'}>
          {analysis?.market_confidence || 0}% Confidence
        </Badge>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subject">Subject Property</TabsTrigger>
          <TabsTrigger value="comparables">Comparables</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CMAOverview 
            deal={deal}
            formatCurrency={formatCurrency}
            analysis={analysis}
            comparables={comparables}
            priceRange={priceRange}
            subjectPricePerSqm={subjectPricePerSqm}
            pricePerSqm={pricePerSqm}
          />
        </TabsContent>

        <TabsContent value="subject" className="space-y-6">
          <CMASubjectProperty deal={deal} />
        </TabsContent>

        <TabsContent value="comparables" className="space-y-6">
          <CMAComparables 
            deal={deal}
            formatCurrency={formatCurrency}
            comparables={comparables}
            pricePerSqm={pricePerSqm}
          />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <CMAAnalysis 
            deal={deal}
            formatCurrency={formatCurrency}
            analysis={analysis}
            pricePerSqm={pricePerSqm}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CMATab;

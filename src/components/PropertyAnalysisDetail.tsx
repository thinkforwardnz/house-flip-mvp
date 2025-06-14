import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Removed supabase, useToast, CheckCircle, AlertTriangle as they are now in the hook
import AIAnalysisSummary from '@/components/AIAnalysisSummary';
import PropertyHeader from '@/components/analysis/PropertyHeader';
import OverviewTab from '@/components/analysis/OverviewTab';
import DataCollectionTab from '@/components/analysis/DataCollectionTab';
import CMATab from '@/components/analysis/CMATab';
import RenovationTab from '@/components/analysis/RenovationTab';
import OfferTab from '@/components/analysis/OfferTab';
import RiskTab from '@/components/analysis/RiskTab';
import type { Deal } from '@/types/analysis';
import { usePropertyAnalysis } from '@/hooks/usePropertyAnalysis'; // Import the new hook

interface PropertyAnalysisDetailProps {
  deal: Deal;
  onSaveDealUpdates: (updates: Partial<Deal>) => void; // Changed prop name and type
}

const PropertyAnalysisDetail = ({ deal, onSaveDealUpdates }: PropertyAnalysisDetailProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  // The usePropertyAnalysis hook's onUpdateDeal needs to be adapted or this component needs to manage it.
  // For now, the hook's onUpdateDeal is for AI analysis pipeline updates.
  // The onSaveDealUpdates prop is for direct user edits from tabs.
  const {
    isAnalyzing,
    analysisStep,
    handleRunAnalysis,
    formatCurrency,
    progress,
    completed,
    pending,
    renovationEstimate,
    offerPrice,
    dataSourceStatus,
  } = usePropertyAnalysis(deal, onSaveDealUpdates); // Pass onSaveDealUpdates to the hook if it needs to trigger updates

  // This function will be passed to child tabs for them to send updates upwards.
  const handleChildTabUpdates = (updates: Partial<Deal>) => {
    onSaveDealUpdates(updates); 
  };

  return (
    <div className="space-y-3 sm:space-y-5 md:space-y-6 w-full overflow-x-hidden">
      {/* Property Header */}
      <div className="w-full">
        <PropertyHeader
          deal={deal}
          isAnalyzing={isAnalyzing}
          analysisStep={analysisStep}
          progress={progress}
          completed={completed}
          pending={pending}
          onRunAnalysis={handleRunAnalysis}
        />
      </div>

      {/* Analysis Tabs */}
      <Card className="bg-white shadow-lg rounded-2xl border-0 w-full">
        <CardContent className="p-2 xs:p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-wrap gap-2 mb-3 sm:gap-4 sm:mb-6 overflow-x-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="data">Data Collection</TabsTrigger>
              <TabsTrigger value="cma">Market Analysis</TabsTrigger>
              <TabsTrigger value="renovation">Renovation</TabsTrigger>
              <TabsTrigger value="offer">Offer Calculation</TabsTrigger>
              <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab
                deal={deal}
                formatCurrency={formatCurrency}
                renovationEstimate={renovationEstimate}
                offerPrice={offerPrice}
              />
            </TabsContent>

            <TabsContent value="data">
              <DataCollectionTab
                dataSourceStatus={dataSourceStatus}
                isAnalyzing={isAnalyzing}
                onRunAnalysis={handleRunAnalysis}
              />
            </TabsContent>

            <TabsContent value="cma">
              <CMATab 
                deal={deal} 
                formatCurrency={formatCurrency}
                onDealUpdate={handleChildTabUpdates}
              />
            </TabsContent>

            <TabsContent value="renovation">
              <RenovationTab
                deal={deal}
                formatCurrency={formatCurrency}
                renovationEstimate={renovationEstimate} 
                onDealUpdate={handleChildTabUpdates}
              />
            </TabsContent>

            <TabsContent value="offer">
              <OfferTab
                deal={deal}
                formatCurrency={formatCurrency}
                renovationEstimate={renovationEstimate}
                offerPrice={offerPrice}
              />
            </TabsContent>

            <TabsContent value="risk">
              <RiskTab deal={deal} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Analysis Summary */}
      <div className="w-full"><AIAnalysisSummary deal={deal} /></div>
    </div>
  );
};

export default PropertyAnalysisDetail;

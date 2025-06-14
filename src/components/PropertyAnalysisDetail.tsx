
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
  onUpdateDeal: (updates: any) => void;
}

const PropertyAnalysisDetail = ({ deal, onUpdateDeal }: PropertyAnalysisDetailProps) => {
  const [activeTab, setActiveTab] = useState('overview');

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
  } = usePropertyAnalysis(deal, onUpdateDeal);

  // These handlers are simple wrappers and can stay in the component
  // or be passed directly if preferred, but this is clear.
  const handleDealUpdate = (updatedDealData: Deal) => {
    onUpdateDeal(updatedDealData);
  };

  const handlePartialDealUpdate = (updates: Partial<Deal>) => {
    // The hook's onUpdateDeal will likely fetch the full new deal,
    // but if a component needs to optimistically update or provide partial updates
    // before a full refresh, this pattern can be useful.
    // For now, it merges locally and calls the main updater.
    // The hook itself calls onUpdateDeal with the full updated deal from Supabase.
    const updatedDeal = { ...deal, ...updates };
    onUpdateDeal(updatedDeal); 
  };

  return (
    <div className="space-y-6">
      {/* Property Header */}
      <PropertyHeader
        deal={deal}
        isAnalyzing={isAnalyzing}
        analysisStep={analysisStep}
        progress={progress}
        completed={completed}
        pending={pending}
        onRunAnalysis={handleRunAnalysis}
      />

      {/* Analysis Tabs */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
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
                onDealUpdate={handleDealUpdate} // Used for full deal object updates from CMATab
              />
            </TabsContent>

            <TabsContent value="renovation">
              <RenovationTab
                deal={deal}
                formatCurrency={formatCurrency}
                renovationEstimate={renovationEstimate} // renovationEstimate prop is still passed
                onDealUpdate={handlePartialDealUpdate} // Used for partial updates like renovation_selections
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
      <AIAnalysisSummary deal={deal} />
    </div>
  );
};

export default PropertyAnalysisDetail;


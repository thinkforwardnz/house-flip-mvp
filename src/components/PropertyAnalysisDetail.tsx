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
    <div className="space-y-2 xs:space-y-3 sm:space-y-5 md:space-y-6 w-full overflow-x-hidden">
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
        <CardContent className="p-1 xs:p-2 sm:p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex flex-nowrap gap-1 xs:gap-2 sm:gap-4 sm:mb-6 mb-2 overflow-x-auto no-scrollbar min-w-0">
              <TabsTrigger value="overview" className="min-w-[110px]">Overview</TabsTrigger>
              <TabsTrigger value="data" className="min-w-[110px]">Data Collection</TabsTrigger>
              <TabsTrigger value="cma" className="min-w-[110px]">Market Analysis</TabsTrigger>
              <TabsTrigger value="renovation" className="min-w-[110px]">Renovation</TabsTrigger>
              <TabsTrigger value="offer" className="min-w-[110px]">Offer Calculation</TabsTrigger>
              <TabsTrigger value="risk" className="min-w-[110px]">Risk Assessment</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="px-0 xs:px-1 sm:px-0">
                <OverviewTab
                  deal={deal}
                  formatCurrency={formatCurrency}
                  renovationEstimate={renovationEstimate}
                  offerPrice={offerPrice}
                />
              </div>
            </TabsContent>

            <TabsContent value="data">
              <div className="px-0 xs:px-1 sm:px-0">
                <DataCollectionTab
                  dataSourceStatus={dataSourceStatus}
                  isAnalyzing={isAnalyzing}
                  onRunAnalysis={handleRunAnalysis}
                />
              </div>
            </TabsContent>

            <TabsContent value="cma">
              <div className="px-0 xs:px-1 sm:px-0">
                <CMATab 
                  deal={deal} 
                  formatCurrency={formatCurrency}
                  onDealUpdate={handleChildTabUpdates}
                />
              </div>
            </TabsContent>

            <TabsContent value="renovation">
              <div className="px-0 xs:px-1 sm:px-0">
                <RenovationTab
                  deal={deal}
                  formatCurrency={formatCurrency}
                  renovationEstimate={renovationEstimate} 
                  onDealUpdate={handleChildTabUpdates}
                />
              </div>
            </TabsContent>

            <TabsContent value="offer">
              <div className="px-0 xs:px-1 sm:px-0">
                <OfferTab
                  deal={deal}
                  formatCurrency={formatCurrency}
                  renovationEstimate={renovationEstimate}
                  offerPrice={offerPrice}
                />
              </div>
            </TabsContent>

            <TabsContent value="risk">
              <div className="px-0 xs:px-1 sm:px-0">
                <RiskTab deal={deal} />
              </div>
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


import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIAnalysisSummary from '@/components/AIAnalysisSummary';
import PropertyHeader from '@/components/analysis/PropertyHeader';
import OverviewTab from '@/components/analysis/OverviewTab';
import DataCollectionTab from '@/components/analysis/DataCollectionTab';
import CMATab from '@/components/analysis/CMATab';
import RenovationTab from '@/components/analysis/RenovationTab';
import OfferTab from '@/components/analysis/OfferTab';
import RiskTab from '@/components/analysis/RiskTab';
import type { Deal } from '@/types/analysis';
import { usePropertyAnalysis } from '@/hooks/usePropertyAnalysis';
import AnalysisMobileTabSelector from "@/components/analysis/AnalysisMobileTabSelector";
import { useIsMobile } from '@/hooks/use-mobile';

interface PropertyAnalysisDetailProps {
  deal: Deal;
  onSaveDealUpdates: (updates: Partial<Deal>) => void;
}

const PropertyAnalysisDetail = ({ deal, onSaveDealUpdates }: PropertyAnalysisDetailProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useIsMobile();

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
  } = usePropertyAnalysis(deal, onSaveDealUpdates);

  const handleChildTabUpdates = (updates: Partial<Deal>) => {
    onSaveDealUpdates(updates); 
  };

  return (
    <div className="space-y-3 sm:space-y-4 w-full">
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

      {/* Tab Selector */}
      {isMobile ? (
        <AnalysisMobileTabSelector tab={activeTab} onTabChange={setActiveTab} className="mb-2" />
      ) : (
        <Card className="bg-white shadow-lg rounded-2xl border-0 w-full">
          <CardContent className="p-2 sm:p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex flex-nowrap gap-1 sm:gap-2 mb-3 sm:mb-4 overflow-x-auto">
                <TabsTrigger value="overview" className="min-w-[90px] text-xs sm:text-sm">Overview</TabsTrigger>
                <TabsTrigger value="data" className="min-w-[90px] text-xs sm:text-sm">Data Collection</TabsTrigger>
                <TabsTrigger value="cma" className="min-w-[90px] text-xs sm:text-sm">Market Analysis</TabsTrigger>
                <TabsTrigger value="renovation" className="min-w-[90px] text-xs sm:text-sm">Renovation</TabsTrigger>
                <TabsTrigger value="offer" className="min-w-[90px] text-xs sm:text-sm">Offer Calculation</TabsTrigger>
                <TabsTrigger value="risk" className="min-w-[90px] text-xs sm:text-sm">Risk Assessment</TabsTrigger>
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
      )}

      {/* Tabs content for mobile: only show active tab */}
      {isMobile && (
        <Card className="bg-white shadow-lg rounded-2xl border-0 w-full">
          <CardContent className="p-3 sm:p-4">
            {activeTab === "overview" && (
              <OverviewTab
                deal={deal}
                formatCurrency={formatCurrency}
                renovationEstimate={renovationEstimate}
                offerPrice={offerPrice}
              />
            )}
            {activeTab === "data" && (
              <DataCollectionTab
                dataSourceStatus={dataSourceStatus}
                isAnalyzing={isAnalyzing}
                onRunAnalysis={handleRunAnalysis}
              />
            )}
            {activeTab === "cma" && (
              <CMATab 
                deal={deal} 
                formatCurrency={formatCurrency}
                onDealUpdate={handleChildTabUpdates}
              />
            )}
            {activeTab === "renovation" && (
              <RenovationTab
                deal={deal}
                formatCurrency={formatCurrency}
                renovationEstimate={renovationEstimate} 
                onDealUpdate={handleChildTabUpdates}
              />
            )}
            {activeTab === "offer" && (
              <OfferTab
                deal={deal}
                formatCurrency={formatCurrency}
                renovationEstimate={renovationEstimate}
                offerPrice={offerPrice}
              />
            )}
            {activeTab === "risk" && <RiskTab deal={deal} />}
          </CardContent>
        </Card>
      )}
      
      {/* AI Analysis Summary */}
      <div className="w-full">
        <AIAnalysisSummary deal={deal} />
      </div>
    </div>
  );
};

export default PropertyAnalysisDetail;

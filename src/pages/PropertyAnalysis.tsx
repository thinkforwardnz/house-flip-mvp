import React, { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import PropertySelector from '@/components/PropertySelector';
import { useSelectedDeal } from '@/hooks/useSelectedDeal';
import { useDeals } from '@/hooks/useDeals';
import AnalysisDashboard from '@/components/AnalysisDashboard';
import PropertyAnalysisDetail from '@/components/PropertyAnalysisDetail';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import type { Deal } from '@/types/analysis';

const PropertyAnalysis = () => {
  const { dealId } = useParams();
  const { selectedDeal, selectedDealId, selectDeal, isLoading } = useSelectedDeal('Analysis');
  const { deals, updateDeal } = useDeals();

  // Always call useDeals once, then find the deal
  const currentDealId = dealId || selectedDealId;
  const currentDeal = dealId 
    ? deals.find(d => d.id === dealId)
    : selectedDeal;

  const handleSaveDealUpdates = useCallback((dealUpdates: Partial<Deal>) => {
    if (currentDeal?.id) {
      updateDeal({ id: currentDeal.id, ...dealUpdates });
    }
  }, [currentDeal?.id, updateDeal]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-full sm:max-w-[640px] px-1 xs:px-2 md:px-0 space-y-4 sm:space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-2/3 sm:w-1/3 mb-3 sm:mb-4"></div>
          <div className="h-24 sm:h-32 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
            <div className="h-40 sm:h-64 bg-gray-200 rounded"></div>
            <div className="h-40 sm:h-64 bg-gray-200 rounded"></div>
            <div className="h-40 sm:h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-full sm:max-w-[640px] px-1 xs:px-2 md:px-0 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="mb-5 sm:mb-7">
        <h1 className="text-xl xs:text-2xl md:text-3xl font-bold text-white mb-1 xs:mb-2">Property Analysis</h1>
        <p className="text-blue-100 text-xs xs:text-sm md:text-lg">
          {dealId ? 'Detailed property analysis and financial modeling' : 'AI-powered analysis dashboard'}
        </p>
      </div>

      {dealId ? (
        <>
          <PropertySelector 
            currentDealId={currentDealId}
            onDealSelect={selectDeal}
            currentStage="Analysis"
          />
          {currentDeal ? (
            <div className="w-full">
              <PropertyAnalysisDetail 
                deal={currentDeal}
                onSaveDealUpdates={handleSaveDealUpdates}
              />
            </div>
          ) : (
            <Card className="bg-white shadow-lg rounded-2xl border-0">
              <CardContent className="p-4 sm:p-6 md:p-12 text-center">
                <MapPin className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-gray-300 mx-auto mb-2 sm:mb-4 md:mb-6" />
                <h3 className="text-base sm:text-lg font-semibold text-navy-dark mb-2">Property Not Found</h3>
                <p className="text-navy mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm md:text-base">The requested property could not be found in the analysis stage.</p>
                <Button 
                  onClick={() => window.location.href = '/analysis'} 
                  className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm md:text-base"
                >
                  Back to Analysis Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <div className="w-full">
          <AnalysisDashboard />
        </div>
      )}
    </div>
  );
};

export default PropertyAnalysis;

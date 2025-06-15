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
  const {
    dealId
  } = useParams();
  const {
    selectedDeal,
    selectedDealId,
    selectDeal,
    isLoading
  } = useSelectedDeal('Analysis');
  const {
    deals,
    updateDeal
  } = useDeals();

  // Always call useDeals once, then find the deal
  const currentDealId = dealId || selectedDealId;
  const currentDeal = dealId ? deals.find(d => d.id === dealId) : selectedDeal;
  const handleSaveDealUpdates = useCallback((dealUpdates: Partial<Deal>) => {
    if (currentDeal?.id) {
      updateDeal({
        id: currentDeal.id,
        ...dealUpdates
      });
    }
  }, [currentDeal?.id, updateDeal]);
  if (isLoading) {
    return <div className="w-full max-w-sm sm:max-w-2xl lg:max-w-4xl mx-auto px-2 sm:px-4 space-y-3 sm:space-y-4">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-2/3 mb-2 sm:mb-3"></div>
          <div className="h-20 sm:h-24 bg-gray-200 rounded mb-3 sm:mb-4"></div>
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <div className="h-32 sm:h-40 bg-gray-200 rounded"></div>
            <div className="h-32 sm:h-40 bg-gray-200 rounded"></div>
            <div className="h-32 sm:h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>;
  }
  return <div className="w-full max-w-sm sm:max-w-2xl lg:max-w-4xl mx-auto px-2 sm:px-4 space-y-3 sm:space-y-4">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 text-gray-700">Property Analysis</h1>
        <p className="text-xs sm:text-sm text-slate-800">
          {dealId ? 'Detailed property analysis and financial modeling' : 'AI-powered analysis dashboard'}
        </p>
      </div>

      {dealId ? <>
          <PropertySelector currentDealId={currentDealId} onDealSelect={selectDeal} currentStage="Analysis" />
          {currentDeal ? <div className="w-full">
              <PropertyAnalysisDetail deal={currentDeal} onSaveDealUpdates={handleSaveDealUpdates} />
            </div> : <Card className="bg-white shadow-lg rounded-2xl border-0">
              <CardContent className="p-4 sm:p-6 text-center">
                <MapPin className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-sm sm:text-base font-semibold text-navy-dark mb-2">Property Not Found</h3>
                <p className="text-navy mb-3 sm:mb-4 text-xs sm:text-sm">The requested property could not be found in the analysis stage.</p>
                <Button onClick={() => window.location.href = '/analysis'} className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm">
                  Back to Analysis Dashboard
                </Button>
              </CardContent>
            </Card>}
        </> : <div className="w-full">
          <AnalysisDashboard />
        </div>}
    </div>;
};
export default PropertyAnalysis;
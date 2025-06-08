
import React from 'react';
import { useParams } from 'react-router-dom';
import PropertySelector from '@/components/PropertySelector';
import { useSelectedDeal } from '@/hooks/useSelectedDeal';
import { useDeals } from '@/hooks/useDeals';
import AnalysisDashboard from '@/components/AnalysisDashboard';
import PropertyAnalysisDetail from '@/components/PropertyAnalysisDetail';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

const PropertyAnalysis = () => {
  const { dealId } = useParams();
  const { selectedDeal, selectedDealId, selectDeal, isLoading } = useSelectedDeal('Analysis');
  const { updateDeal } = useDeals();

  // If we have a specific dealId in the URL, use that for detailed analysis
  const currentDealId = dealId || selectedDealId;
  const currentDeal = dealId 
    ? useDeals().deals.find(d => d.id === dealId)
    : selectedDeal;

  const handleUpdateDeal = (updates: any) => {
    if (currentDeal) {
      updateDeal({ id: currentDeal.id, ...updates });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Property Analysis</h1>
        <p className="text-blue-100 text-lg">
          {dealId ? 'Detailed property analysis and financial modeling' : 'AI-powered analysis dashboard'}
        </p>
      </div>

      {/* Show detailed analysis if dealId is provided, otherwise show dashboard */}
      {dealId ? (
        <>
          {/* Property Selector for detailed view */}
          <PropertySelector 
            currentDealId={currentDealId}
            onDealSelect={selectDeal}
            currentStage="Analysis"
          />

          {currentDeal ? (
            <PropertyAnalysisDetail 
              deal={currentDeal}
              onUpdateDeal={handleUpdateDeal}
            />
          ) : (
            <Card className="bg-white shadow-lg rounded-2xl border-0">
              <CardContent className="p-12 text-center">
                <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-lg font-semibold text-navy-dark mb-2">Property Not Found</h3>
                <p className="text-navy mb-6">The requested property could not be found in the analysis stage.</p>
                <Button onClick={() => window.location.href = '/analysis'} className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl">
                  Back to Analysis Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        // Show analysis dashboard
        <AnalysisDashboard />
      )}
    </div>
  );
};

export default PropertyAnalysis;

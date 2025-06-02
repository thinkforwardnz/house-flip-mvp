
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PropertySelector from '@/components/PropertySelector';
import { useSelectedDeal } from '@/hooks/useSelectedDeal';
import AnalysisForm from '@/components/AnalysisForm';
import AnalysisOverviewCards from '@/components/AnalysisOverviewCards';
import FinancialAnalysisCard from '@/components/FinancialAnalysisCard';
import PropertyNotesCard from '@/components/PropertyNotesCard';
import { MapPin } from 'lucide-react';

const PropertyAnalysis = () => {
  const { selectedDeal, selectedDealId, selectDeal, isLoading } = useSelectedDeal('Analysis');

  // Analysis form state
  const [analysisData, setAnalysisData] = useState({
    offerPrice: selectedDeal?.purchase_price || 0,
    renoEstimate: 50000,
    timeline: 6,
    holdingCosts: 2500,
    sellingCosts: 25000,
    addBedroom: false,
    bedroomCost: 15000,
    notes: ''
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Update analysis data when selected deal changes
  React.useEffect(() => {
    if (selectedDeal) {
      setAnalysisData(prev => ({
        ...prev,
        offerPrice: selectedDeal.purchase_price || 0
      }));
    }
  }, [selectedDeal]);

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

  if (!selectedDeal) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <PropertySelector 
          currentDealId={selectedDealId}
          onDealSelect={selectDeal}
          currentStage="Analysis"
        />
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-12 text-center">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-lg font-semibold text-navy-dark mb-2">No Properties in Analysis</h3>
            <p className="text-navy mb-6">There are no properties currently in the analysis stage.</p>
            <Button onClick={() => window.location.href = '/find'} className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl">
              Find Properties
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Property Selector */}
      <PropertySelector 
        currentDealId={selectedDealId}
        onDealSelect={selectDeal}
        currentStage="Analysis"
      />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Property Analysis</h1>
        <p className="text-blue-100 text-lg">AI-powered analysis and financial modeling</p>
      </div>

      {/* Analysis Overview Cards */}
      <AnalysisOverviewCards 
        selectedDeal={selectedDeal}
        formatCurrency={formatCurrency}
        getRiskColor={getRiskColor}
      />

      {/* Financial Analysis */}
      <FinancialAnalysisCard 
        selectedDeal={selectedDeal}
        formatCurrency={formatCurrency}
      />

      {/* Property Notes */}
      <PropertyNotesCard selectedDeal={selectedDeal} />

      {/* Analysis Form */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <AnalysisForm 
            data={analysisData}
            onChange={setAnalysisData}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyAnalysis;

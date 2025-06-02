
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PropertySelector from '@/components/PropertySelector';
import { useSelectedDeal } from '@/hooks/useSelectedDeal';
import AnalysisForm from '@/components/AnalysisForm';
import { Calculator, TrendingUp, AlertTriangle, MapPin } from 'lucide-react';

const PropertyAnalysis = () => {
  const { selectedDeal, selectedDealId, selectDeal, isLoading } = useSelectedDeal('Analysis');

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

  const estimatedRenovationCost = selectedDeal.target_sale_price && selectedDeal.purchase_price 
    ? Math.max(0, (selectedDeal.target_sale_price - selectedDeal.purchase_price) * 0.15) 
    : 50000;

  const estimatedProfit = selectedDeal.target_sale_price && selectedDeal.purchase_price
    ? selectedDeal.target_sale_price - selectedDeal.purchase_price - estimatedRenovationCost
    : 0;

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Calculator className="h-6 w-6 text-blue-primary" />
              </div>
              <div>
                <p className="text-sm text-navy font-medium">Purchase Price</p>
                <p className="text-2xl font-bold text-navy-dark">
                  {selectedDeal.purchase_price ? formatCurrency(selectedDeal.purchase_price) : 'TBD'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-success" />
              </div>
              <div>
                <p className="text-sm text-navy font-medium">Target Sale Price</p>
                <p className="text-2xl font-bold text-navy-dark">
                  {selectedDeal.target_sale_price ? formatCurrency(selectedDeal.target_sale_price) : 'TBD'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getRiskColor(selectedDeal.current_risk)}`}>
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-navy font-medium">Risk Level</p>
                <Badge className={`${getRiskColor(selectedDeal.current_risk)} border-0 text-sm font-semibold`}>
                  {selectedDeal.current_risk?.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Analysis */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardHeader className="p-6">
          <CardTitle className="text-navy-dark">Financial Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-navy font-medium mb-1">Est. Renovation Cost</p>
              <p className="text-xl font-bold text-navy-dark">{formatCurrency(estimatedRenovationCost)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-navy font-medium mb-1">Est. Total Investment</p>
              <p className="text-xl font-bold text-navy-dark">
                {selectedDeal.purchase_price ? formatCurrency(selectedDeal.purchase_price + estimatedRenovationCost) : 'TBD'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-navy font-medium mb-1">Est. Profit</p>
              <p className={`text-xl font-bold ${estimatedProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(estimatedProfit)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-navy font-medium mb-1">ROI</p>
              <p className="text-xl font-bold text-navy-dark">
                {selectedDeal.purchase_price && estimatedProfit > 0 
                  ? `${((estimatedProfit / (selectedDeal.purchase_price + estimatedRenovationCost)) * 100).toFixed(1)}%`
                  : 'TBD'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Notes */}
      {selectedDeal.notes && (
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardHeader className="p-6">
            <CardTitle className="text-navy-dark">Analysis Notes</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="text-navy">{selectedDeal.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Analysis Form */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <AnalysisForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyAnalysis;

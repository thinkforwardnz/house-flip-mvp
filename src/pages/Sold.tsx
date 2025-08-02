import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import PropertySelector from '@/components/PropertySelector';
import { useSelectedDeal } from '@/hooks/useSelectedDeal';
import FinancialSummary from '@/components/FinancialSummary';
import SettlementChecklist from '@/components/SettlementChecklist';
import LessonsLearned from '@/components/LessonsLearned';
import FinalDocuments from '@/components/FinalDocuments';
import { Trophy, MapPin } from 'lucide-react';
const Sold = () => {
  const navigate = useNavigate();
  const {
    selectedDeal,
    selectedDealId,
    selectDeal,
    isLoading
  } = useSelectedDeal('Sold');
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0
    }).format(amount);
  };
  const handleExportReport = () => {
    console.log('Exporting deal report for:', selectedDeal?.address);
  };
  const handleArchiveDeal = () => {
    console.log('Archiving deal:', selectedDeal?.address);
    navigate('/');
  };
  if (isLoading) {
    return <div className="max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>;
  }
  if (!selectedDeal) {
    return <div className="max-w-7xl mx-auto space-y-6">
        <PropertySelector currentDealId={selectedDealId} onDealSelect={selectDeal} currentStage="Sold" />
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-12 text-center">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-lg font-semibold text-navy-dark mb-2">No Completed Deals</h3>
            <p className="text-navy mb-6">You haven't completed any property deals yet.</p>
            <Button onClick={() => window.location.href = '/find'} className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl">
              Find Properties
            </Button>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="max-w-7xl mx-auto space-y-6">
      {/* Property Selector */}
      <PropertySelector currentDealId={selectedDealId} onDealSelect={selectDeal} currentStage="Sold" />

      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-slate-800">Deal Completed</h1>
          <p className="text-lg text-slate-700">{selectedDeal.address}, {selectedDeal.suburb}, {selectedDeal.city}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportReport} className="rounded-xl bg-white border-white text-navy-dark hover:bg-gray-50">
            Export Report
          </Button>
          <Button className="bg-orange-accent hover:bg-orange-600 text-white rounded-xl" onClick={handleArchiveDeal}>
            Archive Deal
          </Button>
        </div>
      </div>

      {/* Deal Summary */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-orange-accent" />
            <h2 className="text-lg font-semibold text-navy-dark">Deal Summary</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-navy font-medium mb-1">Purchase Price</p>
              <p className="text-xl font-bold text-navy-dark">
                {selectedDeal.purchase_price ? formatCurrency(selectedDeal.purchase_price) : 'N/A'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-navy font-medium mb-1">Sale Price</p>
              <p className="text-xl font-bold text-navy-dark">
                {selectedDeal.target_sale_price ? formatCurrency(selectedDeal.target_sale_price) : 'N/A'}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <p className="text-sm text-green-700 font-medium mb-1">Total Profit</p>
              <p className="text-xl font-bold text-green-800">
                {selectedDeal.current_profit ? formatCurrency(selectedDeal.current_profit) : formatCurrency(0)}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-sm text-blue-700 font-medium mb-1">ROI</p>
              <p className="text-xl font-bold text-blue-800">
                {selectedDeal.purchase_price && selectedDeal.current_profit ? `${(selectedDeal.current_profit / selectedDeal.purchase_price * 100).toFixed(1)}%` : 'N/A'}
              </p>
            </div>
          </div>
          {selectedDeal.notes && <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="font-medium text-navy-dark mb-2">Final Notes</h4>
              <p className="text-navy">{selectedDeal.notes}</p>
            </div>}
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <FinancialSummary />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settlement Checklist */}
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <SettlementChecklist />
          </CardContent>
        </Card>

        {/* Lessons Learned */}
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <LessonsLearned />
          </CardContent>
        </Card>
      </div>

      {/* Final Documents */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <FinalDocuments />
        </CardContent>
      </Card>
    </div>;
};
export default Sold;
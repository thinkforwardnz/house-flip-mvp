import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PropertySelector from '@/components/PropertySelector';
import { useSelectedDeal } from '@/hooks/useSelectedDeal';
import OfferBuilder from '@/components/OfferBuilder';
import OfferLog from '@/components/OfferLog';
import NegotiationNotes from '@/components/NegotiationNotes';
import OfferReminders from '@/components/OfferReminders';
import { MapPin, Handshake } from 'lucide-react';
const OfferStage = () => {
  const {
    selectedDeal,
    selectedDealId,
    selectDeal,
    isLoading
  } = useSelectedDeal('Offer');
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0
    }).format(amount);
  };
  if (isLoading) {
    return <div className="w-[1280px] mx-auto space-y-6">
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
    return <div className="w-[1280px] mx-auto space-y-6">
        <PropertySelector currentDealId={selectedDealId} onDealSelect={selectDeal} currentStage="Offer" />
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-12 text-center">
            <Handshake className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-lg font-semibold text-navy-dark mb-2">No Properties in Offer Stage</h3>
            <p className="text-navy mb-6">There are no properties currently in the offer stage.</p>
            <Button onClick={() => window.location.href = '/analysis'} className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl">
              Go to Analysis
            </Button>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="w-[1280px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-700 mb-2">Offer Stage</h1>
        <p className="text-lg text-slate-700">Build offers and manage negotiations for properties</p>
      </div>

      {/* Property Selector */}
      <PropertySelector currentDealId={selectedDealId} onDealSelect={selectDeal} currentStage="Offer" />

      {/* Property Overview */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardHeader className="p-6">
          <CardTitle className="text-navy-dark flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Property Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-navy font-medium mb-1">Target Purchase Price</p>
              <p className="text-xl font-bold text-navy-dark">
                {selectedDeal?.purchase_price ? formatCurrency(selectedDeal.purchase_price) : 'TBD'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-navy font-medium mb-1">Target Sale Price</p>
              <p className="text-xl font-bold text-navy-dark">
                {selectedDeal?.target_sale_price ? formatCurrency(selectedDeal.target_sale_price) : 'TBD'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-navy font-medium mb-1">Risk Level</p>
              <p className={`text-xl font-bold ${selectedDeal?.current_risk === 'low' ? 'text-green-600' : selectedDeal?.current_risk === 'medium' ? 'text-yellow-600' : 'text-red-600'}`}>
                {selectedDeal?.current_risk?.toUpperCase()}
              </p>
            </div>
          </div>
          {selectedDeal?.notes && <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="font-medium text-navy-dark mb-2">Property Notes</h4>
              <p className="text-navy">{selectedDeal.notes}</p>
            </div>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offer Builder */}
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <OfferBuilder />
          </CardContent>
        </Card>

        {/* Offer Reminders */}
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <OfferReminders />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offer Log */}
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <OfferLog />
          </CardContent>
        </Card>

        {/* Negotiation Notes */}
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <NegotiationNotes />
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default OfferStage;
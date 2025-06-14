
import React from 'react';
import { useDeals } from '@/hooks/useDeals';
import { Card, CardContent } from '@/components/ui/card';
import PropertySelectorMobile from './PropertySelector/PropertySelectorMobile';
import PropertySelectorDesktop from './PropertySelector/PropertySelectorDesktop';
import PropertyInfoSection from './PropertySelector/PropertyInfoSection';

interface PropertySelectorProps {
  currentDealId?: string;
  onDealSelect: (dealId: string) => void;
  currentStage?: string;
}

const PropertySelector = ({
  currentDealId,
  onDealSelect,
  currentStage
}: PropertySelectorProps) => {
  const { deals, isLoading } = useDeals();
  
  const currentDeal = deals.find(deal => deal.id === currentDealId);
  const stageDeals = currentStage ? deals.filter(deal => deal.pipeline_stage === currentStage) : deals;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Analysis':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Offer':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Under Contract':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Reno':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Listed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Sold':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  if (isLoading) {
    return (
      <Card className="bg-white shadow-lg rounded-2xl border-0 mb-4 w-full">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-white shadow-lg rounded-2xl border-0 mb-4 w-full">
      <CardContent className="p-4">
        <PropertySelectorMobile 
          currentDeal={currentDeal}
          getStageColor={getStageColor}
        />

        <PropertySelectorDesktop
          currentDeal={currentDeal}
          stageDeals={stageDeals}
          currentDealId={currentDealId}
          onDealSelect={onDealSelect}
          getStageColor={getStageColor}
          formatCurrency={formatCurrency}
        />

        <PropertyInfoSection
          currentDeal={currentDeal}
          formatCurrency={formatCurrency}
        />
      </CardContent>
    </Card>
  );
};

export default PropertySelector;

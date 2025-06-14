import React from 'react';
import { useDeals } from '@/hooks/useDeals';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, Home, ArrowLeft, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
  const navigate = useNavigate();
  
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
      <Card className="bg-white shadow-lg rounded-2xl border-0 mb-3 xs:mb-4">
        <CardContent className="p-2 xs:p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-white shadow-lg rounded-2xl border-0 mb-3 xs:mb-4 w-full">
      <CardContent className="p-2 xs:p-4">
        {/* --- MOBILE LAYOUT --- */}
        <div className="block sm:hidden relative">
          {/* Status badge at top right */}
          {currentDeal && (
            <span
              className={`absolute right-0 top-0 m-2 z-10 ${getStageColor(currentDeal.pipeline_stage)} rounded-lg text-xs px-2 py-1 font-semibold`}
            >
              {currentDeal.pipeline_stage}
            </span>
          )}
          {/* Address/Title */}
          <div className="mb-2 mt-6 pr-8">
            <h2 className="text-lg font-bold text-navy-dark break-words">{currentDeal?.address || "No property selected"}</h2>
            {currentDeal && (
              <div className="text-sm text-navy">
                {currentDeal.suburb}, {currentDeal.city}
              </div>
            )}
          </div>
          {/* View Analysis Button - if in detail page */}
          {currentDeal && (
            <Button
              className="w-full mb-2 rounded-xl flex items-center justify-center font-semibold"
              variant="outline"
              onClick={() => navigate(`/analysis?dealId=${currentDeal.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Analysis
            </Button>
          )}
        </div>

        {/* --- DESKTOP/TABLET LAYOUT (unchanged) --- */}
        <div className="hidden sm:flex flex-col gap-2 xs:gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 xs:gap-2 sm:flex-row sm:items-center sm:gap-4 w-full">
            <Button variant="outline" size="sm" onClick={() => navigate('/')} className="rounded-xl w-full sm:w-auto mb-1 sm:mb-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            
            <div className="flex items-center gap-2 xs:gap-3 w-full min-w-0">
              <Home className="h-5 w-5 text-blue-primary flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-2xs xs:text-xs sm:text-sm text-navy font-medium truncate">Current Property</p>
                {currentDeal ? (
                  <div className="flex items-center gap-1 xs:gap-2 flex-wrap min-w-0">
                    <h2 className="text-xs xs:text-base sm:text-lg font-semibold text-navy-dark truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">{currentDeal.address}</h2>
                    <Badge className={`${getStageColor(currentDeal.pipeline_stage)} rounded-lg text-xs`}>
                      {currentDeal.pipeline_stage}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-navy-dark text-xs sm:text-sm">No property selected</p>
                )}
              </div>
            </div>
          </div>
          {stageDeals.length > 1 && (
            <div className="flex justify-end sm:justify-start mt-1 sm:mt-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-xl w-full sm:w-auto">
                    Switch Property
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 xs:w-72 sm:w-80 z-50 bg-white">
                  {stageDeals.map(deal => (
                    <DropdownMenuItem 
                      key={deal.id} 
                      onClick={() => onDealSelect(deal.id)} 
                      className={`p-2 xs:p-3 sm:p-4 cursor-pointer rounded-lg ${deal.id === currentDealId ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex flex-col gap-0.5 w-full">
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{deal.address}</span>
                          <Badge className={`${getStageColor(deal.pipeline_stage)} text-xs`}>
                            {deal.pipeline_stage}
                          </Badge>
                        </div>
                        <div className="text-2xs xs:text-xs text-gray-600 truncate">
                          {deal.suburb}, {deal.city}
                        </div>
                        {deal.purchase_price && (
                          <div className="text-2xs xs:text-xs text-gray-500">
                            Purchase: {formatCurrency(deal.purchase_price)}
                          </div>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* --- Info Section --- */}
        {currentDeal && (
          <div className="mt-2 xs:mt-3 pt-2 xs:pt-3 border-t border-gray-100">
            <div className="grid grid-cols-1 gap-2 xs:gap-3 md:grid-cols-4 md:gap-4 text-2xs xs:text-xs sm:text-sm">
              <div>
                <span className="text-navy font-medium">Location:</span>
                <p className="text-navy-dark">{currentDeal.suburb}, {currentDeal.city}</p>
              </div>
              {currentDeal.purchase_price && (
                <div>
                  <span className="text-navy font-medium">Purchase Price:</span>
                  <p className="text-navy-dark">{formatCurrency(currentDeal.purchase_price)}</p>
                </div>
              )}
              {currentDeal.target_sale_price && (
                <div>
                  <span className="text-navy font-medium">Target Sale:</span>
                  <p className="text-navy-dark">{formatCurrency(currentDeal.target_sale_price)}</p>
                </div>
              )}
              {currentDeal.current_profit && (
                <div>
                  <span className="text-navy font-medium">Target Profit:</span>
                  <p className="text-navy-dark">{formatCurrency(currentDeal.current_profit)}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertySelector;

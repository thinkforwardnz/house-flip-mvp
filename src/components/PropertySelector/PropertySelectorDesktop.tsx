
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Deal } from '@/types/analysis';

interface PropertySelectorDesktopProps {
  currentDeal: Deal | undefined;
  stageDeals: Deal[];
  currentDealId?: string;
  onDealSelect: (dealId: string) => void;
  getStageColor: (stage: string) => string;
  formatCurrency: (amount: number) => string;
}

const PropertySelectorDesktop = ({
  currentDeal,
  stageDeals,
  currentDealId,
  onDealSelect,
  getStageColor,
  formatCurrency
}: PropertySelectorDesktopProps) => {
  const navigate = useNavigate();

  return (
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
  );
};

export default PropertySelectorDesktop;

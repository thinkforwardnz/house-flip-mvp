
import React from 'react';
import { useDeals } from '@/hooks/useDeals';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PropertySelectorProps {
  currentDealId?: string;
  onDealSelect: (dealId: string) => void;
  currentStage?: string;
}

const PropertySelector = ({ currentDealId, onDealSelect, currentStage }: PropertySelectorProps) => {
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
      case 'Analysis': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Offer': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Under Contract': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Reno': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Listed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Sold': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-lg rounded-2xl border-0 mb-6">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg rounded-2xl border-0 mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            
            <div className="flex items-center gap-3">
              <Home className="h-5 w-5 text-blue-primary" />
              <div>
                <p className="text-sm text-navy font-medium">Current Property</p>
                {currentDeal ? (
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-navy-dark">{currentDeal.address}</h2>
                    <Badge className={`${getStageColor(currentDeal.pipeline_stage)} rounded-lg text-xs`}>
                      {currentDeal.pipeline_stage}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-navy-dark">No property selected</p>
                )}
              </div>
            </div>
          </div>

          {stageDeals.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl">
                  Switch Property
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80">
                {stageDeals.map((deal) => (
                  <DropdownMenuItem
                    key={deal.id}
                    onClick={() => onDealSelect(deal.id)}
                    className={`p-4 cursor-pointer ${deal.id === currentDealId ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{deal.address}</span>
                        <Badge className={`${getStageColor(deal.pipeline_stage)} text-xs`}>
                          {deal.pipeline_stage}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {deal.suburb}, {deal.city}
                      </div>
                      {deal.purchase_price && (
                        <div className="text-sm text-gray-500">
                          Purchase: {formatCurrency(deal.purchase_price)}
                        </div>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {currentDeal && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
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
                  <span className="text-navy font-medium">Current Profit:</span>
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

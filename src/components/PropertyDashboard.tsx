import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useDeals } from '@/hooks/useDeals';
import CreateDealDialog from '@/components/CreateDealDialog';
import PropertyEditModal from '@/components/PropertyEditModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Home, TrendingUp, DollarSign, AlertTriangle, ChevronRight } from 'lucide-react';
import type { Deal } from '@/types/analysis';
const PropertyDashboard = () => {
  const {
    deals: dealProperties,
    isLoading: dealsLoading,
    updateDeal,
    isUpdating
  } = useDeals();
  const navigate = useNavigate();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const getStageRoute = (stage: string) => {
    switch (stage) {
      case 'Sold':
        return '/sold';
      case 'Listed':
        return '/listed';
      case 'Reno':
        return '/renovation';
      case 'Under Contract':
        return '/under-contract';
      case 'Offer':
        return '/offer';
      case 'Analysis':
        return '/analysis';
      default:
        return '/analysis';
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0
    }).format(amount);
  };
  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDeal(null);
  };

  const handleSaveDeal = (dealId: string, updates: Partial<Deal>) => {
    updateDeal({ id: dealId, ...updates });
    setIsModalOpen(false);
    setSelectedDeal(null);
  };

  // Calculate totals from deals
  const totalValue = dealProperties.reduce((sum, deal) => sum + (deal.purchase_price || 0), 0);
  const totalProfit = dealProperties.reduce((sum, deal) => sum + (deal.current_profit || 0), 0);
  const highRiskCount = dealProperties.filter(deal => deal.current_risk === 'high').length;
  return <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-900">
          Welcome back!
        </h1>
        <p className="text-lg text-slate-700">
          Here's an overview of your property portfolio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Home className="h-6 w-6 text-blue-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm text-navy font-medium">Total Deals</p>
                <p className="text-2xl font-bold text-navy-dark">{dealProperties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-success" />
              </div>
              <div className="text-center">
                <p className="text-sm text-navy font-medium">Total Value</p>
                <p className="text-2xl font-bold text-navy-dark">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-accent" />
              </div>
              <div className="text-center">
                <p className="text-sm text-navy font-medium">Total Profit</p>
                <p className="text-2xl font-bold text-navy-dark">{formatCurrency(totalProfit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-error" />
              </div>
              <div className="text-center">
                <p className="text-sm text-navy font-medium">High Risk Deals</p>
                <p className="text-2xl font-bold text-navy-dark">{highRiskCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardHeader className="p-6">
          <CardTitle className="flex items-center justify-between text-navy-dark">
            <span>Your Property Deals</span>
            <CreateDealDialog />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {dealsLoading ? <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="flex items-center justify-between p-6 border border-gray-100 rounded-2xl">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>)}
            </div> : dealProperties.length === 0 ? <div className="text-center py-12">
              <Home className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-lg font-semibold text-navy-dark mb-2">No deals yet</h3>
              <p className="text-navy mb-6">Create your first property deal to get started!</p>
              <CreateDealDialog />
            </div> : <div className="space-y-4">
              {dealProperties.map(deal => <div key={deal.id} className="flex items-center gap-4 p-6 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => handleDealClick(deal)}>
                  {/* Primary Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {deal.photos && deal.photos.length > 0 ? (
                      <img 
                        src={deal.photos[0]} 
                        alt={deal.address}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-navy-dark">{deal.address}</h3>
                      <Badge className={`${getStageColor(deal.pipeline_stage)} rounded-lg`}>
                        {deal.pipeline_stage}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-navy">
                      <span>{deal.suburb}, {deal.city}</span>
                      {deal.purchase_price && <span>Price: {formatCurrency(deal.purchase_price)}</span>}
                      {deal.current_profit && deal.current_profit > 0 && <span className="text-green-600 font-medium">
                          Est. Profit: {formatCurrency(deal.current_profit)}
                        </span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-navy">
                        Created {new Date(deal.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-primary transition-colors" />
                  </div>
                </div>)}
            </div>}
        </CardContent>
      </Card>

      <PropertyEditModal
        deal={selectedDeal}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSaveDeal}
        isUpdating={isUpdating}
      />
    </div>;
};
export default PropertyDashboard;
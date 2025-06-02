
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useDeals } from '@/hooks/useDeals';
import CreateDealDialog from '@/components/CreateDealDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Home, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle
} from 'lucide-react';

const PropertyDashboard = () => {
  const { deals, isLoading: dealsLoading } = useDeals();

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalValue = deals.reduce((sum, deal) => sum + (deal.target_sale_price || 0), 0);
  const totalProfit = deals.reduce((sum, deal) => sum + (deal.current_profit || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back!
        </h1>
        <p className="text-blue-100 text-lg">
          Here's an overview of your property portfolio
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Home className="h-6 w-6 text-blue-primary" />
              </div>
              <div>
                <p className="text-sm text-navy font-medium">Total Deals</p>
                <p className="text-2xl font-bold text-navy-dark">{deals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-success" />
              </div>
              <div>
                <p className="text-sm text-navy font-medium">Total Value</p>
                <p className="text-2xl font-bold text-navy-dark">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-accent" />
              </div>
              <div>
                <p className="text-sm text-navy font-medium">Total Profit</p>
                <p className="text-2xl font-bold text-navy-dark">{formatCurrency(totalProfit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-error" />
              </div>
              <div>
                <p className="text-sm text-navy font-medium">High Risk</p>
                <p className="text-2xl font-bold text-navy-dark">
                  {deals.filter(deal => deal.current_risk === 'high').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deals List */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardHeader className="p-6">
          <CardTitle className="flex items-center justify-between text-navy-dark">
            <span>Your Property Deals</span>
            <CreateDealDialog />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {dealsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-6 border border-gray-100 rounded-2xl">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-lg font-semibold text-navy-dark mb-2">No deals yet</h3>
              <p className="text-navy mb-6">Create your first property deal to get started!</p>
              <CreateDealDialog />
            </div>
          ) : (
            <div className="space-y-4">
              {deals.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between p-6 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-navy-dark">{deal.address}</h3>
                      <Badge className={`${getStageColor(deal.pipeline_stage)} rounded-lg`}>
                        {deal.pipeline_stage}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-navy">
                      <span>{deal.suburb}, {deal.city}</span>
                      {deal.purchase_price && (
                        <span>Purchase: {formatCurrency(deal.purchase_price)}</span>
                      )}
                      {deal.target_sale_price && (
                        <span>Target: {formatCurrency(deal.target_sale_price)}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-navy">
                      Created {new Date(deal.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyDashboard;

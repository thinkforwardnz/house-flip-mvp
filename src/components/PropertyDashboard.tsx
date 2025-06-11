
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useDealProperties } from '@/hooks/useUnifiedProperties';
import CreateDealDialog from '@/components/CreateDealDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

const PropertyDashboard = () => {
  const { properties: dealProperties, isLoading: dealsLoading } = useDealProperties();
  const navigate = useNavigate();

  const getStageColor = (tags: string[]) => {
    if (tags.includes('analysis')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (tags.includes('offer')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (tags.includes('under_contract')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (tags.includes('renovation')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (tags.includes('listed')) return 'bg-green-100 text-green-800 border-green-200';
    if (tags.includes('sold')) return 'bg-gray-100 text-gray-800 border-gray-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStageLabel = (tags: string[]) => {
    if (tags.includes('sold')) return 'Sold';
    if (tags.includes('listed')) return 'Listed';
    if (tags.includes('renovation')) return 'Reno';
    if (tags.includes('under_contract')) return 'Under Contract';
    if (tags.includes('offer')) return 'Offer';
    if (tags.includes('analysis')) return 'Analysis';
    return 'Unknown';
  };

  const getStageRoute = (tags: string[]) => {
    if (tags.includes('sold')) return '/sold';
    if (tags.includes('listed')) return '/listed';
    if (tags.includes('renovation')) return '/renovation';
    if (tags.includes('under_contract')) return '/under-contract';
    if (tags.includes('offer')) return '/offer';
    if (tags.includes('analysis')) return '/analysis';
    return '/analysis';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleDealClick = (property: any) => {
    const route = getStageRoute(property.tags);
    navigate(`${route}?dealId=${property.deal_id || property.id}`);
  };

  // Calculate totals from unified properties with deal tags
  const totalValue = dealProperties.reduce((sum, property) => sum + (property.current_price || 0), 0);
  const totalProfit = dealProperties.reduce((sum, property) => sum + (property.ai_est_profit || 0), 0);
  const highRiskCount = dealProperties.filter(property => 
    property.ai_confidence && property.ai_confidence < 50
  ).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back!
        </h1>
        <p className="text-blue-100 text-lg">
          Here's an overview of your property portfolio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Home className="h-6 w-6 text-blue-primary" />
              </div>
              <div>
                <p className="text-sm text-navy font-medium">Total Deals</p>
                <p className="text-2xl font-bold text-navy-dark">{dealProperties.length}</p>
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
                <p className="text-sm text-navy font-medium">Low Confidence</p>
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
          ) : dealProperties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-lg font-semibold text-navy-dark mb-2">No deals yet</h3>
              <p className="text-navy mb-6">Create your first property deal to get started!</p>
              <CreateDealDialog />
            </div>
          ) : (
            <div className="space-y-4">
              {dealProperties.map((property) => (
                <div 
                  key={property.id} 
                  className="flex items-center justify-between p-6 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => handleDealClick(property)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-navy-dark">{property.address}</h3>
                      <Badge className={`${getStageColor(property.tags)} rounded-lg`}>
                        {getStageLabel(property.tags)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-navy">
                      <span>{property.suburb}, {property.city}</span>
                      {property.current_price && (
                        <span>Price: {formatCurrency(property.current_price)}</span>
                      )}
                      {property.ai_est_profit && property.ai_est_profit > 0 && (
                        <span className="text-green-600 font-medium">
                          Est. Profit: {formatCurrency(property.ai_est_profit)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-navy">
                        Created {new Date(property.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-primary transition-colors" />
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

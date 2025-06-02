
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useDeals } from '@/hooks/useDeals';
import AuthForm from '@/components/AuthForm';
import CreateDealDialog from '@/components/CreateDealDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Home, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Settings,
  LogOut,
  Search,
  FileText,
  Handshake,
  ClipboardCheck,
  Hammer,
  Building,
  Trophy
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const PropertyDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { deals, isLoading: dealsLoading } = useDeals();
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/find', label: 'Find Properties', icon: Search },
    { path: '/analysis', label: 'Analysis', icon: FileText },
    { path: '/offer', label: 'Offer', icon: Handshake },
    { path: '/under-contract', label: 'Under Contract', icon: ClipboardCheck },
    { path: '/renovation', label: 'Renovation', icon: Hammer },
    { path: '/listed', label: 'Listed', icon: Building },
    { path: '/sold', label: 'Sold', icon: Trophy },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B5E20] mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

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
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Home className="h-6 w-6 text-[#1B5E20]" />
              <h1 className="text-xl font-bold text-gray-900">NZ House Flipping</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <CreateDealDialog />
            <Link to="/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-[#1B5E20] text-[#1B5E20]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-600">
            Here's an overview of your property portfolio
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Home className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Deals</p>
                  <p className="text-2xl font-bold text-gray-900">{deals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF9800]/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-[#FF9800]" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Profit</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalProfit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">High Risk</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {deals.filter(deal => deal.current_risk === 'high').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deals List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Property Deals</span>
              <CreateDealDialog />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dealsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : deals.length === 0 ? (
              <div className="text-center py-8">
                <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No deals yet. Create your first property deal to get started!</p>
                <CreateDealDialog />
              </div>
            ) : (
              <div className="space-y-4">
                {deals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{deal.address}</h3>
                        <Badge className={getStageColor(deal.pipeline_stage)}>
                          {deal.pipeline_stage}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
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
                      <div className="text-sm text-gray-500">
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
    </div>
  );
};

export default PropertyDashboard;

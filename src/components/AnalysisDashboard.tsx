import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useDeals } from '@/hooks/useDeals';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  Calculator, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Eye
} from 'lucide-react';

const AnalysisDashboard = () => {
  const { deals, isLoading } = useDeals();
  const navigate = useNavigate();

  const analysisDeals = deals.filter(deal => deal.pipeline_stage === 'Analysis');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getAnalysisProgress = (deal: any) => {
    // Mock progress calculation based on available data
    let progress = 0;
    if (deal.address) progress += 20; // Data collection
    if (deal.purchase_price) progress += 20; // Initial pricing
    if (deal.target_sale_price) progress += 20; // ARV estimation
    if (deal.notes) progress += 20; // Analysis notes
    if (deal.current_profit > 0) progress += 20; // Profit calculation
    return progress;
  };

  const getProgressStatus = (progress: number) => {
    if (progress === 100) return { label: 'Complete', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (progress >= 80) return { label: 'Nearly Complete', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (progress >= 40) return { label: 'In Progress', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { label: 'Starting', color: 'text-gray-600', bgColor: 'bg-gray-100' };
  };

  const totalARV = analysisDeals.reduce((sum, deal) => sum + (deal.target_sale_price || 0), 0);
  const totalProfit = analysisDeals.reduce((sum, deal) => sum + (deal.current_profit || 0), 0);
  const avgProgress = analysisDeals.length > 0 
    ? analysisDeals.reduce((sum, deal) => sum + getAnalysisProgress(deal), 0) / analysisDeals.length 
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Home className="h-6 w-6 text-blue-primary" />
              </div>
              <div>
                <p className="text-sm text-navy font-medium">Properties Analysing</p>
                <p className="text-2xl font-bold text-navy-dark">{analysisDeals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-success" />
              </div>
              <div>
                <p className="text-sm text-navy font-medium">Total Est. ARV</p>
                <p className="text-2xl font-bold text-navy-dark">{formatCurrency(totalARV)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <Calculator className="h-6 w-6 text-orange-accent" />
              </div>
              <div>
                <p className="text-sm text-navy font-medium">Total Est. Profit</p>
                <p className="text-2xl font-bold text-navy-dark">{formatCurrency(totalProfit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-navy font-medium">Avg. Progress</p>
                <p className="text-2xl font-bold text-navy-dark">{Math.round(avgProgress)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Properties List */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardHeader className="p-6">
          <CardTitle className="text-navy-dark">Properties in Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {analysisDeals.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-lg font-semibold text-navy-dark mb-2">No Properties in Analysis</h3>
              <p className="text-navy mb-6">Import properties from the Find stage to start analysis.</p>
              <Button onClick={() => navigate('/find')} className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl">
                Find Properties
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {analysisDeals.map((deal) => {
                const progress = getAnalysisProgress(deal);
                const status = getProgressStatus(progress);
                
                return (
                  <div 
                    key={deal.id} 
                    className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/analysis/${deal.id}`)}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-y-4 mb-4">
                      <div className="w-full sm:w-auto sm:flex-grow">
                        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-start sm:gap-3">
                          <h3 className="font-semibold text-navy-dark text-lg">{deal.address}</h3>
                          <div className="flex justify-end sm:justify-start">
                            <Badge className={`${status.bgColor} ${status.color} text-xs font-semibold rounded-lg`}>
                              {status.label}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-navy mt-1 sm:mt-2">{deal.suburb}, {deal.city}</p>
                      </div>
                      
                      <div className="w-full sm:w-auto">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/analysis/${deal.id}`);
                          }}
                          variant="outline" 
                          size="sm"
                          className="rounded-xl w-full sm:w-auto"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Analysis
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <p className="text-xs text-navy font-medium mb-1">Purchase Price</p>
                        <p className="text-sm font-bold text-navy-dark">
                          {deal.purchase_price ? formatCurrency(deal.purchase_price) : 'TBD'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <p className="text-xs text-navy font-medium mb-1">Target ARV</p>
                        <p className="text-sm font-bold text-navy-dark">
                          {deal.target_sale_price ? formatCurrency(deal.target_sale_price) : 'TBD'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <p className="text-xs text-navy font-medium mb-1">Est. Profit</p>
                        <p className={`text-sm font-bold ${deal.current_profit > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                          {deal.current_profit > 0 ? formatCurrency(deal.current_profit) : 'TBD'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <p className="text-xs text-navy font-medium mb-1">Risk Level</p>
                        <Badge className={`text-xs ${
                          deal.current_risk === 'low' ? 'bg-green-100 text-green-800' :
                          deal.current_risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {deal.current_risk}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-navy">Analysis Progress</span>
                        <span className="font-medium text-navy-dark">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisDashboard;

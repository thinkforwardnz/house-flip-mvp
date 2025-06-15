
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeals } from '@/hooks/useDeals';
import type { Deal } from '@/types/analysis';
import AnalysisStats from './analysis/AnalysisStats';
import EmptyAnalysisState from './analysis/EmptyAnalysisState';
import AnalysisPropertyCard from './analysis/AnalysisPropertyCard';
import AnalysisDashboardSkeleton from './analysis/AnalysisDashboardSkeleton';

const AnalysisDashboard = () => {
  const { deals, isLoading } = useDeals();

  const analysisDeals = deals.filter(deal => deal.pipeline_stage === 'Analysis');

  const getAnalysisProgress = (deal: Deal) => {
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

  if (isLoading) {
    return <AnalysisDashboardSkeleton />;
  }

  const totalARV = analysisDeals.reduce((sum, deal) => sum + (deal.target_sale_price || 0), 0);
  const totalProfit = analysisDeals.reduce((sum, deal) => sum + (deal.current_profit || 0), 0);
  const avgProgress = analysisDeals.length > 0
    ? analysisDeals.reduce((sum, deal) => sum + getAnalysisProgress(deal), 0) / analysisDeals.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <AnalysisStats
        dealCount={analysisDeals.length}
        totalARV={totalARV}
        totalProfit={totalProfit}
        avgProgress={avgProgress}
      />

      {/* Properties List */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardHeader className="p-6">
          <CardTitle className="text-navy-dark">Properties in Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {analysisDeals.length === 0 ? (
            <EmptyAnalysisState />
          ) : (
            <div className="space-y-4">
              {analysisDeals.map((deal) => {
                const progress = getAnalysisProgress(deal);
                const status = getProgressStatus(progress);
                
                return (
                  <AnalysisPropertyCard
                    key={deal.id}
                    deal={deal}
                    progress={progress}
                    status={status}
                  />
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

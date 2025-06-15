
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Home, TrendingUp, Calculator, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';

interface AnalysisStatsProps {
  dealCount: number;
  totalARV: number;
  totalProfit: number;
  avgProgress: number;
}

const AnalysisStats = ({ dealCount, totalARV, totalProfit, avgProgress }: AnalysisStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Home className="h-6 w-6 text-blue-primary" />
            </div>
            <div>
              <p className="text-sm text-navy font-medium">Properties Analysing</p>
              <p className="text-2xl font-bold text-navy-dark">{dealCount}</p>
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
  );
};

export default AnalysisStats;

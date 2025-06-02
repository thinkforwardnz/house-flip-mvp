
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BudgetTrackerProps {
  budget: number;
  actualSpent: number;
}

interface BudgetItem {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
}

const BudgetTracker = ({ budget, actualSpent }: BudgetTrackerProps) => {
  const budgetItems: BudgetItem[] = [
    { category: 'Materials', budgeted: 35000, actual: 32500, variance: -2500 },
    { category: 'Labor', budgeted: 25000, actual: 28000, variance: 3000 },
    { category: 'Kitchen', budgeted: 15000, actual: 12000, variance: -3000 },
    { category: 'Bathroom', budgeted: 8000, actual: 8500, variance: 500 },
    { category: 'Electrical', budgeted: 2000, actual: 2200, variance: 200 }
  ];

  const percentSpent = (actualSpent / budget) * 100;
  const remaining = budget - actualSpent;

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20';
    if (variance < 0) return 'bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Total Budget</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                ${budget.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Actual Spent</p>
              <p className="text-2xl font-semibold text-[#FF9800] mt-1">
                ${actualSpent.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">Remaining</p>
              <p className={`text-2xl font-semibold mt-1 ${remaining >= 0 ? 'text-[#388E3C]' : 'text-[#D32F2F]'}`}>
                ${remaining.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 font-medium">% Spent</p>
              <p className={`text-2xl font-semibold mt-1 ${percentSpent > 100 ? 'text-[#D32F2F]' : 'text-gray-900'}`}>
                {percentSpent.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Budget Progress</span>
              <span className="text-gray-900 font-medium">{percentSpent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-300 ${
                  percentSpent > 100 ? 'bg-[#D32F2F]' : 
                  percentSpent > 80 ? 'bg-[#FF9800]' : 'bg-[#1B5E20]'
                }`}
                style={{ width: `${Math.min(percentSpent, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Breakdown */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Breakdown</h3>
          
          <div className="space-y-4">
            {budgetItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.category}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span>Budgeted: ${item.budgeted.toLocaleString()}</span>
                    <span>Actual: ${item.actual.toLocaleString()}</span>
                  </div>
                </div>
                <Badge className={`text-xs px-3 py-1 ${getVarianceColor(item.variance)}`}>
                  {item.variance > 0 ? '+' : ''}${item.variance.toLocaleString()}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetTracker;

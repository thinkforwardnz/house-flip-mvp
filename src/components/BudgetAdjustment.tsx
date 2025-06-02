
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, TrendingDown, Edit } from 'lucide-react';

interface BudgetItem {
  category: string;
  original: number;
  updated: number;
  variance: number;
  source: string;
  dateUpdated: string;
}

const BudgetAdjustment = () => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    {
      category: 'Kitchen Renovation',
      original: 15000,
      updated: 18500,
      variance: 3500,
      source: 'Kitchen Solutions Ltd Quote',
      dateUpdated: '2024-02-10'
    },
    {
      category: 'Bathroom Renovation',
      original: 8000,
      updated: 7200,
      variance: -800,
      source: 'Bathroom Pros Quote',
      dateUpdated: '2024-02-09'
    },
    {
      category: 'Electrical Work',
      original: 3500,
      updated: 4200,
      variance: 700,
      source: 'Sparky Solutions Quote',
      dateUpdated: '2024-02-08'
    },
    {
      category: 'Flooring',
      original: 6000,
      updated: 6000,
      variance: 0,
      source: 'Original Estimate',
      dateUpdated: '2024-01-15'
    }
  ]);

  const [editingItem, setEditingItem] = useState<string | null>(null);

  const totalOriginal = budgetItems.reduce((sum, item) => sum + item.original, 0);
  const totalUpdated = budgetItems.reduce((sum, item) => sum + item.updated, 0);
  const totalVariance = totalUpdated - totalOriginal;
  const variancePercentage = (totalVariance / totalOriginal) * 100;

  const handleUpdateBudget = (category: string, newAmount: number) => {
    setBudgetItems(budgetItems.map(item => 
      item.category === category 
        ? { 
            ...item, 
            updated: newAmount, 
            variance: newAmount - item.original,
            dateUpdated: new Date().toISOString().split('T')[0]
          }
        : item
    ));
    setEditingItem(null);
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20';
    if (variance < 0) return 'bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Original Budget</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${totalOriginal.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF9800]/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-[#FF9800]" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Updated Budget</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${totalUpdated.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                totalVariance >= 0 ? 'bg-[#D32F2F]/10' : 'bg-[#388E3C]/10'
              }`}>
                {totalVariance >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-[#D32F2F]" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-[#388E3C]" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Variance</p>
                <p className={`text-lg font-semibold ${
                  totalVariance >= 0 ? 'text-[#D32F2F]' : 'text-[#388E3C]'
                }`}>
                  {totalVariance >= 0 ? '+' : ''}${totalVariance.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-sm font-semibold text-gray-600">%</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">% Change</p>
                <p className={`text-lg font-semibold ${
                  variancePercentage >= 0 ? 'text-[#D32F2F]' : 'text-[#388E3C]'
                }`}>
                  {variancePercentage >= 0 ? '+' : ''}{variancePercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Items */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Breakdown</h3>
          
          <div className="space-y-4">
            {budgetItems.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.category}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Source: {item.source} • Updated: {item.dateUpdated}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingItem(item.category)}
                    className="text-gray-600 border-gray-300"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>

                {editingItem === item.category ? (
                  <div className="grid grid-cols-3 gap-4 items-end">
                    <div>
                      <Label htmlFor={`budget-${index}`} className="text-sm">Updated Amount</Label>
                      <Input
                        id={`budget-${index}`}
                        type="number"
                        defaultValue={item.updated}
                        onBlur={(e) => handleUpdateBudget(item.category, parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setEditingItem(null)}
                      className="bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white"
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Original:</span>
                      <p className="font-medium text-gray-900">${item.original.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Updated:</span>
                      <p className="font-medium text-gray-900">${item.updated.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Variance:</span>
                      <Badge className={`text-xs px-2 py-1 ${getVarianceColor(item.variance)}`}>
                        {item.variance >= 0 ? '+' : ''}${item.variance.toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetAdjustment;

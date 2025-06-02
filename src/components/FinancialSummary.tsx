
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Calculator, Receipt } from 'lucide-react';

const FinancialSummary = () => {
  const financialData = {
    salePrice: 655000,
    totalCosts: 125000,
    netProfit: 530000,
    roi: 22.5,
    gstEstimate: 16500
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#1B5E20]" />
          Financial Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Final Sale Price */}
          <div className="text-center p-4 bg-[#1B5E20]/5 rounded-lg border border-[#1B5E20]/20">
            <DollarSign className="h-8 w-8 text-[#1B5E20] mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Final Sale Price</p>
            <p className="text-2xl font-bold text-[#1B5E20]">{formatCurrency(financialData.salePrice)}</p>
          </div>

          {/* Total Costs */}
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Receipt className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Total Costs</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialData.totalCosts)}</p>
          </div>

          {/* Net Profit */}
          <div className="text-center p-4 bg-[#388E3C]/5 rounded-lg border border-[#388E3C]/20">
            <TrendingUp className="h-8 w-8 text-[#388E3C] mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Net Profit</p>
            <p className="text-2xl font-bold text-[#388E3C]">{formatCurrency(financialData.netProfit)}</p>
          </div>

          {/* ROI */}
          <div className="text-center p-4 bg-[#FF9800]/5 rounded-lg border border-[#FF9800]/20">
            <Calculator className="h-8 w-8 text-[#FF9800] mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">ROI</p>
            <p className="text-2xl font-bold text-[#FF9800]">{financialData.roi}%</p>
          </div>

          {/* GST/Tax Estimate */}
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Receipt className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">GST Estimate</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(financialData.gstEstimate)}</p>
          </div>
        </div>

        {/* Mobile Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg md:hidden">
          <h4 className="font-medium text-gray-900 mb-3">Deal Performance</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Sale Price:</span>
              <span className="font-medium">{formatCurrency(financialData.salePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Costs:</span>
              <span className="font-medium">-{formatCurrency(financialData.totalCosts)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium text-gray-900">Net Profit:</span>
              <span className="font-bold text-[#388E3C]">{formatCurrency(financialData.netProfit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-900">ROI:</span>
              <span className="font-bold text-[#FF9800]">{financialData.roi}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialSummary;

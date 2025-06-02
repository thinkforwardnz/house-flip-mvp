
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Deal {
  purchase_price?: number;
  target_sale_price?: number;
}

interface FinancialAnalysisCardProps {
  selectedDeal: Deal;
  formatCurrency: (amount: number) => string;
}

const FinancialAnalysisCard = ({ selectedDeal, formatCurrency }: FinancialAnalysisCardProps) => {
  const estimatedRenovationCost = selectedDeal.target_sale_price && selectedDeal.purchase_price 
    ? Math.max(0, (selectedDeal.target_sale_price - selectedDeal.purchase_price) * 0.15) 
    : 50000;

  const estimatedProfit = selectedDeal.target_sale_price && selectedDeal.purchase_price
    ? selectedDeal.target_sale_price - selectedDeal.purchase_price - estimatedRenovationCost
    : 0;

  return (
    <Card className="bg-white shadow-lg rounded-2xl border-0">
      <CardHeader className="p-6">
        <CardTitle className="text-navy-dark">Financial Analysis</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-navy font-medium mb-1">Est. Renovation Cost</p>
            <p className="text-xl font-bold text-navy-dark">{formatCurrency(estimatedRenovationCost)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-navy font-medium mb-1">Est. Total Investment</p>
            <p className="text-xl font-bold text-navy-dark">
              {selectedDeal.purchase_price ? formatCurrency(selectedDeal.purchase_price + estimatedRenovationCost) : 'TBD'}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-navy font-medium mb-1">Est. Profit</p>
            <p className={`text-xl font-bold ${estimatedProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(estimatedProfit)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-navy font-medium mb-1">ROI</p>
            <p className="text-xl font-bold text-navy-dark">
              {selectedDeal.purchase_price && estimatedProfit > 0 
                ? `${((estimatedProfit / (selectedDeal.purchase_price + estimatedRenovationCost)) * 100).toFixed(1)}%`
                : 'TBD'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialAnalysisCard;

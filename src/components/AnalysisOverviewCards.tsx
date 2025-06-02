
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, AlertTriangle } from 'lucide-react';

interface Deal {
  purchase_price?: number;
  target_sale_price?: number;
  current_risk?: string;
}

interface AnalysisOverviewCardsProps {
  selectedDeal: Deal;
  formatCurrency: (amount: number) => string;
  getRiskColor: (risk: string) => string;
}

const AnalysisOverviewCards = ({ selectedDeal, formatCurrency, getRiskColor }: AnalysisOverviewCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Calculator className="h-6 w-6 text-blue-primary" />
            </div>
            <div>
              <p className="text-sm text-navy font-medium">Purchase Price</p>
              <p className="text-2xl font-bold text-navy-dark">
                {selectedDeal.purchase_price ? formatCurrency(selectedDeal.purchase_price) : 'TBD'}
              </p>
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
              <p className="text-sm text-navy font-medium">Target Sale Price</p>
              <p className="text-2xl font-bold text-navy-dark">
                {selectedDeal.target_sale_price ? formatCurrency(selectedDeal.target_sale_price) : 'TBD'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getRiskColor(selectedDeal.current_risk || '')}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-navy font-medium">Risk Level</p>
              <Badge className={`${getRiskColor(selectedDeal.current_risk || '')} border-0 text-sm font-semibold`}>
                {selectedDeal.current_risk?.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisOverviewCards;

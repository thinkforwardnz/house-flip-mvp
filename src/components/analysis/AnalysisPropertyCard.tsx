
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Deal } from '@/types/analysis';

interface ProgressStatus {
  label: string;
  color: string;
  bgColor: string;
}

interface AnalysisPropertyCardProps {
  deal: Deal;
  progress: number;
  status: ProgressStatus;
}

const AnalysisPropertyCard = ({ deal, progress, status }: AnalysisPropertyCardProps) => {
  const navigate = useNavigate();

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
};

export default AnalysisPropertyCard;

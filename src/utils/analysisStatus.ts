
import type { Deal } from '@/types/analysis';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export const getAnalysisProgress = (deal: Deal): { progress: number; completed: string[]; pending: string[] } => {
  let progress = 0;
  const completed: string[] = [];
  const pending: string[] = [];

  if (deal.address) {
    progress += 15;
    completed.push('Property Identification');
  } else {
    pending.push('Property Identification');
  }

  if (deal.purchase_price) {
    progress += 15;
    completed.push('Initial Pricing');
  } else {
    pending.push('Initial Pricing');
  }

  if (deal.target_sale_price) {
    progress += 20;
    completed.push('ARV Estimation');
  } else {
    pending.push('ARV Estimation');
  }

  if (deal.market_analysis?.analysis) {
    progress += 15;
    completed.push('Market Analysis');
  } else {
    pending.push('Market Analysis');
  }

  if (deal.renovation_analysis?.total_cost) {
    progress += 15;
    completed.push('Renovation Costing');
  } else {
    pending.push('Renovation Costing');
  }

  if (deal.risk_assessment?.overall_risk_score) {
    progress += 20;
    completed.push('Risk Assessment');
  } else {
    pending.push('Risk Assessment');
  }

  return { progress: Math.min(100, progress), completed, pending };
};

export interface DataSourceStatusItem {
  status: 'complete' | 'pending' | 'error' | 'unavailable'; // Added more specific statuses
  icon: React.ElementType;
  color: string;
  message?: string; // Optional message for more context
}

export interface DataSourceStatuses {
  linz: DataSourceStatusItem;
  trademe: DataSourceStatusItem;
  googleMaps: DataSourceStatusItem;
  council: DataSourceStatusItem;
}

export const getDataSourceStatus = (deal: Deal): DataSourceStatuses => {
  return {
    linz: { status: 'complete', icon: CheckCircle, color: 'text-green-600', message: 'LINZ data integrated' },
    trademe: deal.photos && deal.photos.length > 0 ?
      { status: 'complete', icon: CheckCircle, color: 'text-green-600', message: 'TradeMe data available' } :
      { status: 'pending', icon: AlertTriangle, color: 'text-yellow-600', message: 'TradeMe data pending or unavailable' },
    googleMaps: deal.coordinates ? // Assuming deal.coordinates is a string or object that can be checked for presence
      { status: 'complete', icon: CheckCircle, color: 'text-green-600', message: 'Google Maps data available' } :
      { status: 'pending', icon: AlertTriangle, color: 'text-yellow-600', message: 'Google Maps data pending' },
    council: { status: 'pending', icon: AlertTriangle, color: 'text-gray-600', message: 'Council data integration pending' } // Example, adjust based on actual data
  };
};

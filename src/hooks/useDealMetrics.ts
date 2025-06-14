
import { useMemo } from 'react';
import type { Deal } from '@/types/analysis';
import { calculateRenovationEstimate, calculateOfferPrice } from '@/utils/analysisCalculations';
import { getAnalysisProgress, getDataSourceStatus } from '@/utils/analysisStatus';

export const useDealMetrics = (deal: Deal) => {
  const { progress, completed, pending } = useMemo(() => getAnalysisProgress(deal), [deal]);
  const renovationEstimate = useMemo(() => calculateRenovationEstimate(deal), [deal]);
  
  // Pass renovationEstimate to calculateOfferPrice as it's a dependency
  const offerPrice = useMemo(() => calculateOfferPrice(deal, renovationEstimate), [deal, renovationEstimate]);
  const dataSourceStatus = useMemo(() => getDataSourceStatus(deal), [deal]);

  return {
    progress,
    completed,
    pending,
    renovationEstimate,
    offerPrice,
    dataSourceStatus,
  };
};

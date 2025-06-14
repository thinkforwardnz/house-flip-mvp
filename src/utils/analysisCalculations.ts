
import type { Deal } from '@/types/analysis';

export const calculateRenovationEstimate = (deal: Deal): number => {
  return deal.renovation_analysis?.total_cost ||
    (deal.target_sale_price && deal.purchase_price
      ? Math.max(0, (deal.target_sale_price - deal.purchase_price) * 0.15)
      : 50000);
};

export const calculateOfferPrice = (deal: Deal, renovationEstimate: number): number => {
  // Ensure target_sale_price is not null or undefined before using it in calculations
  const targetSalePrice = deal.target_sale_price ?? 0;
  
  return targetSalePrice > 0
    ? targetSalePrice - renovationEstimate - (targetSalePrice * 0.1) - (targetSalePrice * 0.15)
    : 0;
};


import type { Deal } from '@/types/analysis';
import type { RenovationSelections } from '@/types/renovation';

export const calculateARV = (deal: Deal): number => {
  // Get base market value from market analysis or fall back to target_sale_price
  const baseMarketValue = deal.market_analysis?.analysis?.estimated_arv || 
                         deal.target_sale_price || 
                         0;

  if (!deal.renovation_selections || baseMarketValue === 0) {
    return baseMarketValue;
  }

  // Calculate total value add from selected renovations
  let totalValueAdd = 0;
  const selections = deal.renovation_selections as RenovationSelections;

  Object.entries(selections).forEach(([key, option]) => {
    if (option?.selected) {
      const valueAdd = baseMarketValue * (option.value_add_percent / 100);
      totalValueAdd += valueAdd;
    }
  });

  return baseMarketValue + totalValueAdd;
};

export const calculateTotalRenovationCost = (renovationSelections: RenovationSelections): number => {
  return Object.values(renovationSelections).reduce((total, option) => {
    return total + (option?.selected ? option.cost : 0);
  }, 0);
};

export const getSelectedRenovations = (renovationSelections: RenovationSelections): string[] => {
  return Object.entries(renovationSelections)
    .filter(([, option]) => option?.selected)
    .map(([key]) => key);
};

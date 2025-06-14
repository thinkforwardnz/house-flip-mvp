
import { supabase } from '@/integrations/supabase/client';
import type { Deal, MarketData } from '@/types/analysis';

interface MarketAnalysisParams {
  dealId: string;
  address?: string;
  suburb?: string;
  city?: string;
  bedrooms?: number;
  bathrooms?: number;
}

export const invokeMarketAnalysis = async (params: MarketAnalysisParams): Promise<Partial<Deal>> => {
  console.log('Starting market analysis for deal:', params.dealId);
  const { data, error } = await supabase.functions.invoke('market-analysis', {
    body: {
      dealId: params.dealId,
      address: params.address,
      suburb: params.suburb,
      city: params.city,
      bedrooms: params.bedrooms,
      bathrooms: params.bathrooms,
    },
  });

  if (error) {
    console.error('Market analysis error:', error);
    throw new Error(`Market analysis failed: ${error.message}`);
  }
  console.log('Market analysis response:', data);
  if (data && data.updatedFields) {
    const partialUpdates = { ...data.updatedFields };
    if (partialUpdates.market_analysis) {
      partialUpdates.market_analysis = partialUpdates.market_analysis as MarketData | undefined;
    }
    return partialUpdates;
  }
  return {};
};

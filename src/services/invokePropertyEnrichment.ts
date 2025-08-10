
import { supabase } from '@/integrations/supabase/client';
import type { Deal } from '@/types/analysis';

interface PropertyEnrichmentParams {
  dealId: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
}

export const invokePropertyEnrichment = async (params: PropertyEnrichmentParams): Promise<Partial<Deal>> => {
  console.log('Starting property enrichment for deal:', params.dealId);
  const { data, error } = await supabase.functions.invoke('enrich-property-analysis', {
    body: {
      dealId: params.dealId,
      address: params.address,
      coordinates: params.coordinates,
    },
  });

  if (error) {
    // Non-critical, so log and continue
    console.error('Property enrichment error:', error.message);
    return {}; // Return empty if error, as per original logic allowing this step to fail softly
  }
  console.log('Property enrichment response:', data);
  if (data && data.data) {
    return { analysis_data: data.data } as Partial<Deal>;
  }
  return {};
};

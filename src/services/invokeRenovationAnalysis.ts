
import { supabase } from '@/integrations/supabase/client';
import type { Deal, RenovationAnalysis } from '@/types/analysis';

interface RenovationAnalysisParams {
  dealId: string;
  photos?: string[];
  propertyDescription?: string;
  bedrooms?: number;
  bathrooms?: number;
  floorArea?: number;
}

export const invokeRenovationAnalysis = async (params: RenovationAnalysisParams): Promise<Partial<Deal>> => {
  console.log('Starting renovation analysis for deal:', params.dealId);
  const { data, error } = await supabase.functions.invoke('renovation-analysis', {
    body: {
      dealId: params.dealId,
      photos: params.photos || [],
      propertyDescription: params.propertyDescription || '',
      bedrooms: params.bedrooms,
      bathrooms: params.bathrooms,
      floorArea: params.floorArea,
    },
  });

  if (error) {
    console.error('Renovation analysis error:', error);
    throw new Error(`Renovation analysis failed: ${error.message}`);
  }
  console.log('Renovation analysis response:', data);
  if (data && data.updatedFields) {
    const partialUpdates = { ...data.updatedFields };
    if (partialUpdates.renovation_analysis) {
      partialUpdates.renovation_analysis = partialUpdates.renovation_analysis as RenovationAnalysis | undefined;
    }
    return partialUpdates;
  }
  return {};
};

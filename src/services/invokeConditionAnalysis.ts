import { supabase } from '@/integrations/supabase/client';
import type { Deal } from '@/types/analysis';

interface ConditionAnalysisParams {
  dealId: string;
  photos?: string[];
  description?: string;
}

export const invokeConditionAnalysis = async (
  params: ConditionAnalysisParams
): Promise<Partial<Deal>> => {
  console.log('Starting condition analysis for deal:', params.dealId);
  const { data, error } = await supabase.functions.invoke('condition-analysis', {
    body: {
      dealId: params.dealId,
      photos: params.photos,
      description: params.description,
    },
  });

  if (error) {
    console.error('Condition analysis error:', error);
    throw new Error(`Condition analysis failed: ${error.message}`);
  }

  console.log('Condition analysis response:', data);
  if (data && data.updatedFields) {
    return { ...data.updatedFields } as Partial<Deal>;
  }
  return {};
};

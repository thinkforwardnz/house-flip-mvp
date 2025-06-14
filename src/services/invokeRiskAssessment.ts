
import { supabase } from '@/integrations/supabase/client';
import type { Deal, RiskAssessment } from '@/types/analysis';

interface RiskAssessmentParams {
  dealId: string;
}

export const invokeRiskAssessment = async (params: RiskAssessmentParams): Promise<Partial<Deal>> => {
  console.log('Starting risk assessment for deal:', params.dealId);
  const { data, error } = await supabase.functions.invoke('risk-assessment', {
    body: { dealId: params.dealId },
  });

  if (error) {
    console.error('Risk assessment error:', error);
    throw new Error(`Risk assessment failed: ${error.message}`);
  }
  console.log('Risk assessment response:', data);
  if (data && data.updatedFields) {
    const partialUpdates = { ...data.updatedFields };
    if (partialUpdates.risk_assessment) {
      partialUpdates.risk_assessment = partialUpdates.risk_assessment as RiskAssessment | undefined;
    }
    return partialUpdates;
  }
  return {};
};

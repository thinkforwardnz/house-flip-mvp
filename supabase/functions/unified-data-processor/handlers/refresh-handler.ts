
import { enrichPropertiesNeedingData } from './enrichment-handler.ts';
import { ProcessingRequest } from '../types/processor-types.ts';
import { corsHeaders } from '../../shared/cors.ts';

export async function handleRefresh(request: ProcessingRequest): Promise<Response> {
  // Refresh existing properties with missing data
  const result = await enrichPropertiesNeedingData();
  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Export the function needed by enrichment-handler
export { enrichPropertiesNeedingData } from './enrichment-handler.ts';

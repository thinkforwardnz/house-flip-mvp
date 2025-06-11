
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../shared/cors.ts';
import { errorResponse } from '../shared/error-response.ts';
import { handleScraping } from './handlers/scraping-handler.ts';
import { handleEnrichment } from './handlers/enrichment-handler.ts';
import { handleRefresh } from './handlers/refresh-handler.ts';
import { ProcessingRequest } from './types/processor-types.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: ProcessingRequest = await req.json();
    console.log('Unified data processor started with request:', body);

    switch (body.mode) {
      case 'scrape':
        return await handleScraping(body);
      case 'enrich':
        return await handleEnrichment(body);
      case 'refresh':
        return await handleRefresh(body);
      default:
        return errorResponse('Invalid processing mode', 400);
    }
  } catch (error) {
    console.error('Unified data processor error:', error);
    return errorResponse(error.message || 'Processing failed', 500);
  }
});

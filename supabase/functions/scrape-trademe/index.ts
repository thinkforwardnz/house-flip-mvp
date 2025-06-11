
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../shared/cors.ts';
import { errorResponse } from '../shared/error-response.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const filters = body.filters ?? {};
    console.log('TradeMe scraping request redirected to unified processor');

    // Redirect to unified data processor
    const { data, error } = await supabase.functions.invoke('unified-data-processor', {
      body: {
        mode: 'scrape',
        filters: filters,
        sources: ['trademe']
      }
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({
      success: data.success,
      scraped: data.processed,
      skipped: data.skipped,
      total: data.processed + data.skipped,
      source: 'Trade Me',
      message: data.message,
      errors: data.errors
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Trade Me scraping error:', error);
    const message = error instanceof Error ? error.message : 'Trade Me scraping failed';
    return errorResponse(message, 500);
  }
});

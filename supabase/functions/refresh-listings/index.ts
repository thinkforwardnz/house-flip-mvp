
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { errorResponse } from '../shared/error-response.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filters = {}, sources = ['trademe'] } = await req.json();

    console.log('Manual refresh triggered, redirecting to unified processor');

    // Use unified data processor for scraping
    const { data, error } = await supabase.functions.invoke('unified-data-processor', {
      body: {
        mode: 'scrape',
        filters: filters,
        sources: sources
      }
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({
      success: true,
      results: {
        scraped: data.processed,
        skipped: data.skipped,
        errors: data.errors,
        sources: [{
          source: 'Trade Me',
          scraped: data.processed,
          skipped: data.skipped,
          total: data.processed + data.skipped
        }]
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in refresh-listings function:', error);
    return errorResponse(error.message || 'refresh-listings failed', 500);
  }
});

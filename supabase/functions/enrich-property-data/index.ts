
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../shared/cors.ts';
import { errorResponse } from '../shared/error-response.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Property enrichment request redirected to unified processor');

    // Use unified data processor for enrichment
    const { data, error } = await supabase.functions.invoke('unified-data-processor', {
      body: {
        mode: 'enrich',
        propertyId: body.propertyId
      }
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({
      success: data.success,
      enriched: data.processed,
      skipped: data.skipped,
      errors: data.errors,
      message: data.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Property data enrichment error:', error);
    const message = error instanceof Error ? error.message : 'Property data enrichment failed';
    return errorResponse(message, 500);
  }
});

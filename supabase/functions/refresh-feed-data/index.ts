
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
    console.log('Feed refresh request redirected to unified processor');

    // Use unified data processor for enrichment
    const { data, error } = await supabase.functions.invoke('unified-data-processor', {
      body: {
        mode: 'refresh'
      }
    });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({
      success: data.success,
      message: data.message,
      completed: data.processed,
      skipped: data.skipped,
      total_processed: data.processed + data.skipped,
      errors: data.errors
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Refresh feed data error:', error);
    return errorResponse(error.message || 'refresh-feed-data failed', 500);
  }
});

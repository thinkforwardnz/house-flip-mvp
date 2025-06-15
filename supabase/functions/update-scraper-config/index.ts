
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { endpoint } = await req.json();
    
    if (!endpoint || typeof endpoint !== 'string') {
      return new Response(JSON.stringify({
        error: 'Valid endpoint URL is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate URL format
    try {
      new URL(endpoint);
    } catch {
      return new Response(JSON.stringify({
        error: 'Invalid URL format'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client with service role key for database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update the endpoint in the database using upsert
    const { error } = await supabase
      .from('scraper_config')
      .upsert({
        config_key: 'trademe_endpoint',
        config_value: endpoint,
        description: 'Base URL for the TradeMe scraper service'
      }, {
        onConflict: 'config_key'
      });

    if (error) {
      console.error('Database update error:', error);
      return new Response(JSON.stringify({
        error: 'Failed to update scraper configuration in database'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Scraper endpoint updated successfully in database:', endpoint);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Endpoint configuration updated successfully',
      endpoint
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Update scraper config error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to update scraper configuration'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});


import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Query the scraper_config table for the trademe_endpoint
    const { data, error } = await supabase
      .from('scraper_config')
      .select('config_value')
      .eq('config_key', 'trademe_endpoint')
      .single();

    if (error) {
      console.error('Database query error:', error);
      // Fall back to default endpoint if database query fails
      return new Response(JSON.stringify({
        endpoint: 'https://4419-222-154-21-216.ngrok-free.app'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      endpoint: data.config_value
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get scraper config error:', error);
    return new Response(JSON.stringify({
      endpoint: 'https://4419-222-154-21-216.ngrok-free.app',
      error: 'Failed to get scraper configuration, using default'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

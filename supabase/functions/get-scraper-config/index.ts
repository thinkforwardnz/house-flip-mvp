
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

    // Query all scraper configurations
    const { data, error } = await supabase
      .from('scraper_config')
      .select('config_key, config_value');

    if (error) {
      console.error('Database query error:', error);
      throw error;
    }

    // Convert array to object for easier frontend consumption
    const configs: Record<string, string> = {};
    if (data) {
      data.forEach(config => {
        configs[config.config_key] = config.config_value;
      });
    }

    return new Response(JSON.stringify(configs), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Get scraper config error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to get scraper configuration'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

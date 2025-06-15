
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    
    // Handle both single key updates and bulk updates
    if (typeof body === 'object' && body !== null) {
      const updates = Object.entries(body);
      
      for (const [configKey, configValue] of updates) {
        if (typeof configValue === 'string') {
          // Use upsert to insert or update the configuration
          const { error } = await supabase
            .from('scraper_config')
            .upsert({
              config_key: configKey,
              config_value: configValue,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'config_key'
            });

          if (error) {
            console.error(`Error updating config ${configKey}:`, error);
            throw error;
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Configuration updated successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Update scraper config error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to update scraper configuration',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

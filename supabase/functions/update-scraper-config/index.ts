
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
    console.log('Received update request:', body);
    
    // Define which keys should be stored in database vs secrets
    const databaseKeys = ['trademe_endpoint'];
    const secretKeys = ['openai_api_key', 'google_maps_api_key', 'apify_api_token', 'linz_api_key', 'firecrawl_key', 'agentql_api_key'];
    
    // Handle both single key updates and bulk updates
    if (typeof body === 'object' && body !== null) {
      const updates = Object.entries(body);
      const warnings: string[] = [];
      
      for (const [configKey, configValue] of updates) {
        if (typeof configValue === 'string') {
          if (databaseKeys.includes(configKey)) {
            // Update database configuration
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
          } else if (secretKeys.includes(configKey)) {
            // API keys should be managed through Supabase dashboard
            warnings.push(`${configKey} should be configured as a Supabase secret in the dashboard`);
          } else {
            console.warn(`Unknown configuration key: ${configKey}`);
          }
        }
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Configuration updated successfully',
        warnings: warnings.length > 0 ? warnings : undefined
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
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

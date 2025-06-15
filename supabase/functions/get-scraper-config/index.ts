
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the current endpoint from environment variable
    const endpoint = Deno.env.get('CUSTOM_SCRAPER_BASE_URL') || 'https://e104-222-154-21-216.ngrok-free.app';
    
    return new Response(JSON.stringify({
      endpoint
    }), {
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

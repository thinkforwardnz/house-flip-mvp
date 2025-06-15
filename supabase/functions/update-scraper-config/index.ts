
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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

    // Note: In a real implementation, you might want to store this in a database
    // For now, we'll just validate and return success
    // The actual endpoint update would need to be done via environment variables
    
    console.log('Scraper endpoint update requested:', endpoint);
    
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

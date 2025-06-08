
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../shared/cors.ts';
import { AgentQLSearchClient } from '../shared/agentql-search-client.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { location, propertyType, priceRange } = await req.json();
    console.log('Starting market analysis for:', { location, propertyType, priceRange });

    if (!location) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Location is required for market analysis'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize search client for market data
    const searchClient = new AgentQLSearchClient();
    
    // Build search URL for market analysis
    const baseUrl = 'https://www.trademe.co.nz/a/property/residential/sale';
    const searchParams = new URLSearchParams();
    
    if (location) searchParams.append('location', location);
    if (propertyType) searchParams.append('property_type', propertyType);
    if (priceRange?.min) searchParams.append('price_min', priceRange.min.toString());
    if (priceRange?.max) searchParams.append('price_max', priceRange.max.toString());
    
    const searchUrl = `${baseUrl}?${searchParams.toString()}`;
    
    // Get market data from search results
    const marketData = await searchClient.scrapeSearchResults(searchUrl);

    if (!marketData?.success || !marketData?.data?.properties) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Could not retrieve market data',
        message: 'No market data could be found for the specified criteria'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const properties = marketData.data.properties || [];
    console.log(`Market analysis found ${properties.length} properties`);

    // Perform basic market analysis
    const analysis = {
      total_properties: properties.length,
      location: location,
      property_type: propertyType,
      price_range: priceRange,
      sample_properties: properties.slice(0, 10), // First 10 for analysis
      search_url: searchUrl
    };

    return new Response(JSON.stringify({
      success: true,
      message: 'Market analysis completed successfully',
      analysis: analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Market analysis error:', error);
    return new Response(JSON.stringify({
      error: 'Market analysis failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

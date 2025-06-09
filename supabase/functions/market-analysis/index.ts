
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
    console.log('Starting market analysis with enhanced debugging for:', { location, propertyType, priceRange });

    if (!location) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Location is required for market analysis'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if AgentQL API key is configured with detailed logging
    const agentqlKey = Deno.env.get('AGENTQL_API_KEY');
    console.log('Market Analysis - AgentQL API key check:', {
      exists: !!agentqlKey,
      length: agentqlKey?.length || 0,
      prefix: agentqlKey?.substring(0, 8) + '...' || 'N/A'
    });

    if (!agentqlKey) {
      console.error('AGENTQL_API_KEY not configured for market analysis');
      return new Response(JSON.stringify({
        success: false,
        error: 'AgentQL API key not configured',
        message: 'Please add your AgentQL API key to Supabase Edge Function secrets',
        troubleshooting: {
          steps: [
            '1. Go to Supabase Dashboard > Edge Functions > Settings',
            '2. Add a new secret: AGENTQL_API_KEY',
            '3. Enter your AgentQL API key value',
            '4. Redeploy the function'
          ]
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize search client with enhanced error handling
    let searchClient;
    try {
      searchClient = new AgentQLSearchClient();
      console.log('Market Analysis - AgentQL search client initialized successfully');

      // Test connection before proceeding
      const connectionTest = await searchClient.testConnection();
      if (!connectionTest.success) {
        console.error('Market Analysis - AgentQL connection test failed:', connectionTest);
        return new Response(JSON.stringify({
          success: false,
          error: 'AgentQL connection test failed',
          message: connectionTest.message,
          details: connectionTest.details
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      console.log('Market Analysis - AgentQL connection test passed');

    } catch (error) {
      console.error('Market Analysis - Failed to initialize AgentQL search client:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to initialize AgentQL search client',
        message: error.message,
        troubleshooting: {
          possibleCauses: [
            'Invalid API key format',
            'API key too short',
            'Environment variable not set correctly'
          ]
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Build search URL for market analysis
    const baseUrl = 'https://www.trademe.co.nz/a/property/residential/sale';
    const searchParams = new URLSearchParams();
    
    if (location) searchParams.append('location', location);
    if (propertyType) searchParams.append('property_type', propertyType);
    if (priceRange?.min) searchParams.append('price_min', priceRange.min.toString());
    if (priceRange?.max) searchParams.append('price_max', priceRange.max.toString());
    
    const searchUrl = `${baseUrl}?${searchParams.toString()}`;
    console.log('Market Analysis - Built search URL:', searchUrl);
    
    // Get market data from search results with enhanced error handling
    const marketData = await searchClient.scrapeSearchResults(searchUrl);

    if (!marketData?.success || !marketData?.data?.properties) {
      console.error('Market Analysis - Could not retrieve market data:', marketData);
      return new Response(JSON.stringify({
        success: false,
        error: 'Could not retrieve market data',
        message: 'No market data could be found for the specified criteria',
        details: marketData?.error || 'Unknown error',
        searchUrl: searchUrl
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const properties = marketData.data.properties || [];
    console.log(`Market analysis found ${properties.length} properties with enhanced debugging`);

    // Perform basic market analysis
    const analysis = {
      total_properties: properties.length,
      location: location,
      property_type: propertyType,
      price_range: priceRange,
      sample_properties: properties.slice(0, 10), // First 10 for analysis
      search_url: searchUrl,
      debugging: {
        agentqlConfigured: true,
        connectionTested: true
      }
    };

    return new Response(JSON.stringify({
      success: true,
      message: 'Market analysis completed successfully with enhanced debugging',
      analysis: analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Market analysis error with enhanced debugging:', error);
    return new Response(JSON.stringify({
      error: 'Market analysis failed',
      details: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

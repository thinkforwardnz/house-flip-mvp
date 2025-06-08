
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../shared/cors.ts';
import { AgentQLPropertyClient } from '../shared/agentql-property-client.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { propertyUrl } = await req.json();
    console.log('Starting property analysis for URL:', propertyUrl);

    if (!propertyUrl) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Property URL is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize property client for detailed scraping
    const propertyClient = new AgentQLPropertyClient();
    
    // Scrape the property page for analysis
    const propertyData = await propertyClient.scrapePropertyPage(propertyUrl);

    if (!propertyData) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Could not analyze property',
        message: 'No data could be retrieved from the property page'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Property analysis complete:', {
      title: propertyData.title,
      price: propertyData.price,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Property analyzed successfully',
      analysis: {
        title: propertyData.title,
        address: propertyData.address,
        price: propertyData.price,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        floor_area: propertyData.floor_area,
        land_area: propertyData.land_area,
        description: propertyData.description,
        photos_count: propertyData.photos?.length || 0,
        source_url: propertyUrl
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Property analysis error:', error);
    return new Response(JSON.stringify({
      error: 'Property analysis failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

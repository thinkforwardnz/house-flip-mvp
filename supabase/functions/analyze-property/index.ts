
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../shared/cors.ts';
import { CustomScraperClient } from '../shared/custom-scraper-client.ts';

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

    // Initialize custom scraper client for detailed scraping
    const scraperClient = new CustomScraperClient();
    
    // Scrape the property page for analysis
    const propertyData = await scraperClient.scrapeProperty(propertyUrl);

    if (!propertyData || !propertyData.structured) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Could not analyze property',
        message: 'No data could be retrieved from the property page'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const structured = propertyData.structured;
    console.log('Property analysis complete:', {
      title: structured.title,
      price: structured.price,
      bedrooms: structured.bedrooms,
      bathrooms: structured.bathrooms
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Property analyzed successfully',
      analysis: {
        title: structured.title,
        address: structured.address,
        price: structured.price,
        bedrooms: structured.bedrooms,
        bathrooms: structured.bathrooms,
        floor_area: structured.floor_area,
        land_area: structured.land_area,
        description: structured.description,
        photos_count: structured.images?.length || 0,
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


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
    const { propertyUrl, dealId } = await req.json();
    console.log('Starting property analysis and enrichment for URL:', propertyUrl);

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
    
    // Scrape the property page for detailed information
    const propertyData = await propertyClient.scrapePropertyPage(propertyUrl);

    if (!propertyData) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Could not scrape property details',
        message: 'No data could be retrieved from the property page'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Property data scraped successfully:', {
      title: propertyData.title,
      price: propertyData.price,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms
    });

    // Update deal with enriched property data if dealId provided
    if (dealId) {
      const { error: updateError } = await supabase
        .from('deals')
        .update({
          property_data: {
            address: propertyData.address,
            bedrooms: propertyData.bedrooms,
            bathrooms: propertyData.bathrooms,
            floor_area: propertyData.floor_area,
            land_area: propertyData.land_area,
            photos: propertyData.photos,
            description: propertyData.description,
            source_url: propertyUrl
          },
          purchase_price: propertyData.price > 0 ? propertyData.price : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', dealId);

      if (updateError) {
        console.error('Error updating deal:', updateError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to update deal with property data'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('Deal updated successfully with property data');
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Property analyzed and enriched successfully',
      propertyData: {
        title: propertyData.title,
        address: propertyData.address,
        price: propertyData.price,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        floor_area: propertyData.floor_area,
        land_area: propertyData.land_area,
        photos_count: propertyData.photos?.length || 0,
        has_description: !!propertyData.description
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Property analysis and enrichment error:', error);
    return new Response(JSON.stringify({
      error: 'Property analysis failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

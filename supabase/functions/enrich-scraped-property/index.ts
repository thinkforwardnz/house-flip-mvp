
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
    const { listingId } = await req.json();

    if (!listingId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Listing ID is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Starting full enrichment for listing: ${listingId}`);

    // Get the listing to enrich
    const { data: listing, error: fetchError } = await supabase
      .from('scraped_listings')
      .select('id, source_url, address')
      .eq('id', listingId)
      .single();

    if (fetchError || !listing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Listing not found'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Enriching listing: ${listing.address} (${listing.source_url})`);

    // Initialize property client for detailed scraping
    const propertyClient = new AgentQLPropertyClient();
    
    // Scrape the individual property page for full details
    const propertyData = await propertyClient.scrapePropertyPage(listing.source_url);

    if (!propertyData) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Could not scrape property details',
        message: 'No detailed data could be retrieved from the property page'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update the listing with all detailed information
    const { error: updateError } = await supabase
      .from('scraped_listings')
      .update({
        summary: propertyData.description,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        floor_area: propertyData.floor_area,
        land_area: propertyData.land_area,
        photos: propertyData.photos,
        listing_date: propertyData.date,
        price: propertyData.price > 0 ? propertyData.price : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', listingId);

    if (updateError) {
      console.error(`Error updating enriched listing:`, updateError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to update listing with enriched data'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Successfully enriched listing: ${listing.address}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Property enriched successfully with detailed information`,
      listingId: listingId,
      enriched_data: {
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
    console.error('Property enrichment error:', error);
    return new Response(JSON.stringify({
      error: 'Property enrichment failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

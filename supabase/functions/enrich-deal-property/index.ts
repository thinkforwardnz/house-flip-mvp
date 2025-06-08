
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

import { corsHeaders } from '../shared/cors.ts';
import { AgentQLClient } from '../shared/agentql-client.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dealId } = await req.json();
    console.log(`Enriching deal property data for deal: ${dealId}`);

    if (!dealId) {
      throw new Error('Deal ID is required');
    }

    // Get the deal data
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      throw new Error(`Deal not found: ${dealError?.message}`);
    }

    // Check if we have a source URL to enrich from
    let sourceUrl = null;
    
    // First, try to find if this deal was created from a scraped listing
    const { data: scrapedListing } = await supabase
      .from('scraped_listings')
      .select('source_url, bedrooms, bathrooms, floor_area, land_area, photos, summary')
      .eq('address', deal.address)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (scrapedListing?.source_url) {
      sourceUrl = scrapedListing.source_url;
      console.log(`Found scraped listing source URL: ${sourceUrl}`);
    }

    let enrichedData: any = {};

    // If we have a source URL, scrape it for enhanced data
    if (sourceUrl) {
      try {
        const agentqlClient = new AgentQLClient();
        const propertyData = await agentqlClient.scrapePropertyPage(sourceUrl);
        
        if (propertyData) {
          enrichedData = {
            bedrooms: propertyData.bedrooms || deal.bedrooms,
            bathrooms: propertyData.bathrooms || deal.bathrooms,
            floor_area: propertyData.floor_area || deal.floor_area,
            land_area: propertyData.land_area || deal.land_area,
            photos: propertyData.photos?.length > 0 ? propertyData.photos : deal.photos,
            description: propertyData.description || deal.description,
            // Store detailed listing details in the new JSONB column
            listing_details: {
              title: propertyData.title,
              method: propertyData.method,
              type: propertyData.type,
              parking: propertyData.parking,
              internet: propertyData.internet,
              other_features: propertyData.other_features,
              date: propertyData.date
            }
          };
          console.log('Enhanced data extracted from property page:', {
            bedrooms: enrichedData.bedrooms,
            bathrooms: enrichedData.bathrooms,
            floor_area: enrichedData.floor_area,
            land_area: enrichedData.land_area,
            photos_count: enrichedData.photos?.length || 0,
            listing_details: enrichedData.listing_details
          });
        }
      } catch (error) {
        console.error('Error scraping property page:', error);
      }
    }

    // If no source URL, try to use data from the scraped listing
    if (!sourceUrl && scrapedListing) {
      enrichedData = {
        bedrooms: scrapedListing.bedrooms || deal.bedrooms,
        bathrooms: scrapedListing.bathrooms || deal.bathrooms,
        floor_area: scrapedListing.floor_area || deal.floor_area,
        land_area: scrapedListing.land_area || deal.land_area,
        photos: scrapedListing.photos?.length > 0 ? scrapedListing.photos : deal.photos,
        description: scrapedListing.summary || deal.description
      };
      console.log('Using data from scraped listing');
    }

    // Only update if we have new data
    if (Object.keys(enrichedData).length > 0) {
      const updateData = {
        ...enrichedData,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('deals')
        .update(updateData)
        .eq('id', dealId);

      if (updateError) {
        console.error('Error updating deal:', updateError);
        throw updateError;
      }

      console.log(`Successfully enriched deal ${dealId} with property data`);

      return new Response(JSON.stringify({
        success: true,
        data: enrichedData,
        message: 'Deal property data enriched successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: 'No additional property data found to enrich',
        data: {}
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in deal property enrichment:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

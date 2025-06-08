
// deno-lint-ignore no-explicit-any
// @ts-ignore: Deno global is available in Edge Functions
declare const Deno: any;
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
    console.log('Property data enrichment started with enhanced listing details collection');

    // Check if AgentQL API key is configured
    const agentqlKey = Deno.env.get('AGENTQL_API_KEY');
    if (!agentqlKey) {
      console.error('AGENTQL_API_KEY not configured in environment');
      return new Response(JSON.stringify({
        success: false,
        error: 'AgentQL API key not configured',
        enriched: 0,
        skipped: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize AgentQL client
    let agentqlClient;
    try {
      agentqlClient = new AgentQLClient();
      console.log('AgentQL client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AgentQL client:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to initialize AgentQL client: ' + error.message,
        enriched: 0,
        skipped: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find listings with missing details (not just photos)
    const { data: listingsToEnrich, error: queryError } = await supabase
      .from('scraped_listings')
      .select('id, source_url, address, photos, summary, bedrooms, bathrooms, floor_area, land_area')
      .or('photos.is.null,photos.eq.{},summary.is.null,bedrooms.is.null,bathrooms.is.null,floor_area.is.null')
      .limit(15); // Reduced batch size for more detailed processing

    if (queryError) {
      console.error('Error querying listings to enrich:', queryError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to query listings: ' + queryError.message,
        enriched: 0,
        skipped: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!listingsToEnrich || listingsToEnrich.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        enriched: 0,
        skipped: 0,
        message: 'No listings found that need enrichment'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${listingsToEnrich.length} listings to enrich with detailed data`);

    let enriched = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const listing of listingsToEnrich) {
      try {
        console.log(`Enriching listing with enhanced details: ${listing.address} (${listing.source_url})`);

        // Use AgentQL to scrape the individual property page with enhanced details
        const enhancedData = await agentqlClient.scrapePropertyPage(listing.source_url);
        
        if (!enhancedData) {
          skipped++;
          console.log(`No enhanced data found for: ${listing.address}`);
          continue;
        }

        // Prepare update object with all available enhanced data
        const updateData: any = {
          updated_at: new Date().toISOString()
        };

        // Update photos if found
        if (enhancedData.photos && enhancedData.photos.length > 0) {
          updateData.photos = enhancedData.photos;
        }

        // Update description/summary if found
        if (enhancedData.description && !listing.summary) {
          updateData.summary = enhancedData.description;
        }

        // Update property details if missing
        if (enhancedData.bedrooms && !listing.bedrooms) {
          updateData.bedrooms = enhancedData.bedrooms;
        }
        if (enhancedData.bathrooms && !listing.bathrooms) {
          updateData.bathrooms = enhancedData.bathrooms;
        }
        if (enhancedData.floor_area && !listing.floor_area) {
          updateData.floor_area = enhancedData.floor_area;
        }
        if (enhancedData.land_area && !listing.land_area) {
          updateData.land_area = enhancedData.land_area;
        }

        // Check if we have any meaningful updates
        const hasUpdates = Object.keys(updateData).length > 1; // More than just updated_at
        
        if (!hasUpdates) {
          skipped++;
          console.log(`No meaningful updates found for: ${listing.address}`);
          continue;
        }

        // Update the listing with the enhanced data
        const { error: updateError } = await supabase
          .from('scraped_listings')
          .update(updateData)
          .eq('id', listing.id);

        if (updateError) {
          console.error('Error updating listing:', updateError);
          errors.push(`Failed to update ${listing.address}: ${updateError.message}`);
        } else {
          enriched++;
          console.log(`Successfully enriched listing: ${listing.address} with enhanced details`, {
            photos: enhancedData.photos?.length || 0,
            hasDescription: !!enhancedData.description,
            bedrooms: enhancedData.bedrooms,
            bathrooms: enhancedData.bathrooms,
            floorArea: enhancedData.floor_area,
            landArea: enhancedData.land_area
          });
        }

        // Rate limiting to avoid overwhelming the target site
        await new Promise(resolve => setTimeout(resolve, 3000));

      } catch (error) {
        console.error('Error enriching listing:', error);
        errors.push(`Error enriching ${listing.address}: ${error.message}`);
        skipped++;
      }
    }

    console.log(`Property enrichment complete: ${enriched} enriched, ${skipped} skipped, ${errors.length} errors`);

    return new Response(JSON.stringify({
      success: enriched > 0 || (enriched === 0 && skipped > 0),
      enriched: enriched,
      skipped: skipped,
      message: `Property enrichment complete: ${enriched} properties enriched with enhanced details, ${skipped} skipped`,
      errors: errors.length > 0 ? errors : undefined,
      totalProcessed: listingsToEnrich.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in property enrichment:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      enriched: 0,
      skipped: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

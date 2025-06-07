
// deno-lint-ignore no-explicit-any
// @ts-ignore: Deno global is available in Edge Functions
declare const Deno: any;
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

import { corsHeaders } from '../scrape-trademe/config.ts';
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
    console.log('Property data enrichment started');

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

    // Find listings with missing or empty photos
    const { data: listingsToEnrich, error: queryError } = await supabase
      .from('scraped_listings')
      .select('id, source_url, address, photos')
      .or('photos.is.null,photos.eq.{}')
      .limit(20); // Process in batches to avoid timeouts

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

    console.log(`Found ${listingsToEnrich.length} listings to enrich`);

    let enriched = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const listing of listingsToEnrich) {
      try {
        console.log(`Enriching listing: ${listing.address} (${listing.source_url})`);

        // Use AgentQL to scrape the individual property page
        const propertyData = await agentqlClient.scrapePropertyPage(listing.source_url);
        
        if (!propertyData || !propertyData.photos || propertyData.photos.length === 0) {
          skipped++;
          console.log(`No additional data found for: ${listing.address}`);
          continue;
        }

        // Update the listing with the new photo data
        const { error: updateError } = await supabase
          .from('scraped_listings')
          .update({
            photos: propertyData.photos,
            updated_at: new Date().toISOString()
          })
          .eq('id', listing.id);

        if (updateError) {
          console.error('Error updating listing:', updateError);
          errors.push(`Failed to update ${listing.address}: ${updateError.message}`);
        } else {
          enriched++;
          console.log(`Successfully enriched listing: ${listing.address} with ${propertyData.photos.length} photos`);
        }

        // Rate limiting to avoid overwhelming the target site
        await new Promise(resolve => setTimeout(resolve, 2000));

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
      message: `Property enrichment complete: ${enriched} properties enriched, ${skipped} skipped`,
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

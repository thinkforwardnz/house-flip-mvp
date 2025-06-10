import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

import { ApifyClient } from '../shared/apify-client.ts';
import { ONEROOF_ACTOR_ID, buildOneRoofApifyInput, processOneRoofResults } from './apify-config.ts';
import { errorResponse } from '../shared/error-response.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const apifyApiToken = Deno.env.get('APIFY_API_TOKEN');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filters = {} } = await req.json();
    console.log('Starting OneRoof scraping with Apify');

    if (!apifyApiToken) {
      throw new Error('Apify API token not configured');
    }

    // Initialize Apify client
    const apifyClient = new ApifyClient(apifyApiToken);
    
    // Build input for OneRoof actor
    const actorInput = buildOneRoofApifyInput(filters);
    console.log('OneRoof Apify input:', JSON.stringify(actorInput, null, 2));

    // Run the actor and get results
    const apifyResults = await apifyClient.runActorAndGetResults(ONEROOF_ACTOR_ID, actorInput);
    console.log(`Received ${apifyResults.length} properties from Apify`);

    // Process the results
    const properties = processOneRoofResults(apifyResults);

    let savedCount = 0;
    let skippedCount = 0;

    for (const property of properties) {
      try {
        // Check if listing already exists
        const { data: existing } = await supabase
          .from('scraped_listings')
          .select('id')
          .eq('source_url', property.source_url)
          .single();

        if (existing) {
          skippedCount++;
          continue;
        }

        // Insert new listing
        const { data: newListing, error: insertError } = await supabase
          .from('scraped_listings')
          .insert({
            source_site: 'OneRoof',
            source_url: property.source_url,
            address: property.address,
            suburb: property.suburb,
            city: 'Wellington',
            price: property.price,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            floor_area: property.floor_area,
            land_area: property.land_area,
            summary: property.summary,
            photos: property.photos,
            listing_date: property.listing_date,
            status: 'new'
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting listing:', insertError);
          continue;
        }

        // Trigger AI analysis for new listing
        if (newListing) {
          analyzeListingInBackground(newListing);
        }
        
        savedCount++;

      } catch (error) {
        console.error('Error processing property:', error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      scraped: savedCount,
      skipped: skippedCount,
      total: properties.length,
      source: 'OneRoof'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scrape-oneroof function:', error);
    return errorResponse(error.message || 'scrape-oneroof failed', 500);
  }
});

async function analyzeListingInBackground(listing: any) {
  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/analyze-property`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listingId: listing.id,
        listingData: listing
      }),
    });

    if (!response.ok) {
      console.error('Failed to analyze listing:', await response.text());
    } else {
      console.log(`Successfully queued analysis for listing: ${listing.address}`);
    }
  } catch (error) {
    console.error('Error triggering AI analysis:', error);
  }
}

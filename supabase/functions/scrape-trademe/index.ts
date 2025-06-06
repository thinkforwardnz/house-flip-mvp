
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

import { corsHeaders } from './config.ts';
import { calculateFlipPotential } from './scoring.ts';
import { ScrapingFilters } from './types.ts';
import { ApifyClient } from '../shared/apify-client.ts';
import { TRADEME_ACTOR_ID, buildTradeeMeApifyInput, processTradeeMeResults } from './apify-config.ts';

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
    const { filters = {} }: { filters: ScrapingFilters } = await req.json();
    console.log('Starting TradeMe scraping with Apify for Wellington region');

    if (!apifyApiToken) {
      throw new Error('Apify API token not configured');
    }

    // Initialize Apify client
    const apifyClient = new ApifyClient(apifyApiToken);
    
    // Build input for TradeMe actor
    const actorInput = buildTradeeMeApifyInput(filters);
    console.log('TradeMe Apify input:', JSON.stringify(actorInput, null, 2));

    // Run the actor and get results
    const apifyResults = await apifyClient.runActorAndGetResults(TRADEME_ACTOR_ID, actorInput);
    console.log(`Received ${apifyResults.length} properties from Apify`);

    // Process the results
    const properties = processTradeeMeResults(apifyResults);
    
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

        // Calculate flip potential score
        const flipScore = calculateFlipPotential(property);

        // Insert new listing
        const { data: newListing, error: insertError } = await supabase
          .from('scraped_listings')
          .insert({
            source_site: 'TradeMe',
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
            status: 'new',
            ai_score: flipScore
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting listing:', insertError);
          continue;
        }

        // Trigger AI analysis for high-potential properties
        if (newListing && flipScore >= 60) {
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
      source: 'TradeMe'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scrape-trademe function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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

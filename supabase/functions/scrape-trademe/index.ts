
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../shared/cors.ts';
import { processTrademeListing } from './data-processor.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const APIFY_API_TOKEN = Deno.env.get('APIFY_API_TOKEN');
const APIFY_ACTOR_ID = 'petfinder~trademe-scraper';

if (!APIFY_API_TOKEN) {
  console.warn('Apify API token is missing!');
}

// Helper function to run the Apify actor
async function runApifyActor(filters: any) {
  const payload = {
    token: APIFY_API_TOKEN,
    actorId: APIFY_ACTOR_ID,
    input: {
      ...filters,
      extendOutputFunction: `async ({ item, label, request, log }) => {
        // Add some custom fields based on the URL
        const url = request.url;
        item.url = url;
        item.source_url = url;
        return item;
      }`,
    },
  };

  const response = await fetch('https://api.apify.com/v2/runs', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const run = await response.json();
  console.log('Apify run started:', run.data.id);

  // Wait for the actor to finish
  const runResult = await waitForApifyRun(run.data.id);
  return runResult;
}

// Helper function to wait for the Apify actor to finish
async function waitForApifyRun(runId: string) {
  while (true) {
    const response = await fetch(`https://api.apify.com/v2/runs/${runId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const run = await response.json();

    if (run.data.status === 'SUCCEEDED') {
      console.log('Apify run succeeded:', runId);
      return {
        defaultDatasetId: run.data.defaultDatasetId,
        defaultDatasetItems: await getDatasetItems(run.data.defaultDatasetId),
      };
    } else if (run.data.status === 'FAILED' || run.data.status === 'ABORTED') {
      console.error('Apify run failed:', runId, run.data.error);
      throw new Error(`Apify run failed: ${run.data.error}`);
    } else {
      console.log('Apify run still running, status:', run.data.status);
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
    }
  }
}

// Helper function to get items from the Apify dataset
async function getDatasetItems(datasetId: string) {
  const response = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?clean=1`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const items = await response.json();
  console.log(`Got ${items.length} items from dataset ${datasetId}`);
  return items;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { filters = {} } = await req.json();
    console.log('Starting Trade Me scraping with filters:', filters);

    // Run the Apify actor
    const runResult = await runApifyActor(filters);

    // Process the scraped data with improved location parsing
    const processedListings = [];
    
    if (runResult.defaultDatasetItems && Array.isArray(runResult.defaultDatasetItems)) {
      for (const item of runResult.defaultDatasetItems) {
        const processed = processTrademeListing(item);
        if (processed) {
          processedListings.push(processed);
        }
      }
    }

    console.log(`Processed ${processedListings.length} Trade Me listings`);

    // Save to database with improved district information
    const savedListings = [];
    
    for (const listing of processedListings) {
      try {
        // Check if listing already exists
        const { data: existing } = await supabase
          .from('scraped_listings')
          .select('id')
          .eq('source_url', listing.source_url)
          .single();

        if (!existing) {
          const { data: saved, error } = await supabase
            .from('scraped_listings')
            .insert({
              source_url: listing.source_url,
              source_site: listing.source_site,
              address: listing.address,
              suburb: listing.suburb,
              city: listing.city,
              district: listing.district, // Now properly set
              price: listing.price,
              summary: listing.summary,
              bedrooms: listing.bedrooms,
              bathrooms: listing.bathrooms,
              floor_area: listing.floor_area,
              land_area: listing.land_area,
              photos: listing.photos,
              listing_date: listing.listing_date,
              date_scraped: new Date().toISOString(),
              status: 'new'
            })
            .select()
            .single();

          if (error) {
            console.error('Error saving listing:', error);
          } else {
            savedListings.push(saved);
            console.log(`Saved listing with district: ${listing.district} for suburb: ${listing.suburb}`);
          }
        } else {
          console.log('Listing already exists, skipping:', listing.source_url);
        }
      } catch (error) {
        console.error('Error processing listing:', error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Scraped ${processedListings.length} listings, saved ${savedListings.length} new ones`,
      total_processed: processedListings.length,
      total_saved: savedListings.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Trade Me scraping error:', error);
    return new Response(JSON.stringify({
      error: 'Scraping failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

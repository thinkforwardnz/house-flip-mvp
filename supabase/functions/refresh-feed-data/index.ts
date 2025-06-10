import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../shared/cors.ts';
import { AgentQLPropertyClient } from '../shared/agentql-property-client.ts';
import { errorResponse } from '../shared/error-response.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting refresh feed data process for missing basic information...');

    // Get listings that need basic data completion (missing photos or other basic info)
    const { data: incompleteListings, error: fetchError } = await supabase
      .from('scraped_listings')
      .select('id, source_url, address, photos')
      .or('photos.is.null,photos.eq.{}')
      .order('date_scraped', { ascending: false })
      .limit(20);

    if (fetchError) {
      throw fetchError;
    }

    if (!incompleteListings || incompleteListings.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No listings need basic data completion',
        completed: 0,
        skipped: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${incompleteListings.length} listings needing basic data completion`);

    // Initialize property client for individual page scraping
    const propertyClient = new AgentQLPropertyClient();
    
    let completed = 0;
    let skipped = 0;

    for (const listing of incompleteListings) {
      try {
        console.log(`Completing basic data for: ${listing.address}`);

        // Scrape the individual property page for missing basic data
        const propertyData = await propertyClient.scrapePropertyPage(listing.source_url);

        if (propertyData && propertyData.photos && propertyData.photos.length > 0) {
          // Update only the missing basic fields
          const { error: updateError } = await supabase
            .from('scraped_listings')
            .update({
              photos: propertyData.photos,
              updated_at: new Date().toISOString()
            })
            .eq('id', listing.id);

          if (updateError) {
            console.error(`Error updating listing ${listing.id}:`, updateError);
            skipped++;
          } else {
            console.log(`Completed basic data for: ${listing.address}`);
            completed++;
          }
        } else {
          console.log(`No additional basic data found for: ${listing.address}`);
          skipped++;
        }

        // Rate limiting
        await propertyClient.rateLimitDelay();

      } catch (error) {
        console.error(`Error completing basic data for ${listing.address}:`, error);
        skipped++;
      }
    }

    console.log(`Feed refresh complete: ${completed} completed, ${skipped} skipped`);

    return new Response(JSON.stringify({
      success: true,
      message: `Feed refresh complete: ${completed} listings updated with missing basic data`,
      completed,
      skipped,
      total_processed: incompleteListings.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Refresh feed data error:', error);
    return errorResponse(error.message || 'refresh-feed-data failed', 500);
  }
});


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
    console.log('Starting refresh feed data process for unified properties with missing basic information...');

    // Get properties that need basic data completion (missing photos or other basic info)
    const { data: incompleteProperties, error: fetchError } = await supabase
      .from('unified_properties')
      .select('id, source_url, address, photos')
      .or('photos.is.null,photos.eq.{}')
      .order('date_scraped', { ascending: false })
      .limit(20);

    if (fetchError) {
      throw fetchError;
    }

    if (!incompleteProperties || incompleteProperties.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No properties need basic data completion',
        completed: 0,
        skipped: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${incompleteProperties.length} properties needing basic data completion`);

    // Initialize property client for individual page scraping
    const propertyClient = new AgentQLPropertyClient();
    
    let completed = 0;
    let skipped = 0;

    for (const property of incompleteProperties) {
      try {
        console.log(`Completing basic data for: ${property.address}`);

        // Scrape the individual property page for missing basic data
        const propertyData = await propertyClient.scrapePropertyPage(property.source_url);

        if (propertyData && propertyData.photos && propertyData.photos.length > 0) {
          // Update only the missing basic fields
          const { error: updateError } = await supabase
            .from('unified_properties')
            .update({
              photos: propertyData.photos,
              updated_at: new Date().toISOString()
            })
            .eq('id', property.id);

          if (updateError) {
            console.error(`Error updating property ${property.id}:`, updateError);
            skipped++;
          } else {
            console.log(`Completed basic data for: ${property.address}`);
            completed++;
          }
        } else {
          console.log(`No additional basic data found for: ${property.address}`);
          skipped++;
        }

        // Rate limiting
        await propertyClient.rateLimitDelay();

      } catch (error) {
        console.error(`Error completing basic data for ${property.address}:`, error);
        skipped++;
      }
    }

    console.log(`Feed refresh complete: ${completed} completed, ${skipped} skipped`);

    return new Response(JSON.stringify({
      success: true,
      message: `Feed refresh complete: ${completed} properties updated with missing basic data`,
      completed,
      skipped,
      total_processed: incompleteProperties.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Refresh feed data error:', error);
    return errorResponse(error.message || 'refresh-feed-data failed', 500);
  }
});


import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../shared/cors.ts';
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
    const { listingId } = await req.json();

    if (!listingId) {
      return errorResponse('Listing ID is required', 400);
    }

    console.log('Scraped property enrichment request redirected to unified processor');

    // Get the listing from scraped_listings table
    const { data: listing, error: fetchError } = await supabase
      .from('scraped_listings')
      .select('id, source_url, address')
      .eq('id', listingId)
      .single();

    if (fetchError || !listing) {
      return errorResponse('Listing not found', 404);
    }

    // Check if this property exists in unified_properties
    const { data: unifiedProperty } = await supabase
      .from('unified_properties')
      .select('id')
      .eq('source_url', listing.source_url)
      .maybeSingle();

    if (unifiedProperty) {
      // Use unified data processor for enrichment
      const { data, error } = await supabase.functions.invoke('unified-data-processor', {
        body: {
          mode: 'enrich',
          propertyId: unifiedProperty.id
        }
      });

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify({
        success: data.success,
        message: data.message,
        listingId: listingId,
        enriched_data: {
          has_description: true,
          photos_count: 0
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      return errorResponse('Property not found in unified properties', 404);
    }

  } catch (error) {
    console.error('Property enrichment error:', error);
    return errorResponse(error.message || 'Property enrichment failed', 500);
  }
});

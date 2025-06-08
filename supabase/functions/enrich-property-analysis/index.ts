
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

import { corsHeaders } from '../shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const linzApiKey = Deno.env.get('LINZ_API_KEY');
const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dealId, address, coordinates } = await req.json();
    console.log(`Enriching property analysis for deal: ${dealId}, address: ${address}`);

    if (!linzApiKey || !googleMapsApiKey) {
      throw new Error('LINZ_API_KEY or GOOGLE_MAPS_API_KEY not configured');
    }

    let enrichedData: any = {};

    // 1. Get LINZ property data
    try {
      console.log('Fetching LINZ property data...');
      const linzResponse = await fetch(
        `https://data.linz.govt.nz/services/api/v1/services/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=layer-50804&outputFormat=application/json&cql_filter=WITHIN(shape,POINT(${coordinates?.lng || 174.7633} ${coordinates?.lat || -36.8485}))`,
        {
          headers: {
            'Authorization': `key ${linzApiKey}`
          }
        }
      );

      if (linzResponse.ok) {
        const linzData = await linzResponse.json();
        enrichedData.linz = {
          propertyDetails: linzData.features?.[0]?.properties || {},
          boundaryData: linzData.features?.[0]?.geometry || null
        };
        console.log('LINZ data fetched successfully');
      }
    } catch (error) {
      console.error('Error fetching LINZ data:', error);
      enrichedData.linz = { error: error.message };
    }

    // 2. Get Google Maps neighbourhood data
    try {
      console.log('Fetching Google Maps data...');
      
      // Get place details
      const placeSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(address)}&key=${googleMapsApiKey}`;
      const placeResponse = await fetch(placeSearchUrl);
      
      if (placeResponse.ok) {
        const placeData = await placeResponse.json();
        const place = placeData.results?.[0];
        
        if (place) {
          // Get nearby amenities
          const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${place.geometry.location.lat},${place.geometry.location.lng}&radius=1000&type=point_of_interest&key=${googleMapsApiKey}`;
          const nearbyResponse = await fetch(nearbyUrl);
          const nearbyData = await nearbyResponse.json();

          enrichedData.googleMaps = {
            placeId: place.place_id,
            rating: place.rating,
            vicinity: place.vicinity,
            geometry: place.geometry,
            nearbyAmenities: nearbyData.results?.slice(0, 10) || []
          };
        }
        console.log('Google Maps data fetched successfully');
      }
    } catch (error) {
      console.error('Error fetching Google Maps data:', error);
      enrichedData.googleMaps = { error: error.message };
    }

    // 3. Calculate walkability and neighbourhood scores
    const walkabilityScore = enrichedData.googleMaps?.nearbyAmenities?.length 
      ? Math.min(100, enrichedData.googleMaps.nearbyAmenities.length * 10) 
      : 50;

    enrichedData.scores = {
      walkability: walkabilityScore,
      amenities: enrichedData.googleMaps?.nearbyAmenities?.length || 0,
      accessibility: enrichedData.googleMaps?.rating ? enrichedData.googleMaps.rating * 20 : 70
    };

    // 4. Update the deal with enriched data
    const { error: updateError } = await supabase
      .from('deals')
      .update({
        analysis_data: enrichedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', dealId);

    if (updateError) {
      console.error('Error updating deal with enriched data:', updateError);
      throw updateError;
    }

    console.log(`Property enrichment completed for deal: ${dealId}`);

    return new Response(JSON.stringify({
      success: true,
      data: enrichedData,
      message: 'Property data enriched successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in property enrichment:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filters = {} } = await req.json();
    console.log('Starting TradeMe scraping with filters:', filters);

    // For demo purposes, we'll simulate scraping with mock data
    // In production, this would use actual web scraping
    const mockListings = generateMockListings(filters);
    
    let savedCount = 0;
    let skippedCount = 0;

    for (const listing of mockListings) {
      try {
        // Check if listing already exists (by URL)
        const { data: existing } = await supabase
          .from('scraped_listings')
          .select('id')
          .eq('source_url', listing.source_url)
          .single();

        if (existing) {
          skippedCount++;
          continue;
        }

        // Insert new listing
        const { data: newListing, error: insertError } = await supabase
          .from('scraped_listings')
          .insert({
            source_site: 'TradeMe',
            source_url: listing.source_url,
            address: listing.address,
            suburb: listing.suburb,
            city: listing.city,
            price: listing.price,
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            floor_area: listing.floor_area,
            land_area: listing.land_area,
            summary: listing.summary,
            photos: listing.photos,
            listing_date: listing.listing_date,
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
          EdgeRuntime.waitUntil(analyzeListingInBackground(newListing));
          savedCount++;
        }

      } catch (error) {
        console.error('Error processing listing:', error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      scraped: savedCount,
      skipped: skippedCount,
      total: mockListings.length
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

function generateMockListings(filters: any) {
  const suburbs = ['Ponsonby', 'Mt Eden', 'Newmarket', 'Parnell', 'Grey Lynn', 'Kingsland', 'Sandringham'];
  const listings = [];

  for (let i = 0; i < 10; i++) {
    const suburb = suburbs[Math.floor(Math.random() * suburbs.length)];
    const bedrooms = Math.floor(Math.random() * 4) + 2;
    const bathrooms = Math.floor(Math.random() * 3) + 1;
    const price = Math.floor(Math.random() * 800000) + 400000;
    
    listings.push({
      source_url: `https://trademe.co.nz/property/residential-property-for-sale/auction-${Date.now()}-${i}`,
      address: `${Math.floor(Math.random() * 100) + 1} ${['Queen', 'King', 'Victoria', 'Albert', 'George'][Math.floor(Math.random() * 5)]} Street`,
      suburb: suburb,
      city: 'Auckland',
      price: price,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      floor_area: Math.floor(Math.random() * 100) + 80,
      land_area: Math.floor(Math.random() * 400) + 200,
      summary: `Well-presented ${bedrooms} bedroom home in desirable ${suburb}. Great potential for renovation and value add. Close to amenities and transport.`,
      photos: [`https://picsum.photos/400/300?random=${i}`],
      listing_date: new Date().toISOString().split('T')[0]
    });
  }

  return listings;
}

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

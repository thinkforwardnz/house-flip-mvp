
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

const firecrawlApiKey = Deno.env.get('FIRECRAWL_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filters = {} } = await req.json();
    console.log('Starting OneRoof scraping with Firecrawl');

    if (!firecrawlApiKey) {
      throw new Error('Firecrawl API key not configured');
    }

    // Build search URL for Wellington region
    const searchUrl = buildOneRoofSearchUrl(filters);
    console.log('Scraping OneRoof URL:', searchUrl);

    // Use Firecrawl to scrape
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: searchUrl,
        pageOptions: {
          extractorOptions: {
            mode: 'llm-extraction',
            extractionPrompt: `Extract property listings from this OneRoof page. For each property, extract:
              - address (full street address)
              - price (as number, convert from text if needed)
              - bedrooms (number)
              - bathrooms (number)  
              - floor_area (square meters)
              - land_area (square meters)
              - description (property description)
              - listing_url (link to property details)
              - photos (array of image URLs)
              Return as JSON array with key "properties".`
          }
        }
      }),
    });

    if (!firecrawlResponse.ok) {
      throw new Error(`Firecrawl API error: ${firecrawlResponse.status}`);
    }

    const scrapeData = await firecrawlResponse.json();
    const extractedData = scrapeData.data?.extract?.properties || [];
    
    console.log(`Extracted ${extractedData.length} properties from OneRoof`);

    let savedCount = 0;
    let skippedCount = 0;

    for (const propertyData of extractedData) {
      try {
        const property = processOneRoofProperty(propertyData);
        
        if (!property) continue;

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
            listing_date: new Date().toISOString().split('T')[0],
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
      total: extractedData.length,
      source: 'OneRoof'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scrape-oneroof function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildOneRoofSearchUrl(filters: any): string {
  const baseUrl = 'https://www.oneroof.co.nz/for-sale/wellington';
  const params = new URLSearchParams();
  
  if (filters.minPrice) params.append('price_min', filters.minPrice);
  if (filters.maxPrice) params.append('price_max', filters.maxPrice);
  if (filters.minBeds) params.append('bedrooms_min', filters.minBeds);
  
  return `${baseUrl}?${params.toString()}`;
}

function processOneRoofProperty(data: any) {
  try {
    if (!data.address || !data.price) return null;

    return {
      source_url: data.listing_url || `https://www.oneroof.co.nz/property/${Date.now()}`,
      address: data.address,
      suburb: extractSuburbFromAddress(data.address),
      price: parsePrice(data.price),
      bedrooms: parseInt(data.bedrooms) || null,
      bathrooms: parseFloat(data.bathrooms) || null,
      floor_area: parseFloat(data.floor_area) || null,
      land_area: parseFloat(data.land_area) || null,
      summary: data.description || '',
      photos: Array.isArray(data.photos) ? data.photos : []
    };
  } catch (error) {
    console.error('Error processing OneRoof property:', error);
    return null;
  }
}

function extractSuburbFromAddress(address: string): string {
  const wellingtonSuburbs = [
    'Wellington Central', 'Kelburn', 'Mount Victoria', 'Thorndon', 'Te Aro', 'Newtown', 'Island Bay',
    'Petone', 'Lower Hutt', 'Wainuiomata', 'Eastbourne', 'Stokes Valley',
    'Upper Hutt', 'Totara Park', 'Heretaunga', 'Trentham',
    'Porirua', 'Whitby', 'Paremata', 'Plimmerton',
    'Paraparaumu', 'Waikanae', 'Otaki'
  ];

  for (const suburb of wellingtonSuburbs) {
    if (address.toLowerCase().includes(suburb.toLowerCase())) {
      return suburb;
    }
  }
  return 'Wellington';
}

function parsePrice(priceStr: string | number): number {
  if (typeof priceStr === 'number') return priceStr;
  const cleaned = String(priceStr).replace(/[^0-9]/g, '');
  return parseInt(cleaned) || 0;
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

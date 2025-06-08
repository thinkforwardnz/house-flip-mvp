
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../shared/cors.ts';
import { AgentQLSearchClient } from '../shared/agentql-search-client.ts';
import { processTrademeListing } from './data-processor.ts';
import { buildTradeeMeSearchUrl } from './url-builder.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { filters = {} } = await req.json();
    console.log('Starting Trade Me basic scraping with filters:', filters);

    // Initialize search client only
    const searchClient = new AgentQLSearchClient();
    
    // Build search URL based on filters
    const searchUrl = buildTradeeMeSearchUrl(filters);
    console.log('Built search URL:', searchUrl);

    // Scrape search results for basic property information only
    console.log('Scraping search results for basic property information...');
    const searchResults = await searchClient.scrapeSearchResults(searchUrl);
    
    if (!searchResults?.data?.properties || !Array.isArray(searchResults.data.properties)) {
      console.error('No properties found in search results');
      return new Response(JSON.stringify({
        success: false,
        error: 'No properties found in search results',
        total_processed: 0,
        total_saved: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${searchResults.data.properties.length} properties in search results`);

    // Process each property with basic information only
    const processedListings = [];
    const maxListings = 50;
    
    for (let i = 0; i < Math.min(searchResults.data.properties.length, maxListings); i++) {
      const property = searchResults.data.properties[i];
      
      try {
        console.log(`Processing basic property ${i + 1}/${Math.min(searchResults.data.properties.length, maxListings)}: ${property.listingaddress}`);
        
        // Basic rate limiting between requests
        if (i > 0 && i % 10 === 0) {
          await searchClient.rateLimitDelay();
        }

        // Process with basic search data only
        const processed = processTrademeListing(property);

        if (processed) {
          processedListings.push(processed);
        }

      } catch (error) {
        console.error(`Error processing basic property ${property.listingaddress}:`, error);
        // Continue with next property
      }
    }

    console.log(`Successfully processed ${processedListings.length} Trade Me listings with basic information`);

    // Save to database with basic fields only
    const savedListings = [];
    
    for (const listing of processedListings) {
      try {
        // Check if listing already exists
        const { data: existing } = await supabase
          .from('scraped_listings')
          .select('id')
          .eq('source_url', listing.source_url)
          .maybeSingle();

        if (!existing) {
          const { data: saved, error } = await supabase
            .from('scraped_listings')
            .insert({
              source_url: listing.source_url,
              source_site: listing.source_site,
              address: listing.address,
              suburb: listing.suburb,
              city: listing.city,
              district: listing.district,
              price: listing.price || 0,
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
            console.log(`Saved basic listing: ${listing.address}`);
          }
        } else {
          console.log('Listing already exists, skipping:', listing.source_url);
        }
      } catch (error) {
        console.error('Error processing listing for database:', error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Basic scraping complete: found ${processedListings.length} listings, saved ${savedListings.length} new ones`,
      total_processed: processedListings.length,
      total_saved: savedListings.length,
      search_url: searchUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Trade Me basic scraping error:', error);
    return new Response(JSON.stringify({
      error: 'Basic scraping failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

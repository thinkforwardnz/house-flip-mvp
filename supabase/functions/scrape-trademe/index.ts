
// deno-lint-ignore no-explicit-any
// @ts-ignore: Deno global is available in Edge Functions
declare const Deno: any;
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

import { corsHeaders } from './config.ts';
import { ScrapingFilters } from './types.ts';
import { AgentQLClient } from '../shared/agentql-client.ts';
import { buildTradeeMeSearchUrl, extractSuburb } from './url-builder.ts';
import { processSearchResults } from './data-processor.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filters = {} }: { filters: ScrapingFilters } = await req.json();
    console.log('TradeMe scraper started with filters:', JSON.stringify(filters, null, 2));

    // Check if AgentQL API key is configured
    const agentqlKey = Deno.env.get('AGENTQL_API_KEY');
    if (!agentqlKey) {
      console.error('AGENTQL_API_KEY not configured in environment');
      return new Response(JSON.stringify({
        success: false,
        error: 'AgentQL API key not configured',
        scraped: 0,
        skipped: 0,
        source: 'TradeMe'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize AgentQL client
    let agentqlClient;
    try {
      agentqlClient = new AgentQLClient();
      console.log('AgentQL client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AgentQL client:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to initialize AgentQL client: ' + error.message,
        scraped: 0,
        skipped: 0,
        source: 'TradeMe'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build TradeMe search URL and discover listing metadata
    const searchUrl = buildTradeeMeSearchUrl(filters);
    console.log('Discovering listings from:', searchUrl);

    let searchResults;
    try {
      searchResults = await agentqlClient.scrapeSearchResults(searchUrl);
      console.log('AgentQL search results received:', JSON.stringify(searchResults, null, 2));
    } catch (error) {
      console.error('AgentQL search query failed:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'AgentQL scraping failed: ' + error.message,
        scraped: 0,
        skipped: 0,
        source: 'TradeMe',
        url: searchUrl
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process search results to get basic listing metadata
    const listings = processSearchResults(searchResults);
    console.log(`Discovered ${listings.length} listings:`, listings);

    if (listings.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        scraped: 0,
        skipped: 0,
        source: 'TradeMe',
        message: 'No listings found in search results',
        searchUrl: searchUrl
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Store listings in database
    let scraped = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const listing of listings) {
      try {
        console.log(`Processing listing: ${listing.address} (${listing.url})`);
        
        // Check if listing already exists
        const { data: existing, error: checkError } = await supabase
          .from('scraped_listings')
          .select('id')
          .eq('source_url', listing.url)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking existing listing:', checkError);
          errors.push(`Failed to check existing listing ${listing.address}: ${checkError.message}`);
          continue;
        }

        if (existing) {
          skipped++;
          console.log(`Skipped existing listing: ${listing.address}`);
          continue;
        }

        // Extract suburb from address
        const suburb = extractSuburb(listing.address);
        console.log(`Extracted suburb "${suburb}" from address "${listing.address}"`);

        // Prepare photos array with featured image
        const photos: string[] = [];
        if (listing.featuredImage) {
          // Ensure featured image URL is absolute
          let imageUrl = listing.featuredImage;
          if (imageUrl.startsWith('/')) {
            imageUrl = `https://www.trademe.co.nz${imageUrl}`;
          }
          photos.push(imageUrl);
          console.log(`Added featured image: ${imageUrl}`);
        }

        // Insert new listing with proper default values including featured image
        const listingData = {
          source_url: listing.url,
          address: listing.address,
          suburb: suburb,
          city: 'Wellington',
          price: 0, // Required field with default
          source_site: 'TradeMe',
          summary: `Property listing from TradeMe: ${listing.address}`,
          status: 'new' as const,
          bedrooms: null,
          bathrooms: null,
          floor_area: null,
          land_area: null,
          photos: photos.length > 0 ? photos : null,
          listing_date: null,
          ai_score: null,
          ai_est_profit: null,
          ai_reno_cost: null,
          ai_arv: null,
          flip_potential: null,
          ai_confidence: null
        };

        console.log('Inserting listing data:', listingData);

        const { data: insertedListing, error: insertError } = await supabase
          .from('scraped_listings')
          .insert(listingData)
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting listing:', insertError);
          errors.push(`Failed to save ${listing.address}: ${insertError.message}`);
        } else {
          scraped++;
          console.log(`Successfully saved listing: ${listing.address} with ID: ${insertedListing.id} and ${photos.length} photos`);
        }
      } catch (error) {
        console.error('Error processing listing:', error);
        errors.push(`Error processing ${listing.address}: ${error.message}`);
      }
    }

    console.log(`TradeMe scraping complete: ${scraped} saved, ${skipped} skipped, ${errors.length} errors`);

    // Log final results for debugging
    const finalResults = {
      success: scraped > 0 || (scraped === 0 && skipped > 0),
      scraped: scraped,
      skipped: skipped,
      source: 'TradeMe',
      url: searchUrl,
      message: `TradeMe scraping complete: ${scraped} new listings saved, ${skipped} duplicates skipped`,
      errors: errors.length > 0 ? errors : undefined,
      totalProcessed: listings.length
    };

    console.log('Final scraping results:', finalResults);

    return new Response(JSON.stringify(finalResults), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in TradeMe scraper:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      scraped: 0,
      skipped: 0,
      source: 'TradeMe'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

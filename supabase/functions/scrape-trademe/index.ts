
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
    console.log('Stage 1: TradeMe Search Results Scraping with AgentQL');
    console.log('Filters:', JSON.stringify(filters, null, 2));

    // Check if AgentQL API key is configured
    const agentqlKey = Deno.env.get('AGENTQL_API_KEY');
    if (!agentqlKey) {
      console.error('AGENTQL_API_KEY not configured in environment');
      return new Response(JSON.stringify({
        success: false,
        error: 'AgentQL API key not configured',
        discovered: 0,
        total: 0,
        source: 'TradeMe',
        stage: 'search-results'
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
        discovered: 0,
        total: 0,
        source: 'TradeMe',
        stage: 'search-results'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Test AgentQL connection
    try {
      console.log('Testing AgentQL API connectivity...');
      const testResult = await agentqlClient.testConnection();
      console.log('AgentQL test successful:', testResult);
    } catch (testError) {
      console.error('AgentQL connectivity test failed:', testError);
      return new Response(JSON.stringify({
        success: false,
        error: 'AgentQL API connectivity failed: ' + testError.message,
        discovered: 0,
        total: 0,
        source: 'TradeMe',
        stage: 'search-results',
        details: 'Check API key and endpoint configuration'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Stage 1: Build TradeMe search URL and get listing metadata
    const searchUrl = buildTradeeMeSearchUrl(filters);
    console.log('Stage 1: Scraping search results from:', searchUrl);

    let searchResults;
    try {
      searchResults = await agentqlClient.scrapeSearchResults(searchUrl);
      console.log('AgentQL search results received:', !!searchResults);
    } catch (error) {
      console.error('AgentQL search query failed:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'AgentQL scraping failed: ' + error.message,
        discovered: 0,
        total: 0,
        source: 'TradeMe',
        stage: 'search-results',
        url: searchUrl,
        details: 'Search query failed with /query-data endpoint'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process search results to get basic listing metadata
    const listings = processSearchResults(searchResults);
    console.log(`Stage 1: Found ${listings.length} listings with basic metadata`);

    if (listings.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        discovered: 0,
        total: 0,
        source: 'TradeMe',
        stage: 'search-results',
        message: 'No listings found in search results',
        searchResponse: searchResults,
        searchUrl: searchUrl
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Stage 1: Save discovered listings to database
    let savedCount = 0;
    let skippedCount = 0;

    for (const listing of listings) {
      try {
        // Check if listing already exists
        const { data: existing } = await supabase
          .from('scraped_listings')
          .select('id')
          .eq('source_url', listing.url)
          .single();

        if (existing) {
          skippedCount++;
          console.log(`Skipping existing listing: ${listing.address}`);
          continue;
        }

        // Insert new discovered listing with basic metadata
        const { data: newListing, error: insertError } = await supabase
          .from('scraped_listings')
          .insert({
            source_site: 'TradeMe',
            source_url: listing.url,
            address: listing.address,
            suburb: extractSuburb(listing.address),
            city: 'Wellington',
            status: 'discovered', // Stage 1 status
            // Leave detailed fields as NULL for Stage 2
            price: null,
            bedrooms: null,
            bathrooms: null,
            floor_area: null,
            land_area: null,
            summary: null,
            photos: null,
            listing_date: null,
            ai_score: null
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting discovered listing:', insertError);
          continue;
        }

        savedCount++;
        console.log(`Saved discovered listing: ${listing.address} (ID: ${listing.id})`);

      } catch (error) {
        console.error('Error processing listing:', error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      discovered: savedCount,
      skipped: skippedCount,
      total: listings.length,
      source: 'TradeMe',
      stage: 'search-results',
      url: searchUrl,
      message: `Stage 1 complete: Discovered ${savedCount} new listings for future detailed scraping`,
      agentqlConnected: true,
      nextStage: 'Stage 2: Individual property details scraping (future implementation)'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Stage 1 scrape-trademe function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      stage: 'search-results'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

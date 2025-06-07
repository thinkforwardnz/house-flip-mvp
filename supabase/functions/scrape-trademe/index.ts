
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
    console.log('Stage 1: TradeMe Discovery - Search Results Only');
    console.log('Filters:', JSON.stringify(filters, null, 2));

    // Check if AgentQL API key is configured
    const agentqlKey = Deno.env.get('AGENTQL_API_KEY');
    if (!agentqlKey) {
      console.error('AGENTQL_API_KEY not configured in environment');
      return new Response(JSON.stringify({
        success: false,
        error: 'AgentQL API key not configured',
        discovered: 0,
        discoveredListings: [],
        source: 'TradeMe',
        stage: 'discovery'
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
        discoveredListings: [],
        source: 'TradeMe',
        stage: 'discovery'
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
        discoveredListings: [],
        source: 'TradeMe',
        stage: 'discovery',
        details: 'Check API key and endpoint configuration'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Stage 1: Build TradeMe search URL and discover listing metadata
    const searchUrl = buildTradeeMeSearchUrl(filters);
    console.log('Stage 1: Discovering listings from:', searchUrl);

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
        discoveredListings: [],
        source: 'TradeMe',
        stage: 'discovery',
        url: searchUrl,
        details: 'Search query failed with /query-data endpoint'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process search results to get basic listing metadata
    const listings = processSearchResults(searchResults);
    console.log(`Stage 1: Discovered ${listings.length} listings`);

    if (listings.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        discovered: 0,
        discoveredListings: [],
        source: 'TradeMe',
        stage: 'discovery',
        message: 'No listings found in search results',
        searchResponse: searchResults,
        searchUrl: searchUrl
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare discovered listings for return (no database storage)
    const discoveredListings = listings.map(listing => ({
      url: listing.url,
      address: listing.address,
      suburb: extractSuburb(listing.address),
      city: 'Wellington',
      source: 'TradeMe'
    }));

    console.log(`Stage 1 Complete: Discovered ${discoveredListings.length} listings for potential detailed scraping`);

    return new Response(JSON.stringify({
      success: true,
      discovered: discoveredListings.length,
      discoveredListings: discoveredListings,
      source: 'TradeMe',
      stage: 'discovery',
      url: searchUrl,
      message: `Stage 1 complete: Discovered ${discoveredListings.length} property listings`,
      agentqlConnected: true,
      nextStage: 'Stage 2: Individual property details scraping (to be implemented)',
      filters: filters
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Stage 1 TradeMe discovery:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      discovered: 0,
      discoveredListings: [],
      stage: 'discovery'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

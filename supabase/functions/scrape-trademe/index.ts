
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
      console.log('AgentQL search results received:', !!searchResults);
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
    console.log(`Discovered ${listings.length} listings`);

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
        // Check if listing already exists
        const { data: existing } = await supabase
          .from('scraped_listings')
          .select('id')
          .eq('source_url', listing.url)
          .single();

        if (existing) {
          skipped++;
          console.log(`Skipped existing listing: ${listing.address}`);
          continue;
        }

        // Insert new listing
        const { error } = await supabase
          .from('scraped_listings')
          .insert({
            source_url: listing.url,
            address: listing.address,
            suburb: extractSuburb(listing.address),
            city: 'Wellington',
            price: 0, // Default price since we don't have it in discovery stage
            source_site: 'TradeMe',
            summary: `Property listing from TradeMe: ${listing.address}`,
            status: 'new'
          });

        if (error) {
          console.error('Error saving listing:', error);
          errors.push(`Failed to save ${listing.address}: ${error.message}`);
        } else {
          scraped++;
          console.log(`Saved listing: ${listing.address}`);
        }
      } catch (error) {
        console.error('Error processing listing:', error);
        errors.push(`Error processing ${listing.address}: ${error.message}`);
      }
    }

    console.log(`TradeMe scraping complete: ${scraped} saved, ${skipped} skipped`);

    return new Response(JSON.stringify({
      success: true,
      scraped: scraped,
      skipped: skipped,
      source: 'TradeMe',
      url: searchUrl,
      message: `TradeMe scraping complete: ${scraped} new listings saved, ${skipped} duplicates skipped`,
      errors: errors.length > 0 ? errors : undefined
    }), {
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

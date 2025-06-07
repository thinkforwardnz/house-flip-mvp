
// deno-lint-ignore no-explicit-any
// @ts-ignore: Deno global is available in Edge Functions
declare const Deno: any;
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

import { corsHeaders } from './config.ts';
import { calculateFlipPotential } from './scoring.ts';
import { ScrapingFilters, PropertyData } from './types.ts';
import { AgentQLClient } from '../shared/agentql-client.ts';
import { buildTradeeMeSearchUrl } from './url-builder.ts';
import { processSearchResults, processPropertyDetails } from './data-processor.ts';

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
    console.log('Starting TradeMe scraping with corrected AgentQL /query-data integration');
    console.log('Filters:', JSON.stringify(filters, null, 2));

    // Check if AgentQL API key is configured
    const agentqlKey = Deno.env.get('AGENTQL_API_KEY');
    if (!agentqlKey) {
      console.error('AGENTQL_API_KEY not configured in environment');
      return new Response(JSON.stringify({
        success: false,
        error: 'AgentQL API key not configured',
        scraped: 0,
        skipped: 0,
        total: 0,
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
        total: 0,
        source: 'TradeMe'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Test AgentQL connection with correct endpoint
    try {
      console.log('Testing AgentQL API connectivity with /query-data endpoint...');
      const testResult = await agentqlClient.testConnection();
      console.log('AgentQL test successful:', testResult);
    } catch (testError) {
      console.error('AgentQL connectivity test failed:', testError);
      return new Response(JSON.stringify({
        success: false,
        error: 'AgentQL API connectivity failed: ' + testError.message,
        scraped: 0,
        skipped: 0,
        total: 0,
        source: 'TradeMe',
        details: 'Check API key and endpoint configuration',
        endpoint: 'https://api.agentql.com/v1/query-data'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Build TradeMe search URL and get listing URLs
    const searchUrl = buildTradeeMeSearchUrl(filters);
    console.log('Step 1: Scraping search results from:', searchUrl);

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
        total: 0,
        source: 'TradeMe',
        url: searchUrl,
        details: 'Search query failed with new /query-data endpoint'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process search results to get listing URLs
    const listingUrls = processSearchResults(searchResults);
    console.log(`Step 1 complete: Found ${listingUrls.length} listing URLs`);

    if (listingUrls.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        scraped: 0,
        skipped: 0,
        total: 0,
        source: 'TradeMe',
        message: 'No listings found in search results',
        searchResponse: searchResults,
        searchUrl: searchUrl
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 2: Scrape individual property details with rate limiting
    console.log('Step 2: Scraping individual property details with rate limiting...');
    const properties: PropertyData[] = [];
    let successCount = 0;
    let errorCount = 0;

    // Limit to first 3 properties for testing and to respect rate limits
    const maxProperties = Math.min(listingUrls.length, 3);
    
    for (let i = 0; i < maxProperties; i++) {
      const listingUrl = listingUrls[i];
      try {
        console.log(`Scraping property ${i + 1}/${maxProperties}: ${listingUrl}`);
        
        // Add rate limiting delay before each request (except the first)
        if (i > 0) {
          await agentqlClient.rateLimitDelay();
        }
        
        const propertyDetails = await agentqlClient.scrapePropertyDetails(listingUrl);
        const property = processPropertyDetails(propertyDetails, listingUrl, searchUrl);
        
        if (property) {
          properties.push(property);
          successCount++;
          console.log(`Successfully processed property: ${property.address}`);
        } else {
          console.warn(`Failed to process property details for: ${listingUrl}`);
          errorCount++;
        }
        
      } catch (error) {
        console.error(`Error scraping property ${listingUrl}:`, error);
        errorCount++;
        // Continue with next property
      }
    }

    console.log(`Step 2 complete: Successfully scraped ${successCount} properties, ${errorCount} errors`);

    // Step 3: Save properties to database
    let savedCount = 0;
    let skippedCount = 0;

    for (const property of properties) {
      try {
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

        // Calculate flip potential score
        const flipScore = calculateFlipPotential(property);

        // Insert new listing
        const { data: newListing, error: insertError } = await supabase
          .from('scraped_listings')
          .insert({
            source_site: 'TradeMe',
            source_url: property.source_url,
            address: property.address,
            suburb: property.suburb,
            city: property.city,
            price: property.price,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            floor_area: property.floor_area,
            land_area: property.land_area,
            summary: property.summary,
            photos: property.photos,
            listing_date: property.listing_date,
            status: 'new',
            ai_score: flipScore
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting listing:', insertError);
          continue;
        }

        // Trigger AI analysis for high-potential properties
        if (newListing && flipScore >= 60) {
          analyzeListingInBackground(newListing);
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
      total: properties.length,
      source: 'TradeMe',
      url: searchUrl,
      listingUrlsFound: listingUrls.length,
      processingErrors: errorCount,
      agentqlConnected: true,
      endpoint: 'https://api.agentql.com/v1/query-data'
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

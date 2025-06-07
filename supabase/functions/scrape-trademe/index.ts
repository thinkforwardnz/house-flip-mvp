
// deno-lint-ignore no-explicit-any
// @ts-ignore: Deno global is available in Edge Functions
declare const Deno: any;
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

import { corsHeaders } from './config.ts';
import { calculateFlipPotential } from './scoring.ts';
import { ScrapingFilters, PropertyData, AgentQLResponse } from './types.ts';
import { AgentQLClient } from '../shared/agentql-client.ts';
import { buildTradeeMeSearchUrl } from './url-builder.ts';
import { processAgentQLResults } from './data-processor.ts';

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
    console.log('Starting TradeMe scraping with AgentQL for Wellington region');
    console.log('Filters:', JSON.stringify(filters, null, 2));

    // Check if AgentQL API key is configured
    const agentqlKey = Deno.env.get('AGENTQL_API_KEY');
    if (!agentqlKey) {
      throw new Error('AGENTQL_API_KEY not configured in environment');
    }

    // Initialize AgentQL client
    const agentqlClient = new AgentQLClient();

    // Build TradeMe search URL with filters
    const searchUrl = buildTradeeMeSearchUrl(filters);
    console.log('Scraping URL:', searchUrl);

    // Get the structured query for TradeMe properties
    const propertyQuery = agentqlClient.getTradeeMePropertyQuery();
    console.log('Using query:', propertyQuery);

    let agentqlResponse: AgentQLResponse;
    
    try {
      // Try main property extraction query first
      agentqlResponse = await agentqlClient.queryPropertyData(searchUrl, propertyQuery);
    } catch (error) {
      console.warn('Main query failed, trying fallback query:', error);
      
      // Try fallback query if main query fails
      const fallbackQuery = agentqlClient.getTradeeMeFallbackQuery();
      agentqlResponse = await agentqlClient.queryPropertyData(searchUrl, fallbackQuery);
    }

    // Process the AgentQL response
    const properties: PropertyData[] = processAgentQLResults(agentqlResponse, searchUrl);
    console.log(`Processed ${properties.length} valid properties from AgentQL response`);

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
      url: searchUrl
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

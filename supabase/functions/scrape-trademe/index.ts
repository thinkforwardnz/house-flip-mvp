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

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Initialize AgentQL client (reads API key from secrets)
const agentqlClient = new AgentQLClient();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filters = {} }: { filters: ScrapingFilters } = await req.json();
    console.log('Starting TradeMe scraping with AgentQL for Wellington region');

    // Build TradeMe search URL with filters
    const baseUrl = 'https://www.trademe.co.nz/a/property/residential/sale/wellington';
    const params = new URLSearchParams();
    if (filters.keywords) {
      const keywords = filters.keywords.split(',').map((k: string) => k.trim());
      params.append('search_string', keywords[0] || '');
    }
    if (filters.minPrice) params.append('price_min', filters.minPrice);
    if (filters.maxPrice) params.append('price_max', filters.maxPrice);
    if (filters.minBeds) params.append('bedrooms_min', filters.minBeds);
    if (filters.maxBeds) params.append('bedrooms_max', filters.maxBeds);
    if (filters.suburb) params.append('suburb', filters.suburb);
    const searchUrl = `${baseUrl}?${params.toString()}`;

    // Call AgentQL to extract property listings
    const agentqlResults = await agentqlClient.extractProperties({ url: searchUrl });
    console.log(`Received ${agentqlResults.length} properties from AgentQL`);

    // Process the results (map AgentQL fields to our schema)
    // Type guard to filter out nulls
    function isPropertyData(item: any): item is PropertyData {
      return item !== null && typeof item === 'object' && 'city' in item;
    }
    const properties: PropertyData[] = agentqlResults.map((item: any) => {
      try {
        return {
          source_url: item.url || '',
          address: item.address || '',
          suburb: item.suburb || '',
          city: 'Wellington',
          price: typeof item.price === 'number' ? item.price : parseInt(String(item.price).replace(/[^0-9]/g, '')) || 0,
          bedrooms: item.bedrooms ? parseInt(item.bedrooms) : null,
          bathrooms: item.bathrooms ? parseFloat(item.bathrooms) : null,
          floor_area: item.floorArea ? parseFloat(item.floorArea) : null,
          land_area: item.landArea ? parseFloat(item.landArea) : null,
          summary: item.description || '',
          photos: Array.isArray(item.photos) ? item.photos : [],
          listing_date: item.listingDate || new Date().toISOString().split('T')[0]
        };
      } catch (error) {
        console.error('Error processing AgentQL result:', error, item);
        return null;
      }
    }).filter(isPropertyData);

    let savedCount = 0;
    let skippedCount = 0;

    for (const property of properties) {
      if (!property) continue; // Type safety
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
      source: 'TradeMe'
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


// deno-lint-ignore-file
// Use explicit Deno typing
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8?dts';
import { corsHeaders } from '../shared/cors.ts';
import { AgentQLSearchClient } from '../shared/agentql-search-client.ts';
import { processTrademeListing, ProcessedListing } from './data-processor.ts';
import { buildTradeeMeSearchUrl } from './url-builder.ts';
import { errorResponse } from '../shared/error-response.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const supabase: SupabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface Filters {
  [key: string]: string | number | boolean | undefined;
}

// Zod schema for incoming filters
const FiltersSchema = z.record(z.union([z.string(), z.number(), z.boolean(), z.undefined()]));

// Zod schema for processed listing
const ProcessedListingSchema = z.object({
  source_url: z.string(),
  source_site: z.string(),
  address: z.string(),
  suburb: z.string().nullable(),
  city: z.string().nullable(),
  district: z.string().nullable(),
  price: z.number(),
  summary: z.string().nullable(),
  bedrooms: z.number().nullable(),
  bathrooms: z.number().nullable(),
  floor_area: z.number().nullable(),
  land_area: z.number().nullable(),
  photos: z.array(z.string()).nullable(),
  listing_date: z.string().nullable(),
});

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const filtersParse = FiltersSchema.safeParse(body.filters ?? {});
    if (!filtersParse.success) {
      return errorResponse('Invalid filters: ' + filtersParse.error.message, 400);
    }
    const filters = filtersParse.data;
    console.log('Starting Trade Me scraping with filters:', filters);

    const searchClient = new AgentQLSearchClient();
    const searchUrl = buildTradeeMeSearchUrl(filters);
    console.log('Built search URL:', searchUrl);

    const searchResults = await searchClient.scrapeSearchResults(searchUrl);
    if (!searchResults?.data?.properties || !Array.isArray(searchResults.data.properties)) {
      console.error('No properties found in search results');
      return errorResponse('No properties found in search results', 404);
    }

    console.log(`Found ${searchResults.data.properties.length} properties in search results`);

    const processedListings: ProcessedListing[] = [];
    const maxListings = 50;

    for (let i = 0; i < Math.min(searchResults.data.properties.length, maxListings); i++) {
      const property = searchResults.data.properties[i];
      try {
        console.log(`Processing property ${i + 1}/${Math.min(searchResults.data.properties.length, maxListings)}: ${property.listingaddress}`);
        if (i > 0 && i % 10 === 0) {
          await searchClient.rateLimitDelay();
        }
        const processed = processTrademeListing(property);
        if (processed) {
          const listingParse = ProcessedListingSchema.safeParse(processed);
          if (!listingParse.success) {
            console.error('Invalid processed listing:', listingParse.error);
            continue;
          }
          processedListings.push(listingParse.data);
        }
      } catch (error: unknown) {
        console.error(`Error processing property ${property.listingaddress}:`, error);
      }
    }

    console.log(`Successfully processed ${processedListings.length} Trade Me listings`);

    const savedListings: ProcessedListing[] = [];
    for (const listing of processedListings) {
      try {
        // Check if property already exists in unified_properties
        const { data: existing } = await supabase
          .from('unified_properties')
          .select('id')
          .eq('source_url', listing.source_url)
          .maybeSingle();

        if (!existing) {
          // Insert into unified_properties with prospecting tag
          const { data: saved, error } = await supabase
            .from('unified_properties')
            .insert({
              source_url: listing.source_url,
              source_site: listing.source_site,
              address: listing.address,
              suburb: listing.suburb,
              city: listing.city || 'Auckland',
              district: listing.district,
              current_price: listing.price || 0,
              description: listing.summary,
              bedrooms: listing.bedrooms,
              bathrooms: listing.bathrooms,
              floor_area: listing.floor_area,
              land_area: listing.land_area,
              photos: listing.photos,
              listing_date: listing.listing_date,
              date_scraped: new Date().toISOString(),
              tags: ['prospecting'],
              status: 'active'
            })
            .select()
            .single();

          if (error) {
            console.error('Error saving listing to unified_properties:', error);
          } else {
            savedListings.push(saved);
            console.log(`Saved listing to unified_properties: ${listing.address}`);
            
            // Trigger AI analysis for new property
            analyzePropertyInBackground(saved);
          }
        } else {
          console.log('Property already exists in unified_properties, skipping:', listing.source_url);
        }
      } catch (error: unknown) {
        console.error('Error processing listing for database:', error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Trade Me scraping complete: found ${processedListings.length} listings, saved ${savedListings.length} new ones`,
      scraped: savedListings.length,
      skipped: processedListings.length - savedListings.length,
      total: processedListings.length,
      source: 'Trade Me',
      search_url: searchUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Trade Me scraping error:', error);
    const message = error instanceof Error ? error.message : 'Trade Me scraping failed';
    return errorResponse(message, 500);
  }
});

async function analyzePropertyInBackground(property: any) {
  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/analyze-property`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        propertyId: property.id,
        propertyData: property
      }),
    });

    if (!response.ok) {
      console.error('Failed to analyze property:', await response.text());
    } else {
      console.log(`Successfully queued analysis for property: ${property.address}`);
    }
  } catch (error) {
    console.error('Error triggering AI analysis:', error);
  }
}

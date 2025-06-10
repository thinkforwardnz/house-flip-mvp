// deno-lint-ignore-file
// Use explicit Deno typing
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

interface Property {
  [key: string]: unknown;
  listingaddress?: string;
  source_url?: string;
  source_site?: string;
  address?: string;
  suburb?: string | null;
  city?: string | null;
  district?: string | null;
  price?: number | null;
  summary?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  floor_area?: number | null;
  land_area?: number | null;
  photos?: string[] | null;
  listing_date?: string | null;
}

// Zod schema for incoming filters
const FiltersSchema = z.record(z.union([z.string(), z.number(), z.boolean(), z.undefined()]));

// Zod schema for processed listing (mirrors ProcessedListing interface)
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
    console.log('Starting Trade Me basic scraping with filters:', filters);

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
        console.log(`Processing basic property ${i + 1}/${Math.min(searchResults.data.properties.length, maxListings)}: ${property.listingaddress}`);
        if (i > 0 && i % 10 === 0) {
          await searchClient.rateLimitDelay();
        }
        const processed = processTrademeListing(property);
        if (processed) {
          // Validate processed listing before saving
          const listingParse = ProcessedListingSchema.safeParse(processed);
          if (!listingParse.success) {
            console.error('Invalid processed listing:', listingParse.error);
            continue; // Skip invalid listings
          }
          processedListings.push(listingParse.data);
        }
      } catch (error: unknown) {
        console.error(`Error processing basic property ${property.listingaddress}:`, error);
      }
    }

    console.log(`Successfully processed ${processedListings.length} Trade Me listings with basic information`);

    const savedListings: ProcessedListing[] = [];
    for (const listing of processedListings) {
      try {
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
      } catch (error: unknown) {
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

  } catch (error: unknown) {
    console.error('Trade Me basic scraping error:', error);
    const message = error instanceof Error ? error.message : 'Basic scraping failed';
    return errorResponse(message, 500);
  }
});

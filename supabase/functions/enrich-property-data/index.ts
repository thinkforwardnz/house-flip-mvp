// Use explicit Deno typing
declare const Deno: { env: { get(key: string): string | undefined } };
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

import { corsHeaders } from '../shared/cors.ts';
import { AgentQLPropertyClient } from '../shared/agentql-property-client.ts';

const supabase: SupabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface Listing {
  id: string;
  source_url: string;
  address?: string;
  photos?: string[];
  summary?: string;
  bedrooms?: number;
  bathrooms?: number;
  floor_area?: number;
  land_area?: number;
}

interface EnhancedData {
  photos?: string[];
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  floor_area?: number;
  land_area?: number;
}

// Zod schema for Listing
const ListingSchema = z.object({
  id: z.string(),
  source_url: z.string(),
  address: z.string().optional(),
  photos: z.array(z.string()).optional(),
  summary: z.string().optional().nullable(),
  bedrooms: z.number().optional().nullable(),
  bathrooms: z.number().optional().nullable(),
  floor_area: z.number().optional().nullable(),
  land_area: z.number().optional().nullable(),
});

// Zod schema for EnhancedData
const EnhancedDataSchema = z.object({
  photos: z.array(z.string()).optional(),
  description: z.string().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  floor_area: z.number().optional(),
  land_area: z.number().optional(),
});

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Property data enrichment started with enhanced error handling and debugging');

    const agentqlKey = Deno.env.get('AGENTQL_API_KEY');
    console.log('AgentQL API key check:', {
      exists: !!agentqlKey,
      length: agentqlKey?.length || 0,
      prefix: agentqlKey?.substring(0, 8) + '...' || 'N/A'
    });

    if (!agentqlKey) {
      console.error('AGENTQL_API_KEY not configured in environment');
      return new Response(JSON.stringify({
        success: false,
        error: 'AgentQL API key not configured',
        message: 'Please add your AgentQL API key to Supabase Edge Function secrets',
        troubleshooting: {
          steps: [
            '1. Go to Supabase Dashboard > Edge Functions > Settings',
            '2. Add a new secret: AGENTQL_API_KEY',
            '3. Enter your AgentQL API key value',
            '4. Redeploy the function'
          ]
        },
        enriched: 0,
        skipped: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let agentqlClient: AgentQLPropertyClient;
    try {
      agentqlClient = new AgentQLPropertyClient();
      console.log('AgentQL client initialized successfully');
      const connectionTest = await agentqlClient.testConnection();
      if (!connectionTest.success) {
        console.error('AgentQL connection test failed:', connectionTest);
        return new Response(JSON.stringify({
          success: false,
          error: 'AgentQL connection test failed',
          message: connectionTest.message,
          details: connectionTest.details,
          enriched: 0,
          skipped: 0
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.log('AgentQL connection test passed');
    } catch (error: unknown) {
      console.error('Failed to initialize AgentQL client:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to initialize AgentQL client',
        message,
        troubleshooting: {
          possibleCauses: [
            'Invalid API key format',
            'API key too short',
            'Environment variable not set correctly'
          ]
        },
        enriched: 0,
        skipped: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: listingsToEnrich, error: queryError } = await supabase
      .from('scraped_listings')
      .select('id, source_url, address, photos, summary, bedrooms, bathrooms, floor_area, land_area')
      .or('photos.is.null,photos.eq.{},summary.is.null,bedrooms.is.null,bathrooms.is.null,floor_area.is.null')
      .limit(15);

    if (queryError) {
      console.error('Error querying listings to enrich:', queryError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to query listings: ' + queryError.message,
        enriched: 0,
        skipped: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!listingsToEnrich || listingsToEnrich.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        enriched: 0,
        skipped: 0,
        message: 'No listings found that need enrichment'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${listingsToEnrich.length} listings to enrich with enhanced debugging`);

    let enriched = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const rawListing of listingsToEnrich) {
      // Validate listing before enrichment
      const listingParse = ListingSchema.safeParse(rawListing);
      if (!listingParse.success) {
        console.error('Invalid listing to enrich:', listingParse.error);
        skipped++;
        continue;
      }
      const listing = listingParse.data;
      try {
        console.log(`Enriching listing with detailed debugging: ${listing.address} (${listing.source_url})`);
        const enhancedDataRaw = await agentqlClient.scrapePropertyPage(listing.source_url);
        // Validate enhanced data
        const enhancedDataParse = EnhancedDataSchema.safeParse(enhancedDataRaw);
        if (!enhancedDataParse.success) {
          console.error('Invalid enhanced data:', enhancedDataParse.error);
          skipped++;
          continue;
        }
        const enhancedData = enhancedDataParse.data;
        const updateData: Partial<typeof listing> & { updated_at: string } = {
          updated_at: new Date().toISOString()
        };
        if (enhancedData.photos && enhancedData.photos.length > 0) {
          updateData.photos = enhancedData.photos;
        }
        if (enhancedData.description && !listing.summary) {
          updateData.summary = enhancedData.description;
        }
        if (enhancedData.bedrooms && !listing.bedrooms) {
          updateData.bedrooms = enhancedData.bedrooms;
        }
        if (enhancedData.bathrooms && !listing.bathrooms) {
          updateData.bathrooms = enhancedData.bathrooms;
        }
        if (enhancedData.floor_area && !listing.floor_area) {
          updateData.floor_area = enhancedData.floor_area;
        }
        if (enhancedData.land_area && !listing.land_area) {
          updateData.land_area = enhancedData.land_area;
        }
        const hasUpdates = Object.keys(updateData).length > 1;
        if (!hasUpdates) {
          skipped++;
          console.log(`No meaningful updates found for: ${listing.address}`);
          continue;
        }
        const { error: updateError } = await supabase
          .from('scraped_listings')
          .update(updateData)
          .eq('id', listing.id);
        if (updateError) {
          console.error('Error updating listing:', updateError);
          errors.push(`Failed to update ${listing.address}: ${updateError.message}`);
        } else {
          enriched++;
          console.log(`Successfully enriched listing: ${listing.address} with enhanced details`, {
            photos: enhancedData.photos?.length || 0,
            hasDescription: !!enhancedData.description,
            bedrooms: enhancedData.bedrooms,
            bathrooms: enhancedData.bathrooms,
            floorArea: enhancedData.floor_area,
            landArea: enhancedData.land_area
          });
        }
      } catch (error: unknown) {
        console.error('Error enriching listing:', error);
        errors.push(`Error enriching listing: ${listing.address} - ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      enriched,
      skipped,
      errors
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Property data enrichment error:', error);
    const message = error instanceof Error ? error.message : 'Property data enrichment failed';
    return new Response(JSON.stringify({
      success: false,
      error: message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

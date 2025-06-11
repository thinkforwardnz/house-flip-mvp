
// Use explicit Deno typing
declare const Deno: { env: { get(key: string): string | undefined } };
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

import { corsHeaders } from '../shared/cors.ts';
import { CustomScraperClient } from '../shared/custom-scraper-client.ts';

const supabase: SupabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface Property {
  id: string;
  source_url: string;
  address?: string;
  photos?: string[];
  description?: string;
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

// Zod schema for Property
const PropertySchema = z.object({
  id: z.string(),
  source_url: z.string(),
  address: z.string().optional(),
  photos: z.array(z.string()).optional(),
  description: z.string().optional().nullable(),
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
    console.log('Property data enrichment started for unified properties');

    const customScraperUrl = Deno.env.get('CUSTOM_SCRAPER_BASE_URL');
    console.log('Custom Scraper URL check:', {
      exists: !!customScraperUrl,
      url: customScraperUrl || 'N/A'
    });

    if (!customScraperUrl) {
      console.error('CUSTOM_SCRAPER_BASE_URL not configured in environment');
      return new Response(JSON.stringify({
        success: false,
        error: 'Custom Scraper URL not configured',
        message: 'Please add your Custom Scraper base URL to Supabase Edge Function secrets',
        enriched: 0,
        skipped: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let scraperClient: CustomScraperClient;
    try {
      scraperClient = new CustomScraperClient();
      console.log('Custom Scraper client initialized successfully');
    } catch (error: unknown) {
      console.error('Failed to initialize Custom Scraper client:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to initialize Custom Scraper client',
        message,
        enriched: 0,
        skipped: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get unified properties that need enrichment (prospecting properties missing data)
    const { data: propertiesToEnrich, error: queryError } = await supabase
      .from('unified_properties')
      .select('id, source_url, address, photos, description, bedrooms, bathrooms, floor_area, land_area')
      .contains('tags', ['prospecting'])
      .or('photos.is.null,photos.eq.{},description.is.null,bedrooms.is.null,bathrooms.is.null,floor_area.is.null')
      .limit(15);

    if (queryError) {
      console.error('Error querying properties to enrich:', queryError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to query properties: ' + queryError.message,
        enriched: 0,
        skipped: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!propertiesToEnrich || propertiesToEnrich.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        enriched: 0,
        skipped: 0,
        message: 'No properties found that need enrichment'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${propertiesToEnrich.length} properties to enrich`);

    let enriched = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const rawProperty of propertiesToEnrich) {
      // Validate property before enrichment
      const propertyParse = PropertySchema.safeParse(rawProperty);
      if (!propertyParse.success) {
        console.error('Invalid property to enrich:', propertyParse.error);
        skipped++;
        continue;
      }
      const property = propertyParse.data;
      
      try {
        console.log(`Enriching property: ${property.address} (${property.source_url})`);
        const propertyDataResponse = await scraperClient.scrapeProperty(property.source_url);
        
        if (!propertyDataResponse || !propertyDataResponse.structured) {
          console.log(`No enhanced data found for: ${property.address}`);
          skipped++;
          continue;
        }

        const structured = propertyDataResponse.structured;
        const enhancedDataRaw = {
          photos: structured.images || [],
          description: structured.description,
          bedrooms: structured.bedrooms ? parseInt(structured.bedrooms) : undefined,
          bathrooms: structured.bathrooms ? parseInt(structured.bathrooms) : undefined,
          floor_area: structured.floor_area ? parseFloat(structured.floor_area) : undefined,
          land_area: structured.land_area ? parseFloat(structured.land_area) : undefined,
        };
        
        // Validate enhanced data
        const enhancedDataParse = EnhancedDataSchema.safeParse(enhancedDataRaw);
        if (!enhancedDataParse.success) {
          console.error('Invalid enhanced data:', enhancedDataParse.error);
          skipped++;
          continue;
        }
        const enhancedData = enhancedDataParse.data;
        
        const updateData: Partial<typeof property> & { updated_at: string } = {
          updated_at: new Date().toISOString()
        };
        
        if (enhancedData.photos && enhancedData.photos.length > 0) {
          updateData.photos = enhancedData.photos;
        }
        if (enhancedData.description && !property.description) {
          updateData.description = enhancedData.description;
        }
        if (enhancedData.bedrooms && !property.bedrooms) {
          updateData.bedrooms = enhancedData.bedrooms;
        }
        if (enhancedData.bathrooms && !property.bathrooms) {
          updateData.bathrooms = enhancedData.bathrooms;
        }
        if (enhancedData.floor_area && !property.floor_area) {
          updateData.floor_area = enhancedData.floor_area;
        }
        if (enhancedData.land_area && !property.land_area) {
          updateData.land_area = enhancedData.land_area;
        }
        
        const hasUpdates = Object.keys(updateData).length > 1;
        if (!hasUpdates) {
          skipped++;
          console.log(`No meaningful updates found for: ${property.address}`);
          continue;
        }
        
        const { error: updateError } = await supabase
          .from('unified_properties')
          .update(updateData)
          .eq('id', property.id);
        
        if (updateError) {
          console.error('Error updating property:', updateError);
          errors.push(`Failed to update ${property.address}: ${updateError.message}`);
        } else {
          enriched++;
          console.log(`Successfully enriched property: ${property.address}`);
        }
      } catch (error: unknown) {
        console.error('Error enriching property:', error);
        errors.push(`Error enriching property: ${property.address} - ${error instanceof Error ? error.message : String(error)}`);
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

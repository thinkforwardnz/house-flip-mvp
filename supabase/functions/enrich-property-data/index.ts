
// Use explicit Deno typing
declare const Deno: { env: { get(key: string): string | undefined } };
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { corsHeaders } from '../shared/cors.ts';
import { ScraperService } from './scraper-service.ts';
import { PropertyEnricher } from './property-enricher.ts';

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Property data enrichment started for unified properties');

    // Validate scraper configuration
    const configValidation = ScraperService.validateConfiguration();
    if (!configValidation.success) {
      return new Response(JSON.stringify({
        success: false,
        error: configValidation.error,
        message: configValidation.message,
        enriched: 0,
        skipped: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize services
    const propertyEnricher = new PropertyEnricher();
    
    // Get properties that need enrichment
    let propertiesToEnrich;
    try {
      propertiesToEnrich = await propertyEnricher.getPropertiesToEnrich();
    } catch (error: unknown) {
      console.error('Error querying properties to enrich:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to query properties: ' + message,
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

    // Process each property
    for (const property of propertiesToEnrich) {
      const result = await propertyEnricher.enrichProperty(property);
      
      if (result.success) {
        if (result.hasUpdates) {
          enriched++;
        } else {
          skipped++;
        }
      } else {
        skipped++;
        if (result.error) {
          errors.push(`Error enriching property: ${property.address} - ${result.error}`);
        }
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

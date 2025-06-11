
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { CustomScraperClient } from '../../shared/custom-scraper-client.ts';
import { analyzePropertyInBackground } from '../services/property-processor.ts';
import { ProcessingRequest, ProcessingResult } from '../types/processor-types.ts';
import { corsHeaders } from '../../shared/cors.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function handleEnrichment(request: ProcessingRequest): Promise<Response> {
  const { propertyId } = request;
  
  if (propertyId) {
    // Enrich specific property
    const result = await enrichPropertyData(propertyId);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } else {
    // Enrich properties that need it
    const result = await enrichPropertiesNeedingData();
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function enrichPropertyData(propertyId: string): Promise<ProcessingResult> {
  try {
    // Get property details
    const { data: property, error: fetchError } = await supabase
      .from('unified_properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (fetchError || !property) {
      return {
        success: false,
        processed: 0,
        skipped: 1,
        errors: ['Property not found'],
        message: 'Property not found'
      };
    }

    console.log(`Starting enrichment for property: ${property.address}`);

    const scraperClient = new CustomScraperClient();
    let hasUpdates = false;
    const updateData: any = { updated_at: new Date().toISOString() };

    // Scrape detailed property data if missing
    if (!property.photos || property.photos.length === 0 || !property.description) {
      try {
        const propertyDataResponse = await scraperClient.scrapeProperty(property.source_url);
        
        if (propertyDataResponse?.structured) {
          const structured = propertyDataResponse.structured;
          
          if (structured.images && structured.images.length > 0) {
            updateData.photos = structured.images;
            hasUpdates = true;
          }
          
          if (structured.description && !property.description) {
            updateData.description = structured.description;
            hasUpdates = true;
          }
          
          if (structured.bedrooms && !property.bedrooms) {
            updateData.bedrooms = parseInt(structured.bedrooms);
            hasUpdates = true;
          }
          
          if (structured.bathrooms && !property.bathrooms) {
            updateData.bathrooms = parseInt(structured.bathrooms);
            hasUpdates = true;
          }
          
          if (structured.floor_area && !property.floor_area) {
            updateData.floor_area = parseFloat(structured.floor_area);
            hasUpdates = true;
          }
          
          if (structured.land_area && !property.land_area) {
            updateData.land_area = parseFloat(structured.land_area);
            hasUpdates = true;
          }
        }
      } catch (error) {
        console.error('Error scraping property details:', error);
      }
    }

    // Update property if we have new data
    if (hasUpdates) {
      const { error: updateError } = await supabase
        .from('unified_properties')
        .update(updateData)
        .eq('id', propertyId);

      if (updateError) {
        return {
          success: false,
          processed: 0,
          skipped: 1,
          errors: [updateError.message],
          message: 'Failed to update property'
        };
      }
    }

    // Trigger AI analysis in background
    analyzePropertyInBackground(property);

    console.log(`Enrichment completed for: ${property.address}`);
    return {
      success: true,
      processed: hasUpdates ? 1 : 0,
      skipped: hasUpdates ? 0 : 1,
      errors: [],
      message: hasUpdates ? 'Property enriched successfully' : 'No updates needed'
    };
  } catch (error) {
    return {
      success: false,
      processed: 0,
      skipped: 1,
      errors: [error.message],
      message: 'Enrichment failed'
    };
  }
}

async function enrichPropertiesNeedingData(): Promise<ProcessingResult> {
  // Get properties that need enrichment (missing key data)
  const { data: properties, error } = await supabase
    .from('unified_properties')
    .select('id, source_url, address, photos, description, bedrooms, bathrooms, floor_area, land_area')
    .or('photos.is.null,photos.eq.{},description.is.null,bedrooms.is.null,bathrooms.is.null,floor_area.is.null')
    .limit(20);

  if (error || !properties) {
    return {
      success: false,
      processed: 0,
      skipped: 0,
      errors: [error?.message || 'Failed to fetch properties'],
      message: 'Failed to fetch properties for enrichment'
    };
  }

  let processed = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const property of properties) {
    const result = await enrichPropertyData(property.id);
    if (result.success && result.processed > 0) {
      processed++;
    } else {
      skipped++;
      errors.push(...result.errors);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return {
    success: true,
    processed,
    skipped,
    errors,
    message: `Enrichment complete: ${processed} properties updated, ${skipped} skipped`
  };
}

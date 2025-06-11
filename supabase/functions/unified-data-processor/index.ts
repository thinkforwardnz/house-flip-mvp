import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../shared/cors.ts';
import { CustomScraperClient } from '../shared/custom-scraper-client.ts';
import { errorResponse } from '../shared/error-response.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface ProcessingRequest {
  mode: 'scrape' | 'enrich' | 'refresh';
  filters?: any;
  propertyId?: string;
  sources?: string[];
}

interface ProcessingResult {
  success: boolean;
  processed: number;
  skipped: number;
  errors: string[];
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: ProcessingRequest = await req.json();
    console.log('Unified data processor started with request:', body);

    switch (body.mode) {
      case 'scrape':
        return await handleScraping(body);
      case 'enrich':
        return await handleEnrichment(body);
      case 'refresh':
        return await handleRefresh(body);
      default:
        return errorResponse('Invalid processing mode', 400);
    }
  } catch (error) {
    console.error('Unified data processor error:', error);
    return errorResponse(error.message || 'Processing failed', 500);
  }
});

async function handleScraping(request: ProcessingRequest): Promise<Response> {
  const { filters = {}, sources = ['trademe'] } = request;
  const scraperClient = new CustomScraperClient();
  
  let totalScraped = 0;
  let totalSkipped = 0;
  const errors: string[] = [];

  // Process TradeMe scraping
  if (sources.includes('trademe')) {
    try {
      const searchUrl = buildTradeeMeSearchUrl(filters);
      console.log(`Scraping search results from: ${searchUrl}`);
      
      const searchResults = await scraperClient.scrapeSearchResults(searchUrl);
      
      if (searchResults?.data?.properties) {
        console.log(`Found ${searchResults.data.properties.length} properties to process`);
        
        // Process ALL properties, not just first 50
        for (const property of searchResults.data.properties) {
          const result = await processAndSaveBasicProperty(property, 'Trade Me');
          if (result.success) {
            totalScraped++;
          } else {
            totalSkipped++;
            if (result.error) errors.push(result.error);
          }
          
          // Small delay to avoid overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } else {
        console.log('No properties found in search results');
      }
    } catch (error) {
      console.error('TradeMe scraping error:', error);
      errors.push(`TradeMe scraping failed: ${error.message}`);
    }
  }

  return new Response(JSON.stringify({
    success: true,
    processed: totalScraped,
    skipped: totalSkipped,
    errors,
    message: `Search complete: ${totalScraped} properties found and saved to feed`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleEnrichment(request: ProcessingRequest): Promise<Response> {
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

async function handleRefresh(request: ProcessingRequest): Promise<Response> {
  // Refresh existing properties with missing data
  const result = await enrichPropertiesNeedingData();
  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function processAndSaveBasicProperty(property: any, sourceSite: string) {
  try {
    const addressParts = parseAddress(property.address);
    const fullUrl = property.url.startsWith('http') 
      ? property.url 
      : `https://www.trademe.co.nz/a/${property.url}`;

    // Check if property already exists
    const { data: existing } = await supabase
      .from('unified_properties')
      .select('id')
      .eq('source_url', fullUrl)
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'Property already exists' };
    }

    // Insert new property with BASIC information only
    const { data: newProperty, error } = await supabase
      .from('unified_properties')
      .insert({
        source_url: fullUrl,
        source_site: sourceSite,
        address: property.address,
        suburb: addressParts.suburb,
        city: addressParts.city || 'Wellington',
        district: addressParts.district,
        current_price: parsePrice(property.price),
        bedrooms: getPropertyFeatureValue(property.property_features, 'bedroom') ? parseInt(getPropertyFeatureValue(property.property_features, 'bedroom')) : null,
        bathrooms: getPropertyFeatureValue(property.property_features, 'bathroom') ? parseInt(getPropertyFeatureValue(property.property_features, 'bathroom')) : null,
        photos: property.main_img ? [property.main_img] : null,
        date_scraped: new Date().toISOString(),
        tags: ['prospecting'], // Only prospecting tag, no enrichment yet
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving property:', error);
      return { success: false, error: error.message };
    }

    console.log(`Saved basic property data: ${property.address}`);
    return { success: true, propertyId: newProperty.id };
  } catch (error) {
    console.error('Error processing property:', error);
    return { success: false, error: error.message };
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

// Helper functions
function buildTradeeMeSearchUrl(filters: any): string {
  const baseUrl = 'https://www.trademe.co.nz/a/property/residential/sale/wellington';
  const params = new URLSearchParams();
  
  if (filters.minPrice) params.append('price_min', filters.minPrice.toString());
  if (filters.maxPrice) params.append('price_max', filters.maxPrice.toString());
  if (filters.minBeds) params.append('bedrooms_min', filters.minBeds.toString());
  if (filters.suburb) params.append('suburb', filters.suburb);
  
  return `${baseUrl}?${params.toString()}`;
}

function parseAddress(address: string): { suburb: string | null; city: string | null; district: string | null } {
  const parts = address.split(',').map(part => part.trim());
  
  let suburb = null;
  let city = null;
  let district = null;

  if (parts.length >= 2) {
    suburb = parts[1];
  }
  if (parts.length >= 3) {
    district = parts[2];
  }
  
  if (address.toLowerCase().includes('wellington')) {
    city = 'Wellington';
  } else if (address.toLowerCase().includes('kapiti')) {
    city = 'Wellington';
    district = 'Kapiti Coast';
  } else {
    city = 'Auckland';
  }

  return { suburb, city, district };
}

function parsePrice(priceString: string): number {
  const matches = priceString.match(/\$?([\d,]+)/);
  if (matches) {
    return parseInt(matches[1].replace(/,/g, ''), 10);
  }
  return 0;
}

function getPropertyFeatureValue(features: Array<{ label: string; value: string }>, label: string): string | null {
  if (!features) return null;
  const feature = features.find(f => f.label.toLowerCase().includes(label.toLowerCase()));
  return feature ? feature.value : null;
}

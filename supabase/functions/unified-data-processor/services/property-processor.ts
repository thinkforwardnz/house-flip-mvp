
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { parseAddress, parsePrice, getPropertyFeatureValue } from '../utils/helpers.ts';
import { PropertyProcessingResult } from '../types/processor-types.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function processAndSaveBasicProperty(property: any, sourceSite: string): Promise<PropertyProcessingResult> {
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

export async function analyzePropertyInBackground(property: any) {
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

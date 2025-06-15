
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { parseAddress, parsePrice, getPropertyFeatureValue, parseLocationFromTradeMeUrl } from '../utils/helpers.ts';
import { PropertyProcessingResult } from '../types/processor-types.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function processAndSaveBasicProperty(
  property: any, 
  sourceSite: string, 
  searchKeywords: string[] = []
): Promise<PropertyProcessingResult> {
  try {
    const fullUrl = property.url.startsWith('http') 
      ? property.url 
      : `https://www.trademe.co.nz/a/${property.url}`;

    // Parse location from TradeMe URL first (most accurate)
    let locationInfo = { suburb: null, city: null, district: null };
    if (sourceSite === 'Trade Me' && fullUrl.includes('trademe.co.nz')) {
      locationInfo = parseLocationFromTradeMeUrl(fullUrl);
      console.log(`Parsed location from URL ${fullUrl}:`, locationInfo);
    }

    // Fallback to parsing from address if URL parsing fails
    if (!locationInfo.suburb && !locationInfo.city) {
      const addressParts = parseAddress(property.address);
      locationInfo = {
        suburb: addressParts.suburb,
        city: addressParts.city || 'Wellington',
        district: addressParts.district
      };
      console.log(`Fallback to address parsing for ${property.address}:`, locationInfo);
    }

    // Check if property already exists
    const { data: existing } = await supabase
      .from('unified_properties')
      .select('id')
      .eq('source_url', fullUrl)
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'Property already exists' };
    }

    // Build tags array - start with prospecting, add search keywords
    const tags = ['prospecting'];
    
    // Add search keywords as tags if they exist
    if (searchKeywords && searchKeywords.length > 0) {
      // Clean and normalize keywords, avoid duplicates
      const cleanKeywords = searchKeywords
        .map(keyword => keyword.toLowerCase().trim())
        .filter(keyword => keyword.length > 0 && !tags.includes(keyword));
      
      tags.push(...cleanKeywords);
      console.log(`Adding keyword tags: [${cleanKeywords.join(', ')}] to property: ${property.address}`);
    }

    // Insert new property with BASIC information only
    const { data: newProperty, error } = await supabase
      .from('unified_properties')
      .insert({
        source_url: fullUrl,
        source_site: sourceSite,
        address: property.address,
        suburb: locationInfo.suburb,
        city: locationInfo.city,
        district: locationInfo.district,
        current_price: parsePrice(property.price),
        bedrooms: getPropertyFeatureValue(property.property_features, 'bedroom') ? parseInt(getPropertyFeatureValue(property.property_features, 'bedroom')) : null,
        bathrooms: getPropertyFeatureValue(property.property_features, 'bathroom') ? parseInt(getPropertyFeatureValue(property.property_features, 'bathroom')) : null,
        photos: property.main_img ? [property.main_img] : null,
        date_scraped: new Date().toISOString(),
        tags: tags, // Use the tags array with keywords
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving property:', error);
      return { success: false, error: error.message };
    }

    console.log(`Saved property: ${property.address} with location: ${locationInfo.suburb}, ${locationInfo.city} and tags: [${tags.join(', ')}]`);
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

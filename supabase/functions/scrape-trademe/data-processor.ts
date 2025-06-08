
import { parseLocationFromAddress, extractDistrictFromSuburb } from '../shared/location-parser.ts';

export interface ProcessedListing {
  source_url: string;
  source_site: string;
  address: string;
  suburb: string | null;
  city: string | null;
  district: string | null;
  price: number;
  summary: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor_area: number | null;
  land_area: number | null;
  photos: string[] | null;
  listing_date: string | null;
  ai_analysis?: any;
  // Enhanced listing details
  listing_title?: string | null;
  listing_method?: string | null;
  listing_type?: string | null;
  parking_spaces?: number | null;
  other_features?: string | null;
}

export function processTrademeListing(rawData: any): ProcessedListing | null {
  try {
    console.log('Processing Trade Me listing with enhanced data:', {
      address: rawData.address,
      hasDescription: !!rawData.description,
      hasPhotos: Array.isArray(rawData.photos) ? rawData.photos.length : 0,
      hasAiAnalysis: !!rawData.ai_analysis,
      hasEnhancedDetails: !!(rawData.title || rawData.method || rawData.type)
    });

    if (!rawData || !rawData.address) {
      console.log('Invalid listing data - missing address');
      return null;
    }

    // Use enhanced address data if available from AgentQL
    const address = rawData.full_address || rawData.address;
    
    // Parse location information, preferring AgentQL data
    let locationInfo;
    if (rawData.suburb && rawData.city) {
      // Use AgentQL extracted location data
      locationInfo = {
        suburb: rawData.suburb,
        city: rawData.city,
        district: rawData.district
      };
    } else {
      // Fall back to parsing from address
      locationInfo = parseLocationFromAddress(address, rawData.city);
    }

    // If we still don't have district, try to extract from suburb
    let district = locationInfo.district;
    if (!district && locationInfo.suburb) {
      district = extractDistrictFromSuburb(locationInfo.suburb);
    }

    // Process price - handle various formats
    let price = 0;
    if (rawData.price) {
      price = parseFloat(rawData.price.toString().replace(/[^\d.]/g, '')) || 0;
    } else if (rawData.listingprice) {
      price = parseFloat(rawData.listingprice.toString().replace(/[^\d.]/g, '')) || 0;
    }

    // Process photos - ensure we have a valid array
    let photos: string[] | null = null;
    if (Array.isArray(rawData.photos) && rawData.photos.length > 0) {
      photos = rawData.photos.filter(photo => typeof photo === 'string' && photo.trim().length > 0);
    } else if (rawData.listingfeaturedimg) {
      photos = [rawData.listingfeaturedimg];
    }

    // Process description/summary
    let summary = null;
    if (rawData.description) {
      summary = cleanTextValue(rawData.description);
    } else if (rawData.summary) {
      summary = cleanTextValue(rawData.summary);
    }

    // Process enhanced features
    if (rawData.other_features) {
      const featuresText = Array.isArray(rawData.other_features) 
        ? rawData.other_features.join(', ') 
        : rawData.other_features;
      if (summary) {
        summary += `\n\nFeatures: ${featuresText}`;
      } else {
        summary = `Features: ${featuresText}`;
      }
    }

    // Process property features if available (legacy support)
    if (Array.isArray(rawData.property_features) && rawData.property_features.length > 0) {
      const featuresText = rawData.property_features.join(', ');
      if (summary) {
        summary += `\n\nAdditional Features: ${featuresText}`;
      } else {
        summary = `Features: ${featuresText}`;
      }
    }

    // Parse parking information
    const parkingSpaces = rawData.parking ? parseNumericValue(rawData.parking) : null;

    const processed: ProcessedListing = {
      source_url: rawData.url || rawData.listingurl || rawData.source_url || '',
      source_site: 'Trade Me',
      address: address,
      suburb: locationInfo.suburb || rawData.suburb || null,
      city: locationInfo.city || rawData.city || 'Auckland',
      district: district,
      price: price,
      summary: summary,
      bedrooms: parseNumericValue(rawData.bedrooms || rawData.listingbeds),
      bathrooms: parseNumericValue(rawData.bathrooms || rawData.listingbaths),
      floor_area: parseNumericValue(rawData.floor_area),
      land_area: parseNumericValue(rawData.land_area),
      photos: photos,
      listing_date: rawData.date || rawData.listing_date || null,
      ai_analysis: rawData.ai_analysis || null,
      // Enhanced listing details
      listing_title: cleanTextValue(rawData.title),
      listing_method: cleanTextValue(rawData.method),
      listing_type: cleanTextValue(rawData.type),
      parking_spaces: parkingSpaces,
      other_features: cleanTextValue(rawData.other_features),
    };

    console.log('Successfully processed Trade Me listing:', {
      address: processed.address,
      price: processed.price,
      bedrooms: processed.bedrooms,
      bathrooms: processed.bathrooms,
      photos_count: processed.photos?.length || 0,
      has_summary: !!processed.summary,
      has_ai_analysis: !!processed.ai_analysis,
      has_enhanced_details: !!(processed.listing_title || processed.listing_method),
      district: processed.district
    });

    return processed;
  } catch (error) {
    console.error('Error processing Trade Me listing:', error);
    return null;
  }
}

// Helper function to clean and parse numeric values
function parseNumericValue(value: any): number | null {
  if (!value) return null;
  const cleaned = value.toString().replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

// Helper function to clean text values
function cleanTextValue(value: any): string | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    return value.join(', ').trim() || null;
  }
  const cleaned = value.toString().trim();
  return cleaned.length > 0 ? cleaned : null;
}

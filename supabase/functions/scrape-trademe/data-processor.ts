
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
}

export function processTrademeListing(rawData: any): ProcessedListing | null {
  try {
    console.log('Processing Trade Me listing:', rawData);

    if (!rawData || !rawData.address) {
      console.log('Invalid listing data - missing address');
      return null;
    }

    // Parse location information from address
    const locationInfo = parseLocationFromAddress(rawData.address, rawData.city);

    // If we still don't have district, try to extract from suburb
    let district = locationInfo.district;
    if (!district && locationInfo.suburb) {
      district = extractDistrictFromSuburb(locationInfo.suburb);
    }

    const processed: ProcessedListing = {
      source_url: rawData.url || rawData.source_url || '',
      source_site: 'Trade Me',
      address: rawData.address,
      suburb: locationInfo.suburb || rawData.suburb || null,
      city: locationInfo.city || rawData.city || 'Auckland',
      district: district,
      price: parseFloat(rawData.price?.toString().replace(/[^\d.]/g, '') || '0') || 0,
      summary: rawData.description || rawData.summary || null,
      bedrooms: parseInt(rawData.bedrooms?.toString() || '0') || null,
      bathrooms: parseFloat(rawData.bathrooms?.toString() || '0') || null,
      floor_area: parseFloat(rawData.floor_area?.toString() || '0') || null,
      land_area: parseFloat(rawData.land_area?.toString() || '0') || null,
      photos: Array.isArray(rawData.photos) ? rawData.photos : null,
      listing_date: rawData.listing_date || null,
    };

    console.log('Processed Trade Me listing:', processed);
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
  const cleaned = value.toString().trim();
  return cleaned.length > 0 ? cleaned : null;
}

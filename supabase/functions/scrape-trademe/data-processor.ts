
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
    console.log('Processing Trade Me listing with basic search data:', {
      address: rawData.listingaddress,
      hasUrl: !!rawData.listingurl,
      hasFeaturedImage: !!rawData.listingfeaturedimg,
      hasId: !!rawData.listingid
    });

    if (!rawData || !rawData.listingaddress) {
      console.log('Invalid listing data - missing address');
      return null;
    }

    // Use the address from search results
    const address = rawData.listingaddress;
    
    // Parse location information from address
    const locationInfo = parseLocationFromAddress(address);

    // Extract district from suburb if available
    let district = locationInfo.district;
    if (!district && locationInfo.suburb) {
      district = extractDistrictFromSuburb(locationInfo.suburb);
    }

    // Process photos - only featured image is available from search results
    let photos: string[] | null = null;
    if (rawData.listingfeaturedimg) {
      photos = [rawData.listingfeaturedimg];
    }

    // Create basic listing with only search result data - no detailed fields
    const processed: ProcessedListing = {
      source_url: rawData.listingurl || '',
      source_site: 'Trade Me',
      address: address,
      suburb: locationInfo.suburb || null,
      city: locationInfo.city || 'Auckland',
      district: district,
      price: 0, // Price not reliably available in search results
      summary: null, // Summary not available in search results  
      bedrooms: null, // Detailed data not available in search results
      bathrooms: null,
      floor_area: null,
      land_area: null,
      photos: photos,
      listing_date: null, // Date not available in search results
    };

    console.log('Successfully processed Trade Me listing with basic data:', {
      address: processed.address,
      suburb: processed.suburb,
      city: processed.city,
      district: processed.district,
      photos_count: processed.photos?.length || 0
    });

    return processed;
  } catch (error) {
    console.error('Error processing Trade Me listing:', error);
    return null;
  }
}

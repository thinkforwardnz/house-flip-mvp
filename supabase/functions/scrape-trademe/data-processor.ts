
import { AgentQLResponse, AgentQLPropertyResult, PropertyData } from './types.ts';
import { extractSuburb } from './url-builder.ts';

export function processAgentQLResults(response: AgentQLResponse, sourceUrl: string): PropertyData[] {
  const properties: PropertyData[] = [];
  
  // Try to process main property_listings first
  if (response.property_listings && Array.isArray(response.property_listings)) {
    console.log(`Processing ${response.property_listings.length} property listings`);
    
    for (const listing of response.property_listings) {
      try {
        const property = processPropertyListing(listing, sourceUrl);
        if (property) {
          properties.push(property);
        }
      } catch (error) {
        console.error('Error processing property listing:', error, listing);
      }
    }
  }
  
  // Fallback to search_results if no property_listings found
  if (properties.length === 0 && response.search_results && Array.isArray(response.search_results)) {
    console.log(`Falling back to ${response.search_results.length} search results`);
    
    for (const result of response.search_results) {
      try {
        const property = processSearchResult(result, sourceUrl);
        if (property) {
          properties.push(property);
        }
      } catch (error) {
        console.error('Error processing search result:', error, result);
      }
    }
  }
  
  console.log(`Successfully processed ${properties.length} valid properties`);
  return properties;
}

function processPropertyListing(listing: AgentQLPropertyResult, sourceUrl: string): PropertyData | null {
  // Validate required fields
  if (!listing.title && !listing.address) {
    console.warn('Skipping listing: missing title and address');
    return null;
  }
  
  const address = listing.address || listing.title || '';
  const priceStr = listing.price || '0';
  const price = parsePrice(priceStr);
  
  if (price === 0) {
    console.warn('Skipping listing: invalid price', priceStr);
    return null;
  }
  
  return {
    source_url: listing.listing_url || sourceUrl,
    address: address,
    suburb: extractSuburb(address),
    city: 'Wellington',
    price: price,
    bedrooms: parseInteger(listing.bedrooms),
    bathrooms: parseFloat(listing.bathrooms || '') || null,
    floor_area: parseFloat(listing.floor_area || '') || null,
    land_area: parseFloat(listing.land_area || '') || null,
    summary: listing.description || '',
    photos: Array.isArray(listing.photos) ? listing.photos : [],
    listing_date: listing.listing_date || new Date().toISOString().split('T')[0]
  };
}

function processSearchResult(result: any, sourceUrl: string): PropertyData | null {
  const title = result.property_title || '';
  const address = result.property_address || title;
  const priceStr = result.property_price || '0';
  const price = parsePrice(priceStr);
  
  if (!address || price === 0) {
    console.warn('Skipping search result: missing address or invalid price');
    return null;
  }
  
  return {
    source_url: result.property_link || sourceUrl,
    address: address,
    suburb: extractSuburb(address),
    city: 'Wellington',
    price: price,
    bedrooms: null,
    bathrooms: null,
    floor_area: null,
    land_area: null,
    summary: title,
    photos: result.property_image ? [result.property_image] : [],
    listing_date: new Date().toISOString().split('T')[0]
  };
}

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  
  // Remove common price prefixes and suffixes
  const cleaned = priceStr
    .replace(/\$|,|\s+/g, '')
    .replace(/NZD|nzd/gi, '')
    .replace(/[^0-9]/g, '');
  
  const parsed = parseInt(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function parseInteger(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = parseInt(value.replace(/[^0-9]/g, ''));
  return isNaN(parsed) ? null : parsed;
}

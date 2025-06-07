import { PropertyData } from './types.ts';
import { extractSuburb } from './url-builder.ts';

/**
 * Stage 1: Process search results to extract basic listing metadata from AgentQL response
 * Extracts: Listing ID, Listing URL, Address only
 */
export function processSearchResults(response: any): Array<{id: string, url: string, address: string}> {
  const listings: Array<{id: string, url: string, address: string}> = [];
  
  console.log('Stage 1: Processing AgentQL search results:', JSON.stringify(response, null, 2));
  
  // Handle AgentQL /query-data response structure
  const agentqlListings = response.data?.listings || response.listings || [];
  
  if (Array.isArray(agentqlListings)) {
    for (const listing of agentqlListings) {
      try {
        let url = listing.listing_url || listing.url || listing.href;
        const address = listing.address || '';
        let listingId = listing.listing_id || '';
        
        if (url && address) {
          // Ensure URL is absolute
          if (url.startsWith('/')) {
            url = `https://www.trademe.co.nz${url}`;
          }
          
          // Extract listing ID from URL if not found in data
          if (!listingId) {
            listingId = extractListingId(url) || '';
          }
          
          // Validate TradeMe URL and required fields
          if (url.includes('trademe.co.nz') && listingId && address) {
            const listingData = {
              id: listingId,
              url: url,
              address: address.trim()
            };
            
            // Check for duplicates
            const isDuplicate = listings.some(existing => 
              existing.url === listingData.url || existing.id === listingData.id
            );
            
            if (!isDuplicate) {
              listings.push(listingData);
              console.log(`Stage 1: Found listing - ID: ${listingId}, Address: ${address}`);
            }
          }
        }
      } catch (error) {
        console.error('Error processing search result:', error, listing);
      }
    }
  } else {
    console.warn('No listings array found in AgentQL response');
  }
  
  console.log(`Stage 1 complete: Extracted ${listings.length} listings with basic metadata`);
  return listings;
}

/**
 * Process individual property details page from AgentQL response using TradeMe DOM structure
 */
export function processPropertyDetails(response: any, listingUrl: string, searchUrl: string): PropertyData | null {
  console.log('Processing AgentQL property details for:', listingUrl);
  console.log('Property details response:', JSON.stringify(response, null, 2));
  
  try {
    // AgentQL /query-data returns data directly in response.data
    const details = response.data || response;
    
    if (!details || (!details.title && !details.address && !details.price)) {
      console.warn('No valid property data found in AgentQL response');
      return null;
    }
    
    const title = details.title || '';
    const address = details.address || title;
    const priceStr = details.price || '0';
    const price = parsePrice(priceStr);
    
    if (!address) {
      console.warn('Missing required field: address');
      return null;
    }
    
    // Extract photos from AgentQL response
    const photos: string[] = [];
    if (Array.isArray(details.photos)) {
      for (const photo of details.photos) {
        if (photo.image_src) {
          let photoUrl = photo.image_src;
          // Ensure photo URL is absolute
          if (photoUrl.startsWith('/')) {
            photoUrl = `https://www.trademe.co.nz${photoUrl}`;
          }
          photos.push(photoUrl);
        }
      }
    }
    
    // Build features array from AgentQL response
    const features = Array.isArray(details.features) ? details.features : [];
    
    const property: PropertyData = {
      source_url: listingUrl,
      address: address,
      suburb: extractSuburb(address),
      city: 'Wellington',
      price: price,
      bedrooms: parseInteger(details.bedrooms),
      bathrooms: parseFloat(details.bathrooms || '') || null,
      floor_area: parseFloat(details.floorArea || details.floor_area || '') || null,
      land_area: parseFloat(details.landSize || details.land_area || '') || null,
      summary: details.description || title || '',
      photos: photos,
      listing_date: details.listingDate || details.listing_date || new Date().toISOString().split('T')[0]
    };
    
    console.log('Successfully processed property from AgentQL:', property.address);
    return property;
    
  } catch (error) {
    console.error('Error processing AgentQL property details:', error);
    return null;
  }
}

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  
  // Remove common price prefixes, suffixes, and formatting
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

function extractListingId(url: string): string | null {
  const match = url.match(/listing\/(\d+)/);
  return match ? match[1] : null;
}
